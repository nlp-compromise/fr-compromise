import tagger from './compute/index.js'
import tagRank from './tagRank.js'
import model from './model/index.js'
import methods from './methods/index.js'


export default {
  compute: {
    tagger,
    tagRank
  },
  methods,
  model: {
    two: model
  },
  hooks: ['tagger']
}