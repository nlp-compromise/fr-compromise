import fromText from './fromText.js'

// floating-point noise - 0.1 + 0.2 - but a whole number is already exact
const tidy = num => (Number.isInteger(num) ? num : Number(num.toPrecision(15)))

const isNumeric = term => /[0-9]/.test(term.text)

// read digits with the shared european-numbers plugin - '1 234,56', '-5', '3,5 %', '2e'
const fromNumber = function (terms, m) {
  const { read } = m.methods.two.europeanNumbers
  const locale = m.model.two.europeanNumbers
  const pre = terms[0].pre
  // thousands are split-up by a space - '1 000 000'
  let res = read(terms.map(t => t.text).join(' '), pre, locale)
  if (res.num === null && terms.length > 1) {
    res = read(terms[0].text, pre, locale)
  }
  return {
    hasComma: res.hasComma,
    hasDecimalComma: res.decimal === ',',
    // a symbol is compared in lower-case - '5 Kg'
    prefix: res.prefix.toLowerCase(),
    num: res.num,
    suffix: res.suffix.toLowerCase(),
    // how the digits were written
    decimal: res.decimal,
    group: res.group,
  }
}

const parseNumber = function (m) {
  const terms = m.docs[0]
  let num = null
  let prefix = ''
  let suffix = ''
  let hasComma = false
  let hasDecimalComma = false
  let decimal = null
  let group = null
  const isText = m.has('#TextValue')
  // any digits come first - '2,5 millions'
  const split = terms.findIndex(t => !isNumeric(t))
  const digits = split === -1 ? terms : terms.slice(0, split)
  if (isText && digits.length === 0) {
    num = fromText(terms)
  } else if (digits.length > 0) {
    const res = fromNumber(digits, m)
    prefix = res.prefix
    suffix = res.suffix
    num = res.num
    hasComma = res.hasComma
    hasDecimalComma = res.hasDecimalComma
    decimal = res.decimal
    group = res.group
    // '2,5 millions' is 2.5 * 1,000,000
    const mult = isText && split !== -1 ? fromText(terms.slice(split)) : 0
    if (num !== null && mult) {
      num = tidy(num * mult)
    }
  }
  return {
    hasComma,
    hasDecimalComma,
    prefix,
    num,
    suffix,
    decimal,
    group,
    isText,
    isOrdinal: m.has('#Ordinal'),
    isFraction: m.has('#Fraction'),
    isMoney: m.has('#Money'),
  }
}
export default parseNumber