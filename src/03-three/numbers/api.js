import find from './find.js'
import parseNumber from './parse/index.js'
import format from './format/index.js'
import { symbols, fromWord, isWord, unitWords } from './format/symbols.js'

// parse a number, and remember the gender of 'première', '1re' or 'une'
// - so that it can be written back in the same gender
const isFemale = /^(1[eè]?re|premi[eè]re)s?$|^une$/
const hasDash = /[-−–]$/
const parse = function (val) {
  const obj = parseNumber(val)
  obj.isFemale = isFemale.test(val.text('normal'))
  // the tokenizer keeps the sign of '-5%' apart from the term, as punctuation
  obj.hasDash = !obj.isText && obj.num < 0 && hasDash.test(val.docs[0][0].pre)
  return obj
}

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
    const num = parseNumber(m.eq(0)).num
    return typeof num === 'number' && !isNaN(num) ? num : null
  }
  return null
}

// tags that describe the form of a number - these are set again for each new number
const formTags = new Set(['Value', 'TextValue', 'NumericValue', 'Cardinal', 'Ordinal', 'Multiple', 'Determiner', 'Year'])

// find the symbol or unit of a number, and the terms that it is written in.
// - it may be attached - '50%', '€5', '5km' - or be the next word - '5 €', 'cinquante pour cent'
const findUnit = function (val, obj) {
  const [n, start, end] = val.fullPointer[0]
  const terms = val.document[n]
  const last = terms[end - 1]
  const next = terms[end]
  // a sign is not a symbol - '+5%', '10+'
  const lead = /^\+/.test(obj.prefix) ? '+' : ''
  const trail = /\+$/.test(obj.suffix) ? '+' : ''
  const prefix = obj.prefix.slice(lead.length)
  const suffix = obj.suffix.slice(0, obj.suffix.length - trail.length)
  if (!obj.isText && (prefix || suffix)) {
    // '5km' is a contraction of two terms - '5km' and an empty 'km'
    const isSplit = Boolean(next && next.text === '' && next.implicit && last.implicit)
    const unit = { attached: true, isSplit, lead, trail, view: isSplit ? val.update([[n, start, end + 1]]) : val }
    // the symbol, in its original case - '20°C', '5 Kg'
    const before = terms[start].text.slice(lead.length, lead.length + prefix.length)
    const behind = last.text.slice(last.text.length - trail.length - suffix.length, last.text.length - trail.length)
    unit.prefix = lead + (before.toLowerCase() === prefix ? before : prefix)
    unit.suffix = (behind.toLowerCase() === suffix ? behind : suffix) + trail
    if (prefix && suffix) {
      return unit
    }
    if (symbols.hasOwnProperty(prefix || suffix)) {
      unit.key = prefix || suffix
    } else if (suffix && isWord.test(suffix)) {
      unit.word = unit.suffix.slice(0, suffix.length)
      unit.tag = isSplit ? Array.from(next.tags) : []
    }
    return unit
  }
  // look at the next word, unless there is some punctuation in the way
  if (!next || !next.text || /\S/.test(last.post + next.pre)) {
    return null
  }
  const unit = { attached: false, view: val.update([[n, start, end + 1]]) }
  // '5 €'
  if (symbols.hasOwnProperty(next.normal)) {
    unit.key = next.normal
    return unit
  }
  // 'cinq pour cent'
  const after = terms[end + 1]
  if (next.normal === 'pour' && next.tags.has('Unit') && after && after.normal === 'cent' && after.tags.has('Unit')) {
    unit.key = '%'
    unit.isWord = true
    unit.view = val.update([[n, start, end + 2]])
    return unit
  }
  // 'cinq euros', 'cinq degrés'
  if (fromWord.hasOwnProperty(next.normal)) {
    unit.key = fromWord[next.normal]
    if (next.tags.has(symbols[unit.key][2]) || unit.key === '°') {
      unit.isWord = true
      return unit
    }
  }
  return null
}

// choose the new text for a number, and for its symbol or unit.
// a symbol is never left stuck to a word - '50%' is 'cinquante pour cent', and not 'cinquante%'
// - returns null if this number can't be written like that
const getPlan = function (val, obj, fmt, toSymbol) {
  const unit = fmt === 'TextCardinal' || fmt === 'Cardinal' ? findUnit(val, obj) : null
  const plan = { view: val, str: format(obj, fmt), unitTerms: 0, unitTag: null, inPlace: false }
  if (!unit) {
    return plan
  }
  const bare = Object.assign({}, obj, { prefix: '', suffix: '' })
  if (fmt === 'Cardinal') {
    if (unit.attached) {
      // '5km' -> '6km' - keep both halves of the contraction
      plan.inPlace = unit.isSplit
      plan.num = format(bare, fmt)
      plan.str = unit.prefix + plan.num + unit.suffix
    } else if (toSymbol && unit.isWord && unit.key === '%') {
      // 'cinquante pour cent' -> '50 %'
      plan.view = unit.view
      plan.str = format(bare, fmt) + ' %'
      plan.unitTerms = 1
      plan.unitTag = 'Unit'
    }
    return plan
  }
  // written-out
  let words = null
  let num = format(bare, fmt)
  if (unit.key) {
    words = unitWords(unit.key, obj.num)
    plan.unitTag = symbols[unit.key][2]
    // 'une livre', 'vingt et une livres'
    if (symbols[unit.key][3]) {
      num = num.replace(/un$/, 'une')
    }
  } else if (unit.word) {
    words = unit.word
    plan.unitTag = unit.tag
  }
  // '#5' or '10+' have no words
  if (!words) {
    return null
  }
  plan.view = unit.view
  plan.str = (unit.lead || '') + num + ' ' + words + (unit.trail || '')
  plan.unitTerms = words.split(' ').length
  return plan
}

// swap-in the new form of this number, and tag it as the tagger would have.
// - the terms made by .replaceWith() only get the lexicon + preTagger, and are tagged
// without their neighbours - so 'un' is a Determiner, the 'et' in 'vingt et un' is a
// Conjunction, and '.numbers()' can't find them again.
// (copying the old tags over by position is no better - 'dix septième' is not two ordinals)
// returns the new number, without its unit
const replace = function (val, obj, fmt, toSymbol) {
  const plan = getPlan(val, obj, fmt, toSymbol)
  if (!plan || !plan.str) {
    return val
  }
  const first = val.docs[0][0]
  // the sign is written by the number, now
  if (obj.hasDash) {
    first.pre = first.pre.replace(hasDash, '')
  }
  // re-write the first half of '5km', beside its silent 'km'
  if (plan.inPlace) {
    first.text = plan.str
    first.normal = plan.str.toLowerCase().replace(/,/g, '')
    first.implicit = plan.num
    first.machine = plan.num
    return val
  }
  // remember any tags about the role of the number - #Money, #Date
  const keep = Array.from(first.tags).filter(tag => !formTags.has(tag))
  let m = plan.view
  m.replaceWith(plan.str)
  // split the number from its unit
  if (plan.unitTerms > 0) {
    const [n, start, end] = m.fullPointer[0]
    const unit = m.update([[n, end - plan.unitTerms, end]])
    unit.unTag('Value')
    unit.tag(plan.unitTag)
    m = m.update([[n, start, end - plan.unitTerms]])
  }
  const isText = fmt === 'TextCardinal' || fmt === 'TextOrdinal'
  const isOrdinal = fmt === 'Ordinal' || fmt === 'TextOrdinal'
  m.tag(isText ? 'TextValue' : 'NumericValue')
  // only the last word is an ordinal - 'cent vingt et unième'
  const terms = m.terms()
  terms.forEach((term, i) => {
    if (i === terms.length - 1) {
      term.tag(isOrdinal ? 'Ordinal' : 'Cardinal')
    } else if (term.has('#Ordinal')) {
      term.tag('Cardinal')
    }
  })
  if (keep.length > 0) {
    m.tag(keep)
  }
  return m
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
      return getNth(this, n).map(parseNumber, [])
    }
    get(n) {
      return getNth(this, n).map(parseNumber, []).map(o => o.num)
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
      return this.growRight('#Unit+').match('#Unit+$')
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
        // leave 'trois quarts' alone
        if (!val.has('#TextValue') || val.has('#Fraction')) {
          return val
        }
        const obj = parse(val)
        if (obj.num === null) {
          return val
        }
        const fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal'
        // 'cinquante pour cent' becomes '50 %'
        return replace(val, obj, fmt, true)
      })
    }
    /** convert to numeric form like 'eight' or 'eighth' */
    toText() {
      return mutate(this, val => {
        if (val.has('#TextValue')) {
          return val
        }
        const obj = parse(val)
        // there are no words for '1,5' or '1/2'
        if (!Number.isInteger(obj.num)) {
          return val
        }
        const fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal'
        return replace(val, obj, fmt)
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
        return replace(val, obj, fmt)
      })
    }
    /** convert cardinal to ordinal form, like 'eighth', or '8th' */
    toOrdinal() {
      return mutate(this, val => {
        if (val.has('#Ordinal')) {
          return val
        }
        const obj = parse(val)
        // there is no ordinal for '1,5' or 'trois quarts'
        if (!Number.isInteger(obj.num)) {
          return val
        }
        // ... or for an amount - '50%', '5€', '5km', 'cinq euros'
        if (obj.prefix || obj.suffix || val.has('(#Percent|#Money)')) {
          return val
        }
        const fmt = val.has('#TextValue') ? 'TextOrdinal' : 'Ordinal'
        return replace(val, obj, fmt)
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
        return replace(val, obj, fmt)
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
        // avoid float noise - 0.1 + 0.2
        const sum = obj.num + n
        obj.num = Number.isInteger(sum) ? sum : Number(sum.toFixed(10))
        let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal'
        if (obj.isText) {
          // there are no words for 'trois quarts' + 1
          if (!Number.isInteger(sum)) {
            return val
          }
          fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal'
        }
        return replace(val, obj, fmt)
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
