const checkFrench = require('./07-french')

const contractions = function (doc) {
  doc.list.forEach((p) => {
    let terms = p.terms()
    for (let i = 0; i < terms.length; i += 1) {
      let term = terms[i]
      let found = null
      found = found || checkFrench(term, p)
      //add them in
      if (found !== null) {
        let og = term.text
        // this is a cheap-and-wrong way to do this
        doc.replace(term.text, found.join(' '))
        let m = doc.match(found.join(' '))
        m.termList().forEach((t, index) => {
          t.implicit = t.text
          t.text = index === 0 ? og : ''
        })
      }
    }
  })
  return doc
}
module.exports = contractions
