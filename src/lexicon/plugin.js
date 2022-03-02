import conjugate from './methods/conjugate.js'
import words from './model/lexicon.js'

export default {
  methods: {
    one: {
      transform: {
        conjugate
      }
    }
  },
  model: {
    one: {
      lexicon: words
    }
  }
}