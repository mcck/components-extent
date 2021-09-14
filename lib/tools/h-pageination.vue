<!-- 分页工具 -->
<template>
  <div class="h-pagination" :style="{textAlign: align == 'right'?'right':'left'}">
    <el-pagination
      ref="pagination" 
      :background="page.background"
      :layout="page.layout"
      :small="page.small"
      :total="page.total"
      :pager-count="pagerCount"
      :current-page="page.currentPage"
      :page-sizes="page.pageSizes"
      :popper-class="page.popperClass"
      :prev-text="page.prevText"
      :next-text="page.nextText"
      :disabled="page.disabled"
      :hide-on-single-page="page.hideOnSinglePage"
      :page-size="page.pageSize"
      @prev-click="page => $emit('prev-click', page)"
      @next-click="page => $emit('next-click', page)"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</template>

<script>
export default {
  data(){
    return {
      pagerCount: 5
    };
  },
  props: {
    'page': {
      type: Object,
      default(){
        return {};
      },
      validator: function(val){
        if(val.total == undefined || val.page == undefined || val.pageSize == undefined){
          console.error('必须存在 total, page, pageSize 属性');
          return false;
        }else{
          return true;
        }
      }
    },
    'refresh': {
      type: Function
    },
    // 单页时是否显示分页器
    'singlePageDisplay': {
      type: Boolean,
      default(){
        return false;
      }
    },
    'align': {
      type: String,
      default(){
        return 'left';
      }
    }
  },
  created(){
    let page = this.page;
    if(!page.layout){
      page.layout = 'total, sizes, prev, pager, next';
    }
    if(!page.background){
      page.background = true;
    }
    if(!page.pageSizes){
      page.pageSizes = [this.page.pageSize, 30, 50, 100];
    }
  },
  watch: {
    'page.total': function(){
      this.getPagerCount();
    }
  },
  mounted () {
    this.getPagerCount();
  },
  methods: {
    getPagerCount(){
      if(this.page.pagerCount){
        this.pagerCount = this.page.pagerCount;
      }
      // 如果没有就自动计算
      if(this.$refs.pagination){
        let width = this.$el.parentElement.clientWidth;
        if(width){ // 不等于0才继续
          // 计算
          let c = parseInt((width - 80 - 120 - 80) / 40);
          if(c > 21){
            c = 21;
          }else if(c < 5){
            c =5;
          }else{
            
            if(c % 2 == 0){
              c-=1;
            }
          }
          this.pagerCount = c;
        }
      }
    },
    handleSizeChange (pageSize) {
      // eslint-disable-next-line vue/no-mutating-props
      this.page.pageSize = pageSize;
      this.refresh && this.refresh();
      this.$emit('refresh', {pageSize, page: this.page.page});
      this.$emit('size-change', pageSize);
    },
    handleCurrentChange (page) {
      if(page){
        //this.page.page = this.page.pageSize * page - this.page.pageSize;
        // eslint-disable-next-line vue/no-mutating-props
        this.page.page = page;
        this.refresh && this.refresh();
        this.$emit('refresh', {page, pageSize: this.page.pageSize});
        this.$emit('current-change', page);
      }
    },
  }
};
</script>

<style scoped>
.h-pagination{
  padding-top: 8px;
}
</style>
