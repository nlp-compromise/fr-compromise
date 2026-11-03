// guess a plural/singular tag each Adjective
const adjPlurals = function (terms, i, world) {
  const setTag = world.methods.one.setTag
  const term = terms[i]
  const tags = term.tags
  const str = term.implicit || term.normal || term.text || ''
  if (tags.has('Adjective')) {
    if (str.endsWith('s') || str.endsWith('aux')) {
      return setTag([term], 'PluralAdjective', world, false, '3-plural-adj')
    }
    // if (str.endsWith('euse')) {
    //   return setTag([term], 'SingularAdjective', world, false, '3-plural-adj')
    // }
  }
  return null
}
export default adjPlurals