// hand-fixes that win over the packed lexicon (this file is merged last)
export default {
  // ==high-frequency words the packed lists get wrong==
  // ==avoir== - person-tags let compute('root') + verbs() find the infinitive
  // (the tagset keeps Auxiliary and PresentTense exclusive, so no tense-tag here)
  // 'a' = avoir 3rd-sing. (the accented 'à' is the preposition)
  a: ['Auxiliary', 'ThirdPerson'],
  ai: ['Auxiliary', 'FirstPerson'],
  as: ['Auxiliary', 'SecondPerson'],
  avons: ['Auxiliary', 'FirstPersonPlural'],
  avez: ['Auxiliary', 'SecondPersonPlural'],
  ont: ['Auxiliary', 'ThirdPersonPlural'],
  // 'eu' = past participle of avoir (was tagged Organization)
  eu: ['PastParticiple'],
  eus: ['PastParticiple'],
  eue: ['PastParticiple'],
  eues: ['PastParticiple'],
  // subject pronoun (was clobbered by 'taire' participle-adjective)
  tu: ['Pronoun'],
  // 'dit' = dire, present or participle (was MaleAdjective)
  dit: ['Verb', 'ThirdPerson'],
  // adverb (was MaleAdjective)
  plus: ['Adverb'],
  // participles of venir (were MaleAdjective)
  venu: ['PastParticiple'],
  venue: ['PastParticiple'],
  venus: ['PastParticiple'],
  venues: ['PastParticiple'],
  // missing common nouns with misleading endings
  homme: ['MaleNoun', 'Singular'],
  hommes: ['MaleNoun', 'PluralNoun'],
  monde: ['MaleNoun', 'Singular'],
  'idée': ['FemaleNoun', 'Singular'],
  'idées': ['FemaleNoun', 'PluralNoun'],
  // common adverbs
  'là': ['Adverb'],
  'tôt': ['Adverb'],
  ici: ['Adverb'],
  ensemble: ['Adverb'],
  // object clitics are pronouns, not possessives
  me: ['Pronoun'],
  te: ['Pronoun'],
  toi: ['Pronoun'],
  lui: ['Pronoun'],

  // ==être==
  // present
  es: ['Copula', 'PresentTense', 'SecondPerson'],
  est: ['Copula', 'PresentTense', 'ThirdPerson'],
  suis: ['Copula', 'PresentTense', 'FirstPerson'],
  sommes: ['Copula', 'PresentTense', 'FirstPersonPlural'],
  êtes: ['Copula', 'PresentTense', 'SecondPersonPlural'],
  etes: ['Copula', 'PresentTense', 'SecondPersonPlural'],
  sont: ['Copula', 'PresentTense', 'ThirdPersonPlural'],
  // imperfect
  étais: ['Copula', 'Imperfect'],
  etais: ['Copula', 'Imperfect'],
  était: ['Copula', 'Imperfect', 'ThirdPerson'],
  etait: ['Copula', 'Imperfect', 'ThirdPerson'],
  étions: ['Copula', 'Imperfect', 'FirstPersonPlural'],
  etions: ['Copula', 'Imperfect', 'FirstPersonPlural'],
  étiez: ['Copula', 'Imperfect', 'SecondPersonPlural'],
  étaient: ['Copula', 'Imperfect', 'ThirdPersonPlural'],
  etaient: ['Copula', 'Imperfect', 'ThirdPersonPlural'],
  // future
  serai: ['Copula', 'FutureTense', 'FirstPerson'],
  seras: ['Copula', 'FutureTense', 'SecondPerson'],
  sera: ['Copula', 'FutureTense', 'ThirdPerson'],
  serons: ['Copula', 'FutureTense', 'FirstPersonPlural'],
  serez: ['Copula', 'FutureTense', 'SecondPersonPlural'],
  seront: ['Copula', 'FutureTense', 'ThirdPersonPlural'],
  // conditional
  serais: ['Copula', 'ConditionalVerb'],
  serait: ['Copula', 'ConditionalVerb', 'ThirdPerson'],
  serions: ['Copula', 'ConditionalVerb', 'FirstPersonPlural'],
  seriez: ['Copula', 'ConditionalVerb', 'SecondPersonPlural'],
  seraient: ['Copula', 'ConditionalVerb', 'ThirdPersonPlural'],
  // passé simple
  fus: ['Copula', 'PastTense'],
  fut: ['Copula', 'PastTense', 'ThirdPerson'],
  fûmes: ['Copula', 'PastTense', 'FirstPersonPlural'],
  fûtes: ['Copula', 'PastTense', 'SecondPersonPlural'],
  furent: ['Copula', 'PastTense', 'ThirdPersonPlural'],
  // subjunctive
  fusse: ['Copula', 'PastTense'],
  fusses: ['Copula', 'PastTense'],
  fût: ['Copula', 'PastTense', 'ThirdPerson'],
  fussions: ['Copula', 'PastTense', 'FirstPersonPlural'],
  fussiez: ['Copula', 'PastTense', 'SecondPersonPlural'],
  fussent: ['Copula', 'PastTense', 'ThirdPersonPlural'],
  sois: ['Copula', 'PresentTense'],
  soit: ['Copula', 'PresentTense', 'ThirdPerson'],
  soyons: ['Copula', 'PresentTense', 'FirstPersonPlural'],
  soyez: ['Copula', 'PresentTense', 'SecondPersonPlural'],
  soient: ['Copula', 'PresentTense', 'ThirdPersonPlural'],
  // participle + infinitive
  été: ['Copula', 'PastParticiple'],
  ete: ['Copula', 'PastParticiple'],
  être: ['Copula', 'Infinitive'],
  etre: ['Copula', 'Infinitive'],

  // ==numbers==
  cent: ['Multiple', 'Cardinal'],
  mille: ['Multiple', 'Cardinal'],
  million: ['Multiple', 'Cardinal'],
  milliard: ['Multiple', 'Cardinal'],
  quadrillion: ['Multiple', 'Cardinal'],
  centième: ['Multiple', 'Ordinal'],
  millième: ['Multiple', 'Ordinal'],
  millionième: ['Multiple', 'Ordinal'],
  milliardième: ['Multiple', 'Ordinal'],
  billionième: ['Multiple', 'Ordinal'],
  trillionième: ['Multiple', 'Ordinal'],
  // plural numbers
  septs: ['TextValue', 'Cardinal'],
  vingts: ['TextValue', 'Cardinal'],//quatre-vingts
  'zéro': ['TextValue', 'Cardinal'],
  'zéroième': ['TextValue', 'Ordinal'],
  cents: ['Multiple', 'Cardinal'],
  milles: ['Multiple', 'Cardinal'],
  millions: ['Multiple', 'Cardinal'],
  milliards: ['Multiple', 'Cardinal'],
}
