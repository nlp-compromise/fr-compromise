import data from '/Users/spencer/mountain/fr-compromise/data/models/adjective/index.js'

Object.keys(data).forEach((k) => {
  let arr = data[k]
  if (arr[0].endsWith('s') || arr[0].endsWith('x')) {
    console.log(k, arr)
  }
  // return true
})