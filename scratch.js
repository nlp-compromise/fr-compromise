import nlp from './src/index.js'
// nlp.verbose('tagger')
/*

*/


// console.log(nlp('essayer').verbs().conjugate())

let arr = [


  // ["devenir", "become", "Verb", "She <became> a famous singer after years of practice.", "Elle est devenue une célèbre chanteuse après des années de pratique."],
  // ["accroupir", "crouch", "Verb", "She <crouched> behind the tree to hide.", "Elle s'est accroupie derrière l'arbre pour se cacher."],

  ["endormi", "asleep", "Adjective", "I love listening to music while falling <asleep>.", "J'aime écouter de la musique en m'endormant."],
  ["mauvais", "bad", "Adjective", "She had a <bad> experience with her previous boss.", "Elle a eu une mauvaise expérience avec son ancien patron."],
  ["épais", "thick", "Adjective", "The book has a <thick> cover.", "Le livre a une couverture épaisse."],


  ['Il pêche la truite tous', 'pêcher'],
  // [`L'équipe a été vaincue lors du match final`, 'vaincre'],
  // ['', ''],
  // 'accroupir',

  // 'Il abrégera son nom ',
  // 'marcher',
  // 'ralentir',
  // 'vendre',
  // 'hier',
  // // 'célèbre',
  // // 'très  délicieux ',
  // 'Le  gâteau  était  très  délicieux ',
  // 'j\'ai lu trois livres',
  // `nous détestons le sable`,
  // `deuxième`,
  // 'vieillir',
  // 'envahir',
  // 'réfléchir',
  // 'des coûts « démontre que le gouvernement  »',
]
let [fr, en, pos, enTxt, frTxt] = arr[0]

console.log(fr, pos)
let doc = nlp(frTxt).debug()
doc.match(`{${fr}}`).debug()

// console.log(doc.verbs().conjugate())
// doc.verbs().toPastTense().debug()
// doc.numbers().toNumber()
// doc.debug()


// let doc = nlp('4th sept')
// let m = doc.match('[<date>#Value] [<month>#Month]')
// m.debug()
// m.groups().date.debug()
// m.groups().month.debug()