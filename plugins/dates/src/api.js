import find from './find.js'
import parse from './parse/index.js'
import spacetime from 'spacetime'
import toJson from './toJson.js'

export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)


const api = function (View) {
  class Dates extends View {
    constructor(document, pointer, groups, opts = {}) {
      super(document, pointer, groups)
      this.viewType = 'Dates'
      this.opts = opts || {}
    }
    parse(n) {
      return getNth(this, n).map(m => toJson(parse(m.this.opts)))
    }
    json(opts, n) {
      let m = getNth(this, n)
      let arr = m.map(vb => {
        let out = vb.toView().json(opts)[0] || {}
        let res = parse(vb, this.opts)
        out.date = toJson(res)
        return out
      }, [])
      return arr
    }
  }

  View.prototype.dates = function (opts = {}) {
    opts.today = spacetime(opts.today, opts.timezone)
    let m = find(this, opts)
    return new Dates(this.document, m.pointer, null, opts)
  }
}
export default api