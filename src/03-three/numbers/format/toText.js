import data from '../data.js'

const onesWord = {}
data.ones.forEach(a => {
  onesWord[a[0]] = a[1]
})
const tensWord = {}
data.tens.forEach(a => {
  tensWord[a[0]] = a[1]
})

let multiples = [
  [1e12, 'mille milliards'],
  [1e9, 'milliard'],
  [1e6, 'million'],
  [1000, 'mille'],
  [1, 'one'],
]

//turn number into an array of magnitudes, like [[5, million], [2, hundred]]
const getMagnitudes = function (num) {
  let working = num
  let have = []
  multiples.forEach(a => {
    if (num >= a[0]) {
      let howmany = Math.floor(working / a[0])
      working -= howmany * a[0]
      if (howmany) {
        have.push({
          unit: a[1],
          num: howmany,
        })
      }
    }
  })
  return have
}

// turn 0-99 into french words
// 'vingt' and 'quatre-vingt' take an s only when nothing follows
const twoDigit = function (num, hasFollowing) {
  // 0-19 (teens are hyphenated in the table)
  if (num < 20) {
    return [onesWord[num]]
  }
  let base = Math.floor(num / 10) * 10
  let rest = num - base
  // 70s and 90s borrow from the teens - 'soixante-douze'
  if (base === 70 || base === 90) {
    base -= 10
    rest += 10
  }
  let ten = tensWord[base]
  if (rest === 0) {
    // 'quatre-vingts' / 'quatre-vingt mille'
    if (base === 80 && !hasFollowing) {
      return [ten + 's']
    }
    return [ten]
  }
  // 'vingt et un', 'soixante et onze' - but 'quatre-vingt-un'
  if ((rest === 1 || rest === 11) && base !== 80) {
    return [ten, 'et', onesWord[rest]]
  }
  return [ten + '-' + onesWord[rest]]
}

// turn 0-999 into french words
const threeDigit = function (num, hasFollowing) {
  if (num < 100) {
    return twoDigit(num, hasFollowing)
  }
  let hundreds = Math.floor(num / 100)
  let rest = num % 100
  let words = []
  if (hundreds > 1) {
    words = words.concat(twoDigit(hundreds, true))
  }
  // 'deux cents' - but 'deux cent un' / 'deux cent mille'
  if (hundreds > 1 && rest === 0 && !hasFollowing) {
    words.push('cents')
  } else {
    words.push('cent')
  }
  if (rest) {
    words = words.concat(twoDigit(rest, hasFollowing))
  }
  return words
}

// turn a number like 80 into words like 'quatre-vingts'
const toText = function (num) {
  if (num === 0) {
    return ['zéro']
  }
  let words = []
  if (num < 0) {
    words.push('moins')
    num = Math.abs(num)
  }
  // handle multiples
  let found = getMagnitudes(num)
  found.forEach(obj => {
    if (obj.unit === 'one') {
      words = words.concat(threeDigit(obj.num, false))
      return
    }
    // 'mille' doesn't take 'un', but 'un million' does
    if (obj.num !== 1) {
      words = words.concat(threeDigit(obj.num, true))
    } else if (obj.unit === 'million' || obj.unit === 'milliard') {
      words.push('un')
    }
    let unit = obj.unit
    // 'deux millions'
    if ((unit === 'million' || unit === 'milliard') && obj.num > 1) {
      unit += 's'
    }
    words.push(unit)
  })
  return words
}
export default toText
