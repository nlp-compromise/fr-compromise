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
        let form = verbForm(term)
        if (term.tags.has('Infinitive')) {
          // already the root
        } else if (term.tags.has('ConditionalVerb')) {
          term.root = transform.verb.fromConditional(str)
        } else if (term.tags.has('FutureTense')) {
          term.root = transform.verb.fromFutureTense(str, form)
        } else if (term.tags.has('Imperfect')) {
          term.root = transform.verb.fromImperfectTense(str, form)
        } else if (term.tags.has('Passive')) {
          term.root = transform.verb.fromPassive(str, form)
        } else if (term.tags.has('PastTense')) {
          term.root = transform.verb.fromPastParticiple(str)
        } else if (term.tags.has('PresentTense')) {
          term.root = transform.verb.fromPresentTense(str, form)
        }
      }
    })
  })
}
export default root