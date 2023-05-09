let person = ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']

let whichForm = [
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
  // present
  ['es', 'SecondPerson'],
  ['ons', 'FirstPersonPlural'],
  ['ez', 'SecondPersonPlural'],
  ['ent', 'ThirdPersonPlural'],
]
const pronouns = {
  je: 'FirstPerson',
  tu: 'SecondPerson',
  il: 'ThirdPerson',
  elle: 'ThirdPerson',
  nous: 'FirstPersonPlural',
  vous: 'SecondPersonPlural',
  ils: 'ThirdPersonPlural',
}
// can give us a hint to verb person, too
const auxiliaries = {
  // etre
  suis: 'FirstPerson',
  es: 'SecondPerson',
  est: 'ThirdPerson',
  sommes: 'FirstPersonPlural',
  êtes: 'SecondPersonPlural',
  sont: 'ThirdPersonPlural',
  serai: 'FirstPerson',
  seras: 'SecondPerson',
  sera: 'ThirdPerson',
  serons: 'FirstPersonPlural',
  serez: 'SecondPersonPlural',
  seront: 'ThirdPersonPlural',
  serait: 'ThirdPerson',
  serions: 'FirstPersonPlural',
  seriez: 'SecondPersonPlural',
  seraient: 'ThirdPersonPlural',

  // 'avoir'
  ai: 'FirstPerson',
  as: 'SecondPerson',
  a: 'ThirdPerson',
  avons: 'FirstPersonPlural',
  avez: 'SecondPersonPlural',
  ont: 'ThirdPersonPlural',
  // future anterior
  aurai: 'FirstPerson',
  auras: 'SecondPerson',
  aura: 'ThirdPerson',
  aurons: 'FirstPersonPlural',
  aurez: 'SecondPersonPlural',
  auront: 'ThirdPersonPlural',
  // Plus-que-parfait
  'avait': 'ThirdPerson',
  'avions': 'FirstPersonPlural',
  'aviez': 'SecondPersonPlural',
  'avaient': 'ThirdPersonPlural',
  // conditional avoir
  aurait: 'ThirdPerson',
  aurions: 'FirstPersonPlural',
  auriez: 'SecondPersonPlural',
  auraient: 'ThirdPersonPlural',
}

// guess a tense tag each Verb
const verbForm = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  if (tags.has('Verb')) {
    // console.log(term)
    let str = term.implicit || term.normal || term.text || ''
    // if we have no person-tag
    if (!person.find(s => tags.has(s))) {
      // look at the word suffix, for clues
      let found = whichForm.find(a => str.endsWith(a[0]))
      if (found) {
        return setTag([term], found[1], world, false, '3-person-suffix-' + found[1])
      }
      //look backwards for clues
      for (let back = 0; back < 3; back += 1) {
        if (!terms[i - back]) {
          break
        }
        let s = terms[i - back].normal
        //look backwards for a pronoun
        if (terms[i - back].tags.has('Pronoun')) {
          if (pronouns.hasOwnProperty(s)) {
            return setTag([term], pronouns[s], world, false, '3-person-pronoun-' + s)
          }
        }
        //look backwards for a auxiliary verb - 'sont'
        if (terms[i - back].tags.has('Verb')) {
          if (auxiliaries.hasOwnProperty(s)) {
            return setTag([term], auxiliaries[s], world, false, '3-person-auxiliary-' + s)
          }
        }
      }
    }
  }
  return null
}
export default verbForm