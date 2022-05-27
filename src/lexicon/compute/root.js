const verbForm = function (term) {
  let want = [
    'FirstPerson',
    'SecondPerson',
    'ThirdPerson',
    'FirstPersonPlural',
    'SecondPersonPlural',
    'ThirdPersonPlural',
  ]
  return want.find(tag => term.tags.has(tag))
}

const root = function (view) {
  const toRoot = view.world.methods.two.transform.toRoot
  view.docs.forEach(terms => {
    terms.forEach(term => {
      let str = term.implicit || term.normal || term.text
      // nouns -> singular masculine form
      if (term.tags.has('Noun') && !term.tags.has('Pronoun')) {
        let isPlural = term.tags.has('PluralNoun')
        let gender = term.tags.has('FemaleNoun') ? 'f' : 'm'
        term.root = toRoot.noun(str, isPlural, gender)
      }
      // adjectives -> singular masculine form
      if (term.tags.has('Adjective')) {
        let isPlural = term.tags.has('PluralAdjective')
        let gender = term.tags.has('FemaleAdjective') ? 'f' : 'm'
        term.root = toRoot.adjective(str, isPlural, gender)
      }
      // verbs -> infinitive form
      if (term.tags.has('Verb')) {
        if (term.tags.has('PresentTense')) {
          let form = verbForm(term)
          term.root = toRoot.verb.fromPresentTense(str, form)
        }
        if (term.tags.has('FutureTense')) {
          let form = verbForm(term)
          term.root = toRoot.verb.fromFutureTense(str, form)
        }
        //  fromImperfectTense, fromPastParticiple
      }
    })
  })
}
export default root