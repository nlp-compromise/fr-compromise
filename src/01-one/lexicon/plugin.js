import methods from './methods/index.js'
import words from './model/lexicon.js'
import root from './compute/root.js'

export default {
  methods: {
    two: {
      transform: methods
    }
  },
  words,
  compute: {
    root: root
  }
}