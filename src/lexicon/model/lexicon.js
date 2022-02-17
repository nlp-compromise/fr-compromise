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
      let res = conjugate.adjectives(w)
      lexicon[res.Female] = 'FemaleAdjective'
      lexicon[res.MalePlural] = 'MaleAdjective'
      lexicon[res.FemalePlural] = 'FemaleAdjective'
    }

  })
})

console.log(Object.keys(lexicon).length.toLocaleString(), 'words')

// console.log(lexicon['éthérés'])

export default lexicon