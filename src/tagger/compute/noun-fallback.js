const nounFallback = function (view, world) {
  let setTag = world.methods.one.setTag
  view.docs.forEach((terms) => {
    terms.forEach((term) => {
      if (term.tags.size === 0) {
        setTag([term], 'Noun', world)
      }
    })
  })
}
export default nounFallback