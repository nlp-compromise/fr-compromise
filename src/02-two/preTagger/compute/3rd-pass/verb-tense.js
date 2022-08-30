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

// guess a tense tag each Verb
const verbTense = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  if (tags.has('Verb')) {
    let str = term.implicit || term.normal || term.text || ''
    // if we have no tense
    if (!tenses.find(s => tags.has(s))) {
      if (str.endsWith('é')) {
        return setTag([term], 'Participle', world, false, '3-Participle-vb')
      }
    }
    // if we have no person-tag
    if (!person.find(s => tags.has(s))) {
    }
  }
  return null
}
export default verbTense