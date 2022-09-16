import fixes from './fixes.js'
import adj from '/Users/spencer/mountain/fr-compromise/data/models/adjective/index.js'

let data = adj
//m: [f, p, fp]
let out = {}
Object.keys(fixes).forEach(k => {
  let arr = fixes[k]
  if (arr.length === 1) {
    // only got a plural
    out[k] = [k, arr[0], arr[0]]
  } else if (arr.length === 3) {
    // only fem plurals
    let [m, f, fp] = arr
    out[k] = [f, m, fp]
  }
})
data = Object.assign(data, out)
console.log(JSON.stringify(data, null, 2))