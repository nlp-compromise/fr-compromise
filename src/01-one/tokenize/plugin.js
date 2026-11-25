import unicode from './unicode.js'
import contractions from './contractions.js'
import compute from './compute/index.js'
import abbreviations from './abbreviations.js'


export default {
  mutate: (world) => {
    world.model.one.unicode = unicode

    world.model.one.contractions = contractions

    // our own abbreviations, for the sentence-parser
    world.model.one.abbreviations = { ...abbreviations }
    // ordinal endings are not units - don't split '1re' or '2nde' like '5km'
    const notUnit = world.model.one.numberSuffixes || {}
    world.model.one.numberSuffixes = notUnit
    'ers,re,res,ere,eres,es,eme,emes,ieme,iemes,nde,nds,ndes'.split(',').forEach(str => {
      notUnit[str] = true
    })
  },
  compute
}