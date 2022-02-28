import { forEachSync } from './_giga.js'
import doSentences from './french.js'
import fs from 'fs'
import nlp from '../../src/index.js'


let ids = []
for (let i = 1; i <= 10; i += 1) {
  let str = String(i).padStart(4, '0')
  ids.push(str)
}
ids = ['0004']

let tagMap = {
  'ABR': 'Acronym',//abbreviation
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

const ignore = new Set(['au', 'aux', 'des', 'au', 'ne'])

let right = 0
let wrong = 0
const doBoth = function (both) {
  let txt = both.fr.map(o => o['$text']).join(' ')
  txt = txt.replace(/ ([.,?):])/g, `$1`)
  let correct = {}
  both.fr.forEach((term, i) => {
    let tag = tagMap[term['$'].pos]
    if (tag) {
      let str = term['$text'].toLowerCase()
      correct[str] = tag
    }
  })
  let doc = nlp(txt)
  doc.terms().forEach(t => {
    let str = t.text('normal')
    let want = correct[str] || null
    if (want && !ignore.has(str)) {
      if (t.has('#' + want)) {
        right += 1
      } else {
        wrong += 1
        // console.log(txt)
        // console.log(want)
        // t.debug()
      }
    }
  })
}

const percent = (part, total) => {
  let num = (part / total) * 100;
  num = Math.round(num * 10) / 10;
  return num;
};

await forEachSync(ids, async id => {
  try {
    console.log(`\ndoing ${id}:\n`)
    await doSentences(id, doBoth)
    console.log(right, ` right  ${percent(right, right + wrong)}%`)
  } catch (e) {
    console.log(e)
  }
})
console.log(right, ` right  ${percent(right, right + wrong)}%`)
console.log(wrong, ` wrong ${percent(wrong, right + wrong)}%`)