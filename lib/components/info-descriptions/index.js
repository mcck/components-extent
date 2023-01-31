
import Desc from './info-descriptions.vue';
import DescItem from './info-descriptions-item.vue';
export default {
  install(vue) {
    vue.component('info-descriptions', Desc);
    vue.component('info-descriptions-item', DescItem);
  }
};
