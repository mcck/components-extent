// 组件
import ImageList from './image-list.vue';

import MessageBox from './message.js'


export default {
  /**
   * @param {Object} vue 
   * @param {Object} params 上下文参数
   */
  install(vue, params) {

    vue.component('image-list', ImageList);
    vue.use(MessageBox);

  },
};