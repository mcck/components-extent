/**
 * 推荐将此工具放在最先导入
 */

/**
 * 上下文参数：
 * @param {Function} uploadFunction 上传文件时的方法
 * @param {Function} fileHashFunction 上传文件前获取文件Hash方法
 * @param {Array} authCodeList v-permission指令的权限列表
 * @param {Object} axiosInstance Axios实例
 * @param {Array} holidayCalendar 节假日
 * @param {String} uploadUrl 文件上传url，主要用在image-upload组件和upload组件
 */
const context = {};

// js
import ElTableExt from './element/el-table-ext';
import ElFormExt from './element/form-ext';
import Contextmenu from './tools/contextmenu';
import Constant from './tools/constant';

import Extend from './tools/extend';
import * as Utils from './tools/utils';
import FileUtil from './tools/FileUtil';
import DateUtil from './tools/DateUtil';
import MediaPreview from './tools/MediaPreview';
import emitter from './emitter'
import { emitterInstall } from './emitter'
import { init as HistoryStateMangeInit } from './tools/HistoryStateMange'
import ThreadPool from './tools/ThreadPool';
import MaxFileUploader from './tools/MaxFileUploader';

import TemplateApi from './api/template.api'


import PermissionDirective from './directive/permission-directive.js';
import TipsDirective from './directive/tips.js';
import DraggableDirective from './directive/draggable.js';
import ScopeDirective from './directive/scope';


import InfoDesc from './components/info-descriptions/index.js';


export {
  Utils, // 工具
  context, // 上下文
  ElTableExt, // 表格扩展
  ElFormExt, // 表单扩展
  Contextmenu, // 右键菜单
  FileUtil, // 文件工具
  emitter, // 事件工具
  TemplateApi, // Api模板
  DateUtil,
  MediaPreview, // 媒体预览
  Constant, // 常量
  // Screenshot, // 截图工具
  ThreadPool, // 线城池
  MaxFileUploader, // 大文件上传
};


export default {
  /**
   * @param {Object} vue 
   * @param {Object} params 上下文参数
   */
  install(vue, params) {
    Object.assign(context, params);
    vue.use(Extend);

    // 安装指令
    vue.use(PermissionDirective);
    vue.use(TipsDirective);
    vue.use(DraggableDirective);
    vue.use(ScopeDirective);
    vue.use(emitterInstall);
    vue.use(InfoDesc);

    if (params.initHistoryStateMange){
      HistoryStateMangeInit();
    }
  },
};