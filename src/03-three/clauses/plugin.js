// french word-rules for .clauses() - the method itself comes from compromise/shared
const clauses = {
  // a comma, but not a clause break
  notClause: [
    '@hasComma (et|ou) .', // grand, et fort
  ],
  // split a clause after these
  splitAfter: [
    '^#Pron (dit|disait)', // il dit
    '^#Pron a dit',
  ],
  // split a clause before these
  splitBefore: [
    '(dit|disait) #Prop$',
    'alors que', // while, whereas
    'tandis que',
    'maintenant que',
    'depuis que',
    'pendant que',
    'bien que',
    'même si',
    'comme si',
    '(quoique|puisque|lorsque)',
    'dont', // whose
  ],
  // split a clause before the [captured] word
  splitBeforeGroup: [
    '#Verb .* [mais] .* #Verb', // c'est bien mais c'est ..
    'si .{2,9} [alors] .', // si c'est ceci alors cela
  ],
}

export default {
  model: { three: { clauses } },
}
