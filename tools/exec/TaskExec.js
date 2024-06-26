// 重试插件

/**
 * 
 * @param {Function} fn 执行的任务
 * @param {Object} options {
 *  maxCount: Number, // 最大重试次数，默认3次
 *  exceptionOut: 出现异常退出，默认false
 *  interval: 间隔多久一次
 * }
 */
export function taskRetry(fn, options) {
  if (typeof options == 'number') {
    options = { maxCount: options }
  }
  options = Object.assign({
    maxCount: 10,
    interval: 5000, // 5秒一次
    tally: 0, // 已重试次数
  }, options)

  return new Promise((resolve, reject) => {
    fn(ok, fail)

    function ok() {
      resolve(0)
    }
    function fail() {
      if (++options.tally >= options.maxCount) {
        reject(1)
      } else {
        if (options.interval >= 0) {
          setTimeout(() => {
            fn(ok, fail)
          }, options.interval)
        } else {
          fn(ok, fail)
        }
      }
    }
  })
}

/**
 * 任务分片执行，利用没一帧的剩余时间执行任务
 * @param {Array} list 数据
 * @param {Function} taskHandler 需要执行的任务
 * @param {Number} surplus 最少剩余时间（毫秒）
 */
export function taskPerformChunk(list, taskHandler, surplus=0) {
  let i = 0;
  function _run() {
    if (i >= list.length) return;

    requestIdleCallback((idle) => {
      while (idle.timeRemaining() > surplus && i < list.length) {
        taskHandler(list[i], i);
        i++;
      }

      _run();
    });
  }

  _run();
}
