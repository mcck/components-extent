import { ElementCreate } from '../tools/extend.js';

let contextmenu = {
  name: 'contextmenu',
  handerContextmenu,
};

document.addEventListener('contextmenu', removeMenu);
document.addEventListener('click', removeMenu);
function removeMenu() {
  // 点击背景层就关闭
  let menuEls = document.body.querySelectorAll('.custom-contextmenu');
  for (let i = 0; i < menuEls.length; i++) {
    document.body.removeChild(menuEls[i]);
  }
}

// 添加默认样式
let style = document.getElementById('custom-contextmenu');
if (!style){
  let styleStr = `
    .custom-contextmenu{
      position: fixed;
      padding: 5px 0px;
      background-color: rgb(255, 255, 255);
      border-radius: 4px;
      border: 1px solid rgb(204, 217, 226);
      list-style: none;
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
export function handerContextmenu(event, menus, ...args){
  window.stopBubble(event);
  removeMenu();
  let ul = createContextmenuList(menus, ...args);
  if (ul.childElementCount){
    ul.style.top = event.y + 'px';
    ul.style.left = event.x + 'px';
    document.body.appendChild(ul);
  }
}

function createContextmenuList(menus, ...args){
  let ul = ElementCreate('ul', { class: 'custom-contextmenu' });
  for (let i = 0; i < menus.length; i++) {
    let menu = menus[i];
    let args0 = [...args];
    args0.unshift(menu.params);
    let display;
    if (menu.display instanceof Function){
      display = menu.display.apply(this, args0);
    }
    if (display != false){
      let li = ElementCreate('li', {
        event: {
          click: function () {
            if (menu.click) {
              menu.click.apply(this, args0);
            }
          },
        }
      }, ul);
      li.innerText = menu.name ;
    }
  }
  return ul;
}

export default contextmenu;