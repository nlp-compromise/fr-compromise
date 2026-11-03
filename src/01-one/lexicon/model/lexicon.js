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

const words = {}
Object.keys(lexData).forEach(tag => {
  const wordsObj = unpack(lexData[tag])
  Object.keys(wordsObj).forEach(w => {
    words[w] = tag

    // expand
    if (tag === 'MaleAdjective') {
      const res = transform.adjective.conjugate(w)
      words[res.female] = words[res.female] || 'FemaleAdjective'
      words[res.plural] = words[res.plural] || 'MaleAdjective'
      words[res.femalePlural] = words[res.femalePlural] || 'FemaleAdjective'
    }
    if (tag === 'Cardinal') {
      words[w] = ['TextValue', 'Cardinal']
    }
    if (tag === 'Noun' || tag === 'MaleNoun' || tag === 'FemaleNoun') {
      words[w] = [tag, 'Singular']
      const plur = transform.noun.toPlural(w)
      words[plur] = words[plur] || ['Noun', 'Plural']
    }
    if (tag === 'Ordinal') {
      words[w] = ['TextValue', 'Ordinal']
      const norm = w.replace(/è/, 'e')
      words[norm] = words[norm] || ['TextValue', 'Ordinal']
    }
    if (tag === 'MaleNoun') {
      const p = transform.noun.toPlural(w)
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
      // do conditional mood
      res = transform.verb.toConditional(w)
      Object.keys(res).forEach(k => {
        if (!words[res[k]]) {
          words[res[k]] = [tagMap[k], 'ConditionalVerb']
        }
      })
      // do imperfect mood
      res = transform.verb.toImperfect(w)
      Object.keys(res).forEach(k => {
        if (!words[res[k]]) {
          words[res[k]] = [tagMap[k], 'Imperfect']
        }
      })
      // past-participle
      const out = transform.verb.toPastParticiple(w)
      words[out] = words[out] || 'PastParticiple'
    }
  })
})

const lexicon = Object.assign({}, words, misc)
// console.log(Object.keys(lexicon).length.toLocaleString(), 'words')
// console.log(lexicon['ralentir'])
export default lexicon