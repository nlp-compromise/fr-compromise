// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Adjective: {
    aliases: [null, 'Adjectif'],
  },
  Comparable: {
  },
  Comparative: {
    aliases: [null, 'Comparatif'],
  },
  Superlative: {
    aliases: [null, 'Superlatif'],
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
  },
  Determiner: {
    aliases: [null, 'Déterminant', 'Article'],
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction', 'Preposition'],
  },
  Conjunction: {
    aliases: [null, 'Conjonction'],
    is: undefined,
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord'],
  },
  Preposition: {
    aliases: [null, 'Préposition'],
    is: undefined,
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
  },
  QuestionWord: {
    aliases: [null, 'MotInterrogatif'],
  },
  Currency: {
    aliases: [null, 'Devise'],
  },
  Expression: {
    aliases: [null, 'Interjection'],
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
  HashTag: {
  },
  AtMention: {
    aliases: [null, 'Mention'],
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
    is: undefined,
  },
}
