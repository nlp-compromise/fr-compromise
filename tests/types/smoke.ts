// compile-time smoke-test for types/index.d.ts
// checked by `pnpm run test:types` - never executed
import nlp from 'fr-compromise'
import type {
  FrView, Verbs, Nouns, Adjectives, Numbers, Contractions,
  VerbConjugation, ConjugationSet, ParsedVerb, VerbJson,
  NounConjugation, AdjectiveConjugation, ParsedNumber, NumberJson,
  SpecOptions, SpecFailure,
} from 'fr-compromise'

const doc: FrView = nlp('le petit chat mangeait vingt-cinq souris à Paris')

// core compromise/one methods are inherited
const txt: string = doc.text()
const found: boolean = doc.has('#Verb')
doc.match('#Noun').tag('Checked').out('array')

// verbs
const verbs: Verbs = doc.verbs()
const conj: VerbConjugation[] = verbs.conjugate()
const present: ConjugationSet = conj[0].PresentTense
const firstPerson: string = present.first
const imperfect: ConjugationSet = conj[0].Imperfect
const infinitive: string = conj[0].Infinitive
const participle: string = conj[0].PastParticiple
conj[0].PastTense.thirdPlural + conj[0].FutureTense.second + conj[0].Conditional.firstPlural
const parsedVerb: ParsedVerb[] = verbs.parse()
const isNegative: boolean = parsedVerb[0].negative.found
const preAdverbs: string = parsedVerb[0].adverbs.pre.text()
const verbJson: VerbJson = verbs.json()[0].verb
verbs.json({ terms: false }, 0)
verbs.toPastTense().text()
verbs.toPresentTense(0).text()
verbs.toFutureTense().all().text()
verbs.toPast().found && verbs.toPresent().found && verbs.toFuture(0).found
doc.verbs(0).conjugate(0)
// @ts-expect-error not implemented in french
verbs.toInfinitive()
// @ts-expect-error tense methods return a plain view
verbs.toPastTense().conjugate()

// nouns
const nouns: Nouns = doc.nouns()
const nounConj: NounConjugation[] = nouns.conjugate()
const plural: string = nounConj[0].plural
nouns.toPlural().text()
nouns.toSingular(0).text()
nouns.isPlural().found
doc.nouns(1).isPlural(0)

// adjectives
const adjs: Adjectives = doc.adjectives()
const adjConj: AdjectiveConjugation[] = adjs.conjugate()
const female: string = adjConj[0].female + adjConj[0].femalePlural
doc.adjectives(0).conjugate(0)

// numbers
const nums: Numbers = nlp('quarante et un kilos').numbers()
const values: (number | null)[] = nums.get()
const parsedNum: ParsedNumber[] = nums.parse(0)
const isText: boolean = parsedNum[0].isText
const numJson: NumberJson = nums.json()[0].number
nums.units().text()
nums.toNumber().toText().toOrdinal().toCardinal()
nums.add(5).subtract(2).increment().decrement()
nums.plus(5).minus(2)
nums.greaterThan(1).lessThan(100).between(1, 100).isBetween(1, 100)
nums.isEqual(41).equals(41).set(60)
nums.isOrdinal().isCardinal()
const alias: Numbers = doc.values(0)
nums.add('deux').subtract('un').plus('2').minus('trois').set('dix')
nums.json(0)
nums.json({ terms: false })

// contractions
const contractions: Contractions = nlp("j'aime l'été").contractions()
contractions.expand().all().text()
const secondContraction: Contractions = nlp("j'aime l'été").contractions(1)

// topics
doc.people().text()
doc.places().out('array')
doc.organizations().found
doc.topics()

// constructor methods
const tokens: FrView = nlp.tokenize('un texte court')
const ver: string = nlp.version
nlp().text()
nlp.verbose(true).verbose(false)
nlp.addWords({ 'trottinette': 'Noun' })
nlp.addWords({ 'trottinette': 'Noun' }, true)
nlp.addTags({ Checked: { is: 'Noun' } })
nlp.buildTrie(['a', 'b'])
nlp.compile(['a', 'b'])
nlp.buildNet([{ match: '#Noun' }])
nlp.parseMatch('#Noun')
nlp.typeahead({ 'bonjour': 'Expression' })
nlp.plugin({})
nlp.extend({})
nlp.world()
nlp.model()
nlp.methods()
const hooks: string[] = nlp.hooks()
const specOpts: SpecOptions = { tags: 'use', failures: 'retain' }
const failures: SpecFailure[] = nlp.fromSpec('le chat mange', specOpts).failures
nlp.testSpec('le chat mange').verbs()

// @ts-expect-error input text must be a string
nlp(25)

// silence noUnusedLocals
export {
  txt, found, firstPerson, imperfect, infinitive, participle, isNegative, preAdverbs, verbJson,
  plural, female, values, isText, numJson, alias, secondContraction, tokens, ver, hooks, failures,
}
