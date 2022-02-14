export default {
  Verb: {
    not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
  },
  PresentTense: {
    is: 'Verb',
    not: ['PastTense'],
  },
  Infinitive: {
    is: 'PresentTense',
    not: ['Gerund'],
  },
  Imperative: {
    is: 'Infinitive',
  },
  Gerund: {
    is: 'PresentTense',
    not: ['Copula'],
  },
  PastTense: {
    is: 'Verb',
    not: ['PresentTense', 'Gerund'],
  },
  Copula: {
    is: 'Verb',
  },
  Modal: {
    is: 'Verb',
    not: ['Infinitive'],
  },
  PerfectTense: {
    is: 'Verb',
    not: ['Gerund'],
  },
  Pluperfect: {
    is: 'Verb',
  },
  Participle: {
    is: 'PastTense',
  },
  PhrasalVerb: {
    is: 'Verb',
  },
  Particle: {
    is: 'PhrasalVerb',
    not: ['PastTense', 'PresentTense', 'Copula', 'Gerund'],
  },
  Auxiliary: {
    is: 'Verb',
    not: ['PastTense', 'PresentTense', 'Gerund', 'Conjunction'],
  },

  // french verb forms
  PresentParticiple: {
    is: 'PresentTense',
    not: ['PastTense','FutureTense'],
  },
  PastParticiple: {
    is: 'PastTense',
    not: ['PresentTense','FutureTense'],
  },
  // [only formal]  parlai, parlâmes
  PastSimple: {
    is: 'PastTense',
    not: ['PresentTense','FutureTense'],
  },
  ConditionalVerb: {
    is: 'Verb',
  },
  FutureTense: {
    is: 'Verb',
    not: ['PresentTense', 'PastTense','Gerund'],
  },
}
