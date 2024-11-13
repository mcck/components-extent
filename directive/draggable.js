/**
 * 可以让任意一个元素移动
 * 
 * options 可以配置以下类型
 * Boolean 是否允许推动，默认true 允许
 * 
 * String 鼠标按下时元素的css
 * 
 * Function 有任何动作时执行，(鼠标按下, 移动，抬起)
 * 
 * Object 对象配置
 * {
 *   drag {Boolean} 是否允许推动，默认true 允许
 *   ctrlKey {Boolean} 是否需要按住Ctrl键才推动，默认false不需要
 *   overflow {Boolean} 是否允许拖出窗口, 默认false不允许
 *   class {String} 鼠标按下时的class
 *   ondown {Function} 鼠标按下回调
 *   onmove {Function} 鼠标移动回调
 *   onup {Function} 鼠标抬起回调
 * }
 * 
 */

let context = null;

function buildParams(binding){
  let options = {
    drag: true,
    ctrlKey: false,
    overflow: true
  };
  let type = typeof (binding.value);
  if (type == 'boolean'){
    options.drag = binding.value;
  } else if (type == 'string'){
    options.class = binding.value;
  } else if (type == 'function'){
    options.ondown = binding.value;
    options.onmove = binding.value;
    options.onup = binding.value;
  } else if (type == 'object') {
    Object.assign(options, binding.value);
  }
  options.instance = binding.instance;
  return options;
}

function handleMousemove(e){
  window.stopBubble(e);
  
  let options = context._vdraggable;
  if (options.onup) {
    let res = options.onup.call(options.instance, 'move', e);
    if (res == false){
      return;
    }
  }
  let pos = options.pos;
  let x = e.clientX - pos.startX;
  let y = e.clientY - pos.startY;
  if (!(x + y)){ // 没有移动
    return;
  }

  if (!options.overflow) { // 不允许拖出边界
    let rect = pos.rect;
    // 检查是否在最上
    if (y < 0 && rect.top+y < 0) return;
    
    if (y > 0 && rect.bottom+y > innerHeight) return;

    if (x < 0 && rect.left+x < 0) return;

    if (x > 0 && rect.right+x > innerWidth) return;
  }


  // 开始拖动
  pos.endX = x + pos.currX;
  pos.endY = y + pos.currY;
  

  context.style.transform = 'translate(' + pos.endX + 'px, ' + pos.endY +'px)';
}

function handleMouseup(e) {
  window.stopBubble(e);
  document.removeEventListener('mousemove', handleMousemove);
  document.removeEventListener('mouseup', handleMouseup);
  let options = context._vdraggable;
  if (options.class) {
    context.classList.remove(options.class);
  }
  if (options.onup) {
    options.onup.call(options.instance, 'up', e);
  }
  context.style.userSelect = options.userSelect;

  options.pos.currX = options.pos.endX;
  options.pos.currY = options.pos.endY;
}

export default {
  install(vue) {
    vue.directive('draggable', {
      // 当被绑定的元素挂载到 DOM 中时
      created(el, binding) {
        let options = el._vdraggable = buildParams(binding);
        
        el.addEventListener('mousedown', (e)=>{
          window.stopBubble(e);
          if (options.drag){
            if (options.ctrlKey && !e.ctrlKey){
              return;
            }
            context = el;
            document.addEventListener('mousemove', handleMousemove);
            document.addEventListener('mouseup', handleMouseup);
            // 添加禁止选中样式
            options.userSelect = el.style.userSelect;
            el.style.userSelect = 'none';

            if (options.class){
              el.classList.add(options.class);
            }
            if (options.ondown){
              options.ondown.call(binding.instance, 'down', e);
            }

            // 记录鼠标当前位置
            let pos = options.pos || {};
            let matrix = getComputedStyle(el).transform;
            if (matrix.startsWith('matrix')){
              // eslint-disable-next-line no-undef
              matrix = new WebKitCSSMatrix(matrix);
            } else {
              matrix = {e: 0, f: 0};
            }
            options.pos = {
              rect: context.getBoundingClientRect(),
              currX: pos.currX || 0,
              currY: pos.currY || 0,
              startX: e.clientX,
              startY: e.clientY,
              endX: matrix.e,
              endY: matrix.f
            };
          }
        });
      },
      updated(el, binding) {
        let opt = buildParams(binding);
        Object.assign(el._vdraggable, opt);
      },
      // 卸载时移除事件
      unmounted(){
        context = null;
        document.removeEventListener('mousemove', handleMousemove);
        document.removeEventListener('mouseup', handleMouseup);
      }
    });
  },
};
