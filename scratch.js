import nlp from './src/index.js'

nlp.verbose('tagger')

// let txt = "pas empêchée"
// let txt = "pas empêché"
let txt = "Cela ne l'a pas empêchée"


/*

// ===verbs===

m'empêchait de lancer {empêcher}
Cela ne l'a pas empêchée de le poursuivre. {empêcher}
La saveur été complètement dominée {dominer}
gémissant et grimaçant de douleur {gémir}
gémisse-t-elle {gémir}
Ils dérivaient devant une brise {dériver}
3 brutes coordonnées {coordonner}
et a été incinérée {incinérer}
Les victimes de Doda incinérées  {incinérer}

===adjectives===
et boissons fraîches {frais}
la bolognaise qui en est ressortie fraîche {frais}
C'est une danse vigoureuse {vigoureux}
Une poignée de main assez raide {raide}
Elle est très affirmée {affirmé}
mon amie était occupée {occupé}
les plaignants n'étaient pas mûres {mûr}


===nouns===
ses propres règles {règle}


*/


// inflection bug
// console.log(nlp('aboyer').verbs().conjugate())


// console.log(nlp('aboyer').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
console.log(doc.docs[0][3])
// doc.debug()
doc.match('{empêcher} ').debug()