const hasBefore = {
  la: 'FemaleNoun',
  une: 'FemaleNoun',
  un: 'MaleNoun',
  du: 'MaleNoun',
  au: 'MaleNoun',
  des: 'Plural',
  aux: 'Plural',
  de: 'Noun',
  // modals
  dois: 'Verb',
  doit: 'Verb',
  devons: 'Verb',
  devez: 'Verb',
  doivent: 'Verb',

  peux: 'Verb',
  peut: 'Verb',
  pouvons: 'Verb',
  pouvez: 'Verb',
  peuvent: 'Verb',
  // (conditional)
  pouvait: 'Verb',
  pourrait: 'Verb',
  pourrais: 'Verb',
  pourrions: 'Verb',
  pourriez: 'Verb',
  pourraient: 'Verb',

  // 
  avoir: 'Noun',
  pas: 'Verb' //maybe
}

const tagNeighbours = function (terms, i, world) {
  let setTag = world.methods.one.setTag
  if (terms[i - 1]) {
    let lastStr = terms[i - 1].normal
    if (terms[i].tags.size === 0 && hasBefore.hasOwnProperty(lastStr)) {
      setTag([terms[i]], hasBefore[lastStr], world, false, 'neighbour')
      return true
    }
  }
  return null
}
export default tagNeighbours