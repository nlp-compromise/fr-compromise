const unpack = require('efrt-unpack')
const lexData = require('./_data')
const tagset = require('./tagset')

const transforms = {
  adjectives: require('../transforms/adjectives'),
  conjugate: require('../transforms/conjugate'),
  toInfinitive: require('../transforms/toInfinitive'),
  toPlural: require('../transforms/toPlural'),
  toSingular: require('../transforms/toSingular'),
}

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

// basically, turn our english context into french
const buildWorld = function (world) {
  // supply our french lexicon
  let lexicon = unpackWords(lexData)
  world.addWords(lexicon)
  // console.log(world.stats())

  // add our conjugators
  world.transforms = transforms
  // add our french tags
  world.addTags(tagset)
  return world
}
module.exports = buildWorld
