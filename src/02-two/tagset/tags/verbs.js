export default {
  Verb: {
    aliases: [null, 'Verbe'],
    not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
  },
  PresentTense: {
    aliases: [null, 'Présent'],
    is: 'Verb',
    not: ['PastTense'],
  },
  Infinitive: {
    aliases: [null, 'Infinitif'],
    is: 'PresentTense',
    not: ['Gerund'],
  },
  Imperative: {
    aliases: [null, 'Impératif'],
    is: 'Infinitive',
  },
  Gerund: {
    aliases: [null, 'Gérondif'],
    is: 'PresentTense',
    not: ['Copula'],
  },
  PastTense: {
    aliases: [null, 'Passé'],
    is: 'Verb',
    not: ['PresentTense', 'Gerund'],
  },
  Copula: {
    aliases: [null, 'Copule'],
    is: 'Verb',
  },
  Modal: {
    is: 'Verb',
    not: ['Infinitive'],
  },
  PerfectTense: {
    aliases: [null, 'PasséComposé'],
    is: 'Verb',
    not: ['Gerund'],
  },
  Pluperfect: {
    aliases: [null, 'PlusQueParfait'],
    is: 'Verb',
  },
  Participle: {
    aliases: [null, 'Participe'],
    is: 'PastTense',
  },
  PhrasalVerb: {
    is: 'Verb',
  },
  Passive: {
    aliases: [null, 'Passif'],
    is: 'PastTense',
  },
  Particle: {
    is: 'PhrasalVerb',
    not: ['PastTense', 'PresentTense', 'Copula', 'Gerund'],
  },
  Auxiliary: {
    aliases: [null, 'Auxiliaire'],
    is: 'Verb',
    not: ['PastTense', 'PresentTense', 'Gerund', 'Conjunction'],
  },

  // french verb forms
  PresentParticiple: {
    aliases: [null, 'ParticipePrésent'],
    is: 'PresentTense',
    not: ['PastTense', 'FutureTense'],
  },
  PastParticiple: {
    aliases: [null, 'ParticipePassé'],
    is: 'PastTense',
    not: ['PresentTense', 'FutureTense'],
  },
  // [only formal]  parlai, parlâmes
  PastSimple: {
    aliases: [null, 'PasséSimple'],
    is: 'PastTense',
    not: ['PresentTense', 'FutureTense'],
  },
  // imparfait - parlais, parlait
  Imperfect: {
    aliases: [null, 'Imparfait'],
    is: 'PastTense',
    not: ['PresentTense', 'FutureTense'],
  },
  // parlerais, voudrait
  ConditionalVerb: {
    aliases: [null, 'Conditionnel'],
    is: 'Verb',
    not: ['PresentTense', 'PastTense', 'FutureTense'],
  },
  FutureTense: {
    aliases: [null, 'Futur'],
    is: 'Verb',
    not: ['PresentTense', 'PastTense', 'Gerund'],
  },

  // 
  FirstPerson: {
    aliases: [null, 'PremièrePersonne'],
    is: 'Verb',
    not: ['SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
  },
  SecondPerson: {
    aliases: [null, 'DeuxièmePersonne'],
    is: 'Verb',
    not: ['FirstPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
  },
  ThirdPerson: {
    aliases: [null, 'TroisièmePersonne'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
  },
  FirstPersonPlural: {
    aliases: [null, 'PremièrePersonnePluriel'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'SecondPersonPlural', 'ThirdPersonPlural']
  },
  SecondPersonPlural: {
    aliases: [null, 'DeuxièmePersonnePluriel'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'ThirdPersonPlural']
  },
  ThirdPersonPlural: {
    aliases: [null, 'TroisièmePersonnePluriel'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural']
  },
}
