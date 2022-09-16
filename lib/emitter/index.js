import Emitter from './emitter.js';
var emitter = new Emitter();

export default emitter;

export let emitterInstall = {
  install(vue){
    vue.config.globalProperties.$emitter = emitter;
  }
}
