import { months, days } from './data.js'

// some re-used helper functions:
const parseMonth = function (m) {
  let str = m.text('normal')
  if (months.hasOwnProperty(str)) {
    return months[str]
  }
  return null
}
const parseNumber = function (m) {
  let str = m.text('normal')
  return parseInt(str, 10)
}

const isValid = function (cal) {
  // if (!cal.month || !cal.date || !cal.year) {
  //   return false
  // }
  return true
}

// pull-apart a spcific date, like 'le 2e oct' independant of a longer phrase
const parseOne = function (m, opts) {
  const { today } = opts
  // match '2 septembre 1982'
  let res = m.match('[<date>#Value] [<month>#Month] [<year>#Year]')
  if (res.found) {
    let cal = {
      month: parseMonth(res.groups('month')),
      date: parseNumber(res.groups('date')),
      year: parseNumber(res.groups('year')),
    }
    if (isValid(cal)) {
      return cal
    }
  }

  // 'oct 2021'
  res = m.match('[<month>#Month] [<year>#Year]?')
  if (res.found) {
    let cal = {
      month: parseMonth(res.groups('month')),
      year: parseNumber(res.groups('year')) || today.year,
    }
    if (isValid(cal)) {
      return cal
    }
  }
  // '2021'
  res = m.match('[<year>#Year]')
  if (res.found) {
    let cal = { year: parseNumber(res.groups('year')) }
    if (isValid(cal)) {
      return cal
    }
  }

  // todo: support other forms here! ↓


  return null
}
export default parseOne