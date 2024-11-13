/* eslint-disable no-undef */

const pack = require('./package.json');
const fs = require('fs');

function setParams(url){
  if (!url) return;

  if (!pack.publishConfig){
    pack.publishConfig = {};
  }
  pack.publishConfig.registry = url;

  // 写出到文件
  fs.writeFileSync('./package.json', JSON.stringify(pack, null, 2));
}

setParams(process.argv[2]);