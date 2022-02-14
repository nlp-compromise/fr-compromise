import conjugate from './methods/conjugate.js'
import lexicon from './lexicon.js'

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
  },
  hooks: ['lexicon']
}