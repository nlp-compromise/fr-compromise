// maître
// traître

const guessGender = function (str) {
  // female singular
  if (str.match(/[eë]$/)) {
    return 'f'
  }
  // female plurals
  let suffixes = [
    /[aei]lles$/,
    /[aei]les$/,
    /[aeiou]ttes$/,
    /ntes$/,
    /i[vct]es$/,
    /uses$/,
    /sses$/,
    /[èuay]res$/,
    /ires$/,
    /ées$/,
    /ues$/,
    /ies$/,
    /ée$/,
    /[ndvt]es$/,
  ]
  for (let i = 0; i < suffixes.length; i += 1) {
    if (suffixes[i].test(str)) {
      return 'f'
    }
  }


  return 'm'
}

// guess a gender tag each Adjective
const adjGender = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  if (tags.has('Adjective') && !tags.has('FemaleAdjective') && !tags.has('#MaleAdjective')) {
    let str = term.implicit || term.normal || term.text || ''
    // i actually think there are no exceptions.
    if (guessGender(str) === 'f') {
      return setTag([term], 'FemaleAdjective', world, false, '3-adj-gender')
    } else {
      return setTag([term], 'MaleAdjective', world, false, '3-adj-gender')
    }
  }
  return null
}
export default adjGender

// import data from '../../data/models/adjective/index.js'
// let count = 0
// Object.keys(data).forEach(m => {
//   let [f, mp, fp] = data[m]
//   if (guessGender(fp) !== 'f') {
//     console.log(fp)
//     count += 1
//   }
// })
// console.log(count)
