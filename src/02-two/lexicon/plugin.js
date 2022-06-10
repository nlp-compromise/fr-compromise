import conjugate from './methods/conjugate.js'
import toRoot from './methods/toRoot/index.js'
import words from './model/lexicon.js'
import root from './compute/root.js'


export default {
  methods: {
    two: {
      transform: {
        conjugate,
        toRoot
      }
    }
  },
  model: {
    one: {
      lexicon: words
    }
  },
  compute: {
    root: root
  }
}