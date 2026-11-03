import parseOne from './date/index.js'
import { Moment, Month, Day, Week, Year } from './date/units.js'


// generic callback
const startEnd = function (m, opts) {
  if (m.found) {
    const { start, end } = m.groups()
    const out = {
      start: parseOne(start, opts),
      end: parseOne(end, opts)
    }
    if (out.start) {
      return out
    }
  }
  return null
}
const justStart = function (m, opts) {
  const out = { start: parseOne(m, opts) }
  if (out.start) {
    return out
  }
  return null
}

const untilEnd = function (m, opts) {
  const { end } = m.groups()
  const out = { start: new Moment(opts.today, opts), end: parseOne(end, opts) }
  if (out.end) {
    // until - just before x
    out.end = new Moment(out.end.s.minus(1, 'millisecond'), opts)
    return out
  }
  return null
}

const phrases = [
  // 'entre sept et oct'
  { match: 'entre [<start>.*] et [<end>.*]', cb: startEnd },
  // 'jusqu'en juin' (until june)
  { match: '(jusqu|jusque) (en|a|à|au) [<end>#Date+]', cb: untilEnd },
  // fallback to parsing one date
  { match: '.*', cb: justStart },
]

const parsePhrase = function (matches, opts) {
  const arr = []
  matches.forEach(view => {
    for (let i = 0; i < phrases.length; i += 1) {
      const { match, cb } = phrases[i]
      const m = view.match(match)
      if (m.found) {
        const res = cb(m, opts)
        if (res) {
          arr.push(res)
          return
        }
      }
    }


  })
  return arr
}
export default parsePhrase