const findPeople = function () {
  let m = this.match('#Honorific+? #Person+')
  return m
}

const findOrgs = function () {
  return this.match('#Organization+')
}

const findPlaces = function () {
  let m = this.match('(#Place|#Address)+')

  // split all commas except for 'paris, france'
  let splits = m.match('@hasComma')
  splits = splits.filter(c => {
    // split 'europe, china'
    if (c.has('(asia|africa|europe|america)$')) {
      return true
    }
    // don't split 'paris, france'
    if (c.has('(#City|#Region|#ProperNoun)$') && c.after('^(#Country|#Region)').found) {
      return false
    }
    return true
  })
  m = m.splitAfter(splits)
  return m
}

const api = function (View) {
  View.prototype.people = findPeople
  View.prototype.organizations = findOrgs
  View.prototype.places = findPlaces
}

export default api
