// import { DatePicker } from 'element-ui';
// import {eventBus} from './utils/VueTools.js';
// import { modules} from './router/module.js';

// /**
//  * 设置屏幕宽高
//  */
// Vue.prototype.SCREEN_WIDTH = window.innerWidth;
// Vue.prototype.SCREEN_HEIGHT = window.innerHeight;

/**
 * 生成UUID
 */
window.guid = function(len) {
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
window.copyToClip = function(content) {
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
window.clickSelect = function(self) {
  if (document.selection) {
    let range = document.body.createTextRange();
    range.moveToElementText(self);
    range.select();
  } else if (window.getSelection) {
    let range = document.createRange();
    range.selectNode(self);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
};

window.stopBubble = function(event) {
  let e = event || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  }
  // 一般用在鼠标或键盘事件上
  if (e.stopPropagation) {
    // W3C取消冒泡事件
    e.stopPropagation();
  } else {
    // IE取消冒泡事件
    window.event.cancelBubble = true;
  }
};

/**
 * // 监听对象属性
 * @param {Object} obj 被监听的对象
 * @param {Object} prop 被监听的属性
 * @param {Object} fn 值修改后的回调
 */
window.$watch = function(obj, prop, fn) {
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
Object.clone = function(self) {
  let newObj = {};
  for (var i in self) {
    if (typeof (self[i]) === 'object') {
      newObj[i] = Object.clone(self[i]);
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
Object.different = function(obj1 = {}, obj = {}) {
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
Object.attrCount = function(obj, und) {
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
Object.deleteEmpty = function(obj) {
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

Object.isType = function (val, ...types) {
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
 * 扩展浏览器前进事件
 */
(function() {
  let _wr = function(type) {
    let orig = history[type];
    return function() {
      let rv = orig.apply(this, arguments);
      let e = new Event(type);
      e.arguments = arguments;
      window.dispatchEvent(e);
      return rv;
    };
  };
  history.pushState = _wr('pushState');
  history.replaceState = _wr('replaceState');
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