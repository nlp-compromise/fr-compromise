module.exports = {
  n: 'Negative',
  ne: 'Negative',

  // copulas (incomplete)
  es: ['Copula', 'PresentTense'],
  est: ['Copula', 'PresentTense'],
  suis: ['Copula', 'PresentTense'],
  sommes: ['Copula', 'PresentTense'],
  etes: ['Copula', 'PresentTense'],
  sont: ['Copula', 'PresentTense'],

  ete: ['Copula', 'PastTense'],
  etais: ['Copula', 'PastTense'],
  etions: ['Copula', 'PastTense'],

  serons: ['Copula', 'FutureTense'],
  seront: ['Copula', 'FutureTense'],
  serai: ['Copula', 'FutureTense'],

  // questions
  ou: 'QuestionWord',
  qui: 'QuestionWord',
  quelle: 'QuestionWord',

  '&': 'Conjunction',

  si: 'Condition',
  sinon: 'Condition',

  //pronouns
  je: ['Pronoun', 'Singular'],
  il: ['Pronoun', 'Singular'],
  elle: ['Pronoun', 'Singular'],
  tu: ['Pronoun', 'Singular'],
  on: ['Pronoun', 'Plural'],
  vous: ['Pronoun', 'Plural'],
  nous: ['Pronoun', 'Plural'],
  ils: ['Pronoun', 'Plural'],
}
