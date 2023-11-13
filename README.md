# vue-genre-router

## 配置文件

> dd.config.js
> commonjs

```javascript
module.exports = {
  path: "./src/views", // 默认路由页面代码
  defaultRoutes: "./src/router/routes.ts", // 生成到哪个文件
  exportSuffix: "export default __routes", // 导出方式 文件里有个变量叫 __routes
  defaultLayout: "", // 默认布局的名称 layout的目录是./src/layout
  alias: "@", // 生成路由 由哪个alias
  isLazy: process.env.NODE_ENV !== "development", // 是否懒加载
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
