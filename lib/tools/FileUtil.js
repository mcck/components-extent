// 文件管理
import md5 from 'js-md5';
import {isType} from './extend';
// FileApi 必须拥有upload方法
import { context } from '../../index';



/**
 * 
 * @param {*} object 
 * @param {Object} ops {
 *   coding {Boolean} 是否开启编码秒传
 *   groupId {String} 文件组
 *   fileHashFunction {Funciton} 查询hash的方法
 *   uploadFunction {Funciton} 上传文件的方法
 *   data {Object} 附加body参数
 *   params {Object} 该参数会被传入 uploadFunction 方法
 *   resultType {String}
 *     array(default) url数组
 *     object 对象方式返回，key为hash，value为url
 *     all 返回全部，按传入的格式返回
 * 
 *   quality {Number} 压缩质量，默认不压缩，取值0-1之间
 *   fizeSize {Number | String} 允许上传的最大文件
 *   uploadBefore {Function} 上传之前方法，参数：FormData, blobs
 *   onProgress {Function} 上传进度回调
 *   headers: {Object} 上传请求头
 * }
 * @returns 
 */
function upload(object, ops){
  ops = {
    object,
    fileHashFunction: context.fileHashFunction, // 查询hash
    uploadFunction: context.uploadFunction, // 上传文件
    coding: false,
    ...ops
  };
  ops.groupId = ops.groupId || guid();

  return new Promise(async (resolve, reject) => {
    let blobs = buildBlobs(object);
    ops.blobs = blobs; // 用户选择的文件列表
    if (!(blobs?.length)){
      reject('没有需要上传的文件');
      return;
    }

    // 检查文件大小
    if (ops.fizeSize){
      assertFizeSize(blobs, ops.fizeSize);
    }

    // 压缩
    // if (ops.quality){
      // imageCompress()
    // }


    // 编码
    if (ops.coding){
      ops.exist = await handleFileHash(blobs, ops);

      // 整理出重复项
      handleRepeat(blobs);
    }

    // 开始上传
    ops.uploads = await _upload(blobs, ops);

    // 处理结果
    let result = handleResult(ops);
    resolve(result);
  });
}

/**
 * 处理上传结果
 * 合并结果
 */
function handleResult(ops){
  let result;
  if (ops.resultType == 'original'){
    // TODO 处理上传结果
  } else if (ops.resultType == 'object'){
    result = {
      ...ops.exist,
      ...ops.uploads
    }
  } else {
    // 合并上传的和hash的
    result = Object.values({
      ...ops.exist,
      ...ops.uploads
    });
  }

  return result;
}

function _upload(blobs, ops){

  // 构建删除参数
  let formData = new FormData();
  let count = 0;
  blobs.forEach(blob => {
    if (blob.serverUri || blob.repeat) { // 没有serverUri并且不重复的才上传
      return;
    }

    // 添加到form中
    formData.append(blob.fieldName, blob);
    count++;
  });

  if (count == 0){
    return Promise.resolve();
  }

  // 添加其他参数
  formData.set('coding', ops.coding);
  formData.set('groupId', ops.groupId);
  for(let o in ops.data){
    formData.set(o, ops.data[o]);
  }
  ops.uploadBefore && ops.uploadBefore(formData, blobs);

  return ops.uploadFunction(formData, ops.params, ops.headers, ops.onProgress);
}

/**
 * 查找重复项,并标记
 */
function handleRepeat(blobs){
  let result = blobs.filter((item, index) => {
    let isRepeat = blobs.indexOf2({ hash: item.hash}) == index; // 为false表示重复
    if (!isRepeat){ // 如果是重复的
      item.repeat = true; // 标记重复
    }
    return isRepeat
  });
  return result;
}



/**
 * 处理文件hash编码，并对比服务器是否已有
 */
function handleFileHash(blobs, ops){
  return new Promise((resolve, reject) => {
    filesCoding(blobs).then(codes => {
      // 查询服务器是否有hash
      ops.fileHashFunction(codes).then(res => {// 返回值是服务器已有的文件地址
        blobs.forEach(blob => blob.serverUri = res[blob.hash]); // 如果服务器有，就保存到对象中
        resolve(res);
      }).catch(reject);
    }).catch(reject);
  });
}
/**
 * 为一组文件编码
 */
function filesCoding(files){
  let tasks = [];
  files.forEach(blob => tasks.push(fileCoding(blob)));
  return Promise.all(tasks);
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
 * 格式参数为Blob数组
 * @param {Array | HTMLInputElement | Blob | File} files
 * @returns 
 */
function buildBlobs(files) {
  let blobs = [];
  if (isType(files, HTMLInputElement, Blob, File)) {
    blobs = build(files);
  } else if (isType(files, Array)) {
    let fs = [];
    files.forEach(item => {
      let arr = build(item);
      fs = fs.concat(arr);
    });
    blobs = fs;
  }

  function build(file) {
    let files = [];
    if (isType(file, HTMLInputElement)) {
      files = Object.values(file.files); // FileList -> Array
      files.forEach(f => f.fieldName = f.fieldName || file.name || 'tmp_'+ window.guid()); // 设置 文件的字段名
    } else if (isType(file, Blob, File)) {
      file.fieldName = file.fieldName || 'tmp_' +window.guid();
      files = [file];
    }
    return files;
  }
  return blobs;
}

function assertFizeSize(blobs, threshold){
  if (typeof (threshold) == 'string'){
    threshold = parseUnit(threshold);
  }

  blobs.forEach((blob, index) => {
    if (blob.size > threshold){
      let name = blob.name || blob.fieldName || '第'+ (index+1) +'个'
      throw new Error('文件【' + name + '】大小：' + formatUnit(blob.size) +'，超过设置的大小：' + threshold);
    }
  });
}


function imageCompress(files, quality) {
  let blobs = buildBlobs(files);
  return new Promise(resolve => {
    // 遍历需要压缩的
    let promiseTask = [];
    blobs.forEach(blob => {
      if (blob.type.startsWith("image/")) {
        promiseTask.push(_imageCompress(blob, quality));
      }
    });
    Promise.all(promiseTask).then(resolve);
  });
}

let compress_context;
function getCompressContext() {
  if (!compress_context) {
    compress_context = {
      quality: 0.7
    };
    compress_context._canvas = document.createElement('canvas');
    compress_context._ctx = compress_context._canvas.getContext('2d');

    window.compress_context = compress_context;
  }

  document.body.appendChild(compress_context._canvas)

  return compress_context;
}
function _imageCompress(blob, quality) {
  return new Promise(resolve => {
    let context = getCompressContext();
    context._ctx.clearRect(0, 0, context._canvas.width, context._canvas.height); // 情空画布
    let img = new Image();
    document.body.appendChild(img)
    img.onload = function () {
      let rect = img.getBoundingClientRect();
      context._canvas.width = rect.width;
      context._canvas.height = rect.height;
      context._ctx.drawImage(img, 0, 0, rect.width, rect.height);

      // 输出压缩
      context._canvas.toBlob(function (b) {
        b.src = blob;
        resolve(b);
      }, blob.type || 'image/png', quality)
    }
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * 选择文件，默认直接上传
 */
function selectFile(ops = {}) {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = ops.accept;
  input.multiple = ops.multiple;
  if (ops.onchange instanceof Function) {
    input.onchange = ops.onchange;
    input.click();
  } else {
    input.click();
    return new Promise((resolve, reject) => {
      input.onchange = function () {
        if (!input.value) {
          return;
        }
        let fileSize = parseUnit(ops.fizeSize);
        for (let i = 0; i < input.files.length; i++) {
          let file = input.files[i];
          if (fileSize && fileSize < file.size) {
            reject('文件最大只支持' + formatUnit(ops.fizeSize) + '，当前文件' + formatUnit(file.size));
            return;
          }
        }
        upload(input, ops).then(res=>{
          resolve({res, input});
        }).catch(reject);
      };
    });
  }
}

/**
 * 格式单位
 */
let unit = ['b', 'k', 'm', 'g', 't'];
function formatUnit(size = 0) {
  if (typeof size !== "number"){
    return size;
  }
  let i = 0;
  while (size > 1024) {
    i++;
    size /= 1024;
  }
  if (String(size).includes('.')) {
    size = size.toFixed(1);
  }
  return size + unit[i];
}
function parseUnit(size) {
  if (typeof (size) == 'number'){
    return size;
  }
  if(!size){
    return 0;
  }

  let arr = size.split('');
  let u = arr.pop().toLowerCase(); // 最后一位是单位
  let i = unit.indexOf(u);
  let n = parseFloat(arr.join(''));
  return n * (1024 ** i);
}

function fileUrl(path) {
  if (!path) {
    return null;
  }
  try {
    let basePath = (context.fileUrlPrefix || '').format3();
    let url = new URL(basePath + '/' + path);
    return url.origin + url.pathname.replaceAll('//', '/');
  } catch (e) {
    let url = location.origin + ('/files/' + path).replaceAll('//', '/');
    return url;
  }
}

export default {
  upload,
  selectFile,
  imageCompress,
  formatUnit,
  parseUnit,
  fileUrl
};