import fromText from './fromText.js'

// '1er', '1re', '2e', '2nd', '2nde', '2ème', '2ième', '2es'
// - but not the end of a unit, like '5litres'
const ordinal = /^([-+]?[0-9][0-9.,]*)(er|re|nde?|i?[eè]me|[eè]re|e)s?$/

const fromNumber = function (m) {
  let str = m.text('normal').toLowerCase()
  // '3/4' is 0.75
  const frac = str.match(/^([0-9]+)\/([0-9]+)/)
  if (frac && m.has('#Fraction')) {
    const num = Number(frac[2]) ? Number(frac[1]) / Number(frac[2]) : null
    return { hasComma: false, hasDecimalComma: false, prefix: '', num, suffix: '' }
  }
  str = str.replace(ordinal, '$1')
  // the core normalizer strips digit-commas ('3,5'->'35'), so recover a
  // french decimal-comma from the raw text ('7,938' keeps its english
  // thousands-group meaning)
  const raw = m.text().toLowerCase().replace(/[.,;!?]+$/, '').trim()
  const hasDecimalComma = /\d,\d/.test(raw) && /,\d{3}([^0-9]|$)/.test(raw) === false
  if (hasDecimalComma) {
    str = raw.replace(/ /g, '').replace(',', '.')
  }
  // french thousands-groups use spaces - '1 000 000'
  if (/^[-+]?\d{1,3}( \d{3})+$/.test(str)) {
    str = str.replace(/ /g, '')
  }
  let hasComma = false
  if (/,/.test(str)) {
    hasComma = true
    str = str.replace(/,/g, '')
  }
  // get prefix/suffix
  const arr = str.split(/([-0-9.,]*)/)
  let [prefix, num] = arr
  let suffix = arr.slice(2).join('')
  if (num !== '' && m.length < 2) {
    num = Number(num || str)
    //ensure that num is an actual number
    if (typeof num !== 'number') {
      num = null
    }
    // strip an ordinal off the suffix
    if (suffix === 'e' || suffix === 'er') {
      suffix = ''
    }
  }
  return {
    hasComma,
    hasDecimalComma,
    prefix,
    num,
    suffix,
  }
}

const parseNumber = function (m) {
  const terms = m.docs[0]
  let num = null
  let prefix = ''
  let suffix = ''
  let hasComma = false
  let hasDecimalComma = false
  const isText = m.has('#TextValue')
  if (isText) {
    num = fromText(terms)
  } else {
    const res = fromNumber(m)
    prefix = res.prefix
    suffix = res.suffix
    num = res.num
    hasComma = res.hasComma
    hasDecimalComma = res.hasDecimalComma
  }
  return {
    hasComma,
    hasDecimalComma,
    prefix,
    num,
    suffix,
    isText,
    isOrdinal: m.has('#Ordinal'),
    isFraction: m.has('#Fraction'),
    isMoney: m.has('#Money'),
  }
}
export default parseNumber