export const LinkSymbol = Object.freeze({
  eq: 'eq', // 等于
  ne: 'ne', // 不等于
  gt: 'gt', // 大于
  ge: 'ge', // 大于等于
  lt: 'lt', // 小于
  le: 'le', // 小于等于
  like: 'like', // 包含
  notLike: 'notLike', // 不包含
  isNull: 'isNull', // 等于空
  isNotNull: 'isNotNull', // 不等于空
  in: 'in', // 包含集合
  notIn: 'notIn' // 不包含集合
});


export const FormMode = Object.freeze({
  ADD: 0,
  EDIT: 1,
  CHECK: 2
});

export default {
  LinkSymbol,
  FormMode
}