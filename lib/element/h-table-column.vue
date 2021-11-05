<!-- 扩展el-table-column -->
<!--
扩展属性：
  copy：添加单元格复制按钮，点击直接复制单元格内容
  formatter：重写formatter功能，用法一样
  details：添加单元格文字样式，点击后弹窗查看详情内容
-->
<template>
  <el-table-column ref="coll" :type="type" :index="index" :column-key="columnKey" :label="label" :prop="prop" :width="width" :min-width="minWidth" :fixed="fixed"
                   :render-header="renderHeader" :sortable="sortable" :sort-method="sortMethod" :sort-by="sortBy" :sort-orders="sortOrders" :resizable="resizable"
                   :show-overflow-tooltip="showOverflowTooltip" :align="align" :header-align="headerAlign" :class-name="className" :label-class-name="labelClassName"
                   :selectable="selectable" :reserve-selection="reserveSelection" :filters="filters" :filter-placement="filterPlacement" :filter-multiple="filterMultiple"
                   :filter-method="filterMethod" :filtered-value="filteredValue">
    <template #default="scope">
      <slot :store="scope.store" :_self="scope._self" :column="scope.column" :row="scope.row" :$index="scope.$index">
        <div class="custom-call" :v="(val=colValue(scope)) && ''">
          <!-- 复制图标 -->
          <i v-if="isValue(copy) && scope.row[scope.column.property]" class="copy-icon el-icon-document-copy" @click="handleCopy($event, scope)" title="点击复制"></i>

          <el-popover v-if="popover && val" placement="left" popper-class="h-table-popover" :trigger="popover.trigger" :width="popover.style?.width">
            <!-- <textarea class="h-table-popover" :value="colValue(scope)"></textarea> -->
            <div :style="popover.style" :class="popover.class">{{colValue(scope)}}</div>
            <template #reference>
              <span :ref="'carrier'+ scope.$index" style="cursor: pointer;">{{val}}</span>
            </template>
          </el-popover>

          <!-- 显示内容 -->
          <div v-else ref="content" class="call-text" :style="{cursor:isEvent()?'pointer':''}" @click="handleEvent($event, scope)" :title="val">{{val}}</div>
        </div>
      </slot>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'h-table-column',
  data() {
    return {
      mode: 0,
      detailsEvent: {
        click: ['details'], // 设置哪些属性有点击事件，做出对应的样式和调用方法
      },
      popover: false,
    };
  },
  created() {
    this.detailsConfig();
  },
  props: [
    'type', 'index', 'column-key', 'label', 'prop', 'width', 'minWidth', 'fixed', 'render-header', 'sortable', 'sort-method', 'sort-by', 'sort-orders', 'resizable',
    'show-overflow-tooltip', 'align', 'header-align', 'class-name', 'label-class-name', 'selectable', 'reserve-selection', 'filters', 'filter-placement', 'filter-multiple',
    'filter-method', 'filtered-value',
    'copy', // 添加复制按钮
    'formatter', // 重写formatter功能
    'details' // 单机弹窗查看详情
  ],
  methods: {
    colValue(scope) {
      let val = scope.row[scope.column.property];
      if (this.formatter instanceof Function) {
        // this.formatter.call(scope._self, scope.row, scope.column, val, scope.$index);
        val = this.formatter(scope.row, scope.column, val, scope.$index);
      }
      return scope.column.currentValue = val;
    },
    /**
     * 是否有事件
     */
    isEvent() {
      for (let e in this.detailsEvent) {
        for (let i = -0; i < this.detailsEvent[e].length; i++) {
          if (this[this.detailsEvent[e][i]] != undefined) {
            return true;
          }
        }
      }
      return false;
    },
    isValue(v) {
      return v != undefined && v != null && v !== false;
    },
    handleEvent(event, scope) {
      debugger
      let self = this;
      self.detailsEvent[event.type].forEach((eventName) => {
        if (self[eventName] != undefined) {
          self['exec_' + eventName](event, scope, eventName);
        }
      });
    },
    exec_details(event, scope) {
      this.$refs['carrier'+ scope.$index].click();
      // var mouseClick = document.createEvent('MouseEvent');
      // mouseClick.initMouseEvent(event.type, false, false, null);
      // this.$refs['carrier'+ scope.$index].dispatchEvent(mouseClick);
    },
    handleCopy(event, scope) {
      // 切换图标
      let i = event.srcElement;
      i.classList.replace('el-icon-document-copy', 'el-icon-check');
      setTimeout(() => {
        i.classList.replace('el-icon-check', 'el-icon-document-copy');
      }, 1500);
      window.copyToClip(scope.column.currentValue);
    },
    detailsConfig(){
      let self = this;
      if(!self.isValue(self.details)){
        self.popover = false;
        return;
      }
      self.popover = {
        placement: 'left',
        class: 'h-table-popover-text',
        trigger: 'click',
        ...self.details
      };
    }
  }
};

</script>

<style scoped>
.copy-icon{
  cursor: pointer;
  font-size: 16px;
  vertical-align: middle;
  margin-left: 5px;
  color: #1E9FFF;
}
.copy-icon.el-icon-check{
  color: green;
}
.custom-call{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
}
.call-text{
  display: initial;
}
.h-table-popover-text{
  width: 100%;
  max-height: 400px;
  max-width: 500px;
  white-space: pre;
  overflow: auto;
}
</style>
<style>
.h-table-popover{
  width: auto !important;
}
</style>