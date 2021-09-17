//全局引用message
import { ElMessage } from 'element-plus';

export default {
  /**
   * @param {Object} vue 
   * @param {Object} params 上下文参数
   */
  install(app) {
    app.config.globalProperties.$message = ElMessage;
    app.config.globalProperties.$success = function (message) {
      ElMessage.success({ message, type: 'success' });
    };
    app.config.globalProperties.$warn = function (message) {
      ElMessage.success({ message, type: 'warning' });
    };
  },
};