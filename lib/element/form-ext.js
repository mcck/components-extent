/**
 * form页面通用方法
 */
export function newInstance() {
  let obj = {
    data() {
      return {
        _initFormData: null, // 保存form初始化数据
        hasFormChange: false, // form数据是否有修改
      };
    },
    methods: {
      /**
       * 获取表单数据实例
       * 该方法会吧第一次调用的数据作为初始化参数
       * @param {Object} obj form初始化数据 
       * @returns 
       */
      defaultFormInstance(obj) {
        if (!this._initFormData) {
          this._initFormData = { ...obj };
        }
        // return this.watchPropertyChange(Object.assign(obj, { ...this._initFormData, ...obj}));
        return this.watchPropertyChange(Object.assign({ ...this._initFormData, ...obj }));
      },
      /**
       * 监听对象属性改变
       */
      watchPropertyChange(obj = {}) {
        let self = this;
        self.hasFormChange = false;
        return new Proxy(obj, {
          set(target, key, value, receiver) {
            self.hasFormChange = true;
            // console.info(target, key, value);
            return Reflect.set(target, key, value, receiver);
          },
          // get(target, key){
          //   return target[key];
          // }
        });
      },
      abstractHandleConfirm(op) {
        let self = this;
        self.$refs.form.validate(valid => {
          if (!valid) {
            self.$message.warning('必填项不能为空！');
            return false;
          }

          if (!this.hasFormChange) {
            self.$message.warning('参数没有修改，无需保存！');
            return false;
          }

          self[op.confirmButton || 'confirmButtonLoading'] = true;
          if (self.form.id) {
            let handleUpdate = op.update || self.handleUpdate;
            handleUpdate();
          } else {
            let handleAdd = op.add || self.handleAdd;
            handleAdd();
          }
        });
      },
    }
  };
  return obj
}

export default newInstance();