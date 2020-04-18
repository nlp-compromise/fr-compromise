const fs = require('fs')

let lines = fs
  .readFileSync(__dirname + '/wikinews.txt')
  .toString()
  .split(/\n/)

// lines = lines.slice(0, 100)

const mapping = {
  NPP: 'N',
  NC: 'N',
  U: 'N',
  ET: 'N',

  VINF: 'V',
  VS: 'V',
  VPP: 'PastTense',
  VPR: 'Gerund',
}

lines = lines.map((str) => {
  let words = str.split(/ /g)
  words = words.map((w) => {
    let arr = w.split(/_/)
    let tag = (arr[1] || '').trim()
    tag = mapping[tag] || tag
    return {
      word: arr[0].trim(),
      tag: tag,
    }
  })
  words = words.filter((w) => w.tag && w.word && w.tag !== 'PONCT')
  return words
})
module.exports = lines
