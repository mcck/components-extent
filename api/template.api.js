import { extentContext } from '../index';

// 通用的API接口，请配合代码生成器使用

export default {
  __v_skip: true,
  urlFormat(url, data) {
    return url.format2(data);
  },
  _urlFormat(data, ops, uri=''){
    let url = this.getPrefix() + '/' + (this.urlFormat ? this.urlFormat(this.prefix, ops || data) : this.prefix) + uri;
    return '/' + url.split('/').filter(item => !!item).join('/');
  },
  getPrefix(){
    return extentContext().contextPath;
  },
  // 查询一条
  one(data, ops) {
    return extentContext().axiosInstance({
      url: this._urlFormat(data, ops, '/one'),
      data
    });
  },
  page(data, ops) {
    return extentContext().axiosInstance({
      url: this._urlFormat(data, ops),
      data
    });
  },
  list(data, ops) {
    return extentContext().axiosInstance({
      url: this._urlFormat(data, ops, '/list'),
      data
    });
  },
  save(data, ops) {
    return extentContext().axiosInstance({
      url: this._urlFormat(data, ops),
      method: 'PUT',
      data
    });
  },
  update(data, ops) {
    let id = data._id || data.id;
    delete data._id;
    return extentContext().axiosInstance({
      url: this._urlFormat(data, ops, '/'+id),
      method: 'PUT',
      data
    });
  },
  saveOrUpdate(data, ops){
    if (data._id || data.id){
      return this.update(data, ops);
    }else{
      return this.save(data, ops);
    }
  },
  deleteById(id, ops) {
    return extentContext().axiosInstance({
      url: this._urlFormat(null, ops, '/'+id),
      method: 'delete',
    });
  },
};