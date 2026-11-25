import find from './find.js'
import parse from './parse/index.js'
import format from './format/index.js'

// return the nth elem of a doc
export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

// turn a number, or a french number-string ('dix', '10'), into a number
// - returns null if it can't be understood
const toNum = function (view, n) {
  if (typeof n === 'number') {
    return isNaN(n) ? null : n
  }
  if (typeof n === 'string') {
    const m = view.fromText(n).numbers()
    if (!m.found) {
      return null
    }
    const num = parse(m.eq(0)).num
    return typeof num === 'number' && !isNaN(num) ? num : null
  }
  return null
}

// tags that describe the form of a number - these are set again for each new number
const formTags = new Set(['Value', 'TextValue', 'NumericValue', 'Cardinal', 'Ordinal', 'Multiple', 'Determiner', 'Year'])

// swap-in the new form of this number, and tag it as the tagger would have.
// - the terms made by .replaceWith() only get the lexicon + preTagger, and are tagged
// without their neighbours - so 'un' is a Determiner, the 'et' in 'vingt et un' is a
// Conjunction, and '.numbers()' can't find them again.
// (copying the old tags over by position is no better - 'dix septième' is not two ordinals)
const replace = function (val, str, fmt) {
  // remember any tags about the role of the number - #Money, #Date
  const keep = Array.from(val.docs[0][0].tags).filter(tag => !formTags.has(tag))
  val.replaceWith(str)
  const isText = fmt === 'TextCardinal' || fmt === 'TextOrdinal'
  const isOrdinal = fmt === 'Ordinal' || fmt === 'TextOrdinal'
  val.tag(isText ? 'TextValue' : 'NumericValue')
  // only the last word is an ordinal - 'cent vingt et unième'
  const terms = val.terms()
  terms.forEach((term, i) => {
    if (i === terms.length - 1) {
      term.tag(isOrdinal ? 'Ordinal' : 'Cardinal')
    } else if (term.has('#Ordinal')) {
      term.tag('Cardinal')
    }
  })
  if (keep.length > 0) {
    val.tag(keep)
  }
}

// run a change on each number, and keep this view pointing at the new terms
// - .replaceWith() only repairs the one-match view that it is called on. Without this,
// the view that the user holds keeps the ids of the deleted terms, and core 'repairs'
// each of its matches by stretching it out to the end of the sentence.
// returns the same view, so that every link of a chain stays in sync
const mutate = function (view, fn) {
  const res = view.map(val => fn(val) || val)
  view.ptrs = res.fullPointer
  view.uncache()
  return view
}

const api = function (View) {
  /**   */
  class Numbers extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Numbers'
    }
    parse(n) {
      return getNth(this, n).map(parse, [])
    }
    get(n) {
      return getNth(this, n).map(parse, []).map(o => o.num)
    }
    /** json(n) for the nth number, or json(opts) for all of them */
    json(opts, n) {
      if (typeof opts === 'number') {
        n = opts
        opts = undefined
      }
      const doc = getNth(this, n)
      return doc.map(p => {
        const json = p.toView().json(opts)[0] || {}
        const parsed = parse(p)
        json.number = {
          prefix: parsed.prefix,
          num: parsed.num,
          suffix: parsed.suffix,
          hasComma: parsed.hasComma,
        }
        return json
      }, [])
    }
    /** any known measurement unit, for the number */
    units() {
      return this.growRight('#Unit').match('#Unit$')
    }
    /** return only ordinal numbers */
    isOrdinal() {
      return this.if('#Ordinal')
    }
    /** return only cardinal numbers*/
    isCardinal() {
      return this.if('#Cardinal')
    }

    /** convert to numeric form like '8' or '8th' */
    toNumber() {
      return mutate(this, val => {
        if (!val.has('#TextValue')) {
          return val
        }
        const obj = parse(val)
        if (obj.num === null) {
          return val
        }
        const fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal'
        const str = format(obj, fmt)
        if (str) {
          replace(val, str, fmt)
        }
        return val
      })
    }
    /** convert to numeric form like 'eight' or 'eighth' */
    toText() {
      return mutate(this, val => {
        if (val.has('#TextValue')) {
          return val
        }
        const obj = parse(val)
        if (obj.num === null) {
          return val
        }
        const fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal'
        const str = format(obj, fmt)
        if (str) {
          replace(val, str, fmt)
        }
        return val
      })
    }
    /** convert ordinal to cardinal form, like 'eight', or '8' */
    toCardinal() {
      return mutate(this, val => {
        if (!val.has('#Ordinal')) {
          return val
        }
        const obj = parse(val)
        if (obj.num === null) {
          return val
        }
        const fmt = val.has('#TextValue') ? 'TextCardinal' : 'Cardinal'
        const str = format(obj, fmt)
        if (str) {
          replace(val, str, fmt)
        }
        return val
      })
    }
    /** convert cardinal to ordinal form, like 'eighth', or '8th' */
    toOrdinal() {
      return mutate(this, val => {
        if (val.has('#Ordinal')) {
          return val
        }
        const obj = parse(val)
        if (obj.num === null) {
          return val
        }
        const fmt = val.has('#TextValue') ? 'TextOrdinal' : 'Ordinal'
        const str = format(obj, fmt)
        if (str) {
          replace(val, str, fmt)
        }
        return val
      })
    }

    /** return only numbers that are == n */
    isEqual(n) {
      return this.filter((val) => {
        const num = parse(val).num
        return num === n
      })
    }
    /** return only numbers that are > n*/
    greaterThan(n) {
      return this.filter((val) => {
        const num = parse(val).num
        return num > n
      })
    }
    /** return only numbers that are < n*/
    lessThan(n) {
      return this.filter((val) => {
        const num = parse(val).num
        return num < n
      })
    }
    /** return only numbers > min and < max */
    between(min, max) {
      return this.filter((val) => {
        const num = parse(val).num
        return num > min && num < max
      })
    }
    /** set these number to n */
    set(n) {
      if (n === undefined) {
        return this // don't bother
      }
      // 'dix' -> 10
      n = toNum(this, n)
      if (n === null) {
        return this // not a number
      }
      return mutate(this, val => {
        const obj = parse(val)
        obj.num = n
        if (obj.num === null) {
          return val
        }
        let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal'
        if (val.has('#TextValue')) {
          fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal'
        }
        let str = format(obj, fmt)
        // add commas to number
        if (obj.hasComma && fmt === 'Cardinal') {
          str = Number(str).toLocaleString()
        }
        if (str) {
          val = val.not('#Currency')
          replace(val, str, fmt)
          // handle plural/singular unit
          // agreeUnits(agree, val, obj)
        }
        return val
      })
    }
    add(n) {
      if (!n) {
        return this // don't bother
      }
      // 'deux' -> 2
      n = toNum(this, n)
      if (!n) {
        return this // not a number
      }
      return mutate(this, val => {
        const obj = parse(val)
        if (obj.num === null) {
          return val
        }
        obj.num += n
        let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal'
        if (obj.isText) {
          fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal'
        }
        const str = format(obj, fmt)
        if (str) {
          replace(val, str, fmt)
          // handle plural/singular unit
          // agreeUnits(agree, val, obj)
        }
        return val
      })
    }
    /** decrease each number by n*/
    subtract(n) {
      n = toNum(this, n)
      if (!n) {
        return this // not a number
      }
      return this.add(n * -1)
    }
    /** increase each number by 1 */
    increment() {
      return this.add(1)
    }
    /** decrease each number by 1 */
    decrement() {
      return this.add(-1)
    }
    // overloaded - keep Numbers class
    update(pointer) {
      const m = new Numbers(this.document, pointer)
      m._cache = this._cache // share this full thing
      return m
    }
  }
  // aliases
  Numbers.prototype.isBetween = Numbers.prototype.between
  Numbers.prototype.minus = Numbers.prototype.subtract
  Numbers.prototype.plus = Numbers.prototype.add
  Numbers.prototype.equals = Numbers.prototype.isEqual

  View.prototype.numbers = function (n) {
    let m = find(this)
    m = getNth(m, n)
    return new Numbers(this.document, m.pointer)
  }
  // alias
  View.prototype.values = View.prototype.numbers
}
export default api
