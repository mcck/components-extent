// 管理浏览器历史

// 监听回退
export function init() {
  window.addEventListener('popstate', handlePopstate);
  window.addEventListener('pushstate', function(){
    console.log(11);
  })
}

const events = [];
function handlePopstate(event){
  console.log("监听返回", event);
  let stopBack = false;
  events.forEach(fn=>{
    try{
      if (fn()) {
        stopBack = true;
      }
    }catch(e){
      console.log(e);
    }
  });

  if (stopBack){
    // window.history.forward(1);
  }
}

/**
 * 处理浏览器返回
 * @param {Function} fn （必须）当返回时事件监听，方法返回true时表示允许返回，否则不允许
 * @param {Object} ctx 目前支持vue对象，当vue处于销毁或远程时，移除此监听
 * @returns 
 */
export default function Backhandler(fn, ctx){
  if (!(fn instanceof Function)){
    throw new Error("参数1必须是Function");
  }

  close.fn = fn;

  if (!events.includes(fn)){
    events.push(fn);
  
    if (ctx) {
      let context = ctx;
      if (ctx.$) {
        context = { bum: ctx, da: ctx };
      }
      fn.context = context;

      close.fn = fn;

      if (context.bum) {
        const bum = context.bum.$.bum = context.bum.$.bum || [];
        bum.push(close);
      }
      if (context.da) {
        const da = context.da.$.da = context.da.$.da || [];
        da.push(close);
      }
    }
  }

  function close() {
    off(close.fn);
  }

  return close;
}

export function off(fn){
  events.remove(fn);
  let context = fn.context;
  if (context.bum) {
    const bum = context.bum.$.bum = context.bum.$.bum || [];
    bum.remove(fn);
  }
  if (context.da) {
    const da = context.da.$.da = context.da.$.da || [];
    da.remove(fn);
  }
}