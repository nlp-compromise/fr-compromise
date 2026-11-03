const entity = ['Person', 'Place', 'Organization']

export default {
  Noun: {
    aliases: [null, 'Nom'],
    not: ['Verb', 'Adjective', 'Adverb', 'Value', 'Determiner'],
  },
  Singular: {
    aliases: [null, 'Singulier'],
    is: 'Noun',
    not: ['PluralNoun'],
  },
  ProperNoun: {
    aliases: [null, 'NomPropre'],
    is: 'Noun',
  },
  Person: {
    aliases: [null, 'Personne'],
    is: 'Singular',
    also: ['ProperNoun'],
    not: ['Place', 'Organization', 'Date'],
  },
  FirstName: {
    aliases: [null, 'Prénom'],
    is: 'Person',
  },
  MaleName: {
    aliases: [null, 'PrénomMasculin'],
    is: 'FirstName',
    not: ['FemaleName', 'LastName'],
  },
  FemaleName: {
    aliases: [null, 'PrénomFéminin'],
    is: 'FirstName',
    not: ['MaleName', 'LastName'],
  },
  LastName: {
    aliases: [null, 'NomDeFamille'],
    is: 'Person',
    not: ['FirstName'],
  },
  Honorific: {
    aliases: [null, 'Titre'],
    is: 'Noun',
    not: ['FirstName', 'LastName', 'Value'],
  },
  Place: {
    aliases: [null, 'Lieu'],
    is: 'Singular',
    not: ['Person', 'Organization'],
  },
  Country: {
    aliases: [null, 'Pays'],
    is: 'Place',
    also: ['ProperNoun'],
    not: ['City'],
  },
  City: {
    aliases: [null, 'Ville'],
    is: 'Place',
    also: ['ProperNoun'],
    not: ['Country'],
  },
  Region: {
    aliases: [null, 'Région'],
    is: 'Place',
    also: ['ProperNoun'],
  },
  Address: {
    aliases: [null, 'Adresse'],
    // is: 'Place',
  },
  Organization: {
    aliases: [null, 'Organisation'],
    is: 'ProperNoun',
    not: ['Person', 'Place'],
  },
  SportsTeam: {
    aliases: [null, 'Équipe'],
    is: 'Organization',
  },
  School: {
    aliases: [null, 'École'],
    is: 'Organization',
  },
  Company: {
    aliases: [null, 'Entreprise'],
    is: 'Organization',
  },
  PluralNoun: {
    aliases: [null, 'Pluriel', 'Plural'],
    is: 'Noun',
    not: ['Singular'],
  },
  Uncountable: {
    aliases: [null, 'Indénombrable'],
    is: 'Noun',
  },
  Pronoun: {
    aliases: [null, 'Pronom'],
    is: 'Noun',
    not: entity,
  },
  Actor: {
    is: 'Noun',
    not: entity,
  },
  Activity: {
    aliases: [null, 'Activité'],
    is: 'Noun',
    not: ['Person', 'Place'],
  },
  Unit: {
    aliases: [null, 'Unité'],
    is: 'Noun',
    not: entity,
  },
  Demonym: {
    aliases: [null, 'Gentilé'],
    is: 'Noun',
    also: ['ProperNoun'],
    not: entity,
  },
  Possessive: {
    aliases: [null, 'Possessif'],
    is: 'Noun',
  },
  // german genders
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
