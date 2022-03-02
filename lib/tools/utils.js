export function isType(val, ...types) {
  let typestr = Object.prototype.toString.call(val);
  for (let i = 0; i < types.length; i++) {
    if (typeof (types[i]) == 'string') {
      if (typestr == '[object ' + types[i] + ']') {
        return true;
      }
    } else {
      if (val instanceof types[i] || typestr == '[object ' + types[i].name + ']') {
        return true;
      }
    }
  }
  return false;
};


/**
 * 数字转金额大写
 * @param {String | Number} str 
 * @returns 
 */
export function number_chinese(str) {
  var num = parseFloat(str);
  var strOutput = "",
    strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';
  num += "00";
  var intPos = num.indexOf('.');
  if (intPos >= 0) {
    num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
  }
  strUnit = strUnit.substr(strUnit.length - num.length);
  for (var i = 0; i < num.length; i++) {
    strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i, 1), 1) + strUnit.substr(i, 1);
  }
  return strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元")
}


/**
 * 推算元素应有的高度
 * @param {Element} el 元素
 * @param {Number} offset 偏移值
 * @returns 
 */
export function inferElementHeight(el, offset = 0) {
  let parent = el.parentElement;
  // 计算父级可视高度
  let height = parent.clientHeight - parent.computedStyleValue('padding-top') - parent.computedStyleValue('padding-bottom');

  Array.from(parent.children).forEach(chi => {
    if (chi == el) {
      return;
    }
    if (chi.classList.contains('el-loading-mask')){
      return;
    }
    if (getComputedStyle(chi).display == 'none') {
      return;
    }
    // 计算元素真实高度
    let h = chi.clientHeight + chi.computedStyleValue('margin-top') + chi.computedStyleValue('margin-bottom');
    height -= h;
  });
  return height - offset;
}

/**
 * 创建dom对象
 * @param {String} name 标签名
 * @param {Object} prop 配置信息
 * @param {HtmlElement} parent 父级
 * @returns 
 */
export function ElementCreate(name, prop, parent) {
  let el = document.createElement(name);
  if (prop.style) {
    if (typeof (prop.style) == 'object') {
      for (let o in prop.style) {
        el.style[o] = prop.style[o];
      }
      delete prop.style;
    }
  }
  if (prop.event) {
    for (let e in prop.event) {
      if (prop.event[e] instanceof Function) {
        el.addEventListener(e, prop.event[e]);
      }
    }
    delete prop.event;
  }

  for (let p in prop) {
    el.setAttribute(p, prop[p]);
  }

  if (parent instanceof HTMLElement) {
    parent.appendChild(el);
  }
  return el;
}


export let path = {
  join: function (...str) {
    return path.normalize(str.join('/'));
  },

  normalize: function (url) {
    let i = 0;
    if (url.startsWith('http')) {
      i = url.indexOf('//') + 2;
    } else if (url.startsWith('//')) {
      i = 2;
    }

    let uri = url.substring(i);
    uri = uri.replace(/(\/\/)|(\\)|(\\\\)/g, '/');
    return url.substring(0, i) + uri;
  }
};

/**
 * 计算2个点距离
 * @param {Object} sdot {x,y}
 * @param {Object} edot {x,y}
 * @returns 
 */
export function getPosLen(sdot, edot) {//获取2点距离
  /*
  56 40 56
  40 00 40
  56 40 56
  */
  return parseInt(Math.sqrt(Math.pow(Math.abs(sdot.x - edot.x), 2) + Math.pow(Math.abs(sdot.y - edot.y), 2)));
}


/**
 * 返回false表示错误
 */
export function formatElValue(val) {
  if (typeof (val) == 'string') {
    return val;
  } else if (typeof (val) == 'number' && !isNaN(val)) {
    return val + 'px';
  } else {
    return false;
  }
}


/**
 * 计算对象属性个数
 * @param {Object} obj 对象
 * @param {Boolean} und 是否过滤null，undefined值
 */
export function attrCount(obj, und) {
  if (und) {
    let i = 0;
    for (let o in obj) {
      if (obj[o] != null && obj[o] !== undefined) {
        i++;
      }
    }
    return i;
  }
  return Object.keys(obj).length;
};


/**
 * 去除空字段
 * null，undefined, NaN
 */
export function deleteEmpty(obj) {
  if (obj) {
    var obj_ = {};
    for (var o in obj) {
      if (obj[o] != null && obj[o] !== undefined && (typeof (obj[o]) === 'number' ? !isNaN(obj[o]) : true)) {
        obj_[o] = obj[o];
      }
    }
  }
  return obj_;
};


/**
 * 计算两个对象的字段差集,一传入的传入的参数为结果
 * @param {Object} obj
 */
export function different(obj1 = {}, obj = {}) {
  let p = {};
  let x = { ...obj };
  if (obj instanceof Object) {
    for (let o in obj1) {
      if (obj1[o] !== x[o]) {
        p[o] = x[o];
      }
      delete x[o];
    }
    for (let o in x) {
      if (x[o] !== obj1[o]) {
        p[o] = x[o];
      }
    }
  }
  return p;
};
// 对象深拷贝
export function deepClone(self) {
  let newObj = {};
  for (var i in self) {
    if (typeof (self[i]) === 'object') {
      newObj[i] = deepClone(self[i]);
    } else {
      newObj[i] = self[i];
    }
  }
  return newObj;
};
/**
 * 判断是否有值
 */
export function hasNotValue(val){
  return val === undefined || val === null;
}
export function hasValue(val){
  return !hasNotValue(val);
}

export default {
  isType,
  attrCount, // 计算对象属性个数
  deleteEmpty, // 删除为空的属性
  different, // 计算两个对象的字段差集,一传入的传入的参数为结果
  deepClone, // 对象深拷贝
  number_chinese, // 数字转金额大写
  inferElementHeight, // 推算el高度
  ElementCreate, // 创建element
  path, // path
  getPosLen, // 计算2个像素点距离
  formatElValue, // 获取元素值
  hasNotValue, // 判断是否有值
  hasValue
}