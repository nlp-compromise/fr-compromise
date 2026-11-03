import test from 'tape'
import nlp from './_lib.js'
const here = '[fr-aliases] '

// every alias, and the tag it stands for
const aliases = {
  // nouns
  Nom: 'Noun',
  Singulier: 'Singular',
  NomPropre: 'ProperNoun',
  Personne: 'Person',
  Prénom: 'FirstName',
  PrénomMasculin: 'MaleName',
  PrénomFéminin: 'FemaleName',
  NomDeFamille: 'LastName',
  Titre: 'Honorific',
  Lieu: 'Place',
  Pays: 'Country',
  Ville: 'City',
  Région: 'Region',
  Adresse: 'Address',
  Organisation: 'Organization',
  Équipe: 'SportsTeam',
  École: 'School',
  Entreprise: 'Company',
  NomPluriel: 'PluralNoun',
  Indénombrable: 'Uncountable',
  Pronom: 'Pronoun',
  Activité: 'Activity',
  Unité: 'Unit',
  Gentilé: 'Demonym',
  Possessif: 'Possessive',
  NomMasculin: 'MaleNoun',
  NomFéminin: 'FemaleNoun',
  // verbs
  Verbe: 'Verb',
  Présent: 'PresentTense',
  Infinitif: 'Infinitive',
  Impératif: 'Imperative',
  Gérondif: 'Gerund',
  Passé: 'PastTense',
  Participe: 'Participle',
  Passif: 'Passive',
  Copule: 'Copula',
  PasséComposé: 'PerfectTense',
  PlusQueParfait: 'Pluperfect',
  ParticipePrésent: 'PresentParticiple',
  ParticipePassé: 'PastParticiple',
  PasséSimple: 'PastSimple',
  Imparfait: 'Imperfect',
  Conditionnel: 'ConditionalVerb',
  Futur: 'FutureTense',
  Auxiliaire: 'Auxiliary',
  PremièrePersonne: 'FirstPerson',
  DeuxièmePersonne: 'SecondPerson',
  TroisièmePersonne: 'ThirdPerson',
  PremièrePersonnePluriel: 'FirstPersonPlural',
  DeuxièmePersonnePluriel: 'SecondPersonPlural',
  TroisièmePersonnePluriel: 'ThirdPersonPlural',
  // values
  Nombre: 'Value',
  ChiffreRomain: 'RomanNumeral',
  Numéral: 'TextValue',
  Numérique: 'NumericValue',
  Argent: 'Money',
  Pourcentage: 'Percent',
  // dates
  Mois: 'Month',
  JourDeLaSemaine: 'WeekDay',
  Année: 'Year',
  Trimestre: 'FinancialQuarter',
  JourFérié: 'Holiday',
  Saison: 'Season',
  FuseauHoraire: 'Timezone',
  Heure: 'Time',
  Durée: 'Duration',
  // misc
  Adjectif: 'Adjective',
  AdjectifMasculin: 'MaleAdjective',
  AdjectifFéminin: 'FemaleAdjective',
  AdjectifPluriel: 'PluralAdjective',
  Comparatif: 'Comparative',
  Superlatif: 'Superlative',
  PlageNumérique: 'NumberRange',
  Adverbe: 'Adverb',
  Déterminant: 'Determiner',
  Article: 'Determiner',
  Conjonction: 'Conjunction',
  Préposition: 'Preposition',
  MotInterrogatif: 'QuestionWord',
  Devise: 'Currency',
  Interjection: 'Expression',
  Abréviation: 'Abbreviation',
  Téléphone: 'PhoneNumber',
  Mention: 'AtMention',
  Émoticône: 'Emoticon',
  Courriel: 'Email',
  Acronyme: 'Acronym',
  Négation: 'Negative',
}

test('aliases point to the right tag:', function (t) {
  const { tagAliases } = nlp.world().model.one
  Object.keys(aliases).forEach(alias => {
    t.equal(tagAliases[alias], aliases[alias], here + `#${alias} is #${aliases[alias]}`)
  })
  t.end()
})

test('aliases match a tagged term:', function (t) {
  Object.keys(aliases).forEach(alias => {
    const doc = nlp('le chien').tag(aliases[alias])
    t.ok(doc.has(`#${alias}`), here + `#${alias} finds a #${aliases[alias]}`)
  })
  t.end()
})

test('every alias in the tagset is tested, and titlecase:', function (t) {
  const { tagSet } = nlp.world().model.one
  Object.keys(tagSet).forEach(tag => {
    const names = (tagSet[tag].aliases || []).filter(name => name !== null)
    names.forEach(name => {
      t.equal(aliases[name], tag, here + `#${name} is listed for #${tag}`)
      t.ok(/^\p{Lu}/u.test(name), here + `#${name} is titlecase`)
    })
  })
  t.end()
})

test('aliases match real sentences:', function (t) {
  const arr = [
    ['la foobar', '#Article #NomFéminin'],
    ['le foobar', '#Déterminant #NomMasculin'],
    ['dans le gaboo', '#Préposition #Article #Nom'],
    ['ma', '#Possessif'],
    ['spencer', '#Personne'],
    ['tony', '#PrénomMasculin'],
    ['chicago', '#Ville'],
    ['chicago', '#Lieu'],
    ['abaissais', '#Imparfait'],
    ['abaissais', '#Passé'],
    ['abaisserai', '#Futur'],
    ['abaisserais', '#Conditionnel'],
    ['abaisserons', '#PremièrePersonnePluriel'],
    ['été', '#ParticipePassé'],
    ['est', '#Copule'],
    ['ont', '#Auxiliaire'],
    ['ne', '#Négation'],
    ['contente', '#AdjectifFéminin'],
    ['continental', '#AdjectifMasculin'],
    ['wow', '#Interjection'],
    ['mille', '#Numéral'],
    ['234', '#Nombre'],
    ['234', '#Numérique'],
    ['juin', '#Mois'],
    ['lundi', '#JourDeLaSemaine'],
  ]
  arr.forEach(function (a) {
    const [str, match] = a
    const doc = nlp(str)
    const tags = doc.json()[0].terms.map(term => term.tags[0])
    const msg = `'${(str + "' ").padEnd(20, ' ')}  - '${match}' - '${tags.join(', ')}'`
    t.equal(doc.match(match).text(), doc.text(), here + msg)
  })
  t.end()
})

test('aliases work in match syntax:', function (t) {
  const doc = nlp('le chien')
  const [det, noun] = doc.json()[0].terms.map(term => term.text)
  // lowercase is title-cased, as with any tag
  t.ok(doc.has('#nom'), here + 'lowercase')
  t.ok(nlp('dans la maison').has('#préposition'), here + 'lowercase preposition')
  t.equal(doc.match('!#Nom').text(), det, here + 'negative')
  t.equal(doc.match('(#Auxiliaire|#Déterminant) #Nom').text(), doc.text(), here + 'or-block')
  t.equal(doc.match('#Déterminant [#Nom]', 0).text(), noun, here + 'capture')
  t.equal(doc.match('#Déterminant #Adjectif? #Nom').text(), doc.text(), here + 'optional')
  t.equal(doc.not('#Déterminant').text(), noun, here + 'not()')
  t.equal(doc.if('#Nom').length, 1, here + 'if()')
  t.end()
})

test('aliases do not over-match:', function (t) {
  const doc = nlp('le chien')
  t.notOk(doc.has('#Auxiliaire'), here + 'no #Auxiliaire')
  t.notOk(doc.has('#Préposition'), here + 'no #Préposition')
  t.notOk(doc.has('#Bêtise'), here + 'an unknown tag finds nothing')
  t.end()
})

test('aliases can also set tags:', function (t) {
  const doc = nlp('le chien').tag('Auxiliaire')
  t.ok(doc.has('#Auxiliary'), here + 'tag() with an alias')
  doc.unTag('Auxiliaire')
  t.notOk(doc.has('#Auxiliary'), here + 'unTag() with an alias')
  t.end()
})

test('english tag names are unchanged:', function (t) {
  const doc = nlp('le chien')
  t.ok(doc.has('#Determiner #Noun'), here + 'canonical names still match')
  t.ok(doc.out('spec').includes('{Determiner,Noun}'), here + 'spec output is canonical')
  const tags = doc.json()[0].terms[1].tags
  t.ok(tags.includes('Noun'), here + 'json has #Noun')
  t.notOk(tags.includes('Nom'), here + 'json has no #Nom')
  t.end()
})
