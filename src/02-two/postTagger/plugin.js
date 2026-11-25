import postTagger from './matches.js'

// the whole tagging process, for re-tagging text after a change
const tagger = view => view.compute(['freeze', 'lexicon', 'preTagger', 'europeanNumbers', 'postTagger', 'unfreeze'])

export default {
  compute: {
    postTagger,
    tagger
  },
  hooks: ['postTagger']
}
