const babel = require("@rollup/plugin-babel");
import fs from "fs-extra";
const typescript = require("@rollup/plugin-typescript"); // 让 rollup 认识 ts 的代码
const pkg = require("./package.json");

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
  ],
};
