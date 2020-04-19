let data = require('./verbs')
console.log(data.length)

data = data
  .map((a) => {
    // let er = a.find((s) => s.match(/er$/))
    let re = a.find((s) => s.match(/re$/))
    // let ez = a.find((s) => s.match(/ez$/))
    // let ons = a.find((s) => s.match(/ons$/))
    return re
  })
  .filter((f) => f)
console.log(JSON.stringify(data, null, 2))
