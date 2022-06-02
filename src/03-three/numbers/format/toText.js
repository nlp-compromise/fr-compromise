import data from '../data.js'
let ones = data.ones.reverse()
let tens = data.tens.reverse()

let multiples = [
  [1e12, 'mille milliard'],
  [1e11, 'cent milliard'],
  [1e9, 'milliard'],
  [1e8, 'cent million'],
  [1e6, 'million'],
  [100000, 'cent mille'],
  [1000, 'mille'],
  [100, 'cent'],
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

const twoDigit = function (num) {
  let words = []
  // 20-90
  for (let i = 0; i < tens.length; i += 1) {
    if (tens[i][0] <= num) {
      words.push(tens[i][1])
      num -= tens[i][0]
      break
    }
  }
  if (num === 0) {
    return words
  }
  // 0-19
  for (let i = 0; i < ones.length; i += 1) {
    if (ones[i][0] <= num) {
      // 'et un'
      if (words.length && ones[i][1] === 'un') {
        words.push('et')
      }
      words.push(ones[i][1])
      num -= ones[i][0]
      break
    }
  }
  return words
}

// turn a number like 80 into words like 'quatre vingt'
const toText = function (num) {
  if (num === 0) {
    return ['zero']
  }
  let words = []
  if (num < 0) {
    words.push('moins')
    num = Math.abs(num)
  }
  // handle multiples
  let found = getMagnitudes(num)
  found.forEach(obj => {
    let res = twoDigit(obj.num)
    if (obj.num === 1 && obj.unit !== 'one') {
      // don't add reduntant 'un cent'
    } else {
      words = words.concat(res)
    }
    if (obj.unit !== 'one') {
      words.push(obj.unit)
    }
  })
  return words
}
export default toText