import unicode from './unicode.js'
import contractions from './contractions.js'
import compute from './compute/index.js'
import build from './sentences.js'
import sentenceRules from './abbreviations.js'
const { isSentence, wrap, abbreviations } = build(sentenceRules)


export default {
  mutate: (world) => {
    world.model.one.unicode = unicode

    world.model.one.contractions = contractions

    // our own abbreviations, and sentence-boundary rules
    world.model.one.abbreviations = { ...abbreviations }
    world.methods.one.tokenize.isSentence = isSentence
    world.methods.one.tokenize.splitSentences = wrap(world.methods.one.tokenize.splitSentences)
    // ordinal endings are not units - don't split '1re' or '2nde' like '5km'
    const notUnit = world.model.one.numberSuffixes || {}
    world.model.one.numberSuffixes = notUnit
    'ers,re,res,ere,eres,es,eme,emes,ieme,iemes,nde,nds,ndes'.split(',').forEach(str => {
      notUnit[str] = true
    })
  },
  compute
}