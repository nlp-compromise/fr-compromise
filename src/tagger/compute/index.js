import titleCase from './titlecase-noun.js'
import nounFallback from './noun-fallback.js'

const tagger = function (view,) {
  let world = view.world
  // add noun to anything titlecased
  titleCase(view, world)
  nounFallback(view, world)
  return view
}
export default tagger