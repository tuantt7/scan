import moment from 'moment'

export const formatDate = function (dateValue, formatString = 'YYYY-MM-DD') {
  return dateValue ? moment(dateValue).format(formatString) : dateValue
}

export const fromNow = function (timeStamp) {
  const time = moment(moment.unix(timeStamp))
  const now = moment(new Date())

  const seconds = now.diff(time, 'seconds')
  if (seconds < 59) return now.diff(time, 'seconds') + ' seconds ago'

  const diffMs = now - time
  let diffDays = Math.floor(diffMs / 86400000)
  let diffHrs = Math.floor((diffMs % 86400000) / 3600000)
  let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)
  if (diffMins === 60) {
    diffHrs += 1
    diffMins = 0
  }

  if (diffHrs === 24) {
    diffDays += 1
    diffHrs = 0
  }

  const day = `${diffDays} ${diffDays > 1 ? 'days' : 'day'}`
  const hour = `${diffHrs} ${diffHrs > 1 ? 'hrs' : 'hr'}`
  const min = `${diffMins} ${diffMins > 1 ? 'mins ago' : 'min ago'}`

  if (diffDays > 0) {
    if (diffHrs > 0) {
      return `${day} ${hour} ago`
    }

    if (diffHrs === 0 && diffMins > 0) {
      return `${day} ${min}`
    }

    if (diffHrs === 0 && diffMins === 0) {
      return `${day} ago`
    }

    return `${day} ${hour} ${min}`
  }

  if (diffHrs > 0) {
    if (diffMins === 0) {
      return `${hour} ago`
    }

    return `${hour} ${min}`
  }

  if (diffMins > 0) {
    return `${min}`
  }

  return moment(moment.unix(timeStamp)).fromNow()
}

export const isNumeric = (str) => {
  return /^-?\d+$/.test(str)
}

export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
