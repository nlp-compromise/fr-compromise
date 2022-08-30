// guess a plural/singular tag each Adjective
const adjPlurals = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  let term = terms[i]
  let tags = term.tags
  let str = term.implicit || term.normal || term.text || ''
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