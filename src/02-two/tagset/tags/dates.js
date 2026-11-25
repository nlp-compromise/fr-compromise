// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Date: {
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
    not: undefined,
  },
  Year: {
    aliases: [null, 'Année'],
    not: ['RomanNumeral'],
  },
  FinancialQuarter: {
    aliases: [null, 'Trimestre'],
    not: 'Fraction',
  },
  Holiday: {
    aliases: [null, 'JourFérié'],
  },
  Season: {
    aliases: [null, 'Saison'],
    not: undefined,
  },
  Timezone: {
    aliases: [null, 'FuseauHoraire'],
    is: 'Noun',
    also: ['Date'],
  },
  Time: {
    aliases: [null, 'Heure'],
    not: ['AtMention'],
  },
  Duration: {
    aliases: [null, 'Durée'],
    is: 'Noun',
    also: ['Date'],
  },
}
