import Vue from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { getDomain } from '@pagenote/shared/lib/utils/filter'
dayjs.extend(duration)

const countdownTime = function (date1: number, date2 = Date.now()) {
  const date3 = new Date(date1).getTime() - date2 // 时间差的毫秒数
  // 计算出相差天数
  const days = Math.floor(date3 / (24 * 3600 * 1000))
  // 计算出小时数
  const leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
  const hours = Math.floor(leave1 / (3600 * 1000))
  // 计算相差分钟数
  const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
  const minutes = Math.floor(leave2 / (60 * 1000))
  // 计算相差秒数
  const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
  const seconds = Math.round(leave3 / 1000)
  return [days, hours, minutes, seconds]
}
const computeLeftTimeWithLabel = function (
  expiredAt: number,
  exactly = false
): string {
  const leftTime = countdownTime(expiredAt)
  const days = leftTime[0]
  const hours = leftTime[1]
  const minites = leftTime[2]
  const seconds = leftTime[3]
  if (exactly) {
    return `${days}天 ${hours} 小时 ${minites}分 ${seconds}秒`
  }
  let label
  if (days > 0) {
    label = days + '天后'
  } else if (hours > 0) {
    label = hours + '小时后'
  } else if (minites > 0) {
    label = minites + '分钟后'
  } else if (minites > 0) {
    label = minites + '分钟后'
  } else {
    label = '即将'
  }
  return label
}

const computeTimeDiff = function (timeStamp: number): string {
  if (!timeStamp) {
    return ''
  }
  const tempTime = dayjs(+timeStamp)
  const now = dayjs(new Date())
  const diffDay = now.diff(tempTime, 'day')
  if (diffDay > 30) {
    const diffMonth = now.diff(tempTime, 'month')
    return diffMonth + '个月前'
  } else if (diffDay > 1) {
    return diffDay + '天前'
  } else {
    const diffHours = now.diff(tempTime, 'hour')
    if (diffHours > 1) {
      return diffHours + '小时前'
    } else {
      const diffMinute = now.diff(tempTime, 'minute')
      if (diffMinute > 1) {
        return diffMinute + '分钟前'
      } else {
        return '片刻前'
      }
    }
  }
}

/** Vue Filters Start */
Vue.filter(
  'format',
  function (text: string, format: string = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(+text).format(format)
  }
)

Vue.filter('countdown', function (text: string) {
  return computeLeftTimeWithLabel(+text)
})

Vue.filter('past', function (text: string) {
  return computeTimeDiff(+text)
})

Vue.filter('domain', function (url: string) {
  return url ? getDomain(url, true) : ''
})
