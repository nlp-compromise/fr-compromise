const titleCase = /^\p{Lu}[\p{Ll}'’]/u //upercase, then lowercase
// import contract from './contract.js'

const toTitleCase = function (str = '') {
  str = str.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()) //TODO: support unicode
  return str
}

// a run of implicit terms may hold several contractions, back-to-back.
// only the first term of a contraction keeps its written text - the rest are ''
const splitRuns = function (m) {
  const out = []
  const docs = m.docs
  m.fullPointer.forEach((ptr, i) => {
    const [n, start] = ptr
    let from = 0
    docs[i].forEach((term, o) => {
      if (o > 0 && term.text !== '') {
        out.push([n, start + from, start + o])
        from = o
      }
    })
    out.push([n, start + from, start + docs[i].length])
  })
  return out
}

const api = function (View) {
  /** */
  class Contractions extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Contraction'
    }
    /** i've -> 'i have' */
    expand() {
      this.docs.forEach(terms => {
        const isTitleCase = titleCase.test(terms[0].text)
        terms.forEach((t, i) => {
          t.text = t.implicit
          delete t.implicit
          //add whitespace
          if (i < terms.length - 1 && t.post === '') {
            t.post += ' '
          }
          // flag it as dirty
          t.dirty = true
        })
        // make the first word title-case?
        if (isTitleCase) {
          terms[0].text = toTitleCase(terms[0].text)
        }
      })
      this.compute('normal') //re-set normalized text
      return this
    }
  }
  // add fn to View
  View.prototype.contractions = function (n) {
    let m = this.match('@hasContraction+')
    // adjacent contractions - "j'aime l'été" - are each their own match
    m = m.update(splitRuns(m))
    // return the nth contraction
    if (typeof n === 'number') {
      m = m.eq(n)
    }
    return new Contractions(this.document, m.pointer)
  }
  // View.prototype.contract = contract
}

export default api