<!-- 图片上传 -->
<template>
    <el-upload
      class="h-image-upload"
      action=""
      :show-file-list="false"
      :accept="accept"
      :http-request="upload"
      :style="{width: width+'px', height: height+'px'}"
      :disabled="loading"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <!-- <el-image v-if="imageUrl" class="avatar" :src="imageUrl" :preview-src-list="[imageUrl]"></el-image> -->
      <i v-else class="avatar-uploader-icon" :class="loading?'el-icon-loading': 'el-icon-plus'" :style="{width: width+'px', height: height+'px', 'line-height': height+'px'}"></i>

      <!-- 操作按钮 -->
      <i v-show="imageUrl" v-if="button.includes('viewer')" class="option-icon el-icon-view" @click="clickViewIcon" title="查看"></i>
      <i v-show="imageUrl" v-if="button.includes('remove')" class="option-icon el-icon-circle-close" @click="clickRemoveIcon" title="删除"></i>

      
      <el-image-viewer v-if="showViewer" :url-list="[imageUrl]" @close="closeViwer" @click="stopBubble"></el-image-viewer>
    </el-upload>
</template>

<script>

import FileUtil from '../tools/FileUtil.js';

export default {
  data () {
    return {
      imageUrl: '',
      loading: false,
      showViewer: false,
    };
  },
  
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 150
    },
    height: {
      type: Number,
      default: 150
    },
    accept: {
      type: String,
      default: '.jpg,.jpeg,.png,.gif'
    },
    button: {
      type: Array,
      default(){
        return ['remove', 'viewer'];
      }
    },
    viewer: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    modelValue (newValue) {
      this.imageUrl = FileUtil.fileUrl(newValue);
    },
  },
  mounted(){
    this.initSize();
  },
  methods: {
    upload(up){
      let self = this;
      self.loading = true;
      FileUtil.upload(up.file).then(res => {
        let file = FileUtil.file(res);
        self.imageUrl = FileUtil.fileUrl(file);
        self.$emit('update:modelValue', file);
      }).finally(() => {
        self.loading = false;
      });
    },
    initSize(){
      let el = this.$el.querySelector('.el-upload');
      el.style.width = this.width + 'px';
      el.style.height = this.height + 'px';
    },
    stopBubble: window.stopBubble,
    clickRemoveIcon(e){
      this.stopBubble(e);
      this.imageUrl = '';
    },
    clickViewIcon(e){
      this.stopBubble(e);
      if(this.viewer){
        this.showViewer = true;
      } else {
        this.$emit('viewer', this.imageUrl);
      }
    },
    closeViwer(){
      this.showViewer = false;
    }
  }
};
</script>

<style scoped>
.h-image-upload{
  display: inline-block;
}
.h-image-upload /deep/ .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-align: center;
  vertical-align: middle;
  height: 100%;
  display: table-cell;
}
.h-image-upload /deep/.el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
.avatar {
  display: block;
  max-height: 100%;
  max-width: 100%;
  vertical-align: middle;
  margin: auto;
}
.option-icon{
  position: absolute;
  top: 0;
  right: 0;
  font-size: 18px;
  display: none;
}

.el-icon-view{
  right: 20px;
}
.el-icon-view:hover{
  color: #409EFF;
}


.h-image-upload:hover .option-icon{
  display: inline-block;
}

.el-icon-circle-close:hover{
  color: red;
}
</style>
