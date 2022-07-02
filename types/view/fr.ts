import View from './one'


interface Numbers extends View {
  /** grab the parsed number */
  parse: (n?: number) => object[]
  /** grab the parsed number */
  get: (n?: number) => number | number[]
  /** grab 'kilos' from `25 kilos' */
  // units: () => View
  /** return only ordinal numbers */
  isOrdinal: () => View
  /** return only cardinal numbers */
  isCardinal: () => View
  /** convert number to `5` or `5th` */
  toNumber: () => View
  /** add commas, or nicer formatting for numbers */
  toLocaleString: () => View
  /** convert number to `five` or `fifth` */
  toText: () => View
  /** convert number to `five` or `5` */
  toCardinal: () => View
  /** convert number to `fifth` or `5th` */
  toOrdinal: () => View
  /** return numbers with this value */
  isEqual: () => View
  /** return numbers bigger than n */
  greaterThan: (min: number) => View
  /** return numbers smaller than n */
  lessThan: (max: number) => View
  /** return numbers between min and max */
  between: (min: number, max: number) => View
  /** set number to n */
  set: (n: number) => View
  /** increase number by n */
  add: (n: number) => View
  /** decrease number by n*/
  subtract: (n: number) => View
  /** increase number by 1 */
  increment: () => View
  /** decrease number by 1*/
  decrement: () => View
}

interface Contractions extends View {
  /**  */
  expand(): View
}



interface FrView extends View {
  /** return any multi-word terms, like "didn't"  */
  contractions: (n?: number) => Contractions
  /**  */
  numbers(): Numbers
  /**  */
  topics(): View
}

export default FrView