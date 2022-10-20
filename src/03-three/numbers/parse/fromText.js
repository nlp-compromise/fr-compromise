import { toCardinal, toNumber } from './_data.js'

const multiLeft = {
  dix: true,//dix huit
  soixante: true,//soixante dix
  quatre: true,//quatre vingt
  mille: true//mille milliards
}

const multiples = {
  mille: 1000,//thousand
  million: 1000000,//million
  milliard: 1000000000//billion
}

// greedy scan for multi-word numbers, like 'quatre vingt'
const scanAhead = function (terms, i) {
  let skip = 0
  let add = 0
  let words = []
  for (let index = 0; index < 3; index += 1) {
    if (!terms[i + index]) {
      break
    }
    let w = terms[i + index].normal || ''
    if (toCardinal.hasOwnProperty(w)) {
      w = toCardinal[w]
    }
    words.push(w)
    let str = words.join(' ')
    if (toNumber.hasOwnProperty(str)) {
      skip = index
      add = toNumber[str]
    }
  }
  return { skip, add }
}

const parseNumbers = function (terms = []) {
  let sum = 0
  let carry = 0
  let minus = false
  for (let i = 0; i < terms.length; i += 1) {
    let { tags, normal } = terms[i]
    let w = normal || ''

    if (w === 'moins') {
      minus = true
      continue
    }
    // ... et-un
    if (w === 'et') {
      continue
    }
    // 'huitieme'
    if (tags.has('Ordinal')) {
      w = toCardinal[w]
    }
    // add thousand, million
    if (multiples.hasOwnProperty(w)) {
      sum += carry
      carry = 0
      if (!sum) {
        sum = 1
      }
      sum *= multiples[w]
      continue
    }
    // support 'quatre vingt dix', etc
    if (multiLeft.hasOwnProperty(w)) {
      let { add, skip } = scanAhead(terms, i)
      if (skip > 0) {
        carry += add
        i += skip
        // console.log('skip', skip, 'add', add)
        continue
      }
    }

    // 'cent'
    if (tags.has('Multiple')) {
      let mult = toNumber[w] || 1
      if (carry === 0) {
        carry = 1
      }
      // sum += carry
      // sum = sum* mult
      // console.log('carry', carry, 'mult', mult, 'sum', sum)
      sum += mult * carry
      carry = 0
      continue
    }
    // 'trois'
    if (toNumber.hasOwnProperty(w)) {
      carry += toNumber[w]
    } else {
      let n = Number(w)
      if (n) {
        carry += n
      } else {
        // console.log('missing', w) //TODO: fixme
      }
    }
  }
  // include any remaining
  if (carry !== 0) {
    sum += carry
  }
  if (minus === true) {
    sum *= -1
  }
  return sum
}
export default parseNumbers