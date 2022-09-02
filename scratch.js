import nlp from './src/index.js'

nlp.verbose('tagger')

let txt = ''

txt = `les mascarades était prodigieuse`
txt = `les cheminées`
txt = `géante est réveillée ` //{réveiller}
txt = `Ces capacités sont précieuses ` //{précieux}
// txt = `la capacité est précieuse ` //{précieux}

/*
Graham, interdit de condamner {interdire}
Milly sanglotait tout son cœur {sangloter}

Leur acquisition serait aussi avantageuse {avantageux}

de camionnage ennuyeuse {ennuyeux}

je m'endorme {endormi}
vos collègues s'endorment {endormi}
Je ne m'endormirai pas {endormi}
un lit pour m'endormir {endormi}

un jeune homme courageux {courageux}
Monana a été très courageuse {courageux}

cette confiserie moelleuse {moelleux}

la princesse était douce {doux}

la scène serait trop douloureuse {douloureux}

sont bien trop honteuses {honteux}

Ces capacités sont précieuses {précieux}

 était tellement délicieuse {délicieux}
*/
// console.log(nlp('critiquer').verbs().conjugate())
let doc = nlp(txt).debug()
doc.compute('root')
console.log(doc.docs[0])
// doc.debug()
doc.match('{précieux} ').debug()