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
text = ` l'arrivée initiale des noctuelles`
text = `grossissent et mûrissent ; ils se traduisent `
text = ` assez tôt pour être touché par l'arrivée`
text = `diminuent`
text = ` à des travaux visant`
text = `des techniques culturales`
text = `ils ne sont pas construits`
text = `présenter une demande`

text = `huit mille`
text = `quatre cent quinze mille deux cent quatre-vingt-dix-sept`
text = `quatre centieme`
text = `six`
text = `j'ai quatre vingt deux pommes`

text = `Pour une fille d'Ottawa`
text = `Grandie à Ste-Foy`
text = `D'un père militaire`
text = `Et d'une belle fille qui fut sa mère`
// let doc = nlp(text)
// doc.numbers().add(2)
// console.log(doc.text())

let doc = nlp(text)
doc.contractions().expand()
doc.debug()