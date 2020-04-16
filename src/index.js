const tokenize = require('compromise/builds/compromise-tokenize')
const version = require('./_version')
const tagger = require('./tagger')

const nlp = function (text = '', lexicon) {
  // use en-compromise tokenizer
  let doc = tokenize(text, lexicon)
  // swap-in our french tagger
  doc.tagger = tagger
  doc.tagger()
  return doc
}

/** current version of the library */
nlp.version = version
module.exports = nlp
