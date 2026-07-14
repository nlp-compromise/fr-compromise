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

// infinitive of the phrase's main verb - 'a mangé' -> 'manger'
const getMainRoot = function (vb) {
  vb.compute('root')
  let m = vb.match('#Verb').not('(#Auxiliary|#Negative|#Adverb)')
  if (!m.found) {
    m = vb.match('#Verb')
  }
  return m.last().text('root')
}

const elidable = { je: `j'`, ne: `n'`, que: `qu'`, se: `s'`, me: `m'`, te: `t'`, le: `l'`, la: `l'`, de: `d'` }
const startsVowel = /^[aeiouyhâàéèêëîïôöùûü]/
// re-apply french elision after a replacement - 'je avais' -> "j'avais"
const elide = function (view) {
  let ptr = view.fullPointer[0]
  if (!ptr) {
    return view
  }
  let [n, start] = ptr
  let terms = view.document[n] || []
  let prev = terms[start - 1]
  let term = terms[start]
  if (!prev || !term || !term.text) {
    return view
  }
  if (elidable.hasOwnProperty(prev.normal) && prev.post === ' ' && startsVowel.test(term.text.toLowerCase())) {
    // keep the un-elided form findable by the match-engine
    prev.implicit = prev.implicit || prev.normal
    prev.machine = prev.machine || prev.normal
    prev.text = elidable[prev.normal]
    prev.post = ''
    prev.dirty = true
  }
  return view
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
        let str = getMainRoot(vb)
        let present = methods.toPresentTense(str)[form]
        if (!present) {
          return vb
        }
        return elide(vb.replaceWith(present).tag('PresentTense'))
      })
    }
    // uses the imperfect - always grammatical as a one-word substitution
    // (passé composé would require inserting avoir/être + agreement)
    toPastTense(n) {
      const methods = this.methods.two.transform.verb
      return getNth(this, n).map(vb => {
        // 'a mangé' is already past - leave it
        if (vb.has('#Auxiliary #Adverb?+ (#PastParticiple|#PastTense)')) {
          return vb
        }
        let form = getForm(vb)
        let str = getMainRoot(vb)
        let past = methods.toImperfect(str)[form]
        if (!past) {
          return vb
        }
        return elide(vb.replaceWith(past).tag('Imperfect'))
      })
    }
    toFutureTense(n) {
      const methods = this.methods.two.transform.verb
      return getNth(this, n).map(vb => {
        let form = getForm(vb)
        let str = getMainRoot(vb)
        let future = methods.toFutureTense(str)[form]
        if (!future) {
          return vb
        }
        return elide(vb.replaceWith(future).tag('FutureTense'))
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
