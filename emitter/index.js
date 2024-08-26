import MessageChain from '../class/MessageChain.js'

var emitter = new MessageChain({
  registerHandler(config, remove){
    if (config.vue){
      let bum = config.vue.bum = config.vue.bum || [];
      bum.push(remove);
    }
  }
});

export default emitter;

export let emitterInstall = {
  install(vue){
    vue.config.globalProperties.$emitter = emitter;
  }
}
