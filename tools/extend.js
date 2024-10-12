import { toFixed, guid, hasNotValue } from './utils'
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
contextThis.guid = guid
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
    'S' : () => self.getMilliseconds(), // 秒
    'q+': () => Math.floor((self.getMonth() + 3) / 3), // 月中第几周
    'e' : () => self.getDay(), // 周中星期几
    'E' : () => ['日', '一', '二', '三', '四', '五', '六'][self.getDay()],
    'a' : () => (self.getHours() <= 12 ? 'AM' : 'PM'), // 上下午
    'A' : () => (self.getHours() <= 12 ? '上午' : '下午') // 上下午
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
 * 重写Date转json
 * 默认的 JSON.stringify 方法会把时间转为 国际时区的字符串，少了8小时
 * @returns {String} 'yyyy-MM-dd HH:mm:ss' 格式
 */
Date.prototype.toJSON = function () {
  return this.Format();
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

/**
 * 裁剪字符串
 * @param {String} prefix 去除前缀
 * @param {String} suffix 去除后缀
 * @returns 裁剪后的字符串
 */
String.prototype.trim2 = function (prefix, suffix){
  let str = this.trim();
  if (prefix != false){
    str = trimPrefix(this, prefix);
  }
  if (suffix != false){
    suffix = suffix || prefix;
    str = trimSuffix(this, suffix);
  }
  return str.trim();
};

function trimPrefix(str, prefix) {
  if (str.startsWith(prefix)) {
    str = str.substring(prefix.length);
    return trimPrefix(str, prefix);
  }
  return str;
}
function trimSuffix(str, suffix) {
  if (str.endsWith(suffix)) {
    str = str.substring(0, str.lastIndexOf(suffix));
    return trimSuffix(str, suffix);
  }
  return str;
}



let substring = String.prototype.substring;
String.prototype.substring = function (start, end, startOffset=0, endOffset=0) {
  if (typeof(start) == 'string'){
    start = this.indexOf(start) + startOffset;
  }
  if (typeof(end) == 'string') {
    end = this.indexOf(end) + endOffset;
  }

  return substring.call(this, start, end);
};
let substr = String.prototype.substr;
String.prototype.substr = function (start, end, startOffset = 0, endOffset = 0) {
  if (typeof (start) == 'string') {
    start = this.indexOf(start) + startOffset;
  }
  if (typeof (end) == 'string') {
    end = this.indexOf(end) + endOffset;
  }

  return substr.call(this, start, end);
};


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
    let child = this[i][children];
    if (child && child.length){
      let r = child.search(cond, children);
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
 * 数组统计
 * @param {Function} fn 如果返回true，则统计，返回false不统计
 * @returns 出现的个数
 */
Array.prototype.count = function (fn) {
  if(!fn){
    return 0;
  }
  let count = 0;
  this.forEach(item=>{
    if (fn(item)){
      count++;
    }
  })
  return count;
};

Array.prototype.group = function (groupBy, collect) {
  let res = {};
  let groupByFn = groupBy
  if (typeof (groupBy) == 'string'){
    groupByFn = (item) => item[groupBy]
  }
  this.forEach(item => {
    let key = groupByFn(item);
    let val = collect ? collect(key, item) : item
    let coll = res[key] = res[key] || [];
    coll.push(val);
  });
  return res;
};

// 低版本浏览器不支持Array.at方法
if (!Array.prototype.at){
  Array.prototype.at = function (i) {
    i = i || 1;
    if(i>0){
      return this[i];
    }
    return this[this.length+i]
  };
}

/**
 * 判断数组是否包含另一个数组
 */
Array.prototype.contains = function (arr, comparer) {
  let comparer_ = comparer;
  if (typeof (comparer) == 'string') {
    comparer_ = function (item1, item2) {
      return item1[comparer] == item2[comparer];
    }
  } else if (comparer instanceof Function) {
    comparer_ = comparer;
  } else {
    comparer_ = function (item1, item2) {
      return item1 == item2;
    }
  }
  for (let item1 of arr) {
    let flag = false;
    for (let item2 of this) {
      if (comparer_(item1, item2)) {
        flag = true;
        break;
      }
    }

    if (!flag) return false;
  }

  return true;
};

/* 设置Array对象扩展的方法不允许遍历 */
for (let o in Array.prototype) { 
  Object.defineProperty(Array.prototype, o, {
    enumerable: false
  })
}


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
/**
 * 保留小数，不四舍五入
 */
Number.prototype.toFixed2 = function(num){
  return toFixed(this, num);
};


JSON.copy = function(val) {
  return JSON.parse(JSON.stringify(val));
};
JSON.parse2 = function (text, reviver) {
  if (hasNotValue(text)){
    return;
  } else if (text instanceof Object){
    return text;
  }else{
    return JSON.parse(text, reviver);
  }
};

Boolean.parse = function (bool) {
  if (typeof (bool) == 'boolean'){
    return bool;
  }
  if (bool == 'true'){
    return true;
  }
  if (bool == 1){
    return true;
  }
  return false;
}


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
      if (!val) {
        return;
      }
      return new Date(val).Format('yyyy-MM-dd HH:mm:ss');
    };
    global.$formatDateTime2 = function (row, column, cellValue) {
      let val = row;
      if (cellValue) {
        val = cellValue;
      }
      if (!val) {
        return;
      }
      return new Date(val).Format('yyyy-MM-dd HH:mm');
    };
    global.$formatDate = function (row, column, cellValue) {
      let val = row;
      if (cellValue) {
        val = cellValue;
      }
      if (!val) {
        return;
      }
      return new Date(val).Format('yyyy-MM-dd');
    };
    global.$formatTime = function (row, column, cellValue) {
      let val = row;
      if (cellValue) {
        val = cellValue;
      }
      if (!val) {
        return;
      }
      return new Date(val).Format('HH:mm:ss');
    };

    global.getScopeId = function () {
      return this.$options.__scopeId || this.$.type.__scopeId;
    };
  }
};
