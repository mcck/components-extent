import {context} from '../../index';

// 通用的API接口，请配合代码生成器使用

export default {
  // 查询一条
  one(data, ops) {
    return context.axiosInstance({
      url: this.urlFormat ? this.urlFormat(this.prefix + '/one', ops || data) : this.prefix + '/one',
      data
    });
  },
  page(data, ops) {
    return context.axiosInstance({
      url: this.urlFormat ? this.urlFormat(this.prefix, ops || data) : this.prefix,
      data
    });
  },
  save(data, ops) {
    return context.axiosInstance({
      url: this.urlFormat ? this.urlFormat(this.prefix, ops || data) : this.prefix,
      method: 'PUT',
      data
    });
  },
  update(data, ops) {
    let id = data._id || data.id;
    delete data._id;
    return context.axiosInstance({
      url: this.urlFormat ? this.urlFormat(this.prefix + '/', ops || data) : this.prefix + '/' + id,
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
    return context.axiosInstance({
      url: this.urlFormat ? this.urlFormat(this.prefix + '/', ops || data) : this.prefix + '/' + id,
      method: 'delete',
    });
  },
};