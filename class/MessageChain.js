import { hasNotValue } from '../tools/utils.js';

/**
 * 消息处理链
 */
export default class MessageChain {

  #getKey = (data) => data['key'];
  #getValue = (data) => data;

  #chain = {};

  constructor(getKey, getValue){
    if (getKey instanceof Function){
      this.#getKey = getKey;
    } else if (typeof (getKey) == 'string'){
      this.#getKey = (data) => data[getKey];
    }

    if (getValue instanceof Function){
      this.#getValue = getValue;
    } else if (typeof (getValue) == 'string'){
      this.#getValue = (data) => data[getValue];
    }
  }

  /**
   * 监听数据
   * @param {KEY} key 消息标识
   * @param {Function} handler 执行方法
   * @param {Object} conf 配置
   * @param {Object} conf.once 配置是否只执行一次
   * @returns {Function} 移除这个监听
   */
  on(key, handler, conf={}){
    let self = this;
    if (hasNotValue(key)) throw new Error('key is required');
    if (!(handler instanceof Function)) throw new Error('handler 必须是Function');

    let arr = self.#chain[key];
    if (!arr){
      arr = self.#chain[key] = [];
    }

    arr.push({
      handler,
      once: conf.once
    });

    return function(){
      self.off(key, handler);
    };

  }
  /**
   * 只执行一次的监听
   * @param {KEY} key 消息标识
   * @param {Function} handler 执行方法
   */
  once(key, handler){
    return this.on(key, handler, {once: true});
  }

  /**
   * 关闭执行
   */
  off(key, handler){
    if (!key) throw new Error('key is required');
    if (!(handler instanceof Function)) throw new Error('handler 必须是Function');

    let self = this;
    let arr = self.#chain[key];
    if (arr) {
      // 移除执行方法
      let index = arr.indexOf(handler);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  }

  /**
   * 执行
   */
  post(data){
    let data0 = data;
    if(data instanceof Event){
      data0 = data.data;
    }
    let self = this;
    let key = self.#getKey(data0);
    let data1 = self.#getValue(data0);
    let arr = self.#chain[key];
    if (arr) {
      let config = {
        data,
        continue: true
      };
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        item.handler.call(null, data1, config);
        if (item.once) {
          // 移除当前执行
          arr.splice(i, 1);
          i--;
        }
      }
    }
  }

}