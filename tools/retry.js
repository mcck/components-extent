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
export default function retry(fn, options) {
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