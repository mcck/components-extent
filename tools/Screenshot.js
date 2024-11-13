'use strict';
import html2canvas from 'html2canvas';


/**
 * 使用方式：
 * import screenshot from 'Screenshot';
 * screenshot.init();
 * screenshot.tailor();
 */


// 截图插件
let Screenshot = function () {
  let screenshot = this.screenshot = document.createElement('div');
  let mask = this.mask = document.createElement('div');
  let selector = this.selector = document.createElement('div');
  this.btns = document.createElement('div');
  let confirm = this.confirm = document.createElement('i');
  let cancel = this.cancel = document.createElement('i');

  screenshot.setAttribute('remark', '截图覆盖物');
  screenshot.setAttribute('data-html2canvas-ignore', '');
  // screenshot.name = 'screenshot';

  // 底图
  this.baseCanvas = document.createElement('canvas');
  this.tailoredCanvas = document.createElement('canvas');

  this.btns.appendChild(this.cancel);
  this.btns.appendChild(this.confirm);

  screenshot.appendChild(this.baseCanvas);

  selector.appendChild(this.btns);
  mask.appendChild(selector);
  screenshot.appendChild(mask);

  this.moveing = false;
  this.SX = 0; // 开始X坐标
  this.SY = 0; // 开始Y坐标
  this.EX = 0; // 结束X坐标
  this.EY = 0; // 结束Y坐标

  let SCREEN_WIDTH = window.SCREEN_WIDTH;
  let SCREEN_HEIGHT = window.SCREEN_HEIGHT;

  let self = this;
  mask.onmousedown = function (event) {
    self.SX = event.clientX;
    self.SY = event.clientY;

    // 设置按下的坐标为起点
    mask.style.borderLeftWidth = event.clientX + 'px';
    mask.style.borderTopWidth = event.clientY + 'px';

    mask.style.borderRightWidth = (SCREEN_WIDTH - event.clientX) + 'px';
    mask.style.borderBottomWidth = (SCREEN_HEIGHT - event.clientY) + 'px';

    // 设置选择器坐标
    selector.style.left = event.clientX + 'px';
    selector.style.top = event.clientY + 'px';

    selector.style.right = (SCREEN_WIDTH - event.clientX) + 'px';
    selector.style.bottom = (SCREEN_HEIGHT - event.clientY) + 'px';

    self.moveing = true;
  };
  mask.onmousemove = function (event) {
    // 拖动时设置终点
    if (self.moveing) {
      self.EX = event.clientX;
      self.EY = event.clientY;

      if (self.SX > self.EX) { // 从右向左拖 ←
        mask.style.borderLeftWidth = event.clientX + 'px';
        selector.style.left = event.clientX + 'px';
      } else {
        mask.style.borderRightWidth = (SCREEN_WIDTH - event.clientX) + 'px';
        selector.style.right = (SCREEN_WIDTH - event.clientX) + 'px';
      }
      if (self.SY > self.EY) { // 从下向上 ↑
        mask.style.borderTopWidth = event.clientY + 'px';
        selector.style.top = event.clientY + 'px';
      } else {
        mask.style.borderBottomWidth = (SCREEN_HEIGHT - event.clientY) + 'px';
        selector.style.bottom = (SCREEN_HEIGHT - event.clientY) + 'px';
      }

      if (event.clientX === SCREEN_WIDTH - 1 || event.clientY === SCREEN_HEIGHT - 1) {
        self.moveing = false;
      }
    }
  };

  mask.onmouseup = function (/* event */) {
    // 结束
    self.moveing = false;
  };

  document.onkeydown = function (event) {
    if (self.screenshot.style.display !== 'none' && event.keyCode === 27) {
      self.cancelCapture();
    }
  };

  // 添加确认事件
  confirm.onmousedown = window.stopBubble;
  confirm.onmousemove = window.stopBubble;
  confirm.onmouseup = window.stopBubble;

  cancel.onmousedown = window.stopBubble;
  cancel.onmousemove = window.stopBubble;
  cancel.onmouseup = window.stopBubble;

  confirm.onclick = function (e) {
    window.stopBubble(e);
    // 调用开始截图方法
    self.confirmCapture();
  };
  cancel.onclick = function (e) {
    window.stopBubble(e);
    self.cancelCapture();
  };

  document.body.appendChild(screenshot);
  this.init();
};

Screenshot.prototype.init = function () {
  this.mask.removeAttribute('style');
  this.selector.removeAttribute('style');
  let maskStyle = this.mask.style;

  this.screenshot.style.display = 'none';

  maskStyle.position = 'fixed';
  maskStyle.top = 0;
  maskStyle.bottom = 0;
  maskStyle.left = 0;
  maskStyle.right = 0;
  maskStyle.zIndex = 3001;
  maskStyle.borderStyle = 'solid';
  maskStyle.borderColor = 'rgba(0,0,0, 0.3)';
  maskStyle.borderWidth = Math.max(window.SCREEN_WIDTH, window.SCREEN_HEIGHT) + 'px';
  maskStyle.cursor = 'crosshair';
  maskStyle.userSelect = 'none';

  // 初始化选择器样式
  this.selector.style.position = 'fixed';
  this.selector.style.border = '2px solid rgb(64, 158, 255)';

  // 初始化按钮
  this.btns.style.position = 'absolute';
  this.btns.style.bottom = '-20px';
  this.btns.style.right = 0;
  this.btns.style.textAlign = 'center';

  this.cancel.className = 'ht-icon-guanbi';
  this.cancel.style.cursor = 'pointer';
  this.cancel.style.color = 'red';

  this.confirm.className = 'ht-icon-shenchatongguo';
  this.confirm.style.marginLeft = '5px';
  this.confirm.style.cursor = 'pointer';
  this.confirm.style.color = 'rgb(54, 173, 69)';

  this.baseCanvas.width = window.SCREEN_WIDTH;
  this.baseCanvas.height = window.SCREEN_HEIGHT;
  this.baseCanvas.style.position = 'fixed';
  this.baseCanvas.style.top = 0;
  this.baseCanvas.style.zIndex = 3000;

  // 清空画布数据
  this.tailoredCanvas.getContext('2d').clearRect(0, 0, this.tailoredCanvas.width, this.tailoredCanvas.height);
  this.baseCanvas.getContext('2d').clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
};

/**
 * 开始截图
 * @param {Object | Function} option
 * quality{Number}: 图片清晰度,默认不压缩
 * resultBefore {Funtion}: 在截图之后，生成返回结果之前，可对图片进行修改，参数：canvas
 * cellback {Function}：截图成功回调，参数：blob
 */
Screenshot.prototype.tailor = function (option) {
  if (typeof (option) ==='function') {
    this.option = {
      cellback: option
    };
  } else {
    this.option = option;
  }
  this.init();
  this.screenshot.style.display = '';
  // 把body放到画板中
  let self = this;
  self.ready = false;
  html2canvas(document.body, {
    canvas: this.baseCanvas,
    logging: false
    //  ignoreElements: function(element){
    //    if(element.name === 'screenshot'){
    //      return true;
    //    }else {
    //      return false;
    //    }
    //  },
  }).then(function () {
    self.ready = true;
  });
};

/**
 * 取消截图
 */
Screenshot.prototype.cancelCapture = function () {
  this.screenshot.style.display = 'none';
};
/**
 * 点击确认截图
 */
Screenshot.prototype.confirmCapture = function () {
  let self = this;
  let point = this.getSelectedPoint();
  // 计算被截取的框高
  let w = point.EX - point.SX;
  let h = point.EY - point.SY;

  self.tailoredCanvas.width = w;
  self.tailoredCanvas.height = h;

  let b64 = this.baseCanvas.toDataURL('image/png');
  let img = new Image();
  img.src = b64;
  img.onload = function () {
    let ctx = self.tailoredCanvas.getContext('2d');
    ctx.drawImage(img, point.SX, point.SY, w, h, 0, 0, w, h);

    self.option.resultBefore && self.option.resultBefore(self.tailoredCanvas);
    // 关闭
    self.cancelCapture();
    // 回调
    if (self.option.cellback) {
      self.tailoredCanvas.toBlob(self.option.cellback, 'image/png', self.option.quality || 1);
    }
  };
};

/**
 * 获取选中区域的坐标
 */
Screenshot.prototype.getSelectedPoint = function () {
  let SX, SY, EX, EY;
  if (this.SX < this.EX) {
    SX = this.SX;
    EX = this.EX;
  } else {
    SX = this.EX;
    EX = this.SX;
  }

  if (this.SY < this.EY) {
    SY = this.SY;
    EY = this.EY;
  } else {
    SY = this.EY;
    EY = this.SY;
  }
  return {SX, SY, EX, EY};
};

export default new Screenshot();
