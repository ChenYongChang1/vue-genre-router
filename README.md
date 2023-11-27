# vue-genre-router

## 目的

生成 routes 文件 动态路由是 `:id` 这种

## 配置文件

> dd.config.js

```javascript
/**
 * @param path 默认layout的目录 默认为 ./src/layout
 * @param defaultLayout 默认未指定layout页面使用的layout 取得是目录下面的文件名称
 * @param pageLayout 可以是正则或者方法 正则会拿match的第一项 方法返回的是字符串
 */
interface ILayoutOpt {
  path?: string;
  defaultLayout?: string;
  pageLayout?: RegExp | ((content: string) => string);
}
module.exports = {
  path: "./src/views", // 默认路由页面代码
  defaultRoutes: "./src/router/routes.ts", // 生成到哪个文件
  exportSuffix: "export default __routes", // 导出方式 文件里有个变量叫 __routes
  layout: ILayoutOpt,
  alias: "@", // 生成路由 由哪个alias
  isLazy: true, // 是否懒加载
  action: { afterGenre: (route: IVueRouter) => IVueRouter }, // 每次生成后的 执行这个方法 可以修改具体的routes
};
```

## 使用

> 配置完成后在 package.json 里面可以通过 `dd-router` 生成

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development dd-router"
  }
}
```

## 指定路由页面的 layout

```javascript
<script lang="ts" layout="default">
  const _defineMeta = { title: "ddd" }
  去指定路由meta信息
```

## 结果

```javascript
const r_rwek8funts = () => import("@/views/index.vue");
const __routes = [
  {
    path: "/",
    name: "_src_views_indexvue_layout",
    meta: { title: "ddd" },
    children: [
      {
        path: "",
        name: "_src_views_indexvue",
        meta: { title: "ddd" },
        component: r_rwek8funts,
      },
    ],
  },
];
export default __routes;
```
