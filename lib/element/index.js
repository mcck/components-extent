// 组件
import HTableColumn from './lib/element/h-table-column.vue';
import HImageUpload from './lib/element/h-image-upload.vue';
import Hpageination from './lib/element/h-pageination.vue';
import ImageList from './lib/element/image-list.vue';

import MessageBox from './lib/element/message.js'


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