const fs = require('fs')

let lines = fs
  .readFileSync(__dirname + '/wikinews.txt')
  .toString()
  .split(/\n/)

// lines = lines.slice(0, 100)

lines = lines.map((str) => {
  let words = str.split(/ /g)
  words = words.map((w) => {
    let arr = w.split(/_/)
    return {
      word: arr[0].trim(),
      tag: (arr[1] || '').trim(),
    }
  })
  words = words.filter((w) => w.tag && w.word && w.tag !== 'PONCT')
  return words
})
module.exports = lines
