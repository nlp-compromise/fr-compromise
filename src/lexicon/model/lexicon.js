import lexData from './_data.js'
import { unpack } from 'efrt'
import conjugate from '../methods/conjugate.js'


let lexicon = {}

Object.keys(lexData).forEach(tag => {
  let wordsObj = unpack(lexData[tag])
  Object.keys(wordsObj).forEach(w => {
    lexicon[w] = tag

    // expand
    if (tag === 'MaleAdjective') {
      let res = conjugate.adjective(w)
      lexicon[res.female] = 'FemaleAdjective'
      lexicon[res.plural] = 'MaleAdjective'
      lexicon[res.femalePlural] = 'FemaleAdjective'
    }
    if (tag === 'MaleNoun') {
      let res = conjugate.noun(w)
      lexicon[res.plural] = 'Plural'
    }
    if (tag === 'Infinitive') {
      // do future-tense
      let res = conjugate.futureTense(w)
      Object.keys(res).forEach(k => lexicon[res[k]] = 'FutureTense')
      // do present-tense
      res = conjugate.presentTense(w)
      Object.keys(res).forEach(k => lexicon[res[k]] = 'PresentTense')
      // do imperfect mood
      res = conjugate.imperfect(w)
      Object.keys(res).forEach(k => lexicon[res[k]] = 'Verb')
      // past-participle
      let out = conjugate.pastParticiple(w)
      lexicon[out] = 'PastTense'
    }
  })
})

// console.log(Object.keys(lexicon).length.toLocaleString(), 'words')
// console.log(lexicon['éthérés'])
export default lexicon