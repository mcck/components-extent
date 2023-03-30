// 大文件上传工具
import retry from './retry.js'
import ThreadPool from './ThreadPool.js'
import { deepMerge, taskQueueUtil } from './utils'

/**
初始化配置如下
{
  // 每个分片大小，单位字节，默认20M
  chunkSize: 20971520,
  // 设置文件最小多大才开始分割，单位字节，默认100M
  thresholdSize: 104857600,
  // 上传时并发数，默认10个
  concurrency: 10,
  // 基础的url，非空,接口必须准守规则
  url: null,
  // 开启分片上传任务请求配置
  startRequest: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // 上传分片文件请求配置
  uploadRequest: {
    method: 'PUT',
  },

  // 获取结果请求配置
  resultRequest: {
    method: 'GET',
  },

  // 开始合并请求配置
  mergeRequest: {
    method: 'GET',
  },

  // MD5的url，用于计算分片的hash值，类型必须是URL
  md5Url: null,

  // 是否自动关闭线城池
  autoCloseThreadPool: true,
  // 线程池，默认自动创建
  threadPool: null
}
*/
export default class MaxFileUploader{
  __v_skip = true; // 设置vue跳过代理

  // 配置
  #config = {
    /**分片大小10M */
    chunkSize: 20971520,
    /**100M才开始分割 */
    thresholdSize: 104857600,
    /**并发数10 */
    concurrency: 10,
    url: null,
    startRequest: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    uploadRequest: {
      method: 'PUT',
    },
    resultRequest: {
      method: 'GET',
    },
    mergeRequest: {
      method: 'GET',
    },

    md5Url: null, // MD5的url，用于计算分片的hash值

    autoCloseThreadPool: true, // 是否自动关闭线城池
    threadPool: null // 线程池，默认自动创建
  };

  #progressCallback; // 进度
  #thenCallback; // 完成回调方法
  #catchCallback; // 完成回调方法
  #finallyCallback; // 完成回调方法
  #reserveCallback; // 不需要分片时回调

  #blob; // 文件对象
  #filename; // 文件名
  #groupId; // 组ID

  #chunks = []; // {Array[Object]} 分片对象列表
  #retryChunks = [];
  
  #taskTotal = 0; // 总任务数
  #completeTaskCount = 0; // 完成次数
  #execTaskCount = 0; // 执行次数


  status = MaxFileUploader.INIT

  constructor(config){
    let self = this
    try{
      self.params = config.params
      let md5Url = config.md5Url
      delete config.params
      delete config.md5Url
      let conf = self.#config = deepMerge(self.#config, config)

      if (!conf.url) {
        throw new Error('config.url是必须的')
      }

      if (!conf.chunkSize > conf.thresholdSize) {
        throw new Error('chunkSize 不能大于thresholdSize')
      }
      if (!conf.axios) {
        throw new Error('config.axios 是必须的')
      }

      if (!(md5Url instanceof URL)) {
        throw new Error('config.md5Url 必须是URL对象')
      }

      // 初始化线程池
      if (!conf.threadPool) {
        conf.threadPool = new ThreadPool()
        conf.autoCloseThreadPool = true
      }

      conf.threadPool.init((md5Url)=>{
        // eslint-disable-next-line no-undef
        importScripts(md5Url)
      }, md5Url.href)
    } catch(e){
      self.#progress(MaxFileUploader.FAIL, '初始化错误', e)
      throw e
    }
  }

  start(blob, filename){
    let self = this
    try{
      if (self.status > 0) {
        throw new Error('任务进行中')
      }

      if (!(blob instanceof Blob)) {
        throw new Error('文件必须是Blob类型')
      }
      self.#blob = blob
      self.#filename = filename || blob.name

      // 计算总任务数
      self.#calculateTotal()
      if (self.#taskTotal == 0) {
        // 不需要分片，使用 reserve 方法
        self.#reserveCallback && self.#reserveCallback(blob)
        self.#_handlerFinally()
        return
      }

      // 开始分片
      self.#slicing()
    } catch(e){
      self.#progress(MaxFileUploader.FAIL, '运行时错误', e)
      throw e
    }
    return self
  }

  #calculateTotal(){
    let self = this
    if (self.#blob.size <= self.#config.thresholdSize) {
      // 不需要分片，结束
      return
    }

    // 分片总数
    self.#taskTotal = Math.ceil(self.#blob.size / self.#config.chunkSize)

    // 分片数和上传数一样，再加最后一次合并
    self.#taskTotal = self.#taskTotal * 2 + 1
  }
  

  #slicing(){
    let self = this
    self.#progress('tips', '开始分割文件')
    // 开始拆分
    let blob = self.#blob
    let conf = self.#config
    let chunkSize = conf.chunkSize
    let offset = 0
    let promises = []
    let threadPool = conf.threadPool

    while (offset < blob.size) {
      // 提交到线城池中执行
      let promise = threadPool.submit(function (blob, offset, chunkSize) {
        // 拆分
        const chunk = blob.slice(offset, offset + chunkSize)
        // 创建Reader对象
        let r = new FileReader()
        r.onload = function () {
          // 计算hash
          // eslint-disable-next-line no-undef
          let hash = md5(r.result)
          chunk.hash = hash
          // 返回主线程
          postMessage({
            success: true,
            args: { chunk, hash }
          })
        }
        r.readAsArrayBuffer(chunk)
      }, blob, offset, chunkSize).then(({out}) => {
        out.chunk.hash = out.hash
        self.#chunks.push(out.chunk)
        self.#progress(MaxFileUploader.SLICING, '分割文件中')
      })
      promises.push(promise)
      offset += chunkSize
    }

    Promise.all(promises).then(()=>{
      self.#createTask()
    })
  }

  // #slicing(){
  //   let self = this
  //   console.time()
  //   self.#progress('tips', '开始分割文件')

  //   // 开始拆分
  //   let blob = self.#blob
  //   let fileSize = blob.size
  //   let chunkSize = self.#config.chunkSize
  //   let offset = 0
  //   let promises = []
  //   while (offset < fileSize) {
  //     const chunk = blob.slice(offset, offset + chunkSize)

  //     promises.push(new Promise((resolve, reject)=>{
  //       // 计算hash
  //       let r = new FileReader()
  //       r.onload = function () {
  //         // let hash = md5(r.result)
  //         // chunk.hash = hash
  //         self.#progress(MaxFileUploader.SLICING, '分割文件中', chunk)
  //         resolve(chunk)
  //       }
  //       r.readAsArrayBuffer(chunk)
  //     }))

  //     self.#chunks.push(chunk)
  //     offset += chunkSize
  //   }

  //   Promise.all(promises).then(()=>{
  //     // self.#createTask()

  //     console.timeEnd()
  //   })
  // }

  #createTask(){
    let self = this
    if (MaxFileUploader.CANCEL == self.status) return
    self.#progress('tips', '创建上传任务')
    self.#config.axios({
      ...self.#config.startRequest,
      url: self.#config.url,
      data: {
        fileName: self.#filename,
        count: self.#chunks.length,
        hashs: self.#chunks.map(it=>it.hash),
      }
    }).then(res=>{
      if (MaxFileUploader.CANCEL == self.status) return

      self.#groupId = res.data.groupId
      if (res.data.code == 0){
        // 移除不需要上传的
        let total = self.#chunks.length
        self.#chunks = self.#chunks.filter(it => res.data.chunks.includes(it.hash))
        let newTotal = self.#chunks.length
        self.#taskTotal = self.#taskTotal - (total - newTotal)
        self.#progress('tips', '创建上传任务完成')

        // 下一步开始上传
        self.#upload()
      } else if (res.data.code == 1){
        self.#taskTotal = self.#taskTotal - self.#chunks.length
        self.#chunks = []
        self.#progress('tips', '创建上传任务完成')
        self.#getResult()
      }
    }).catch(err => {
      self.#progress(MaxFileUploader.FAIL, '创建上传任务失败', err)
    })
  }

  #upload(){
    // 生成任务
    let self = this
    if (MaxFileUploader.CANCEL == self.status) return

    let chunks = self.#chunks
    self.#execTaskCount = 0

    self.#progress('tips', '生成上传任务列表')
    let tasks = chunks.map(ck => {
      if (MaxFileUploader.CANCEL == self.status) return
      return function(chunk){
        return () => {
          if (MaxFileUploader.CANCEL == self.status) return
          // 设置参数
          let formData = new FormData()
          formData.append('hash', chunk.hash)
          formData.append('file', chunk)
          return self.#config.axios({
            ...self.#config.uploadRequest,
            url: self.#config.url + '/' + self.#groupId,
            data: formData
          }).then(res => {
            if (res.data.code == 0 || res.data.code == 1) {
              // 继续上传
              self.#progress(MaxFileUploader.UPLOADING, '上传中')

            } else if (res.data.code == 3) {
              // 重试
              self.#retryChunks.push(chunk)
            } else if (res.data.code == 4) {
              // 失败
              self.#retryChunks.push(chunk)
            }
          }).catch(e => {
            // 出错
            chunk.state = 1
            self.#retryChunks.push(chunk)
            console.error('上传文件错误', e)
          }).finally(() => {
            self.#execTaskCount ++
            self.#checkReady()
          })
        }
      }(ck)
    })
    
    taskQueueUtil(tasks, self.#config.concurrency)
  }

  #checkReady(){
    let self = this
    if (MaxFileUploader.CANCEL == self.status) return
    if (self.#execTaskCount >= self.#chunks.length){
      // 检查是否还有未上传或失败需要重试的
      // self.#chunks = self.#chunks.filter(it=>it.state == 1)
      self.#chunks = self.#retryChunks
      self.#retryChunks = []
      if (self.#chunks.length) {
        console.log('重新上传：', self.#chunks)
        // 再次执行
        self.#upload()
        return
      }
      // 请求合并
      self.#requestMerge()
    }

  }

  #requestMerge() {
    let self = this
    if (MaxFileUploader.CANCEL == self.status) return
    self.#progress('tips', '文件合并中')
    self.#config.axios({
      ...self.#config.mergeRequest,
      url: self.#config.url + '/merge?groupId=' + self.#groupId,
    }).then(res => {
      // 获取结果
      self.#getResult()
    }).catch(err => {
      self.#progress(MaxFileUploader.FAIL, '合并失败', err)
    })

  }

  #getResult(){
    let self = this
    self.#progress('tips', '文件合并中')
    console.log(self)
    retry(function (ok, fail){
      if (MaxFileUploader.CANCEL == self.status) return
      self.#config.axios({
        ...self.#config.resultRequest,
        url: self.#config.url + '/' + self.#groupId,
      }).then(res => {
        if(res.data.code == 2){
          ok()
          self.#progress(MaxFileUploader.COMPLETE, '上传完成', res)
        }else{
          fail()
        }
      }).catch(err => {
        fail()
      })
    },{maxCount: Number.MAX_VALUE, interval: 10000}).catch((e)=>{
      console.log(e)
    })
    
  }

  
  

  #progress(status, message, ...args){
    let self = this
    self.status = status
    if (MaxFileUploader.FAIL == status) {
      try{
        self.#catchCallback && self.#catchCallback(self.params, status, message)
      } finally {
        self.#finallyCallback && self.#finallyCallback(self.params)
        self.#_handlerFinally()
      }
      return
    }

    if (MaxFileUploader.CANCEL == status) {
      self.#finallyCallback && self.#finallyCallback(self.params)
      self.#_handlerFinally()
      return
    }

    if (MaxFileUploader.COMPLETE == status) {
      try {
        self.#thenCallback && self.#thenCallback(self.params, ...args)
      } finally {
        self.#finallyCallback && self.#finallyCallback(self.params)
        self.#_handlerFinally()
      }
    }

    if ('tips' != status) {
      self.#completeTaskCount++
    }
    self.#progressCallback && self.#progressCallback(self.params, status, self.#completeTaskCount, self.#taskTotal, message, ...args)
  }

  #_handlerFinally(){
    // 处理最终事件
    if (this.#config.autoCloseThreadPool){
      if (this.#config.threadPool){
        this.#config.threadPool.destroy(true)
      }
    }
  }


  /**
   * 取消执行
   */
  cancel(){
    let self = this
    self.#progress(MaxFileUploader.CANCEL, '取消上传')
  }

  /**
   * 设置进度回调
   * @param {Function} fn 进度回调方法，参数：
   */
  progress(fn){
    if (!(fn instanceof Function)){
      throw new Error('参数必须是方法')
    }
    this.#progressCallback = fn

    return this
  }

  /**
   * 设置完成回调
   * @param {Function} fn 完成回调方法，参数：
   */
  then(fn){
    if (!(fn instanceof Function)) {
      throw new Error('参数必须是方法')
    }
    this.#thenCallback = fn

    return this
  }
  /**
   * 设置失败回调
   * @param {Function} fn 失败回调方法，参数：
   */
  catch(fn){
    if (!(fn instanceof Function)) {
      throw new Error('参数必须是方法')
    }
    this.#catchCallback = fn

    return this
  }
  /**
   * 设置最终执行回调
   * @param {Function} fn 最终执行回调方法
   */
  finally(fn){
    if (!(fn instanceof Function)) {
      throw new Error('参数必须是方法')
    }
    this.#finallyCallback = fn

    return this
  }
  /**
   * 设置最终执行回调
   * @param {Function} fn 最终执行回调方法
   */
  reserve(fn){
    if (!(fn instanceof Function)) {
      throw new Error('参数必须是方法')
    }
    this.#reserveCallback = fn

    return this
  }

  // 禁止外部设置 status
  set status(s){}

  /**初始化 */
  static INIT = 0;
  /**切割中 */
  static SLICING = 1;
  /**上传中 */
  static UPLOADING = 2;
  /**合并中 */
  static MERGING = 3;
  /**完成 */
  static COMPLETE = 4;
  /**重试 */
  static RETRY = 5;
  /**失败 */
  static FAIL = 6;
  /**取消 */
  static CANCEL = 7;

}
