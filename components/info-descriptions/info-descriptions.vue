<!-- 详情 -->
<script>
import { h } from 'vue';
export default {
  props: {
    labelWidth: [Number, String], // label 宽度，默认文字宽度
    labelAlign: String, // label 垂直方向，默认靠左
    labelAlignVertical: String, // label水平方向，默认靠上
    col: { type: Number, default: 0 },
    columnGap: { type: String, default: '' }
  },
  render() {
    const colClass = this.col ? 'flex-col' : '';
    const colNum = this.col || 1;
    const solts = this.$slots.default();
    // 设置第一列
    for (let i = 0; i < colNum; i++) {
      let props = solts[i].props = solts[i].props || {};
      let className = props.class || '';
      className += ' ' + 'top';
      props.class = className;
    }
    // 设置中介和边上的
    if (colNum != 1) {
      solts.forEach((item, index) => {
        let props = item.props = item.props || {};

        const x = index % colNum;
        let className0;
        if (x == 0) {
          className0 = 'left';
        } else if (x == colNum - 1) {
          className0 = 'right';
        } else {
          className0 = 'center';
        }
        let className = props.class || '';
        className += ' ' + className0;
        props.class = className;
      });
    }
    return h('div', {
      class: 'info-descriptions ' + colClass,
      style: {
        '--col': this.col,
        '--column-gap': this.columnGap
      }
    }, solts);
  }
};
</script>

<style scoped>
.info-descriptions{
  --item-col: 1;
}
.flex-col{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  /* justify-content: space-between; */ /* 任务详情需要显示靠左 */
}
.flex-col>:deep(.info-descriptions-item){
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: calc(100% / var(--col));
  /* flex-basis: calc((100% / var(--col)) * var(--item-col)) - var(--column-gap); */
  margin-right: var(--column-gap);;
}

.flex-col>:deep(.info-descriptions-item).top{
  margin-top: 6px;
}
.flex-col>:deep(.info-descriptions-item).right{
  margin-right: 0;
}
</style>
