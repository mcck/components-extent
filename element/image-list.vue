<!-- 图片列表 -->
<!-- 
  flexWrap: {String} 排列方式，wrap(纵向)，nowrap(横向)
  width: 列表宽度，默认100%
  height: 列表高度，默认自动
  img-width: 图片宽度，默认100px
  img-height: 图片高度，默认100px
  preview: 是否预览,默认true
  show-colse: 是否显示删除按钮
 -->
<template>
  <div class="image-list" :style="{
    'width': formatElValue(width),
    'height': formatElValue(height),
    '--img-width': formatElValue(imgWidth),
    '--img-height': formatElValue(imgHeight),
    '--flex-wrap': flexWrap
    }">
    <div v-for="file in list" :key="file.id" class="item">
      <img :src="file.src" @click="handlePreview(file)" />
      <el-icon @click="()=>$emit('close-image', file)" v-if="showColse">
        <loading v-if="file.deleteLoading" />
        <circle-close v-else />
      </el-icon>
    </div>
  </div>
</template>

<script>
import { useZIndex } from 'element-plus';
import {CircleClose, Loading} from '@element-plus/icons';
import FileUtil from '../tools/FileUtil';
import { isType, formatElValue } from '../tools/utils';
import {previewInstance} from '../tools/MediaPreview';


export default {
  components: {
    CircleClose, Loading
  },
  data () {
    return {
      useZIndex: useZIndex(),
      list: [], // 文件列表
    };
  },
  props: {
    fileList: {
      type: Array,
      required: true,
      default(){
        return [];
      }
    },
    flexWrap: {
      type: String,
      default: 'wrap'
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    height: [Number, String],
    imgWidth: {
      type: [Number, String],
      default: '100px'
    },
    imgHeight: {
      type: [Number, String],
      default: '100px'
    },
    preview: {
      type: Boolean,
      default: true,
    },
    showColse: {
      type: Boolean,
      default: true,
    }
  },
  watch: {
    fileList: {
      deep: true,
      handler(val){
        this.setList(val);
      }
    },
  },
  created () {
    this.setList(this.fileList);
  },
  methods: {
    formatElValue,
    setList(arr){
      this.list = arr.map(item=>{
        if(isType(item, String)){
          return {
            id: item,
            src: FileUtil.fileUrl(item.id)
          };
        } else {
          item.src = FileUtil.fileUrl(item.id);
          return item;
        }
      });
    },
    handlePreview(file){
      let files = this.list;
      let i = files.indexOf(file);
      if(i != -1){
        let srcs = files.map(item=>{
          let media = {
            src: item.src,
            type: 'image'
          };
          if(item.contentType){
            media.type = item.contentType.substr(0, item.contentType.indexOf('/'));
          }
          return media;
        });
        previewInstance.zIndex(this.useZIndex.nextZIndex());
        previewInstance.setMedia(srcs);
        previewInstance.show(i);
      }
    }
  }
};
</script>

<style scoped>
.image-list{
  display: flex;
  flex-wrap: var(--flex-wrap);
  overflow: auto;
}
.image-list>.item{
  margin: 5px;
  width: var(--img-width);
  height: var(--img-height);
  position: relative;
  flex: none;
}
.image-list>.item>img{
  width: 100%;
  height: 100%;
  cursor: pointer;
  object-fit: cover;
}
.image-list>.item>.el-icon{
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  color: #c8c8c8;
  font-size: 20px;
}
</style>
