import toText from './toText.js'
import { toOrdinal } from '../parse/_data.js'

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
  let noS = w.replace(/s$/, '')
  if (toOrdinal[noS]) {
    return toOrdinal[noS]
  }
  // convert the last hyphenated part
  let parts = w.split('-')
  if (parts.length > 1) {
    let last = parts.pop()
    let ord = toOrdinal[last] || toOrdinal[last.replace(/s$/, '')]
    if (ord) {
      return parts.join('-') + '-' + ord
    }
  }
  return w
}

const formatNumber = function (parsed, fmt) {
  let { prefix, suffix } = makeSuffix(parsed)
  if (fmt === 'TextOrdinal') {
    let words = toText(parsed.num)
    // 'un million' -> 'millionième'
    if (words.length > 1 && words[0] === 'un' && /^(million|milliard)/.test(words[1])) {
      words.shift()
    }
    let last = words[words.length - 1]
    words[words.length - 1] = ordinalWord(last)
    let num = words.join(' ')
    return `${prefix}${num}${suffix}`
  }
  if (fmt === 'TextCardinal') {
    let num = toText(parsed.num).join(' ')
    return `${prefix}${num}${suffix}`
  }
  // numeric formats
  // '55e'
  if (fmt === 'Ordinal') {
    let str = String(parsed.num)
    let last = str.slice(str.length - 1, str.length)
    if (last === '1') {
      let num = str + 'er'
      return `${prefix}${num}${suffix}`
    }
    let num = str + 'e'
    return `${prefix}${num}${suffix}`
  }
  if (fmt === 'Cardinal') {
    let num = String(parsed.num)
    return `${prefix}${num}${suffix}`
  }
  let num = String(parsed.num || '')
  return `${prefix}${num}${suffix}`
}
export default formatNumber