const nlp = require('./src/index')
nlp.verbose(true)

let doc = nlp(`asdfuë`)

doc.debug()
