export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

// get root form of adjective
const getRoot = function (m) {
  m.compute('root')
  let str = m.text('root')
  // let isPlural = m.has('#PluralNoun')
  // if (isPlural) {
  //   return transform.adjective.fromPlural(str)
  // }
  return str
}

const api = function (View) {
  class Nouns extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Nouns'
    }
    conjugate(n) {
      const methods = this.methods.two.transform.noun
      return getNth(this, n).map(m => {
        let str = m.text()
        if (m.has('#PluralNoun')) {
          return {
            plural: str,
            singular: methods.fromPlural(str)
          }
        }
        if (m.has('#Uncountable')) {
          return {
            singular: str,
            plural: str,
          }
        }
        return {
          singular: str,
          plural: methods.toPlural(str)
        }
      }, [])
    }
    isPlural(n) {
      return getNth(this, n).if('#PluralNoun')
    }
    toPlural(n) {
      const methods = this.methods.two.transform.noun
      return getNth(this, n).if('#Singular').map(m => {
        let str = getRoot(m)
        let plural = methods.toPlural(str)
        return m.replaceWith(plural)
      })
    }
    toSingular(n) {
      const methods = this.methods.two.transform.noun
      return getNth(this, n).if('#PluralNoun').map(m => {
        let str = getRoot(m)
        let singular = methods.fromPlural(str)
        return m.replaceWith(singular)
      })
    }
  }

  View.prototype.nouns = function (n) {
    let m = this.match('#Noun')
    m = getNth(m, n)
    return new Nouns(this.document, m.pointer)
  }
}
export default api