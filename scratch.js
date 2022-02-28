import nlp from './src/index.js'


let text = ''
text = `Outre la présente catégorie de PGB`
var doc = nlp(text)
doc.debug()
