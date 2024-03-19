import { context } from '../index';

let compute = {};

/**
 * 计算两个时间内的假期天数，和日期
 * @param {Object} date1 开始时间
 * @param {Object} date2 结束时间
 *
 * @return Po
 */
compute.holiday = function (date1, date2) {
  // 转型
  date1 = toDate(date1);
  date2 = toDate(date2);
  if (date1 > date2) { // 交换位置
    let date3 = date1
    date1 = date2;
    date2 = date3;
  }
  let resp = context().holidayCalendar; // 返回假期时间轴
  // 时间轴，从开始那一年起
  let timeAxis = [];
  for (let x=date1.getFullYear(); resp[x] && x<=date2.getFullYear(); x++) {
    timeAxis = timeAxis.concat(resp[x]);
  }
  // 起止日期
  // 开始时间：只要这一天没结束，就算一天
  // 结束时间：结束时应该从那一天的最后一秒算起
  let startTime = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), 0, 0, 0, 0);
  let endTime = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), 23,59,59, 999);

  let holiday = [];
  for (let i=0, len=timeAxis.length; i<len && timeAxis[i] <= endTime; i++) { // 循环这一年中每一天，找到离起始时间后最近的一天
    if (timeAxis[i] >= startTime) {
      holiday.push(timeAxis[i]);
    }
  }
  return holiday;
};

/**
 * 判断是否是有效date
 * @param {Boolean} true: 有效， false: 无效
 */
compute.isValidDate = function (date) {
  return date instanceof Date && !isNaN(date.getTime());
};

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
// const month = DAY * 30;
// const year = DAY * 365;

/**
 * 计算data1到data2有多长时间
 * @param data1 开始时间
 * @param data2 结束时间
 * @param end 以什么单位结尾
 */
compute.timeDiffer = function (date1, date2, end) {
  //    switch (end) {
  //      case 'y':
  //      case 'Y': endTime = 10000000000; break;
  //      case 'M': endTime = 1000000000; break;
  //      case 'd':
  //      case 'D': endTime = 10000000; break;
  //      case 'h':
  //      case 'H': endTime = 1000000; break;
  //      case 'm': endTime = 10000; break;
  //      case 's':
  //      case 'S': endSymbol = true;
  //      // eslint-disable-next-line
  //      default: endTime = 1; break;
  //    }

  //    switch (end) {
  //      case 'y':
  //      case 'Y': endTime = year; break;
  //      case 'M': endTime = month; break;
  //      case 'd':
  //      case 'D': endTime = DAY; break;
  //      case 'h':
  //      case 'H': endTime = HOUR; break;
  //      case 'm': endTime = MINUTE; break;
  //      case 's':
  //      case 'S': endSymbol = true;
  //      // eslint-disable-next-line
  //      default: endTime = 1; break;
  //    }

  date1 = toDate(date1);
  date2 = toDate(date2);
  let diffValue = date2 - date1;

  return timeToDateStr(diffValue);
}

/**
 * 把毫秒值转时分秒
 * @param {Object} diffValue
 * @param {Object} end
 */
export function timeToDateStr (diffValue, end) {
  let endTime, endSymbol = !!(end === 's' || end === 'S');

  let flog = false;
  let result = '';

  if (diffValue < 0) {
    // result = '超时';
    diffValue = Math.abs(diffValue);
  }/* else {
    result = '剩余';
  } */
  // 因为年月不确认，会影响精度，所以去除
  // let yearC = diffValue/year;
  // if (yearC >=1) {
  //  yearC = parseInt(yearC);
  //  result += yearC + '年';
  //  diffValue = diffValue - year * yearC;
  //  flog = true;
  //  if (end === 'Y' || end === 'y') return result;
  // }
  // let monthC = diffValue / month;
  // if (monthC >= 1) {
  //  monthC = parseInt(monthC);
  //  result += monthC + '月';
  //  diffValue = diffValue - month * monthC;
  //  flog = true;
  //  if (end === 'M') return result;
  // }
  /* let weekC = diffValue / (7 * DAY);
  if(weekC >= 1) {
    result = parseInt(weekC) + "周";
    flog = true;
  } */
  let dayC = diffValue / DAY;
  if (dayC >= 1) {
    dayC = parseInt(dayC);
    result += dayC + '天';
    diffValue = diffValue - DAY * dayC;
    flog = true;
    if (end === 'D' || end === 'd') return result;
  }
  let hourC = diffValue / HOUR;
  if (hourC >= 1) {
    hourC = parseInt(hourC);
    result += hourC + '小时';
    diffValue = diffValue - HOUR * hourC;
    flog = true;
    if (end === 'H' || end === 'h') return result;
  }
  let minC = diffValue / MINUTE;
  if (minC >= 1) {
    minC = parseInt(minC);
    result += minC + '分钟';
    diffValue = diffValue - MINUTE * minC;
    flog = true;
    if (end === 'm') return result;
  }

  if (!flog || endSymbol) { // 如果有分以上的，就忽略秒
    let sec = diffValue / 1000;
    if (sec >= 1) {
      sec = parseInt(sec);
      result += sec + '秒';
    }
  }
  return result;
}

/**
 * 计算data1到data2有多长时间(去除节假日)
 * @param data1 开始时间
 * @param data2 结束时间
 * @param bool 是否返回详细情况
 */
compute.timeDifferHoliday = function (date1, date2, bool) {
  date1 = toDate(date1);
  date2 = toDate(date2);
  let diffValue = date2 - date1;
  let self = this;
  let r = self.holiday(date1, date2);
  // 计算节假日毫秒
  let holiDiffValue = diffValue - (r.length * DAY);

  let result;
  if (bool) {
    result = {
      dateStr: timeToDateStr(diffValue), // 实际用时
      time: diffValue, // 实际用时
      holiDateStr: timeToDateStr(holiDiffValue), // 去除节假日用时
      hiliTime: holiDiffValue, // 去除假期用时，（毫秒）
      hiliday: r.length // 假期天数
    };
  } else {
    result = {
      holiDateStr: timeToDateStr(holiDiffValue), // 去除节假日用时
      hiliTime: holiDiffValue, // 去除假期用时，（毫秒）
      hiliday: r.length // 假期天数
    };
  }
  return result;
}
/**
 * 返回去除假期后的时长
 * @param {Object} date1
 * @param {Object} date2
 */
compute.getDuration_holiday = function (date1, date2) {
  date1 = toDate(date1);
  date2 = toDate(date2);
  let diffValue = date2 - date1;
  let r = this.holiday(date1, date2);
  // 计算节假日毫秒
  let holiDiffValue = diffValue - (r.length * DAY);
  return holiDiffValue;
}

// compute.timeDifferHoliday(new Date(2019, 0, 1), new Date()).then(r => {
// console.log(r);
// });

export function toDate (date) {
  if (date instanceof Date) {
    return date;
  } else {
    return new Date(date);
  }
}

/**
 * 计算当前时间在开始时间到总天数阶段内的状态
 * date 开始时间
 * stage 进入黄色阶段的天数
 * total 给定的期限（天） || 时间
 * @return 0 剩余天数大于day
 *         1 剩余天数小于
 *         2 无剩余天数或超期
 */
compute.getDateStateByStart = function (date1, stage, total) {
  date1 = toDate(date1);
  let now = new ServerDate(), all;
  if (total instanceof Date) {
    all = total - date1; // 计算全部时间
  } else {
    all = DAY * total; // 总时长应该是40天后而且排除节假日
  }
  // 节假日
  let holiday = this.holiday(date1, total).length * DAY;
  // 当前时间 - 开始时间 - 节假日用时 = 用时
  let use = now - date1 - holiday;

  // 计算剩余时间  总时长 - 用时
  let residue = all - use;

  // 计算换色阶段的时间
  let day2 = DAY * stage;

  if (residue <= 0) { // 超时
    return 2;
  } else if (residue > 0 && residue < day2) { // 在警告的区间内, 剩余的时间再知道的剩余天数内
    return 1;
  } else {
    return 0;
  }
};


/**
 * 获取今天开始时间
 * @returns {Date} 
 */
export function todayStart(){
  return dayStart(new Date());
}
/**
 * 获取今天结束
 * @returns {Date}
 */
export function todayEnd(){
  return dayEnd(new Date());
}
/**
 * 获取某一天开始，第一秒
 * @param {Date} date 
 * @returns 
 */
export function dayStart(date) {
  date = new Date(date);
  date.setHours(0, 0, 0, 0);
  return date;
}
/**
 * 获取某一天结束，最后一秒
 * @param {Date} date 
 * @returns 
 */
export function dayEnd(date) {
  date = new Date(date);
  date.setHours(23, 59, 59, 999);
  return date;
}

export default {
  todayStart,
  todayEnd,
  dayStart,
  dayEnd,
  timeToDateStr,
  toDate,
  compute
};
