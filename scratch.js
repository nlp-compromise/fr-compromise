const nlp = require('./src/index')

let doc = nlp(`tenir`).tag('Verb').verbs()
console.log(doc.conjugate())

doc.debug()
