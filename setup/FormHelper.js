import { onMounted, ref, getCurrentInstance } from 'vue';
import { FormMode } from '../tools/constant'
import { hasNotValue } from '../tools/utils';
import { context } from '../index';

/**
 * 表单助手
 * 提供提交表单公共方法
 */
export default class FormHelper{

  api = {
    context: null,
  }; //Api

  form = ref({}); // 编辑的对象
  submitLoading = ref(false);
  #watchState = 0;
  #hasFormChange = ref(false);

  refs = {}; // 节点

  constructor(options){
    let self = this;
    self.options = Object.assign({
      isValidateForm: true,
    }, options);

    self.api.context = self.options.api;
    self.api.update = self.options.api.update;
    self.api.save = self.options.api.save;


    onMounted(() => {
      let ins = getCurrentInstance();
      self.refs = ins.ctx.$refs;
    })

  }

  setFormData(form){
    if (this.#watchState == 0){
      this.form.value = form;
    } else if (this.#watchState == 1) {
      this.form.value = this.#watchPropertyChange(form);
    }

    if (hasNotValue(this.options.mode)) {
      this.options.mode = hasNotValue(form.id) ? FormMode.ADD : FormMode.EDIT;
    }
  }

  get hasFormChange(){
    this.#watchState = 1;
    return this.#hasFormChange;
  }
  #watchPropertyChange(obj = {}) {
    let self = this;
    self.#hasFormChange.value = false;
    return new Proxy(obj, {
      set(target, key, value, receiver) {
        self.#hasFormChange.value = true;
        return Reflect.set(target, key, value, receiver);
      },
    });
  }

  handleConfirm(){
    let self = this;

    let config = {
      mode: self.options.mode,
      continue: true, // 是否继续请求
      form: { ...self.form.value }, //表单数据
      formOptions: {},
      handler: null
    };


    if (self.options.isValidateForm){
      if (self.options.validateForm instanceof Function){
        self.options.validateForm(config).then(res => {
          if (res) self.#handleConfirm(config);
        })
      } else {
        self.refs.formRef.validate(valid => {
          if (valid) self.#handleConfirm(config);
        })
      }
    } else {
      self.#handleConfirm(config);
    }
  }

  #handleConfirm(config){
    let self = this;
    if (self.options.onConfirmBefore instanceof Function) {
      self.options.onConfirmBefore(config);
      if (config.continue === false) { // 停止请求
        return;
      }
    }

    if(config.mode === FormMode.ADD) {
      self.handleAdd(config);
    } else if (config.mode === FormMode.EDIT) {
      self.handleUpdate(config);
    }
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
      self.options.onAddAfter && self.options.onAddAfter(res, form, self.emitParams);
      self.options.onConfirmAfter && self.options.onConfirmAfter(res, form);
      // self.$emit('confirmAdd', res, form, self.emitParams);
      // self.$emit('confirm', res);
      self.hasFormChange.value = false;
      context.message.alert({
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
      self.options.onAddAfter && self.options.onAddAfter(res, form, self.emitParams);
      self.options.onConfirmAfter && self.options.onConfirmAfter(res, form);
      // self.$emit('confirmAdd', res, form, self.emitParams);
      // self.$emit('confirm', res);
      self.hasFormChange.value = false;
      context.message.alert({
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

}