import { hasNotValue } from '../tools/utils.js';

/**
 * 消息处理链
 */
export default class MessageChain {

  #debug = false;
  #chain = {};
  #keySerialize = (key) => {
    return typeof (key) == 'object' ? key.key : key;
  };

  #registerHandler = ()=>{};

  constructor(options = {}) {
    this.#debug = options.debug;

    if (options.keySerialize) {
      this.#keySerialize = options.keySerialize;
    }

    if (options.registerHandler instanceof Function) {
      this.#registerHandler = options.registerHandler;
    }
  }

  get debug() {
    return this.#debug;
  }
  get chain() {
    return { ...this.#chain };
  }

  /**
   * 监听数据
   * @param {Object} conf 消息标识配置
   * @param {Function} handler 执行方法
   * @param {Object} conf 配置
   * @param {Object} conf.once 配置是否只执行一次
   * @returns {Function} 移除这个监听
   */
  on(conf, handler) {
    let self = this;
    let config = self.#getConfig(conf, handler);

    let chain = self.#chain[config.key];
    if (!chain) {
      chain = self.#chain[config.key] = [];
    }

    config.sort = config.sort || chain.length;
    chain.push(config);

    // 排序
    chain.sort((a, b) => a.sort - b.sort);

    function remove() {
      self.off(conf, handler);
    }

    self.#registerHandler(config, remove);

    return remove;

  }
  /**
   * 只执行一次的监听
   * @param {KEY} key 消息标识
   * @param {Function} handler 执行方法
   */
  once(conf, handler) {
    if (typeof (conf) != 'object') {
      conf = { key: conf };
    }
    conf.once = true;
    return this.on(conf, handler);
  }

  #getConfig(conf, handler) {
    let self = this;
    if (!(handler instanceof Function)) throw new Error('handler 必须是Function');
    if (hasNotValue(conf)) throw new Error('key is required');

    let config = {};
    if (typeof (conf) == 'object') {
      config = { ...conf, handler };
    } else {
      config.key = conf;
      config.handler = handler;
    }
    config.key = self.#keySerialize({ ...config });

    if (hasNotValue(config.key)) throw new Error('conf.key is required');

    return config;
  }

  /**
   * 关闭执行
   */
  off(conf, handler) {

    let self = this;
    let config = self.#getConfig(conf, handler);

    let arr = self.#chain[config.key];
    if (arr) {
      // 移除执行方法
      let index = arr.findIndex(item => item.handler == handler);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  }

  /**
   * 执行
   */
  post(key, data) {
    let self = this;
    if (this.#debug) {
      console.log('MessageChain debug post', data)
    }

    return new Promise((resolve, reject) => {
      key = self.#keySerialize(key);

      let chain = self.#chain[key];
      if (!chain?.length) {
        resolve(data);
        return;
      }

      let index = 0;
      chain = [...chain];
      function next(nextData, stop = false) {
        if (stop || index >= chain.length) {
          resolve(nextData);
          return;
        }

        let item = chain[index];

        if (item.once) {
          // 移除当前执行
          chain.splice(index, 1);
        } else {
          index++;
        }

        if (item.handler.length >= 2) { // 2个参数，第一个是data，第二个是next
          item.handler.call(null, nextData, next);
        } else {
          item.handler.call(null, nextData);
          next(nextData);
        }
      }

      next(data);
    });

  }

  /**
   * 销毁
   */
  destroy() {
    this.#chain = {};
  }

}