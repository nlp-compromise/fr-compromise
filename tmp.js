import all from '/Users/spencer/mountain/fr-compromise/learn/giga/results/plural-sing.js'
let data = all
// let uncountable = new Set([])
// console.log(data.length)
data = data.filter(a => {
  if (a[0] === a[1]) {
    return false
    // uncountable.add(a[0])
  }
  return true
})
// console.log(Array.from(uncountable))
// console.log(data.length)

console.log(JSON.stringify(data, null, 2))