import nlp from './src/index.js'

// nlp.verbose('tagger')

let txt = ''

//chercher
txt = `Avant, je cherchais à attirer`
txt = `quant à elle, chercha un apothicaire`

//raison
txt = `J'ai dû le faire pour des raisons.`
txt = `avancé des raisons différentes.`
txt = `pour plusieurs raisons.`

// blanc
txt = `la boîte blanche`
txt = `Une boule blanche géante`

// libérer
txt = `Le Karnataka ne libérera plus`
txt = `Il a été libéré par les Royals`



// prodigieux
txt = `les mascarades était prodigieuse`
txt = `puissance musculaire prodigieuse`

// stresser
txt = `Tellement stressé que`

// correspond
txt = `du département correspondant.`

//  calculé
txt = `des vins est bien calculée`

//  rein [n]
txt = `l'ai filtré par mes reins.`
txt = `les humains naissent avec quatre reins`

// interdire
txt = `Elle interdit les transactions`
txt = `les promotions sont interdites par l'interdiction`

//endommager
txt = `Il a été endommagé dans deux énormes incendies`
// doguer
txt = `j'avais drogué`

let doc = nlp(txt).debug()
// doc.compute('root')
// console.log(doc.docs)
// doc.debug()
// doc.match('{doguer}').debug()