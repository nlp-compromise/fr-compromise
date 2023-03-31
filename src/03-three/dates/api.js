import find from './find.js'
import parseDates from './parse/index.js'

export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)


const api = function (View) {
  class Dates extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Dates'
    }
    parse(n) {
      return getNth(this, n).map(parseDates)
    }
    json(opts, n) {
      let m = getNth(this, n)
      let arr = m.map(vb => {
        let json = vb.toView().json(opts)[0] || {}
        json.date = parseDates(vb)
        return json
      }, [])
      return arr
    }
  }

  View.prototype.dates = function (n) {
    let vb = find(this)
    vb = getNth(vb, n)
    return new Dates(this.document, vb.pointer)
  }
}
export default api