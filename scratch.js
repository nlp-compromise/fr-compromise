const nlp = require('./src/index')
nlp.verbose(true)

let doc = nlp(`doucement`)

doc.debug()
