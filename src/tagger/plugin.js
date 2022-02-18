import tagger from './compute/index.js'
import tagRank from './tagRank.js'

export default {
  compute: {
    tagger,
    tagRank
  },
  hooks: ['tagger']
}