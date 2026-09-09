import View from './one'


interface Numbers extends View {
  /** grab the parsed number */
  parse: (n?: number) => object[]
  /** grab the parsed number */
  get: (n?: number) => number | number[]
  /** grab 'kilos' from `25 kilos' */
  // units: () => View
  /** return only ordinal numbers */
  isOrdinal: () => Numbers
  /** return only cardinal numbers */
  isCardinal: () => Numbers
  /** convert number to `5` or `5th` */
  toNumber: () => Numbers
  /** add commas, or nicer formatting for numbers */
  toLocaleString: () => Numbers
  /** convert number to `five` or `fifth` */
  toText: () => Numbers
  /** convert number to `five` or `5` */
  toCardinal: () => Numbers
  /** convert number to `fifth` or `5th` */
  toOrdinal: () => Numbers
  /** return numbers with this value */
  isEqual: () => Numbers
  /** return numbers bigger than n */
  greaterThan: (min: number) => Numbers
  /** return numbers smaller than n */
  lessThan: (max: number) => Numbers
  /** return numbers between min and max */
  between: (min: number, max: number) => Numbers
  /** set number to n */
  set: (n: number) => Numbers
  /** increase number by n */
  add: (n: number) => Numbers
  /** decrease number by n*/
  subtract: (n: number) => Numbers
  /** increase number by 1 */
  increment: () => Numbers
  /** decrease number by 1*/
  decrement: () => Numbers
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
