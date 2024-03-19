import { ref, shallowRef, getCurrentInstance, onMounted } from 'vue';
import newForm from '../entity/Form'
import { inferElementHeight } from "../tools/utils"
import { context } from '../index';

/**
 * 表格助手
 * 提供公共获取列表，分页，排序，查询，打开窗口等方法
 */
export default class TableHelper{

  api = {
    context: null,
  }; //Api
  queryParams = ref({}); // 查询参数
  tips = Object.assign({}, TIPS); // 提示
  order = null;
  page = shallowRef({ // 分页
    total: 0,
    pageNum: 1,
    pageSize: 10
  })
  #computeInferHeight = false;
  #height = shallowRef(300); // 表格高度
  loading = shallowRef(false); // 等待加在
  tableData = ref([]);// 表格数据
  rowContextmenu = []; // 右键菜单


  onGetDataAfter = null; // 查询数据之前
  onGetDataBefore = null; // 获取查询参数之后
  onGetDataError = null; // 错误回调
  onDeleteRowAfter = null; // 删除后
  inferTableHeight = null; // 计算高度方法
  heightOffset = 0;

  #tableRef = null;



  constructor(options){
    let self = this;
    let opt = Object.assign({
      autoGetList: true,
    }, options);


    self.api.context = opt.api;
    self.api.page = opt.api.page;
    self.api.deleteById = opt.api.deleteById;

    self.order = opt.order;
    self.#tableRef = opt.tableRef;


    Object.assign(self.queryParams.value, opt.queryParams)
    Object.assign(self.tips, opt.tips)
    Object.assign(self.page.value, opt.page)


    self.onGetDataBefore = opt.onGetDataBefore;
    self.onGetDataAfter = opt.onGetDataAfter;
    self.onGetDataError = opt.onGetDataError;
    self.onDeleteRowAfter = opt.onDeleteRowAfter;
    self.inferTableHeight = opt.inferTableHeight;

    onMounted(()=>{
      let ins = getCurrentInstance();
      if (!self.#tableRef){
        self.#tableRef = ins.refs?.tableRef?.$el;
      }
    })

    if (opt.autoGetList){
      self.getTableList();
    }

    // 构造器返回一个代理对象
    return new Proxy(this, {
      get(target, propKey, receiver) {
        let val = target[propKey];
        if (val instanceof Function) {
          return function (...arg) {
            return val.apply(target, arg);
          };
        } else {
          return val;
        }
      }
    });
  }

  getTablQueryParams(){
    let self = this;
    let param = newForm(self.queryParams.value, {
      pageNum: self.page.value.pageNum,
      pageSize: self.page.value.pageSize,
    });
    if (self.order) {
      param.order = self.order;
    }
    Object.assign(param, self.query);

    if (!(param.conditions && param.conditions.length)) {
      delete param.conditions;
    }
    return param;
  }

  resetQueryParams(){
    this.queryParams.value = {};
    this.page.value = {
      total: 0,
      pageNum: 1,
      pageSize: 10
    };

    this.getTableList()
  }

  /**
   * 获取表格参数
   */
  getTableList(){
    let self = this;
    if (!self){
      console.error('请使用 tableHelper.getTableList() 调用');
      return;
    }
    let func = self.api.page;
    
    self.loading.value = true;

    let queryParams = self.getTablQueryParams();

    let config = {
      queryParams,
      formOptions: {},
      getDataFunc: func,
      continue: true // 是否继续请求
    };

    if (self.onGetDataBefore instanceof Function){
      self.onGetDataBefore(config);
      if (!config.continue){
        return;
      }
    }

    if (!config.getDataFunc) {
      throw new Error('找不到获取列表的方法，请设置{options.api.page}或检查{options.api}');
    }

    config.getDataFunc.call(self.api.context, config.queryParams, config.formOptions).then(res=>{
      let page = self.page;
      if (self.onGetDataAfter instanceof Function) {
        self.onGetDataAfter(config);
        if (!config.continue) {
          return;
        }
      }

      self.tableData.value = res.records
      page.total = parseInt(res.total);

      if(self.#computeInferHeight){
        self.updateInferTableHeight();
      }

    }).catch(err => {
      self.tableData.value = [];
      if (err instanceof Error){
        self.tips.emptyText = '错误';
      } else {
        self.tips.emptyText = err.data ? err.data.message : '错误';
      }
      self.onGetDataError && self.onGetDataError(err);
      throw err;
    }).finally(() => {
      self.loading.value = false;
    });
  }

  /**
   * 打开编辑窗口
   */
  openEdit(row, ...args){
    let data = row;
    if (data instanceof Event) {
      data = null;
    }

    if (this.refs.edit) {
      this.refs.edit.show(data, ...args);
    } else {
      console.warn('找不到编辑窗口');
    }

  }


  /**
       * 打开删除提示
       * @param {Object} row 
       */
  deleteRow(row, ops) {
    let self = this;

    // 提示是否确认删除
    context().message.confirm(self.tips.deleteRow.format3(row), '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      self.api.deleteById.call(self.api.context, row.id, ops).then(() => {
        context().message.alert({
          message: '删除成功',
          type: 'success',
        });
        self.tableData.value.removeByAttr({ id: row.id });
        self.onDeleteRowAfter && self.onDeleteRowAfter(row);
      });
    });
  }


  updateInferTableHeight(){
    this.#height.value = inferElementHeight(this.#tableRef, this.heightOffset);
  }

  get height(){
    this.#computeInferHeight = true;
    return this.#height;
  }
  set height(val){
    this.#height = val;
  }

}

const TIPS = Object.freeze({
  deleteRow: '是否确认删除此记录？',
});
