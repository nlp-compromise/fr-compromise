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
  })
})

// add some more
Object.assign(toNumber, {
  cents: 100,
  milles: 1000,
  millions: 1000000,
  milliards: 1000000000,
})

export {
  toOrdinal,
  toCardinal,
  toNumber
}