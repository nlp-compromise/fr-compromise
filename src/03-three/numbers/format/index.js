import toText from './toText.js'
import { toOrdinal } from '../parse/_data.js'

const makeSuffix = function (obj) {
  return {
    prefix: obj.prefix || '',
    suffix: obj.suffix || '',
  }
}

const formatNumber = function (parsed, fmt) {
  let { prefix, suffix } = makeSuffix(parsed)
  if (fmt === 'TextOrdinal') {
    let words = toText(parsed.num)
    let last = words[words.length - 1]
    words[words.length - 1] = toOrdinal[last]
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