const nlp = require('./src/index')

let doc = nlp(`wee ooh je regarde comme Buddy Holly.
oh oh et tu es mary tyler moore`)

doc.debug()
