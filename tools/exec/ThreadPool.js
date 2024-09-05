// 线程池


export default class ThreadPool {
  __v_skip = true; // 设置vue跳过代理

  _config = {
    coreSize: 4,
  }
  _workUrl = null; // 执行脚本url
  _pool = [];
  _taskQueue = [];
  


  /**
   * 初始化线程池
   * @param {Object} config 配置
   *  coreSize: 线城池大小，默认4个
   */
  constructor(config) {
    let self = this
    config = Object.assign(self._config, config)
    let script = `(${threadCode.toString()})();`
    self._workUrl = URL.createObjectURL(new Blob([script], { type: 'text/javascript' }))
    for (let i = 0; i < config.coreSize; i++) {
      let work = new Worker(self._workUrl)
      work.onmessage = function(e){
        self._workMessage(this, e)
      }
      work.state = 0
      self._pool.push(work)
    }
  }

  /**
   * 初始化，所有线程都会执行
   * @param {Function} task 初始方法
   * @param  {...any} args 方法需要的参数
   */
  init(fn, ...args) {
    if (!(fn instanceof Function)) {
      throw new Error('参数task必须是Function类型')
    }

    // 检查参数
    if (args) {
      for (let i = 0; i < args.length; i++) {
        if (args[i] instanceof Function) {
          throw new Error('参数' + i + '不能是Function类型')
        }
      }
    }

    let task = fn.toString()
    task = '(()=>' + task + ')()'
    this._pool.forEach(work=>{
      work.postMessage({task, args})
    })
  }

  /**
   * 提交一个任务到线城池
   * @param {Function} task 任务方法
   * @param  {...any} args 方法需要的参数
   */
  submit(task, ...args) {
    if (!(task instanceof Function)) {
      throw new Error('参数task必须是Function类型')
    }

    // 检查参数
    if (args) {
      for (let i = 0; i < args.length; i++) {
        if (args[i] instanceof Function) {
          throw new Error('参数' + i + '不能是Function类型')
        }
      }
    }

    return new Promise((resolve, reject) => {
      // 封装dto
      let dto = new Dto(task, args, resolve, reject)
      let self = this
      // 提交到任务队列
      self._taskQueue.push(dto)
      self._run()
    })
  }

  /**
   * 销毁线城池
   * @param {Boolean} immediately 是否立刻销毁
   */
  destroy(immediately){
    this._pool.forEach(work=>{
      work.terminate()
    })

    // 销毁脚本对象
    URL.revokeObjectURL(this._workUrl)
    this._pool = []
    this._taskQueue = []
  }

  _run() {
    // 获取一个可用的线程
    let self = this
    let work = self._pool.find(it => it.state == 0)
    if (work == null) {
      return
    }

    // 获取一个任务
    let dto = self._taskQueue.shift()
    if (dto == null) {
      return
    }
    work.dto = dto
    work.state = 1
    let task = dto.task.toString()
    task = '(()=>' + task +')()'
    // task.replace(/function.*?\(/, 'function ' + Math.random().toString(36).substring(2, 10) +' (')
    work.postMessage({
      task: task,
      args: dto.args
    })
  }

  /**
   * 收到事件
   * @param {Worker} work 线程对象
   * @param {MessageEvent} e 通讯事件
   */
  _workMessage(work, e) {
    let result = e.data
    let dto = work.dto
    work.dto = null
    work.state = 0

    if (result.success) {
      dto.resolve({
        in: dto.args,
        out: result.args
      })
    } else {
      dto.reject({
        in: dto.args,
        out: result.args
      })
    }

    // 执行后续任务
    this._run()
  }

}

/**
 * 线程执行主要方法
 */
function threadCode() {
  onmessage = function (e) {
    let dto = eval(e.data)
    let fn = eval(dto.task)
    fn.apply(null, dto.args)
  }
}


class Dto {
  task; // 执行的任务字符串
  args; // 参数
  resolve; //成功回调
  reject; //失败回调
  constructor(task, args, resolve, reject) {
    this.task = task
    this.args = args
    this.resolve = resolve
    this.reject = reject
  }
}