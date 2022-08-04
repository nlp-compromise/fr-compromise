import { uncompress } from 'suffix-thumb'
import packed from './_data.js'

// uncompress them
let model = Object.keys(packed).reduce((h, k) => {
  h[k] = {}
  Object.keys(packed[k]).forEach(form => {
    h[k][form] = uncompress(packed[k][form])
  })
  return h
}, {})

export default model