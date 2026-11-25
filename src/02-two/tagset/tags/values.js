// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Value: {
    aliases: [null, 'Nombre'],
  },
  Ordinal: {
  },
  Cardinal: {
  },
  Fraction: {
  },
  Multiple: {
  },
  RomanNumeral: {
    aliases: [null, 'ChiffreRomain'],
    not: ['TextValue'],
  },
  TextValue: {
    aliases: [null, 'Numéral'],
    not: ['NumericValue'],
  },
  NumericValue: {
    aliases: [null, 'Numérique'],
    not: ['TextValue'],
  },
  Money: {
    aliases: [null, 'Argent'],
  },
  Percent: {
    aliases: [null, 'Pourcentage'],
  },
}
