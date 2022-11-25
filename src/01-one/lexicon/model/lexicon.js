import lexData from './_data.js'
import { unpack } from 'efrt'
import transform from '../methods/index.js'
import misc from './misc.js'

const tagMap = {
  first: 'FirstPerson',
  second: 'SecondPerson',
  third: 'ThirdPerson',
  firstPlural: 'FirstPersonPlural',
  secondPlural: 'SecondPersonPlural',
  thirdPlural: 'ThirdPersonPlural',
}

let words = {}
Object.keys(lexData).forEach(tag => {
  let wordsObj = unpack(lexData[tag])
  Object.keys(wordsObj).forEach(w => {
    words[w] = tag

    // expand
    if (tag === 'MaleAdjective') {
      let res = transform.adjective.conjugate(w)
      words[res.female] = words[res.female] || 'FemaleAdjective'
      words[res.plural] = words[res.plural] || 'MaleAdjective'
      words[res.femalePlural] = words[res.femalePlural] || 'FemaleAdjective'
    }
    if (tag === 'Cardinal') {
      words[w] = words[w] || ['TextValue', 'Cardinal']
    }
    if (tag === 'Ordinal') {
      words[w] = words[w] || ['TextValue', 'Ordinal']
      let norm = w.replace(/è/, 'e')
      words[norm] = words[norm] || ['TextValue', 'Ordinal']
    }
    if (tag === 'MaleNoun') {
      let p = transform.noun.toPlural(w)
      words[p] = words[p] || 'PluralNoun'
    }
    if (tag === 'Infinitive') {
      // do future-tense
      let res = transform.verb.toFutureTense(w)
      Object.keys(res).forEach(k => {
        if (!words[res[k]]) {
          words[res[k]] = words[res[k]] || [tagMap[k], 'FutureTense']
        }
      })
      // do present-tense
      res = transform.verb.toPresentTense(w)
      Object.keys(res).forEach(k => {
        if (!words[res[k]]) {
          words[res[k]] = words[res[k]] || [tagMap[k], 'PresentTense']
        }
      })
      // do imperfect mood
      res = transform.verb.toImperfect(w)
      Object.keys(res).forEach(k => words[res[k]] = 'Verb')
      // past-participle
      let out = transform.verb.toPastParticiple(w)
      words[out] = words[out] || 'PastParticiple'
    }
  })
})

let lexicon = Object.assign({}, words, misc)
// console.log(Object.keys(lexicon).length.toLocaleString(), 'words')
// console.log(lexicon['fatigué'])
export default lexicon