import parseOne from './parseOne.js'


const parsePhrase = function (matches, opts) {
  matches.debug()
  let arr = []
  matches.forEach(m => {

    // 'entre sept et oct'
    let res = m.match('entre [<from>.*] et [<to>.*]')
    if (res.found) {
      let { to, from } = res.groups()
      res = { start: parseOne(from, opts), end: parseOne(to, opts) }
      if (res.start) {
        arr.push(res)
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