/**
 * 提交表单的form
 */
export default class Form {
  constructor(...data){
    Object.assign(this, ...data);
    this.condition = [];
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
}


Form.LINK = Object.freeze({
  /**等于 */
  eq: '=',
  /**不等于 */
  ne: '!=',
  /**大于 */
  gt: '>',
  /**大于等于 */
  ge: '>=',
  /**小于 */
  lt: '<',
  /**小于等于 */
  le: '<=',
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
