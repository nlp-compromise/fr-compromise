const unpack = require('efrt-unpack')
const lexData = require('./_data')

const unpackWords = function (data) {
  let lexicon = {}
  let tags = Object.keys(data)
  for (let i = 0; i < tags.length; i++) {
    let words = Object.keys(unpack(data[tags[i]]))
    for (let w = 0; w < words.length; w++) {
      lexicon[words[w]] = tags[i]
    }
  }
  return lexicon
}

const buildWorld = function (world) {
  // supply our french lexicon
  let lexicon = unpackWords(lexData)
  world.addWords(lexicon)

  // console.log(world.stats())
  return world
}
module.exports = buildWorld
