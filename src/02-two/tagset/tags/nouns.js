// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Noun: {
    aliases: [null, 'Nom'],
  },
  Singular: {
    aliases: [null, 'Singulier'],
    not: ['PluralNoun'],
  },
  ProperNoun: {
    aliases: [null, 'NomPropre'],
  },
  Person: {
    aliases: [null, 'Personne'],
  },
  FirstName: {
    aliases: [null, 'Prénom'],
  },
  MaleName: {
    aliases: [null, 'PrénomMasculin'],
  },
  FemaleName: {
    aliases: [null, 'PrénomFéminin'],
  },
  LastName: {
    aliases: [null, 'NomDeFamille'],
  },
  Honorific: {
    aliases: [null, 'Titre'],
    is: 'Noun',
  },
  Place: {
    aliases: [null, 'Lieu'],
  },
  Country: {
    aliases: [null, 'Pays'],
  },
  City: {
    aliases: [null, 'Ville'],
  },
  Region: {
    aliases: [null, 'Région'],
  },
  Address: {
    aliases: [null, 'Adresse'],
  },
  Organization: {
    aliases: [null, 'Organisation'],
  },
  SportsTeam: {
    aliases: [null, 'Équipe'],
  },
  School: {
    aliases: [null, 'École'],
  },
  Company: {
    aliases: [null, 'Entreprise'],
  },
  PluralNoun: {
    aliases: [null, 'Pluriel', 'Plural'],
    is: 'Noun',
    not: ['Singular'],
  },
  Uncountable: {
    aliases: [null, 'Indénombrable'],
  },
  Pronoun: {
    aliases: [null, 'Pronom'],
  },
  Actor: {
    not: ['Person', 'Place', 'Organization'],
  },
  Activity: {
    aliases: [null, 'Activité'],
  },
  Unit: {
    aliases: [null, 'Unité'],
  },
  Demonym: {
    aliases: [null, 'Gentilé'],
  },
  Possessive: {
    aliases: [null, 'Possessif'],
  },
  MaleNoun: {
    aliases: [null, 'NomMasculin'],
    is: 'Noun',
    not: ['FemaleNoun'],
  },
  FemaleNoun: {
    aliases: [null, 'NomFéminin'],
    is: 'Noun',
    not: ['MaleNoun'],
  },
}
