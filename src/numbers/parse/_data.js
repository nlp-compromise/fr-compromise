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


export {
  toOrdinal,
  toCardinal,
  toNumber
}