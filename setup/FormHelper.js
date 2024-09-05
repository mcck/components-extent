import { onMounted, ref, getCurrentInstance } from 'vue';
import { FormMode } from '../tools/constant'
import { hasNotValue } from '../tools/utils';
import { context } from '../index';

/**
 * 表单助手
 * 提供提交表单公共方法
 */
export default new Proxy(class FormHelper{

  options={
    isValidateForm: true,
    mode: FormMode.ADD
  }

  api = {
    context: null,
  }; //Api

  form = ref({}); // 编辑的对象
  submitLoading = ref(false);
  _watchState = 0;
  _hasFormChange = ref(false);

  refs = {}; // 节点

  constructor(options){
    let self = this;
    self.setOptions(options)

    if (hasNotValue(this.options.mode)) {
      this.options.mode = FormMode.ADD;
    }

    onMounted(() => {
      let ins = getCurrentInstance();
      self.refs = ins.ctx.$refs;
    })
  }

  setFormData(form={}){
    if (this._watchState == 0){
      this.form.value = form;
    } else if (this._watchState == 1) {
      this.form.value = this._watchPropertyChange(form);
    }
    
    if (hasNotValue(this.options.mode)) {
      this.options.mode = hasNotValue(form.id) ? FormMode.ADD : FormMode.EDIT;
    }

    return this.form;
  }

  setOptions(options){
    let self = this;
    self.options = Object.assign(self.options, options);

    if (options.api){
      self.api.context = options.api;
      self.api.update = options.api.update;
      self.api.save = options.api.save;
    }

    // 验证
    self.validateFormFuncs = toFunctionArray(self.options.validateForm);
    // 确认之前
    self.onConfirmBeforeFuncs = toFunctionArray(self.options.onConfirmBefore);
    // 添加之后
    self.onAddAfterFuncs = toFunctionArray(self.options.onAddAfter);
    // 更新之后
    self.onUpdateAfterFuncs = toFunctionArray(self.options.onUpdateAfter);
    // 提交之后
    self.onSubmitAfterFuncs = toFunctionArray(self.options.onSubmitAfter);

  }

  onValidateForm(func) {
    this.validateFormFuncs.push(func);
  }
  onConfirmBefore(func) {
    this.onConfirmBeforeFuncs.push(func);
  }
  onAddAfter(func) {
    this.onAddAfterFuncs.push(func);
  }
  onUpdateAfter(func) {
    this.onUpdateAfterFuncs.push(func);
  }
  onSubmitAfter(func) {
    this.onSubmitAfterFuncs.push(func);
  }

  get hasFormChange(){
    this._watchState = 1;
    return this._hasFormChange;
  }
  _watchPropertyChange(obj = {}) {
    let self = this;
    self._hasFormChange.value = false;
    return new Proxy(obj, {
      set(target, key, value, receiver) {
        self._hasFormChange.value = true;
        return Reflect.set(target, key, value, receiver);
      },
    });
  }

  handleConfirm(){
    let self = this;

    if (self.options.mode == FormMode.CHECK){
      console.warn('当前为查看模式');
      return;
    }

    let config = {
      mode: self.options.mode,
      continue: true, // 是否继续请求
      form: { ...self.form.value }, //表单数据
      formOptions: {},
      handler: null
    };

    if (self.options.isValidateForm){
      self._execFunctionCallback(self.validateFormFuncs, config, true).then(conf => {
        if (conf.continue){
          if (conf.hasFunc){
            self._handleConfirm(config)
          } else {
            self.refs.formRef.validate(valid => {
              if (valid) self._handleConfirm(config);
            });
          }
        };
      });

    } else {
      self._handleConfirm(config);
    }
  }

  _execFunctionCallback(funcs, config = {}, execAll) {
    if (!(funcs.length)) {
      config.hasFunc = false;
      return Promise.resolve(config);
    }

    config.hasFunc = true;
    return new Promise((resolve) => {
      let i = -1;
      function next() {
        i += 1;
        if (i == funcs.length) {
          resolve(config);
          return;
        }
        let res = funcs[i](config);
        if (res instanceof Promise) {
          res.then(conf => {
            if (conf) Object.assign(config, conf);
            isNext();
          });
        } else if (res) {
          Object.assign(config, res);
          isNext();
        } else {
          isNext();
        }

      }

      function isNext() {
        if (execAll || config.continue) {
          next();
        } else {
          resolve(config);
        }
      }

      next();
    });
  }

  _handleConfirm(conf){
    let self = this;

    self._execFunctionCallback(self.onConfirmBeforeFuncs, conf).then(config => {
      
      if (config.continue === false) { // 停止请求
        return;
      }
  
      if(config.mode === FormMode.ADD) {
        self.handleAdd(config);
      } else if (config.mode === FormMode.EDIT) {
        self.handleUpdate(config);
      } else {
        throw new Error("必须设置模式")
      }
    });

  }

  handleAdd(config){
    let self = this;

    // 获取方法
    let handler = config.handler;
    if (!handler){
      handler = self.api.save;
    }

    if (!handler) {
      throw new Error('找不到保存的的方法，请设置{options.api.save}');
    }

    self.submitLoading.value = true;

    handler.call(self.api.context, config.form, config.formOptions).then(res => {
      self._execFunctionCallback(self.onAddAfterFuncs, { res, form: config.form, params: self.emitParams});
      self._execFunctionCallback(self.onSubmitAfterFuncs, { res, form: config.form });

      // self.$emit('confirmAdd', res, form, self.emitParams);
      // self.$emit('confirm', res);
      self.hasFormChange.value = false;
      context().message.alert({
        message: '添加成功',
        type: 'success',
      });
    }).finally(() => {
      self.submitLoading.value = false;
    });
  }

  handleUpdate(config){
    let self = this;

    // 获取方法
    let handler = config.handler;
    if (!handler) {
      handler = self.api.update;
    }

    if (!handler) {
      throw new Error('找不到保存的的方法，请设置{options.api.update}');
    }

    self.submitLoading.value = true;

    handler.call(self.api.context, config.form, config.formOptions).then(res => {
      self._execFunctionCallback(self.onUpdateAfterFuncs, { res, form: config.form, params: self.emitParams });
      self._execFunctionCallback(self.onSubmitAfterFuncs, { res, form: config.form });

      // self.$emit('confirmAdd', res, form, self.emitParams);
      // self.$emit('confirm', res);
      self.hasFormChange.value = false;
      context().message.alert({
        message: '更新成功',
        type: 'success',
      });
    }).finally(() => {
      self.submitLoading.value = false;
    });
  }

  clearForm() {
    this.setFormData({});
    this.refs.formRef && this.refs.formRef.resetFields();
  }

  isAdd(){
    return this.options.mode == FormMode.ADD;
  }
  isEdit(){
    return this.options.mode == FormMode.EDIT;
  }
  isCheck(){
    return this.options.mode == FormMode.CHECK;
  }

  formChange(){
    this._hasFormChange.value = true;
  }
}, 
// 代理构造器
{
  construct(target, args, proxy){
    return new Proxy(new target(...args), {
      get(target, propKey, receiver){
        let val = target[propKey];
        if (val instanceof Function){
          return function(...arg){
            return val.apply(target, arg);
          };
        } else {
          return val;
        }
      }
    });
  }
})


function toFunctionArray(func){
  if(!func){
    return [];
  } else if (func instanceof Function) {
    return [func];
  } else if (func instanceof Array) {
    return func;
  }
}