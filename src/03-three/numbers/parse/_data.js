import data from '../data.js'

const toCardinal = {}
const toOrdinal = {}
const toNumber = {}

Object.keys(data).forEach(k => {
  data[k].forEach(a => {
    const [num, w, ord] = a
    toCardinal[ord] = w
    toOrdinal[w] = ord
    toNumber[w] = num
    // multi-word forms are hyphenated for display,
    // but the parser scans space-joined tokens
    const spaced = w.replace(/-/g, ' ')
    if (spaced !== w) {
      toNumber[spaced] = num
      toOrdinal[spaced] = ord
      toCardinal[ord.replace(/-/g, ' ')] = spaced
    }
    // add ordinal without accents
    const norm = ord.replace(/è/, 'e')
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
  une: 1,
})
// 'premier' is the ordinal of 'un' - 'unième' is only used in 'vingt et unième'
'premier,première,premiere'.split(',').forEach(w => {
  toNumber[w] = 1
  toNumber[w + 's'] = 1
})
// belgian + swiss forms are parsed, but never written
const regional = { septant: 70, huitant: 80, octant: 80, nonant: 90 }
Object.keys(regional).forEach(w => {
  toNumber[w + 'e'] = regional[w]
  toNumber[w + 'ième'] = regional[w]
  toNumber[w + 'ieme'] = regional[w]
})
// the bottom-half of a written fraction - 'trois quarts'
const fractions = { demi: 2, demis: 2, tiers: 3, quart: 4, quarts: 4 }

export {
  toOrdinal,
  toCardinal,
  toNumber,
  fractions
}