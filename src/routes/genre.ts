import nodeFs from "fs";
import nodePath from "path";
type IFileType = "vue" | "directory" | string;
interface IFileRow {
  type: IFileType;
  path: string;
  nextPath: string;
  name: string;
  fullPath: string;
  layout?: string;
  children?: IFileRow[];
}
interface IVueRouter {
  name: string;
  path: string;
  component: string;
  children?: IVueRouter[];
  meta?: {
    title?: string;
  };
}

export class GenreRoutes {
  _layoutPath: string;
  _projectPath: string;
  _layoutMap: { [k: string]: string };
  _action: { afterGenre: (route: IVueRouter) => IVueRouter } | undefined;
  /**
   *
   * @param {*} _path 需要构建路由的目录 ./开头
   * @param {*} _defaultRoutes 路由表save的位置
   * @param {*} _exportSuffix 路由导出方式 `export default __routes`
   * @param {*} _defaultLayout 默认的layout的名称 名称就是写的名字{a}.vue 那么名字就是a
   * @param {*} _alias 默认的alias 默认是@
   * @param {*} _isLazy
   * @param _action {afterGenre}
   */
  constructor(
    public _path = "./src/views",
    public _defaultRoutes = "./src/router/routes.ts",
    public _exportSuffix = "export default __routes",
    public _defaultLayout = "",
    public _alias = "@",
    public _isLazy = true,
    _action = undefined
  ) {
    this._layoutPath = "./src/layout";
    this._projectPath = nodePath.resolve("./");
    this._layoutMap = {};
    this._action = _action;
  }
  async getlayoutMap() {
    const layoutFiles = await this.getDirectory(this._layoutPath);
    layoutFiles.forEach((item) => {
      const name = item.replace(".vue", "");
      this._layoutMap[name] = `__'${(this._layoutPath + "/" + item).replace(
        "./src",
        this._alias
      )}'__`;
    });
  }
  checkedPathType(path: string) {
    return new Promise((resolve) => {
      nodeFs.stat(path, (error, stat) => {
        const suffix = path.replace(/.*\.(.*?)/, "$1");
        const type = stat.isDirectory() ? "directory" : suffix;
        resolve(type);
      });
    });
  }
  getFullPath(path, base = this._projectPath) {
    return nodePath.resolve(base, path);
  }
  getPathContent(path: string) {
    const fullPath = this.getFullPath(path);
    return new Promise<string>((resolve) => {
      nodeFs.readFile(fullPath, "utf-8", (err, data) => {
        resolve(data);
      });
    });
  }
  async genreVueFromatRoute(
    type: IFileType,
    routerPath: string,
    fullPath: string,
    nextPath: string
  ): Promise<IFileRow> {
    const content = await this.getPathContent(nextPath);
    const matchName =
      content.match(/\<script(.|\n)*?setup(.|\n)*?layout="(.*?)"(.|\n)*?\>/) ||
      [];
    const layoutName = matchName[3] || this._defaultLayout;
    return {
      type,
      path: routerPath,
      nextPath,
      name: nextPath.replace(/\//g, "_").replace(/\./g, ""),
      fullPath,
      // fileContent: content,
      layout: layoutName,
    };
  }
  async genreItem(path: string, item: string, files: string[]) {
    const nextPath = path + (path ? "/" : "") + item;
    const routerPath = nextPath
      .replace(this._path, "")
      .replace(/index\.vue/g, "")
      .replace(/\.vue/g, "")
      .replace(/\_/g, ":");
    const fullPath = this.getFullPath(nextPath);
    const type = await this.checkedPathType(fullPath);
    if (type === "directory") {
      const fileIndex = files.findIndex((fitem) => fitem === item + ".vue");
      let rowInfo: IFileRow | "" =
        fileIndex > -1
          ? await this.genreVueFromatRoute(
              "directory",
              routerPath,
              fullPath + ".vue",
              nextPath + ".vue"
            )
          : "";
      const children = await this.formatDirectory(nextPath);

      if (rowInfo) {
        files.splice(fileIndex, 1);
        rowInfo.children = [
          {
            type: "directory",
            path: "",
            nextPath: nextPath + ".vue",
            name: nextPath.replace(/\//g, "_").replace(/\./g, "") + "vue",
            fullPath,
            children,
          },
        ];
        return rowInfo;
      }
      return {
        type,
        path: routerPath,
        nextPath,
        name: nextPath.replace(/\//g, "_").replace(/\./g, ""),
        fullPath,
        children,
      };
    } else if (type === "vue") {
      return await this.genreVueFromatRoute(
        "vue",
        routerPath,
        fullPath,
        nextPath
      );
    }
  }
  /**
   *
   * @param {*} path 目录 这个是基础的目录路径不是全全部的
   * @param {*} files 文件
   * @returns
   */
  async formatTypeList(path = "", files: string[] = []) {
    const allData: IFileRow[] = [];
    // const allData = files.map(async (item) => {
    let item: string | undefined;
    while ((item = files.shift())) {
      const data = await this.genreItem(path, item, files);
      data && allData.push(data);
    }

    // })
    return await Promise.all(allData);
  }
  getDirectory(path: string) {
    return new Promise<string[]>((resolve) => {
      const fullPath = this.getFullPath(path);
      nodeFs.readdir(fullPath, async (error, files) => {
        resolve(files);
      });
    });
  }
  async formatDirectory(path: string) {
    const files = await this.getDirectory(path);
    return await this.formatTypeList(path, files);

    // return await this.formatTypeList(path, files)
  }
  genreVueRoute = (row: IFileRow): IVueRouter => {
    const isHasLayout = !!row.layout;
    const children = isHasLayout
      ? [
          {
            path: "",
            name: row.name,
            // meta,
            component: `__'${row.nextPath.replace("./src", this._alias)}'__`,
          },
        ]
      : undefined;
    return {
      path: row.path,
      name: row.name + (children ? "_layout" : ""),
      //   meta,
      component: isHasLayout
        ? this._layoutMap[row.layout as string]
        : `__'${row.nextPath.replace("./src", this._alias)}'__`,
      children,
    };
  };
  genreDirectiveRoute = (row: IFileRow) => {
    return {
      path: row.path,
      name: row.name + "_layout",
      component: row.layout ? this._layoutMap[row.layout] : undefined,
      children: this.genreRoutes(row.children || []),
    };
  };
  genreRoutes(fullFiles: IFileRow[]) {
    const genreMap = {
      vue: this.genreVueRoute,
      directory: this.genreDirectiveRoute,
    };
    return fullFiles.map((item) => {
      const info = genreMap[item.type](item);
      return this._action?.afterGenre(info) || info;
    });
  }
  async start() {
    await this.getlayoutMap();
    const fullFiles = await this.formatDirectory(this._path);
    const routes = await this.genreRoutes(fullFiles);
    this.writeRoutes(routes);
  }
  writeRoutes = (routes: IVueRouter[]) => {
    const routeStr = JSON.stringify(routes);
    let suffixImport: {
      importArr: string[];
      randomStr: { [k: string]: string };
    } = {
      importArr: [],
      randomStr: {},
    };
    const str = routeStr.replace(/\"__(.*?)__\"/g, (...args) => {
      const random =
        suffixImport.randomStr[args[1]] ||
        "r_" + Math.random().toString(36).slice(2);
      const imp: string = this._isLazy
        ? `const ${random} = ()=> import(${args[1]})`
        : `import ${random} from ${args[1]}`; //  //
      if (!suffixImport.randomStr[args[1]]) {
        suffixImport.importArr.push(imp);
        suffixImport.randomStr[args[1]] = random;
      }
      return random;
    });
    const path = this.getFullPath(this._defaultRoutes);
    nodeFs.writeFileSync(
      path,
      suffixImport.importArr.join("\n") +
        "\nconst __routes = " +
        str +
        "\n" +
        this._exportSuffix,
      "utf-8"
    );
  };
}

// const genre = new GenreRoutes("./src/views", "./src/router/routes.ts");
// genre.start();
