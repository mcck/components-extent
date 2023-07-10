'use strict';

;(function () {
  if (typeof window.XhrEvent === 'function') return false;
  function XhrEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  XhrEvent.prototype = window.Event.prototype;

  window.XhrEvent = XhrEvent;
})();
;(function () {
  function xhrEventTrigger (event) {
    // eslint-disable-next-line no-undef
    var xhrEvent = new XhrEvent(event, { detail: this });
    window.dispatchEvent(xhrEvent);
  }

  var oldXHR = window.XMLHttpRequest;

  function newXHR (args) {
    var realXHR = new oldXHR(args);
	
	let oldSend = realXHR.send;
	realXHR.send = function(data){
		this.requestBody = data;
		xhrEventTrigger.call(this, 'xhrSendStart');
		if(!this.cancel){
			oldSend.call(this, this.requestBody);
		}
	};

    // 请求开始
    realXHR.addEventListener('loadstart', function () { xhrEventTrigger.call(this, 'xhrLoadStart'); }, false);
    // 请求进行中
    realXHR.addEventListener('progress', function () { xhrEventTrigger.call(this, 'xhrProgress'); }, false);

    realXHR.addEventListener('abort', function () { xhrEventTrigger.call(this, 'xhrAbort'); }, false);
    // 请求错误
    realXHR.addEventListener('error', function () { xhrEventTrigger.call(this, 'xhrError'); }, false);
    // 请求中
    realXHR.addEventListener('load', function () { xhrEventTrigger.call(this, 'xhrLoad'); }, false);
    // 超时
    realXHR.addEventListener('timeout', function () { xhrEventTrigger.call(this, 'xhrTimeout'); }, false);
    // 请求完毕
    realXHR.addEventListener('loadend', function () { xhrEventTrigger.call(this, 'xhrLoadEnd'); }, false);
    // 请求状态改变
    realXHR.addEventListener('readystatechange', function () { xhrEventTrigger.call(this, 'xhrReadyStateChange'); }, false);

    return realXHR;
  }

  window.XMLHttpRequest = newXHR;
})();
