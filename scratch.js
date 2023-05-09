import nlp from './src/index.js'
nlp.verbose('tagger')
/*

*/

let arr = [
  'hier',
  // 'célèbre',
  // 'très  délicieux ',
  'Le  gâteau  était  très  délicieux ',
  'j\'ai lu trois livres',
  `nous détestons le sable`,
  `deuxième`,
  'vieillir',
  'envahir',
  'réfléchir',
  'des coûts « démontre que le gouvernement  »',
]


let doc = nlp(arr[0]).debug()
// doc.numbers().toNumber()
// doc.debug()


// let doc = nlp('4th sept')
// let m = doc.match('[<date>#Value] [<month>#Month]')
// m.debug()
// m.groups().date.debug()
// m.groups().month.debug()