const hasBefore = {
  la: 'FemaleNoun',
  une: 'FemaleNoun',
  un: 'MaleNoun',
  du: 'MaleNoun',
  au: 'MaleNoun',
  des: 'PluralNoun',
  aux: 'PluralNoun',
  de: 'Noun',
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