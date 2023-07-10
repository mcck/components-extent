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

    emits: ['confirmAdd', 'confirmUpdate', 'confirm', 'close'],

    data() {
      return {
        api: obj.api,
        addFunc: obj.addFunc,
        updateFunc: obj.updateFunc,
        mode: null,
        // 保存后是否需要关闭
        saveClose: true,
        // coverSrc: true,
        initFormData: {  // 保存form初始化数据
        },
        emitParams: {},
        formTips: {}, // 提示信息
        form: null,
        // form: this.defaultFormInstance({}),

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
      setFormData(obj, obj2) {
        this.src = obj;
        let form = Object.assign({}, this.initFormData, obj);
        if (obj2 instanceof Function) {
          obj2(form);
        } else if (obj2) {
          Object.assign(form, obj2);
        }
        return this.form = this.watchPropertyChange(form);
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
      abstractHandleConfirm(handle) {
        let self = this;
        self.$refs.form.validate(valid => {
          if (!valid) {
            self.$message.warning(self.formTips.validateFail || '必填项不能为空！');
            return false;
          }

          if (!this.hasFormChange) {
            self.$message.warning('参数没有修改，无需保存！');
            return false;
          }
          try {
            let form = { ...self.form };
            if (self.handleConfirmBefore) {
              let result = self.handleConfirmBefore(form);
              if (result === false) { // 停止请求
                return;
              } else if (result != undefined) {
                form = result;
              }
            }

            if (typeof (handle) == 'function') {
              handle.call(self, form);
              return;
            } else if (typeof (handle) == 'string') {
              let fn = self['handle' + handle];
              if (fn) {
                fn.call(self, form);
              } else {
                throw new Error('找不到【handle' + handle + '】方法');
              }
              return;
            }

            // 判断当前是编辑还是添加
            let isEdit;
            if(self.mode){
              isEdit = self.mode == MODE.EDIT;
            } else {
              isEdit = !!self.form.id;
            }

            if (isEdit) {
              self.handleUpdate(form);
            } else {
              self.handleAdd(form);
            }
          } catch (e) {
            console.error(e);
          }
        });

      },
      handleAdd(form) {
        let self = this;
        // 获取方法
        let func;
        if (self.addFunc) {
          func = self.addFunc;
        } else if (self.api && self.api.save) {
          func = self.api.save;
          func.$self = self.api;
        }

        if (!func) {
          throw new Error('找不到获取列表的方法，请设置addFunc或设置this.api');
        }

        self.submitLoading = true;
        let formOptions = form.formOptions;
        delete form.formOptions;
        func.call(func.$self, form, formOptions).then(res => {
          self.handleAddAfter && self.handleAddAfter(res, form, self.emitParams);
          self.handleConfirmAfter && self.handleConfirmAfter(res, form);
          self.$emit('confirmAdd', res, form, self.emitParams);
          self.$emit('confirm', res);
          if (self.saveClose){
            self.visible = false;
          }
          self.hasFormChange = false;
          self.$success('添加成功');
        }).finally(() => {
          self.submitLoading = false;
        });
      },
      handleUpdate(form) {
        let self = this;

        // 获取方法
        let func;
        if (self.updateFunc) {
          func = self.updateFunc;
        } else if (self.api && self.api.update) {
          func = self.api.update;
          func.$self = self.api;
        }

        if (!func) {
          throw new Error('找不到获取列表的方法，请设置updateFunc或设置this.api');
        }

        self.submitLoading = true;
        let formOptions = form.formOptions;
        delete form.formOptions;
        func.call(func.$self, form, formOptions).then(res => {
          // if (self.coverSrc){
          //   Object.assign(self.src, form);
          // }
          let srcCopy = { ...self.src };
          self.handleUpdateAfter && self.handleUpdateAfter(form, self.form, self.emitParams);
          self.handleConfirmAfter && self.handleConfirmAfter(res, form);
          self.$emit('confirmUpdate', form, self.src, srcCopy, self.emitParams);
          self.$emit('confirm', res);
          if (self.saveClose) {
            self.visible = false;
          }
          self.hasFormChange = false;
          self.$success(self.formTips.updateTip || '修改成功');
        }).finally(() => {
          self.submitLoading = false;
        });
      },
      clearForm() {
        this.setFormData();
        this.$refs.form && this.$refs.form.resetFields();
      }
    }
  };

  // 编辑模式
  const MODE = Object.freeze({
    ADD: 0,
    EDIT: 1,
    CHECK: 2
  });
  obj.MODE = MODE;

  return obj
}

export default newInstance();