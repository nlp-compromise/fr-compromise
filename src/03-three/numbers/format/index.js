import { europeanNumbers } from 'compromise/shared'
import toText from './toText.js'
import { toOrdinal } from '../parse/_data.js'

const { write } = europeanNumbers.methods.two.europeanNumbers
// french groups thousands with a space
const locale = { decimal: ',', group: ' ' }

const makeSuffix = function (obj) {
  return {
    prefix: obj.prefix || '',
    suffix: obj.suffix || '',
  }
}

// 'quatre-vingt-dix-sept' -> 'quatre-vingt-dix-septième'
const ordinalWord = function (w) {
  if (toOrdinal[w]) {
    return toOrdinal[w]
  }
  // 'quatre-vingts' -> 'quatre-vingtième'
  const noS = w.replace(/s$/, '')
  if (toOrdinal[noS]) {
    return toOrdinal[noS]
  }
  // convert the last hyphenated part
  const parts = w.split('-')
  if (parts.length > 1) {
    const last = parts.pop()
    const ord = toOrdinal[last] || toOrdinal[last.replace(/s$/, '')]
    if (ord) {
      return parts.join('-') + '-' + ord
    }
  }
  return w
}

const formatNumber = function (parsed, fmt) {
  const { prefix, suffix } = makeSuffix(parsed)
  // 'premier', '1er' - or 'première', '1re'
  const fem = parsed.num === 1 && parsed.isFemale
  if (fmt === 'TextOrdinal') {
    if (parsed.num === 1) {
      return prefix + (fem ? 'première' : 'premier') + suffix
    }
    const words = toText(parsed.num)
    // 'un million' -> 'millionième'
    if (words.length > 1 && words[0] === 'un' && /^(million|milliard)/.test(words[1])) {
      words.shift()
    }
    const last = words[words.length - 1]
    words[words.length - 1] = ordinalWord(last)
    const num = words.join(' ')
    return `${prefix}${num}${suffix}`
  }
  if (fmt === 'TextCardinal') {
    const num = fem ? 'une' : toText(parsed.num).join(' ')
    return `${prefix}${num}${suffix}`
  }
  // numeric formats
  // '55e'
  if (fmt === 'Ordinal') {
    // '1er' or '1re' - but '21e'
    let end = 'e'
    if (parsed.num === 1) {
      end = fem ? 're' : 'er'
    }
    const num = String(parsed.num) + end
    return `${prefix}${num}${suffix}`
  }
  if (fmt === 'Cardinal') {
    // digits go back the way they were found - '1 234,5'
    // .. but an english-style comma is dropped - '7,938' + 1 is '7939'
    const hasComma = parsed.hasComma && parsed.group !== ','
    const how = { hasComma, decimal: parsed.decimal, group: parsed.group }
    const num = write(parsed.num, how, locale)
    return `${prefix}${num}${suffix}`
  }
  const num = String(parsed.num || '')
  return `${prefix}${num}${suffix}`
}
export default formatNumber