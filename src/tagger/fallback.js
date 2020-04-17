// turn everything into a noun, if it isn't recognized yet
const tagFallback = function (term, world) {
  if (term.isKnown() === false) {
    term.tag('Noun', 'noun-fallback', world)
  }
}
module.exports = tagFallback
