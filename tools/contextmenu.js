import { ElementCreate } from './utils';

/**
 * 右键菜单处理器
 * 用法：
 * var contextmenu = new Contextmenu([options]);
 * 
 * 当右键事件触发时调用contextmenu.hander() 方法
 * 
 * 构造参数options{
 *  offset: {x, y}，菜单打开时的偏移量
 *  vue: vue实例，如果有，页面关闭时会自动销毁
 *  destroyClass: false 销毁时是否删除class
 * }
 */


export default class Contextmenu {
  __name = 'contextmenu';
  __styleId = 'custom-contextmenu';
  __v_skip = true;
  __options = {
    offset: {x: 0, y: 0},
  };

  constructor(options){
    Object.assign(this.__options, options);

    // 添加默认样式
    let style = document.getElementById(this.__styleId);
    if (!style) {
      let styleStr = `
        .custom-contextmenu{
          position: fixed;
          padding: 5px 0px;
          background-color: rgb(255, 255, 255);
          border-radius: 4px;
          border: 1px solid rgb(204, 217, 226);
          list-style: none;
          z-index: 100;
        }
        .custom-contextmenu > li{
          padding: 0px 10px;
          cursor: pointer;
          margin-bottom: 3px;
        }
        .custom-contextmenu > li:hover{
          background-color: #ccd9e2;
        }
      `;
      style = document.createElement('style');
      style.id = 'custom-contextmenu';
      style.innerHTML = styleStr;
      document.head.appendChild(style);
    }

    document.addEventListener('contextmenu', removeMenu);
    document.addEventListener('click', removeMenu);


    let self = this;
    if(options.vue){
      let bum = options.vue.$.bum = options.vue.$.bum || [];
      bum.push(function autoDestroy() {
        self.destroy();
      });
    }
  }


  /**
   * 处理右键菜单
   * @param {Event} event 右键事件
   * @param {Array} menus 菜单
   * {
   *   name {String} 菜单名称
   *   params {any} 点击菜单时传入回调
   *   display {Function} 控制是否显示菜单，返回false不显示
   *   click {Function} 点击菜单时的回调, 传入的参数为：params, args...
   * }
   * @param  {...any} args 其他参数
   */
  hander(event, menus, ...args) {
    window.stopBubble(event);
    removeMenu();
    let offset = this.__options.offset;
    let ul = createContextmenuList(menus, ...args);
    if (ul.childElementCount) {
      ul.style.top = event.y - offset.y + 'px';
      ul.style.left = event.x - offset.x + 'px';
      document.body.appendChild(ul);
    }
  }

  /**
   * 销毁
   */
  destroy(){
    document.removeEventListener('contextmenu', removeMenu);
    document.removeEventListener('click', removeMenu);
    if (this.__options.destroyClass){
      let style = document.getElementById(this.__styleId);
      if (style){
        style.remove();
      }
    }
  }

}

function removeMenu() {
  // 点击背景层就关闭
  let menuEls = document.body.querySelectorAll('.custom-contextmenu');
  for (let i = 0; i < menuEls.length; i++) {
    document.body.removeChild(menuEls[i]);
  }
}

function createContextmenuList(menus, ...args) {
  let ul = ElementCreate('ul', { class: 'custom-contextmenu' });
  for (let i = 0; i < menus.length; i++) {
    let menu = menus[i];
    let args0 = [...args];
    args0.unshift(menu.params);
    let display;
    if (menu.display instanceof Function) {
      display = menu.display.apply(this, args0);
    }
    if (display != false) {
      let li = ElementCreate('li', {
        event: {
          click: function () {
            if (menu.click) {
              menu.click.apply(this, args0);
            } else {
              console.warn('没有设置点击事件');
            }
          },
        }
      }, ul);
      li.innerText = menu.name;
    }
  }
  return ul;
}