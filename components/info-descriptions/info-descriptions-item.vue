<!-- 详情 -->
<template>
  <div class="info-descriptions-item" :style="{'--align-items': labelAlignVertical_, '--item-col': itemCol || null}" >
    <div class="info-descriptions-item-label" :style="{width: labelWidth_, textAlign: labelAlign_}">{{label}}</div>
    <div class="info-descriptions-item-body" :style="{'--row': ellipsisRow}" :class="{'multiline-ellipsis': ellipsisRow}"><slot /></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // labelWidth_: '',
    };
  },
  props: {
    label: String,
    labelWidth: [Number, String],
    labelAlign: String,
    labelAlignVertical: String,
    itemCol: Number,
    ellipsisRow: Number
  },
  computed: {
    labelWidth_() {
      const labelWidth = this.labelWidth || this.$parent.labelWidth;
      return typeof (labelWidth) == 'number' ? labelWidth + 'px' : labelWidth;
    },
    labelAlign_() {
      return this.labelAlign || this.$parent.labelAlign || '';
    },
    labelAlignVertical_() {
      return this.labelAlignVertical || this.$parent.labelAlignVertical || '';
    }
  }
};
</script>

<style scoped>
.info-descriptions-item{
  display: flex;
  align-items: var(--align-items);
  margin: 6px 0;
  margin-top: 15px;

  word-wrap: break-word;
  word-break: break-all;
}

.info-descriptions-item-label{
  margin-right: 10px;
  flex: none;
}
.info-descriptions-item-body{
  flex: auto;
}
</style>
