export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

// get root form of adjective
const getRoot = function (m) {
  let str = m.text('normal')
  let isPlural = m.has('PluralAdjective')
  let isFemale = m.has('FemaleAdjective')
  if (isPlural && isFemale) {
    return transform.adjective.fromFemalePlural(str)
  } else if (isFemale) {
    return transform.adjective.fromFemale(str)
  } else if (isPlural) {
    return transform.adjective.fromPlural(str)
  }
  return str
}

const api = function (View) {
  class Adjectives extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Adjectives'
    }
    conjugate(n) {
      const methods = this.methods.two.transform.adjective
      return getNth(this, n).map(m => {
        let adj = getRoot(m)
        return methods.conjugate(adj)
      }, [])
    }
  }

  View.prototype.adjectives = function (n) {
    let m = this.match('#Adjective')
    m = getNth(m, n)
    return new Adjectives(this.document, m.pointer)
  }
}
export default api