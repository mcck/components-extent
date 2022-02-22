import { inferElementHeight } from "../tools/utils"

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
export function newInstance(params){
  let obj = {
    api: null,
    pageFunc: null,
    inferHeight: true, // 开启计算表格高度
    setApi(api) {
      this.api = api;
    },
    setPageFunc(func) {
      this.pageFunc = func;
    },



    data() {
      return {
        api: obj.api,
        pageFunc: obj.pageFunc,

        queryParam: {},

        page: {
          total: 0,
          pageNum: 1,
          pageSize: 10
        },
        table: {
          getDataCount: 0, // 获取数据次数
          height: 300,
          loading: false,
          list: [],
          rowContextmenu: []
        },
      };
    },
    created() {
      if (this.autoInit != false) {
        this.getTableList();
      }
    },
    methods: {
      /**
       * 默认排序
       * @param {Object} sortProp 
       */
      defaultSortMethod(sortProp) {
        this.tableOrder(this.formatOrder(sortProp), sortProp);
      },
      /**
       * 装换排序参数
       * @param {Object} sortProp 
       * @returns 
       */
      formatOrder(sortProp) {
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
      /**
       * 表格排序，可被重写
       * @param {Object} sort 
       */
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

      // getTablLeistParams(){

      // },

      /**
       * 获取表格数据
       */
      getTableList() {
        let self = this;
        let func;
        if (self.pageFunc) {
          func = self.pageFunc;
        } else if (self.api?.page) {
          func = self.api.page;
          func.$self = self.api;
        }

        if (!func) {
          throw new Error('找不到获取列表的方法，请设置pageFunc或设置this.api');
        }


        let table = self.table;
        table.loading = true;
        let param = self.getCondition(self.queryParam, {
          pageNum: self.page.pageNum,
          pageSize: self.page.pageSize,
        });
        if (self.order) {
          param.order = self.order;
        }
        Object.assign(param, self.query);

        if (self.getTableListBefore) {
          param = self.getTableListBefore(param);
        }

        func.call(func.$self, param).then(res => {
          let page = self.page;
          table.list = res.records;
          page.total = parseInt(res.total);

          // 第一次请求设置高度
          self.table.getDataCount++;
          if (obj.inferHeight && self.table.getDataCount == 1) {
            self.table.height = self.inferTableHeight();
          }

          if (self.getTableListAfter) {
            self.getTableListAfter(res, param);
          }
        }).catch(err => {
          console.error(err);
          self.table.emptyText = err.data ? err.data.message : '错误';
          self.getTableListError && self.getTableListError(err);
        }).finally(() => {
          table.loading = false;
        });
      },
      /**
       * 推算表格应有的高度
       * @param {Number} offset 偏移值
       * @returns 
       */
      inferTableHeight(offset) {
        return inferElementHeight(this.$refs.table.$el, offset || this.heightOffset);
      },
      /**
       * 打开编辑窗口
       * @param {Object} row 
       */
      openEdit(row) {
        let data = row;
        if(data instanceof Event){
          data = null;
        }
        if (this.$refs.edit) {
          this.$refs.edit.init(data);
        } else {
          console.warn('找不到编辑窗口');
        }
      },
      /**
       * 打开删除提示
       * @param {Object} row 
       */
      deleteRow(row) {
        let self = this;
        self.$confirm('是否确认删除此记录？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          self.api.deleteById(row.id).then(() => {
            self.$message.success('删除成功');
            self.table.list.removeByAttr({ id: row.id });
            self.deleteRowAfter && self.deleteRowAfter(row);
          });
        });
      },
      resetForm(){
        this.queryParam = {};
        this.getTableList();
      }
    },

    plugin(plu) {
      if (plu.name == 'contextmenu') {
        this.methods.handerTableRowContextmenu = function (row, column, event) {
          plu.handerContextmenu(event, this.table.rowContextmenu, row, column, event);
        };
      }
    },


    ...params
  };

  obj.newInstance = newInstance;
  return obj;
}

export default newInstance();