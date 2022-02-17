import titleCase from './1st-pass/titlecase-noun.js'
import nounFallback from './1st-pass/noun-fallback.js'
import neighbours from './1st-pass/neighbours.js'

const tagger = function (view) {
  let world = view.world
  // add noun to anything titlecased
  titleCase(view, world)
  nounFallback(view, world)
  neighbours(view, world)
  return view
}
export default tagger