import nlp from './src/index.js'
// nlp.verbose('tagger')
/*

*/

let arr = [

  'j\'ai lu trois livres',
  `nous détestons le sable`,
  `deuxième`,
  'vieillir',
  'envahir',
  'réfléchir',
  'des coûts « démontre que le gouvernement  »',
]


let doc = nlp(arr[0]).debug()
doc.numbers().toNumber()
doc.debug()