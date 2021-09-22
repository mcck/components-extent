import {context} from '../../index';

// 通用的API接口，请配合代码生成器使用

export default {
  // 查询一条
  one(data) {
    return context.axiosInstance({
      url: this.prefix+ '/one',
      data
    });
  },
  page(data) {
    return context.axiosInstance({
      url: this.prefix,
      data
    });
  },
  save(data) {
    return context.axiosInstance({
      url: this.prefix,
      method: 'PUT',
      data
    });
  },
  update(data) {
    let id = data._id || data.id;
    delete data._id;
    return context.axiosInstance({
      url: this.prefix + '/' + id,
      method: 'PUT',
      data
    });
  },
  saveOrUpdate(data){
    if (data._id || data.id){
      return this.update(data);
    }else{
      return this.save(data);
    }
  },
  deleteById(id) {
    return context.axiosInstance({
      url: this.prefix + '/' + id,
      method: 'delete',
    });
  },
};