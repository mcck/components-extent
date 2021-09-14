/**
 * 表格页面通用方法
 * 1.表格查询参数生成：getCondition
 *    该方法会检查参数名后缀，生成查询参数，如： 
 *    {xxx: 123} => {xxx: 123}
 *    {xxx_like: 123} => {condition: [{key: 'xxx', link: 'like', value: '123'}]}
 * 
 * 2.通用排序 defaultSortMethod
 *    （1）使用方式：el-table上添加 @sort-change="defaultSortMethod"
 *    （2）在需要排序的字段上添加 sortable="custom"
 *    （3）重写 tableOrder() 方法 或 直接使用this.order参数
 */
let obj = {
  data() {
    return {
      queryParam: {},
      table: {
        // height: 500,
        loading: false,
        list: [],
        page: {
          total: 0,
          page: 0,
          pageSize: 10
        },
        rowContextmenu: []
      },
    };
  },
  created () {
    if (this.autoInit != false) {
      this.getTableList();
    }
  },
  methods: {
    defaultSortMethod(sortProp) {
      this.tableOrder(this.formatOrder(sortProp), sortProp);
    },
    formatOrder(sortProp){
      let { column, prop, order } = sortProp;

      // 如果使用表格排序
      if (column?.sortable === true) {
        return;
      }
      if (order == 'ascending') {
        order = 'asc';
      } else if (order == 'descending') {
        order = 'desc';
      } // 为空则不分页
      let sort;
      if (order) {
        sort = {
          orderBy: prop,
          order
        };
      }
      return sort;
    },
    tableOrder(sort) {
      this.order = [sort];
      // let o = order.find2({ orderBy: sort.orderBy});
      // if (o){
      //   Object.assign(o, sort);
      // } else {
      //   order.push(sort);
      // }
      this.getTableList && this.getTableList();
    }, // 默认，避免报错，该方法要被从写
    /**
     * 获取搜索条件
     */
    getCondition(queryParam, param2) {
      let con = [];
      let param = Object.assign({}, param2);
      for (let o in queryParam) {
        if (!queryParam[o]) {
          continue;
        }

        let fieldArr = o.split('_');
        if (fieldArr.length > 1) { // 如果大于1表示需要特殊条件的
          con.push({
            key: fieldArr[0],
            link: fieldArr[1],
            // value: fieldArr[1] == 'like' ? '%' + queryParam[o] + '%' : queryParam[o]
            value: queryParam[o]
          });
        } else {
          param[o] = queryParam[o];
        }
      }
      param.condition = con.length ? con : undefined;
      return param;
    },

    getTableList(){
      let self = this;

      if (!self.api){
        throw new Error('找不到【this.api】请设置API属性');
      }
      if (!self.api.page){
        throw new Error('API没有page方法');
      }


      let table = self.table;
      table.loading = true;
      let param = self.getCondition(self.queryParam, {
        pageNum: table.page.page,
        pageSize: table.page.pageSize,
      });
      if (self.order) {
        param.order = self.order;
      }
      Object.assign(param, self.query);

      if (self.getTableListBefore){
        let p = self.getTableListBefore(param);
        param = p || param;
      }

      self.api.page(param).then(res => {
        let page = table.page;
        table.list = res.records;
        page.total = parseInt(res.total);

        if (self.getTableListAfter){
          self.getTableListBefore(res, param);
        }
      }).finally(() => {
        table.loading = false;
      });
    },
    openEdit(row){
      if(this.$refs.edit){
        this.$refs.edit.init(row);
      } else {
        console.warn('找不到编辑窗口');
      }
    },
    deleteRow(row){
      let self = this;
      self.$confirm('是否确认删除此记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        self.api.deleteById(row.id).then(() => {
          self.$message.success('删除成功');
          self.table.list.removeByAttr({id: row.id});
        });
      });
    },
  },

  plugin(plu){
    if (plu.name == 'contextmenu'){
      this.methods.handerTableRowContextmenu = function (row, column, event){
        plu.handerContextmenu(event, this.table.rowContextmenu, row, column, event);
      };
    }
  }
};


export default (()=>obj)();