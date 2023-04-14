import parseOne from './date/index.js'

// generic callback
const startEnd = function (m, opts) {
  if (m.found) {
    let { start, end } = m.groups()
    let out = {
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
  let out = { start: parseOne(m, opts) }
  if (out.start) {
    return out
  }
  return null
}

const phrases = [
  // 'entre sept et oct'
  { match: 'entre [<start>.*] et [<end>.*]', cb: startEnd },

  // fallback to parsing one date
  { match: '.*', cb: justStart },
]

const parsePhrase = function (matches, opts) {
  let arr = []
  matches.forEach(view => {
    for (let i = 0; i < phrases.length; i += 1) {
      let { match, cb } = phrases[i]
      let m = view.match(match)
      if (m.found) {
        let res = cb(m, opts)
        if (res) {
          arr.push(res)
          return
        }
      }
    }

    // 'entre sept et oct'
    // let res = m.match('entre [<start>.*] et [<end>.*]')
    // if (res.found) {
    //   let { start, end } = res.groups()
    //   res = { start: parseOne(start, opts), end: parseOne(end, opts) }
    //   if (res.start) {
    //     arr.push(res)
    //     return
    //   }
    // }

    // // finally, support a bare date like 'jun'
    // res = { start: parseOne(m, opts) }
    // if (res.start) {
    //   arr.push(res)
    // }

  })
  return arr
}
export default parsePhrase