export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

// get root form of adjective
const getRoot = function (m, methods) {
  m.compute('root')
  let str = m.text('root')
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
        return methods.conjugate(adj, methods)
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