let data = require('../nouns/data')
let res = []

const sort = function (a) {
  return a.sort((a, b) => {
    if (a.length > b.length) {
      return 1
    } else if (a.length < b.length) {
      return -1
    }
    return 0
  })
}

data = data.forEach((a) => {
  let singular = []
  let plural = []
  a.forEach((str) => {
    if (str.endsWith('s') || str.endsWith('x')) {
      plural.push(str)
    } else {
      singular.push(str)
    }
  })
  if (plural.length === 2) {
    plural = sort(plural)
    singular = sort(singular)
    res.push(singular.concat(plural))
    // console.log(plural)
  }
})
console.log(JSON.stringify(res, null, 2))
