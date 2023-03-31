import { months, days } from './data.js'

// some re-used helper functions:
const parseMonth = function (m) {
  let str = m.text('normal')
  if (months.hasOwnProperty(str)) {
    return months[str]
  }
}
const parseNumber = function (m) {
  let str = m.text('normal')
  return parseInt(str, 10)
}

const isValid = function (cal) {
  if (!cal.month || !cal.date || !cal.year) {
    return false
  }
  return true
}

const parseDates = function (matches) {
  matches.debug()
  let arr = []
  matches.forEach(m => {

    // match '2 septembre 1982'
    let res = m.match('[<date>#Value] [<month>#Month] [<year>#Year]')
    if (res.found) {
      let cal = {
        month: parseMonth(res.groups('month')),
        date: parseNumber(res.groups('date')),
        year: parseNumber(res.groups('year')),
      }
      if (isValid(cal)) {
        arr.push(cal)
      }
    }

    // todo: support other forms here! ↓

  })
  return arr
}
export default parseDates