import { guid } from '../tools/utils.js'

/**
 * 远程调用
 * 
 * type: 0：内部通讯, 1：调用方法, 2：返回数据
 * 
 * 数据传输格式
 * {
 *  id: {String} 调用ID
 *  name: {String} 方法名
 *  args: {Array} 方法参数
 *  return {Object} 返回参数
 * }
 */

const CALL_TYPE = {
  SYSTEM: 0,
  CALL: 1,
  RETURN: 2,
  MESSAGE: 3
};

const EMPTY_FUNC = ()=>{};

export default class RemoteCall{
  #localReady =false; // 标识是否可以调用
  #remoteReady =false; // 标识是否可以调用
  // 调用上下文
  #context = null;
  // 超时时间30秒
  #timeout = 30000;

  #tasks = []; // 调用任务
  #waitTask = []; // 等待可以调用时执行

  #localCalls = {};
  #remoteCalls = [];

  #remoteCallWay = null;

  #onStart = ()=>{}
  #onUpdate = ()=>{}
  #onMessage = ()=>{}

  constructor(options={}){
    if (options.context){
      this.#context = options.context;
    }
    if (!isNaN(options.timeout)){
      this.#timeout = Number(options.timeout);
    }

    if (options.localCalls){
      this.addLolcaCalls(options.localCalls);
    }



    if (options.remoteCalls){
      this.addRemoteCalls(options.remoteCalls);
    }
    if (options.remoteCallWay){
      this.setRemoteCallWay(options.remoteCallWay);
    }


    if (options.onStart instanceof Function) {
      this.#onStart = options.onStart;
    }
    if (options.onUpdate instanceof Function) {
      this.#onUpdate = options.onUpdate;
    }
    if (options.onMessage instanceof Function) {
      this.#onMessage = options.onMessage;
    }

    this.#initCallProxy();
  }

  #call = null;
  get call(){
    return this.#call;
  }
  get $(){
    return this.#call;
  }
  #initCallProxy(){
    let self = this;
    self.#call = new Proxy(self.remoteCall, {
      get(tagter, prop){
        if(prop.startsWith("_")){
          return tagter[prop];
        }

        return function proxy(){
          return self.callRemote(prop, ...arguments);
        }
      }
    });
  }

  /**
   * 代理调用
   */
  // #remoteProxy() {
  //   return self.callRemote(call, ...arguments);
  // }


  /**
   * 调用远程
   * @param {String} name 方法名
   * @param {*} args 调用参数
   */
  callRemote(name, ...args){
    let self = this;

    if (!self.#localReady || !self.#remoteReady){ // 还不能调用，先保存到队列中
      return new Promise((resolve, reject)=>{
        self.#waitTask.push({ name, args, resolve, reject });
      });
    }

    if (!self.#remoteCalls.includes(name)){
      throw new Error('远程没有这个方法', name);
    }
    let params = {
      id: name + '-'+guid(20),
      type: CALL_TYPE.CALL,
      name,
      args,
    };

    self.#remoteCallWay(params);

    return new Promise((resolve, reject)=>{
      self.#tasks.push({
        id: params.id,
        time: Date.now(),
        resolve,
        reject,
        params
      });
    });
  }

  /**
   * 发送一条消息
   */
  sendMessage(name, args){
    this.#remoteCallWay({
      type: CALL_TYPE.MESSAGE,
      name,
      args,
    });
  }

  #returnRemote(id, data, error){
    this.#remoteCallWay({
      id,
      error: !!error,
      type: CALL_TYPE.RETURN,
      return: data,
    });
  }
  #callRemoteSystem(name, args){
    this.#remoteCallWay({
      id: guid(20),
      type: CALL_TYPE.SYSTEM,
      name: name,
      args
    });
  }


  /**
   * 被远程调用
   * @param {Object} data 
   */
  remoteCall(data){
    switch (data.type){
      case CALL_TYPE.SYSTEM: 
        this.#handleSystemCall(data);
        break;
      case CALL_TYPE.CALL: 
        this.#handleRemoteCall(data);
        break;
      case CALL_TYPE.RETURN: 
        this.#handleReturnCall(data);
        break;
      case CALL_TYPE.MESSAGE: 
        this.#onMessage(data);
        break;
    }
  }

  /**
   * 处理系统调用
   */
  #handleSystemCall(data){
    switch(data.name){
      case 'start':
        this.#remoteReady = true;
        this.addRemoteCalls(data.args);
        this.#execWaitTaskCall();
        this.#onStart(data);
        break;
      case 'update':
        this.addRemoteCalls(data.args);
        this.#onUpdate(data);
        break;
    }
  }
  /**
   * 被远程调用
   */
  #handleRemoteCall(data){
    let self = this;
    try{
      let func = self.#localCalls[data.name];
      if (func) {
        // 执行函数
        let res = func.call.apply(func.context, data.args);
        if (res instanceof Promise){
          res.then(res=>{
            self.#returnRemote(data.id, res);
          })
        } else {
          self.#returnRemote(data.id, res);
        }

      } else {
        // 调用找不到信息
        self.#returnRemote(data.id, '找不到'+data.name+'方法', true);
      }
    } catch(err){
      // 响应错误信息
      self.#returnRemote(data.id, err.message, true);
    }
  }
  #handleReturnCall(data){
    let self = this;
    // 查找任务
    let index = this.#tasks.findIndex(task=>task.id === data.id);
    if (index == -1) return;
    let task = this.#tasks[index];
    if(data.error){
      task.reject("远程方法错误：" +data.return);
    } else {
      task.resolve(data.return);
    }

    // 移除调用任务
    self.#tasks.splice(index, 1);
  }

  /**
   * 执行等待调用队列
   */
  #execWaitTaskCall(){
    let self = this;
    if (self.#localReady && self.#remoteReady){
      self.#waitTask.forEach(item=>{
        self.callRemote(item.name, ...item.args).then(item.resolve).catch(item.reject)
      })
      self.#waitTask = [];
    }
  }

  /**
   * 添加本地调用方法
   * @param {Object | Array} calls 
   * @param {*} context 上下文
   * @param {*} skip 是否跳过方法检查
   * @returns 
   */
  addLolcaCalls(calls, context, skip){
    if (!calls)return;
    if (calls instanceof Array){
      for(let call of calls){
        this.addLolcaCall(call, context, skip);
      }
    } else {
      for(let name in calls){
        this.addLolcaCall(calls[name], name, context, skip);
      }
    }
    return this;
  }
  addLolcaCall(call, fname, context, skip){
    if (!(call instanceof Function)){
      if (skip) return;
      throw new Error('call 必须是函数');
    };

    let name = fname || call.name;

    if (!name){
      if (skip) return;
      throw new Error('call 不能是匿名函数');
    }

    if (!context){
      context = this.#context;
    }

    this.#localCalls[name] = {call, context}
    
    return this;
  }


  /**
   * 添加远程方法
   */
  addRemoteCalls(calls){
    // calls.forEach(call=>{
    //   this.addRemoteCall(call);
    // });
    this.#remoteCalls.push(...calls);
    return this;
  }
  addRemoteCall(call){
    let self = this;
    self.#remoteCalls.push(call);
    // self.#remoteCalls[call] = EMPTY_FUNC;
    // self.#remoteCalls[call] = function proxy() {
    //   return self.callRemote(call, ...arguments);
    // };
    return self;
  }

  /**
   * 设置远程调用方式
   * @param {Function} callback 远程调用方法
   */
  setRemoteCallWay(callback){
    if (!(callback instanceof Function)) {
      throw new Error('callback 必须是函数');
    };

    this.#remoteCallWay = callback;
    return this;
  }

  /**
   * 开始调用
   */
  start(){
    // 生成本地方法数组
    let localCalls = Object.keys(this.#localCalls);
    this.#localReady = true;
    // 发送调用更新
    this.#callRemoteSystem('start', localCalls);
    this.#execWaitTaskCall();
  }

  /**
   * 更新远程调用
   */
  updateRemoteCalls(){
    // 生成本地方法数组
    let localCalls = Object.keys(this.#localCalls);

    // 发送调用更新
    this.#callRemoteSystem('update', localCalls);
  }
}