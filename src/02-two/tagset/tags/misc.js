const anything = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord']

export default {
  Adjective: {
    aliases: [null, 'Adjectif'],
    not: ['Noun', 'Verb', 'Adverb', 'Value'],
  },
  Comparable: {
    is: 'Adjective',
  },
  Comparative: {
    aliases: [null, 'Comparatif'],
    is: 'Adjective',
  },
  Superlative: {
    aliases: [null, 'Superlatif'],
    is: 'Adjective',
    not: ['Comparative'],
  },
  MaleAdjective: {
    aliases: [null, 'AdjectifMasculin'],
    is: 'Adjective',
    not: ['FemaleAdjective'],
  },
  FemaleAdjective: {
    aliases: [null, 'AdjectifFéminin'],
    is: 'Adjective',
    not: ['MaleAdjective'],
  },
  PluralAdjective: {
    aliases: [null, 'AdjectifPluriel'],
    is: 'Adjective',
  },
  NumberRange: {
    aliases: [null, 'PlageNumérique'],
  },
  Adverb: {
    aliases: [null, 'Adverbe'],
    not: ['Noun', 'Verb', 'Adjective', 'Value'],
  },

  Determiner: {
    aliases: [null, 'Déterminant', 'Article'],
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction', 'Preposition'], //allow 'a' to be a Determiner/Value
  },
  Conjunction: {
    aliases: [null, 'Conjonction'],
    not: anything,
  },
  Preposition: {
    aliases: [null, 'Préposition'],
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
  },
  QuestionWord: {
    aliases: [null, 'MotInterrogatif'],
    not: ['Determiner'],
  },
  Currency: {
    aliases: [null, 'Devise'],
    is: 'Noun',
  },
  Expression: {
    aliases: [null, 'Interjection'],
    not: ['Noun', 'Adjective', 'Verb', 'Adverb'],
  },
  Abbreviation: {
    aliases: [null, 'Abréviation'],
  },
  Url: {
    not: ['HashTag', 'PhoneNumber', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
  },
  PhoneNumber: {
    aliases: [null, 'Téléphone'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
  },
  HashTag: {},
  AtMention: {
    aliases: [null, 'Mention'],
    is: 'Noun',
    not: ['HashTag', 'Email'],
  },
  Emoji: {
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Emoticon: {
    aliases: [null, 'Émoticône'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Email: {
    aliases: [null, 'Courriel'],
    not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
  },
  Acronym: {
    aliases: [null, 'Acronyme'],
    not: ['PluralNoun', 'RomanNumeral'],
  },
  Negative: {
    aliases: [null, 'Négation'],
    not: ['Noun', 'Adjective', 'Value'],
  },
  Condition: {
    not: ['Verb', 'Adjective', 'Noun', 'Value'],
  },
}
