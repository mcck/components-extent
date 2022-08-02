import DateUtil from '../tools/DateUtil';

/**
 * 提交表单的form
 */
class Form {
  constructor(...data){
    Object.assign(this, ...data);
    this.condition = this.condition || [];
  }

  /**
   * 添加一个自定义条件
   * @param {String} key 字段名
   * @param {String} link 连接符号
   * @param {Object} value 值
   */
  addCondition(key, link, value){
    this.condition.push({key, link, value});
    return this;
  }
  /**
   * 转换为json时
   */
  // toJSON(){
  //   // 删除空条件
  //   if(this.condition.length){
  //     for (let i = 0; i < this.condition.length; i++){
  //       if (!this.condition[i].key || !this.condition[i].link){
  //         this.condition.removeByIndex(i);
  //         i--
  //       }
  //     }
  //   } else {
  //     delete this.condition;
  //   }

  //   return this;
  // }
}

export default function newForm(...data){
  let proxy = new Proxy(new Form(), {
    set(target, propkeyName, propValue) {
      // 为空不允许设置
      if (propValue == null || propValue == void 0) {
        return true;
      }
      let name = propkeyName;
      let nameArr = propkeyName.split('_');
      if (nameArr.length == 2) {
        if (Form.LINK[nameArr[1]]) {
          target.addCondition(nameArr[0], nameArr[1], propValue);
          return true;
        } else if (handler[nameArr[1]]) {
          let fn = handler[nameArr[1]];
          fn(target, nameArr, propValue);

          return true;
        }
      }
      target[name] = propValue;
      return true;
    }
  })

  Object.assign(proxy, ...data);

  return proxy;
}

const handler = {
  dateRange(target, info, value){
    let start = value, end = value;
    if(value instanceof Array){
      start = value[0];;
      end = value[1];
    }
    start = DateUtil.dayStart(start);
    end = DateUtil.dayEnd(end);
    target.addCondition(info[0], Form.LINK.ge, start);
    target.addCondition(info[0], Form.LINK.le, end);
  }
}

Form.LINK = Object.freeze({
  /**等于 */
  eq: '=',
  '=': '=',
  /**不等于 */
  ne: '!=',
  '!=': '!=',
  /**大于 */
  gt: '>',
  '>': '>',
  /**大于等于 */
  ge: '>=',
  '>=': '>=',
  /**小于 */
  lt: '<',
  '<': '<',
  /**小于等于 */
  le: '<=',
  '<=': '<=',
  /**包含 */
  like: 'like',
  /**不包含 */
  notLike: 'notLike',
  /**为空 */
  isNull: 'isNull',
  /**不为空 */
  isNotNull: 'isNotNull',
  /**在这个范围内 */
  in: 'in',
  /**不在这个范围内 */
  notIn: 'notIn',
});
