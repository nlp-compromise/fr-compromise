//directory of files to pack with `node scripts/pack.js`
//they are stored in compressed form
const lex = require('./misc')

//add-in the generic, flat word-lists
const data = [
  //abbreviations
  [require('./abbreviations/misc'), 'Abbreviation'],
  [require('./abbreviations/units'), ['Abbreviation', 'Unit']],
  [require('./abbreviations/nouns'), ['Abbreviation', 'Noun']],
  [require('./abbreviations/honorifics'), ['Abbreviation', 'Honorific']],
  [require('./abbreviations/months'), ['Abbreviation', 'Month']],
  [require('./abbreviations/organizations'), ['Abbreviation', 'Organization']],
  [require('./abbreviations/places'), ['Abbreviation', 'Place']],
  //people
  [require('./people/firstnames'), 'FirstName'],
  [require('./people/lastnames'), 'LastName'],
  [require('./people/maleNames'), 'MaleName'],
  [require('./people/femaleNames'), 'FemaleName'],
  [require('./people/honorifics'), 'Honorific'],
  [require('./people/people'), 'Person'],
  // places
  [require('./places/countries'), 'Country'],
  [require('./places/regions'), 'Region'],
  [require('./places/places'), 'Place'],
  [require('./places/cities'), 'City'],
  // verbs
  [require('./verbs/infinitives'), 'Infinitive'],
  // nouns
  [require('./nouns/masculine'), 'MascNoun'],
  [require('./nouns/feminine'), 'FemmeNoun'],
  [require('./nouns/sportsTeams'), 'SportsTeam'],
  [require('./nouns/organizations'), 'Organization'],
  // misc
  [require('./misc/adverbs'), 'Adverb'],
  [require('./misc/conjunctions'), 'Conjunction'],
  [require('./misc/currencies'), 'Currency'],
  [require('./misc/expressions'), 'Expression'],
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

module.exports = lex
// console.log(Object.keys(lex).length);
// console.log(lex['zero'])
