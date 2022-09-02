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

let ends = [
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
      if (str.endsWith('é')) {
        return setTag([term], 'Participle', world, false, '3-Participle-vb')
      }
    }
    // if we have no person-tag
    if (!person.find(s => tags.has(s))) {
      ends.forEach(a => {
        if (str.endsWith(a[0])) {
          return setTag([term], a[1], world, false, '3-person-suffix-' + a[1])
        }
      })
    }
  }
  return null
}
export default verbTense