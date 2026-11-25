// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Verb: {
    aliases: [null, 'Verbe'],
  },
  PresentTense: {
    aliases: [null, 'Présent'],
    not: ['PastTense'],
  },
  Infinitive: {
    aliases: [null, 'Infinitif'],
  },
  Imperative: {
    aliases: [null, 'Impératif'],
    is: 'Infinitive',
    not: undefined,
  },
  Gerund: {
    aliases: [null, 'Gérondif'],
  },
  PastTense: {
    aliases: [null, 'Passé'],
    not: ['PresentTense', 'Gerund'],
  },
  Copula: {
    aliases: [null, 'Copule'],
  },
  Modal: {
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
  },
  PhrasalVerb: {
  },
  Passive: {
    aliases: [null, 'Passif'],
    is: 'PastTense',
  },
  Particle: {
  },
  Auxiliary: {
    aliases: [null, 'Auxiliaire'],
  },
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
  PastSimple: {
    aliases: [null, 'PasséSimple'],
    is: 'PastTense',
    not: ['PresentTense', 'FutureTense'],
  },
  Imperfect: {
    aliases: [null, 'Imparfait'],
    is: 'PastTense',
    not: ['PresentTense', 'FutureTense'],
  },
  ConditionalVerb: {
    aliases: [null, 'Conditionnel'],
    is: 'Verb',
    not: ['PresentTense', 'PastTense', 'FutureTense'],
  },
  FutureTense: {
    aliases: [null, 'Futur'],
    not: ['PresentTense', 'PastTense', 'Gerund'],
  },
  FirstPerson: {
    aliases: [null, 'PremièrePersonne'],
    is: 'Verb',
    not: ['SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural'],
  },
  SecondPerson: {
    aliases: [null, 'DeuxièmePersonne'],
    is: 'Verb',
    not: ['FirstPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural'],
  },
  ThirdPerson: {
    aliases: [null, 'TroisièmePersonne'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural'],
  },
  FirstPersonPlural: {
    aliases: [null, 'PremièrePersonnePluriel'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'SecondPersonPlural', 'ThirdPersonPlural'],
  },
  SecondPersonPlural: {
    aliases: [null, 'DeuxièmePersonnePluriel'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'ThirdPersonPlural'],
  },
  ThirdPersonPlural: {
    aliases: [null, 'TroisièmePersonnePluriel'],
    is: 'Verb',
    not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural'],
  },
}
