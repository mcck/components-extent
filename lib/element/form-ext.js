/**
 * form页面通用方法
 */
export function newInstance() {
  let obj = {

    api: null,
    addFunc: null,
    updateFunc: null,
    setApi(api) {
      this.api = api;
    },
    setAddFunc(func) {
      this.addFunc = func;
    },
    setUpdateFunc(func) {
      this.updateFunc = func;
    },


    data() {
      return {
        api: obj.api,
        addFunc: obj.addFunc,
        updateFunc: obj.updateFunc,

        form: this.defaultFormInstance({}),

        _initFormData: null, // 保存form初始化数据
        hasFormChange: false, // form数据是否有修改
        submitLoading: false, // 等待
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
      abstractHandleConfirm() {
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
          try {
            let from = self.form;
            if (self.handleConfirmBefore){
              from = self.handleConfirmBefore();
            }

          
            if (self.form.id) {
              self.handleUpdate(from);
            } else {
              self.handleAdd(from);
            }
          } catch(e){
            console.error(e);
          }
        });

      },
      handleAdd(from) {
        let self = this;
        // 获取方法
        let func;
        if (self.addFunc) {
          func = self.addFunc;
        } else if (self.api?.save) {
          func = self.api.save;
          func.$self = self.api;
        }

        if (!func) {
          throw new Error('找不到获取列表的方法，请设置addFunc或设置this.api');
        }

        self.submitLoading = true;
        func.call(func.$self, from).then(res => {
          self.$emit('confirmAdd', res.data);
          self.show = false;
          self.$success('添加成功');
          self.handleAddAfter && self.handleAddAfter(res.data);
        }).finally(() => {
          self.submitLoading = false;
        });
      },
      handleUpdate(from) {
        let self = this;

        // 获取方法
        let func;
        if (self.updateFunc) {
          func = self.updateFunc;
        } else if (self.api?.update) {
          func = self.api.update;
          func.$self = self.api;
        }

        if (!func) {
          throw new Error('找不到获取列表的方法，请设置updateFunc或设置this.api');
        }

        self.submitLoading = true;
        func.call(func.$self, from).then(res => {
          Object.assign(self.src, from);
          self.$emit('confirmUpdate', from);
          self.show = false;
          self.$success('修改成功');
          self.handleUpdateAfter && self.handleUpdateAfter(from);
        }).finally(() => {
          self.submitLoading = false;
        });
      },
    }
  };
  return obj
}

export default newInstance();