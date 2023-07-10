const ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAAUCAYAAABWOyJDAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAQPSURBVHic7Zs/iFxVFMa/0U2UaJGksUgnIVhYxVhpjDbZCBmLdAYECxsRFBTUamcXUiSNncgKQbSxsxH8gzAP3FU2jY0kKKJNiiiIghFlccnP4p3nPCdv3p9778vsLOcHB2bfveeb7955c3jvvNkBIMdxnD64a94GHMfZu3iBcRynN7zAOI7TG15gHCeeNUkr8zaxG2lbYDYsdgMbktBsP03jdQwljSXdtBhLOmtjowC9Mg9L+knSlcD8TNKpSA9lBpK2JF2VdDSR5n5J64m0qli399hNFMUlpshQii5jbXTbHGviB0nLNeNDSd9VO4A2UdB2fp+x0eCnaXxWXGA2X0au/3HgN9P4LFCjIANOJdrLr0zzZ+BEpNYDwKbpnQMeAw4m8HjQtM6Z9qa917zPQwFr3M5KgA6J5rTJCdFZJj9/lyvGhsDvwFNVuV2MhhjrK6b9bFiE+j1r87eBl4HDwCF7/U/k+ofAX5b/EXBv5JoLMuILzf3Ap6Z3EzgdqHMCuF7hcQf4HDgeoHnccncqdK/TvSDWffFXI/exICY/xZyqc6XLWF1UFZna4gJ7q8BsRvgd2/xXpo6P+D9dfT7PpECtA3cnWPM0GXGFZh/wgWltA+cDNC7X+AP4GzjZQe+k5dRxuYPeiuXU7e1qwLpDz7dFjXKRaSwuMLvAlG8zZlG+YmiK1HoFqT7wP2z+4Q45TfEGcMt01xLoNZEBTwRqD4BLpnMLeC1A41UmVxsXgXeBayV/Wx20rpTyrpnWRft7p6O/FdqzGrDukPNtkaMoMo3FBdBSQMOnYBCReyf05s126fU9ytfX98+mY54Kxnp7S9K3kj6U9KYdG0h6UdLbkh7poFXMfUnSOyVvL0h6VtIXHbS6nOP+s/Zm9mvyXW1uuC9ohZ72E9uDmXWLJOB1GxsH+DxPftsB8B6wlGDN02TAkxG6+4D3TWsbeC5CS8CDFce+AW500LhhOW2020TRjK3b21HEmgti9m0RonxbdMZeVzV+/4tF3cBpP7E9mKHNL5q8h5g0eYsCMQz0epq8gQrwMXAgcs0FGXGFRcB9wCemF9PkbYqM/Bas7fxLwNeJPdTdpo4itQti8lPMqTpXuozVRVXPpbHI3KkNTB1NfkL81j2mvhDp91HgV9MKuRIqrykj3WPq4rHyL+axj8/qGPmTqi6F9YDlHOvJU6oYcTsh/TYSzWmTE6JT19CtLTJt32D6CmHe0eQn1O8z5AXgT4sx4Vcu0/EQecMydB8z0hUWkTd2t4CrwNEePqMBcAR4mrBbwyXLPWJa8zrXmmLEhNBmfpkuY2102xxrih+pb+ieAb6vGhuA97UcJ5KR8gZ77K+99xxeYBzH6Q3/Z0fHcXrDC4zjOL3hBcZxnN74F+zlvXFWXF9PAAAAAElFTkSuQmCC';

const CSSCode = `
.media-viewer-container{
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.media-viewer-container .viewer-canvas{
  height: calc(100% - 140px);
  position: relative;
  overflow: hidden;
}
.viewer-canvas.other{
}
.viewer-canvas.other>.media{
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}


.media-viewer-container .viewer-canvas>.media{
  position: absolute;
  transition: all 0.3s;
}
.media-viewer-container .viewer-canvas>.media.no-transition{
  transition: none;
}
.media-viewer-container .viewer-footer{
  height: 100px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
}
.media-viewer-container .viewer-footer .media{
  height: 90px;
  width: 70px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
  transform: translateY(10px);
}
.media-viewer-container .viewer-footer .media.active{
  height: 90px;
  width: 70px;
  object-fit: cover;
  cursor: pointer;
  transform: translateY(0);
}
.media-viewer-container .viewer-footer .media+.media{
  margin-left: 5px;
}

.media-viewer-container .close{
  position: absolute;
  background-color: rgba(16,146,132,0.5);
  height: 80px;
  width: 80px;
  right: -30px;
  top: -30px;
  border-radius: 50%;
  cursor: pointer;
}
.media-viewer-container .close>.icon{
  background-image: url(${ICON});
  background-repeat: no-repeat;
  background-size: 1000%;
  height: 40px;
  width: 40px;
  position: absolute;
  background-position-x: -365px;
  top: 35px;
  left: 10px;
}

.media-viewer-container .buttons{
  text-align: center;
  height: 40px;
}
.media-viewer-container .buttons > i{
  font-style: normal;
  color: #FFF;
  background-image: url(${ICON});
  background-repeat: no-repeat;
  background-size: 280px;
  background-position-y: 2px;
  height: 20px;
  width: 20px;
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  padding: 2px;
  vertical-align: middle;
  user-select: none;
}

.media-viewer-container .buttons > .zoomIn{
  background-position-x: 2px;
}
.media-viewer-container .buttons > .zoomOut{
  background-position-x: -18px;
}
.media-viewer-container .buttons > .resize{
  background-position-x: -54px;
  background-position-y: 3px;
  background-size: 400px;
  width: 30px;
  height: 30px;
  text-align: center;
}
.media-viewer-container .buttons > .flipX{
  background-position-x: -178px;
}
.media-viewer-container .buttons > .flipY{
  background-position-x: -198px;
}
.media-viewer-container .buttons > .prev{
  background-position-x: -78px;
}
.media-viewer-container .buttons > .next{
  background-position-x: -118px;
}

.media-viewer-container .buttons.other>.zoomIn,
.media-viewer-container .buttons.other>.zoomOut,
.media-viewer-container .buttons.other>.resize,
.media-viewer-container .buttons.other>.flipX,
.media-viewer-container .buttons.other>.flipY
{
  display: none;
}

`;


const HTML = `
<div class="viewer-canvas"></div>
<div class="close">
  <i class="icon"></i>
</div>

<div class="buttons">
  <i class="zoomIn"></i>
  <i class="zoomOut"></i>
  <i class="prev"></i>
  <i class="resize"></i>
  <i class="next"></i>
  <i class="flipX"></i>
  <i class="flipY"></i>
</div>
<div class="viewer-footer"></div>
`;

const DEFAULT_OPTIONS = Object.freeze({
  /**
  * Define the min ratio of the image when zoom out.
  * @type {number}
  */
  minZoomRatio: 0.01,

  /**
   * Define the max ratio of the image when zoom in.
   * @type {number}
   */
  maxZoomRatio: 100,
  /**
   * Enable to move the image.
   * @type {boolean}
   */
  movable: true,
  zIndex: 1000,
  scopeId: null,
})

/* 
媒体预览
可以预览图片，音频，视频
*/
function MediaPreview(res, options){
  this.options = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  this._initContainer();
  this._buildEvent();

  if (res){
    this.setMedia(res);
  }
  this.index = 0;
}

MediaPreview.prototype.setMedia = function (res) {
  let tags = [];
  if (res instanceof HTMLElement) {
    tags = Array.from(res.querySelectorAll('img,video,audio'));
  } else if (res instanceof Array) {
    res.forEach(item => {
      if (item instanceof HTMLElement) {
        if (/IMG|VIDEO|AUDIO/.test(item.tagName)) {
          tags.push(item);
        }
      } else if (typeof (item) == 'string') {
        let img = document.createElement('img'); // 默认作为图片
        img.src = item;
        tags.push(img);
      } else if (typeof (item) == 'object') {
        if (item.type && item.src && /img|image|video|audio/.test(item.type)) {
          let type = item.type;
          if (item.type == 'image'){
            type = 'img'
          }
          let img = document.createElement(type);
          img.src = item.src;
          tags.push(img);
        }
      }
    });
  } else {
    throw new Error('只能传HTMLElement和Array');
  }

  let self = this;
  self.footer.innerHTML = '';
  tags.forEach((tag, index)=>{
    if (tag.tagName == 'AUDIO'){
      tag = document.createElement('img');
      tag.src = require('../assets/audio-default.png');
    }
    tag.className = 'media';
    tag.onclick = function(){
      self.show(index);
      self._setCurrent();
    };
    self.footer.appendChild(tag);
  });

  this.tags = tags;
  return tags;
};

/**
 * 初始化显示的容器
 */
MediaPreview.prototype._initContainer = function(){
  // 设置css
  let css = this.css = document.createElement('style');
  css.innerHTML = CSSCode;
  document.head.appendChild(css);

  let container = this.container = document.createElement('div');
  container.className = 'media-viewer-container';
  container.style.zIndex = this.options.zIndex;
  container.setAttribute(this.options.scopeId, '');
  container.innerHTML = HTML;
  document.body.appendChild(container);

  this.buttons = container.querySelector('.buttons');
  this.viewerCanvas = container.querySelector('.viewer-canvas');
  this.footer = container.querySelector('.viewer-footer');
};

MediaPreview.prototype.zIndex = function (zIndex) {
  if(zIndex){
    this.container.style.zIndex = zIndex;
  }
  return this.container.style.zIndex;
};
MediaPreview.prototype.show = function (index = 0) {
  let self = this;
  self.viewerCanvas.innerHTML = '';
  self.container.style.display = 'block';
  self.index = index;
  let el = self.current = self.tags[index].cloneNode();
  el.onclick = null;

  let footerHeight = self.footer.offsetHeight;
  let viewerWidth = self.container.clientWidth;
  let viewerHeight = Math.max(self.container.clientHeight - footerHeight, footerHeight);

  if (/VIDEO|AUDIO/.test(self.current.tagName)) {
    self.showOther(el);
    return;
  } else {
    self.viewerCanvas.classList.remove('other');
    self.buttons.classList.remove('other');
  }


  load(el, function(){
    let elWidth = el.width;
    let elHeight = el.height;
    // 获取图片真实宽高
    let aspectRatio = elWidth / elHeight;
    let width = viewerWidth;
    let height = viewerHeight;
    if (viewerHeight * aspectRatio > viewerWidth) {
      height = viewerWidth / aspectRatio;
    } else {
      width = viewerHeight * aspectRatio;
    }
    width = Math.min(width * 0.9, elWidth);
    height = Math.min(height * 0.9, elHeight);
    let left = (viewerWidth - width) / 2;
    let top = (viewerHeight - height) / 2;
    self.imageData = {
      x: left,
      y: top,
      width: width,
      height: height,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      ratio: width / el.width,
      aspectRatio: aspectRatio,
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
    };

    self.initialImageData = { ...self.imageData };

    self._update();

    self.viewerCanvas.innerHTML = '';
    self.viewerCanvas.appendChild(el);
    self._setCurrent();
  });

  // 添加exit键
  function keyExitEvent(e){
    if (e.keyCode != 27){
      return;
    }
    window.stopBubble(e);
    self.close();

    document.removeEventListener('keydown', keyExitEvent);
  }
  document.addEventListener('keydown', keyExitEvent);
};

function load(res, fn){
  res.onload = fn;
}

MediaPreview.prototype.showOther = function(el){
  if (!this.viewerCanvas.classList.contains('other')){
    this.viewerCanvas.classList.add('other');
    this.buttons.classList.add('other');
  }
  let viewerWidth = this.container.clientWidth;
  let elWidth = viewerWidth * 0.8;
  let elHeight = 500;
  let style = el.style;
  style.width = elWidth + 'px';
  if (el.tagName =='VIDEO'){
    style.height = elHeight + 'px';
  }

  el.className = 'media';
  el.setAttribute('controls', '');
  el.setAttribute('autoplay', '');

  this.viewerCanvas.appendChild(el);
  this._setCurrent();
};

MediaPreview.prototype._setCurrent = function () {
  let arr = Array.from(this.footer.children);
  arr.forEach(tag => {
    tag.classList.remove('active');
  });
  arr[this.index].classList.add('active');
  
};

MediaPreview.prototype.move = function (offsetX, offsetY) {

  let self = this;

  var imageData = self.imageData;
  let x = Number(offsetX);
  let y = Number(offsetY);
  x = imageData.x + x;
  y = imageData.y + y;
  imageData.x = x;
  imageData.y = y;
  
  this._update();

  return this;
};

MediaPreview.prototype._update = function () {
  var imageData = this.imageData;
  let style = this.current.style;
  style.width = imageData.width + 'px';
  style.height = imageData.height + 'px';
  style.left = imageData.x + 'px';
  style.top = imageData.y + 'px';
  style.transform = 'scale(' + imageData.scaleX + ', ' + imageData.scaleY +')';
};


MediaPreview.prototype.zoom = function (ratio, ) {
  var hasTooltip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var _originalEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var imageData = this.imageData;
  ratio = Number(ratio);

  if (ratio < 0) {
    ratio = 1 / (1 - ratio);
  } else {
    ratio = 1 + ratio;
  }

  this.zoomTo(imageData.width * ratio / imageData.naturalWidth, hasTooltip, _originalEvent);
  return this;
};

MediaPreview.prototype.zoomTo = function (ratio) {
  let self = this;
  var _originalEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var imageData = this.imageData;
  let options = this.options;
  var x = imageData.x,
    y = imageData.y,
    width = imageData.width,
    height = imageData.height,
    naturalWidth = imageData.naturalWidth,
    naturalHeight = imageData.naturalHeight;

  ratio = Math.max(0, ratio);

  var minZoomRatio = Math.max(0.01, options.minZoomRatio);
  var maxZoomRatio = Math.min(100, options.maxZoomRatio);
  ratio = Math.min(Math.max(ratio, minZoomRatio), maxZoomRatio);

  if (_originalEvent && options.zoomRatio >= 0.055 && ratio > 0.95 && ratio < 1.05) {
    ratio = 1;
  }

  var newWidth = naturalWidth * ratio;
  var newHeight = naturalHeight * ratio;
  var offsetWidth = newWidth - width;
  var offsetHeight = newHeight - height;
  var oldRatio = imageData.ratio;

  this.zooming = true;

  if (_originalEvent) {
    var offset = getOffset(this.container);
    var center = {
      pageX: _originalEvent.pageX,
      pageY: _originalEvent.pageY
    }; // Zoom from the triggering point of the event

    imageData.x -= offsetWidth * ((center.pageX - offset.left - x) / width);
    imageData.y -= offsetHeight * ((center.pageY - offset.top - y) / height);
  } else {
    // Zoom from the center of the image
    imageData.x -= offsetWidth / 2;
    imageData.y -= offsetHeight / 2;
  }

  imageData.width = newWidth;
  imageData.height = newHeight;
  imageData.oldRatio = oldRatio;
  imageData.ratio = ratio;


  self._update();

};

MediaPreview.prototype.scaleX = function (i) {
  this.imageData.scaleX = i;
  this._update();
};
MediaPreview.prototype.scaleY = function (i) {
  this.imageData.scaleY = i;
  this._update();
};

MediaPreview.prototype.close = function () {
  this.container.style.display = 'none';
  this.viewerCanvas.innerHTML = '';
};

MediaPreview.prototype.destroy = function () {
  document.body.removeChild(this.container);
};

MediaPreview.prototype._buildEvent = function () {
  let self = this;

  /**
   * 滚轮事件
   */
  self.viewerCanvas.addEventListener('wheel', function (event) {
    if (self.wheeling) {
      return;
    }
    if (/VIDEO|AUDIO/.test(self.current.tagName)) {
      return;
    }
    event.preventDefault();
    self.wheeling = true;
    setTimeout(function () {
      self.wheeling = false;
    }, 50);

    var ratio = Number(self.options.zoomRatio) || 0.1;
    var delta = 1;

    if (event.deltaY) {
      delta = event.deltaY > 0 ? 1 : -1;
    } else if (event.wheelDelta) {
      delta = -event.wheelDelta / 120;
    } else if (event.detail) {
      delta = event.detail > 0 ? 1 : -1;
    }

    self.zoom(-delta * ratio, true, event);
  });

  self.viewerCanvas.addEventListener('mousedown', function (event) {
    if (/VIDEO|AUDIO/.test(self.current.tagName)) {
      return;
    }

    event.preventDefault();

    var imageData = self.imageData;
    self.pointers = {
      // 鼠标位置
      endX: event.pageX,
      endY: event.pageY,
      // 鼠标到定位点的距离
      x: event.pageX - imageData.x,
      y: event.pageY - imageData.y
    };

    self.current.classList.add('no-transition');

    function handlerMousemove(event) {
      let pointers = self.pointers;

      if (!pointers) {
        return;
      }
      event.preventDefault();

      let offsetX = event.pageX - pointers.endX;
      let offsetY = event.pageY - pointers.endY;

      pointers.endX = event.pageX;
      pointers.endY = event.pageY;

      self.move(offsetX, offsetY);

    }
    function handlerMouseup(event) {
      event.preventDefault();
      self.pointers = null;
      self.current.classList.remove('no-transition');

      document.removeEventListener('mousemove', handlerMousemove);
      document.removeEventListener('mouseup', handlerMouseup);
    }

    document.addEventListener('mousemove', handlerMousemove);
    document.addEventListener('mouseup', handlerMouseup);
  });


  // 按钮事件
  let close = self.container.querySelector('.close');
  close.addEventListener('click', function () {
    self.close();
  });

  let zoomIn = self.container.querySelector('.zoomIn');
  zoomIn.addEventListener('click', function () {
    self.zoom(0.1, true);
  });
  let zoomOut = self.container.querySelector('.zoomOut');
  zoomOut.addEventListener('click', function () {
    self.zoom(-0.1, true);
  });
  let prev = self.container.querySelector('.prev');
  prev.addEventListener('click', function () {
    self.index--;
    if (self.index < 0) {
      self.index = self.tags.length - 1;
    }
    self.show(self.index);
  });
  let next = self.container.querySelector('.next');
  next.addEventListener('click', function () {

    self.index++;
    if (self.index >= self.tags.length) {
      self.index = 0;
    }
    self.show(self.index);
  });
  let resize = self.container.querySelector('.resize');
  resize.addEventListener('click', function () {
    self.imageData = { ...self.initialImageData };
    self._update();
  });
  let flipX = self.container.querySelector('.flipX');
  flipX.addEventListener('click', function () {
    self.scaleX(-self.imageData.scaleX);
  });
  let flipY = self.container.querySelector('.flipY');
  flipY.addEventListener('click', function () {
    self.scaleY(-self.imageData.scaleY);
  });

};

function getOffset(element) {
  var box = element.getBoundingClientRect();
  return {
    left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
    top: box.top + (window.pageYOffset - document.documentElement.clientTop)
  };
}


// let a = new MediaPreview();
// a.setMedia([
//   { type: 'img', src: require('./20211118184920.png')},
//   { type: 'img', src: require('./20211228114642.png')},
//   { type: 'img', src: require('./wwww.png')},
//   { type: 'video', src: require('./Video_20.mp4')},
//   { type: 'audio', src: require('./test.mp3')},
// ]);
// a.show();
let previewInstance = new MediaPreview(null, {
  scopeId: 'default'
});
MediaPreview.previewInstance = previewInstance;
export {
  previewInstance
};

export default MediaPreview;