//全局引用message
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  /**
   * @param {Object} vue 
   * @param {Object} params 上下文参数
   */
  install(app) {
    let global =  app.config.globalProperties
    global.$message = ElMessage;
    global.$success = function (message) {
      ElMessage({ message, type: 'success' });
    };
    global.$warn = function (message) {
      ElMessage({ message, type: 'warning' });
    };
    global.$error = function (message) {
      ElMessage({ message, type: 'error' });
    };
  },
};