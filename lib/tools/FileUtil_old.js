// 文件管理
import md5 from 'js-md5';
// FileApi 必须拥有upload方法
import {context} from '../../index';

const FILE_MAX_SIZE = 1024 * 1024 * 10;

/**
   * 上传文件
   * @param object {Object}
   *  {
   *    coding: {Boolean} 是否编码
   *    data: {File | Input | Array}
   *  }
   *  // 服务器会提交时的顺序返回
   *  参数可以是
   *    ForamData对象
   *    file类型的input, name取input的name
   *    file类型的input数组
   *    File对象, name取值 file.fieldName -> object.name -> uuid()
   *    File数组或FileList
   *
   *  注意：FormData 的set和append区别
   *    set：覆盖更新formData中的值
   *    append：追加值，服务器会同一名称的组合成一个数组。
   *
   */
function upload(object, ops={}) {
  let uploadApi = ops.uploadFunction || context.uploadFunction;
  return new Promise((resolve, reject) => {
    if (!object) {
      resolve();
      return;
    }
    // 验证参数
    let obj = {};
    // 如果传的是这些类型，装为对象
    if (isType(object, Blob, 'File', HTMLInputElement, FileList, Array)) {
      obj.coding = false;
      obj.data = object;
    } else if (isType(object, FormData)) {
      obj.coding = eval(object.get('coding')) || false;
      obj.groupId = object.get('groupId');
      obj.data = object;
    } else {
      obj = object;
    }

    // 设置必要参数
    obj.coding = obj.coding || false;
    buildUploadData(obj, ops).then(params => {
      if (obj.count < 1) {
        resolve(obj.cacheFile);
        return;
      }
      // 开始上传
      uploadApi(params).then(urls => {
        // 最后合并数据
        // let result = { urls };
        // for (let o in obj.cacheFile) {
        //   let file = obj.files.find2({ hash: o });
        //   let name = file.fileName;
        //   if (typeof (urls[name]) == 'string') {
        //     let t = urls[name];
        //     let arr = urls[name] = [];
        //     arr.push(t);
        //     arr.push(obj.cacheFile[o]);
        //   } else if (urls[name] instanceof Array) {
        //     urls[name].push(obj.cacheFile[o]);
        //   } else {
        //     urls[name] = obj.cacheFile[o];
        //   }
        // }
        let result = {
          ...obj.cacheFile,
          ...urls
        };
        resolve(result);
      }).catch(reject);
    }).catch(reject);
  });
}

function buildUploadData(obj, ops) {
  return new Promise((resolve, reject) => {
    var params = obj.params = new FormData();
    if (obj.coding) {
      checkCoding(obj, ops).then(next).catch(reject);
    } else {
      next();
    }

    function next() {
      obj.count = 0;
      var params = obj.params;
      var data = obj.data;
      //比较数据,把已经编码的数据去除
      if (isType(data, FileList, Array)) {
        var name = window.guid(8);
        data.forEach(file => append(name, file));
      } else if (isType(data, HTMLInputElement)) {
        name = data.name || window.guid(8);
        data.files.forEach(file => append(name, file));
      } else if (isType(data, Blob, 'File')) {
        append(window.guid(8), data);
      } else if (isType(data, FormData)) {
        data.forEach((val, key) => append(key, val));
      } else {
        throw new Error('文件参数无效！');
      }
      if (obj.coding != undefined) {
        params.set('coding', obj.coding);
      }
      if (obj.groupId != undefined) {
        params.set('groupId', obj.groupId);
      }
      resolve(params);
    }
    function append(name, val) {
      val.fileName = name;
      var cacheFile = obj.cacheFile = obj.cacheFile || {};
      if (!(isType(val, Blob, File)) || !cacheFile[val.hash]) { // 非文件或文件已经在服务器有缓存的就不上传
        params.append(name, val);
        obj.count++;
      }
    }
  });
}

function checkCoding(obj, ops) {
  return new Promise((resolve, reject) => {
    doCoding(obj).then(() => {
      let hashs = [];
      obj.files.forEach(file => hashs.push(file.hash));
      // 发送请求
      let api = ops.fileHashFunction || context.fileHashFunction;
      api(hashs).then(res => {
        obj.cacheFile = res;
        resolve();
      }).catch(reject);
    });
  });
}

/**
 * 为文件编码
 */
function fileCoding(file) {
  return new Promise((resolve) => {
    let r = new FileReader();
    r.onload = function () {
      let hash = md5(r.result);
      file.hash = hash;
      resolve(hash, r);
    };
    r.readAsArrayBuffer(file);
  });
}
/**
 * 检查和获取编码
 */
function doCoding(obj) {
  return new Promise((resolve) => {
    let files = getFileList(obj.data);
    obj.files = files;
    let i = 0;
    // 编码
    files.forEach((file) => {
      fileCoding(file).then(() => {
        if (++i == files.length) {
          resolve(files);
        }
      });
    });
  });
}

function getFileList(data) {
  // 把参数整理成列表
  let files = [];
  if (isType(data, FileList, Array)) {
    data.forEach(push);
  } else if (isType(data, HTMLInputElement)) {
    data.files.forEach(push);
  } else if (isType(data, Blob, 'File')) {
    files.push(data);
  } else if (isType(data, FormData)) {
    data.forEach(push);
  }
  function push(file) {
    if (isType(file, Blob, 'File')) {
      files.push(file);
    }
  }

  return files;
}

function fileUrl(path){
  if (!path){
    return null;
  }
  try{
    let basePath = (context.fileUrlPrefix + '').format3();
    let url = new URL(basePath + '/' + path);
    return url.origin + url.pathname.replaceAll('//', '/');
  } catch(e){
    let url = location.origin + ('/files/' + path).replaceAll('//', '/');
    return url;
  }
}

function isType(val, ...types){
  let typestr = Object.prototype.toString.call(val);
  for (let i = 0; i < types.length; i++){
    if (typeof (types[i]) == 'string'){
      if (typestr == '[object ' + types[i] + ']'){
        return true;
      }
    } else {
      if (val instanceof types[i] || typestr == '[object ' + types[i].name + ']'){
        return true;
      }
    }
  }
  return false;
}

function file(res){
  return Object.values(res)[0];
}
function files(res){
  if (!res){
    return [];
  }
  return Object.values(res);
}


let input = document.createElement('input');
input.type = 'file';
/**
 * 选择文件，默认直接上传
 */
function selectFile(ops={}){
  input.accept = ops.accept;
  input.multiple = ops.multiple;
  let promise;
  if(ops.onchange instanceof Function){
    input.onchange = ops.onchange;
  } else {
    promise = new Promise((resolve, reject) => {
      input.onchange = function () {
        for (let i = 0; i < input.files.length; i++){
          let file = input.files[i];
          if (FILE_MAX_SIZE < file.size) {
            reject('文件最大只支持' + formatUnit(FILE_MAX_SIZE) + '，当前文件' + formatUnit(file.size));
            return;
          }
        }
        upload(input).then(resolve).catch(reject);
      };
    });
  }
  input.click();
  return promise;
}

/**
 * 格式单位
 */
let unit = ['b', 'k', 'm', 'g', 't'];
function formatUnit(size=0){
  let i = 0;
  while (size > 1024) {
    i++;
    size /= 1024;
  }
  if (String(size).includes('.')){
    size = size.toFixed(1);
  }
  return size + unit[i];
}


/**
 * 格式参数为Blob数组
 * @param {Array | HTMLInputElement | Blob | File} files
 * @returns 
 */
function buildBlobs(files){
  let blobs = [];
  if (isType(files, HTMLInputElement, Blob, File)){
    blobs = build(files);
  } else if (isType(files, Array)){
    let fs = [];
    files.forEach(item => {
      let arr = build(item);
      fs = fs.concat(arr);
    });
    blobs = fs;
  }

  function build(file){
    let files = [];
    if (isType(file, HTMLInputElement)) {
      files = file.files;
    } else if (isType(file, Blob, File)) {
      files = [file];
    }
    return files;
  }
  
  return blobs;
}

function imageCompress(files, quality  = 0.7){
  let blobs = buildBlobs(files);
  return new Promise(resolve => {
    // 遍历需要压缩的
    let promiseTask = [];
    blobs.forEach(blob => {
      if (blob.type.startsWith("image/")){
        promiseTask.push(_imageCompress(blob, quality ));
      }
    });
    Promise.all(promiseTask).then(resolve);
  });
}

let compress_context;
function getCompressContext(){
  if (!compress_context){
    compress_context = {
      quality : 0.7
    };
    compress_context._canvas = document.createElement('canvas');
    compress_context._ctx = compress_context._canvas.getContext('2d');

    window.compress_context = compress_context;
  }

  document.body.appendChild(compress_context._canvas)

  return compress_context;
}

function _imageCompress(blob, quality ){
  return new Promise(resolve => {
    console.log(blob);
    let context = getCompressContext();
    context._ctx.clearRect(0, 0, context._canvas.width, context._canvas.height); // 情空画布
    let img = new Image();
    document.body.appendChild(img)
    img.onload = function(){
      let rect = img.getBoundingClientRect();
      context._canvas.width = rect.width;
      context._canvas.height = rect.height;
      context._ctx.drawImage(img, 0, 0, rect.width, rect.height);

      // 输出压缩
      context._canvas.toBlob(function (b) {
        b.src = blob;
        resolve(b);
      }, blob.type || 'image/png' ,quality )
    }
    img.src = URL.createObjectURL(blob);
  });
}


export default { 
  selectFile, // 选择并上传文件
  upload, // 上传文件
  imageCompress, // 压缩图片
  fileUrl, // 转换文件路径为可访问路径
  isType, // 判断数据是否是某个类型
  file, // 解析返回值获取第一条记录
  files, // 解析返回值，以数组方式返回
  formatUnit, // 格式单位
};