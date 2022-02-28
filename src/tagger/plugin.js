import tagger from './compute/index.js'
import tagRank from './tagRank.js'
import model from './model/index.js'

export default {
  compute: {
    tagger,
    tagRank
  },
  model: {
    two: model
  },
  hooks: ['tagger']
}