import find from './find.js'
import toJSON from './toJSON.js'
import parseVerb from './parse.js'
// import getSubject from './parse/getSubject.js'
// import getGrammar from './parse/grammar/index.js'
// import toNegative from './conjugate/toNegative.js'
// import debug from './debug.js'


// return the nth elem of a doc
export const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc)

const formKey = {
  FirstPerson: 'first',
  SecondPerson: 'second',
  ThirdPerson: 'third',
  FirstPersonPlural: 'firstPlural',
  SecondPersonPlural: 'secondPlural',
  ThirdPersonPlural: 'thirdPlural',
}
// which person is this verb conjugated in?
const getForm = function (vb) {
  let terms = vb.docs[0] || []
  let term = terms.find(t => t.tags.has('Verb'))
  if (term) {
    let found = Object.keys(formKey).find(k => term.tags.has(k))
    if (found) {
      return formKey[found]
    }
  }
  return 'third'
}

const api = function (View) {
  class Verbs extends View {
    constructor(document, pointer, groups) {
      super(document, pointer, groups)
      this.viewType = 'Verbs'
    }
    parse(n) {
      return getNth(this, n).map(parseVerb)
    }
    json(opts, n) {
      let m = getNth(this, n)
      let arr = m.map(vb => {
        let json = vb.toView().json(opts)[0] || {}
        json.verb = toJSON(vb)
        return json
      }, [])
      return arr
    }
    // subjects(n) {
    //   return getNth(this, n).map(vb => {
    //     let parsed = parseVerb(vb)
    //     return getSubject(vb, parsed).subject
    //   })
    // }
    // adverbs(n) {
    //   return getNth(this, n).map(vb => vb.match('#Adverb'))
    // }
    // isSingular(n) {
    //   return getNth(this, n).filter(vb => {
    //     return getSubject(vb).plural !== true
    //   })
    // }
    // isPlural(n) {
    //   return getNth(this, n).filter(vb => {
    //     return getSubject(vb).plural === true
    //   })
    // }
    // isImperative(n) {
    //   return getNth(this, n).filter(vb => vb.has('#Imperative'))
    // }
    // toInfinitive(n) {
    //   return getNth(this, n).map(vb => {
    //     let parsed = parseVerb(vb)
    //     let info = getGrammar(vb, parsed)
    //     return toInfinitive(vb, parsed, info.form)
    //   })
    // }
    toPresentTense(n) {
      const methods = this.methods.two.transform.verb
      return getNth(this, n).map(vb => {
        let form = getForm(vb)
        let str = vb.compute('root').text('root')
        let present = methods.toPresentTense(str)[form]
        if (!present) {
          return vb
        }
        return vb.replaceWith(present).tag('PresentTense')
      })
    }
    // uses the imperfect - always grammatical as a one-word substitution
    // (passé composé would require inserting avoir/être + agreement)
    toPastTense(n) {
      const methods = this.methods.two.transform.verb
      return getNth(this, n).map(vb => {
        let form = getForm(vb)
        let str = vb.compute('root').text('root')
        let past = methods.toImperfect(str)[form]
        if (!past) {
          return vb
        }
        return vb.replaceWith(past).tag('Imperfect')
      })
    }
    toFutureTense(n) {
      const methods = this.methods.two.transform.verb
      return getNth(this, n).map(vb => {
        let form = getForm(vb)
        let str = vb.compute('root').text('root')
        let future = methods.toFutureTense(str)[form]
        if (!future) {
          return vb
        }
        return vb.replaceWith(future).tag('FutureTense')
      })
    }
    // toGerund(n) {
    //   return getNth(this, n).map(vb => {
    //     let parsed = parseVerb(vb)
    //     let info = getGrammar(vb, parsed)
    //     return toGerund(vb, parsed, info.form)
    //   })
    // }
    conjugate(n) {
      const { toImperfect, toPresentTense, toFutureTense, toConditional, toPastParticiple } = this.methods.two.transform.verb
      return getNth(this, n).map(vb => {
        let parsed = parseVerb(vb)
        let root = parsed.root || ''
        let imperfect = toImperfect(root)
        return {
          Infinitive: root,
          PastTense: imperfect,
          Imperfect: imperfect,
          PresentTense: toPresentTense(root),
          FutureTense: toFutureTense(root),
          Conditional: toConditional(root),
          PastParticiple: toPastParticiple(root),
        }
      }, [])
    }

    // /** return only verbs with 'not'*/
    // isNegative() {
    //   return this.if('#Negative')
    // }
    // /**  return only verbs without 'not'*/
    // isPositive() {
    //   return this.ifNo('#Negative')
    // }
    // /** remove 'not' from these verbs */
    // toPositive() {
    //   let m = this.match('do not #Verb')
    //   if (m.found) {
    //     m.remove('do not')
    //   }
    //   return this.remove('#Negative')
    // }
    // toNegative(n) {
    //   return getNth(this, n).map(vb => {
    //     let parsed = parseVerb(vb)
    //     let info = getGrammar(vb, parsed)
    //     return toNegative(vb, parsed, info.form)
    //   })
    // }
    // overloaded - keep Verb class
    update(pointer) {
      let m = new Verbs(this.document, pointer)
      m._cache = this._cache // share this full thing
      return m
    }
  }
  Verbs.prototype.toPast = Verbs.prototype.toPastTense
  Verbs.prototype.toPresent = Verbs.prototype.toPresentTense
  Verbs.prototype.toFuture = Verbs.prototype.toFutureTense

  View.prototype.verbs = function (n) {
    let vb = find(this)
    vb = getNth(vb, n)
    return new Verbs(this.document, vb.pointer)
  }
}
export default api
