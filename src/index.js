const tokenize = require('compromise/builds/compromise-tokenize')
// const tokenize = require('/Users/spencer/mountain/compromise/builds/compromise-tokenize.js')
const version = require('./_version')
const tagger = require('./tagger')
const makeWorld = require('./World')

let world = tokenize('').world
world = makeWorld(world)

const nlp = function (text = '', lexicon) {
  // use en-compromise tokenizer
  let doc = tokenize(text, lexicon)
  doc.world = world
  // swap-in our french tagger
  doc.tagger = tagger
  doc.tagger()
  return doc
}

/** current version of the library */
nlp.version = version

/** print-out for tagger */
nlp.verbose = function (bool) {
  tokenize.verbose(bool)
}
module.exports = nlp
