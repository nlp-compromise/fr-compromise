import fromText from './fromText.js'

const fromNumber = function (m) {
  let str = m.text('normal').toLowerCase()
  str = str.replace(/(e|er)$/, '')
  let hasComma = false
  if (/,/.test(str)) {
    hasComma = true
    str = str.replace(/,/g, '')
  }
  // get prefix/suffix
  let arr = str.split(/([0-9.,]*)/)
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
    prefix,
    num,
    suffix,
  }
}

const parseNumber = function (m) {
  let terms = m.docs[0]
  let num = null
  let prefix = ''
  let suffix = ''
  let hasComma = false
  let isText = m.has('#TextValue')
  if (isText) {
    num = fromText(terms)
  } else {
    let res = fromNumber(m)
    prefix = res.prefix
    suffix = res.suffix
    num = res.num
    hasComma = res.hasComma
  }
  return {
    hasComma,
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