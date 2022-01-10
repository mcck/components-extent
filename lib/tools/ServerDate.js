import './XhrEvent.js';

/**
 * 用于同步时间
 * 客户的时间和现实中时间不同，统一取服务器时间，每个请求返回时获取同步一次
 */
let serverTime = Date.now();
// let startTime = {};

// 重写Date对象
let SystemDate = window.Date;

function ServerDate(...args) {
  if (args && args.length > 0) {
    return new SystemDate(SystemDate.apply(args));
  } else if (serverTime) {
    return new SystemDate(serverTime);
  } else {
    return new SystemDate();
  }
}
ServerDate.now = function () {
  return serverTime;
};
ServerDate.parse = SystemDate.parse;
ServerDate.UTC = SystemDate.UTC;
// window.Date = NewDate;
window.ServerDate = ServerDate;
/**
 * 请求开始时记录当前时间，用于计算延迟
 */
// window.addEventListener('xhrLoadStart', function (e) {
// });

/**
 * 监听请求返回后
 */
window.addEventListener('xhrLoadEnd', function (e) {
  let res = e.detail;
  let serverDate = res.getResponseHeader('date');
  let date = new Date(serverDate);
  serverTime = date.getTime();
});
// 保持1秒更新一次时间
setInterval(function () {
  serverTime += 1000;
}, 1000);
/* ServerDate end */