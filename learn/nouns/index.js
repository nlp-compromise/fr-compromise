const data = require('./data')
let obj = {}
data.forEach((o) => {
  obj[o.lemma] = obj[o.lemma] || []
  obj[o.lemma].push(o.word)
})

let all = []
let keys = Object.keys(obj)
keys.forEach((k) => {
  if (obj[k].length === 4) {
    all.push(obj[k])
  }
})
console.log(all.length)
console.log(JSON.stringify(all, null, 2))
