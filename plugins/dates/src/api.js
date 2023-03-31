import find from './find.js'
import parse from './parse/index.js'

export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

let d = new Date()
const today = {
  year: d.getFullYear(),
  month: d.getMonth() + 1, //we use 1-based months
  date: d.getDate()
}

const api = function (View) {
  class Dates extends View {
    constructor(document, pointer, groups, opts = {}) {
      super(document, pointer, groups)
      this.viewType = 'Dates'
      opts.today = opts.today || today
      this.opts = opts || {}
    }
    parse(n) {
      return getNth(this, n).map(m => parse(m.this.opts))
    }
    json(opts, n) {
      let m = getNth(this, n)
      let arr = m.map(vb => {
        let json = vb.toView().json(opts)[0] || {}
        json.date = parse(vb, this.opts)
        return json
      }, [])
      return arr
    }
  }

  View.prototype.dates = function (opts) {
    let m = find(this)
    return new Dates(this.document, m.pointer, null, opts)
  }
}
export default api