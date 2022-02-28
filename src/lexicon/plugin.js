import conjugate from './methods/conjugate.js'
import lexicon from './model/lexicon.js'

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
      lexicon
    }
  }
}