import { forEachSync } from './_giga.js'
import doSentences from './french.js'
import fs from 'fs'


let ids = []
for (let i = 1; i <= 10; i += 1) {
  let str = String(i).padStart(4, '0')
  ids.push(str)
}
// ids = ['0004']

let tagMap = {
  'ABR': 'Abbreviation',//abbreviation
  'ADJ': 'Adjective',//adjective
  'ADV': 'Adverb',//adjective
  'DET:ART': 'Determiner',//article
  'DET:POS': 'Pronoun',//possessive pronoun (ma, ta, ...)
  'INT': 'Interjection',//interjection
  'KON': 'Conjunction',//conjunction
  'NAM': 'ProperNoun',//proper name
  'NOM': 'Noun',//noun
  'NUM': 'Value',//numeral
  'PRO': 'Pronoun',//pronoun
  'PRO:DEM': 'Pronoun',//demonstrative pronoun
  'PRO:IND': 'Pronoun',//indefinite pronoun
  'PRO:PER': 'Pronoun',//personal pronoun
  'PRO:POS': 'Pronoun',//possessive pronoun (mien, tien, ...)
  'PRO:REL': 'Pronoun',//relative pronoun
  'PRP': 'Preposition',//preposition
  'PRP:det': 'Preposition',//preposition plus article (au,du,aux,des)
  // 'PUN':'',//punctuation
  // 'PUN:cit':'',//punctuation citation
  // 'SENT':'',//sentence tag
  // 'SYM':'',//symbol
  'VER:cond': 'Verb',//verb conditional
  'VER:futu': 'Verb',//verb futur
  'VER:impe': 'Verb',//verb imperative
  'VER:impf': 'Verb',//verb imperfect
  'VER:infi': 'Verb',//verb infinitive
  'VER:pper': 'Verb',//verb past participle
  'VER:ppre': 'Verb',//verb present participle
  'VER:pres': 'Verb',//verb present
  'VER:simp': 'Verb',//verb simple past
  'VER:subi': 'Verb',//verb subjunctive imperfect
  'VER:subp': 'Verb',//verb subjunctive present
}

let byTag = {
  Verb: {},
  Noun: {},
  Adjective: {},
  Adverb: {},
}
const doBoth = function (both) {
  both.fr.forEach((term, i) => {
    let tag = tagMap[term['$'].pos]
    let str = term['$text'].toLowerCase()
    if (tag && byTag[tag]) {
      byTag[tag][str] = byTag[tag][str] || 0
      byTag[tag][str] += 1
    }
  })
}
await forEachSync(ids, async id => {
  try {
    console.log(`\ndoing ${id}:\n`)
    await doSentences(id, doBoth)
  } catch (e) {
    console.log(e)
  }
})

const doTag = function (tag, max = 6) {
  let all = Object.entries(byTag[tag])
  all = all.filter(a => a[1] > max)
  all = all.sort((a, b) => {
    if (a[1] > b[1]) {
      return -1
    } else if (a[1] < b[1]) {
      return 1
    }
    return 0
  })
  all = all.map(a => a[0])
  fs.writeFileSync(`./${tag}.js`, 'export default ' + JSON.stringify(all, null, 2))
  return all
}
doTag('Adverb')
doTag('Verb')
doTag('Noun')
doTag('Adjective')
// console.dir(byTag, { depth: 5 })