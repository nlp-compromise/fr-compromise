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

const tagNeighbours = function (view, world) {
  view.docs.forEach(terms => {
    for (let i = 1; i < terms.length; i += 1) {
      let lastStr = terms[i - 1].normal
      if (terms[i].tags.size === 0 && hasBefore.hasOwnProperty(lastStr)) {
        setTag([terms[i]], hasBefore[lastStr], world)
      }
    }
  })
}
export default tagNeighbours