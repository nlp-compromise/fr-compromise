import nlp from './src/index.js'
// nlp.verbose('tagger')
/*

*/


// console.log(nlp('essayer').verbs().conjugate())

let arr = [
  // étoiler
  'Ils étoileront dans une nouvelle pièce',
  'Le chanteur étoilera dans',
  // mauvais
  'Elle a eu une mauvaise expérience',
  // devenir
  'Elle est devenue une célèbre',

  // bénir
  'Que Dieu te bénisse avec bonheur',

  // revendiquer
  'Il revendiqua avoir vu un OVNI.',

  // accroupir
  `Elle s'est accroupie derrière l'arbre`,

  // elegir
  `Elle veut être élue maire`,

  // attender
  `Est-ce que tu t'attends`,

  // gémir
  `Le vieil homme gémissait`,
  `Elle <gémit> à chaque fois`,

  // deviner
  `Sa devinette était complètement fausse`,

  // guérir
  `et le repos guériront tes blessures`,

  // ménage
  `Les tâches ménagères `,

  // nier
  `la nouvelle loi nierait leurs droits`,

  // vieux
  `La vieille maison`,
  `une collection de <vieilles> photographies`,

  // promouvoir
  `Elle a été promue à un poste`,

  // pleuvoir
  `quand il pleut `,

  // refléter
  `Je réfléchis toujours`,

  // rôtir
  `Elle a rôti une dinde`,

  //frémir
  `Il frémit à l'idée`,

  // soupirer
  `Elle soupira `,

  // envoler
  `La montgolfière <s'envola> au-dessus des montagnes`,

  // chanceler
  `Il <chancela> chez lui `,

  // sucer
  `Les bébés sucent leur pouce`,


  // épais
  `une couverture épaisse`,

  // essayer
  `Elle essaie de parler `,

  // errer
  `Le vieil homme <erra> et se perdit.`,
  // ["devenir", "become", "Verb", "She <became> a famous singer after years of practice.", "Elle est devenue une célèbre chanteuse après des années de pratique."],
  // ["accroupir", "crouch", "Verb", "She <crouched> behind the tree to hide.", "Elle s'est accroupie derrière l'arbre pour se cacher."],

  // ["endormi", "asleep", "Adjective", "I love listening to music while falling <asleep>.", "J'aime écouter de la musique en m'endormant."],
  // ["mauvais", "bad", "Adjective", "She had a <bad> experience with her previous boss.", "Elle a eu une mauvaise expérience avec son ancien patron."],
  // ["épais", "thick", "Adjective", "The book has a <thick> cover.", "Le livre a une couverture épaisse."],



  // ['Il pêche la truite tous', 'pêcher'],
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