import type View from 'compromise/view/one'
import type { Lexicon, Plugin, matchOptions, Match, Net } from 'compromise/misc'

/** conjugated forms for each grammatical person */
export interface ConjugationSet {
  /** 'je mange' */
  first: string
  /** 'tu manges' */
  second: string
  /** 'il mange' */
  third: string
  /** 'nous mangeons' */
  firstPlural: string
  /** 'vous mangez' */
  secondPlural: string
  /** 'ils mangent' */
  thirdPlural: string
}

/** all conjugations of a verb */
export interface VerbConjugation {
  /** 'manger' */
  Infinitive: string
  /** same forms as Imperfect - 'mangeait' */
  PastTense: ConjugationSet
  /** 'mangeait' */
  Imperfect: ConjugationSet
  /** 'mange' */
  PresentTense: ConjugationSet
  /** 'mangera' */
  FutureTense: ConjugationSet
  /** 'mangerait' */
  Conditional: ConjugationSet
  /** 'mangé' */
  PastParticiple: string
}

/** the parts of a verb-phrase, as views */
export interface ParsedVerb {
  /** infinitive form of the phrase - 'manger' */
  root: string
  prefix: View
  adverbs: { pre: View; post: View }
  auxiliary: View
  negative: View
}

/** the 'verb' metadata added by .verbs().json() */
export interface VerbJson {
  /** infinitive form of the phrase - 'manger' */
  root: string
  preAdverbs: string[]
  postAdverbs: string[]
  /** 'a' in 'a mangé' */
  auxiliary: string
  negative: boolean
  prefix: string
  infinitive: string
}

export interface NounConjugation {
  /** 'chat' */
  singular: string
  /** 'chats' */
  plural: string
}

export interface AdjectiveConjugation {
  /** 'petit' */
  male: string
  /** 'petite' */
  female: string
  /** 'petits' */
  plural: string
  /** 'petites' */
  femalePlural: string
}

/** a number, as interpreted by .numbers().parse() */
export interface ParsedNumber {
  hasComma: boolean
  /** is it written with a decimal-comma - '1,5' */
  hasDecimalComma: boolean
  prefix: string
  /** numeric value - 'vingt-cinq' -> 25 */
  num: number | null
  suffix: string
  /** is it written-out - 'quarante' */
  isText: boolean
  /** 'quarantième' */
  isOrdinal: boolean
  isFraction: boolean
  isMoney: boolean
}

/** the 'number' metadata added by .numbers().json() */
export interface NumberJson {
  prefix: string
  num: number | null
  suffix: string
  hasComma: boolean
}

export interface Verbs extends View {
  /** split each verb-phrase into its root, auxiliary, adverbs and negative */
  parse(n?: number): ParsedVerb[]
  /** json output, with a 'verb' property - { root: 'manger', negative: false } */
  json(options?: object | string, n?: number): any[]
  /** get all conjugated forms of these verbs - 'mange', 'mangeait', 'mangera' */
  conjugate(n?: number): VerbConjugation[]
  /** re-write these verbs in the present-tense - 'il mangeait' -> 'il mange' */
  toPresentTense(n?: number): View
  /** re-write these verbs in the imperfect - 'il mange' -> 'il mangeait' */
  toPastTense(n?: number): View
  /** re-write these verbs in the future-tense - 'il mange' -> 'il mangera' */
  toFutureTense(n?: number): View
  /** alias of .toPresentTense() */
  toPresent(n?: number): View
  /** alias of .toPastTense() */
  toPast(n?: number): View
  /** alias of .toFutureTense() */
  toFuture(n?: number): View
}

export interface Nouns extends View {
  /** get the singular and plural forms of these nouns - 'chat', 'chats' */
  conjugate(n?: number): NounConjugation[]
  /** return only the plural nouns - 'chats' */
  isPlural(n?: number): View
  /** re-write singular nouns as plural - 'chat' -> 'chats' */
  toPlural(n?: number): View
  /** re-write plural nouns as singular - 'chats' -> 'chat' */
  toSingular(n?: number): View
}

export interface Adjectives extends View {
  /** get all gender/plural forms of these adjectives - 'petit', 'petite', 'petits', 'petites' */
  conjugate(n?: number): AdjectiveConjugation[]
}

export interface Numbers extends View {
  /** interpret each number - 'vingt-cinq' -> { num: 25, isText: true } */
  parse(n?: number): ParsedNumber[]
  /** get the numeric value of each number - 'vingt-cinq' -> [25], 'trois quarts' -> [0.75] */
  get(n?: number): (number | null)[]
  /** json output, with a 'number' property - { num: 25 } */
  json(options?: number | object | string): any[]
  /** return only unit-terms - 'kilos' in 'trois kilos', 'pour cent' in 'dix pour cent' */
  units(): View
  /** return only ordinal numbers - 'cinquième' */
  isOrdinal(): Numbers
  /** return only cardinal numbers - 'cinq' */
  isCardinal(): Numbers
  /** re-write these numbers as digits - 'quarante' -> '40' */
  toNumber(): Numbers
  /** re-write these numbers as words - '40' -> 'quarante' */
  toText(): Numbers
  /** re-write these numbers as cardinal - 'quarantième' -> 'quarante' */
  toCardinal(): Numbers
  /** re-write these numbers as ordinal - 'quarante' -> 'quarantième' */
  toOrdinal(): Numbers
  /** return numbers with this value */
  isEqual(n: number): Numbers
  /** alias of .isEqual() */
  equals(n: number): Numbers
  /** return numbers larger than n */
  greaterThan(n: number): Numbers
  /** return numbers smaller than n */
  lessThan(n: number): Numbers
  /** return numbers between min and max (exclusive) */
  between(min: number, max: number): Numbers
  /** alias of .between() */
  isBetween(min: number, max: number): Numbers
  /** set these numbers to n (a number, or a french number like 'dix') - 'cinq' -> 'dix' */
  set(n: number | string): Numbers
  /** add n to these numbers - 'cinq' -> 'sept' */
  add(n: number | string): Numbers
  /** alias of .add() */
  plus(n: number | string): Numbers
  /** subtract n from these numbers - 'cinq' -> 'trois' */
  subtract(n: number | string): Numbers
  /** alias of .subtract() */
  minus(n: number | string): Numbers
  /** add 1 to these numbers - 'cinq' -> 'six' */
  increment(): Numbers
  /** subtract 1 from these numbers - 'cinq' -> 'quatre' */
  decrement(): Numbers
}

export interface Contractions extends View {
  /** spell-out contracted or elided forms - "j'aime l'été" -> 'je aime le été' */
  expand(): Contractions
}

/** options for nlp.fromSpec() */
export interface SpecOptions {
  tags?: 'ignore' | 'use'
  failures?: 'ignore' | 'throw' | 'retain' | 'log'
  verbose?: boolean
}

/** a validation problem found by nlp.fromSpec() or nlp.testSpec() */
export interface SpecFailure {
  code: 'length' | 'tags' | 'syntax' | 'match'
  line: number
  text: string
  message: string
  term?: number
  word?: string
  expected?: string[] | number
  actual?: string[] | number
}

/** a compromise document, with french-specific methods */
export interface FrView extends View {
  /** return any verbs, with conjugation methods - 'mangeait' */
  verbs(n?: number): Verbs
  /** return any nouns, with inflection methods - 'chat' */
  nouns(n?: number): Nouns
  /** return any adjectives, with gender/plural methods - 'petit' */
  adjectives(n?: number): Adjectives
  /** return any numbers, with parsing and math methods - 'vingt-cinq' */
  numbers(n?: number): Numbers
  /** alias of .numbers() */
  values(n?: number): Numbers
  /** return contracted or elided forms - "j'aime", "l'été" */
  contractions(n?: number): Contractions
  /** return any names of people - 'Marie' */
  people(): View
  /** return any names of places - 'Paris, France' */
  places(): View
  /** return any names of organizations */
  organizations(): View
}

/** parse the given french text */
declare function nlp(text?: string, lexicon?: Lexicon): FrView

declare namespace nlp {
  /** interpret text without tagging */
  export function tokenize(text: string, lexicon?: Lexicon): FrView
  /** mix in a compromise-plugin */
  export function plugin(plugin: Plugin): any
  /** mix in a compromise-plugin */
  export function extend(plugin: Plugin): any
  /** turn a match-string into json */
  export function parseMatch(match: string, opts?: matchOptions): object[]
  /** grab library internals */
  export function world(): object
  /** grab library metadata */
  export function model(): object
  /** grab exposed library methods */
  export function methods(): object
  /** which compute functions run automatically */
  export function hooks(): string[]
  /** log our decision-making for debugging */
  export function verbose(toLog?: boolean | string): typeof nlp
  /** current semver version of the library */
  export const version: string
  /** connect new tags to tagset graph */
  export function addTags(tags: object): any
  /** add new words to internal lexicon */
  export function addWords(words: Lexicon, isFrozen?: boolean): any
  /** turn a list of words into a searchable graph */
  export function buildTrie(words: string[]): object
  /** alias of nlp.buildTrie() */
  export function compile(words: string[]): object
  /** compile a set of match objects to a more optimized form */
  export function buildNet(matches: Match[]): Net
  /** add words to the autoFill dictionary */
  export function typeahead(words: Lexicon): any
  /** parse spec text, optionally applying tags or validating its constraints */
  export function fromSpec(spec: string, options?: SpecOptions): FrView & { failures: SpecFailure[] }
  /** returns untagged sentences and failing tagged lines, with validation failures */
  export function testSpec(spec: string, verbose?: boolean, throwError?: boolean): FrView & { failures: SpecFailure[] }
}

export default nlp
