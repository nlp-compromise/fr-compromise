import nlp from './src/index.js'

// nlp.verbose('tagger')

let txt = ''

txt = `géante est réveillée ` //{réveiller}
txt = `vous exécutez qu'il active la version` //{précieux}
txt = `bouillonnant` //{bouillir}
txt = `Respirez normalement.` //{respirer}
txt = ` qu'on respire l'air .` //{respirer}
txt = ` que l'Iraq a dissimulées aux Nations Unies.` //{dissimuler}
// txt = ` 	Attirez l'animal ` //{attirer}
// txt = `  ils sont sinistres ` //{nager}

/*
Malédiction évitée {éviter}
des chiens qui aboient {aboyer}


* impossible
* préliminaire
* thérapeutique
*/
// console.log(nlp('attirer').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
// console.log(doc.docs[0])
// doc.debug()
doc.match('{dissimuler} ').debug()