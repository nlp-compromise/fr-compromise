import nlp from './src/index.js'
nlp.verbose('tagger')
let txt = "et boissons fraîches"
/*

*/


// inflection bug
// console.log(nlp('aboyer').verbs().conjugate())


// let doc = nlp('moins dix huitieme').debug()
// let doc = nlp('quatre cent quinze ').debug()
// let doc = nlp('33e').debug().numbers().add(1)
// console.log(doc.text())
// console.log(doc.numbers().json())


txt = `nous détestons le sable`
txt = `passionné`
let doc = nlp(txt).debug()
// doc.verbs().toPastTense()
// let net = nlp.buildNet([{ match: '{dévoiler/Verb}' }])
// console.dir(net, { depth: 5 })

// let doc = nlp('c\'est une emergency')
// doc.match('{emergency/Noun}').debug()

// let doc = nlp(`18e`).debug()


// "sanguin": ["sanguine", "sanguins", "sanguines"],

// let doc = nlp(`chaleureux`).debug()
// console.log(doc.adjectives().conjugate())
// let doc = nlp(`La production a cessé en octobre.`)
// console.log(nlp.parseMatch('{cesser}'))
// doc.match('{cesser}').debug()
// let doc = nlp(`j'ai moins quarante dollars`).debug()
// doc.numbers().add(50)
// console.log(doc.text())


// console.log(doc.numbers().get())
// console.log(doc.text())
// console.log(doc.values().json())
// let doc = nlp('onzieme').debug()
// doc.compute('root')
// console.log(doc.docs[0][3])
// // doc.debug()