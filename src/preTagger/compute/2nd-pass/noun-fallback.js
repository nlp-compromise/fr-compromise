const nounFallback = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  if (term.tags.size === 0) {
    setTag([term], 'Noun', world, false, 'fallback')
    return true
  }
  return null
}
export default nounFallback