import { toCardinal, toNumber } from './_data.js'

const multiNums = {
  dix: true,//dix huit
  soixante: true,//soixante dix
  quatre: true,//quatre vingt
  mille: true//mille milliards
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
      // console.log(str)
    }
  }
  return { skip, add }
}

const parseNumbers = function (terms = []) {
  let sum = 0
  let carry = 0
  for (let i = 0; i < terms.length; i += 1) {
    let { tags, normal } = terms[i]
    let w = normal || ''
    // support 'quatre vingt dix', etc
    if (multiNums.hasOwnProperty(w)) {
      let { add, skip } = scanAhead(terms, i)
      if (skip > 0) {
        carry += add
        i += skip
        // console.log('skip', skip, 'add', add)
        continue
      }
    }
    // ... et-un
    if (w === 'et') {
      continue
    }
    // 'huitieme'
    if (tags.has('Ordinal')) {
      w = toCardinal[w]
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
      console.log('missing', w)
    }
  }
  // include any remaining
  if (carry !== 0) {
    sum += carry
  }
  return sum
}
export default parseNumbers