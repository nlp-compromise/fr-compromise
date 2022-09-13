import data from '/Users/spencer/mountain/fr-compromise/data/models/verb/present-tense.js'

let out = {}
Object.keys(data).forEach(k => {
  if (data[k][0] === data[k][4]) {
    out[k] = data[k]

  }
  if (k.match(" ")) {
    console.log(k)
  }
})

console.log(JSON.stringify(out, null, 2))