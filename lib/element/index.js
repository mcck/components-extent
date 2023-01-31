// 组件
import HTableColumn from './h-table-column.vue';
import HImageUpload from './h-image-upload.vue';
import Hpageination from './h-pageination.vue';
import ImageList from './image-list.vue';

import MessageBox from './message.js'


export default {
  /**
   * @param {Object} vue 
   * @param {Object} params 上下文参数
   */
  install(vue, params) {

    vue.component('h-table-column', HTableColumn);
    vue.component('h-pageination', Hpageination);
    vue.component('h-image-upload', HImageUpload);
    vue.component('image-list', ImageList);
    vue.use(MessageBox);

  },
};