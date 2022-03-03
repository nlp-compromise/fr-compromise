//directory of files to pack with `node scripts/pack.js`
//they are stored in compressed form
import lex from './misc.js'

import firstnames from './people/firstnames.js'
import lastnames from './people/lastnames.js'
import maleNames from './people/maleNames.js'
import femaleNames from './people/femaleNames.js'
import honorifics from './people/honorifics.js'
import people from './people/people.js'

import countries from './places/countries.js'
import regions from './places/regions.js'
import places from './places/places.js'
import cities from './places/cities.js'

import cardinals from './numbers/cardinals.js'
import ordinals from './numbers/ordinals.js'
import units from './numbers/units.js'

import infinitives from './verbs/infinitives.js'

import masculine from './nouns/masculine.js'
import feminine from './nouns/feminine.js'
import sportsTeams from './nouns/sportsTeams.js'
import organizations from './nouns/organizations.js'
import possessives from './nouns/possessives.js'
import pronouns from './nouns/pronouns.js'

import masc from './adjectives/masc.js'

import dates from './dates/dates.js'
import months from './dates/months.js'
import weekdays from './dates/weekdays.js'

import adverbs from './misc/adverbs.js'
import conjunctions from './misc/conjunctions.js'
import currencies from './misc/currencies.js'
import expressions from './misc/expressions.js'
import determiners from './misc/determiners.js'
import prepositions from './misc/prepositions.js'
//add-in the generic, flat word-lists
const data = [
  [firstnames, 'FirstName'],
  [lastnames, 'LastName'],
  [maleNames, 'MaleName'],
  [femaleNames, 'FemaleName'],
  [honorifics, 'Honorific'],
  [people, 'Person'],

  [countries, 'Country'],
  [regions, 'Region'],
  [places, 'Place'],
  [cities, 'City'],

  [cardinals, 'Cardinal'],
  [ordinals, 'Ordinal'],
  [units, 'Unit'],

  [infinitives, 'Infinitive'],

  [masculine, 'MaleNoun'],
  [feminine, 'FemaleNoun'],
  [sportsTeams, 'SportsTeam'],
  [organizations, 'Organization'],
  [possessives, 'Possessive'],
  [pronouns, 'Pronoun'],

  [masc, 'MaleAdjective'],

  [adverbs, 'Adverb'],
  [conjunctions, 'Conjunction'],
  [currencies, 'Currency'],
  [expressions, 'Expression'],
  [determiners, 'Determiner'],
  [prepositions, 'Preposition'],

  [dates, 'Date'],
  [months, 'Month'],
  [weekdays, 'WeekDay'],
]
for (let i = 0; i < data.length; i++) {
  const list = data[i][0]
  for (let o = 0; o < list.length; o++) {
    //log duplicates
    // if (lex[list[o]]) {
    //   console.log(list[o] + '  ' + lex[list[o]] + ' ' + data[i][1])
    // }
    lex[list[o]] = data[i][1]
  }
}

export default lex
// console.log(Object.keys(lex).length);
// console.log(lex['suis'])
