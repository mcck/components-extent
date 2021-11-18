<!-- 扩展el-table-column -->
<!--
扩展属性：
  copy：添加单元格复制按钮，点击直接复制单元格内容
  formatter：重写formatter功能，用法一样
  details：添加单元格文字样式，点击后弹窗查看详情内容
-->
<template>
  <el-table-column ref="root" :show-overflow-tooltip="false">
    <template #default="scope">
      <slot :store="scope.store" :_self="scope._self" :column="scope.column" :row="scope.row" :$index="scope.$index">
          <!-- 复制图标 -->
        <i v-if="isValue(copy) && scope.row[scope.column.property]" class="copy-icon el-icon-document-copy" @click="handleCopy($event, scope)" title="点击复制"></i>
        <div class="custom-call" :i="initColumn(scope)"
          :style="style"
          @mouseover="handleMouseoverEvent($event, scope)"
          @mouseout="handleMouseoutEvent($event, scope)"
          v-text="colValue(scope)">
        </div>
      </slot>
    </template>
  </el-table-column>
</template>

<script>

import {createPopper} from '@popperjs/core';

export default {
  name: 'h-table-column',
  data() {
    return {
      style: {
        // cursor: this.isEvent()?'pointer':''
      },
      tooltip: false
    };
  },
  props: [
    'copy', // 添加复制按钮
    'formatter', // 重写formatter功能
    'show-overflow-tooltip', // 重写 show-overflow-tooltip 的功能
  ],
  created() {
    this.setTooltip(this.showOverflowTooltip);
  },
  methods: {
    initColumn(scope){
      let id = scope.column.id;
      let cols = scope._self.refs.bodyWrapper.querySelectorAll('.'+id);
      // console.log(id);
      if(cols){
        cols.forEach(item => {
          item.style.width = scope.column.realWidth+ "px";
        });
      }
    },
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
    setTooltip(val){
      if(!this.isValue(val)){
        this.tooltip = false;
      } else {
        this.tooltip = {
          ...this.showOverflowTooltip
        };
      }
    },
    handleMouseoverEvent(event, scope) {
      let self = this;
      if(self.tooltip != false){
        self.showPopper(event, scope);
      }
    },
    showPopper(event, scope){
      let self = this;
      let popperInstance = scope.popperInstance;
      if(popperInstance){
        popperInstance.update();
        document.body.appendChild(popperInstance.state.elements.popper);
        return;
      }

      // 创建提示
      function renderContent(){
        let div = document.createElement('div');
        div.setAttribute(self.$options.__scopeId, '')
        div.className = 'el-popper h-table-popper';

        let div2 = document.createElement('div');
        div2.className = 'h-table-popper__content'
        // div2.innerText = event.srcElement.innerText;
        div2.innerText = self.colValue(scope);

        div.appendChild(div2);

        let tooltip = self.tooltip;
        let style = div.style;
        style.setProperty('--h-table-popper-color', tooltip.color||'');
        style.setProperty('--h-table-popper-text-color', tooltip.textColor||'');
        style.setProperty('--h-table-popper-border-color', tooltip.borderColor||'');
        Object.assign(div.style, tooltip.style);
        
        return div;
      }

      function renderArrow() {
        const arrow2 = document.createElement("div");
        arrow2.className = "el-popper__arrow";
        return arrow2;
      }

      let content = renderContent();
      let arrow = renderArrow();

      content.appendChild(arrow);
      document.body.appendChild(content);
      popperInstance = scope.popperInstance = createPopper(event.srcElement, content, {
        modifiers: [
          {name: "offset", options: { offset: [0, 8] } },
          {name: "arrow", options: { element: arrow, padding: 10 }}
        ],
        placement: "left",
        strategy: "fixed",
        ...self.tooltip
      });
    },
    handleMouseoutEvent(event, scope){

      if(scope.popperInstance){
        document.body.removeChild(scope.popperInstance.state.elements.popper);
      }

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
  }
};

const getCell = function(event) {
  let cell = event.target;
  while (cell && cell.tagName.toUpperCase() !== "HTML") {
    if (cell.tagName.toUpperCase() === "TD") {
      return cell;
    }
    cell = cell.parentNode;
  }
  return null;
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
.h-table-popover-text{
  width: 100%;
  max-height: 400px;
  max-width: 500px;
  white-space: pre;
  overflow: auto;
}

.h-table-popper{
  --h-table-popper-color: #FFF;
  --h-table-popper-text-color: #000;
  --h-table-popper-border-color: #000;

  max-width: 300px;
  padding: 0;
  white-space: pre-wrap;
  color: var(--h-table-popper-text-color);
  background-color: var(--h-table-popper-color);
  border: 1px solid var(--h-table-popper-border-color);
}
.h-table-popper :deep >.h-table-popper__content{
  padding: 10px;
  border-radius: var(--el-popper-border-radius);
  background-color: var(--h-table-popper-color);
}
.h-table-popper :deep >.el-popper__arrow::before{
  background-color: var(--h-table-popper-color);
  border: 1px solid var(--h-table-popper-border-color);
}

</style>
<style>
</style>