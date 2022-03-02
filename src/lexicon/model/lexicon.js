import lexData from './_data.js'
import { unpack } from 'efrt'
import conjugate from '../methods/conjugate.js'
import misc from './misc.js'



let words = {}
Object.keys(lexData).forEach(tag => {
  let wordsObj = unpack(lexData[tag])
  Object.keys(wordsObj).forEach(w => {
    words[w] = tag

    // expand
    if (tag === 'MaleAdjective') {
      let res = conjugate.adjective(w)
      words[res.female] = 'FemaleAdjective'
      words[res.plural] = 'MaleAdjective'
      words[res.femalePlural] = 'FemaleAdjective'
    }
    if (tag === 'MaleNoun') {
      let res = conjugate.noun(w)
      words[res.plural] = 'Plural'
    }
    if (tag === 'Infinitive') {
      // do future-tense
      let res = conjugate.futureTense(w)
      Object.keys(res).forEach(k => words[res[k]] = 'FutureTense')
      // do present-tense
      res = conjugate.presentTense(w)
      Object.keys(res).forEach(k => words[res[k]] = words[res[k]] || 'PresentTense')
      // do imperfect mood
      res = conjugate.imperfect(w)
      Object.keys(res).forEach(k => words[res[k]] = 'Verb')
      // past-participle
      let out = conjugate.pastParticiple(w)
      words[out] = 'PastTense'
    }
  })
})

let lexicon = Object.assign({}, words, misc)
// console.log(Object.keys(lexicon).length.toLocaleString(), 'words')
// console.log(lexicon['suis'])
export default lexicon