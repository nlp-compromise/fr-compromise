import api from './api.js'

export default {
  api,
  // how the shared european-numbers plugin reads french digits - '1 234,56', '2e', '1ère'
  // 'loose' keeps '7,938' as seven-thousand
  model: {
    two: {
      europeanNumbers: {
        group: ' ',
        ordinal: '(?:er|re|nde?|i?[eè]me|[eè]re|e)s?',
        loose: true,
      },
    },
  },
}
