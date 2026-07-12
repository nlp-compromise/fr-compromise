export default [
  { word: "qu'il", out: ['que', 'il'] },
  { word: "n'est", out: ['ne', 'est'] },
  { word: 'aux', out: ['à', 'les'] },
  { word: 'au', out: ['à', 'le'] },
  // 'before' rules only fire when the remainder is 3+ chars,
  // so short forms like "n'y" need explicit entries below
  { before: 'm', out: ['me'] },
  { before: 's', out: ['se'] },
  { before: 't', out: ['te'] },
  { before: 'n', out: ['ne'] },
  { before: 'c', out: ['ce'] },//c'était
  { before: 'd', out: ['de'] },//d'autres - d' is always 'de'
  { before: 'qu', out: ['que'] },//tant qu'étudiant
  { before: 'puisqu', out: ['puisque'] },
  { before: 'lorsqu', out: ['lorsque'] },//lorsqu’il
  { before: 'jusqu', out: ['jusque'] },//jusqu'en
  { before: 'quelqu', out: ['quelque'] },//Quelqu'un

  // ne + short word
  { word: "n'y", out: ['ne', 'y'] },
  { word: "n'a", out: ['ne', 'a'] },
  { word: "n'ai", out: ['ne', 'ai'] },
  { word: "n'as", out: ['ne', 'as'] },
  { word: "n'es", out: ['ne', 'es'] },
  { word: "n'en", out: ['ne', 'en'] },
  // c'est
  { word: "c'est", out: ['ce', 'est'] },
  // object clitics + avoir
  { word: "m'a", out: ['me', 'a'] },
  { word: "m'as", out: ['me', 'as'] },
  { word: "m'en", out: ['me', 'en'] },
  { word: "m'y", out: ['me', 'y'] },
  { word: "t'a", out: ['te', 'a'] },
  { word: "t'en", out: ['te', 'en'] },
  { word: "t'y", out: ['te', 'y'] },
  { word: "s'en", out: ['se', 'en'] },
  { word: "s'y", out: ['se', 'y'] },
  { word: "l'a", out: ['le', 'a'] },
  { word: "l'ai", out: ['le', 'ai'] },
  { word: "l'as", out: ['le', 'as'] },
  // informal tu
  { word: "t'as", out: ['tu', 'as'] },
  { word: "t'es", out: ['tu', 'es'] },
  // que + short word
  { word: "qu'on", out: ['que', 'on'] },
  { word: "qu'un", out: ['que', 'un'] },
  { word: "qu'à", out: ['que', 'à'] },
  { word: "qu'en", out: ['que', 'en'] },
  // de + une (core guesses 'du' here)
  { word: "d'une", out: ['de', 'une'] },

  { word: 'auquel', out: ['à', 'lequel'] },
  { word: 'auxquels', out: ['à', 'lesquels'] },
  { word: 'auxquelles', out: ['à', 'lesquelles'] },
  { word: 'duquel', out: ['de', 'lequel'] },
  { word: 'desquels', out: ['de', 'lesquels'] },
  { word: 'desquelles', out: ['de', 'lesquelles'] },
]
