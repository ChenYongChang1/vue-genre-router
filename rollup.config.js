const babel = require("@rollup/plugin-babel");
const fs = require("fs-extra");
const copy = require("rollup-plugin-copy");
const typescript = require("@rollup/plugin-typescript"); // 让 rollup 认识 ts 的代码
const pkg = require("./package.json");
const { terser } = require("rollup-plugin-terser");

module.exports = {
  input: "./src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "esm",
    },
    // {
    //   file: pkg.browser,
    //   format: "umd",
    // },
  ],
  watch: {
    // 配置监听处理
    exclude: "node_modules/**",
  },
  plugins: [
    terser(),
    typescript(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),
    {
      name: "afterBuild",
      async buildEnd() {
        // 清空 dist 目录
        try {
          await fs.emptyDir("lib");
          console.log("目标目录已清空");
        } catch (err) {
          console.error("清空目标目录时出错：", err);
        }
      },
    },
    copy({
      targets: [
        { src: "src/bin", dest: "lib" }, // 将 assets 目录下的文件复制到 dist/assets 目录
      ],
    }),
  ],
};
