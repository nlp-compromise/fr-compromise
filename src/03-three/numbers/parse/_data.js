import data from '../data.js'

const toCardinal = {}
const toOrdinal = {}
const toNumber = {}

Object.keys(data).forEach(k => {
  data[k].forEach(a => {
    let [num, w, ord] = a
    toCardinal[ord] = w
    toOrdinal[w] = ord
    toNumber[w] = num
    // multi-word forms are hyphenated for display,
    // but the parser scans space-joined tokens
    let spaced = w.replace(/-/g, ' ')
    if (spaced !== w) {
      toNumber[spaced] = num
      toOrdinal[spaced] = ord
      toCardinal[ord.replace(/-/g, ' ')] = spaced
    }
    // add ordinal without accents
    let norm = ord.replace(/è/, 'e')
    toNumber[norm] = num
  })
})

// add some more
Object.assign(toNumber, {
  cents: 100,
  milles: 1000,
  millions: 1000000,
  milliards: 1000000000,
  'quatre vingts': 80,//with the final s
  zero: 0,//unaccented
})

export {
  toOrdinal,
  toCardinal,
  toNumber
}