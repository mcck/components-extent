/**
 * 防抖
 */
export default class AntiShake{
  _timer = null;
  callback;
  delay = 200;
  context;
  constructor(fn, delay, context){
    this.callback = fn;
    if(delay){
      this.delay = delay;
    }
    this.context = context;
  }
  exec(...args){
    let self = this;
    if(self._timer){
      clearTimeout(self._timer);
      self._timer = null;
    }
    self._timer = setTimeout(()=>{
      self.callback.apply(self.context, args);
    }, self.delay);
  }
}