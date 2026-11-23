# Jeu d’étiquettes

Les étiquettes de fr-compromise. Chaque étiquette peut être utilisée dans les motifs avec son nom anglais ou avec son alias français :

```js
const doc = nlp('dans le jardin')
doc.match('#Préposition #Article #Nom')
doc.match('#Preposition #Determiner #Noun') // équivalent
```

`—` signifie qu’il n’y a pas d’alias propre, car le mot est identique en français ou n’a pas de bonne traduction. Le nom anglais fonctionne quand même.

`*` signifie que l’étiqueteur n’attribue pas encore automatiquement cette étiquette à cet exemple. On peut l’attribuer avec `.tag()`.

## Noms

| Anglais | Français | Exemple |
|---|---|---|
| `#Noun` | `#Nom` | `chien` |
| `#Singular` | `#Singulier` | `chien` |
| `#ProperNoun` | `#NomPropre` | `Paris` |
| `#Person` | `#Personne` | `Tony` |
| `#FirstName` | `#Prénom` | `Tony` |
| `#MaleName` | `#PrénomMasculin` | `Tony` |
| `#FemaleName` | `#PrénomFéminin` | `Marie` |
| `#LastName` | `#NomDeFamille` | `Wong` |
| `#Honorific` | `#Titre` | `Dr` |
| `#Place` | `#Lieu` | `Colorado` |
| `#Country` | `#Pays` | `France` |
| `#City` | `#Ville` | `Paris` |
| `#Region` | `#Région` | `Utah` |
| `#Address` | `#Adresse` | `5 rue Victor Hugo` * |
| `#Organization` | `#Organisation` | `IBM` |
| `#SportsTeam` | `#Équipe` | `Olympique de Marseille` * |
| `#School` | `#École` | `Université de Lyon` * |
| `#Company` | `#Entreprise` | `Renault` * |
| `#PluralNoun` | `#Pluriel`, `#Plural` | `chiens` |
| `#Uncountable` | `#Indénombrable` | `bagages` |
| `#Pronoun` | `#Pronom` | `je` |
| `#Actor` | — | `professeur` * |
| `#Activity` | `#Activité` | `natation` * |
| `#Unit` | `#Unité` | `km` |
| `#Demonym` | `#Gentilé` | `français` * |
| `#Possessive` | `#Possessif` | `ma` |
| `#MaleNoun` | `#NomMasculin` | `chien` |
| `#FemaleNoun` | `#NomFéminin` | `la maison` |

## Verbes

| Anglais | Français | Exemple |
|---|---|---|
| `#Verb` | `#Verbe` | `parler` |
| `#PresentTense` | `#Présent` | `parle` |
| `#Infinitive` | `#Infinitif` | `parler` |
| `#Imperative` | `#Impératif` | `parlez` * |
| `#Gerund` | `#Gérondif` | `en parlant` * |
| `#PastTense` | `#Passé` | `a parlé` |
| `#Copula` | `#Copule` | `est` |
| `#Modal` | — | `peux` * |
| `#PerfectTense` | `#PasséComposé` | `a parlé` * |
| `#Pluperfect` | `#PlusQueParfait` | `avait parlé` * |
| `#Participle` | `#Participe` | `parlé` * |
| `#PhrasalVerb` | — | `se rendre compte` * |
| `#Passive` | `#Passif` | `est mangé` |
| `#Particle` | — | `se rendre compte` * |
| `#Auxiliary` | `#Auxiliaire` | `ont` |
| `#PresentParticiple` | `#ParticipePrésent` | `parlant` * |
| `#PastParticiple` | `#ParticipePassé` | `mangé` |
| `#PastSimple` | `#PasséSimple` | `parla` * |
| `#Imperfect` | `#Imparfait` | `parlais` |
| `#ConditionalVerb` | `#Conditionnel` | `parlerais` |
| `#FutureTense` | `#Futur` | `parlerai` |
| `#FirstPerson` | `#PremièrePersonne` | `parle` |
| `#SecondPerson` | `#DeuxièmePersonne` | `parles` |
| `#ThirdPerson` | `#TroisièmePersonne` | `il parle` |
| `#FirstPersonPlural` | `#PremièrePersonnePluriel` | `parlons` |
| `#SecondPersonPlural` | `#DeuxièmePersonnePluriel` | `parlez` |
| `#ThirdPersonPlural` | `#TroisièmePersonnePluriel` | `parlent` |

## Nombres

| Anglais | Français | Exemple |
|---|---|---|
| `#Value` | `#Nombre` | `234` |
| `#Ordinal` | — | `deuxième` |
| `#Cardinal` | — | `dix` |
| `#Fraction` | — | `1/2` |
| `#Multiple` | — | `mille` |
| `#RomanNumeral` | `#ChiffreRomain` | `XIV` * |
| `#TextValue` | `#Numéral` | `dix` |
| `#NumericValue` | `#Numérique` | `234` |
| `#Money` | `#Argent` | `dix euros` |
| `#Percent` | `#Pourcentage` | `50%` |

## Dates et heures

| Anglais | Français | Exemple |
|---|---|---|
| `#Date` | — | `3 mai` |
| `#Month` | `#Mois` | `juin` |
| `#WeekDay` | `#JourDeLaSemaine` | `jeudi` |
| `#Year` | `#Année` | `2026` |
| `#FinancialQuarter` | `#Trimestre` | `Q3` * |
| `#Holiday` | `#JourFérié` | `Noël` * |
| `#Season` | `#Saison` | `été` * |
| `#Timezone` | `#FuseauHoraire` | `CET` * |
| `#Time` | `#Heure` | `16:30` |
| `#Duration` | `#Durée` | `mois` * |

## Divers

| Anglais | Français | Exemple |
|---|---|---|
| `#Adjective` | `#Adjectif` | `rouge` |
| `#Comparable` | — | `rapide` * |
| `#Comparative` | `#Comparatif` | `meilleur` * |
| `#Superlative` | `#Superlatif` | `le meilleur` * |
| `#MaleAdjective` | `#AdjectifMasculin` | `content` |
| `#FemaleAdjective` | `#AdjectifFéminin` | `contente` |
| `#PluralAdjective` | `#AdjectifPluriel` | `contents` |
| `#NumberRange` | `#PlageNumérique` | `5-10` |
| `#Adverb` | `#Adverbe` | `très` |
| `#Determiner` | `#Déterminant`, `#Article` | `le` |
| `#Conjunction` | `#Conjonction` | `et` |
| `#Preposition` | `#Préposition` | `dans` |
| `#QuestionWord` | `#MotInterrogatif` | `quelle` |
| `#Currency` | `#Devise` | `euro` |
| `#Expression` | `#Interjection` | `wow` |
| `#Abbreviation` | `#Abréviation` | `dr` |
| `#Url` | — | `www.example.com` |
| `#PhoneNumber` | `#Téléphone` | `555-123-4567` |
| `#HashTag` | — | `#nlp` |
| `#AtMention` | `#Mention` | `@spencer` |
| `#Emoji` | — | `😀` * |
| `#Emoticon` | `#Émoticône` | `:-)` * |
| `#Email` | `#Courriel` | `info@example.com` |
| `#Acronym` | `#Acronyme` | `OTAN` |
| `#Negative` | `#Négation` | `ne` |
| `#Condition` | — | `si` * |
