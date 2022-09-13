import data from '/Users/spencer/mountain/fr-compromise/data/models/adjective/index.js'

let out = {}
Object.keys(data).forEach(k => {
  if (k === data[k][0] && k === data[k][1] && k === data[k][2]) {
    out[k] = data[k]

  }
  if (k.endsWith("eux")) {
  }
})

console.log(JSON.stringify(out, null, 2))