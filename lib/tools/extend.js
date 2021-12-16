// import { DatePicker } from 'element-ui';
// import {eventBus} from './utils/VueTools.js';
// import { modules} from './router/module.js';

// /**
//  * 设置屏幕宽高
//  */
// Vue.prototype.SCREEN_WIDTH = window.innerWidth;
// Vue.prototype.SCREEN_HEIGHT = window.innerHeight;
let contextThis = null
if (typeof (window) != 'undefined') {
  contextThis = window;
} else if (typeof (globalThis) != 'undefined') {
  contextThis = globalThis;
}

/**
 * 生成UUID
 */
contextThis.guid = function guid(len) {
  len = len || 8;
  let x = 'x';
  for (let i = 0; i < len; i++) {
    x += 'x';
  }
  return x.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
/**
 * 复制到剪切板
 */
contextThis.copyToClip = function copyToClip(content) {
  var aux = document._copy_textarea;
  if (!aux) {
    aux = document._copy_textarea = document.createElement('textarea');
    aux.style.width = '1px';
    aux.style.height = '1px';
    aux.style.padding = '0px';
    aux.style.border = 'none';
  }
  aux.value = null;
  aux.value = content;
  // aux.setAttribute("value", content);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand('copy');
  document.body.removeChild(aux);
};

/**
 * 点击选中
 */
contextThis.clickSelect = function clickSelect(self) {
  if (document.selection) {
    let range = document.body.createTextRange();
    range.moveToElementText(self);
    range.select();
  } else if (contextThis.getSelection) {
    let range = document.createRange();
    range.selectNode(self);
    contextThis.getSelection().removeAllRanges();
    contextThis.getSelection().addRange(range);
  }
};

contextThis.stopBubble = function stopBubble(event) {
  let e = event || contextThis.event;
  if (e.preventDefault) {
    e.preventDefault();
  }
  // 一般用在鼠标或键盘事件上
  if (e.stopPropagation) {
    // W3C取消冒泡事件
    e.stopPropagation();
  } else {
    // IE取消冒泡事件
    contextThis.event.cancelBubble = true;
  }
};

/**
 * // 监听对象属性
 * @param {Object} obj 被监听的对象
 * @param {Object} prop 被监听的属性
 * @param {Object} fn 值修改后的回调
 */
contextThis.$watch = function $watch(obj, prop, fn) {
  obj['_' + prop] = obj[prop];
  Object.defineProperty(obj, prop, {
    get: function() { // 取值的时候会触发
      return this['_' + prop];
    },
    set: function(value) { // 更新值的时候会触发
      this['_' + prop] = value;
      // 会调
      fn && fn(value, '_' + prop); // 新值，旧值
    }
  });
};
/**
 * 深度冻结对象
 */
Object.deepFreeze = function(obj){
  if(!obj){
    return obj;
  }

  let propNames = Object.getOwnPropertyNames(obj);
  propNames.forEach(name=>{
    if (typeof(obj[name]) == 'object'){
      Object.deepFreeze(obj[name]);
    }
  });
  return Object.freeze(obj);
}

/**
 * 扩展Date时间转换
 * 时间分量：
 * y 年
 * M 月
 * d 日
 * s 秒
 * S 毫秒
 * q 月中第几周
 * e 星期
 * E 星期（中文）
 * a AM/PM
 * A 上午/下午
 */
Date.prototype.Format = function (fmt = 'yyyy-MM-dd HH:mm:ss') {
  let self = this;
  var o = {
    'M+': () => self.getMonth() + 1, // 月
    'd+': () => self.getDate(), // 日
    'h+': () => { // 12 小时制
      let h = self.getHours();
      return h <= 12 ? h : h - 12;
    }, // 时
    'H+': () => self.getHours(), // 24小时制
    'm+': () => self.getMinutes(), // 分
    's+': () => self.getSeconds(), // 毫秒
    'S': () => self.getMilliseconds(), // 秒
    'q+': () => Math.floor((self.getMonth() + 3) / 3), // 月中第几周
    'e': () => self.getDay(), // 周中星期几
    'E': () => ['日', '一', '二', '三', '四', '五', '六'][self.getDay()],
    'a': () => (self.getHours() <= 12 ? 'AM' : 'PM'), // 上下午
    'A': () => (self.getHours() <= 12 ? '上午' : '下午') // 上下午
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replaceAll(RegExp.$1, (self.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      let val = o[k] instanceof Function ? (o[k] = o[k]()) : o[k];
      fmt = fmt.replaceAll(RegExp.$1, (RegExp.$1.length === 1) ? (val) : (('00' + val).substr(('' + val).length)));
    }
  }
  return fmt;
};

/**
 * 通过下标替换一行内的参数
 * 'ab{0}d'.format('d') ==> abcd
 * 
 * @param  {...any} param 
 * @returns 
 */
String.prototype.format = function(...param) {
  if (param.length === 0) {
    return this;
  } else if (param[0] instanceof Array) {
    param = param[0];
  } else if (param[0] instanceof Object) {
    return this.format2(param[0]);
  }
  for (var s = this, i = 0; i < param.length; i++) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), param[i]);
  }
  return s;
};
/**
 * 通过参数名称替换参数
 * 'ab{p1}{p2}}'.format2({p1: 'c', p2: 'd'}) ==> abcd
 * @param {Object} obj 
 * @returns 
 */
String.prototype.format2 = function(obj) {
  var s = this;
  for (var i in obj) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), obj[i]);
  }
  return s;
};
/**
 * 通过表达式替换参数
 * let p1 = 100
 * 'ab{param}cd{param1}'.format3({param: p1, param1: '1+1'}); ==> ab100cd2
 * @param {Object} obj 
 * @returns 
 */
String.prototype.format3 = function (obj) {
  var s = this;
  var arr = s.match(/[^{][a-zA-Z0-9\\.\-\\+\\*\\/]+(?=\})/g); // 匹配括号里的字符串{xxx} => xxx
  if (arr) {
    arr.forEach(it => {
      var val;
      if (obj && obj[it]) {
        val = obj[it];
      } else {
        try {
          // eslint-disable-next-line no-eval
          val = eval(it);
        } catch (e) {
          console.error('替换字符串错误！', it, e);
        }
      }
      if (val) {
        s = s.replace('{' + it + '}', val);
      }
    });
  }

  return s.toString();
};
/**
 * 低版本浏览器没有replaceAll方法
 */
if (!String.prototype.replaceAll){
  String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, 'gm'), s2);
  };
}


// 通过下标删除数组元素
Array.prototype.removeByIndex = function(index) {
  var inx = parseInt(index);
  if (!isNaN(inx)) {
    this.splice(inx, 1);
  }
  return this;
};
// 通过元素删除靠前的指定元素
Array.prototype.remove = function(val) {
  return this.removeByVal(val);
};
Array.prototype.removeByVal = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
  return this;
};
/**
 * 删除满足条件的元素
 */
Array.prototype.removeByAttr = function(condition) {
  let self = this;
  for (let i = 0; i < this.length; i++) {
    let item = this[i];
    if (item instanceof Object) {
      let bool = false;
      for (let o in condition) {
        bool = item[o] === condition[o];
      }
      bool && self.splice(i--, 1);
    }
  }
  return this;
};
// 浅拷贝
Array.prototype.clone = function() { return this.slice(0); };
// 查看是否包含某个元素
if (typeof Array.prototype.contains !== 'function') {
  Array.prototype.contains = function(suffix) {
    return this.indexOf(suffix) > -1;
  };
}
Array.prototype.deepClone = function() {
  return this ? JSON.parse(JSON.stringify(this)) : this;
};
Array.prototype.insert = function(index, val) {
  this.splice(index, 0, val);
  return this;
};
/**
 * 通过条件获取元素下标
 * @param {Object} condition
 */
Array.prototype.indexOf2 = function(condition) {
  return this.findIndex(item => {
    for (let o in condition) {
      if (condition[o] !== item[o]) {
        return false;
      }
    }
    return true;
  });

  // for (let i = 0; i < this.length; i++) {
  //   let item = this[i];
  //   if (item instanceof Object) {
  //     let bool = true;
  //     for (let o in condition) {
  //       if (item[o] != condition[o]) {
  //         bool = false;
  //         break;
  //       }
  //     }
  //     if (bool) {
  //       return i;
  //     }
  //   }
  // }
};
/**
 * 通过条件获取元素
 * @param {Object} condition
 */
Array.prototype.find2 = function(condition) {
  // return this[this.indexOf2(condition)];
  return this.find(item => {
    for (let o in condition) {
      if (condition[o] !== item[o]) {
        return false;
      }
    }
    return true;
  });
};
/**
 * 数组中每个对象其中一个字段，组合成一个新的数组
 * 必须全部元素为对象
 */
Array.prototype.toValues = function(key) {
  let r = [];
  this.forEach(e => {
    e[key] && r.push(e[key]);
  });
  return r;
};

Array.prototype.search = function (cond, children ='children') {
  for(let i=0; i<this.length; i++){
    let bool = true;
    for(let o in cond){
      if (this[i][o] != cond[o]){
        bool = false;
        break;
      }
    }
    if (bool){
      return this[i];
    }
    if (this[i][children]?.length){
      let r = this[i][children].search(cond, children);
      if(r){
        return r;
      }
    }
  }
};

/**
 * 获取数组第一个元素
 */
Array.prototype.fast = function () {
  return this[0];
};
/**
 * 获取数组最后一个元素
 */
Array.prototype.last = function (index = 1) {
  return this[this.length - index];
};

/**
 * 计算差集
 */
Array.minus = function(arr1, arr2, fn) {
  return arr1.filter(function(v) {
    if (fn){
      return !arr2.find(it=>{
        fn(v, it);
      });
    } else {
      return arr2.indexOf(v) === -1;
    }
  });
};

JSON.copy = function(val) {
  return JSON.parse(JSON.stringify(val));
};

// 对象深拷贝
function deepClone(self) {
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
 * 计算两个对象的字段差集,一传入的传入的参数为结果
 * @param {Object} obj
 */
function different(obj1 = {}, obj = {}) {
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
/**
 * 计算对象属性个数
 * @param {Object} obj 对象
 * @param {Boolean} und 是否过滤null，undefined值
 */
function attrCount(obj, und) {
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
function deleteEmpty(obj) {
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

function isType (val, ...types) {
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

if (typeof (HTMLElement) != 'undefined'){
  /**
   * 计算Dom属性值，数字自动转换
   * @param {String} property 
   * @param {String | Boolean(false)} unit 单位，默认px，如果为false则不截取单位
   * @returns 
   */
  HTMLElement.prototype.computedStyleValue = function (property, unit = 'px') {
    let style = getComputedStyle(this);
    let value = style.getPropertyValue(property);
    if (unit == false) {
      return value;
    }
  
    try {
      if (value.endsWith(unit)) {
        value = value.replace(unit, '');
        value = parseFloat(value);
      }
    } finally {
      return value;
    }
  };
}

/**
 * 数字转金额大写
 * @param {String | Number} str 
 * @returns 
 */
function number_chinese(str) {
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
function inferElementHeight(el, offset = 0) {
  let parent = el.parentElement;
  let height = parent.clientHeight - parent.computedStyleValue('padding-top') - parent.computedStyleValue('padding-bottom');
  let cell = el.parentElement.children;
  for(let i=0; i<cell.length; i++){
    if (cell[i] != el) {
      height -= cell[i].clientHeight;
    }
  }

  return height - offset;
}

/**
 * 扩展浏览器前进事件
 */
(function() {
  if (typeof (history) != 'undefined'){
    let _wr = function(type) {
      let orig = contextThis.history[type];
      return function() {
        let rv = orig.apply(this, arguments);
        let e = new Event(type);
        e.arguments = arguments;
        contextThis.dispatchEvent(e);
        return rv;
      };
    };
    contextThis.history.pushState = _wr('pushState');
    contextThis.history.replaceState = _wr('replaceState');
  }
})();

function ElementCreate(name, prop, parent) {
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

let path = {
  join: function (...str){
    return path.normalize(str.join('/'));
  },

  normalize: function(url) {
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
function getPosLen(sdot, edot){//获取2点距离
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
function formatElValue(val){
  if (typeof (val) == 'string') {
    return val;
  } else if (typeof (val) == 'number' && !isNaN(val)) {
    return val + 'px';
  } else {
    return false;
  }
}

export {
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
}


/* 扩展vue */
export default {
  install(vue) {
    let global = vue.config.globalProperties;
    global.isPosNumber = function(n) {
      return n && n > 0;
    };
    global.isNotPosNumber = function(n) {
      return !this.isPosNumber(n);
    };

    global.$formatDateTime = function (row, column, cellValue) {
      let val = row;
      if (cellValue) {
        val = cellValue;
      }
      return new Date(val).Format('yyyy-MM-dd HH:mm:ss');
    };
    global.$formatDate = function (row, column, cellValue) {
      let val = row;
      if (cellValue) {
        val = cellValue;
      }
      return new Date(val).Format('yyyy-MM-dd');
    };
    global.$formatTime = function (row, column, cellValue) {
      let val = row;
      if (cellValue) {
        val = cellValue;
      }
      return new Date(val).Format('HH:mm:ss');
    };
  }
};
