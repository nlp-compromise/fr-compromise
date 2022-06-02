import toText from './toText.js'

const formatNumber = function (parsed, fmt) {
  if (fmt === 'TextOrdinal') {
    let words = toText(parsed.num)
    return words.join(' ')
  }
  if (fmt === 'TextCardinal') {
    return toText(parsed.num).join(' ')
  }
  // numeric formats
  // '55e'
  if (fmt === 'Ordinal') {
    let str = toString(parsed.num)
    let last = str.slice(str.length - 1, str.length)
    if (last === '1') {
      return str += 'er'
    }
    return str += 'e'
  }
  if (fmt === 'Cardinal') {
    return toString(parsed.num)
  }
  return String(parsed.num || '')
}
export default formatNumber