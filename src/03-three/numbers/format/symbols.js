// the words for a symbol that is written on a number - '50%', '5€', '$5', '20°'
// [singular, plural, tag, isFemale]
const symbols = {
  '%': ['pour cent', 'pour cent', 'Unit'],
  '€': ['euro', 'euros', 'Currency'],
  $: ['dollar', 'dollars', 'Currency'],
  '£': ['livre', 'livres', 'Currency', true],
  '¥': ['yen', 'yens', 'Currency'],
  '°': ['degré', 'degrés', 'Unit'],
  '°c': ['degré Celsius', 'degrés Celsius', 'Unit'],
  '°f': ['degré Fahrenheit', 'degrés Fahrenheit', 'Unit'],
}

// 'euros' -> '€' - to find a unit that is already written out
const fromWord = {}
Object.keys(symbols).forEach(k => {
  const [single, plural] = symbols[k]
  if (/ /.test(single) === false) {
    fromWord[single] = k
    fromWord[plural] = k
  }
})

// a unit that can stand as its own word - 'km', 'kg', 'm²'
const isWord = /^[a-z\u00e0-\u00ffµ]+[²³]?$/i

// 'cinq euros', but 'un euro' and 'zéro euro'
const unitWords = function (key, num) {
  const [single, plural] = symbols[key]
  return Math.abs(num) < 2 ? single : plural
}

export { symbols, fromWord, isWord, unitWords }
