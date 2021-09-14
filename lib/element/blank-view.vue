<!-- 空白视图，辅助下级视图挂载 -->
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="tagNameList">
      <component class="view" :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
  name: 'blank-view',
  computed: {
    ...mapGetters(['tagNameList'])
  }
};
</script>
