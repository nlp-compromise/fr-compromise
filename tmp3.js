import data from '/Users/spencer/mountain/fr-compromise/data/lexicon/verbs/infinitives.js'

let all = data.filter((str, i) => {
  if (str.endsWith('e') && data[i + 1] && data[i + 1] === str + 'r') {
    return false
  }
  // if (data[i + 1] && data[i + 1].startsWith(str)) {
  //   console.log(str, data[i + 1])
  // }
  return true
})
console.log(JSON.stringify(all, null, 2))