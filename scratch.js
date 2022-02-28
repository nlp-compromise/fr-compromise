import nlp from './src/index.js'

nlp.verbose('tagger')

let text = ''
text = `qui sont effectuées dans des bassins hydrographiques`
text = `Il pourrait avoir raison lentment.`
// text = `Je ne crois pas nager.`
// text = `je pouvais dormir `
// text = ` Je peux partir `
// text = ` Tu dois finir `
// text = `et l'Université du Nouveau-Brunswick.`
var doc = nlp(text)
doc.debug()
