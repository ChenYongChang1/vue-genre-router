#!/usr/bin/env node

const fs = require("fs");

const isFileEsit = (filePath) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // 文件存在时err = false；文件不存在时err = true
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
const findConfig = async (path = __dirname) => {
  const CONFIG_NAME = "dd.config.js";

  const pathArr = path.split("/");
  let configPah = "";
  while (pathArr.pop()) {
    const fullPath = pathArr.join("/") + "/" + CONFIG_NAME;
    const isFind = await isFileEsit(fullPath);
    if (isFind) {
      configPah = fullPath;
    }
  }
  return configPah;
};

const doGenre = (config) => {
  const configInfo = config ? require(config) : {};

  const { GenreRoutes } = require("../bundle.cjs");

  const genre = new GenreRoutes(configInfo);

  genre.start();
};

(async () => {
  const configPath = await findConfig();
  doGenre(configPath);
})();
