const tenses = [
  'PresentTense',
  'Infinitive',
  'Imperative',
  'Gerund',
  'PastTense',
  'Modal',
  'Auxiliary',
  'PerfectTense',
  'Pluperfect',
  'ConditionalVerb',
  'FutureTense',
]

let person = ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']

let whichTense = [

  //er - present conditional 
  ['erais', 'ConditionalVerb'],
  ['erait', 'ConditionalVerb'],
  ['erions', 'ConditionalVerb'],
  ['eriez', 'ConditionalVerb'],
  ['eraient', 'ConditionalVerb'],

  //er- future
  ['erai', 'FutureTense'],
  ['era', 'FutureTense'],
  ['erons', 'FutureTense'],
  ['erez', 'FutureTense'],
  ['eront', 'FutureTense'],

  // er - imparfait -> PastTense
  ['ais', 'PastTense'],
  ['ait', 'PastTense'],
  ['ions', 'PastTense'],
  ['iez', 'PastTense'],
  ['ient', 'PastTense'],

  // past-participle
  ['és', 'PastParticiple'],
  ['ée', 'PastParticiple'],
  ['é', 'Participle'],
  ['u', 'Participle'],//entendu
]

let whichForm = [
  // present
  ['es', 'SecondPerson'],
  ['ons', 'FirstPersonPlural'],
  ['ez', 'SecondPersonPlural'],
  ['ent', 'ThirdPersonPlural'],
  // future
  ['ai', 'FirstPerson'],
  ['tas', 'SecondPerson'],
  ['ta', 'ThirdPerson'],
  ['âmes', 'FirstPersonPlural'],
  ['âtes', 'SecondPersonPlural'],
  ['èrent', 'ThirdPersonPlural'],
  // imperfect
  ['ait', 'ThirdPerson'],
  // futur
  ['eras', 'SecondPerson'],
  ['eront', 'ThirdPersonPlural'],
  // imparfait
  ['asse', 'FirstPerson'],
  ['asses', 'SecondPerson'],
  ['tât', 'ThirdPerson'],

]

// guess a tense tag each Verb
const verbTense = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  if (tags.has('Verb')) {
    // console.log(term)
    let str = term.implicit || term.normal || term.text || ''
    // if we have no tense
    if (!tenses.find(s => tags.has(s))) {
      let found = whichTense.find(a => str.endsWith(a[0]))
      if (found) {
        setTag([term], a[1], world, false, '3-tense-suffix-' + a[1])
      } else {
        setTag([term], 'PresentTense', world, false, '3-tense-fallback')
      }
    }
    // if we have no person-tag
    if (!person.find(s => tags.has(s))) {
      whichForm.forEach(a => {
        if (str.endsWith(a[0])) {
          return setTag([term], a[1], world, false, '3-person-suffix-' + a[1])
        }
      })
    }
  }
  return null
}
export default verbTense