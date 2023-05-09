// const dateWords = new Set('en', 'entre', 'depuis', 'courant', 'pendant', 'dans', 'lorsque', 'avant', 'après')

// guess a gender for each noun
const numberTags = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let { tags } = terms[i]
  // tag some values as a year
  if (tags.has('Cardinal') && tags.has('NumericValue')) {
    let term = terms[i]
    let n = Number(term.text)
    if (n && n > 1600 && n < 2090 && n === parseInt(n, 10)) {
      return setTag([term], 'Year', world, false, '3-year')
    }
  }
  return null
}
export default numberTags