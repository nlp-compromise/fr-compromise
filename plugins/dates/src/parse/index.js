import parseOne from './parseOne.js'


const parsePhrase = function (matches, opts) {
  let arr = []
  matches.forEach(m => {

    // 'entre sept et oct'
    let res = m.match('entre [<start>.*] et [<end>.*]')
    if (res.found) {
      let { start, end } = res.groups()
      res = { start: parseOne(start, opts), end: parseOne(end, opts) }
      if (res.start) {
        arr.push(res)
        return
      }
    }

    // finally, support a bare date like 'jun'
    res = { start: parseOne(m, opts) }
    if (res.start) {
      arr.push(res)
    }

  })
  return arr
}
export default parsePhrase