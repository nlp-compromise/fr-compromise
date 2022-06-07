import nlp from './src/index.js'

// nlp.verbose('tagger')

let txt = ''
txt = `qui sont effectuées dans des bassins hydrographiques`
// text = `Il pourrait avoir raison lentment.`
// text = `Je ne crois pas nager.`
// text = `Nord de l'Alberta en améliorant l'information et en la diffusant.`
// text = `L'aide technique`
// text = `établissement`
// text = ` intercalaire d' une céréale de printemps`
// text = `je pouvais dormir `
// text = ` Je peux partir `
// text = ` Tu dois finir `
txt = ` l'arrivée initiale des noctuelles`
txt = `grossissent et mûrissent ; ils se traduisent `
txt = ` assez tôt pour être touché par l'arrivée`
txt = `diminuent`
txt = ` à des travaux visant`
txt = `des techniques culturales`
txt = `ils ne sont pas construits`
txt = `présenter une demande`

txt = `huit mille`
txt = `quatre cent quinze mille deux cent quatre-vingt-dix-sept`
txt = `quatre centieme`
txt = `six`
txt = `j'ai quatre vingt deux pommes`

txt = `Pour une fille d'Ottawa`
// text = `Grandie à Ste-Foy`
// text = `D'un père militaire`
// text = `Et d'une belle fille qui fut sa mère`
txt = `Qui écoutait du country`
txt = `Entre deux caisses de bière`
// text = `Et partait le samedi`
// text = `Pour un lac de Hawkesbury`
txt = `Rejoindre ouvert`
// let doc = nlp(text)
// doc.numbers().add(2)
// console.log(doc.text())


txt = ` Étouffé par sa propre moustache `//'étouffer' [vb]
txt = ` Quelle est la chose préférée des pirates à tricoter ?`//tricoter'
txt = ` Et quand ils sont arrivés, nous les avons tous déballés`//'déballer' [vb]
txt = ` Tu sais, je pensais, et si je déballais ici ?`//'déballer' [vb]
txt = ` Déballé en 1913`//'déballer' [vb]
txt = ` J'ai regardé ce que j'avais tranché`//trancher
txt = `Vous devez apprendre à rendre les choses plus rapides`//'rapide'
txt = `Non da si vous exécutez qu'il active la version complète da.`//activer [vb]
txt = `Les analystes ont attribué le faible`//attribuer
txt = ` La production a cessé en octobre.`//'cesser'
txt = `  Appuyez sur le bouton du département correspondant.`//'correspond'
txt = `tous déballés`//'rigoureux'

let doc = nlp(txt)
doc.compute('root')
console.log(doc.docs)
// doc.contractions().expand()
doc.debug()