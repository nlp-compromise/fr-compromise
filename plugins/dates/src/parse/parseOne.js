import { months, days } from './data.js'
import { Moment, Month, Day, Week, Year } from './units.js'
import spacetime from 'spacetime'


// some re-used helper functions:
const parseMonth = function (m) {
  let str = m.text('normal')
  if (months.hasOwnProperty(str)) {
    return months[str] - 1
  }
  return null
}
const parseNumber = function (m) {
  let str = m.text('normal')
  str = str.replace(/e$/, '')//ordinal
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
      return new Day(cal, opts)
    }
  }

  // 'oct 2021'
  res = m.match('[<month>#Month]  [<year>#Year]')
  if (res.found) {
    let cal = {
      month: parseMonth(res.groups('month')),
      year: parseNumber(res.groups('year')) || today.year(),
    }
    if (isValid(cal)) {
      return new Month(cal, opts)
    }
  }
  // 'oct 22nd'
  res = m.match('[<month>#Month] [<date>#Value] [<year>#Year]?')
  if (res.found) {
    let cal = {
      month: parseMonth(res.groups('month')),
      date: parseNumber(res.groups('date')) || today.date(),
      year: parseNumber(res.groups('year')) || today.year(),
    }
    if (isValid(cal)) {
      return new Day(cal, opts)
    }
  }
  // '2021'
  res = m.match('[<year>#Year]')
  if (res.found) {
    let cal = { year: parseNumber(res.groups('year')) }
    if (isValid(cal)) {
      return new Year(cal, opts)
    }
  }
  // 'octobre'
  res = m.match('[<month>#Month]')
  if (res.found) {
    let cal = { month: parseMonth(res.groups('month')), year: today.year() }
    if (isValid(cal)) {
      return new Month(cal, opts)
    }
  }
  // '2021-02-12'
  res = m.match('#Date+')
  if (res.found) {
    let s = spacetime(res.text('normal'), opts.timezone)
    if (s.isValid()) {
      return new Moment(s.json(), opts)
    }
  }

  // todo: support other forms here! ↓


  return null
}
export default parseOne