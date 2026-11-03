export default {
  Value: {
    aliases: [null, 'Nombre'],
    not: ['Verb', 'Adjective', 'Adverb'],
  },
  Ordinal: {
    is: 'Value',
    not: ['Cardinal'],
  },
  Cardinal: {
    is: 'Value',
    not: ['Ordinal'],
  },
  Fraction: {
    is: 'Value',
    not: ['Noun'],
  },
  Multiple: {
    is: 'TextValue',
  },
  RomanNumeral: {
    aliases: [null, 'ChiffreRomain'],
    is: 'Cardinal',
    not: ['TextValue'],
  },
  TextValue: {
    aliases: [null, 'Numéral'],
    is: 'Value',
    not: ['NumericValue'],
  },
  NumericValue: {
    aliases: [null, 'Numérique'],
    is: 'Value',
    not: ['TextValue'],
  },
  Money: {
    aliases: [null, 'Argent'],
    is: 'Cardinal',
  },
  Percent: {
    aliases: [null, 'Pourcentage'],
    is: 'Value',
  },
}
