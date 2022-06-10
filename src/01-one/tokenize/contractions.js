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
  { after: 'puisqu', out: ['puisque'] },
  { after: 'lorsqu', out: ['lorsque'] },//lorsqu’il
  { after: 'jusqu', out: ['jusque'] },//jusqu’ici
  { word: 'quelqu', out: ['quelque'] },//Quelqu'un

  { word: 'auquel', out: ['à', 'lequel'] },
  { word: 'auxquels', out: ['à', 'lesquels'] },
  { word: 'auxquelles', out: ['à', 'lesquelles'] },
  { word: 'duquel', out: ['de', 'lequel'] },
  { word: 'desquels', out: ['de', 'lesquels'] },
  { word: 'desquelles', out: ['de', 'lesquelles'] },
]