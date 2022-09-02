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
  const transform = view.world.methods.two.transform
  view.docs.forEach(terms => {
    terms.forEach(term => {
      let str = term.implicit || term.normal || term.text
      // nouns -> singular masculine form
      if (term.tags.has('Noun') && !term.tags.has('Pronoun')) {
        let isPlural = term.tags.has('PluralNoun')
        // let isFemale = term.tags.has('FemaleNoun')
        if (isPlural) {
          term.root = transform.noun.fromPlural(str)
          // if (isFemale) {
          // } else {
          //   term.root = transform.noun.fromPlural(str)
          // }
        }
      }
      // adjectives -> singular masculine form
      if (term.tags.has('Adjective')) {
        let isPlural = term.tags.has('PluralAdjective')
        let isFemale = term.tags.has('FemaleAdjective')
        if (isPlural && isFemale) {
          term.root = transform.adjective.fromFemalePlural(str)
        } else if (isFemale) {
          term.root = transform.adjective.fromFemale(str)
        } else if (isPlural) {
          term.root = transform.adjective.fromPlural(str)
        }
      }
      // verbs -> infinitive form
      if (term.tags.has('Verb')) {
        if (term.tags.has('PresentTense')) {
          let form = verbForm(term)
          term.root = transform.verb.fromPresentTense(str, form)
        }
        if (term.tags.has('FutureTense')) {
          let form = verbForm(term)
          term.root = transform.verb.fromFutureTense(str, form)
        }
        if (term.tags.has('PastTense')) {
          let form = verbForm(term)
          term.root = transform.verb.fromPastParticiple(str, form)
        }
        //  fromImperfectTense, fromPastParticiple
      }
    })
  })
}
export default root