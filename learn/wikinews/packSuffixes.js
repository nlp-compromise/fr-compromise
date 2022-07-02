const fs = require('fs')
const suff = require('../../src/tagger/data/suffixMap.js')

// find any long suffixes that are covered by shorter ones
const twos = suff[5]
const twoWords = Object.keys(twos)
let count = 0

for (let i = 6; i <= 6; i += 1) {
  twoWords.forEach((ending) => {
    let testWords = Object.keys(suff[i])
    testWords.forEach((w) => {
      if (w.endsWith(ending)) {
        if (twos[ending] === suff[i][w]) {
          count += 1
          console.log('kill:', w, `(${ending})`)
          delete suff[i][w]
        }
      }
    })
  })
}

// console.log(count)
console.log(JSON.stringify(suff, null, 2))
