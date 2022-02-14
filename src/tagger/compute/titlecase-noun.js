const isTitleCase = function (str) {
  return /^[A-Z][a-z'\u00C0-\u00FF]/.test(str) || /^[A-Z]$/.test(str)
}

// add a noun to any non-0 index titlecased word, with no existing tag
const titleCaseNoun = function (view, world) {
  let setTag = world.methods.one.setTag
  view.docs.forEach((terms) => {
    terms.forEach((term, i) => {
      if (i === 0) {
        return
      }
      if (term.tags.size > 0) {
        return
      }
      if (isTitleCase(term.text)) {
        setTag([term], 'ProNoun', world)
      }
    })
  })

}
export default titleCaseNoun