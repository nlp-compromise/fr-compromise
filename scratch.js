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

text = `Je m'baladais sur l'avenue le cœur ouvert à l'inconnu
J'avais envie de dire bonjour à n'importe qui
N'importe qui et ce fut toi, je t'ai dit n'importe quoi
Il suffisait de te parler, pour t'apprivoiser

Aux Champs-Elysées, aux Champs-Elysées
Au soleil, sous la pluie, à midi ou à minuit
Il y a tout ce que vous voulez aux Champs-Elysées

Tu m'as dit "J'ai rendez-vous dans un sous-sol avec des fous
Qui vivent la guitare à la main, du soir au matin"
Alors je t'ai accompagnée, on a chanté, on a dansé
Et l'on n'a même pas pensé à s'embrasser
Hier soir, deux inconnus et ce matin sur l'avenue
Deux amoureux tout étourdis par la longue nuit
Et de l'Étoile à la Concorde, un orchestre à mille cordes
Tous les oiseaux du point du jour chantent l'amour`
text = `Au soleil, sous la pluie, à midi ou à minuit`
text = `Au soleil merveilleuse`
text = `Je m'baladais sur l'avenue le cœur ouvert à l'inconnu`
text = `la rue éthérés`
var doc = nlp(text)
doc.debug()
