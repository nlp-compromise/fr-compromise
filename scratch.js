import nlp from './src/index.js'

nlp.verbose('tagger')

let text = ''
text = `qui sont effectuées dans des bassins hydrographiques`
// text = `Il pourrait avoir raison lentment.`
// text = `Je ne crois pas nager.`
// text = `Nord de l'Alberta en améliorant l'information et en la diffusant.`
// text = `L'aide technique`
// text = `établissement`
// text = ` intercalaire d' une céréale de printemps`
// text = `je pouvais dormir `
// text = ` Je peux partir `
// text = ` Tu dois finir `
// text = `et l'Université du Nouveau-Brunswick.`
var doc = nlp(text)
doc.debug()
