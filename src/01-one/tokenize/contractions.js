export default [
  { word: "qu'il", out: ['que', 'il'] },
  { word: "n'y", out: ['ne', 'a'] },
  { word: "n'est", out: ['ne', 'est'] },
  { word: 'aux', out: ['à', 'les'] },
  { word: 'au', out: ['à', 'le'] },
  { before: 'm', out: ['me'] },
  { before: 's', out: ['se'] },
  { before: 't', out: ['tu'] },
  { before: 'n', out: ['ne'] },
  { before: 'qu', out: ['que'] },//tant qu'étudiant
  { before: 'puisqu', out: ['puisque'] },
  { before: 'lorsqu', out: ['lorsque'] },//lorsqu’il
  { before: 'jusqu', out: ['jusque'] },//jusqu'en
  { before: 'quelqu', out: ['quelque'] },//Quelqu'un

  { word: 'auquel', out: ['à', 'lequel'] },
  { word: 'auxquels', out: ['à', 'lesquels'] },
  { word: 'auxquelles', out: ['à', 'lesquelles'] },
  { word: 'duquel', out: ['de', 'lequel'] },
  { word: 'desquels', out: ['de', 'lesquels'] },
  { word: 'desquelles', out: ['de', 'lesquelles'] },
]