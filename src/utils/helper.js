import moment from 'moment'

export const formatDate = function (dateValue, formatString = 'YYYY-MM-DD') {
  return dateValue ? moment(dateValue).format(formatString) : dateValue
}
