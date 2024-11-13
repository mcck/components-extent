// 组件
import ImageList from './image-list.vue';

export default {
  /**
   * @param {Object} vue 
   * @param {Object} params 上下文参数
   */
  install(vue, /* params */) {

    vue.component('image-list', ImageList);

  },
};