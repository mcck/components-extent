/**
 * 权限指令
 * 
 * 
 * 输出函数：
 * hasPermission：判断是否有权限
 * permission：处理权限
 * 
 * 使用方法：
 * 写在vue的dom节点上 
 *   字符串方式： v-permission="'xxx,xxxx,...'";
 *   对象方式：  v-permission="{Object}}"
 *   code: String(必须) 权限代码，多个用逗号(,)隔开
 *   logic: String code参数有多个的时候，判断方式。可选值（and | or），默认and
 *   unauth：String  未授权处理方式:
 *     remove(default)：移除元素
 *     invalid: 设置为无效，禁止使用
 *     hide：隐藏
 *     clsss: 自定义class
 *     style: 自定义style
 *   class: unauth为class时启用，没有权限时在节点上添加的class
 *   style: unauth为style时启用，没有权限时在节点上添加的style
 */

import { extentContext } from '../index';
function buildParams(val){
  if(!val){
    return;
  }

  let auth = {
    logic: 'and',
    unauth: 'remove',
    title: '没有权限'
  };
  let _type = typeof (val);
  if (_type == 'string') {
    auth.code = val;
  } else if (_type == 'object') {
    Object.assign(auth, val);
  } else {
    assert(null, '未知的权限类型');
  }
  auth.logic = auth.logic.toLowerCase();
  return auth;
}

/**
 * 判断是否有权限
 * 返回true|false
 */
export function hasPermission(auth){
  auth = buildParams(auth);
  assert(auth, 'v-permission 没有指定权限！');
  assert(auth.code, '没有指定权限代码');

  let codes = auth.code.split(',');
  let codeList = extentContext().authCodeList;
  if (!codeList){
    console.warn("权限代码没有设置");
    return true;
  }

  let fn = codes.every; // and
  if (auth.logic == 'or'){
    fn = codes.some;
  }
  
  return fn.call(codes, function (code) {
    return codeList.includes(code.trim());
  });
}

/**
 * 处理权限
 * @param {Element} el 节点
 * @param {Object | String} auth 权限参数
 */
export function permission(el, auth) {
  auth = buildParams(auth);
  assert(auth, 'v-permission 没有指定权限！');
  if (!hasPermission(auth)){
    if (auth.unauth == 'invalid'){
      el.style.pointerEvents = 'none';
      el.style.filter = 'grayscale(1)';
    }else if (auth.unauth == 'hide'){
      // 隐藏
      el.style.display = 'none';
    } else if (auth.unauth == 'class'){
      // 自定义class
      el.classList.add(...auth.class.split(' '));
    } else if (auth.unauth == 'style'){
      // 自定义style
      for (let o in auth.style){
        el.style[o] = auth.style[o];
      }
    } else {
      // 默认移除
      el.remove();
    }
    el.title = auth.title;

  }
}


export default {
  install(vue) {
    vue.directive('permission', {
      // 当被绑定的元素挂载到 DOM 中时
      mounted (el, binding) {
        try{
          permission(el, binding.value);
        }catch(e){
          console.warn(e.message, binding.value, binding.instance.$options.name, el);
        }
      }
    });


    vue.config.globalProperties.$permission = permission;
    vue.config.globalProperties.$hasPermission = hasPermission;
    
  },
};

function assert(obj, msg) {
  if (!obj) {
    throw new Error(msg);
  }
}
