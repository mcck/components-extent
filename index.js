
let context = {};

import HTableColumn from './element/h-table-column';
import HImageUpload from './element/h-image-upload.vue';
import Hpageination from './tools/h-pageination.vue';

import PermissionDirective from './directive/permission-directive.js';


export default {
  context,
  install(params) {
    context = params;
    let vue = params.vue;
    vue.component('h-table-column', HTableColumn);
    vue.component('h-pageination', Hpageination);
    vue.component('h-image-upload', HImageUpload);

    // 安装指令
    vue.use(PermissionDirective);
    vue.use(require('./directive/tips.js').default);
  },
};