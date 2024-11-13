<!-- 图例设置 -->
<template>
  <div class="float-drawer" :class="{[props.direction]: true, close: !visible}">
    <slot :close :open></slot>
  </div>
</template>

<script setup>
import {ref} from 'vue';
const props = defineProps({
  // 'rtl' | 'ltr' | 'ttb' | 'btt'
  direction: {type: String, default: 'rtl'}
});
let visible = ref(false);

function open(){
  visible.value = true;
}

function close(){
  visible.value = false;
}

defineExpose({
  open,
  close
});

</script>

<style scoped>
</style>
<style scoped lang="less">
.float-drawer{
  z-index: 100;
  position: fixed;
  background-color: #FFF;
  transition: transform 0.3s;
  transform: translate(var(--x), var(--y));
}
// 从右到左
.float-drawer.rtl{
  top: 50%;
  right: 0;
  --x: 0;
  --y: -50%;

  &.close{
    --x: 100%;
  }
}

// 从左到右
.float-drawer.ltr{
  top: 50%;
  left: 0;
  --x: 0;
  --y: -50%;

  &.close{
    --x: -100%;
  }
}
// 从上到下
.float-drawer.ttb{
  top: 0;
  left: 50%;
  --x: -50%;
  --y: 0;

  &.close{
    --y: -100%;
  }
}

// 从下到上
.float-drawer.btt{
  bottom: 0;
  left: 50%;
  --x: -50%;
  --y: 0;

  &.close{
    --y: 100%;
  }
}
</style>
