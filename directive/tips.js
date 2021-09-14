import { ElementCreate } from  '../element/contextmenu';

export default {
  install(vue) {
    vue.directive('tips', {
      // 当被绑定的元素挂载到 DOM 中时……
      updated(el, binding) {
        tips(el, binding);
      },
      mounted(el, binding) {
        tips(el, binding);
      },
      unmounted(el) {
        close(el);
      }
    });
  },
};


function options(val){
  let op = {};
  if (typeof (val) == 'boolean'){
    op.visible = val;
    op.message = '错误';
  } else {
    Object.assign(op, val);
  }
  return op;
}

// 添加提示
function tips(el, binding){
  let val = options(binding.value);
  let oldVal = options(binding.oldValue);
  if (val.visible != oldVal.visible){
    if (!val.visible){
      close(el);
      return;
    }

    let tipsEl = ElementCreate('div', { class: 'ht-tips-mask' });
    let textEl = ElementCreate('div', { class: 'ht-tips-spinner' }, tipsEl);

    textEl.innerText = val.message;

    el.classList.add('hyj-tips-parent--relative');
    el.appendChild(tipsEl);
  }
}

function close(el){
  let mask = el.querySelector('.ht-tips-mask');
  if (mask){
    el.removeChild(mask);
  }
  el.classList.remove('hyj-tips-parent--relative');
}


function init(){
  // 添加全局class
  let style = document.getElementById('tips-default-style');
  if (!style) {
    let css = `
    .hyj-tips-parent--relative {
      position: relative!important;
    }
    .ht-tips-mask {
      position: absolute;
      z-index: 2002;
      background-color: rgba(0, 0, 0, 0.85);
      margin: 0;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      -webkit-transition: opacity .3s;
      transition: opacity .3s;
    }
    .ht-tips-spinner {
      color: #FFF;
      top: 50%;
      margin-top: -21px;
      width: 100%;
      text-align: center;
      position: absolute;
    }
    `;
    style = document.createElement('style');
    style.id = 'tips-default-style';
    style.innerHTML = css;
    document.head.appendChild(style);
  }

}

init();