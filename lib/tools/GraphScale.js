/**
 * 给svg添加放大缩小的功能
 */

let THRESHOLD = 15;
let RANGE = { min: 0.2, max: 100 }; // 可缩放倍数
let DELTA_THRESHOLD = 0.1; // 每次放大比例
let DEFAULT_SCALE = 0.75; // 每次移动比例
let isCtrl = false;
let isShift = false;
/**
 *
 * @param {Object} options
 * {
 *   eventElement: 绑定事件的节点，默认svg父级或body
 *   svg: svg节点
 * }
 */
function GraphScale (options) {
  if (options instanceof Element) {
    this.options = {
      svg: options
    };
  } else {
    this.options = Object.assign({}, options);
  }
  if (!this.options.svg) {
    throw new Error('初始化失败，找不到SVG！');
  }
  if (!this.options.eventElement) {
    this.options.eventElement = this.options.svg.parentElement || document.body;
  }
  this._svg = this.options.svg;
  this._scale = this.options.scale || DEFAULT_SCALE;
  this._totalDelta = 0;
  this._previouScale = 1;

  this._init();
}

GraphScale.prototype._init = function () {
  this._initSvg();
  // 添加css
  generateCss();
  buildMoveEvent.call(this);
  buildScaleEvent.call(this);
  buildGlobalEvent.call(this);
}
/**
 * 添加图形移动事件
 */
function buildMoveEvent () {
  let self = this;
  let context = {};
  // 添加事件
  // 鼠标按下
  let el = this.options.eventElement;
  el.addEventListener('mousedown', function (event) { // 开启拖拽
    context.start = toPoint(event);
    self._svg.className.baseVal = 'move-cursor-grabbing';
    document.addEventListener('mousemove', handleMove, false);
    document.addEventListener('mouseup', handleEnd, false);
  }, false);

  // 处理拖拽
  function handleMove (event) {
    let start = context.start;
    let position = toPoint(event);
    let delta = deltaPos(position, start);

    // 鼠标移动超过15px才移动图形，防止晃动
    if (!context.dragging && _length(delta) > THRESHOLD) {
      context.dragging = true;
    }

    if (context.dragging) {
      let lastPosition = context.last || context.start;
      delta = deltaPos(position, lastPosition);
      self.scroll({
        dx: delta.x,
        dy: delta.y
      });
      context.last = position;
    }
    event.preventDefault();
  }
  function handleEnd (event) {
    self._svg.className.baseVal = 'move-cursor-grab';
    context = {}; // 每一次移动结束，都清除上一次的结果
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
  }
}

/**
 * 图形缩放事件
 */
function buildScaleEvent () {
  let self = this;
  let el = self.options.eventElement;
  el.addEventListener('mousewheel', handleMousewheel, false);

  function handleMousewheel (event) {
    event.preventDefault();
    let factor = -1 * self._scale,
      delta;

    if (isCtrl || isShift) {
      factor *= event.deltaMode === 0 ? 1.0 : 16.0;
    } else {
      factor *= event.deltaMode === 0 ? 0.020 : 0.32;
    }

    if (isCtrl || isShift) {
      if (isShift) {
        delta = {
          dx: factor * event.deltaY,
          dy: 0
        };
      } else {
        delta = {
          dx: factor * event.deltaX,
          dy: factor * event.deltaY
        };
      }

      self.scroll(delta);
    } else {
      var elementRect = el.getBoundingClientRect();
      var offset = {
        x: event.clientX - elementRect.left,
        y: event.clientY - elementRect.top
      };
      delta = (
        Math.sqrt(
          Math.pow(event.deltaY, 2) +
          Math.pow(event.deltaX, 2)
        ) * sign(event.deltaY) * factor
      );
      self.zoom(delta, offset);
    }
  }
}

function buildGlobalEvent () {
  // 添加全局事件
  document.addEventListener('keydown', function (event) {
    if (event.keyCode === 17) { // 按下Ctrl
      isCtrl = true;
    } else if (event.keyCode === 16) {
      isShift = true;
    }
  }, false);
  document.addEventListener('keyup', function (event) {
    if (event.keyCode === 17) { // 弹起Ctrl
      isCtrl = false;
    } else if (event.keyCode === 16) {
      isShift = false;
    }
  }, false);
}

/**
 * 初始化svg，第一个节点必须是g
 * 如果不是就添加
 */
GraphScale.prototype._initSvg = function () {
  let svg = this._svg;
  svg.className.baseVal = 'move-cursor-grab';
  // 第一个子节点必须是g
  if (svg.tagName === 'g') {
    this._viewport = svg;
  } if (svg.childNodes.length === 1 && svg.firstElementChild.tagName === 'g') { // 判断第一个节点是否是g
    this._viewport = svg.firstElementChild;
  } else {
    let g = this.viewport = document.createElementNS(svg.namespaceURI, 'g');
    let childNodes = svg.childNodes;
    for (;childNodes.length !== 0;) {
      g.appendChild(childNodes[0]);
    }
    svg.appendChild(g);
  }
}
/**
 * 缩放
 * @param {Number} delta 缩放比例
 * @param {Object} position {x,y}以哪个位置为中心, 默认中心
 */
GraphScale.prototype.zoom = function (delta, position) {
  if (!delta) {
    return round(this._viewport.getCTM().a, 1000);
  }

  if (delta === 'fit-viewport') {
    return this._fitViewport(delta);
  }
  let range = Object.assign(RANGE, this.options.range);
  var stepSize = getStepSize(range, 20);

  this._totalDelta += delta;

  if (Math.abs(this._totalDelta) > DELTA_THRESHOLD) {
    this._zoom(delta, position, stepSize);

    // reset
    this._totalDelta = 0;
  }
};
GraphScale.prototype._zoom = function (delta, position, stepSize) {
  let self = this;
  var direction = delta > 0 ? 1 : -1;

  var currentLinearZoomLevel = log10(self._previouScale);

  var newLinearZoomLevel = Math.round(currentLinearZoomLevel / stepSize) * stepSize;

  newLinearZoomLevel += stepSize * direction;

  var newLogZoomLevel = Math.pow(10, newLinearZoomLevel);

  var outer,
    matrix;

  (function () {
    matrix = setZoom.call(self, cap(RANGE, newLogZoomLevel), position);
  })();
  this._previouScale = round(self._viewport.getCTM().a, 1000);
  return this._previouScale;
};
function setZoom (scale, center) {
  var svg = this._svg,
    viewport = this._viewport;

  var matrix = svg.createSVGMatrix();
  var point = svg.createSVGPoint();

  var centerPoint,
    originalPoint,
    currentMatrix,
    scaleMatrix,
    newMatrix;

  currentMatrix = viewport.getCTM();

  var currentScale = currentMatrix.a;

  if (center) {
    centerPoint = Object.assign(point, center);

    // revert applied viewport transformations
    originalPoint = centerPoint.matrixTransform(currentMatrix.inverse());

    // create scale matrix
    scaleMatrix = matrix
      .translate(originalPoint.x, originalPoint.y)
      .scale(1 / currentScale * scale)
      .translate(-originalPoint.x, -originalPoint.y);

    newMatrix = currentMatrix.multiply(scaleMatrix);
  } else {
    newMatrix = matrix.scale(scale);
  }
  setCTM(this._viewport, newMatrix);

  return newMatrix;
};

GraphScale.prototype._fitViewport = function (center) {
  let el = this.options.eventElement;
  let outer = {
      height: el.clientHeight,
      width: el.clientWidth
    },
    inner = {
      height: 0,
      width: 0,
      x: 0,
      y: 0
    },
    newScale,
    newViewbox;

  // display the complete diagram without zooming in.
  // instead of relying on internal zoom, we perform a
  // hard reset on the canvas viewbox to realize this
  //
  // if diagram does not need to be zoomed in, we focus it around
  // the diagram origin instead

  if (inner.x >= 0 &&
      inner.y >= 0 &&
      inner.x + inner.width <= outer.width &&
      inner.y + inner.height <= outer.height &&
      !center) {
    newViewbox = {
      x: 0,
      y: 0,
      width: Math.max(inner.width + inner.x, outer.width),
      height: Math.max(inner.height + inner.y, outer.height)
    };
  } else {
    newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height);
    newViewbox = {
      x: inner.x + (center ? inner.width / 2 - outer.width / newScale / 2 : 0),
      y: inner.y + (center ? inner.height / 2 - outer.height / newScale / 2 : 0),
      width: outer.width / newScale,
      height: outer.height / newScale
    };
  }
  let newMatrix = this._svg.createSVGMatrix();
  newMatrix.translate(newViewbox.x, newViewbox.y).scale(newScale);
  setCTM(this._viewport, newMatrix);
  return round(this._viewport.getCTM().a, 1000);
};

/**
 * 平移
 * @param {Object} delta {dx: 0, dy: 0}
 */
GraphScale.prototype.scroll = function (delta) {
  let viewport = this._viewport;
  var matrix = viewport.getCTM();
  if (delta) {
    delta = Object.assign({ dx: 0, dy: 0 }, delta || {});
    // 使用浏览器的api计算偏移距离
    matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);
    setCTM(viewport, matrix);
  }
  return { x: matrix.e, y: matrix.f };
}

/**
 * 设置matrix
 * @param {Object} node 节点
 * @param {Object} m 平移或放大
 */
function setCTM (node, m) {
  var mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')';
  node.setAttribute('transform', mstr);
}

function getStepSize (range, steps) {
  var minLinearRange = log10(range.min),
    maxLinearRange = log10(range.max);

  var absoluteLinearRange = Math.abs(minLinearRange) + Math.abs(maxLinearRange);

  return absoluteLinearRange / steps;
}
function cap (range, scale) {
  return Math.max(range.min, Math.min(range.max, scale));
}
function round (number, resolution) {
  return Math.round(number * resolution) / resolution;
}
function log10 (x) {
  return Math.log(x) / Math.log(10);
}
var sign = Math.sign || function (n) {
  return n >= 0 ? 1 : -1;
};
/**
 * 计算移动的长度
 * @param {Object} point
 */
function length (point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}
/**
 * 计算移动了多少
 * @param {Object} a
 * @param {Object} b
 */
function deltaPos (a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}
/**
 * 转换为坐标
 * @param {Object} event
 */
function toPoint (event) {
  if (event.pointers && event.pointers.length) {
    event = event.pointers[0];
  }

  if (event.touches && event.touches.length) {
    event = event.touches[0];
  }

  return event ? {
    x: event.clientX,
    y: event.clientY
  } : null;
}
function _length (point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}

function generateCss () {
  let GraphScale = document.getElementById('GraphScale');
  if (GraphScale) {
    return;
  }

  let css = `
    .move-cursor-grab{
      cursor: grab;
      cursor: -webkit-grab;
    }
    .move-cursor-grabbing{
      cursor: grabbing;
      cursor: -webkit-grabbing;
    }
  `;
  let style = document.createElement('style');
  style.id = 'GraphScale';
  style.innerText = css;
  document.head.appendChild(style);
}

export default GraphScale;
