import nounGender from '../preTagger/compute/3rd-pass/noun-gender.js'
import nounPlurals from '../preTagger/compute/3rd-pass/noun-plurals.js'
import adjGender from '../preTagger/compute/3rd-pass/adj-gender.js'
import adjPlurals from '../preTagger/compute/3rd-pass/adj-plurals.js'
import verbTense from '../preTagger/compute/3rd-pass/verb-tense.js'
import verbForm from '../preTagger/compute/3rd-pass/verb-form.js'

const tagNoun = function (m) {
  const world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      nounGender(terms, i, world)
      nounPlurals(terms, i, world)
    })
  })
}
const tagAdj = function (m) {
  const world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      adjGender(terms, i, world)
      adjPlurals(terms, i, world)
    })
  })
}
const tagVerb = function (m) {
  const world = m.world
  m.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      verbTense(terms, i, world)
    })
  })
}

// verbs that form the passé composé with être, in participle form
const etreParticiples = [
  'allé', 'arrivé', 'parti', 'venu', 'devenu', 'revenu', 'rentré', 'retourné',
  'resté', 'tombé', 'monté', 'descendu', 'né', 'mort', 'sorti', 'entré', 'passé',
].map(w => [w, w + 'e', w + 's', w + 'es']).flat().join('|')

const etreForms = 'suis|es|est|sommes|êtes|etes|sont|étais|était|étions|étiez|étaient|serai|seras|sera|serons|serez|seront|serais|serait|serions|seriez|seraient'

const postTagger = function (doc) {
  // ==Nouns==
  // l'inconnu
  doc.match('(le|un) [#Verb]', 0).tag(['MaleNoun', 'Singular'], 'le-verb')
  doc.match('(la|une) [#Verb]', 0).tag(['FemaleNoun', 'Singular'], 'la-verb')
  // ton devoir, son dîner - substantivized infinitive after a possessive
  doc.match('(mon|ton|son|ma|ta|sa|notre|votre|leur) [#Infinitive]', 0).tag(['Noun', 'Singular'], 'possessive-infinitive')
  // des chevaux, les gâteaux - plural-determiner before a mistagged '-aux' adjective
  tagNoun(doc.match('(les|des|ces|mes|tes|ses|nos|vos|leurs) [#Adjective]$', 0).tag('PluralNoun', 'les-adj-end'))
  tagNoun(doc.match('(les|des|ces|mes|tes|ses|nos|vos|leurs) [#Adjective] (#Preposition|#Verb)', 0).tag('PluralNoun', 'les-adj-prep'))
  // substantivized adjectives - 'l'inconnu', 'le rouge'
  tagNoun(doc.match('(le|la|les|un|une) [#Adjective]$', 0).tag('Noun', 'le-adj-end'))
  tagNoun(doc.match('(le|la|les|un|une) [#Adjective] (#Preposition|#Verb)', 0).tag('Noun', 'le-adj-prep'))
  tagNoun(doc.match('(quelques|quelque) [#Verb]', 0).tag('Noun', 'quelque-verb'))
  tagNoun(doc.match('(des|les|mes|ces|tes|ses|nos|vos|leurs) [#Verb]', 0).tag('PluralNoun', 'des-verb'))

  // ==Determiners==
  // ce soir, ce film
  doc.match('[ce] (#Noun && !#Pronoun)', 0).tag('Determiner', 'ce-noun')

  // ==Verbs==
  // il fait beau
  doc.match('(je|tu|il|elle|on|qui|cela|ça|ne) [fait]', 0).tag(['PresentTense', 'ThirdPerson'], 'il-fait')
  // a fait, ont dit - common participles that the lexicon tags as nouns/adjectives
  doc.match('(ai|as|a|avons|avez|ont) #Adverb?+ [(fait|dit|mis|pris|vu|eu|été|cru|su|dû|pu|lu)]', 0).tag(['PastTense', 'PastParticiple'], 'have-participle')
  // est-ce que
  doc.match('est ce (que|qui)').tag('QuestionWord', 'est-ce-que')
  // ne foo pas
  tagVerb(doc.match('ne [.] pas', 0).tag('Verb', 'ne-verb-pas'))
  // il active le
  tagVerb(doc.match('il [.] (le|la|les)', 0).tag('Verb', 'il-verb-le'))
  // reflexive
  tagVerb(doc.match('(se|me|te) [.]', 0).tag('Verb', 'se-noun'))
  // tu finis - an adjective can't directly follow a subject-pronoun
  tagVerb(doc.match('(je|tu|il|elle|on|nous|vous|ils|elles) #Negative? [#Adjective]', 0).tag('Verb', 'pronoun-adj'))
  // Elle interdit les transactions
  tagVerb(doc.match('(je|tu|il|elle|nous|vous|ils) [#Adjective] (la|le|les)', 0).tag('Verb', 'ils-x-les'))
  // sont interdites par l'interdiction
  tagVerb(doc.match('(est|été|sont|était|serait) [#Adjective] #Preposition', 0).tag('Verb', 'song-x-par'))
  // a dissimulées
  tagVerb(doc.match('(ai|as|a|avons|avez|ont) [#Adjective]', 0).tag('PastTense', 'have-adj'))
  // have unpacked
  doc.match('(ai|as|a|avons|avez|ont) [#PresentTense]', 0).tag('PastTense', 'have-pres')
  // passive voice - est-aimée
  doc.match('#Copula #Adverb?+ [#PastParticiple]', 0).tag('Passive', 'passive-voice')
  // passé composé with être - 'ils sont arrivés' (after the passive rule, so these don't tag as Passive)
  doc.match(`(${etreForms}) #Adverb?+ [(${etreParticiples})]`, 0).tag(['PastTense', 'PastParticiple'], 'etre-participle')
  // reflexive passé composé - 'ils se sont levés'
  doc.match(`(me|te|se|nous|vous) (${etreForms}) #Adverb?+ [/(ée?|ie?|ue?)s?$/]`, 0).tag(['PastTense', 'PastParticiple'], 'reflexive-past')
  // modal + infinitive - 'je peux le faire'
  doc.match('(peux|peut|pouvez|pouvons|peuvent|veux|veut|voulez|voulons|veulent|dois|doit|devons|devez|doivent|vais|vas|va|allons|allez|vont|faut|sais|sait|savons|savez|savent) (le|la|les|me|te|se|nous|vous|lui|leur|y|en)? [(faire|être|avoir|savoir|pouvoir|devoir|dire|voir|boire|vivre|rire|partir|venir|aller)]', 0).tag('Infinitive', 'modal-infinitive')

  // ==Adjectives==
  // est bien calculée
  tagAdj(doc.match('#Copula (bien|très|pas|plus|tant|presque|seulement)+ [#Verb]', 0).tag('Adjective', 'est-bein-calculee'))

  // ==Numbers==
  // 50 euros, 50 €
  doc.match('[#Value] #Currency', 0).tag('Money', 'value-currency')
  // vingt et une pommes
  doc.match('#Cardinal et (un|une|#Value)').tag('TextValue', 'et-un')
  doc.match('#Value un').tag('TextValue', 'quatre-vingt-un')
  doc.match('moins #Value').tag('TextValue', 'moins-value')
  // le premier jour, premier ministre - but a lone 'premier' stays an adjective
  doc.match('(#Determiner|#Possessive|#Preposition|#Value) [/^premi(er|[eè]re)s?$/]', 0).tag(['TextValue', 'Ordinal'], 'le-premier')
  doc.match('[/^premi(er|[eè]re)s?$/] (#Noun|#Value)', 0).tag(['TextValue', 'Ordinal'], 'premier-noun')
  // a lone 'un chat' is a count - anywhere else, 'un' is an article
  doc.match('^[(un|une)] #Noun$', 0).tag(['TextValue', 'Cardinal'], 'un-noun')
  // trois quarts, deux tiers
  doc.match('#Cardinal [(demi|demis|tiers|quart|quarts)]', 0).tag(['TextValue', 'Fraction'], 'trois-quarts')
  // un quart de, un tiers des - and 'un quart', but 'un tiers' is often a person
  const frac = doc.match('(un|une) (demi|tiers|quart) (de|du|des)').concat(doc.match('(un|une) (demi|quart)$'))
  frac.match('^.').tag(['TextValue', 'Cardinal'], 'un-quart')
  frac.match('^. [.]', 0).tag(['TextValue', 'Fraction'], 'un-quart')
  // un pour cent - 'un' is a count here
  doc.match('[(un|une)] pour cent', 0).tag(['TextValue', 'Cardinal'], 'un-pour-cent')
  // cinquante pour cent - but 'dix pour cent mille'
  const pc = doc.match('#Value [pour cent]', 0).filter(m => !m.lookAhead('^#Value').found)
  pc.unTag('Value').tag('Unit', 'pour-cent')
  // the number of a percentage - '50 %' is like '50%'
  pc.lookBehind('#Value+$').tag('Percent', 'value-pour-cent')
  doc.match('[#Value+] /^(%|pourcents?|percent)$/', 0).tag('Percent', 'value-percent')

  // ==Dates==
  // 'sept' is the number 7, unless it sits in a date
  // le 5 sept
  doc.match('#NumericValue [sept]', 0).tag('Month', 'num-sept')
  doc.match('le #Value [sept]$', 0).tag('Month', 'val-sept')
  doc.match('[sept] #Year', 0).tag('Month', 'sept-year')
  doc.match('[sept] (et|ou) #Month', 0).tag('Month', 'sept-et-month')
  doc.match('#Month (et|ou) [sept]', 0).tag('Month', 'month-et-sept')
  doc.match('[#Value] #Month', 0).tag('Date', 'val-month')
  doc.match('#Month [#Value] #Year', 0).tag('Date', 'mdy')
  doc.match('[#Value] #Month #Year', 0).tag('Date', 'dmy')
  // // sept-et-jun
  // doc.match('#Date [et] #Date', 0).tag('Date', 'date-et-date')
  // // courant juin
  // doc.match('(en|entre|depuis|courant|pendant|dans|lorsque|avant|après) #Date').tag('Date', 'depuis-date')
  // // jusque'en juin
  // doc.match('jusque (en|à) #Date').tag('Date', 'jusque-date')
  // // au cours de juin
  // doc.match('au cours de #Date').tag('Date', 'au-cours-de-date')

  // re-derive tense + person for verbs the rules above created,
  // with their real neighbours visible (the tagVerb slices can't see them)
  const world = doc.world
  doc.docs.forEach(terms => {
    terms.forEach((_t, i) => {
      verbTense(terms, i, world)
      verbForm(terms, i, world)
    })
  })
}
export default postTagger