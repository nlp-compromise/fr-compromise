import nlp from './src/index.js'

nlp.verbose('tagger')

let text = ''
text = `Outre la présente catégorie de PGB en 1992`
var doc = nlp(text)
doc.debug()
