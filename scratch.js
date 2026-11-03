import nlp from './src/index.js'
nlp.verbose('tagger')

nlp(`Elle s'épanouit dans son travail.`).debug()
