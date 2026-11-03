export default {
  Date: {
    not: ['Verb', 'Adverb', 'Adjective'],
  },
  Month: {
    aliases: [null, 'Mois'],
    is: 'Singular',
    also: ['Date'],
    not: ['Year', 'WeekDay', 'Time'],
  },
  WeekDay: {
    aliases: [null, 'JourDeLaSemaine'],
    is: 'Noun',
    also: ['Date'],
  },
  Year: {
    aliases: [null, 'Année'],
    is: 'Date',
    not: ['RomanNumeral'],
  },
  FinancialQuarter: {
    aliases: [null, 'Trimestre'],
    is: 'Date',
    not: 'Fraction',
  },
  // 'easter'
  Holiday: {
    aliases: [null, 'JourFérié'],
    is: 'Date',
    also: ['Noun'],
  },
  // 'summer'
  Season: {
    aliases: [null, 'Saison'],
    is: 'Date',
  },
  Timezone: {
    aliases: [null, 'FuseauHoraire'],
    is: 'Noun',
    also: ['Date'],
    not: ['ProperNoun'],
  },
  Time: {
    aliases: [null, 'Heure'],
    is: 'Date',
    not: ['AtMention'],
  },
  // 'months'
  Duration: {
    aliases: [null, 'Durée'],
    is: 'Noun',
    also: ['Date'],
  },
}
