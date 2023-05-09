(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.frCompromise = factory());
})(this, (function () { 'use strict';

  let methods$o = {
    one: {},
    two: {},
    three: {},
    four: {},
  };

  let model$7 = {
    one: {},
    two: {},
    three: {},
  };
  let compute$a = {};
  let hooks = [];

  var tmpWrld = { methods: methods$o, model: model$7, compute: compute$a, hooks };

  const isArray$9 = input => Object.prototype.toString.call(input) === '[object Array]';

  const fns$4 = {
    /** add metadata to term objects */
    compute: function (input) {
      const { world } = this;
      const compute = world.compute;
      // do one method
      if (typeof input === 'string' && compute.hasOwnProperty(input)) {
        compute[input](this);
      }
      // allow a list of methods
      else if (isArray$9(input)) {
        input.forEach(name => {
          if (world.compute.hasOwnProperty(name)) {
            compute[name](this);
          } else {
            console.warn('no compute:', input); // eslint-disable-line
          }
        });
      }
      // allow a custom compute function
      else if (typeof input === 'function') {
        input(this);
      } else {
        console.warn('no compute:', input); // eslint-disable-line
      }
      return this
    },
  };
  var compute$9 = fns$4;

  // wrappers for loops in javascript arrays

  const forEach = function (cb) {
    let ptrs = this.fullPointer;
    ptrs.forEach((ptr, i) => {
      let view = this.update([ptr]);
      cb(view, i);
    });
    return this
  };

  const map = function (cb, empty) {
    let ptrs = this.fullPointer;
    let res = ptrs.map((ptr, i) => {
      let view = this.update([ptr]);
      let out = cb(view, i);
      // if we returned nothing, return a view
      if (out === undefined) {
        return this.none()
      }
      return out
    });
    if (res.length === 0) {
      return empty || this.update([])
    }
    // return an array of values, or View objects?
    // user can return either from their callback
    if (res[0] !== undefined) {
      // array of strings
      if (typeof res[0] === 'string') {
        return res
      }
      // array of objects
      if (typeof res[0] === 'object' && (res[0] === null || !res[0].isView)) {
        return res
      }
    }
    // return a View object
    let all = [];
    res.forEach(ptr => {
      all = all.concat(ptr.fullPointer);
    });
    return this.toView(all)
  };

  const filter = function (cb) {
    let ptrs = this.fullPointer;
    ptrs = ptrs.filter((ptr, i) => {
      let view = this.update([ptr]);
      return cb(view, i)
    });
    let res = this.update(ptrs);
    return res
  };

  const find$2 = function (cb) {
    let ptrs = this.fullPointer;
    let found = ptrs.find((ptr, i) => {
      let view = this.update([ptr]);
      return cb(view, i)
    });
    return this.update([found])
  };

  const some = function (cb) {
    let ptrs = this.fullPointer;
    return ptrs.some((ptr, i) => {
      let view = this.update([ptr]);
      return cb(view, i)
    })
  };

  const random = function (n = 1) {
    let ptrs = this.fullPointer;
    let r = Math.floor(Math.random() * ptrs.length);
    //prevent it from going over the end
    if (r + n > this.length) {
      r = this.length - n;
      r = r < 0 ? 0 : r;
    }
    ptrs = ptrs.slice(r, r + n);
    return this.update(ptrs)
  };
  var loops = { forEach, map, filter, find: find$2, some, random };

  const utils = {
    /** */
    termList: function () {
      return this.methods.one.termList(this.docs)
    },
    /** return individual terms*/
    terms: function (n) {
      let m = this.match('.');
      // this is a bit faster than .match('.') 
      // let ptrs = []
      // this.docs.forEach((terms) => {
      //   terms.forEach((term) => {
      //     let [y, x] = term.index || []
      //     ptrs.push([y, x, x + 1])
      //   })
      // })
      // let m = this.update(ptrs)
      return typeof n === 'number' ? m.eq(n) : m
    },

    /** */
    groups: function (group) {
      if (group || group === 0) {
        return this.update(this._groups[group] || [])
      }
      // return an object of Views
      let res = {};
      Object.keys(this._groups).forEach(k => {
        res[k] = this.update(this._groups[k]);
      });
      // this._groups = null
      return res
    },
    /** */
    eq: function (n) {
      let ptr = this.pointer;
      if (!ptr) {
        ptr = this.docs.map((_doc, i) => [i]);
      }
      if (ptr[n]) {
        return this.update([ptr[n]])
      }
      return this.none()
    },
    /** */
    first: function () {
      return this.eq(0)
    },
    /** */
    last: function () {
      let n = this.fullPointer.length - 1;
      return this.eq(n)
    },

    /** grab term[0] for every match */
    firstTerms: function () {
      return this.match('^.')
    },

    /** grab the last term for every match  */
    lastTerms: function () {
      return this.match('.$')
    },

    /** */
    slice: function (min, max) {
      let pntrs = this.pointer || this.docs.map((_o, n) => [n]);
      pntrs = pntrs.slice(min, max);
      return this.update(pntrs)
    },

    /** return a view of the entire document */
    all: function () {
      return this.update().toView()
    },
    /**  */
    fullSentences: function () {
      let ptrs = this.fullPointer.map(a => [a[0]]); //lazy!
      return this.update(ptrs).toView()
    },
    /** return a view of no parts of the document */
    none: function () {
      return this.update([])
    },

    /** are these two views looking at the same words? */
    isDoc: function (b) {
      if (!b || !b.isView) {
        return false
      }
      let aPtr = this.fullPointer;
      let bPtr = b.fullPointer;
      if (!aPtr.length === bPtr.length) {
        return false
      }
      // ensure pointers are the same
      return aPtr.every((ptr, i) => {
        if (!bPtr[i]) {
          return false
        }
        // ensure [n, start, end] are all the same
        return ptr[0] === bPtr[i][0] && ptr[1] === bPtr[i][1] && ptr[2] === bPtr[i][2]
      })
    },

    /** how many seperate terms does the document have? */
    wordCount: function () {
      return this.docs.reduce((count, terms) => {
        count += terms.filter(t => t.text !== '').length;
        return count
      }, 0)
    },

    // is the pointer the full sentence?
    isFull: function () {
      let ptrs = this.pointer;
      if (!ptrs) {
        return true
      }
      let document = this.document;
      for (let i = 0; i < ptrs.length; i += 1) {
        let [n, start, end] = ptrs[i];
        // it's not the start
        if (n !== i || start !== 0) {
          return false
        }
        // it's too short
        if (document[n].length > end) {
          return false
        }
      }
      return true
    },

    // return the nth elem of a doc
    getNth: function (n) {
      if (typeof n === 'number') {
        return this.eq(n)
      } else if (typeof n === 'string') {
        return this.if(n)
      }
      return this
    }

  };
  utils.group = utils.groups;
  utils.fullSentence = utils.fullSentences;
  utils.sentence = utils.fullSentences;
  utils.lastTerm = utils.lastTerms;
  utils.firstTerm = utils.firstTerms;
  var util = utils;

  const methods$n = Object.assign({}, util, compute$9, loops);

  // aliases
  methods$n.get = methods$n.eq;
  var api$n = methods$n;

  class View {
    constructor(document, pointer, groups = {}) {
      // invisible props
      [
        ['document', document],
        ['world', tmpWrld],
        ['_groups', groups],
        ['_cache', null],
        ['viewType', 'View']
      ].forEach(a => {
        Object.defineProperty(this, a[0], {
          value: a[1],
          writable: true,
        });
      });
      this.ptrs = pointer;
    }
    /* getters:  */
    get docs() {
      let docs = this.document;
      if (this.ptrs) {
        docs = tmpWrld.methods.one.getDoc(this.ptrs, this.document);
      }
      return docs
    }
    get pointer() {
      return this.ptrs
    }
    get methods() {
      return this.world.methods
    }
    get model() {
      return this.world.model
    }
    get hooks() {
      return this.world.hooks
    }
    get isView() {
      return true //this comes in handy sometimes
    }
    // is the view not-empty?
    get found() {
      return this.docs.length > 0
    }
    // how many matches we have
    get length() {
      return this.docs.length
    }
    // return a more-hackable pointer
    get fullPointer() {
      let { docs, ptrs, document } = this;
      // compute a proper pointer, from docs
      let pointers = ptrs || docs.map((_d, n) => [n]);
      // do we need to repair it, first?
      return pointers.map(a => {
        let [n, start, end, id, endId] = a;
        start = start || 0;
        end = end || (document[n] || []).length;
        //add frozen id, for good-measure
        if (document[n] && document[n][start]) {
          id = id || document[n][start].id;
          if (document[n][end - 1]) {
            endId = endId || document[n][end - 1].id;
          }
        }
        return [n, start, end, id, endId]
      })
    }
    // create a new View, from this one
    update(pointer) {
      let m = new View(this.document, pointer);
      // send the cache down, too?
      if (this._cache && pointer && pointer.length > 0) {
        // only keep cache if it's a full-sentence
        let cache = [];
        pointer.forEach((ptr, i) => {
          let [n, start, end] = ptr;
          if (ptr.length === 1) {
            cache[i] = this._cache[n];
          } else if (start === 0 && this.document[n].length === end) {
            cache[i] = this._cache[n];
          }
        });
        if (cache.length > 0) {
          m._cache = cache;
        }
      }
      m.world = this.world;
      return m
    }
    // create a new View, from this one
    toView(pointer) {
      return new View(this.document, pointer || this.pointer)
    }
    fromText(input) {
      const { methods } = this;
      //assume ./01-tokenize is installed
      let document = methods.one.tokenize.fromString(input, this.world);
      let doc = new View(document);
      doc.world = this.world;
      doc.compute(['normal', 'lexicon']);
      if (this.world.compute.preTagger) {
        doc.compute('preTagger');
      }
      return doc
    }
    clone() {
      // clone the whole document
      let document = this.document.slice(0);    //node 17: structuredClone(document);
      document = document.map(terms => {
        return terms.map(term => {
          term = Object.assign({}, term);
          term.tags = new Set(term.tags);
          return term
        })
      });
      // clone only sub-document ?
      let m = this.update(this.pointer);
      m.document = document;
      m._cache = this._cache; //clone this too?
      return m
    }
  }
  Object.assign(View.prototype, api$n);
  var View$1 = View;

  var version$1 = '14.9.0';

  const isObject$6 = function (item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  };

  // recursive merge of objects
  function mergeDeep(model, plugin) {
    if (isObject$6(plugin)) {
      for (const key in plugin) {
        if (isObject$6(plugin[key])) {
          if (!model[key]) Object.assign(model, { [key]: {} });
          mergeDeep(model[key], plugin[key]); //recursion
          // } else if (isArray(plugin[key])) {
          // console.log(key)
          // console.log(model)
        } else {
          Object.assign(model, { [key]: plugin[key] });
        }
      }
    }
    return model
  }
  // const merged = mergeDeep({ a: 1 }, { b: { c: { d: { e: 12345 } } } })
  // console.dir(merged, { depth: 5 })

  // vroom
  function mergeQuick(model, plugin) {
    for (const key in plugin) {
      model[key] = model[key] || {};
      Object.assign(model[key], plugin[key]);
    }
    return model
  }

  const addIrregulars = function (model, conj) {
    let m = model.two.models || {};
    Object.keys(conj).forEach(k => {
      // verb forms
      if (conj[k].pastTense) {
        if (m.toPast) {
          m.toPast.ex[k] = conj[k].pastTense;
        }
        if (m.fromPast) {
          m.fromPast.ex[conj[k].pastTense] = k;
        }
      }
      if (conj[k].presentTense) {
        if (m.toPresent) {
          m.toPresent.ex[k] = conj[k].presentTense;
        }
        if (m.fromPresent) {
          m.fromPresent.ex[conj[k].presentTense] = k;
        }
      }
      if (conj[k].gerund) {
        if (m.toGerund) {
          m.toGerund.ex[k] = conj[k].gerund;
        }
        if (m.fromGerund) {
          m.fromGerund.ex[conj[k].gerund] = k;
        }
      }
      // adjective forms
      if (conj[k].comparative) {
        if (m.toComparative) {
          m.toComparative.ex[k] = conj[k].comparative;
        }
        if (m.fromComparative) {
          m.fromComparative.ex[conj[k].comparative] = k;
        }
      }
      if (conj[k].superlative) {
        if (m.toSuperlative) {
          m.toSuperlative.ex[k] = conj[k].superlative;
        }
        if (m.fromSuperlative) {
          m.fromSuperlative.ex[conj[k].superlative] = k;
        }
      }
    });
  };

  const extend = function (plugin, world, View, nlp) {
    const { methods, model, compute, hooks } = world;
    if (plugin.methods) {
      mergeQuick(methods, plugin.methods);
    }
    if (plugin.model) {
      mergeDeep(model, plugin.model);
    }
    if (plugin.irregulars) {
      addIrregulars(model, plugin.irregulars);
    }
    // shallow-merge compute
    if (plugin.compute) {
      Object.assign(compute, plugin.compute);
    }
    // append new hooks
    if (hooks) {
      world.hooks = hooks.concat(plugin.hooks || []);
    }
    // assign new class methods
    if (plugin.api) {
      plugin.api(View);
    }
    if (plugin.lib) {
      Object.keys(plugin.lib).forEach(k => nlp[k] = plugin.lib[k]);
    }
    if (plugin.tags) {
      nlp.addTags(plugin.tags);
    }
    if (plugin.words) {
      nlp.addWords(plugin.words);
    }
    if (plugin.mutate) {
      plugin.mutate(world);
    }
  };
  var extend$1 = extend;

  /** log the decision-making to console */
  const verbose = function (set) {
    const env = typeof process === 'undefined' || !process.env ? self.env || {} : process.env; //use window, in browser
    env.DEBUG_TAGS = set === 'tagger' || set === true ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : '';
    return this
  };

  const isObject$5 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  const isArray$8 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  // internal Term objects are slightly different
  const fromJson = function (json) {
    return json.map(o => {
      return o.terms.map(term => {
        if (isArray$8(term.tags)) {
          term.tags = new Set(term.tags);
        }
        return term
      })
    })
  };

  // interpret an array-of-arrays
  const preTokenized = function (arr) {
    return arr.map((a) => {
      return a.map(str => {
        return {
          text: str,
          normal: str,//cleanup
          pre: '',
          post: ' ',
          tags: new Set()
        }
      })
    })
  };

  const inputs = function (input, View, world) {
    const { methods } = world;
    let doc = new View([]);
    doc.world = world;
    // support a number
    if (typeof input === 'number') {
      input = String(input);
    }
    // return empty doc
    if (!input) {
      return doc
    }
    // parse a string
    if (typeof input === 'string') {
      let document = methods.one.tokenize.fromString(input, world);
      return new View(document)
    }
    // handle compromise View
    if (isObject$5(input) && input.isView) {
      return new View(input.document, input.ptrs)
    }
    // handle json input
    if (isArray$8(input)) {
      // pre-tokenized array-of-arrays 
      if (isArray$8(input[0])) {
        let document = preTokenized(input);
        return new View(document)
      }
      // handle json output
      let document = fromJson(input);
      return new View(document)
    }
    return doc
  };
  var handleInputs = inputs;

  let world = Object.assign({}, tmpWrld);

  const nlp = function (input, lex) {
    if (lex) {
      nlp.addWords(lex);
    }
    let doc = handleInputs(input, View$1, world);
    if (input) {
      doc.compute(world.hooks);
    }
    return doc
  };
  Object.defineProperty(nlp, '_world', {
    value: world,
    writable: true,
  });

  /** don't run the POS-tagger */
  nlp.tokenize = function (input, lex) {
    const { compute } = this._world;
    // add user-given words to lexicon
    if (lex) {
      nlp.addWords(lex);
    }
    // run the tokenizer
    let doc = handleInputs(input, View$1, world);
    // give contractions a shot, at least
    if (compute.contractions) {
      doc.compute(['alias', 'normal', 'machine', 'contractions']); //run it if we've got it
    }
    return doc
  };

  /** extend compromise functionality */
  nlp.plugin = function (plugin) {
    extend$1(plugin, this._world, View$1, this);
    return this
  };
  nlp.extend = nlp.plugin;


  /** reach-into compromise internals */
  nlp.world = function () {
    return this._world
  };
  nlp.model = function () {
    return this._world.model
  };
  nlp.methods = function () {
    return this._world.methods
  };
  nlp.hooks = function () {
    return this._world.hooks
  };

  /** log the decision-making to console */
  nlp.verbose = verbose;
  /** current library release version */
  nlp.version = version$1;

  var nlp$1 = nlp;

  const createCache = function (document) {
    let cache = document.map(terms => {
      let stuff = new Set();
      terms.forEach(term => {
        // add words
        if (term.normal !== '') {
          stuff.add(term.normal);
        }
        // cache switch-status - '%Noun|Verb%'
        if (term.switch) {
          stuff.add(`%${term.switch}%`);
        }
        // cache implicit words, too
        if (term.implicit) {
          stuff.add(term.implicit);
        }
        if (term.machine) {
          stuff.add(term.machine);
        }
        if (term.root) {
          stuff.add(term.root);
        }
        // cache slashes words, etc
        if (term.alias) {
          term.alias.forEach(str => stuff.add(str));
        }
        let tags = Array.from(term.tags);
        for (let t = 0; t < tags.length; t += 1) {
          stuff.add('#' + tags[t]);
        }
      });
      return stuff
    });
    return cache
  };
  var cacheDoc = createCache;

  var methods$m = {
    one: {
      cacheDoc,
    },
  };

  const methods$l = {
    /** */
    cache: function () {
      this._cache = this.methods.one.cacheDoc(this.document);
      return this
    },
    /** */
    uncache: function () {
      this._cache = null;
      return this
    },
  };
  const addAPI$3 = function (View) {
    Object.assign(View.prototype, methods$l);
  };
  var api$m = addAPI$3;

  var compute$8 = {
    cache: function (view) {
      view._cache = view.methods.one.cacheDoc(view.document);
    }
  };

  var cache$1 = {
    api: api$m,
    compute: compute$8,
    methods: methods$m,
  };

  var caseFns = {
    /** */
    toLowerCase: function () {
      this.termList().forEach(t => {
        t.text = t.text.toLowerCase();
      });
      return this
    },
    /** */
    toUpperCase: function () {
      this.termList().forEach(t => {
        t.text = t.text.toUpperCase();
      });
      return this
    },
    /** */
    toTitleCase: function () {
      this.termList().forEach(t => {
        t.text = t.text.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()); //support unicode?
      });
      return this
    },
    /** */
    toCamelCase: function () {
      this.docs.forEach(terms => {
        terms.forEach((t, i) => {
          if (i !== 0) {
            t.text = t.text.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()); //support unicode?
          }
          if (i !== terms.length - 1) {
            t.post = '';
          }
        });
      });
      return this
    },
  };

  // case logic
  const isTitleCase$1 = (str) => /^\p{Lu}[\p{Ll}'’]/u.test(str) || /^\p{Lu}$/u.test(str);
  const toTitleCase$1 = (str) => str.replace(/^\p{Ll}/u, x => x.toUpperCase());
  const toLowerCase = (str) => str.replace(/^\p{Lu}/u, x => x.toLowerCase());

  // splice an array into an array
  const spliceArr = (parent, index, child) => {
    // tag them as dirty
    child.forEach(term => term.dirty = true);
    if (parent) {
      let args = [index, 0].concat(child);
      Array.prototype.splice.apply(parent, args);
    }
    return parent
  };

  // add a space at end, if required
  const endSpace = function (terms) {
    const hasSpace = / $/;
    const hasDash = /[-–—]/;
    let lastTerm = terms[terms.length - 1];
    if (lastTerm && !hasSpace.test(lastTerm.post) && !hasDash.test(lastTerm.post)) {
      lastTerm.post += ' ';
    }
  };

  // sentence-ending punctuation should move in append
  const movePunct = (source, end, needle) => {
    const juicy = /[-.?!,;:)–—'"]/g;
    let wasLast = source[end - 1];
    if (!wasLast) {
      return
    }
    let post = wasLast.post;
    if (juicy.test(post)) {
      let punct = post.match(juicy).join(''); //not perfect
      let last = needle[needle.length - 1];
      last.post = punct + last.post;
      // remove it, from source
      wasLast.post = wasLast.post.replace(juicy, '');
    }
  };


  const moveTitleCase = function (home, start, needle) {
    let from = home[start];
    // should we bother?
    if (start !== 0 || !isTitleCase$1(from.text)) {
      return
    }
    // titlecase new first term
    needle[0].text = toTitleCase$1(needle[0].text);
    // should we un-titlecase the old word?
    let old = home[start];
    if (old.tags.has('ProperNoun') || old.tags.has('Acronym')) {
      return
    }
    if (isTitleCase$1(old.text) && old.text.length > 1) {
      old.text = toLowerCase(old.text);
    }
  };

  // put these words before the others
  const cleanPrepend = function (home, ptr, needle, document) {
    let [n, start, end] = ptr;
    // introduce spaces appropriately
    if (start === 0) {
      // at start - need space in insert
      endSpace(needle);
    } else if (end === document[n].length) {
      // at end - need space in home
      endSpace(needle);
    } else {
      // in middle - need space in home and insert
      endSpace(needle);
      endSpace([home[ptr[1]]]);
    }
    moveTitleCase(home, start, needle);
    // movePunct(home, end, needle)
    spliceArr(home, start, needle);
  };

  const cleanAppend = function (home, ptr, needle, document) {
    let [n, , end] = ptr;
    let total = (document[n] || []).length;
    if (end < total) {
      // are we in the middle?
      // add trailing space on self
      movePunct(home, end, needle);
      endSpace(needle);
    } else if (total === end) {
      // are we at the end?
      // add a space to predecessor
      endSpace(home);
      // very end, move period
      movePunct(home, end, needle);
      // is there another sentence after?
      if (document[n + 1]) {
        needle[needle.length - 1].post += ' ';
      }
    }
    spliceArr(home, ptr[2], needle);
    // set new endId
    ptr[4] = needle[needle.length - 1].id;
  };

  /*
  unique & ordered term ids, based on time & term index

  Base 36 (numbers+ascii)
    3 digit 4,600
    2 digit 1,200
    1 digit 36

    TTT|NNN|II|R

  TTT -> 46 terms since load
  NNN -> 46 thousand sentences (>1 inf-jest)
  II  -> 1,200 words in a sentence (nuts)
  R   -> 1-36 random number 

  novels: 
    avg 80,000 words
      15 words per sentence
    5,000 sentences

  Infinite Jest:
    36,247 sentences
    https://en.wikipedia.org/wiki/List_of_longest_novels

  collisions are more-likely after
      46 seconds have passed,
    and 
      after 46-thousand sentences

  */
  let index$2 = 0;

  const pad3 = (str) => {
    str = str.length < 3 ? '0' + str : str;
    return str.length < 3 ? '0' + str : str
  };

  const toId = function (term) {
    let [n, i] = term.index || [0, 0];
    index$2 += 1;

    //don't overflow index
    index$2 = index$2 > 46655 ? 0 : index$2;
    //don't overflow sentences
    n = n > 46655 ? 0 : n;
    // //don't overflow terms
    i = i > 1294 ? 0 : i;

    // 3 digits for time
    let id = pad3(index$2.toString(36));
    // 3 digit  for sentence index (46k)
    id += pad3(n.toString(36));

    // 1 digit for term index (36)
    let tx = i.toString(36);
    tx = tx.length < 2 ? '0' + tx : tx; //pad2
    id += tx;

    // 1 digit random number
    let r = parseInt(Math.random() * 36, 10);
    id += (r).toString(36);

    return term.normal + '|' + id.toUpperCase()
  };

  var uuid = toId;

  // setInterval(() => console.log(toId(4, 12)), 100)

  // are we inserting inside a contraction?
  // expand it first
  const expand$1 = function (m) {
    if (m.has('@hasContraction') && typeof m.contractions === 'function') {//&& m.after('^.').has('@hasContraction')
      let more = m.grow('@hasContraction');
      more.contractions().expand();
    }
  };

  const isArray$7 = (arr) => Object.prototype.toString.call(arr) === '[object Array]';

  // set new ids for each terms
  const addIds$2 = function (terms) {
    terms = terms.map((term) => {
      term.id = uuid(term);
      return term
    });
    return terms
  };

  const getTerms = function (input, world) {
    const { methods } = world;
    // create our terms from a string
    if (typeof input === 'string') {
      return methods.one.tokenize.fromString(input, world)[0] //assume one sentence
    }
    //allow a view object
    if (typeof input === 'object' && input.isView) {
      return input.clone().docs[0] || [] //assume one sentence
    }
    //allow an array of terms, too
    if (isArray$7(input)) {
      return isArray$7(input[0]) ? input[0] : input
    }
    return []
  };

  const insert = function (input, view, prepend) {
    const { document, world } = view;
    view.uncache();
    // insert words at end of each doc
    let ptrs = view.fullPointer;
    let selfPtrs = view.fullPointer;
    view.forEach((m, i) => {
      let ptr = m.fullPointer[0];
      let [n] = ptr;
      // add-in the words
      let home = document[n];
      let terms = getTerms(input, world);
      // are we inserting nothing?
      if (terms.length === 0) {
        return
      }
      terms = addIds$2(terms);
      if (prepend) {
        expand$1(view.update([ptr]).firstTerm());
        cleanPrepend(home, ptr, terms, document);
      } else {
        expand$1(view.update([ptr]).lastTerm());
        cleanAppend(home, ptr, terms, document);
      }
      // harden the pointer
      if (document[n] && document[n][ptr[1]]) {
        ptr[3] = document[n][ptr[1]].id;
      }
      // change self backwards by len
      selfPtrs[i] = ptr;
      // extend the pointer
      ptr[2] += terms.length;
      ptrs[i] = ptr;
    });
    let doc = view.toView(ptrs);
    // shift our self pointer, if necessary
    view.ptrs = selfPtrs;
    // try to tag them, too
    doc.compute(['id', 'index', 'lexicon']);
    if (doc.world.compute.preTagger) {
      doc.compute('preTagger');
    }
    return doc
  };

  const fns$3 = {
    insertAfter: function (input) {
      return insert(input, this, false)
    },
    insertBefore: function (input) {
      return insert(input, this, true)
    },

  };
  fns$3.append = fns$3.insertAfter;
  fns$3.prepend = fns$3.insertBefore;
  fns$3.insert = fns$3.insertAfter;

  var insert$1 = fns$3;

  const dollarStub = /\$[0-9a-z]+/g;
  const fns$2 = {};

  const titleCase$3 = function (str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
  };

  // doc.replace('foo', (m)=>{})
  const replaceByFn = function (main, fn) {
    main.forEach(m => {
      let out = fn(m);
      m.replaceWith(out);
    });
    return main
  };

  // support 'foo $0' replacements
  const subDollarSign = function (input, main) {
    if (typeof input !== 'string') {
      return input
    }
    let groups = main.groups();
    input = input.replace(dollarStub, (a) => {
      let num = a.replace(/\$/, '');
      if (groups.hasOwnProperty(num)) {
        return groups[num].text()
      }
      return a
    });
    return input
  };

  fns$2.replaceWith = function (input, keep = {}) {
    let ptrs = this.fullPointer;
    let main = this;
    this.uncache();
    if (typeof input === 'function') {
      return replaceByFn(main, input)
    }
    let terms = main.docs[0];
    let isPossessive = keep.possessives && terms[terms.length - 1].tags.has('Possessive');
    // support 'foo $0' replacements
    input = subDollarSign(input, main);

    let original = this.update(ptrs);
    // soften-up pointer
    ptrs = ptrs.map(ptr => ptr.slice(0, 3));
    // original.freeze()
    let oldTags = (original.docs[0] || []).map(term => Array.from(term.tags));
    // slide this in
    if (typeof input === 'string') {
      input = this.fromText(input).compute('id');
    }
    main.insertAfter(input);
    // are we replacing part of a contraction?
    if (original.has('@hasContraction') && main.contractions) {
      let more = main.grow('@hasContraction+');
      more.contractions().expand();
    }
    // delete the original terms
    main.delete(original); //science.

    // keep "John's"
    if (isPossessive) {
      let tmp = main.docs[0];
      let term = tmp[tmp.length - 1];
      if (!term.tags.has('Possessive')) {
        term.text += '\'s';
        term.normal += '\'s';
        term.tags.add('Possessive');
      }
    }
    // what should we return?
    let m = main.toView(ptrs).compute(['index', 'lexicon']);
    if (m.world.compute.preTagger) {
      m.compute('preTagger');
    }
    // replace any old tags
    if (keep.tags) {
      m.terms().forEach((term, i) => {
        term.tagSafe(oldTags[i]);
      });
    }
    // try to co-erce case, too
    if (keep.case && m.docs[0] && m.docs[0][0] && m.docs[0][0].index[1] === 0) {
      m.docs[0][0].text = titleCase$3(m.docs[0][0].text);
    }

    // try to keep some pre-post punctuation
    // if (m.terms().length === 1 && main.terms().length === 1) {
    //   console.log(original.docs)
    // }

    // console.log(input.docs[0])
    // let regs = input.docs[0].map(t => {
    //   return { id: t.id, optional: true }
    // })
    // m.after('(a|hoy)').debug()
    // m.growRight('(a|hoy)').debug()
    // console.log(m)
    return m
  };

  fns$2.replace = function (match, input, keep) {
    if (match && !input) {
      return this.replaceWith(match, keep)
    }
    let m = this.match(match);
    if (!m.found) {
      return this
    }
    this.soften();
    return m.replaceWith(input, keep)
  };
  var replace = fns$2;

  // transfer sentence-ending punctuation
  const repairPunct = function (terms, len) {
    let last = terms.length - 1;
    let from = terms[last];
    let to = terms[last - len];
    if (to && from) {
      to.post += from.post; //this isn't perfect.
      to.post = to.post.replace(/ +([.?!,;:])/, '$1');
      // don't allow any silly punctuation outcomes like ',!'
      to.post = to.post.replace(/[,;:]+([.?!])/, '$1');
    }
  };

  // remove terms from document json
  const pluckOut = function (document, nots) {
    nots.forEach(ptr => {
      let [n, start, end] = ptr;
      let len = end - start;
      if (!document[n]) {
        return // weird!
      }
      if (end === document[n].length && end > 1) {
        repairPunct(document[n], len);
      }
      document[n].splice(start, len); // replaces len terms at index start
    });
    // remove any now-empty sentences
    // (foreach + splice = 'mutable filter')
    for (let i = document.length - 1; i >= 0; i -= 1) {
      if (document[i].length === 0) {
        document.splice(i, 1);
        // remove any trailing whitespace before our removed sentence
        if (i === document.length && document[i - 1]) {
          let terms = document[i - 1];
          let lastTerm = terms[terms.length - 1];
          if (lastTerm) {
            lastTerm.post = lastTerm.post.trimEnd();
          }
        }
        // repair any downstream indexes
        // for (let k = i; k < document.length; k += 1) {
        //   document[k].forEach(term => term.index[0] -= 1)
        // }
      }
    }
    return document
  };

  var pluckOutTerm = pluckOut;

  const fixPointers$1 = function (ptrs, gonePtrs) {
    ptrs = ptrs.map(ptr => {
      let [n] = ptr;
      if (!gonePtrs[n]) {
        return ptr
      }
      gonePtrs[n].forEach(no => {
        let len = no[2] - no[1];
        // does it effect our pointer?
        if (ptr[1] <= no[1] && ptr[2] >= no[2]) {
          ptr[2] -= len;
        }
      });
      return ptr
    });

    // decrement any pointers after a now-empty pointer
    ptrs.forEach((ptr, i) => {
      // is the pointer now empty?
      if (ptr[1] === 0 && ptr[2] == 0) {
        // go down subsequent pointers
        for (let n = i + 1; n < ptrs.length; n += 1) {
          ptrs[n][0] -= 1;
          if (ptrs[n][0] < 0) {
            ptrs[n][0] = 0;
          }
        }
      }
    });
    // remove any now-empty pointers
    ptrs = ptrs.filter(ptr => ptr[2] - ptr[1] > 0);

    // remove old hard-pointers
    ptrs = ptrs.map((ptr) => {
      ptr[3] = null;
      ptr[4] = null;
      return ptr
    });
    return ptrs
  };

  const methods$k = {
    /** */
    remove: function (reg) {
      const { indexN } = this.methods.one.pointer;
      this.uncache();
      // two modes:
      //  - a. remove self, from full parent
      let self = this.all();
      let not = this;
      //  - b. remove a match, from self
      if (reg) {
        self = this;
        not = this.match(reg);
      }
      let isFull = !self.ptrs;
      // is it part of a contraction?
      if (not.has('@hasContraction') && not.contractions) {
        let more = not.grow('@hasContraction');
        more.contractions().expand();
      }

      let ptrs = self.fullPointer;
      let nots = not.fullPointer.reverse();
      // remove them from the actual document)
      let document = pluckOutTerm(this.document, nots);
      // repair our pointers
      let gonePtrs = indexN(nots);
      ptrs = fixPointers$1(ptrs, gonePtrs);
      // clean up our original inputs
      self.ptrs = ptrs;
      self.document = document;
      self.compute('index');
      // if we started zoomed-out, try to end zoomed-out
      if (isFull) {
        self.ptrs = undefined;
      }
      if (!reg) {
        this.ptrs = [];
        return self.none()
      }
      let res = self.toView(ptrs); //return new document
      return res
    },
  };

  // aliases
  methods$k.delete = methods$k.remove;
  var remove = methods$k;

  const methods$j = {
    /** add this punctuation or whitespace before each match: */
    pre: function (str, concat) {
      if (str === undefined && this.found) {
        return this.docs[0][0].pre
      }
      this.docs.forEach(terms => {
        let term = terms[0];
        if (concat === true) {
          term.pre += str;
        } else {
          term.pre = str;
        }
      });
      return this
    },

    /** add this punctuation or whitespace after each match: */
    post: function (str, concat) {
      if (str === undefined) {
        let last = this.docs[this.docs.length - 1];
        return last[last.length - 1].post
      }
      this.docs.forEach(terms => {
        let term = terms[terms.length - 1];
        if (concat === true) {
          term.post += str;
        } else {
          term.post = str;
        }
      });
      return this
    },

    /** remove whitespace from start/end */
    trim: function () {
      if (!this.found) {
        return this
      }
      let docs = this.docs;
      let start = docs[0][0];
      start.pre = start.pre.trimStart();
      let last = docs[docs.length - 1];
      let end = last[last.length - 1];
      end.post = end.post.trimEnd();
      return this
    },

    /** connect words with hyphen, and remove whitespace */
    hyphenate: function () {
      this.docs.forEach(terms => {
        //remove whitespace
        terms.forEach((t, i) => {
          if (i !== 0) {
            t.pre = '';
          }
          if (terms[i + 1]) {
            t.post = '-';
          }
        });
      });
      return this
    },

    /** remove hyphens between words, and set whitespace */
    dehyphenate: function () {
      const hasHyphen = /[-–—]/;
      this.docs.forEach(terms => {
        //remove whitespace
        terms.forEach(t => {
          if (hasHyphen.test(t.post)) {
            t.post = ' ';
          }
        });
      });
      return this
    },

    /** add quotations around these matches */
    toQuotations: function (start, end) {
      start = start || `"`;
      end = end || `"`;
      this.docs.forEach(terms => {
        terms[0].pre = start + terms[0].pre;
        let last = terms[terms.length - 1];
        last.post = end + last.post;
      });
      return this
    },

    /** add brackets around these matches */
    toParentheses: function (start, end) {
      start = start || `(`;
      end = end || `)`;
      this.docs.forEach(terms => {
        terms[0].pre = start + terms[0].pre;
        let last = terms[terms.length - 1];
        last.post = end + last.post;
      });
      return this
    },
  };

  // aliases
  methods$j.deHyphenate = methods$j.dehyphenate;
  methods$j.toQuotation = methods$j.toQuotations;

  var whitespace = methods$j;

  /** alphabetical order */
  const alpha = (a, b) => {
    if (a.normal < b.normal) {
      return -1
    }
    if (a.normal > b.normal) {
      return 1
    }
    return 0
  };

  /** count the # of characters of each match */
  const length = (a, b) => {
    let left = a.normal.trim().length;
    let right = b.normal.trim().length;
    if (left < right) {
      return 1
    }
    if (left > right) {
      return -1
    }
    return 0
  };

  /** count the # of terms in each match */
  const wordCount$2 = (a, b) => {
    if (a.words < b.words) {
      return 1
    }
    if (a.words > b.words) {
      return -1
    }
    return 0
  };

  /** count the # of terms in each match */
  const sequential = (a, b) => {
    if (a[0] < b[0]) {
      return 1
    }
    if (a[0] > b[0]) {
      return -1
    }
    return a[1] > b[1] ? 1 : -1
  };

  /** sort by # of duplicates in the document*/
  const byFreq = function (arr) {
    let counts = {};
    arr.forEach(o => {
      counts[o.normal] = counts[o.normal] || 0;
      counts[o.normal] += 1;
    });
    // sort by freq
    arr.sort((a, b) => {
      let left = counts[a.normal];
      let right = counts[b.normal];
      if (left < right) {
        return 1
      }
      if (left > right) {
        return -1
      }
      return 0
    });
    return arr
  };

  var methods$i = { alpha, length, wordCount: wordCount$2, sequential, byFreq };

  // aliases
  const seqNames = new Set(['index', 'sequence', 'seq', 'sequential', 'chron', 'chronological']);
  const freqNames = new Set(['freq', 'frequency', 'topk', 'repeats']);
  const alphaNames = new Set(['alpha', 'alphabetical']);

  // support function as parameter
  const customSort = function (view, fn) {
    let ptrs = view.fullPointer;
    ptrs = ptrs.sort((a, b) => {
      a = view.update([a]);
      b = view.update([b]);
      return fn(a, b)
    });
    view.ptrs = ptrs; //mutate original
    return view
  };

  /** re-arrange the order of the matches (in place) */
  const sort = function (input) {
    let { docs, pointer } = this;
    this.uncache();
    if (typeof input === 'function') {
      return customSort(this, input)
    }
    input = input || 'alpha';
    let ptrs = pointer || docs.map((_d, n) => [n]);
    let arr = docs.map((terms, n) => {
      return {
        index: n,
        words: terms.length,
        normal: terms.map(t => t.machine || t.normal || '').join(' '),
        pointer: ptrs[n],
      }
    });
    // 'chronological' sorting
    if (seqNames.has(input)) {
      input = 'sequential';
    }
    // alphabetical sorting
    if (alphaNames.has(input)) {
      input = 'alpha';
    }
    // sort by frequency
    if (freqNames.has(input)) {
      arr = methods$i.byFreq(arr);
      return this.update(arr.map(o => o.pointer))
    }
    // apply sort method on each phrase
    if (typeof methods$i[input] === 'function') {
      arr = arr.sort(methods$i[input]);
      return this.update(arr.map(o => o.pointer))
    }
    return this
  };

  /** reverse the order of the matches, but not the words or index */
  const reverse$2 = function () {
    let ptrs = this.pointer || this.docs.map((_d, n) => [n]);
    ptrs = [].concat(ptrs);
    ptrs = ptrs.reverse();
    if (this._cache) {
      this._cache = this._cache.reverse();
    }
    return this.update(ptrs)
  };

  /** remove any duplicate matches */
  const unique = function () {
    let already = new Set();
    let res = this.filter(m => {
      let txt = m.text('machine');
      if (already.has(txt)) {
        return false
      }
      already.add(txt);
      return true
    });
    // this.ptrs = res.ptrs //mutate original?
    return res//.compute('index')
  };

  var sort$1 = { unique, reverse: reverse$2, sort };

  const isArray$6 = (arr) => Object.prototype.toString.call(arr) === '[object Array]';

  // append a new document, somehow
  const combineDocs = function (homeDocs, inputDocs) {
    if (homeDocs.length > 0) {
      // add a space
      let end = homeDocs[homeDocs.length - 1];
      let last = end[end.length - 1];
      if (/ /.test(last.post) === false) {
        last.post += ' ';
      }
    }
    homeDocs = homeDocs.concat(inputDocs);
    return homeDocs
  };

  const combineViews = function (home, input) {
    // is it a view from the same document?
    if (home.document === input.document) {
      let ptrs = home.fullPointer.concat(input.fullPointer);
      return home.toView(ptrs).compute('index')
    }
    // update n of new pointer, to end of our pointer
    let ptrs = input.fullPointer;
    ptrs.forEach(a => {
      a[0] += home.document.length;
    });
    home.document = combineDocs(home.document, input.docs);
    return home.all()
  };

  var concat = {
    // add string as new match/sentence
    concat: function (input) {
      // parse and splice-in new terms
      if (typeof input === 'string') {
        let more = this.fromText(input);
        // easy concat
        if (!this.found || !this.ptrs) {
          this.document = this.document.concat(more.document);
        } else {
          // if we are in the middle, this is actually a splice operation
          let ptrs = this.fullPointer;
          let at = ptrs[ptrs.length - 1][0];
          this.document.splice(at, 0, ...more.document);
        }
        // put the docs
        return this.all().compute('index')
      }
      // plop some view objects together
      if (typeof input === 'object' && input.isView) {
        return combineViews(this, input)
      }
      // assume it's an array of terms
      if (isArray$6(input)) {
        let docs = combineDocs(this.document, input);
        this.document = docs;
        return this.all()
      }
      return this
    },
  };

  // add indexes to pointers
  const harden = function () {
    this.ptrs = this.fullPointer;
    return this
  };
  // remove indexes from pointers
  const soften = function () {
    let ptr = this.ptrs;
    if (!ptr || ptr.length < 1) {
      return this
    }
    ptr = ptr.map(a => a.slice(0, 3));
    this.ptrs = ptr;
    return this
  };
  var harden$1 = { harden, soften };

  const methods$h = Object.assign({}, caseFns, insert$1, replace, remove, whitespace, sort$1, concat, harden$1);

  const addAPI$2 = function (View) {
    Object.assign(View.prototype, methods$h);
  };
  var api$l = addAPI$2;

  const compute$6 = {
    id: function (view) {
      let docs = view.docs;
      for (let n = 0; n < docs.length; n += 1) {
        for (let i = 0; i < docs[n].length; i += 1) {
          let term = docs[n][i];
          term.id = term.id || uuid(term);
        }
      }
    }
  };

  var compute$7 = compute$6;

  var change = {
    api: api$l,
    compute: compute$7,
  };

  var contractions$5 = [
    // simple mappings
    { word: '@', out: ['at'] },
    { word: 'arent', out: ['are', 'not'] },
    { word: 'alot', out: ['a', 'lot'] },
    { word: 'brb', out: ['be', 'right', 'back'] },
    { word: 'cannot', out: ['can', 'not'] },
    { word: 'cant', out: ['can', 'not'] },
    { word: 'dont', out: ['do', 'not'] },
    { word: 'dun', out: ['do', 'not'] },
    { word: 'wont', out: ['will', 'not'] },
    { word: "can't", out: ['can', 'not'] },
    { word: "shan't", out: ['should', 'not'] },
    { word: "won't", out: ['will', 'not'] },
    { word: "that's", out: ['that', 'is'] },
    { word: "what's", out: ['what', 'is'] },
    { word: "let's", out: ['let', 'us'] },
    // { word: "there's", out: ['there', 'is'] },
    { word: 'dunno', out: ['do', 'not', 'know'] },
    { word: 'gonna', out: ['going', 'to'] },
    { word: 'gotta', out: ['have', 'got', 'to'] }, //hmm
    { word: 'gimme', out: ['give', 'me'] },
    { word: 'outta', out: ['out', 'of'] },
    { word: 'tryna', out: ['trying', 'to'] },
    { word: 'gtg', out: ['got', 'to', 'go'] },
    { word: 'im', out: ['i', 'am'] },
    { word: 'imma', out: ['I', 'will'] },
    { word: 'imo', out: ['in', 'my', 'opinion'] },
    { word: 'irl', out: ['in', 'real', 'life'] },
    { word: 'ive', out: ['i', 'have'] },
    { word: 'rn', out: ['right', 'now'] },
    { word: 'tbh', out: ['to', 'be', 'honest'] },
    { word: 'wanna', out: ['want', 'to'] },
    { word: `c'mere`, out: ['come', 'here'] },
    { word: `c'mon`, out: ['come', 'on'] },
    // apostrophe d
    { word: 'howd', out: ['how', 'did'] },
    { word: 'whatd', out: ['what', 'did'] },
    { word: 'whend', out: ['when', 'did'] },
    { word: 'whered', out: ['where', 'did'] },
    // shoulda, coulda
    { word: 'shoulda', out: ['should', 'have'] },
    { word: 'coulda', out: ['coulda', 'have'] },
    { word: 'woulda', out: ['woulda', 'have'] },
    { word: 'musta', out: ['must', 'have'] },

    // { after: `cause`, out: ['because'] },
    { word: "tis", out: ['it', 'is'] },
    { word: "twas", out: ['it', 'was'] },
    { word: `y'know`, out: ['you', 'know'] },
    { word: "ne'er", out: ['never'] },
    { word: "o'er", out: ['over'] },
    // contraction-part mappings
    { after: 'll', out: ['will'] },
    { after: 've', out: ['have'] },
    { after: 're', out: ['are'] },
    { after: 'm', out: ['am'] },
    // french contractions
    { before: 'c', out: ['ce'] },
    { before: 'm', out: ['me'] },
    { before: 'n', out: ['ne'] },
    { before: 'qu', out: ['que'] },
    { before: 's', out: ['se'] },
    { before: 't', out: ['tu'] }, // t'aime
  ];

  // number suffixes that are not units
  const t$1 = true;
  var numberSuffixes = {
    'st': t$1,
    'nd': t$1,
    'rd': t$1,
    'th': t$1,
    'am': t$1,
    'pm': t$1,
    'max': t$1,
    '°': t$1,
    's': t$1, // 1990s
    'e': t$1, // 18e - french/spanish ordinal
    'er': t$1, //french 1er
    'ère': t$1, //''
    'ème': t$1, //french 2ème
  };

  var model$6 = {
    one: {
      contractions: contractions$5,
      numberSuffixes
    }
  };

  // put n new words where 1 word was
  const insertContraction = function (document, point, words) {
    let [n, w] = point;
    if (!words || words.length === 0) {
      return
    }
    words = words.map((word, i) => {
      word.implicit = word.text;
      word.machine = word.text;
      word.pre = '';
      word.post = '';
      word.text = '';
      word.normal = '';
      word.index = [n, w + i];
      return word
    });
    if (words[0]) {
      // move whitespace over
      words[0].pre = document[n][w].pre;
      words[words.length - 1].post = document[n][w].post;
      // add the text/normal to the first term
      words[0].text = document[n][w].text;
      words[0].normal = document[n][w].normal; // move tags too?
    }
    // do the splice
    document[n].splice(w, 1, ...words);
  };
  var splice = insertContraction;

  const hasContraction$1 = /'/;
  //look for a past-tense verb
  // const hasPastTense = (terms, i) => {
  //   let after = terms.slice(i + 1, i + 3)
  //   return after.some(t => t.tags.has('PastTense'))
  // }
  // he'd walked -> had
  // how'd -> did
  // he'd go -> would

  const alwaysDid = new Set([
    'what',
    'how',
    'when',
    'where',
    'why',
  ]);

  // after-words
  const useWould = new Set([
    'be',
    'go',
    'start',
    'think',
    'need',
  ]);

  const useHad = new Set([
    'been',
    'gone'
  ]);
  // they'd gone
  // they'd go


  // he'd been
  //    he had been
  //    he would been

  const _apostropheD = function (terms, i) {
    let before = terms[i].normal.split(hasContraction$1)[0];

    // what'd, how'd
    if (alwaysDid.has(before)) {
      return [before, 'did']
    }
    if (terms[i + 1]) {
      // they'd gone
      if (useHad.has(terms[i + 1].normal)) {
        return [before, 'had']
      }
      // they'd go
      if (useWould.has(terms[i + 1].normal)) {
        return [before, 'would']
      }
    }
    return null
    //   if (hasPastTense(terms, i) === true) {
    //     return [before, 'had']
    //   }
    //   // had/would/did
    //   return [before, 'would']
  };
  var apostropheD = _apostropheD;

  //ain't -> are/is not
  const apostropheT = function (terms, i) {
    if (terms[i].normal === "ain't" || terms[i].normal === 'aint') {
      return null //do this in ./two/
    }
    let before = terms[i].normal.replace(/n't/, '');
    return [before, 'not']
  };

  var apostropheT$1 = apostropheT;

  const hasContraction = /'/;

  // l'amour
  const preL = (terms, i) => {
    // le/la
    let after = terms[i].normal.split(hasContraction)[1];
    // quick french gender disambig (rough)
    if (after && after.endsWith('e')) {
      return ['la', after]
    }
    return ['le', after]
  };

  // d'amerique
  const preD = (terms, i) => {
    let after = terms[i].normal.split(hasContraction)[1];
    // quick guess for noun-agreement (rough)
    if (after && after.endsWith('e')) {
      return ['du', after]
    } else if (after && after.endsWith('s')) {
      return ['des', after]
    }
    return ['de', after]
  };

  // j'aime
  const preJ = (terms, i) => {
    let after = terms[i].normal.split(hasContraction)[1];
    return ['je', after]
  };

  var french = {
    preJ,
    preL,
    preD,
  };

  const isRange = /^([0-9.]{1,4}[a-z]{0,2}) ?[-–—] ?([0-9]{1,4}[a-z]{0,2})$/i;
  const timeRange = /^([0-9]{1,2}(:[0-9][0-9])?(am|pm)?) ?[-–—] ?([0-9]{1,2}(:[0-9][0-9])?(am|pm)?)$/i;
  const phoneNum = /^[0-9]{3}-[0-9]{4}$/;

  const numberRange = function (terms, i) {
    let term = terms[i];
    let parts = term.text.match(isRange);
    if (parts !== null) {
      // 123-1234 is a phone number, not a number-range
      if (term.tags.has('PhoneNumber') === true || phoneNum.test(term.text)) {
        return null
      }
      return [parts[1], 'to', parts[2]]
    } else {
      parts = term.text.match(timeRange);
      if (parts !== null) {
        return [parts[1], 'to', parts[4]]
      }
    }
    return null
  };
  var numberRange$1 = numberRange;

  const numUnit = /^([+-]?[0-9][.,0-9]*)([a-z°²³µ/]+)$/; //(must be lowercase)

  const numberUnit = function (terms, i, world) {
    const notUnit = world.model.one.numberSuffixes || {};
    let term = terms[i];
    let parts = term.text.match(numUnit);
    if (parts !== null) {
      // is it a recognized unit, like 'km'?
      let unit = parts[2].toLowerCase().trim();
      // don't split '3rd'
      if (notUnit.hasOwnProperty(unit)) {
        return null
      }
      return [parts[1], unit] //split it
    }
    return null
  };
  var numberUnit$1 = numberUnit;

  const byApostrophe = /'/;
  const numDash = /^[0-9][^-–—]*[-–—].*?[0-9]/;

  // run tagger on our new implicit terms
  const reTag = function (terms, view, start, len) {
    let tmp = view.update();
    tmp.document = [terms];
    // offer to re-tag neighbours, too
    let end = start + len;
    if (start > 0) {
      start -= 1;
    }
    if (terms[end]) {
      end += 1;
    }
    tmp.ptrs = [[0, start, end]];
  };

  const byEnd = {
    // ain't
    t: (terms, i) => apostropheT$1(terms, i),
    // how'd
    d: (terms, i) => apostropheD(terms, i),
  };

  const byStart = {
    // j'aime
    j: (terms, i) => french.preJ(terms, i),
    // l'amour
    l: (terms, i) => french.preL(terms, i),
    // d'amerique
    d: (terms, i) => french.preD(terms, i),
  };

  // pull-apart known contractions from model
  const knownOnes = function (list, term, before, after) {
    for (let i = 0; i < list.length; i += 1) {
      let o = list[i];
      // look for word-word match (cannot-> [can, not])
      if (o.word === term.normal) {
        return o.out
      }
      // look for after-match ('re -> [_, are])
      else if (after !== null && after === o.after) {
        return [before].concat(o.out)
      }
      // look for before-match (l' -> [le, _])
      else if (before !== null && before === o.before) {
        return o.out.concat(after)
        // return [o.out, after] //typeof o.out === 'string' ? [o.out, after] : o.out(terms, i)
      }
    }
    return null
  };

  const toDocs = function (words, view) {
    let doc = view.fromText(words.join(' '));
    doc.compute(['id', 'alias']);
    return doc.docs[0]
  };

  // there's is usually [there, is]
  // but can be 'there has' for 'there has (..) been'
  const thereHas = function (terms, i) {
    for (let k = i + 1; k < 5; k += 1) {
      if (!terms[k]) {
        break
      }
      if (terms[k].normal === 'been') {
        return ['there', 'has']
      }
    }
    return ['there', 'is']
  };

  //really easy ones
  const contractions$3 = (view) => {
    let { world, document } = view;
    const { model, methods } = world;
    let list = model.one.contractions || [];
    // let units = new Set(model.one.units || [])
    // each sentence
    document.forEach((terms, n) => {
      // loop through terms backwards
      for (let i = terms.length - 1; i >= 0; i -= 1) {
        let before = null;
        let after = null;
        if (byApostrophe.test(terms[i].normal) === true) {
          [before, after] = terms[i].normal.split(byApostrophe);
        }
        // any known-ones, like 'dunno'?
        let words = knownOnes(list, terms[i], before, after);
        // ['foo', 's']
        if (!words && byEnd.hasOwnProperty(after)) {
          words = byEnd[after](terms, i, world);
        }
        // ['j', 'aime']
        if (!words && byStart.hasOwnProperty(before)) {
          words = byStart[before](terms, i);
        }
        // 'there is' vs 'there has'
        if (before === 'there' && after === 's') {
          words = thereHas(terms, i);
        }
        // actually insert the new terms
        if (words) {
          words = toDocs(words, view);
          splice(document, [n, i], words);
          reTag(document[n], view, i, words.length);
          continue
        }
        // '44-2' has special care
        if (numDash.test(terms[i].normal)) {
          words = numberRange$1(terms, i);
          if (words) {
            words = toDocs(words, view);
            splice(document, [n, i], words);
            methods.one.setTag(words, 'NumberRange', world);//add custom tag
            // is it a time-range, like '5-9pm'
            if (words[2] && words[2].tags.has('Time')) {
              methods.one.setTag([words[0]], 'Time', world, null, 'time-range');
            }
            reTag(document[n], view, i, words.length);
          }
          continue
        }
        // split-apart '4km'
        words = numberUnit$1(terms, i, world);
        if (words) {
          words = toDocs(words, view);
          splice(document, [n, i], words);
          methods.one.setTag([words[1]], 'Unit', world, null, 'contraction-unit');
        }
      }
    });
  };
  var contractions$4 = contractions$3;

  var compute$5 = { contractions: contractions$4 };

  const plugin = {
    model: model$6,
    compute: compute$5,
    hooks: ['contractions'],
  };
  var contractions$2 = plugin;

  // scan-ahead to match multiple-word terms - 'jack rabbit'
  const checkMulti = function (terms, i, lexicon, setTag, world) {
    let max = i + 4 > terms.length ? terms.length - i : 4;
    let str = terms[i].machine || terms[i].normal;
    for (let skip = 1; skip < max; skip += 1) {
      let t = terms[i + skip];
      let word = t.machine || t.normal;
      str += ' ' + word;
      if (lexicon.hasOwnProperty(str) === true) {
        let tag = lexicon[str];
        let ts = terms.slice(i, i + skip + 1);
        setTag(ts, tag, world, false, '1-multi-lexicon');

        // special case for phrasal-verbs - 2nd word is a #Particle
        if (tag && tag.length === 2 && (tag[0] === 'PhrasalVerb' || tag[1] === 'PhrasalVerb')) {
          // guard against 'take walks in'
          // if (terms[i + skip - 2] && terms[i + skip - 2].tags.has('Infinitive')) { }
          setTag([ts[1]], 'Particle', world, false, '1-phrasal-particle');
        }
        return true
      }
    }
    return false
  };

  const multiWord = function (terms, i, world) {
    const { model, methods } = world;
    // const { fastTag } = methods.one
    const setTag = methods.one.setTag;
    const multi = model.one._multiCache || {};
    const lexicon = model.one.lexicon || {};
    // basic lexicon lookup
    let t = terms[i];
    let word = t.machine || t.normal;
    // multi-word lookup
    if (terms[i + 1] !== undefined && multi[word] === true) {
      return checkMulti(terms, i, lexicon, setTag, world)
    }
    return null
  };
  var multiWord$1 = multiWord;

  const prefix$1 = /^(under|over|mis|re|un|dis|semi|pre|post)-?/;
  // anti|non|extra|inter|intra|over
  const allowPrefix = new Set(['Verb', 'Infinitive', 'PastTense', 'Gerund', 'PresentTense', 'Adjective', 'Participle']);

  // tag any words in our lexicon
  const checkLexicon = function (terms, i, world) {
    const { model, methods } = world;
    // const fastTag = methods.one.fastTag
    const setTag = methods.one.setTag;
    const lexicon = model.one.lexicon;

    // basic lexicon lookup
    let t = terms[i];
    let word = t.machine || t.normal;
    // normal lexicon lookup
    if (lexicon[word] !== undefined && lexicon.hasOwnProperty(word)) {
      let tag = lexicon[word];
      setTag([t], tag, world, false, '1-lexicon');
      // fastTag(t, tag, '1-lexicon')
      return true
    }
    // lookup aliases in the lexicon
    if (t.alias) {
      let found = t.alias.find(str => lexicon.hasOwnProperty(str));
      if (found) {
        let tag = lexicon[found];
        setTag([t], tag, world, false, '1-lexicon-alias');
        // fastTag(t, tag, '1-lexicon-alias')
        return true
      }
    }
    // prefixing for verbs/adjectives
    if (prefix$1.test(word) === true) {
      let stem = word.replace(prefix$1, '');
      if (lexicon.hasOwnProperty(stem) && stem.length > 3) {
        // only allow prefixes for verbs/adjectives
        if (allowPrefix.has(lexicon[stem])) {
          // console.log('->', word, stem, lexicon[stem])
          setTag([t], lexicon[stem], world, false, '1-lexicon-prefix');
          // fastTag(t, lexicon[stem], '1-lexicon-prefix')
          return true
        }
      }
    }
    return null
  };
  var singleWord = checkLexicon;

  // tag any words in our lexicon - even if it hasn't been filled-up yet
  // rest of pre-tagger is in ./two/preTagger
  const lexicon$4 = function (view) {
    const world = view.world;
    view.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        if (terms[i].tags.size === 0) {
          let found = null;
          found = found || multiWord$1(terms, i, world);
          // lookup known words
          found = found || singleWord(terms, i, world);
        }
      }
    });
  };

  var compute$4 = {
    lexicon: lexicon$4
  };

  // derive clever things from our lexicon key-value pairs
  const expand = function (words) {
    // const { methods, model } = world
    let lex = {};
    // console.log('start:', Object.keys(lex).length)
    let _multi = {};
    // go through each word in this key-value obj:
    Object.keys(words).forEach(word => {
      let tag = words[word];
      // normalize lexicon a little bit
      word = word.toLowerCase().trim();
      word = word.replace(/'s\b/, '');
      // cache multi-word terms
      let split = word.split(/ /);
      if (split.length > 1) {
        _multi[split[0]] = true;
      }
      lex[word] = lex[word] || tag;
    });
    // cleanup
    delete lex[''];
    delete lex[null];
    delete lex[' '];
    return { lex, _multi }
  };
  var expandLexicon = expand;

  var methods$g = {
    one: {
      expandLexicon,
    }
  };

  /** insert new words/phrases into the lexicon */
  const addWords = function (words) {
    const world = this.world();
    const { methods, model } = world;
    if (!words) {
      return
    }
    // normalize tag vals
    Object.keys(words).forEach(k => {
      if (typeof words[k] === 'string' && words[k].startsWith('#')) {
        words[k] = words[k].replace(/^#/, '');
      }
    });
    // add some words to our lexicon
    if (methods.two.expandLexicon) {
      // do fancy ./two version
      let { lex, _multi } = methods.two.expandLexicon(words, world);
      Object.assign(model.one.lexicon, lex);
      Object.assign(model.one._multiCache, _multi);
    } else if (methods.one.expandLexicon) {
      // do basic ./one version
      let { lex, _multi } = methods.one.expandLexicon(words, world);
      Object.assign(model.one.lexicon, lex);
      Object.assign(model.one._multiCache, _multi);
    } else {
      //no fancy-business
      Object.assign(model.one.lexicon, words);
    }
  };

  var lib$5 = { addWords };

  const model$5 = {
    one: {
      lexicon: {}, //setup blank lexicon
      _multiCache: {},
    }
  };

  var lexicon$3 = {
    model: model$5,
    methods: methods$g,
    compute: compute$4,
    lib: lib$5,
    hooks: ['lexicon']
  };

  // edited by Spencer Kelly
  // credit to https://github.com/BrunoRB/ahocorasick by Bruno Roberto Búrigo.

  const tokenize$3 = function (phrase, world) {
    const { methods, model } = world;
    let terms = methods.one.tokenize.splitTerms(phrase, model).map(t => methods.one.tokenize.splitWhitespace(t, model));
    return terms.map(term => term.text.toLowerCase())
  };

  // turn an array or object into a compressed aho-corasick structure
  const buildTrie = function (phrases, world) {

    // const tokenize=methods.one.
    let goNext = [{}];
    let endAs = [null];
    let failTo = [0];

    let xs = [];
    let n = 0;
    phrases.forEach(function (phrase) {
      let curr = 0;
      // let wordsB = phrase.split(/ /g).filter(w => w)
      let words = tokenize$3(phrase, world);
      for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (goNext[curr] && goNext[curr].hasOwnProperty(word)) {
          curr = goNext[curr][word];
        } else {
          n++;
          goNext[curr][word] = n;
          goNext[n] = {};
          curr = n;
          endAs[n] = null;
        }
      }
      endAs[curr] = [words.length];
    });
    // f(s) = 0 for all states of depth 1 (the ones from which the 0 state can transition to)
    for (let word in goNext[0]) {
      n = goNext[0][word];
      failTo[n] = 0;
      xs.push(n);
    }

    while (xs.length) {
      let r = xs.shift();
      // for each symbol a such that g(r, a) = s
      let keys = Object.keys(goNext[r]);
      for (let i = 0; i < keys.length; i += 1) {
        let word = keys[i];
        let s = goNext[r][word];
        xs.push(s);
        // set state = f(r)
        n = failTo[r];
        while (n > 0 && !goNext[n].hasOwnProperty(word)) {
          n = failTo[n];
        }
        if (goNext.hasOwnProperty(n)) {
          let fs = goNext[n][word];
          failTo[s] = fs;
          if (endAs[fs]) {
            endAs[s] = endAs[s] || [];
            endAs[s] = endAs[s].concat(endAs[fs]);
          }
        } else {
          failTo[s] = 0;
        }
      }
    }
    return { goNext, endAs, failTo }
  };
  var build = buildTrie;

  // console.log(buildTrie(['smart and cool', 'smart and nice']))

  // follow our trie structure
  const scanWords = function (terms, trie, opts) {
    let n = 0;
    let results = [];
    for (let i = 0; i < terms.length; i++) {
      let word = terms[i][opts.form] || terms[i].normal;
      // main match-logic loop:
      while (n > 0 && (trie.goNext[n] === undefined || !trie.goNext[n].hasOwnProperty(word))) {
        n = trie.failTo[n] || 0; // (usually back to 0)
      }
      // did we fail?
      if (!trie.goNext[n].hasOwnProperty(word)) {
        continue
      }
      n = trie.goNext[n][word];
      if (trie.endAs[n]) {
        let arr = trie.endAs[n];
        for (let o = 0; o < arr.length; o++) {
          let len = arr[o];
          let term = terms[i - len + 1];
          let [no, start] = term.index;
          results.push([no, start, start + len, term.id]);
        }
      }
    }
    return results
  };

  const cacheMiss = function (words, cache) {
    for (let i = 0; i < words.length; i += 1) {
      if (cache.has(words[i]) === true) {
        return false
      }
    }
    return true
  };

  const scan = function (view, trie, opts) {
    let results = [];
    opts.form = opts.form || 'normal';
    let docs = view.docs;
    if (!trie.goNext || !trie.goNext[0]) {
      console.error('Compromise invalid lookup trie');//eslint-disable-line
      return view.none()
    }
    let firstWords = Object.keys(trie.goNext[0]);
    // do each phrase
    for (let i = 0; i < docs.length; i++) {
      // can we skip the phrase, all together?
      if (view._cache && view._cache[i] && cacheMiss(firstWords, view._cache[i]) === true) {
        continue
      }
      let terms = docs[i];
      let found = scanWords(terms, trie, opts);
      if (found.length > 0) {
        results = results.concat(found);
      }
    }
    return view.update(results)
  };
  var scan$1 = scan;

  const isObject$4 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  function api$k (View) {

    /** find all matches in this document */
    View.prototype.lookup = function (input, opts = {}) {
      if (!input) {
        return this.none()
      }
      if (typeof input === 'string') {
        input = [input];
      }
      let trie = isObject$4(input) ? input : build(input, this.world);
      let res = scan$1(this, trie, opts);
      res = res.settle();
      return res
    };
  }

  // chop-off tail of redundant vals at end of array
  const truncate = (list, val) => {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (list[i] !== val) {
        list = list.slice(0, i + 1);
        return list
      }
    }
    return list
  };

  // prune trie a bit
  const compress = function (trie) {
    trie.goNext = trie.goNext.map(o => {
      if (Object.keys(o).length === 0) {
        return undefined
      }
      return o
    });
    // chop-off tail of undefined vals in goNext array
    trie.goNext = truncate(trie.goNext, undefined);
    // chop-off tail of zeros in failTo array
    trie.failTo = truncate(trie.failTo, 0);
    // chop-off tail of nulls in endAs array
    trie.endAs = truncate(trie.endAs, null);
    return trie
  };
  var compress$1 = compress;

  /** pre-compile a list of matches to lookup */
  const lib$4 = {
    /** turn an array or object into a compressed trie*/
    buildTrie: function (input) {
      const trie = build(input, this.world());
      return compress$1(trie)
    }
  };
  // add alias
  lib$4.compile = lib$4.buildTrie;

  var lookup = {
    api: api$k,
    lib: lib$4
  };

  const relPointer = function (ptrs, parent) {
    if (!parent) {
      return ptrs
    }
    ptrs.forEach(ptr => {
      let n = ptr[0];
      if (parent[n]) {
        ptr[0] = parent[n][0]; //n
        ptr[1] += parent[n][1]; //start
        ptr[2] += parent[n][1]; //end
      }
    });
    return ptrs
  };

  // make match-result relative to whole document
  const fixPointers = function (res, parent) {
    let { ptrs, byGroup } = res;
    ptrs = relPointer(ptrs, parent);
    Object.keys(byGroup).forEach(k => {
      byGroup[k] = relPointer(byGroup[k], parent);
    });
    return { ptrs, byGroup }
  };

  const isObject$3 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // did they pass-in a compromise object?
  const isView = val => val && isObject$3(val) && val.isView === true;

  const isNet = val => val && isObject$3(val) && val.isNet === true;


  // is the pointer the full sentence?
  // export const isFull = function (ptr, document) {
  //   let [n, start, end] = ptr
  //   if (start !== 0) {
  //     return false
  //   }
  //   if (document[n] && document[n][end - 1] && !document[n][end]) {
  //     return true
  //   }
  //   return false
  // }

  const parseRegs = function (regs, opts, world) {
    const one = world.methods.one;
    if (typeof regs === 'number') {
      regs = String(regs);
    }
    // support param as string
    if (typeof regs === 'string') {
      regs = one.killUnicode(regs, world);
      regs = one.parseMatch(regs, opts, world);
    }
    return regs
  };

  const match$2 = function (regs, group, opts) {
    const one = this.methods.one;
    // support param as view object
    if (isView(regs)) {
      return this.intersection(regs)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false }).view.settle()
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group };
    let res = one.match(this.docs, todo, this._cache);
    let { ptrs, byGroup } = fixPointers(res, this.fullPointer);
    let view = this.toView(ptrs);
    view._groups = byGroup;
    return view
  };

  const matchOne = function (regs, group, opts) {
    const one = this.methods.one;
    // support at view as a param
    if (isView(regs)) {
      return this.intersection(regs).eq(0)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false, matchOne: true }).view
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group, justOne: true };
    let res = one.match(this.docs, todo, this._cache);
    let { ptrs, byGroup } = fixPointers(res, this.fullPointer);
    let view = this.toView(ptrs);
    view._groups = byGroup;
    return view
  };

  const has = function (regs, group, opts) {
    const one = this.methods.one;
    // support view as input
    if (isView(regs)) {
      let ptrs = regs.fullPointer; // support a view object as input
      return ptrs.length > 0
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false }).view.found
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group, justOne: true };
    let ptrs = one.match(this.docs, todo, this._cache).ptrs;
    return ptrs.length > 0
  };

  // 'if'
  const ifFn = function (regs, group, opts) {
    const one = this.methods.one;
    // support view as input
    if (isView(regs)) {
      return this.filter(m => m.intersection(regs).found)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      let m = this.sweep(regs, { tagger: false }).view.settle();
      return this.if(m)//recurse with result
    }
    regs = parseRegs(regs, opts, this.world);
    let todo = { regs, group, justOne: true };
    let ptrs = this.fullPointer;
    let cache = this._cache || [];
    ptrs = ptrs.filter((ptr, i) => {
      let m = this.update([ptr]);
      let res = one.match(m.docs, todo, cache[i]).ptrs;
      return res.length > 0
    });
    let view = this.update(ptrs);
    // try and reconstruct the cache
    if (this._cache) {
      view._cache = ptrs.map(ptr => cache[ptr[0]]);
    }
    return view
  };

  const ifNo = function (regs, group, opts) {
    const { methods } = this;
    const one = methods.one;
    // support a view object as input
    if (isView(regs)) {
      return this.filter(m => !m.intersection(regs).found)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      let m = this.sweep(regs, { tagger: false }).view.settle();
      return this.ifNo(m)
    }
    // otherwise parse the match string
    regs = parseRegs(regs, opts, this.world);
    let cache = this._cache || [];
    let view = this.filter((m, i) => {
      let todo = { regs, group, justOne: true };
      let ptrs = one.match(m.docs, todo, cache[i]).ptrs;
      return ptrs.length === 0
    });
    // try to reconstruct the cache
    if (this._cache) {
      view._cache = view.ptrs.map(ptr => cache[ptr[0]]);
    }
    return view
  };

  var match$3 = { matchOne, match: match$2, has, if: ifFn, ifNo };

  const before = function (regs, group, opts) {
    const { indexN } = this.methods.one.pointer;
    let pre = [];
    let byN = indexN(this.fullPointer);
    Object.keys(byN).forEach(k => {
      // check only the earliest match in the sentence
      let first = byN[k].sort((a, b) => (a[1] > b[1] ? 1 : -1))[0];
      if (first[1] > 0) {
        pre.push([first[0], 0, first[1]]);
      }
    });
    let preWords = this.toView(pre);
    if (!regs) {
      return preWords
    }
    return preWords.match(regs, group, opts)
  };

  const after = function (regs, group, opts) {
    const { indexN } = this.methods.one.pointer;
    let post = [];
    let byN = indexN(this.fullPointer);
    let document = this.document;
    Object.keys(byN).forEach(k => {
      // check only the latest match in the sentence
      let last = byN[k].sort((a, b) => (a[1] > b[1] ? -1 : 1))[0];
      let [n, , end] = last;
      if (end < document[n].length) {
        post.push([n, end, document[n].length]);
      }
    });
    let postWords = this.toView(post);
    if (!regs) {
      return postWords
    }
    return postWords.match(regs, group, opts)
  };

  const growLeft = function (regs, group, opts) {
    if (typeof regs === 'string') {
      regs = this.world.methods.one.parseMatch(regs, opts, this.world);
    }
    regs[regs.length - 1].end = true;// ensure matches are beside us ←
    let ptrs = this.fullPointer;
    this.forEach((m, n) => {
      let more = m.before(regs, group);
      if (more.found) {
        let terms = more.terms();
        ptrs[n][1] -= terms.length;
        ptrs[n][3] = terms.docs[0][0].id;
      }
    });
    return this.update(ptrs)
  };

  const growRight = function (regs, group, opts) {
    if (typeof regs === 'string') {
      regs = this.world.methods.one.parseMatch(regs, opts, this.world);
    }
    regs[0].start = true;// ensure matches are beside us →
    let ptrs = this.fullPointer;
    this.forEach((m, n) => {
      let more = m.after(regs, group);
      if (more.found) {
        let terms = more.terms();
        ptrs[n][2] += terms.length;
        ptrs[n][4] = null; //remove end-id
      }
    });
    return this.update(ptrs)
  };

  const grow = function (regs, group, opts) {
    return this.growRight(regs, group, opts).growLeft(regs, group, opts)
  };

  var lookaround = { before, after, growLeft, growRight, grow };

  const combine = function (left, right) {
    return [left[0], left[1], right[2]]
  };

  const isArray$5 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  const getDoc$3 = (reg, view, group) => {
    if (typeof reg === 'string' || isArray$5(reg)) {
      return view.match(reg, group)
    }
    if (!reg) {
      return view.none()
    }
    return reg
  };

  const addIds$1 = function (ptr, view) {
    let [n, start, end] = ptr;
    if (view.document[n] && view.document[n][start]) {
      ptr[3] = ptr[3] || view.document[n][start].id;
      if (view.document[n][end - 1]) {
        ptr[4] = ptr[4] || view.document[n][end - 1].id;
      }
    }
    return ptr
  };

  const methods$f = {};
  // [before], [match], [after]
  methods$f.splitOn = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    let splits = getDoc$3(m, this, group).fullPointer;
    let all = splitAll(this.fullPointer, splits);
    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      res.push(o.before);
      res.push(o.match);
      res.push(o.after);
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };

  // [before], [match after]
  methods$f.splitBefore = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    let splits = getDoc$3(m, this, group).fullPointer;
    let all = splitAll(this.fullPointer, splits);
    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      res.push(o.before);
      if (o.match && o.after) {
        // console.log(combine(o.match, o.after))
        res.push(combine(o.match, o.after));
      } else {
        res.push(o.match);
        res.push(o.after);
      }
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };

  // [before match], [after]
  methods$f.splitAfter = function (m, group) {
    const { splitAll } = this.methods.one.pointer;
    let splits = getDoc$3(m, this, group).fullPointer;
    let all = splitAll(this.fullPointer, splits);
    let res = [];
    all.forEach(o => {
      res.push(o.passthrough);
      if (o.before && o.match) {
        res.push(combine(o.before, o.match));
      } else {
        res.push(o.before);
        res.push(o.match);
      }
      res.push(o.after);
    });
    res = res.filter(p => p);
    res = res.map(p => addIds$1(p, this));
    return this.update(res)
  };
  methods$f.split = methods$f.splitAfter;

  var split$1 = methods$f;

  const methods$e = Object.assign({}, match$3, lookaround, split$1);
  // aliases
  methods$e.lookBehind = methods$e.before;
  methods$e.lookBefore = methods$e.before;

  methods$e.lookAhead = methods$e.after;
  methods$e.lookAfter = methods$e.after;

  methods$e.notIf = methods$e.ifNo;
  const matchAPI = function (View) {
    Object.assign(View.prototype, methods$e);
  };
  var api$j = matchAPI;

  // match  'foo /yes/' and not 'foo/no/bar'
  const bySlashes = /(?:^|\s)([![^]*(?:<[^<]*>)?\/.*?[^\\/]\/[?\]+*$~]*)(?:\s|$)/;
  // match '(yes) but not foo(no)bar'
  const byParentheses = /([!~[^]*(?:<[^<]*>)?\([^)]+[^\\)]\)[?\]+*$~]*)(?:\s|$)/;
  // okay
  const byWord = / /g;

  const isBlock = str => {
    return /^[![^]*(<[^<]*>)?\(/.test(str) && /\)[?\]+*$~]*$/.test(str)
  };
  const isReg = str => {
    return /^[![^]*(<[^<]*>)?\//.test(str) && /\/[?\]+*$~]*$/.test(str)
  };

  const cleanUp = function (arr) {
    arr = arr.map(str => str.trim());
    arr = arr.filter(str => str);
    return arr
  };

  const parseBlocks = function (txt) {
    // parse by /regex/ first
    let arr = txt.split(bySlashes);
    let res = [];
    // parse by (blocks), next
    arr.forEach(str => {
      if (isReg(str)) {
        res.push(str);
        return
      }
      res = res.concat(str.split(byParentheses));
    });
    res = cleanUp(res);
    // split by spaces, now
    let final = [];
    res.forEach(str => {
      if (isBlock(str)) {
        final.push(str);
      } else if (isReg(str)) {
        final.push(str);
      } else {
        final = final.concat(str.split(byWord));
      }
    });
    final = cleanUp(final);
    return final
  };
  var parseBlocks$1 = parseBlocks;

  const hasMinMax = /\{([0-9]+)?(, *[0-9]*)?\}/;
  const andSign = /&&/;
  // const hasDash = /\p{Letter}[-–—]\p{Letter}/u
  const captureName = new RegExp(/^<\s*(\S+)\s*>/);
  /* break-down a match expression into this:
  {
    word:'',
    tag:'',
    regex:'',

    start:false,
    end:false,
    negative:false,
    anything:false,
    greedy:false,
    optional:false,

    named:'',
    choices:[],
  }
  */
  const titleCase$2 = str => str.charAt(0).toUpperCase() + str.substring(1);
  const end = (str) => str.charAt(str.length - 1);
  const start = (str) => str.charAt(0);
  const stripStart = (str) => str.substring(1);
  const stripEnd = (str) => str.substring(0, str.length - 1);

  const stripBoth = function (str) {
    str = stripStart(str);
    str = stripEnd(str);
    return str
  };
  //
  const parseToken = function (w, opts) {
    let obj = {};
    //collect any flags (do it twice)
    for (let i = 0; i < 2; i += 1) {
      //end-flag
      if (end(w) === '$') {
        obj.end = true;
        w = stripEnd(w);
      }
      //front-flag
      if (start(w) === '^') {
        obj.start = true;
        w = stripStart(w);
      }
      //capture group (this one can span multiple-terms)
      if (start(w) === '[' || end(w) === ']') {
        obj.group = null;
        if (start(w) === '[') {
          obj.groupStart = true;
        }
        if (end(w) === ']') {
          obj.groupEnd = true;
        }
        w = w.replace(/^\[/, '');
        w = w.replace(/\]$/, '');
        // Use capture group name
        if (start(w) === '<') {
          const res = captureName.exec(w);
          if (res.length >= 2) {
            obj.group = res[1];
            w = w.replace(res[0], '');
          }
        }
      }
      //back-flags
      if (end(w) === '+') {
        obj.greedy = true;
        w = stripEnd(w);
      }
      if (w !== '*' && end(w) === '*' && w !== '\\*') {
        obj.greedy = true;
        w = stripEnd(w);
      }
      if (end(w) === '?') {
        obj.optional = true;
        w = stripEnd(w);
      }
      if (start(w) === '!') {
        obj.negative = true;
        // obj.optional = true
        w = stripStart(w);
      }
      //soft-match
      if (start(w) === '~' && end(w) === '~' && w.length > 2) {
        w = stripBoth(w);
        obj.fuzzy = true;
        obj.min = opts.fuzzy || 0.85;
        if (/\(/.test(w) === false) {
          obj.word = w;
          return obj
        }
      }

      //regex
      if (start(w) === '/' && end(w) === '/') {
        w = stripBoth(w);
        if (opts.caseSensitive) {
          obj.use = 'text';
        }
        obj.regex = new RegExp(w); //potential vuln - security/detect-non-literal-regexp
        return obj
      }

      // support foo{1,9}
      if (hasMinMax.test(w) === true) {
        w = w.replace(hasMinMax, (_a, b, c) => {
          if (c === undefined) {
            // '{3}'	Exactly three times
            obj.min = Number(b);
            obj.max = Number(b);
          } else {
            c = c.replace(/, */, '');
            if (b === undefined) {
              // '{,9}' implied zero min
              obj.min = 0;
              obj.max = Number(c);
            } else {
              // '{2,4}' Two to four times
              obj.min = Number(b);
              // '{3,}' Three or more times
              obj.max = Number(c || 999);
            }
          }
          // use same method as '+'
          obj.greedy = true;
          // 0 as min means the same as '?'
          if (!obj.min) {
            obj.optional = true;
          }
          return ''
        });
      }

      //wrapped-flags
      if (start(w) === '(' && end(w) === ')') {
        // support (one && two)
        if (andSign.test(w)) {
          obj.choices = w.split(andSign);
          obj.operator = 'and';
        } else {
          obj.choices = w.split('|');
          obj.operator = 'or';
        }
        //remove '(' and ')'
        obj.choices[0] = stripStart(obj.choices[0]);
        let last = obj.choices.length - 1;
        obj.choices[last] = stripEnd(obj.choices[last]);
        // clean up the results
        obj.choices = obj.choices.map(s => s.trim());
        obj.choices = obj.choices.filter(s => s);
        //recursion alert!
        obj.choices = obj.choices.map(str => {
          return str.split(/ /g).map(s => parseToken(s, opts))
        });
        w = '';
      }

      //root/sense overloaded
      if (start(w) === '{' && end(w) === '}') {
        w = stripBoth(w);
        // obj.sense = w
        obj.root = w;
        if (/\//.test(w)) {
          let split = obj.root.split(/\//);
          obj.root = split[0];
          obj.pos = split[1];
          if (obj.pos === 'adj') {
            obj.pos = 'Adjective';
          }
          // titlecase
          obj.pos = obj.pos.charAt(0).toUpperCase() + obj.pos.substr(1).toLowerCase();
          // add sense-number too
          if (split[2] !== undefined) {
            obj.sense = split[2];
          }
        }
        return obj
      }
      //chunks
      if (start(w) === '<' && end(w) === '>') {
        w = stripBoth(w);
        obj.chunk = titleCase$2(w);
        obj.greedy = true;
        return obj
      }
      if (start(w) === '%' && end(w) === '%') {
        w = stripBoth(w);
        obj.switch = w;
        return obj
      }
    }
    //do the actual token content
    if (start(w) === '#') {
      obj.tag = stripStart(w);
      obj.tag = titleCase$2(obj.tag);
      return obj
    }
    //dynamic function on a term object
    if (start(w) === '@') {
      obj.method = stripStart(w);
      return obj
    }
    if (w === '.') {
      obj.anything = true;
      return obj
    }
    //support alone-astrix
    if (w === '*') {
      obj.anything = true;
      obj.greedy = true;
      obj.optional = true;
      return obj
    }
    if (w) {
      //somehow handle encoded-chars?
      w = w.replace('\\*', '*');
      w = w.replace('\\.', '.');
      if (opts.caseSensitive) {
        obj.use = 'text';
      } else {
        w = w.toLowerCase();
      }
      obj.word = w;
    }
    return obj
  };
  var parseToken$1 = parseToken;

  const hasDash$3 = /[a-z0-9][-–—][a-z]/i;

  // match 're-do' -> ['re','do']
  const splitHyphens$1 = function (regs, world) {
    let prefixes = world.model.one.prefixes;
    for (let i = regs.length - 1; i >= 0; i -= 1) {
      let reg = regs[i];
      if (reg.word && hasDash$3.test(reg.word)) {
        let words = reg.word.split(/[-–—]/g);
        // don't split 're-cycle', etc
        if (prefixes.hasOwnProperty(words[0])) {
          continue
        }
        words = words.filter(w => w).reverse();
        regs.splice(i, 1);
        words.forEach(w => {
          let obj = Object.assign({}, reg);
          obj.word = w;
          regs.splice(i, 0, obj);
        });
      }
    }
    return regs
  };
  var splitHyphens$2 = splitHyphens$1;

  // add all conjugations of this verb
  const addVerbs = function (token, world) {
    let { all } = world.methods.two.transform.verb || {};
    let str = token.root;
    if (!all) {
      return []
    }
    return all(str, world.model)
  };

  // add all inflections of this noun
  const addNoun = function (token, world) {
    let { all } = world.methods.two.transform.noun || {};
    if (!all) {
      return [token.root]
    }
    return all(token.root, world.model)
  };

  // add all inflections of this adjective
  const addAdjective = function (token, world) {
    let { all } = world.methods.two.transform.adjective || {};
    if (!all) {
      return [token.root]
    }
    return all(token.root, world.model)
  };

  // turn '{walk}' into 'walking', 'walked', etc
  const inflectRoot = function (regs, world) {
    // do we have compromise/two?
    regs = regs.map(token => {
      // a reg to convert '{foo}'
      if (token.root) {
        // check if compromise/two is loaded
        if (world.methods.two && world.methods.two.transform) {
          let choices = [];
          // have explicitly set from POS - '{sweet/adjective}'
          if (token.pos) {
            if (token.pos === 'Verb') {
              choices = choices.concat(addVerbs(token, world));
            } else if (token.pos === 'Noun') {
              choices = choices.concat(addNoun(token, world));
            } else if (token.pos === 'Adjective') {
              choices = choices.concat(addAdjective(token, world));
            }
          } else {
            // do verb/noun/adj by default
            choices = choices.concat(addVerbs(token, world));
            choices = choices.concat(addNoun(token, world));
            choices = choices.concat(addAdjective(token, world));
          }
          choices = choices.filter(str => str);
          if (choices.length > 0) {
            token.operator = 'or';
            token.fastOr = new Set(choices);
          }
        } else {
          // if no compromise/two, drop down into 'machine' lookup
          token.machine = token.root;
          delete token.id;
          delete token.root;
        }
      }
      return token
    });

    return regs
  };
  var inflectRoot$1 = inflectRoot;

  // name any [unnamed] capture-groups with a number
  const nameGroups = function (regs) {
    let index = 0;
    let inGroup = null;
    //'fill in' capture groups between start-end
    for (let i = 0; i < regs.length; i++) {
      const token = regs[i];
      if (token.groupStart === true) {
        inGroup = token.group;
        if (inGroup === null) {
          inGroup = String(index);
          index += 1;
        }
      }
      if (inGroup !== null) {
        token.group = inGroup;
      }
      if (token.groupEnd === true) {
        inGroup = null;
      }
    }
    return regs
  };

  // optimize an 'or' lookup, when the (a|b|c) list is simple or multi-word
  const doFastOrMode = function (tokens) {
    return tokens.map(token => {
      if (token.choices !== undefined) {
        // make sure it's an OR
        if (token.operator !== 'or') {
          return token
        }
        if (token.fuzzy === true) {
          return token
        }
        // are they all straight-up words? then optimize them.
        let shouldPack = token.choices.every(block => {
          if (block.length !== 1) {
            return false
          }
          let reg = block[0];
          // ~fuzzy~ words need more care
          if (reg.fuzzy === true) {
            return false
          }
          // ^ and $ get lost in fastOr
          if (reg.start || reg.end) {
            return false
          }
          if (reg.word !== undefined && reg.negative !== true && reg.optional !== true && reg.method !== true) {
            return true //reg is simple-enough
          }
          return false
        });
        if (shouldPack === true) {
          token.fastOr = new Set();
          token.choices.forEach(block => {
            token.fastOr.add(block[0].word);
          });
          delete token.choices;
        }
      }
      return token
    })
  };

  // support ~(a|b|c)~
  const fuzzyOr = function (regs) {
    return regs.map(reg => {
      if (reg.fuzzy && reg.choices) {
        // pass fuzzy-data to each OR choice
        reg.choices.forEach(r => {
          if (r.length === 1 && r[0].word) {
            r[0].fuzzy = true;
            r[0].min = reg.min;
          }
        });
      }
      return reg
    })
  };

  const postProcess = function (regs) {
    // ensure all capture groups names are filled between start and end
    regs = nameGroups(regs);
    // convert 'choices' format to 'fastOr' format
    regs = doFastOrMode(regs);
    // support ~(foo|bar)~
    regs = fuzzyOr(regs);
    return regs
  };
  var postProcess$1 = postProcess;

  /** parse a match-syntax string into json */
  const syntax = function (input, opts, world) {
    // fail-fast
    if (input === null || input === undefined || input === '') {
      return []
    }
    opts = opts || {};
    if (typeof input === 'number') {
      input = String(input); //go for it?
    }
    let tokens = parseBlocks$1(input);
    //turn them into objects
    tokens = tokens.map(str => parseToken$1(str, opts));
    // '~re-do~'
    tokens = splitHyphens$2(tokens, world);
    // '{walk}'
    tokens = inflectRoot$1(tokens, world);
    //clean up anything weird
    tokens = postProcess$1(tokens);
    // console.log(tokens)
    return tokens
  };
  var parseMatch = syntax;

  const anyIntersection = function (setA, setB) {
    for (let elem of setB) {
      if (setA.has(elem)) {
        return true
      }
    }
    return false
  };
  // check words/tags against our cache
  const failFast = function (regs, cache) {
    for (let i = 0; i < regs.length; i += 1) {
      let reg = regs[i];
      if (reg.optional === true || reg.negative === true || reg.fuzzy === true) {
        continue
      }
      // is the word missing from the cache?
      if (reg.word !== undefined && cache.has(reg.word) === false) {
        return true
      }
      // is the tag missing?
      if (reg.tag !== undefined && cache.has('#' + reg.tag) === false) {
        return true
      }
      // perform a speedup for fast-or
      if (reg.fastOr && anyIntersection(reg.fastOr, cache) === false) {
        return false
      }
    }
    return false
  };
  var failFast$1 = failFast;

  // fuzzy-match (damerau-levenshtein)
  // Based on  tad-lispy /node-damerau-levenshtein
  // https://github.com/tad-lispy/node-damerau-levenshtein/blob/master/index.js
  // count steps (insertions, deletions, substitutions, or transpositions)
  const editDistance = function (strA, strB) {
    let aLength = strA.length,
      bLength = strB.length;
    // fail-fast
    if (aLength === 0) {
      return bLength
    }
    if (bLength === 0) {
      return aLength
    }
    // If the limit is not defined it will be calculate from this and that args.
    let limit = (bLength > aLength ? bLength : aLength) + 1;
    if (Math.abs(aLength - bLength) > (limit || 100)) {
      return limit || 100
    }
    // init the array
    let matrix = [];
    for (let i = 0; i < limit; i++) {
      matrix[i] = [i];
      matrix[i].length = limit;
    }
    for (let i = 0; i < limit; i++) {
      matrix[0][i] = i;
    }
    // Calculate matrix.
    let j, a_index, b_index, cost, min, t;
    for (let i = 1; i <= aLength; ++i) {
      a_index = strA[i - 1];
      for (j = 1; j <= bLength; ++j) {
        // Check the jagged distance total so far
        if (i === j && matrix[i][j] > 4) {
          return aLength
        }
        b_index = strB[j - 1];
        cost = a_index === b_index ? 0 : 1; // Step 5
        // Calculate the minimum (much faster than Math.min(...)).
        min = matrix[i - 1][j] + 1; // Deletion.
        if ((t = matrix[i][j - 1] + 1) < min) min = t; // Insertion.
        if ((t = matrix[i - 1][j - 1] + cost) < min) min = t; // Substitution.
        // Update matrix.
        let shouldUpdate =
          i > 1 && j > 1 && a_index === strB[j - 2] && strA[i - 2] === b_index && (t = matrix[i - 2][j - 2] + cost) < min;
        if (shouldUpdate) {
          matrix[i][j] = t;
        } else {
          matrix[i][j] = min;
        }
      }
    }
    // return number of steps
    return matrix[aLength][bLength]
  };
  // score similarity by from 0-1 (steps/length)
  const fuzzyMatch = function (strA, strB, minLength = 3) {
    if (strA === strB) {
      return 1
    }
    //don't even bother on tiny strings
    if (strA.length < minLength || strB.length < minLength) {
      return 0
    }
    const steps = editDistance(strA, strB);
    let length = Math.max(strA.length, strB.length);
    let relative = length === 0 ? 0 : steps / length;
    let similarity = 1 - relative;
    return similarity
  };
  var fuzzy = fuzzyMatch;

  // these methods are called with '@hasComma' in the match syntax
  // various unicode quotation-mark formats
  const startQuote =
    /([\u0022\uFF02\u0027\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F])/;

  const endQuote = /([\u0022\uFF02\u0027\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4])/;

  const hasHyphen$1 = /^[-–—]$/;
  const hasDash$2 = / [-–—]{1,3} /;

  /** search the term's 'post' punctuation  */
  const hasPost = (term, punct) => term.post.indexOf(punct) !== -1;
  /** search the term's 'pre' punctuation  */
  const hasPre = (term, punct) => term.pre.indexOf(punct) !== -1;

  const methods$d = {
    /** does it have a quotation symbol?  */
    hasQuote: term => startQuote.test(term.pre) || endQuote.test(term.post),
    /** does it have a comma?  */
    hasComma: term => hasPost(term, ','),
    /** does it end in a period? */
    hasPeriod: term => hasPost(term, '.') === true && hasPost(term, '...') === false,
    /** does it end in an exclamation */
    hasExclamation: term => hasPost(term, '!'),
    /** does it end with a question mark? */
    hasQuestionMark: term => hasPost(term, '?') || hasPost(term, '¿'),
    /** is there a ... at the end? */
    hasEllipses: term => hasPost(term, '..') || hasPost(term, '…') || hasPre(term, '..') || hasPre(term, '…'),
    /** is there a semicolon after term word? */
    hasSemicolon: term => hasPost(term, ';'),
    /** is there a colon after term word? */
    hasColon: term => hasPost(term, ':'),
    /** is there a slash '/' in term word? */
    hasSlash: term => /\//.test(term.text),
    /** a hyphen connects two words like-term */
    hasHyphen: term => hasHyphen$1.test(term.post) || hasHyphen$1.test(term.pre),
    /** a dash separates words - like that */
    hasDash: term => hasDash$2.test(term.post) || hasDash$2.test(term.pre),
    /** is it multiple words combinded */
    hasContraction: term => Boolean(term.implicit),
    /** is it an acronym */
    isAcronym: term => term.tags.has('Acronym'),
    /** does it have any tags */
    isKnown: term => term.tags.size > 0,
    /** uppercase first letter, then a lowercase */
    isTitleCase: term => /^\p{Lu}[a-z'\u00C0-\u00FF]/u.test(term.text),
    /** uppercase all letters */
    isUpperCase: term => /^\p{Lu}+$/u.test(term.text),
  };
  // aliases
  methods$d.hasQuotation = methods$d.hasQuote;

  var termMethods = methods$d;

  //declare it up here
  let wrapMatch = function () { };
  /** ignore optional/greedy logic, straight-up term match*/
  const doesMatch$1 = function (term, reg, index, length) {
    // support '.'
    if (reg.anything === true) {
      return true
    }
    // support '^' (in parentheses)
    if (reg.start === true && index !== 0) {
      return false
    }
    // support '$' (in parentheses)
    if (reg.end === true && index !== length - 1) {
      return false
    }
    // match an id
    if (reg.id !== undefined && reg.id === term.id) {
      return true
    }
    //support a text match
    if (reg.word !== undefined) {
      // check case-sensitivity, etc
      if (reg.use) {
        return reg.word === term[reg.use]
      }
      //match contractions, machine-form
      if (term.machine !== null && term.machine === reg.word) {
        return true
      }
      // term aliases for slashes and things
      if (term.alias !== undefined && term.alias.hasOwnProperty(reg.word)) {
        return true
      }
      // support ~ fuzzy match
      if (reg.fuzzy === true) {
        if (reg.word === term.root) {
          return true
        }
        let score = fuzzy(reg.word, term.normal);
        if (score >= reg.min) {
          return true
        }
      }
      // match slashes and things
      if (term.alias && term.alias.some(str => str === reg.word)) {
        return true
      }
      //match either .normal or .text
      return reg.word === term.text || reg.word === term.normal
    }
    //support #Tag
    if (reg.tag !== undefined) {
      return term.tags.has(reg.tag) === true
    }
    //support @method
    if (reg.method !== undefined) {
      if (typeof termMethods[reg.method] === 'function' && termMethods[reg.method](term) === true) {
        return true
      }
      return false
    }
    //support whitespace/punctuation
    if (reg.pre !== undefined) {
      return term.pre && term.pre.includes(reg.pre)
    }
    if (reg.post !== undefined) {
      return term.post && term.post.includes(reg.post)
    }
    //support /reg/
    if (reg.regex !== undefined) {
      let str = term.normal;
      if (reg.use) {
        str = term[reg.use];
      }
      return reg.regex.test(str)
    }
    //support <chunk>
    if (reg.chunk !== undefined) {
      return term.chunk === reg.chunk
    }
    //support %Noun|Verb%
    if (reg.switch !== undefined) {
      return term.switch === reg.switch
    }
    //support {machine}
    if (reg.machine !== undefined) {
      return term.normal === reg.machine || term.machine === reg.machine || term.root === reg.machine
    }
    //support {word/sense}
    if (reg.sense !== undefined) {
      return term.sense === reg.sense
    }
    // support optimized (one|two)
    if (reg.fastOr !== undefined) {
      // {work/verb} must be a verb
      if (reg.pos && !term.tags.has(reg.pos)) {
        return null
      }
      let str = term.root || term.implicit || term.machine || term.normal;
      return reg.fastOr.has(str) || reg.fastOr.has(term.text)
    }
    //support slower (one|two)
    if (reg.choices !== undefined) {
      // try to support && operator
      if (reg.operator === 'and') {
        // must match them all
        return reg.choices.every(r => wrapMatch(term, r, index, length))
      }
      // or must match one
      return reg.choices.some(r => wrapMatch(term, r, index, length))
    }
    return false
  };
  // wrap result for !negative match logic
  wrapMatch = function (t, reg, index, length) {
    let result = doesMatch$1(t, reg, index, length);
    if (reg.negative === true) {
      return !result
    }
    return result
  };
  var matchTerm = wrapMatch;

  // for greedy checking, we no longer care about the reg.start
  // value, and leaving it can cause failures for anchored greedy
  // matches.  ditto for end-greedy matches: we need an earlier non-
  // ending match to succceed until we get to the actual end.
  const getGreedy = function (state, endReg) {
    let reg = Object.assign({}, state.regs[state.r], { start: false, end: false });
    let start = state.t;
    for (; state.t < state.terms.length; state.t += 1) {
      //stop for next-reg match
      if (endReg && matchTerm(state.terms[state.t], endReg, state.start_i + state.t, state.phrase_length)) {
        return state.t
      }
      let count = state.t - start + 1;
      // is it max-length now?
      if (reg.max !== undefined && count === reg.max) {
        return state.t
      }
      //stop here
      if (matchTerm(state.terms[state.t], reg, state.start_i + state.t, state.phrase_length) === false) {
        // is it too short?
        if (reg.min !== undefined && count < reg.min) {
          return null
        }
        return state.t
      }
    }
    return state.t
  };

  const greedyTo = function (state, nextReg) {
    let t = state.t;
    //if there's no next one, just go off the end!
    if (!nextReg) {
      return state.terms.length
    }
    //otherwise, we're looking for the next one
    for (; t < state.terms.length; t += 1) {
      if (matchTerm(state.terms[t], nextReg, state.start_i + t, state.phrase_length) === true) {
        // console.log(`greedyTo ${state.terms[t].normal}`)
        return t
      }
    }
    //guess it doesn't exist, then.
    return null
  };

  const isEndGreedy = function (reg, state) {
    if (reg.end === true && reg.greedy === true) {
      if (state.start_i + state.t < state.phrase_length - 1) {
        let tmpReg = Object.assign({}, reg, { end: false });
        if (matchTerm(state.terms[state.t], tmpReg, state.start_i + state.t, state.phrase_length) === true) {
          // console.log(`endGreedy ${state.terms[state.t].normal}`)
          return true
        }
      }
    }
    return false
  };

  const getGroup$2 = function (state, term_index) {
    if (state.groups[state.inGroup]) {
      return state.groups[state.inGroup]
    }
    state.groups[state.inGroup] = {
      start: term_index,
      length: 0,
    };
    return state.groups[state.inGroup]
  };

  //support 'unspecific greedy' .* properly
  // its logic is 'greedy until', where it's looking for the next token
  // '.+ foo' means we check for 'foo', indefinetly
  const doAstrix = function (state) {
    let { regs } = state;
    let reg = regs[state.r];

    let skipto = greedyTo(state, regs[state.r + 1]);
    //maybe we couldn't find it
    if (skipto === null || skipto === 0) {
      return null
    }
    // ensure it's long enough
    if (reg.min !== undefined && skipto - state.t < reg.min) {
      return null
    }
    // reduce it back, if it's too long
    if (reg.max !== undefined && skipto - state.t > reg.max) {
      state.t = state.t + reg.max;
      return true
    }
    // set the group result
    if (state.hasGroup === true) {
      const g = getGroup$2(state, state.t);
      g.length = skipto - state.t;
    }
    state.t = skipto;
    // log(`✓ |greedy|`)
    return true
  };
  var doAstrix$1 = doAstrix;

  const isArray$4 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  const doOrBlock$1 = function (state, skipN = 0) {
    let block = state.regs[state.r];
    let wasFound = false;
    // do each multiword sequence
    for (let c = 0; c < block.choices.length; c += 1) {
      // try to match this list of tokens
      let regs = block.choices[c];
      if (!isArray$4(regs)) {
        return false
      }
      wasFound = regs.every((cr, w_index) => {
        let extra = 0;
        let t = state.t + w_index + skipN + extra;
        if (state.terms[t] === undefined) {
          return false
        }
        let foundBlock = matchTerm(state.terms[t], cr, t + state.start_i, state.phrase_length);
        // this can be greedy - '(foo+ bar)'
        if (foundBlock === true && cr.greedy === true) {
          for (let i = 1; i < state.terms.length; i += 1) {
            let term = state.terms[t + i];
            if (term) {
              let keepGoing = matchTerm(term, cr, state.start_i + i, state.phrase_length);
              if (keepGoing === true) {
                extra += 1;
              } else {
                break
              }
            }
          }
        }
        skipN += extra;
        return foundBlock
      });
      if (wasFound) {
        skipN += regs.length;
        break
      }
    }
    // we found a match -  is it greedy though?
    if (wasFound && block.greedy === true) {
      return doOrBlock$1(state, skipN) // try it again!
    }
    return skipN
  };

  const doAndBlock$1 = function (state) {
    let longest = 0;
    // all blocks must match, and we return the greediest match
    let reg = state.regs[state.r];
    let allDidMatch = reg.choices.every(block => {
      //  for multi-word blocks, all must match
      let allWords = block.every((cr, w_index) => {
        let tryTerm = state.t + w_index;
        if (state.terms[tryTerm] === undefined) {
          return false
        }
        return matchTerm(state.terms[tryTerm], cr, tryTerm, state.phrase_length)
      });
      if (allWords === true && block.length > longest) {
        longest = block.length;
      }
      return allWords
    });
    if (allDidMatch === true) {
      // console.log(`doAndBlock ${state.terms[state.t].normal}`)
      return longest
    }
    return false
  };

  const orBlock = function (state) {
    const { regs } = state;
    let reg = regs[state.r];
    let skipNum = doOrBlock$1(state);
    // did we find a match?
    if (skipNum) {
      // handle 'not' logic
      if (reg.negative === true) {
        return null // die
      }
      // tuck in as named-group
      if (state.hasGroup === true) {
        const g = getGroup$2(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        let end = state.phrase_length;
        if (state.t + state.start_i + skipNum !== end) {
          return null
        }
      }
      state.t += skipNum;
      // log(`✓ |found-or|`)
      return true
    } else if (!reg.optional) {
      return null //die
    }
    return true
  };
  var doOrBlock = orBlock;

  // '(foo && #Noun)' - require all matches on the term
  const andBlock = function (state) {
    const { regs } = state;
    let reg = regs[state.r];

    let skipNum = doAndBlock$1(state);
    if (skipNum) {
      // handle 'not' logic
      if (reg.negative === true) {
        return null // die
      }
      if (state.hasGroup === true) {
        const g = getGroup$2(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        let end = state.phrase_length - 1;
        if (state.t + state.start_i !== end) {
          return null
        }
      }
      state.t += skipNum;
      // log(`✓ |found-and|`)
      return true
    } else if (!reg.optional) {
      return null //die
    }
    return true
  };
  var doAndBlock = andBlock;

  const negGreedy = function (state, reg, nextReg) {
    let skip = 0;
    for (let t = state.t; t < state.terms.length; t += 1) {
      let found = matchTerm(state.terms[t], reg, state.start_i + state.t, state.phrase_length);
      // we don't want a match, here
      if (found) {
        break//stop going
      }
      // are we doing 'greedy-to'?
      // - "!foo+ after"  should stop at 'after'
      if (nextReg) {
        found = matchTerm(state.terms[t], nextReg, state.start_i + state.t, state.phrase_length);
        if (found) {
          break
        }
      }
      skip += 1;
      // is it max-length now?
      if (reg.max !== undefined && skip === reg.max) {
        break
      }
    }
    if (skip === 0) {
      return false //dead
    }
    // did we satisfy min for !foo{min,max}
    if (reg.min && reg.min > skip) {
      return false//dead
    }
    state.t += skip;
    // state.r += 1
    return true
  };

  var negGreedy$1 = negGreedy;

  // '!foo' should match anything that isn't 'foo'
  // if it matches, return false
  const doNegative = function (state) {
    const { regs } = state;
    let reg = regs[state.r];

    // match *anything* but this term
    let tmpReg = Object.assign({}, reg);
    tmpReg.negative = false; // try removing it

    // found it? if so, we die here
    let found = matchTerm(state.terms[state.t], tmpReg, state.start_i + state.t, state.phrase_length);
    if (found) {
      return false//bye
    }
    // should we skip the term too?
    if (reg.optional) {
      // "before after" - "before !foo? after"
      // does the next reg match the this term?
      let nextReg = regs[state.r + 1];
      if (nextReg) {
        let fNext = matchTerm(state.terms[state.t], nextReg, state.start_i + state.t, state.phrase_length);
        if (fNext) {
          state.r += 1;
        } else if (nextReg.optional && regs[state.r + 2]) {
          // ugh. ok,
          // support "!foo? extra? need"
          // but don't scan ahead more than that.
          let fNext2 = matchTerm(state.terms[state.t], regs[state.r + 2], state.start_i + state.t, state.phrase_length);
          if (fNext2) {
            state.r += 2;
          }
        }
      }
    }
    // negative greedy - !foo+  - super hard!
    if (reg.greedy) {
      return negGreedy$1(state, tmpReg, regs[state.r + 1])
    }
    state.t += 1;
    return true
  };
  var doNegative$1 = doNegative;

  // 'foo? foo' matches are tricky.
  const foundOptional = function (state) {
    const { regs } = state;
    let reg = regs[state.r];
    let term = state.terms[state.t];
    // does the next reg match it too?
    let nextRegMatched = matchTerm(term, regs[state.r + 1], state.start_i + state.t, state.phrase_length);
    if (reg.negative || nextRegMatched) {
      // but does the next reg match the next term??
      // only skip if it doesn't
      let nextTerm = state.terms[state.t + 1];
      if (!nextTerm || !matchTerm(nextTerm, regs[state.r + 1], state.start_i + state.t, state.phrase_length)) {
        state.r += 1;
      }
    }
  };

  var foundOptional$1 = foundOptional;

  // keep 'foo+' or 'foo*' going..
  const greedyMatch = function (state) {
    const { regs, phrase_length } = state;
    let reg = regs[state.r];
    state.t = getGreedy(state, regs[state.r + 1]);
    if (state.t === null) {
      return null //greedy was too short
    }
    // foo{2,4} - has a greed-minimum
    if (reg.min && reg.min > state.t) {
      return null //greedy was too short
    }
    // 'foo+$' - if also an end-anchor, ensure we really reached the end
    if (reg.end === true && state.start_i + state.t !== phrase_length) {
      return null //greedy didn't reach the end
    }
    return true
  };
  var greedyMatch$1 = greedyMatch;

  // for: ['we', 'have']
  // a match for "we have" should work as normal
  // but matching "we've" should skip over implict terms
  const contractionSkip = function (state) {
    let term = state.terms[state.t];
    let reg = state.regs[state.r];
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      let nextTerm = state.terms[state.t + 1];
      // ensure next word is implicit
      if (!nextTerm.implicit) {
        return
      }
      // we matched "we've" - skip-over [we, have]
      if (reg.word === term.normal) {
        state.t += 1;
      }
      // also skip for @hasContraction
      if (reg.method === 'hasContraction') {
        state.t += 1;
      }
    }
  };
  var contractionSkip$1 = contractionSkip;

  // '[foo]' should also be logged as a group
  const setGroup = function (state, startAt) {
    let reg = state.regs[state.r];
    // Get or create capture group
    const g = getGroup$2(state, startAt);
    // Update group - add greedy or increment length
    if (state.t > 1 && reg.greedy) {
      g.length += state.t - startAt;
    } else {
      g.length++;
    }
  };

  // when a reg matches a term
  const simpleMatch = function (state) {
    const { regs } = state;
    let reg = regs[state.r];
    let term = state.terms[state.t];
    let startAt = state.t;
    // if it's a negative optional match... :0
    if (reg.optional && regs[state.r + 1] && reg.negative) {
      return true
    }
    // okay, it was a match, but if it's optional too,
    // we should check the next reg too, to skip it?
    if (reg.optional && regs[state.r + 1]) {
      foundOptional$1(state);
    }
    // Contraction skip:
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      contractionSkip$1(state);
    }
    //advance to the next term!
    state.t += 1;
    //check any ending '$' flags
    //if this isn't the last term, refuse the match
    if (reg.end === true && state.t !== state.terms.length && reg.greedy !== true) {
      return null //die
    }
    // keep 'foo+' going...
    if (reg.greedy === true) {
      let alive = greedyMatch$1(state);
      if (!alive) {
        return null
      }
    }
    // log '[foo]' as a group
    if (state.hasGroup === true) {
      setGroup(state, startAt);
    }
    return true
  };
  var simpleMatch$1 = simpleMatch;

  // i formally apologize for how complicated this is.

  /** 
   * try a sequence of match tokens ('regs') 
   * on a sequence of terms, 
   * starting at this certain term.
   */
  const tryHere = function (terms, regs, start_i, phrase_length) {
    // console.log(`\n\n:start: '${terms[0].text}':`)
    if (terms.length === 0 || regs.length === 0) {
      return null
    }
    // all the variables that matter
    let state = {
      t: 0,
      terms: terms,
      r: 0,
      regs: regs,
      groups: {},
      start_i: start_i,
      phrase_length: phrase_length,
      inGroup: null,
    };

    // we must satisfy every token in 'regs'
    // if we get to the end, we have a match.
    for (; state.r < regs.length; state.r += 1) {
      let reg = regs[state.r];
      // Check if this reg has a named capture group
      state.hasGroup = Boolean(reg.group);
      // Reuse previous capture group if same
      if (state.hasGroup === true) {
        state.inGroup = reg.group;
      } else {
        state.inGroup = null;
      }
      //have we run-out of terms?
      if (!state.terms[state.t]) {
        //are all remaining regs optional or negative?
        const alive = regs.slice(state.r).some(remain => !remain.optional);
        if (alive === false) {
          break //done!
        }
        return null // die
      }
      // support 'unspecific greedy' .* properly
      if (reg.anything === true && reg.greedy === true) {
        let alive = doAstrix$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // slow-OR - multi-word OR (a|b|foo bar)
      if (reg.choices !== undefined && reg.operator === 'or') {
        let alive = doOrBlock(state);
        if (!alive) {
          return null
        }
        continue
      }
      // slow-AND - multi-word AND (#Noun && foo) blocks
      if (reg.choices !== undefined && reg.operator === 'and') {
        let alive = doAndBlock(state);
        if (!alive) {
          return null
        }
        continue
      }
      // support '.' as any-single
      if (reg.anything === true) {
        // '!.' negative anything should insta-fail
        if (reg.negative && reg.anything) {
          return null
        }
        let alive = simpleMatch$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // support 'foo*$' until the end
      if (isEndGreedy(reg, state) === true) {
        let alive = simpleMatch$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // ok, it doesn't match - but maybe it wasn't *supposed* to?
      if (reg.negative) {
        // we want *anything* but this term
        let alive = doNegative$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // ok, finally test the term-reg
      // console.log('   - ' + state.terms[state.t].text)
      let hasMatch = matchTerm(state.terms[state.t], reg, state.start_i + state.t, state.phrase_length);
      if (hasMatch === true) {
        let alive = simpleMatch$1(state);
        if (!alive) {
          return null
        }
        continue
      }
      // console.log('=-=-=-= here -=-=-=-')

      //ok who cares, keep going
      if (reg.optional === true) {
        continue
      }

      // finally, we die
      return null
    }
    //return our results, as pointers
    let pntr = [null, start_i, state.t + start_i];
    if (pntr[1] === pntr[2]) {
      return null //found 0 terms
    }
    let groups = {};
    Object.keys(state.groups).forEach(k => {
      let o = state.groups[k];
      let start = start_i + o.start;
      groups[k] = [null, start, start + o.length];
    });
    return { pointer: pntr, groups: groups }
  };
  var fromHere = tryHere;

  // support returning a subset of a match
  // like 'foo [bar] baz' -> bar
  const getGroup = function (res, group) {
    let ptrs = [];
    let byGroup = {};
    if (res.length === 0) {
      return { ptrs, byGroup }
    }
    if (typeof group === 'number') {
      group = String(group);
    }
    if (group) {
      res.forEach(r => {
        if (r.groups[group]) {
          ptrs.push(r.groups[group]);
        }
      });
    } else {
      res.forEach(r => {
        ptrs.push(r.pointer);
        Object.keys(r.groups).forEach(k => {
          byGroup[k] = byGroup[k] || [];
          byGroup[k].push(r.groups[k]);
        });
      });
    }
    return { ptrs, byGroup }
  };
  var getGroup$1 = getGroup;

  const notIf = function (results, not, docs) {
    results = results.filter(res => {
      let [n, start, end] = res.pointer;
      let terms = docs[n].slice(start, end);
      for (let i = 0; i < terms.length; i += 1) {
        let slice = terms.slice(i);
        let found = fromHere(slice, not, i, terms.length);
        if (found !== null) {
          return false
        }
      }
      return true
    });
    return results
  };

  var notIf$1 = notIf;

  // make proper pointers
  const addSentence = function (res, n) {
    res.pointer[0] = n;
    Object.keys(res.groups).forEach(k => {
      res.groups[k][0] = n;
    });
    return res
  };

  const handleStart = function (terms, regs, n) {
    let res = fromHere(terms, regs, 0, terms.length);
    if (res) {
      res = addSentence(res, n);
      return res //getGroup([res], group)
    }
    return null
  };

  // ok, here we go.
  const runMatch$2 = function (docs, todo, cache) {
    cache = cache || [];
    let { regs, group, justOne } = todo;
    let results = [];
    if (!regs || regs.length === 0) {
      return { ptrs: [], byGroup: {} }
    }

    const minLength = regs.filter(r => r.optional !== true && r.negative !== true).length;
    docs: for (let n = 0; n < docs.length; n += 1) {
      let terms = docs[n];
      // let index = terms[0].index || []
      // can we skip this sentence?
      if (cache[n] && failFast$1(regs, cache[n])) {
        continue
      }
      // ^start regs only run once, per phrase
      if (regs[0].start === true) {
        let foundStart = handleStart(terms, regs, n);
        if (foundStart) {
          results.push(foundStart);
        }
        continue
      }
      //ok, try starting the match now from every term
      for (let i = 0; i < terms.length; i += 1) {
        let slice = terms.slice(i);
        // ensure it's long-enough
        if (slice.length < minLength) {
          break
        }
        let res = fromHere(slice, regs, i, terms.length);
        // did we find a result?
        if (res) {
          // res = addSentence(res, index[0])
          res = addSentence(res, n);
          results.push(res);
          // should we stop here?
          if (justOne === true) {
            break docs
          }
          // skip ahead, over these results
          let end = res.pointer[2];
          if (Math.abs(end - 1) > i) {
            i = Math.abs(end - 1);
          }
        }
      }
    }
    // ensure any end-results ($) match until the last term
    if (regs[regs.length - 1].end === true) {
      results = results.filter(res => {
        let n = res.pointer[0];
        return docs[n].length === res.pointer[2]
      });
    }
    if (todo.notIf) {
      results = notIf$1(results, todo.notIf, docs);
    }
    // grab the requested group
    results = getGroup$1(results, group);
    // add ids to pointers
    results.ptrs.forEach(ptr => {
      let [n, start, end] = ptr;
      ptr[3] = docs[n][start].id;//start-id
      ptr[4] = docs[n][end - 1].id;//end-id
    });
    return results
  };

  var match$1 = runMatch$2;

  const methods$b = {
    one: {
      termMethods,
      parseMatch,
      match: match$1,
    },
  };

  var methods$c = methods$b;

  var lib$3 = {
    /** pre-parse any match statements */
    parseMatch: function (str, opts) {
      const world = this.world();
      let killUnicode = world.methods.one.killUnicode;
      if (killUnicode) {
        str = killUnicode(str, world);
      }
      return world.methods.one.parseMatch(str, opts, world)
    }
  };

  var match = {
    api: api$j,
    methods: methods$c,
    lib: lib$3,
  };

  const isClass = /^\../;
  const isId = /^#./;

  const escapeXml = (str) => {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&apos;');
    return str
  };

  // interpret .class, #id, tagName
  const toTag = function (k) {
    let start = '';
    let end = '</span>';
    k = escapeXml(k);
    if (isClass.test(k)) {
      start = `<span class="${k.replace(/^\./, '')}"`;
    } else if (isId.test(k)) {
      start = `<span id="${k.replace(/^#/, '')}"`;
    } else {
      start = `<${k}`;
      end = `</${k}>`;
    }
    start += '>';
    return { start, end }
  };

  const getIndex = function (doc, obj) {
    let starts = {};
    let ends = {};
    Object.keys(obj).forEach(k => {
      let res = obj[k];
      let tag = toTag(k);
      if (typeof res === 'string') {
        res = doc.match(res);
      }
      res.docs.forEach(terms => {
        // don't highlight implicit terms
        if (terms.every(t => t.implicit)) {
          return
        }
        let a = terms[0].id;
        starts[a] = starts[a] || [];
        starts[a].push(tag.start);
        let b = terms[terms.length - 1].id;
        ends[b] = ends[b] || [];
        ends[b].push(tag.end);
      });
    });
    return { starts, ends }
  };

  const html = function (obj) {
    // index ids to highlight
    let { starts, ends } = getIndex(this, obj);
    // create the text output
    let out = '';
    this.docs.forEach(terms => {
      for (let i = 0; i < terms.length; i += 1) {
        let t = terms[i];
        // do a span tag
        if (starts.hasOwnProperty(t.id)) {
          out += starts[t.id].join('');
        }
        out += t.pre || '' + t.text || '';
        if (ends.hasOwnProperty(t.id)) {
          out += ends[t.id].join('');
        }
        out += t.post || '';
      }
    });
    return out
  };
  var html$1 = { html };

  const trimEnd = /[,:;)\]*.?~!\u0022\uFF02\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4—-]+$/;
  const trimStart =
    /^[(['"*~\uFF02\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F]+/;

  const punctToKill = /[,:;)('"\u201D\]]/;
  const isHyphen = /^[-–—]$/;
  const hasSpace = / /;

  const textFromTerms = function (terms, opts, keepSpace = true) {
    let txt = '';
    terms.forEach((t) => {
      let pre = t.pre || '';
      let post = t.post || '';
      if (opts.punctuation === 'some') {
        pre = pre.replace(trimStart, '');
        // replace a hyphen with a space
        if (isHyphen.test(post)) {
          post = ' ';
        }
        post = post.replace(punctToKill, '');
        // cleanup exclamations
        post = post.replace(/\?!+/, '?');
        post = post.replace(/!+/, '!');
        post = post.replace(/\?+/, '?');
        // kill elipses
        post = post.replace(/\.{2,}/, '');
        // kill abbreviation periods
        if (t.tags.has('Abbreviation')) {
          post = post.replace(/\./, '');
        }
      }
      if (opts.whitespace === 'some') {
        pre = pre.replace(/\s/, ''); //remove pre-whitespace
        post = post.replace(/\s+/, ' '); //replace post-whitespace with a space
      }
      if (!opts.keepPunct) {
        pre = pre.replace(trimStart, '');
        if (post === '-') {
          post = ' ';
        } else {
          post = post.replace(trimEnd, '');
        }
      }
      // grab the correct word format
      let word = t[opts.form || 'text'] || t.normal || '';
      if (opts.form === 'implicit') {
        word = t.implicit || t.text;
      }
      if (opts.form === 'root' && t.implicit) {
        word = t.root || t.implicit || t.normal;
      }
      // add an implicit space, for contractions
      if ((opts.form === 'machine' || opts.form === 'implicit' || opts.form === 'root') && t.implicit) {
        if (!post || !hasSpace.test(post)) {
          post += ' ';
        }
      }
      txt += pre + word + post;
    });
    if (keepSpace === false) {
      txt = txt.trim();
    }
    if (opts.lowerCase === true) {
      txt = txt.toLowerCase();
    }
    return txt
  };

  const textFromDoc = function (docs, opts) {
    let text = '';
    if (!docs || !docs[0] || !docs[0][0]) {
      return text
    }
    for (let i = 0; i < docs.length; i += 1) {
      // middle
      text += textFromTerms(docs[i], opts, true);
    }
    if (!opts.keepSpace) {
      text = text.trim();
    }
    if (opts.keepPunct === false) {
      // don't remove ':)' etc
      if (!docs[0][0].tags.has('Emoticon')) {
        text = text.replace(trimStart, '');
      }
      let last = docs[docs.length - 1];
      if (!last[last.length - 1].tags.has('Emoticon')) {
        text = text.replace(trimEnd, '');
      }
    }
    if (opts.cleanWhitespace === true) {
      text = text.trim();
    }
    return text
  };

  const fmts = {
    text: {
      form: 'text',
    },
    normal: {
      whitespace: 'some',
      punctuation: 'some',
      case: 'some',
      unicode: 'some',
      form: 'normal',
    },
    machine: {
      keepSpace: false,
      whitespace: 'some',
      punctuation: 'some',
      case: 'none',
      unicode: 'some',
      form: 'machine',
    },
    root: {
      keepSpace: false,
      whitespace: 'some',
      punctuation: 'some',
      case: 'some',
      unicode: 'some',
      form: 'root',
    },
    implicit: {
      form: 'implicit',
    }
  };
  fmts.clean = fmts.normal;
  fmts.reduced = fmts.root;
  var fmts$1 = fmts;

  /* eslint-disable no-bitwise */
  /* eslint-disable no-mixed-operators */
  /* eslint-disable no-multi-assign */

  // https://github.com/jbt/tiny-hashes/
  let k = [], i$1 = 0;
  for (; i$1 < 64;) {
    k[i$1] = 0 | Math.sin(++i$1 % Math.PI) * 4294967296;
  }

  function md5(s) {
    let b, c, d,
      h = [b = 0x67452301, c = 0xEFCDAB89, ~b, ~c],
      words = [],
      j = decodeURI(encodeURI(s)) + '\x80',
      a = j.length;

    s = (--a / 4 + 2) | 15;

    words[--s] = a * 8;

    for (; ~a;) {
      words[a >> 2] |= j.charCodeAt(a) << 8 * a--;
    }

    for (i$1 = j = 0; i$1 < s; i$1 += 16) {
      a = h;

      for (; j < 64;
        a = [
          d = a[3],
          (
            b +
            ((d =
              a[0] +
              [
                b & c | ~b & d,
                d & b | ~d & c,
                b ^ c ^ d,
                c ^ (b | ~d)
              ][a = j >> 4] +
              k[j] +
              ~~words[i$1 | [
                j,
                5 * j + 1,
                3 * j + 5,
                7 * j
              ][a] & 15]
            ) << (a = [
              7, 12, 17, 22,
              5, 9, 14, 20,
              4, 11, 16, 23,
              6, 10, 15, 21
            ][4 * a + j++ % 4]) | d >>> -a)
          ),
          b,
          c
        ]
      ) {
        b = a[1] | 0;
        c = a[2];
      }
      for (j = 4; j;) h[--j] += a[j];
    }

    for (s = ''; j < 32;) {
      s += ((h[j >> 3] >> ((1 ^ j++) * 4)) & 15).toString(16);
    }

    return s;
  }

  // console.log(md5('food-safety'))

  const defaults$1 = {
    text: true,
    terms: true,
  };

  let opts = { case: 'none', unicode: 'some', form: 'machine', punctuation: 'some' };

  const merge = function (a, b) {
    return Object.assign({}, a, b)
  };

  const fns$1 = {
    text: (terms) => textFromTerms(terms, { keepPunct: true }, false),
    normal: (terms) => textFromTerms(terms, merge(fmts$1.normal, { keepPunct: true }), false),
    implicit: (terms) => textFromTerms(terms, merge(fmts$1.implicit, { keepPunct: true }), false),

    machine: (terms) => textFromTerms(terms, opts, false),
    root: (terms) => textFromTerms(terms, merge(opts, { form: 'root' }), false),

    hash: (terms) => md5(textFromTerms(terms, { keepPunct: true }, false)),

    offset: (terms) => {
      let len = fns$1.text(terms).length;
      return {
        index: terms[0].offset.index,
        start: terms[0].offset.start,
        length: len,
      }
    },
    terms: (terms) => {
      return terms.map(t => {
        let term = Object.assign({}, t);
        term.tags = Array.from(t.tags);
        return term
      })
    },
    confidence: (_terms, view, i) => view.eq(i).confidence(),
    syllables: (_terms, view, i) => view.eq(i).syllables(),
    sentence: (_terms, view, i) => view.eq(i).fullSentence().text(),
    dirty: (terms) => terms.some(t => t.dirty === true)
  };
  fns$1.sentences = fns$1.sentence;
  fns$1.clean = fns$1.normal;
  fns$1.reduced = fns$1.root;

  const toJSON$2 = function (view, option) {
    option = option || {};
    if (typeof option === 'string') {
      option = {};
    }
    option = Object.assign({}, defaults$1, option);
    // run any necessary upfront steps
    if (option.offset) {
      view.compute('offset');
    }
    return view.docs.map((terms, i) => {
      let res = {};
      Object.keys(option).forEach(k => {
        if (option[k] && fns$1[k]) {
          res[k] = fns$1[k](terms, view, i);
        }
      });
      return res
    })
  };


  const methods$a = {
    /** return data */
    json: function (n) {
      let res = toJSON$2(this, n);
      if (typeof n === 'number') {
        return res[n]
      }
      return res
    },
  };
  methods$a.data = methods$a.json;
  var json = methods$a;

  /* eslint-disable no-console */
  const logClientSide = function (view) {
    console.log('%c -=-=- ', 'background-color:#6699cc;');
    view.forEach(m => {
      console.groupCollapsed(m.text());
      let terms = m.docs[0];
      let out = terms.map(t => {
        let text = t.text || '-';
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        let tags = '[' + Array.from(t.tags).join(', ') + ']';
        return { text, tags }
      });
      console.table(out, ['text', 'tags']);
      console.groupEnd();
    });
  };
  var logClientSide$1 = logClientSide;

  // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
  const reset = '\x1b[0m';

  //cheaper than requiring chalk
  const cli = {
    green: str => '\x1b[32m' + str + reset,
    red: str => '\x1b[31m' + str + reset,
    blue: str => '\x1b[34m' + str + reset,
    magenta: str => '\x1b[35m' + str + reset,
    cyan: str => '\x1b[36m' + str + reset,
    yellow: str => '\x1b[33m' + str + reset,
    black: str => '\x1b[30m' + str + reset,
    dim: str => '\x1b[2m' + str + reset,
    i: str => '\x1b[3m' + str + reset,
  };
  var cli$1 = cli;

  /* eslint-disable no-console */

  const tagString = function (tags, model) {
    if (model.one.tagSet) {
      tags = tags.map(tag => {
        if (!model.one.tagSet.hasOwnProperty(tag)) {
          return tag
        }
        const c = model.one.tagSet[tag].color || 'blue';
        return cli$1[c](tag)
      });
    }
    return tags.join(', ')
  };

  const showTags = function (view) {
    let { docs, model } = view;
    if (docs.length === 0) {
      console.log(cli$1.blue('\n     ──────'));
    }
    docs.forEach(terms => {
      console.log(cli$1.blue('\n  ┌─────────'));
      terms.forEach(t => {
        let tags = [...(t.tags || [])];
        let text = t.text || '-';
        if (t.sense) {
          text = `{${t.normal}/${t.sense}}`;
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = cli$1.yellow(text);
        let word = "'" + text + "'";
        if (t.reference) {
          let str = view.update([t.reference]).text('normal');
          word += ` - ${cli$1.dim(cli$1.i('[' + str + ']'))}`;
        }
        word = word.padEnd(18);
        let str = cli$1.blue('  │ ') + cli$1.i(word) + '  - ' + tagString(tags, model);
        console.log(str);
      });
    });
  };
  var showTags$1 = showTags;

  /* eslint-disable no-console */

  const showChunks = function (view) {
    let { docs } = view;
    console.log('');
    docs.forEach(terms => {
      let out = [];
      terms.forEach(term => {
        if (term.chunk === 'Noun') {
          out.push(cli$1.blue(term.implicit || term.normal));
        } else if (term.chunk === 'Verb') {
          out.push(cli$1.green(term.implicit || term.normal));
        } else if (term.chunk === 'Adjective') {
          out.push(cli$1.yellow(term.implicit || term.normal));
        } else if (term.chunk === 'Pivot') {
          out.push(cli$1.red(term.implicit || term.normal));
        } else {
          out.push(term.implicit || term.normal);
        }
      });
      console.log(out.join(' '), '\n');
    });
  };
  var showChunks$1 = showChunks;

  const split = (txt, offset, index) => {
    let buff = index * 9; //there are 9 new chars addded to each highlight
    let start = offset.start + buff;
    let end = start + offset.length;
    let pre = txt.substring(0, start);
    let mid = txt.substring(start, end);
    let post = txt.substring(end, txt.length);
    return [pre, mid, post]
  };

  const spliceIn = function (txt, offset, index) {
    let parts = split(txt, offset, index);
    return `${parts[0]}${cli$1.blue(parts[1])}${parts[2]}`
  };

  const showHighlight = function (doc) {
    if (!doc.found) {
      return
    }
    let bySentence = {};
    doc.fullPointer.forEach(ptr => {
      bySentence[ptr[0]] = bySentence[ptr[0]] || [];
      bySentence[ptr[0]].push(ptr);
    });
    Object.keys(bySentence).forEach(k => {
      let full = doc.update([[Number(k)]]);
      let txt = full.text();
      let matches = doc.update(bySentence[k]);
      let json = matches.json({ offset: true });
      json.forEach((obj, i) => {
        txt = spliceIn(txt, obj.offset, i);
      });
      console.log(txt); // eslint-disable-line
    });
  };
  var showHighlight$1 = showHighlight;

  /* eslint-disable no-console */

  function isClientSide() {
    return typeof window !== 'undefined' && window.document
  }
  //output some helpful stuff to the console
  const debug = function (opts = {}) {
    let view = this;
    if (typeof opts === 'string') {
      let tmp = {};
      tmp[opts] = true; //allow string input
      opts = tmp;
    }
    if (isClientSide()) {
      logClientSide$1(view);
      return view
    }
    if (opts.tags !== false) {
      showTags$1(view);
      console.log('\n');
    }
    // output chunk-view, too
    if (opts.chunks === true) {
      showChunks$1(view);
      console.log('\n');
    }
    // highlight match in sentence
    if (opts.highlight === true) {
      showHighlight$1(view);
      console.log('\n');
    }
    return view
  };
  var debug$1 = debug;

  const toText$3 = function (term) {
    let pre = term.pre || '';
    let post = term.post || '';
    return pre + term.text + post
  };

  const findStarts = function (doc, obj) {
    let starts = {};
    Object.keys(obj).forEach(reg => {
      let m = doc.match(reg);
      m.fullPointer.forEach(a => {
        starts[a[3]] = { fn: obj[reg], end: a[2] };
      });
    });
    return starts
  };

  const wrap = function (doc, obj) {
    // index ids to highlight
    let starts = findStarts(doc, obj);
    let text = '';
    doc.docs.forEach((terms, n) => {
      for (let i = 0; i < terms.length; i += 1) {
        let t = terms[i];
        // do a span tag
        if (starts.hasOwnProperty(t.id)) {
          let { fn, end } = starts[t.id];
          let m = doc.update([[n, i, end]]);
          text += terms[i].pre || '';
          text += fn(m);
          i = end - 1;
          text += terms[i].post || '';
        } else {
          text += toText$3(t);
        }
      }
    });
    return text
  };
  var wrap$1 = wrap;

  const isObject$2 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  // sort by frequency
  const topk = function (arr) {
    let obj = {};
    arr.forEach(a => {
      obj[a] = obj[a] || 0;
      obj[a] += 1;
    });
    let res = Object.keys(obj).map(k => {
      return { normal: k, count: obj[k] }
    });
    return res.sort((a, b) => (a.count > b.count ? -1 : 0))
  };

  /** some named output formats */
  const out = function (method) {
    // support custom outputs
    if (isObject$2(method)) {
      return wrap$1(this, method)
    }
    // text out formats
    if (method === 'text') {
      return this.text()
    }
    if (method === 'normal') {
      return this.text('normal')
    }
    if (method === 'root') {
      return this.text('root')
    }
    if (method === 'machine' || method === 'reduced') {
      return this.text('machine')
    }
    if (method === 'hash' || method === 'md5') {
      return md5(this.text())
    }

    // json data formats
    if (method === 'json') {
      return this.json()
    }
    if (method === 'offset' || method === 'offsets') {
      this.compute('offset');
      return this.json({ offset: true })
    }
    if (method === 'array') {
      let arr = this.docs.map(terms => {
        return terms
          .reduce((str, t) => {
            return str + t.pre + t.text + t.post
          }, '')
          .trim()
      });
      return arr.filter(str => str)
    }
    // return terms sorted by frequency
    if (method === 'freq' || method === 'frequency' || method === 'topk') {
      return topk(this.json({ normal: true }).map(o => o.normal))
    }

    // some handy ad-hoc outputs
    if (method === 'terms') {
      let list = [];
      this.docs.forEach(s => {
        let terms = s.terms.map(t => t.text);
        terms = terms.filter(t => t);
        list = list.concat(terms);
      });
      return list
    }
    if (method === 'tags') {
      return this.docs.map(terms => {
        return terms.reduce((h, t) => {
          h[t.implicit || t.normal] = Array.from(t.tags);
          return h
        }, {})
      })
    }
    if (method === 'debug') {
      return this.debug() //allow
    }
    return this.text()
  };

  const methods$9 = {
    /** */
    debug: debug$1,
    /** */
    out,
    /** */
    wrap: function (obj) {
      return wrap$1(this, obj)
    },
  };

  var out$1 = methods$9;

  const isObject$1 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  var text = {
    /** */
    text: function (fmt) {
      let opts = {};
      if (fmt && typeof fmt === 'string' && fmts$1.hasOwnProperty(fmt)) {
        opts = Object.assign({}, fmts$1[fmt]);
      } else if (fmt && isObject$1(fmt)) {
        opts = Object.assign({}, fmt);//todo: fixme
      }
      if (opts.keepSpace === undefined && this.pointer) {
        opts.keepSpace = false;
      }
      if (opts.keepPunct === undefined && this.pointer) {
        let ptr = this.pointer[0];
        if (ptr && ptr[1]) {
          opts.keepPunct = false;
        } else {
          opts.keepPunct = true;
        }
      }
      // set defaults
      if (opts.keepPunct === undefined) {
        opts.keepPunct = true;
      }
      if (opts.keepSpace === undefined) {
        opts.keepSpace = true;
      }
      return textFromDoc(this.docs, opts)
    },
  };

  const methods$8 = Object.assign({}, out$1, text, json, html$1);

  const addAPI$1 = function (View) {
    Object.assign(View.prototype, methods$8);
  };
  var api$i = addAPI$1;

  var output = {
    api: api$i,
    methods: {
      one: {
        hash: md5
      }
    }
  };

  // do the pointers intersect?
  const doesOverlap = function (a, b) {
    if (a[0] !== b[0]) {
      return false
    }
    let [, startA, endA] = a;
    let [, startB, endB] = b;
    // [a,a,a,-,-,-,]
    // [-,-,b,b,b,-,]
    if (startA <= startB && endA > startB) {
      return true
    }
    // [-,-,-,a,a,-,]
    // [-,-,b,b,b,-,]
    if (startB <= startA && endB > startA) {
      return true
    }
    return false
  };

  // get widest min/max
  const getExtent = function (ptrs) {
    let min = ptrs[0][1];
    let max = ptrs[0][2];
    ptrs.forEach(ptr => {
      if (ptr[1] < min) {
        min = ptr[1];
      }
      if (ptr[2] > max) {
        max = ptr[2];
      }
    });
    return [ptrs[0][0], min, max]
  };

  // collect pointers by sentence number
  const indexN = function (ptrs) {
    let byN = {};
    ptrs.forEach(ref => {
      byN[ref[0]] = byN[ref[0]] || [];
      byN[ref[0]].push(ref);
    });
    return byN
  };

  // remove exact duplicates
  const uniquePtrs = function (arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i += 1) {
      obj[arr[i].join(',')] = arr[i];
    }
    return Object.values(obj)
  };

  // a before b
  // console.log(doesOverlap([0, 0, 4], [0, 2, 5]))
  // // b before a
  // console.log(doesOverlap([0, 3, 4], [0, 1, 5]))
  // // disjoint
  // console.log(doesOverlap([0, 0, 3], [0, 4, 5]))
  // neighbours
  // console.log(doesOverlap([0, 1, 3], [0, 3, 5]))
  // console.log(doesOverlap([0, 3, 5], [0, 1, 3]))

  // console.log(
  //   getExtent([
  //     [0, 3, 4],
  //     [0, 4, 5],
  //     [0, 1, 2],
  //   ])
  // )

  // split a pointer, by match pointer
  const pivotBy = function (full, m) {
    let [n, start] = full;
    let mStart = m[1];
    let mEnd = m[2];
    let res = {};
    // is there space before the match?
    if (start < mStart) {
      let end = mStart < full[2] ? mStart : full[2]; // find closest end-point
      res.before = [n, start, end]; //before segment
    }
    res.match = m;
    // is there space after the match?
    if (full[2] > mEnd) {
      res.after = [n, mEnd, full[2]]; //after segment
    }
    return res
  };

  const doesMatch = function (full, m) {
    return full[1] <= m[1] && m[2] <= full[2]
  };

  const splitAll = function (full, m) {
    let byN = indexN(m);
    let res = [];
    full.forEach(ptr => {
      let [n] = ptr;
      let matches = byN[n] || [];
      matches = matches.filter(p => doesMatch(ptr, p));
      if (matches.length === 0) {
        res.push({ passthrough: ptr });
        return
      }
      // ensure matches are in-order
      matches = matches.sort((a, b) => a[1] - b[1]);
      // start splitting our left-to-right
      let carry = ptr;
      matches.forEach((p, i) => {
        let found = pivotBy(carry, p);
        // last one
        if (!matches[i + 1]) {
          res.push(found);
        } else {
          res.push({ before: found.before, match: found.match });
          if (found.after) {
            carry = found.after;
          }
        }
      });
    });
    return res
  };

  var splitAll$1 = splitAll;

  const max$1 = 20;

  // sweep-around looking for our start term uuid
  const blindSweep = function (id, doc, n) {
    for (let i = 0; i < max$1; i += 1) {
      // look up a sentence
      if (doc[n - i]) {
        let index = doc[n - i].findIndex(term => term.id === id);
        if (index !== -1) {
          return [n - i, index]
        }
      }
      // look down a sentence
      if (doc[n + i]) {
        let index = doc[n + i].findIndex(term => term.id === id);
        if (index !== -1) {
          return [n + i, index]
        }
      }
    }
    return null
  };

  const repairEnding = function (ptr, document) {
    let [n, start, , , endId] = ptr;
    let terms = document[n];
    // look for end-id
    let newEnd = terms.findIndex(t => t.id === endId);
    if (newEnd === -1) {
      // if end-term wasn't found, so go all the way to the end
      ptr[2] = document[n].length;
      ptr[4] = terms.length ? terms[terms.length - 1].id : null;
    } else {
      ptr[2] = newEnd; // repair ending pointer
    }
    return document[n].slice(start, ptr[2] + 1)
  };

  /** return a subset of the document, from a pointer */
  const getDoc$1 = function (ptrs, document) {
    let doc = [];
    ptrs.forEach((ptr, i) => {
      if (!ptr) {
        return
      }
      let [n, start, end, id, endId] = ptr; //parsePointer(ptr)
      let terms = document[n] || [];
      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = terms.length;
      }
      if (id && (!terms[start] || terms[start].id !== id)) {
        // console.log('  repairing pointer...')
        let wild = blindSweep(id, document, n);
        if (wild !== null) {
          let len = end - start;
          terms = document[wild[0]].slice(wild[1], wild[1] + len);
          // actually change the pointer
          let startId = terms[0] ? terms[0].id : null;
          ptrs[i] = [wild[0], wild[1], wild[1] + len, startId];
        }
      } else {
        terms = terms.slice(start, end);
      }
      if (terms.length === 0) {
        return
      }
      if (start === end) {
        return
      }
      // test end-id, if it exists
      if (endId && terms[terms.length - 1].id !== endId) {
        terms = repairEnding(ptr, document);
      }
      // otherwise, looks good!
      doc.push(terms);
    });
    doc = doc.filter(a => a.length > 0);
    return doc
  };
  var getDoc$2 = getDoc$1;

  // flat list of terms from nested document
  const termList = function (docs) {
    let arr = [];
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        arr.push(docs[i][t]);
      }
    }
    return arr
  };

  var methods$7 = {
    one: {
      termList,
      getDoc: getDoc$2,
      pointer: {
        indexN,
        splitAll: splitAll$1,
      }
    },
  };

  // a union is a + b, minus duplicates
  const getUnion = function (a, b) {
    let both = a.concat(b);
    let byN = indexN(both);
    let res = [];
    both.forEach(ptr => {
      let [n] = ptr;
      if (byN[n].length === 1) {
        // we're alone on this sentence, so we're good
        res.push(ptr);
        return
      }
      // there may be overlaps
      let hmm = byN[n].filter(m => doesOverlap(ptr, m));
      hmm.push(ptr);
      let range = getExtent(hmm);
      res.push(range);
    });
    res = uniquePtrs(res);
    return res
  };
  var getUnion$1 = getUnion;

  // two disjoint
  // console.log(getUnion([[1, 3, 4]], [[0, 1, 2]]))
  // two disjoint
  // console.log(getUnion([[0, 3, 4]], [[0, 1, 2]]))
  // overlap-plus
  // console.log(getUnion([[0, 1, 4]], [[0, 2, 6]]))
  // overlap
  // console.log(getUnion([[0, 1, 4]], [[0, 2, 3]]))
  // neighbours
  // console.log(getUnion([[0, 1, 3]], [[0, 3, 5]]))

  const subtract = function (refs, not) {
    let res = [];
    let found = splitAll$1(refs, not);
    found.forEach(o => {
      if (o.passthrough) {
        res.push(o.passthrough);
      }
      if (o.before) {
        res.push(o.before);
      }
      if (o.after) {
        res.push(o.after);
      }
    });
    return res
  };
  var getDifference = subtract;

  // console.log(subtract([[0, 0, 2]], [[0, 0, 1]]))
  // console.log(subtract([[0, 0, 2]], [[0, 1, 2]]))

  // [a,a,a,a,-,-,]
  // [-,-,b,b,b,-,]
  // [-,-,x,x,-,-,]
  const intersection = function (a, b) {
    // find the latest-start
    let start = a[1] < b[1] ? b[1] : a[1];
    // find the earliest-end
    let end = a[2] > b[2] ? b[2] : a[2];
    // does it form a valid pointer?
    if (start < end) {
      return [a[0], start, end]
    }
    return null
  };

  const getIntersection = function (a, b) {
    let byN = indexN(b);
    let res = [];
    a.forEach(ptr => {
      let hmm = byN[ptr[0]] || [];
      hmm = hmm.filter(p => doesOverlap(ptr, p));
      // no sentence-pairs, so no intersection
      if (hmm.length === 0) {
        return
      }
      hmm.forEach(h => {
        let overlap = intersection(ptr, h);
        if (overlap) {
          res.push(overlap);
        }
      });
    });
    return res
  };
  var getIntersection$1 = getIntersection;

  // console.log(getIntersection([[0, 1, 3]], [[0, 2, 4]]))

  const isArray$3 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  const getDoc = (m, view) => {
    if (typeof m === 'string' || isArray$3(m)) {
      return view.match(m)
    }
    if (!m) {
      return view.none()
    }
    // support pre-parsed reg object
    return m
  };

  // 'harden' our json pointers, again
  const addIds = function (ptrs, docs) {
    return ptrs.map(ptr => {
      let [n, start] = ptr;
      if (docs[n] && docs[n][start]) {
        ptr[3] = docs[n][start].id;
      }
      return ptr
    })
  };

  const methods$6 = {};

  // all parts, minus duplicates
  methods$6.union = function (m) {
    m = getDoc(m, this);
    let ptrs = getUnion$1(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };
  methods$6.and = methods$6.union;

  // only parts they both have
  methods$6.intersection = function (m) {
    m = getDoc(m, this);
    let ptrs = getIntersection$1(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };

  // only parts of a that b does not have
  methods$6.not = function (m) {
    m = getDoc(m, this);
    let ptrs = getDifference(this.fullPointer, m.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };
  methods$6.difference = methods$6.not;

  // get opposite of a
  methods$6.complement = function () {
    let doc = this.all();
    let ptrs = getDifference(doc.fullPointer, this.fullPointer);
    ptrs = addIds(ptrs, this.document);
    return this.toView(ptrs)
  };

  // remove overlaps
  methods$6.settle = function () {
    let ptrs = this.fullPointer;
    ptrs.forEach(ptr => {
      ptrs = getUnion$1(ptrs, [ptr]);
    });
    ptrs = addIds(ptrs, this.document);
    return this.update(ptrs)
  };


  const addAPI = function (View) {
    // add set/intersection/union
    Object.assign(View.prototype, methods$6);
  };
  var api$h = addAPI;

  var pointers = {
    methods: methods$7,
    api: api$h,
  };

  var lib$2 = {
    // compile a list of matches into a match-net
    buildNet: function (matches) {
      const methods = this.methods();
      let net = methods.one.buildNet(matches, this.world());
      net.isNet = true;
      return net
    }
  };

  const api$f = function (View) {

    /** speedy match a sequence of matches */
    View.prototype.sweep = function (net, opts = {}) {
      const { world, docs } = this;
      const { methods } = world;
      let found = methods.one.bulkMatch(docs, net, this.methods, opts);

      // apply any changes
      if (opts.tagger !== false) {
        methods.one.bulkTagger(found, docs, this.world);
      }
      // fix the pointers
      // collect all found results into a View
      found = found.map(o => {
        let ptr = o.pointer;
        let term = docs[ptr[0]][ptr[1]];
        let len = ptr[2] - ptr[1];
        if (term.index) {
          o.pointer = [
            term.index[0],
            term.index[1],
            ptr[1] + len
          ];
        }
        return o
      });
      let ptrs = found.map(o => o.pointer);
      // cleanup results a bit
      found = found.map(obj => {
        obj.view = this.update([obj.pointer]);
        delete obj.regs;
        delete obj.needs;
        delete obj.pointer;
        delete obj._expanded;
        return obj
      });
      return {
        view: this.update(ptrs),
        found
      }
    };

  };
  var api$g = api$f;

  // extract the clear needs for an individual match token
  const getTokenNeeds = function (reg) {
    // negatives can't be cached
    if (reg.optional === true || reg.negative === true) {
      return null
    }
    if (reg.tag) {
      return '#' + reg.tag
    }
    if (reg.word) {
      return reg.word
    }
    if (reg.switch) {
      return `%${reg.switch}%`
    }
    return null
  };

  const getNeeds = function (regs) {
    let needs = [];
    regs.forEach(reg => {
      needs.push(getTokenNeeds(reg));
      // support AND (foo && tag)
      if (reg.operator === 'and' && reg.choices) {
        reg.choices.forEach(oneSide => {
          oneSide.forEach(r => {
            needs.push(getTokenNeeds(r));
          });
        });
      }
    });
    return needs.filter(str => str)
  };

  const getWants = function (regs) {
    let wants = [];
    let count = 0;
    regs.forEach(reg => {
      if (reg.operator === 'or' && !reg.optional && !reg.negative) {
        // add fast-or terms
        if (reg.fastOr) {
          Array.from(reg.fastOr).forEach(w => {
            wants.push(w);
          });
        }
        // add slow-or
        if (reg.choices) {
          reg.choices.forEach(rs => {
            rs.forEach(r => {
              let n = getTokenNeeds(r);
              if (n) {
                wants.push(n);
              }
            });
          });
        }
        count += 1;
      }
    });
    return { wants, count }
  };

  const parse$2 = function (matches, world) {
    const parseMatch = world.methods.one.parseMatch;
    matches.forEach(obj => {
      obj.regs = parseMatch(obj.match, {}, world);
      // wrap these ifNo properties into an array
      if (typeof obj.ifNo === 'string') {
        obj.ifNo = [obj.ifNo];
      }
      if (obj.notIf) {
        obj.notIf = parseMatch(obj.notIf, {}, world);
      }
      // cache any requirements up-front 
      obj.needs = getNeeds(obj.regs);
      let { wants, count } = getWants(obj.regs);
      obj.wants = wants;
      obj.minWant = count;
      // get rid of tiny sentences
      obj.minWords = obj.regs.filter(o => !o.optional).length;
    });
    return matches
  };

  var parse$3 = parse$2;

  // do some indexing on the list of matches
  const buildNet = function (matches, world) {
    // turn match-syntax into json
    matches = parse$3(matches, world);

    // collect by wants and needs
    let hooks = {};
    matches.forEach(obj => {
      // add needs
      obj.needs.forEach(str => {
        hooks[str] = hooks[str] || [];
        hooks[str].push(obj);
      });
      // add wants
      obj.wants.forEach(str => {
        hooks[str] = hooks[str] || [];
        hooks[str].push(obj);
      });
    });
    // remove duplicates
    Object.keys(hooks).forEach(k => {
      let already = {};
      hooks[k] = hooks[k].filter(obj => {
        if (already[obj.match]) {
          return false
        }
        already[obj.match] = true;
        return true
      });
    });

    // keep all un-cacheable matches (those with no needs) 
    let always = matches.filter(o => o.needs.length === 0 && o.wants.length === 0);
    return {
      hooks,
      always
    }
  };

  var buildNet$1 = buildNet;

  // for each cached-sentence, find a list of possible matches
  const getHooks = function (docCaches, hooks) {
    return docCaches.map((set, i) => {
      let maybe = [];
      Object.keys(hooks).forEach(k => {
        if (docCaches[i].has(k)) {
          maybe = maybe.concat(hooks[k]);
        }
      });
      // remove duplicates
      let already = {};
      maybe = maybe.filter(m => {
        if (already[m.match]) {
          return false
        }
        already[m.match] = true;
        return true
      });
      return maybe
    })
  };

  var getHooks$1 = getHooks;

  // filter-down list of maybe-matches
  const localTrim = function (maybeList, docCache) {
    return maybeList.map((list, n) => {
      let haves = docCache[n];
      // ensure all stated-needs of the match are met
      list = list.filter(obj => {
        return obj.needs.every(need => haves.has(need))
      });
      // ensure nothing matches in our 'ifNo' property
      list = list.filter(obj => {
        if (obj.ifNo !== undefined && obj.ifNo.some(no => haves.has(no)) === true) {
          return false
        }
        return true
      });
      // ensure atleast one(?) of the wants is found
      list = list.filter(obj => {
        if (obj.wants.length === 0) {
          return true
        }
        // ensure there's one cache-hit
        let found = obj.wants.filter(str => haves.has(str)).length;
        return found >= obj.minWant
      });
      return list
    })
  };
  var trimDown = localTrim;

  // finally,
  // actually run these match-statements on the terms
  const runMatch = function (maybeList, document, docCache, methods, opts) {
    let results = [];
    for (let n = 0; n < maybeList.length; n += 1) {
      for (let i = 0; i < maybeList[n].length; i += 1) {
        let m = maybeList[n][i];
        // ok, actually do the work.
        let res = methods.one.match([document[n]], m);
        // found something.
        if (res.ptrs.length > 0) {
          res.ptrs.forEach(ptr => {
            ptr[0] = n; // fix the sentence pointer
            // check ifNo
            // if (m.ifNo !== undefined) {
            //   let terms = document[n].slice(ptr[1], ptr[2])
            //   for (let k = 0; k < m.ifNo.length; k += 1) {
            //     const no = m.ifNo[k]
            //     // quick-check cache
            //     if (docCache[n].has(no)) {
            //       if (no.startsWith('#')) {
            //         let tag = no.replace(/^#/, '')
            //         if (terms.find(t => t.tags.has(tag))) {
            //           console.log('+' + tag)
            //           return
            //         }
            //       } else if (terms.find(t => t.normal === no || t.tags.has(no))) {
            //         console.log('+' + no)
            //         return
            //       }
            //     }
            //   }
            // }
            let todo = Object.assign({}, m, { pointer: ptr });
            if (m.unTag !== undefined) {
              todo.unTag = m.unTag;
            }
            results.push(todo);
          });
          //ok cool, can we stop early?
          if (opts.matchOne === true) {
            return [results[0]]
          }
        }
      }
    }
    return results
  };
  var runMatch$1 = runMatch;

  const tooSmall = function (maybeList, document) {
    return maybeList.map((arr, i) => {
      let termCount = document[i].length;
      arr = arr.filter(o => {
        return termCount >= o.minWords
      });
      return arr
    })
  };

  const sweep$1 = function (document, net, methods, opts = {}) {
    // find suitable matches to attempt, on each sentence
    let docCache = methods.one.cacheDoc(document);
    // collect possible matches for this document
    let maybeList = getHooks$1(docCache, net.hooks);
    // ensure all defined needs are met for each match
    maybeList = trimDown(maybeList, docCache);
    // add unchacheable matches to each sentence's todo-list
    if (net.always.length > 0) {
      maybeList = maybeList.map(arr => arr.concat(net.always));
    }
    // if we don't have enough words
    maybeList = tooSmall(maybeList, document);

    // now actually run the matches
    let results = runMatch$1(maybeList, document, docCache, methods, opts);
    // console.dir(results, { depth: 5 })
    return results
  };
  var bulkMatch = sweep$1;

  // is this tag consistent with the tags they already have?
  const canBe = function (terms, tag, model) {
    let tagSet = model.one.tagSet;
    if (!tagSet.hasOwnProperty(tag)) {
      return true
    }
    let not = tagSet[tag].not || [];
    for (let i = 0; i < terms.length; i += 1) {
      let term = terms[i];
      for (let k = 0; k < not.length; k += 1) {
        if (term.tags.has(not[k]) === true) {
          return false //found a tag conflict - bail!
        }
      }
    }
    return true
  };
  var canBe$1 = canBe;

  const tagger$1 = function (list, document, world) {
    const { model, methods } = world;
    const { getDoc, setTag, unTag } = methods.one;
    const looksPlural = methods.two.looksPlural;
    if (list.length === 0) {
      return list
    }
    // some logging for debugging
    const env = typeof process === 'undefined' || !process.env ? self.env || {} : process.env;
    if (env.DEBUG_TAGS) {
      console.log(`\n\n  \x1b[32m→ ${list.length} post-tagger:\x1b[0m`); //eslint-disable-line
    }
    return list.map(todo => {
      if (!todo.tag && !todo.chunk && !todo.unTag) {
        return
      }
      let reason = todo.reason || todo.match;
      let terms = getDoc([todo.pointer], document)[0];
      // handle 'safe' tag
      if (todo.safe === true) {
        // check for conflicting tags
        if (canBe$1(terms, todo.tag, model) === false) {
          return
        }
        // dont tag half of a hyphenated word
        if (terms[terms.length - 1].post === '-') {
          return
        }
      }
      if (todo.tag !== undefined) {
        setTag(terms, todo.tag, world, todo.safe, `[post] '${reason}'`);
        // quick and dirty plural tagger
        if (todo.tag === 'Noun' && looksPlural) {
          let term = terms[terms.length - 1];
          if (looksPlural(term.text)) {
            setTag([term], 'Plural', world, todo.safe, 'quick-plural');
          } else {
            setTag([term], 'Singular', world, todo.safe, 'quick-singular');
          }
        }
      }
      if (todo.unTag !== undefined) {
        unTag(terms, todo.unTag, world, todo.safe, reason);
      }
      // allow setting chunks, too
      if (todo.chunk) {
        terms.forEach(t => t.chunk = todo.chunk);
      }
    })
  };
  var bulkTagger = tagger$1;

  var methods$5 = {
    buildNet: buildNet$1,
    bulkMatch,
    bulkTagger
  };

  var sweep = {
    lib: lib$2,
    api: api$g,
    methods: {
      one: methods$5,
    }
  };

  const isMulti = / /;

  const addChunk = function (term, tag) {
    if (tag === 'Noun') {
      term.chunk = tag;
    }
    if (tag === 'Verb') {
      term.chunk = tag;
    }
  };

  const tagTerm = function (term, tag, tagSet, isSafe) {
    // does it already have this tag?
    if (term.tags.has(tag) === true) {
      return null
    }
    // allow this shorthand in multiple-tag strings
    if (tag === '.') {
      return null
    }
    // for known tags, do logical dependencies first
    let known = tagSet[tag];
    if (known) {
      // first, we remove any conflicting tags
      if (known.not && known.not.length > 0) {
        for (let o = 0; o < known.not.length; o += 1) {
          // if we're in tagSafe, skip this term.
          if (isSafe === true && term.tags.has(known.not[o])) {
            return null
          }
          term.tags.delete(known.not[o]);
        }
      }
      // add parent tags
      if (known.parents && known.parents.length > 0) {
        for (let o = 0; o < known.parents.length; o += 1) {
          term.tags.add(known.parents[o]);
          addChunk(term, known.parents[o]);
        }
      }
    }
    // finally, add our tag
    term.tags.add(tag);
    // now it's dirty?
    term.dirty = true;
    // add a chunk too, if it's easy
    addChunk(term, tag);
    return true
  };

  // support '#Noun . #Adjective' syntax
  const multiTag = function (terms, tagString, tagSet, isSafe) {
    let tags = tagString.split(isMulti);
    terms.forEach((term, i) => {
      let tag = tags[i];
      if (tag) {
        tag = tag.replace(/^#/, '');
        tagTerm(term, tag, tagSet, isSafe);
      }
    });
  };

  const isArray$2 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  // verbose-mode tagger debuging
  const log = (terms, tag, reason = '') => {
    const yellow = str => '\x1b[33m\x1b[3m' + str + '\x1b[0m';
    const i = str => '\x1b[3m' + str + '\x1b[0m';
    let word = terms.map(t => {
      return t.text || '[' + t.implicit + ']'
    }).join(' ');
    if (typeof tag !== 'string' && tag.length > 2) {
      tag = tag.slice(0, 2).join(', #') + ' +'; //truncate the list of tags
    }
    tag = typeof tag !== 'string' ? tag.join(', #') : tag;
    console.log(` ${yellow(word).padEnd(24)} \x1b[32m→\x1b[0m #${tag.padEnd(22)}  ${i(reason)}`); // eslint-disable-line
  };

  // add a tag to all these terms
  const setTag = function (terms, tag, world = {}, isSafe, reason) {
    const tagSet = world.model.one.tagSet || {};
    if (!tag) {
      return
    }
    // some logging for debugging
    const env = typeof process === 'undefined' || !process.env ? self.env || {} : process.env;
    if (env && env.DEBUG_TAGS) {
      log(terms, tag, reason);
    }
    if (isArray$2(tag) === true) {
      tag.forEach(tg => setTag(terms, tg, world, isSafe));
      return
    }
    if (typeof tag !== 'string') {
      console.warn(`compromise: Invalid tag '${tag}'`);// eslint-disable-line
      return
    }
    tag = tag.trim();
    // support '#Noun . #Adjective' syntax
    if (isMulti.test(tag)) {
      multiTag(terms, tag, tagSet, isSafe);
      return
    }
    tag = tag.replace(/^#/, '');
    // let set = false
    for (let i = 0; i < terms.length; i += 1) {
      tagTerm(terms[i], tag, tagSet, isSafe);
    }
  };
  var setTag$1 = setTag;

  // remove this tag, and its children, from these terms
  const unTag = function (terms, tag, tagSet) {
    tag = tag.trim().replace(/^#/, '');
    for (let i = 0; i < terms.length; i += 1) {
      let term = terms[i];
      // support clearing all tags, with '*'
      if (tag === '*') {
        term.tags.clear();
        continue
      }
      // for known tags, do logical dependencies first
      let known = tagSet[tag];
      // removing #Verb should also remove #PastTense
      if (known && known.children.length > 0) {
        for (let o = 0; o < known.children.length; o += 1) {
          term.tags.delete(known.children[o]);
        }
      }
      term.tags.delete(tag);
    }
  };
  var unTag$1 = unTag;

  const e=function(e){return e.children=e.children||[],e._cache=e._cache||{},e.props=e.props||{},e._cache.parents=e._cache.parents||[],e._cache.children=e._cache.children||[],e},t=/^ *(#|\/\/)/,n=function(t){let n=t.trim().split(/->/),r=[];n.forEach((t=>{r=r.concat(function(t){if(!(t=t.trim()))return null;if(/^\[/.test(t)&&/\]$/.test(t)){let n=(t=(t=t.replace(/^\[/,"")).replace(/\]$/,"")).split(/,/);return n=n.map((e=>e.trim())).filter((e=>e)),n=n.map((t=>e({id:t}))),n}return [e({id:t})]}(t));})),r=r.filter((e=>e));let i=r[0];for(let e=1;e<r.length;e+=1)i.children.push(r[e]),i=r[e];return r[0]},r=(e,t)=>{let n=[],r=[e];for(;r.length>0;){let e=r.pop();n.push(e),e.children&&e.children.forEach((n=>{t&&t(e,n),r.push(n);}));}return n},i=e=>"[object Array]"===Object.prototype.toString.call(e),c=e=>(e=e||"").trim(),s=function(c=[]){return "string"==typeof c?function(r){let i=r.split(/\r?\n/),c=[];i.forEach((e=>{if(!e.trim()||t.test(e))return;let r=(e=>{const t=/^( {2}|\t)/;let n=0;for(;t.test(e);)e=e.replace(t,""),n+=1;return n})(e);c.push({indent:r,node:n(e)});}));let s=function(e){let t={children:[]};return e.forEach(((n,r)=>{0===n.indent?t.children=t.children.concat(n.node):e[r-1]&&function(e,t){let n=e[t].indent;for(;t>=0;t-=1)if(e[t].indent<n)return e[t];return e[0]}(e,r).node.children.push(n.node);})),t}(c);return s=e(s),s}(c):i(c)?function(t){let n={};t.forEach((e=>{n[e.id]=e;}));let r=e({});return t.forEach((t=>{if((t=e(t)).parent)if(n.hasOwnProperty(t.parent)){let e=n[t.parent];delete t.parent,e.children.push(t);}else console.warn(`[Grad] - missing node '${t.parent}'`);else r.children.push(t);})),r}(c):(r(s=c).forEach(e),s);var s;},h=e=>"[31m"+e+"[0m",o=e=>"[2m"+e+"[0m",l=function(e,t){let n="-> ";t&&(n=o("→ "));let i="";return r(e).forEach(((e,r)=>{let c=e.id||"";if(t&&(c=h(c)),0===r&&!e.id)return;let s=e._cache.parents.length;i+="    ".repeat(s)+n+c+"\n";})),i},a=function(e){let t=r(e);t.forEach((e=>{delete(e=Object.assign({},e)).children;}));let n=t[0];return n&&!n.id&&0===Object.keys(n.props).length&&t.shift(),t},p={text:l,txt:l,array:a,flat:a},d=function(e,t){return "nested"===t||"json"===t?e:"debug"===t?(console.log(l(e,!0)),null):p.hasOwnProperty(t)?p[t](e):e},u=e=>{r(e,((e,t)=>{e.id&&(e._cache.parents=e._cache.parents||[],t._cache.parents=e._cache.parents.concat([e.id]));}));},f=(e,t)=>(Object.keys(t).forEach((n=>{if(t[n]instanceof Set){let r=e[n]||new Set;e[n]=new Set([...r,...t[n]]);}else {if((e=>e&&"object"==typeof e&&!Array.isArray(e))(t[n])){let r=e[n]||{};e[n]=Object.assign({},t[n],r);}else i(t[n])?e[n]=t[n].concat(e[n]||[]):void 0===e[n]&&(e[n]=t[n]);}})),e),j=/\//;class g{constructor(e={}){Object.defineProperty(this,"json",{enumerable:!1,value:e,writable:!0});}get children(){return this.json.children}get id(){return this.json.id}get found(){return this.json.id||this.json.children.length>0}props(e={}){let t=this.json.props||{};return "string"==typeof e&&(t[e]=!0),this.json.props=Object.assign(t,e),this}get(t){if(t=c(t),!j.test(t)){let e=this.json.children.find((e=>e.id===t));return new g(e)}let n=((e,t)=>{let n=(e=>"string"!=typeof e?e:(e=e.replace(/^\//,"")).split(/\//))(t=t||"");for(let t=0;t<n.length;t+=1){let r=e.children.find((e=>e.id===n[t]));if(!r)return null;e=r;}return e})(this.json,t)||e({});return new g(n)}add(t,n={}){if(i(t))return t.forEach((e=>this.add(c(e),n))),this;t=c(t);let r=e({id:t,props:n});return this.json.children.push(r),new g(r)}remove(e){return e=c(e),this.json.children=this.json.children.filter((t=>t.id!==e)),this}nodes(){return r(this.json).map((e=>(delete(e=Object.assign({},e)).children,e)))}cache(){return (e=>{let t=r(e,((e,t)=>{e.id&&(e._cache.parents=e._cache.parents||[],e._cache.children=e._cache.children||[],t._cache.parents=e._cache.parents.concat([e.id]));})),n={};t.forEach((e=>{e.id&&(n[e.id]=e);})),t.forEach((e=>{e._cache.parents.forEach((t=>{n.hasOwnProperty(t)&&n[t]._cache.children.push(e.id);}));})),e._cache.children=Object.keys(n);})(this.json),this}list(){return r(this.json)}fillDown(){var e;return e=this.json,r(e,((e,t)=>{t.props=f(t.props,e.props);})),this}depth(){u(this.json);let e=r(this.json),t=e.length>1?1:0;return e.forEach((e=>{if(0===e._cache.parents.length)return;let n=e._cache.parents.length+1;n>t&&(t=n);})),t}out(e){return u(this.json),d(this.json,e)}debug(){return u(this.json),d(this.json,"debug"),this}}const _=function(e){let t=s(e);return new g(t)};_.prototype.plugin=function(e){e(this);};

  // i just made these up
  const colors = {
    Noun: 'blue',
    Verb: 'green',
    Negative: 'green',
    Date: 'red',
    Value: 'red',
    Adjective: 'magenta',
    Preposition: 'cyan',
    Conjunction: 'cyan',
    Determiner: 'cyan',
    Hyphenated: 'cyan',
    Adverb: 'cyan',
  };

  var colors$1 = colors;

  const getColor = function (node) {
    if (colors$1.hasOwnProperty(node.id)) {
      return colors$1[node.id]
    }
    if (colors$1.hasOwnProperty(node.is)) {
      return colors$1[node.is]
    }
    let found = node._cache.parents.find(c => colors$1[c]);
    return colors$1[found]
  };

  // convert tags to our final format
  const fmt = function (nodes) {
    const res = {};
    nodes.forEach(node => {
      let { not, also, is, novel } = node.props;
      let parents = node._cache.parents;
      if (also) {
        parents = parents.concat(also);
      }
      res[node.id] = {
        is,
        not,
        novel,
        also,
        parents,
        children: node._cache.children,
        color: getColor(node)
      };
    });
    // lastly, add all children of all nots
    Object.keys(res).forEach(k => {
      let nots = new Set(res[k].not);
      res[k].not.forEach(not => {
        if (res[not]) {
          res[not].children.forEach(tag => nots.add(tag));
        }
      });
      res[k].not = Array.from(nots);
    });
    return res
  };

  var fmt$1 = fmt;

  const toArr = function (input) {
    if (!input) {
      return []
    }
    if (typeof input === 'string') {
      return [input]
    }
    return input
  };

  const addImplied = function (tags, already) {
    Object.keys(tags).forEach(k => {
      // support deprecated fmts
      if (tags[k].isA) {
        tags[k].is = tags[k].isA;
      }
      if (tags[k].notA) {
        tags[k].not = tags[k].notA;
      }
      // add any implicit 'is' tags
      if (tags[k].is && typeof tags[k].is === 'string') {
        if (!already.hasOwnProperty(tags[k].is) && !tags.hasOwnProperty(tags[k].is)) {
          tags[tags[k].is] = {};
        }
      }
      // add any implicit 'not' tags
      if (tags[k].not && typeof tags[k].not === 'string' && !tags.hasOwnProperty(tags[k].not)) {
        if (!already.hasOwnProperty(tags[k].not) && !tags.hasOwnProperty(tags[k].not)) {
          tags[tags[k].not] = {};
        }
      }
    });
    return tags
  };


  const validate = function (tags, already) {

    tags = addImplied(tags, already);

    // property validation
    Object.keys(tags).forEach(k => {
      tags[k].children = toArr(tags[k].children);
      tags[k].not = toArr(tags[k].not);
    });
    // not links are bi-directional
    // add any incoming not tags
    Object.keys(tags).forEach(k => {
      let nots = tags[k].not || [];
      nots.forEach(no => {
        if (tags[no] && tags[no].not) {
          tags[no].not.push(k);
        }
      });
    });
    return tags
  };
  var validate$1 = validate;

  // 'fill-down' parent logic inference
  const compute$3 = function (allTags) {
    // setup graph-lib format
    const flatList = Object.keys(allTags).map(k => {
      let o = allTags[k];
      const props = { not: new Set(o.not), also: o.also, is: o.is, novel: o.novel };
      return { id: k, parent: o.is, props, children: [] }
    });
    const graph = _(flatList).cache().fillDown();
    return graph.out('array')
  };

  const fromUser = function (tags) {
    Object.keys(tags).forEach(k => {
      tags[k] = Object.assign({}, tags[k]);
      tags[k].novel = true;
    });
    return tags
  };

  const addTags$1 = function (tags, already) {
    // are these tags internal ones, or user-generated?
    if (Object.keys(already).length > 0) {
      tags = fromUser(tags);
    }
    tags = validate$1(tags, already);

    let allTags = Object.assign({}, already, tags);
    // do some basic setting-up
    // 'fill-down' parent logic
    const nodes = compute$3(allTags);
    // convert it to our final format
    const res = fmt$1(nodes);
    return res
  };
  var addTags$2 = addTags$1;

  var methods$4 = {
    one: {
      setTag: setTag$1,
      unTag: unTag$1,
      addTags: addTags$2
    },
  };

  /* eslint no-console: 0 */
  const isArray$1 = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };
  const fns = {
    /** add a given tag, to all these terms */
    tag: function (input, reason = '', isSafe) {
      if (!this.found || !input) {
        return this
      }
      let terms = this.termList();
      if (terms.length === 0) {
        return this
      }
      const { methods, verbose, world } = this;
      // logger
      if (verbose === true) {
        console.log(' +  ', input, reason || '');
      }
      if (isArray$1(input)) {
        input.forEach(tag => methods.one.setTag(terms, tag, world, isSafe, reason));
      } else {
        methods.one.setTag(terms, input, world, isSafe, reason);
      }
      // uncache
      this.uncache();
      return this
    },

    /** add a given tag, only if it is consistent */
    tagSafe: function (input, reason = '') {
      return this.tag(input, reason, true)
    },

    /** remove a given tag from all these terms */
    unTag: function (input, reason) {
      if (!this.found || !input) {
        return this
      }
      let terms = this.termList();
      if (terms.length === 0) {
        return this
      }
      const { methods, verbose, model } = this;
      // logger
      if (verbose === true) {
        console.log(' -  ', input, reason || '');
      }
      let tagSet = model.one.tagSet;
      if (isArray$1(input)) {
        input.forEach(tag => methods.one.unTag(terms, tag, tagSet));
      } else {
        methods.one.unTag(terms, input, tagSet);
      }
      // uncache
      this.uncache();
      return this
    },

    /** return only the terms that can be this tag  */
    canBe: function (tag) {
      tag = tag.replace(/^#/, '');
      let tagSet = this.model.one.tagSet;
      // everything can be an unknown tag
      if (!tagSet.hasOwnProperty(tag)) {
        return this
      }
      let not = tagSet[tag].not || [];
      let nope = [];
      this.document.forEach((terms, n) => {
        terms.forEach((term, i) => {
          let found = not.find(no => term.tags.has(no));
          if (found) {
            nope.push([n, i, i + 1]);
          }
        });
      });
      let noDoc = this.update(nope);
      return this.difference(noDoc)
    },
  };
  var tag$1 = fns;

  const tagAPI = function (View) {
    Object.assign(View.prototype, tag$1);
  };
  var api$e = tagAPI;

  // wire-up more pos-tags to our model
  const addTags = function (tags) {
    const { model, methods } = this.world();
    const tagSet = model.one.tagSet;
    const fn = methods.one.addTags;
    let res = fn(tags, tagSet);
    model.one.tagSet = res;
    return this
  };

  var lib$1 = { addTags };

  const boringTags$1 = new Set(['Auxiliary', 'Possessive']);

  const sortByKids$1 = function (tags, tagSet) {
    tags = tags.sort((a, b) => {
      // (unknown tags are interesting)
      if (boringTags$1.has(a) || !tagSet.hasOwnProperty(b)) {
        return 1
      }
      if (boringTags$1.has(b) || !tagSet.hasOwnProperty(a)) {
        return -1
      }
      let kids = tagSet[a].children || [];
      let aKids = kids.length;
      kids = tagSet[b].children || [];
      let bKids = kids.length;
      return aKids - bKids
    });
    return tags
  };

  const tagRank$2 = function (view) {
    const { document, world } = view;
    const tagSet = world.model.one.tagSet;
    document.forEach(terms => {
      terms.forEach(term => {
        let tags = Array.from(term.tags);
        term.tagRank = sortByKids$1(tags, tagSet);
      });
    });
  };
  var tagRank$3 = tagRank$2;

  var tag = {
    model: {
      one: { tagSet: {} }
    },
    compute: {
      tagRank: tagRank$3
    },
    methods: methods$4,
    api: api$e,
    lib: lib$1
  };

  // split by periods, question marks, unicode ⁇, etc
  const initSplit = /([.!?\u203D\u2E18\u203C\u2047-\u2049\u3002]+\s)/g;
  // merge these back into prev sentence
  const splitsOnly = /^[.!?\u203D\u2E18\u203C\u2047-\u2049\u3002]+\s$/;
  const newLine = /((?:\r?\n|\r)+)/; // Match different new-line formats

  // Start with a regex:
  const basicSplit = function (text) {
    let all = [];
    //first, split by newline
    let lines = text.split(newLine);
    for (let i = 0; i < lines.length; i++) {
      //split by period, question-mark, and exclamation-mark
      let arr = lines[i].split(initSplit);
      for (let o = 0; o < arr.length; o++) {
        // merge 'foo' + '.'
        if (arr[o + 1] && splitsOnly.test(arr[o + 1]) === true) {
          arr[o] += arr[o + 1];
          arr[o + 1] = '';
        }
        if (arr[o] !== '') {
          all.push(arr[o]);
        }
      }
    }
    return all
  };
  var simpleSplit = basicSplit;

  const hasLetter$1 = /[a-z0-9\u00C0-\u00FF\u00a9\u00ae\u2000-\u3300\ud000-\udfff]/i;
  const hasSomething$1 = /\S/;

  const notEmpty = function (splits) {
    let chunks = [];
    for (let i = 0; i < splits.length; i++) {
      let s = splits[i];
      if (s === undefined || s === '') {
        continue
      }
      //this is meaningful whitespace
      if (hasSomething$1.test(s) === false || hasLetter$1.test(s) === false) {
        //add it to the last one
        if (chunks[chunks.length - 1]) {
          chunks[chunks.length - 1] += s;
          continue
        } else if (splits[i + 1]) {
          //add it to the next one
          splits[i + 1] = s + splits[i + 1];
          continue
        }
      }
      //else, only whitespace, no terms, no sentence
      chunks.push(s);
    }
    return chunks
  };
  var simpleMerge = notEmpty;

  //loop through these chunks, and join the non-sentence chunks back together..
  const smartMerge = function (chunks, world) {
    const isSentence = world.methods.one.tokenize.isSentence;
    const abbrevs = world.model.one.abbreviations || new Set();

    let sentences = [];
    for (let i = 0; i < chunks.length; i++) {
      let c = chunks[i];
      //should this chunk be combined with the next one?
      if (chunks[i + 1] && isSentence(c, abbrevs) === false) {
        chunks[i + 1] = c + (chunks[i + 1] || '');
      } else if (c && c.length > 0) {
        //this chunk is a proper sentence..
        sentences.push(c);
        chunks[i] = '';
      }
    }
    return sentences
  };
  var smartMerge$1 = smartMerge;

  /* eslint-disable regexp/no-dupe-characters-character-class */

  // merge embedded quotes into 1 sentence
  // like - 'he said "no!" and left.' 
  const MAX_QUOTE = 280;// ¯\_(ツ)_/¯

  // don't support single-quotes for multi-sentences
  const pairs = {
    '\u0022': '\u0022', // 'StraightDoubleQuotes'
    '\uFF02': '\uFF02', // 'StraightDoubleQuotesWide'
    // '\u0027': '\u0027', // 'StraightSingleQuotes'
    '\u201C': '\u201D', // 'CommaDoubleQuotes'
    // '\u2018': '\u2019', // 'CommaSingleQuotes'
    '\u201F': '\u201D', // 'CurlyDoubleQuotesReversed'
    // '\u201B': '\u2019', // 'CurlySingleQuotesReversed'
    '\u201E': '\u201D', // 'LowCurlyDoubleQuotes'
    '\u2E42': '\u201D', // 'LowCurlyDoubleQuotesReversed'
    '\u201A': '\u2019', // 'LowCurlySingleQuotes'
    '\u00AB': '\u00BB', // 'AngleDoubleQuotes'
    '\u2039': '\u203A', // 'AngleSingleQuotes'
    '\u2035': '\u2032', // 'PrimeSingleQuotes'
    '\u2036': '\u2033', // 'PrimeDoubleQuotes'
    '\u2037': '\u2034', // 'PrimeTripleQuotes'
    '\u301D': '\u301E', // 'PrimeDoubleQuotes'
    // '\u0060': '\u00B4', // 'PrimeSingleQuotes'
    '\u301F': '\u301E', // 'LowPrimeDoubleQuotesReversed'
  };
  const openQuote = RegExp('[' + Object.keys(pairs).join('') + ']', 'g');
  const closeQuote = RegExp('[' + Object.values(pairs).join('') + ']', 'g');

  const closesQuote = function (str) {
    if (!str) {
      return false
    }
    let m = str.match(closeQuote);
    if (m !== null && m.length === 1) {
      return true
    }
    return false
  };

  // allow micro-sentences when inside a quotation, like:
  // the doc said "no sir. i will not beg" and walked away.
  const quoteMerge = function (splits) {
    let arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      let split = splits[i];
      // do we have an open-quote and not a closed one?
      let m = split.match(openQuote);
      if (m !== null && m.length === 1) {

        // look at the next sentence for a closing quote,
        if (closesQuote(splits[i + 1]) && splits[i + 1].length < MAX_QUOTE) {
          splits[i] += splits[i + 1];// merge them
          arr.push(splits[i]);
          splits[i + 1] = '';
          i += 1;
          continue
        }
        // look at n+2 for a closing quote,
        if (closesQuote(splits[i + 2])) {
          let toAdd = splits[i + 1] + splits[i + 2];// merge them all
          //make sure it's not too-long
          if (toAdd.length < MAX_QUOTE) {
            splits[i] += toAdd;
            arr.push(splits[i]);
            splits[i + 1] = '';
            splits[i + 2] = '';
            i += 2;
            continue
          }
        }
      }
      arr.push(splits[i]);
    }
    return arr
  };
  var quoteMerge$1 = quoteMerge;

  const MAX_LEN = 250;// ¯\_(ツ)_/¯

  // support unicode variants?
  // https://stackoverflow.com/questions/13535172/list-of-all-unicodes-open-close-brackets
  const hasOpen = /\(/g;
  const hasClosed = /\)/g;
  const mergeParens = function (splits) {
    let arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      let split = splits[i];
      let m = split.match(hasOpen);
      if (m !== null && m.length === 1) {
        // look at next sentence, for closing parenthesis
        if (splits[i + 1] && splits[i + 1].length < MAX_LEN) {
          let m2 = splits[i + 1].match(hasClosed);
          if (m2 !== null && m.length === 1 && !hasOpen.test(splits[i + 1])) {
            // merge in 2nd sentence
            splits[i] += splits[i + 1];
            arr.push(splits[i]);
            splits[i + 1] = '';
            i += 1;
            continue
          }
        }
      }
      arr.push(splits[i]);
    }
    return arr
  };
  var parensMerge = mergeParens;

  //(Rule-based sentence boundary segmentation) - chop given text into its proper sentences.
  // Ignore periods/questions/exclamations used in acronyms/abbreviations/numbers, etc.
  //regs-
  const hasSomething = /\S/;
  const startWhitespace = /^\s+/;

  const splitSentences = function (text, world) {
    text = text || '';
    text = String(text);
    // Ensure it 'smells like' a sentence
    if (!text || typeof text !== 'string' || hasSomething.test(text) === false) {
      return []
    }
    // cleanup unicode-spaces
    text = text.replace('\xa0', ' ');
    // First do a greedy-split..
    let splits = simpleSplit(text);
    // Filter-out the crap ones
    let sentences = simpleMerge(splits);
    //detection of non-sentence chunks:
    sentences = smartMerge$1(sentences, world);
    // allow 'he said "no sir." and left.'
    sentences = quoteMerge$1(sentences);
    // allow 'i thought (no way!) and left.'
    sentences = parensMerge(sentences);
    //if we never got a sentence, return the given text
    if (sentences.length === 0) {
      return [text]
    }
    //move whitespace to the ends of sentences, when possible
    //['hello',' world'] -> ['hello ','world']
    for (let i = 1; i < sentences.length; i += 1) {
      let ws = sentences[i].match(startWhitespace);
      if (ws !== null) {
        sentences[i - 1] += ws[0];
        sentences[i] = sentences[i].replace(startWhitespace, '');
      }
    }
    return sentences
  };
  var splitSentences$1 = splitSentences;

  const hasHyphen = function (str, model) {
    let parts = str.split(/[-–—]/);
    if (parts.length <= 1) {
      return false
    }
    const { prefixes, suffixes } = model.one;

    // l-theanine, x-ray
    if (parts[0].length === 1 && /[a-z]/i.test(parts[0])) {
      return false
    }
    //dont split 're-do'
    if (prefixes.hasOwnProperty(parts[0])) {
      return false
    }
    //dont split 'flower-like'
    parts[1] = parts[1].trim().replace(/[.?!]$/, '');
    if (suffixes.hasOwnProperty(parts[1])) {
      return false
    }
    //letter-number 'aug-20'
    let reg = /^([a-z\u00C0-\u00FF`"'/]+)[-–—]([a-z0-9\u00C0-\u00FF].*)/i;
    if (reg.test(str) === true) {
      return true
    }
    //number-letter '20-aug'
    let reg2 = /^([0-9]{1,4})[-–—]([a-z\u00C0-\u00FF`"'/-]+$)/i;
    if (reg2.test(str) === true) {
      return true
    }
    return false
  };

  const splitHyphens = function (word) {
    let arr = [];
    //support multiple-hyphenated-terms
    const hyphens = word.split(/[-–—]/);
    let whichDash = '-';
    let found = word.match(/[-–—]/);
    if (found && found[0]) {
      whichDash = found;
    }
    for (let o = 0; o < hyphens.length; o++) {
      if (o === hyphens.length - 1) {
        arr.push(hyphens[o]);
      } else {
        arr.push(hyphens[o] + whichDash);
      }
    }
    return arr
  };

  // combine '2 - 5' like '2-5' is
  // 2-4: 2, 4
  const combineRanges = function (arr) {
    const startRange = /^[0-9]{1,4}(:[0-9][0-9])?([a-z]{1,2})? ?[-–—] ?$/;
    const endRange = /^[0-9]{1,4}([a-z]{1,2})? ?$/;
    for (let i = 0; i < arr.length - 1; i += 1) {
      if (arr[i + 1] && startRange.test(arr[i]) && endRange.test(arr[i + 1])) {
        arr[i] = arr[i] + arr[i + 1];
        arr[i + 1] = null;
      }
    }
    return arr
  };
  var combineRanges$1 = combineRanges;

  const isSlash = /\p{L} ?\/ ?\p{L}+$/u;

  // 'he / she' should be one word
  const combineSlashes = function (arr) {
    for (let i = 1; i < arr.length - 1; i++) {
      if (isSlash.test(arr[i])) {
        arr[i - 1] += arr[i] + arr[i + 1];
        arr[i] = null;
        arr[i + 1] = null;
      }
    }
    return arr
  };
  var combineSlashes$1 = combineSlashes;

  const wordlike = /\S/;
  const isBoundary = /^[!?.]+$/;
  const naiiveSplit = /(\S+)/;

  let notWord = [
    '.',
    '?',
    '!',
    ':',
    ';',
    '-',
    '–',
    '—',
    '--',
    '...',
    '(',
    ')',
    '[',
    ']',
    '"',
    "'",
    '`',
    '«',
    '»',
    '*',
    '•',
  ];
  notWord = notWord.reduce((h, c) => {
    h[c] = true;
    return h
  }, {});

  const isArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  };

  //turn a string into an array of strings (naiive for now, lumped later)
  const splitWords = function (str, model) {
    let result = [];
    let arr = [];
    //start with a naiive split
    str = str || '';
    if (typeof str === 'number') {
      str = String(str);
    }
    if (isArray(str)) {
      return str
    }
    const words = str.split(naiiveSplit);
    for (let i = 0; i < words.length; i++) {
      //split 'one-two'
      if (hasHyphen(words[i], model) === true) {
        arr = arr.concat(splitHyphens(words[i]));
        continue
      }
      arr.push(words[i]);
    }
    //greedy merge whitespace+arr to the right
    let carry = '';
    for (let i = 0; i < arr.length; i++) {
      let word = arr[i];
      //if it's more than a whitespace
      if (wordlike.test(word) === true && notWord.hasOwnProperty(word) === false && isBoundary.test(word) === false) {
        //put whitespace on end of previous term, if possible
        if (result.length > 0) {
          result[result.length - 1] += carry;
          result.push(word);
        } else {
          //otherwise, but whitespace before
          result.push(carry + word);
        }
        carry = '';
      } else {
        carry += word;
      }
    }
    //handle last one
    if (carry) {
      if (result.length === 0) {
        result[0] = '';
      }
      result[result.length - 1] += carry; //put it on the end
    }
    // combine 'one / two'
    result = combineSlashes$1(result);
    result = combineRanges$1(result);
    // remove empty results
    result = result.filter(s => s);
    return result
  };
  var splitTerms = splitWords;

  //all punctuation marks, from https://en.wikipedia.org/wiki/Punctuation

  //we have slightly different rules for start/end - like #hashtags.
  const isLetter = /\p{Letter}/u;
  const isNumber = /[\p{Number}\p{Currency_Symbol}]/u;
  const hasAcronym = /^[a-z]\.([a-z]\.)+/i;
  const chillin = /[sn]['’]$/;

  const normalizePunctuation = function (str, model) {
    // quick lookup for allowed pre/post punctuation
    let { prePunctuation, postPunctuation, emoticons } = model.one;
    let original = str;
    let pre = '';
    let post = '';
    let chars = Array.from(str);

    // punctuation-only words, like '<3'
    if (emoticons.hasOwnProperty(str.trim())) {
      return { str: str.trim(), pre, post: ' ' } //not great
    }

    // pop any punctuation off of the start
    let len = chars.length;
    for (let i = 0; i < len; i += 1) {
      let c = chars[0];
      // keep any declared chars
      if (prePunctuation[c] === true) {
        continue//keep it
      }
      // keep '+' or '-' only before a number
      if ((c === '+' || c === '-') && isNumber.test(chars[1])) {
        break//done
      }
      // '97 - year short-form
      if (c === "'" && c.length === 3 && isNumber.test(chars[1])) {
        break//done
      }
      // start of word
      if (isLetter.test(c) || isNumber.test(c)) {
        break //done
      }
      // punctuation
      pre += chars.shift();//keep going
    }

    // pop any punctuation off of the end
    len = chars.length;
    for (let i = 0; i < len; i += 1) {
      let c = chars[chars.length - 1];
      // keep any declared chars
      if (postPunctuation[c] === true) {
        continue//keep it
      }
      // start of word
      if (isLetter.test(c) || isNumber.test(c)) {
        break //done
      }
      // F.B.I.
      if (c === '.' && hasAcronym.test(original) === true) {
        continue//keep it
      }
      //  keep s-apostrophe - "flanders'" or "chillin'"
      if (c === "'" && chillin.test(original) === true) {
        continue//keep it
      }
      // punctuation
      post = chars.pop() + post;//keep going
    }

    str = chars.join('');
    //we went too far..
    if (str === '') {
      // do a very mild parse, and hope for the best.
      original = original.replace(/ *$/, after => {
        post = after || '';
        return ''
      });
      str = original;
      pre = '';
    }
    return { str, pre, post }
  };
  var tokenize$2 = normalizePunctuation;

  const parseTerm = (txt, model) => {
    // cleanup any punctuation as whitespace
    let { str, pre, post } = tokenize$2(txt, model);
    const parsed = {
      text: str,
      pre: pre,
      post: post,
      tags: new Set(),
    };
    return parsed
  };
  var splitWhitespace = parseTerm;

  // 'Björk' to 'Bjork'.
  const killUnicode = function (str, world) {
    const unicode = world.model.one.unicode || {};
    str = str || '';
    let chars = str.split('');
    chars.forEach((s, i) => {
      if (unicode[s]) {
        chars[i] = unicode[s];
      }
    });
    return chars.join('')
  };
  var killUnicode$1 = killUnicode;

  /** some basic operations on a string to reduce noise */
  const clean = function (str) {
    str = str || '';
    str = str.toLowerCase();
    str = str.trim();
    let original = str;
    //punctuation
    str = str.replace(/[,;.!?]+$/, '');
    //coerce Unicode ellipses
    str = str.replace(/\u2026/g, '...');
    //en-dash
    str = str.replace(/\u2013/g, '-');
    //strip leading & trailing grammatical punctuation
    if (/^[:;]/.test(str) === false) {
      str = str.replace(/\.{3,}$/g, '');
      str = str.replace(/[",.!:;?)]+$/g, '');
      str = str.replace(/^['"(]+/g, '');
    }
    // remove zero-width characters
    str = str.replace(/[\u200B-\u200D\uFEFF]/g, '');
    //do this again..
    str = str.trim();
    //oh shucks,
    if (str === '') {
      str = original;
    }
    //no-commas in numbers
    str = str.replace(/([0-9]),([0-9])/g, '$1$2');
    return str
  };
  var cleanup = clean;

  // do acronyms need to be ASCII?  ... kind of?
  const periodAcronym$1 = /([A-Z]\.)+[A-Z]?,?$/;
  const oneLetterAcronym$1 = /^[A-Z]\.,?$/;
  const noPeriodAcronym$1 = /[A-Z]{2,}('s|,)?$/;
  const lowerCaseAcronym$1 = /([a-z]\.)+[a-z]\.?$/;

  const isAcronym$2 = function (str) {
    //like N.D.A
    if (periodAcronym$1.test(str) === true) {
      return true
    }
    //like c.e.o
    if (lowerCaseAcronym$1.test(str) === true) {
      return true
    }
    //like 'F.'
    if (oneLetterAcronym$1.test(str) === true) {
      return true
    }
    //like NDA
    if (noPeriodAcronym$1.test(str) === true) {
      return true
    }
    return false
  };

  const doAcronym = function (str) {
    if (isAcronym$2(str)) {
      str = str.replace(/\./g, '');
    }
    return str
  };
  var doAcronyms = doAcronym;

  const normalize = function (term, world) {
    const killUnicode = world.methods.one.killUnicode;
    // console.log(world.methods.one)
    let str = term.text || '';
    str = cleanup(str);
    //(very) rough ASCII transliteration -  bjŏrk -> bjork
    str = killUnicode(str, world);
    str = doAcronyms(str);
    term.normal = str;
  };
  var normal = normalize;

  // turn a string input into a 'document' json format
  const parse$1 = function (input, world) {
    const { methods, model } = world;
    const { splitSentences, splitTerms, splitWhitespace } = methods.one.tokenize;
    input = input || '';
    // split into sentences
    let sentences = splitSentences(input, world);
    // split into word objects
    input = sentences.map((txt) => {
      let terms = splitTerms(txt, model);
      // split into [pre-text-post]
      terms = terms.map(t => splitWhitespace(t, model));
      // add normalized term format, always
      terms.forEach((t) => {
        normal(t, world);
      });
      return terms
    });
    return input
  };
  var fromString = parse$1;

  const isAcronym$1 = /[ .][A-Z]\.? *$/i; //asci - 'n.s.a.'
  const hasEllipse = /(?:\u2026|\.{2,}) *$/; // '...'
  const hasLetter = /\p{L}/u;
  const leadInit = /^[A-Z]\. $/; // "W. Kensington"

  /** does this look like a sentence? */
  const isSentence = function (str, abbrevs) {
    // must have a letter
    if (hasLetter.test(str) === false) {
      return false
    }
    // check for 'F.B.I.'
    if (isAcronym$1.test(str) === true) {
      return false
    }
    // check for leading initial - "W. Kensington"
    if (str.length === 3 && leadInit.test(str)) {
      return false
    }
    //check for '...'
    if (hasEllipse.test(str) === true) {
      return false
    }
    let txt = str.replace(/[.!?\u203D\u2E18\u203C\u2047-\u2049] *$/, '');
    let words = txt.split(' ');
    let lastWord = words[words.length - 1].toLowerCase();
    // check for 'Mr.'
    if (abbrevs.hasOwnProperty(lastWord) === true) {
      return false
    }
    // //check for jeopardy!
    // if (blacklist.hasOwnProperty(lastWord)) {
    //   return false
    // }
    return true
  };
  var isSentence$1 = isSentence;

  var methods$3 = {
    one: {
      killUnicode: killUnicode$1,
      tokenize: {
        splitSentences: splitSentences$1,
        isSentence: isSentence$1,
        splitTerms,
        splitWhitespace,
        fromString,
      },
    },
  };

  const aliases = {
    '&': 'and',
    '@': 'at',
    '%': 'percent',
    'plz': 'please',
    'bein': 'being',
  };
  var aliases$1 = aliases;

  var misc$2 = [
    'approx',
    'apt',
    'bc',
    'cyn',
    'eg',
    'esp',
    'est',
    'etc',
    'ex',
    'exp',
    'prob', //probably
    'pron', // Pronunciation
    'gal', //gallon
    'min',
    'pseud',
    'fig', //figure
    'jd',
    'lat', //latitude
    'lng', //longitude
    'vol', //volume
    'fm', //not am
    'def', //definition
    'misc',
    'plz', //please
    'ea', //each
    'ps',
    'sec', //second
    'pt',
    'pref', //preface
    'pl', //plural
    'pp', //pages
    'qt', //quarter
    'fr', //french
    'sq',
    'nee', //given name at birth
    'ss', //ship, or sections
    'tel',
    'temp',
    'vet',
    'ver', //version
    'fem', //feminine
    'masc', //masculine
    'eng', //engineering/english
    'adj', //adjective
    'vb', //verb
    'rb', //adverb
    'inf', //infinitive
    'situ', // in situ
    'vivo',
    'vitro',
    'wr', //world record
  ];

  var honorifics = [
    'adj',
    'adm',
    'adv',
    'asst',
    'atty',
    'bldg',
    'brig',
    'capt',
    'cmdr',
    'comdr',
    'cpl',
    'det',
    'dr',
    'esq',
    'gen',
    'gov',
    'hon',
    'jr',
    'llb',
    'lt',
    'maj',
    'messrs',
    'mlle',
    'mme',
    'mr',
    'mrs',
    'ms',
    'mstr',
    'phd',
    'prof',
    'pvt',
    'rep',
    'reps',
    'res',
    'rev',
    'sen',
    'sens',
    'sfc',
    'sgt',
    'sir',
    'sr',
    'supt',
    'surg'
    //miss
    //misses
  ];

  var months = ['jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];

  var nouns$2 = [
    'ad',
    'al',
    'arc',
    'ba',
    'bl',
    'ca',
    'cca',
    'col',
    'corp',
    'ft',
    'fy',
    'ie',
    'lit',
    'ma',
    'md',
    'pd',
    'tce',
  ];

  var organizations = ['dept', 'univ', 'assn', 'bros', 'inc', 'ltd', 'co'];

  var places = [
    'rd',
    'st',
    'dist',
    'mt',
    'ave',
    'blvd',
    'cl',
    // 'ct',
    'cres',
    'hwy',
    //states
    'ariz',
    'cal',
    'calif',
    'colo',
    'conn',
    'fla',
    'fl',
    'ga',
    'ida',
    'ia',
    'kan',
    'kans',

    'minn',
    'neb',
    'nebr',
    'okla',
    'penna',
    'penn',
    'pa',
    'dak',
    'tenn',
    'tex',
    'ut',
    'vt',
    'va',
    'wis',
    'wisc',
    'wy',
    'wyo',
    'usafa',
    'alta',
    'ont',
    'que',
    'sask',
  ];

  // units that are abbreviations too
  var units = [
    'dl',
    'ml',
    'gal',
    // 'ft', //ambiguous
    'qt',
    'pt',
    'tbl',
    'tsp',
    'tbsp',
    'km',
    'dm', //decimeter
    'cm',
    'mm',
    'mi',
    'td',
    'hr', //hour
    'hrs', //hour
    'kg',
    'hg',
    'dg', //decigram
    'cg', //centigram
    'mg', //milligram
    'µg', //microgram
    'lb', //pound
    'oz', //ounce
    'sq ft',
    'hz', //hertz
    'mps', //meters per second
    'mph',
    'kmph', //kilometers per hour
    'kb', //kilobyte
    'mb', //megabyte
    // 'gb', //ambig
    'tb', //terabyte
    'lx', //lux
    'lm', //lumen
    // 'pa', //ambig
    'fl oz', //
    'yb',
  ];

  // add our abbreviation list to our lexicon
  let list = [
    [misc$2],
    [units, 'Unit'],
    [nouns$2, 'Noun'],
    [honorifics, 'Honorific'],
    [months, 'Month'],
    [organizations, 'Organization'],
    [places, 'Place'],
  ];
  // create key-val for sentence-tokenizer
  let abbreviations = {};
  // add them to a future lexicon
  let lexicon$2 = {};

  list.forEach(a => {
    a[0].forEach(w => {
      // sentence abbrevs
      abbreviations[w] = true;
      // future-lexicon
      lexicon$2[w] = 'Abbreviation';
      if (a[1] !== undefined) {
        lexicon$2[w] = [lexicon$2[w], a[1]];
      }
    });
  });

  // dashed prefixes that are not independent words
  //  'mid-century', 'pre-history'
  var prefixes = [
    'anti',
    'bi',
    'co',
    'contra',
    'de',
    'extra',
    'infra',
    'inter',
    'intra',
    'macro',
    'micro',
    'mis',
    'mono',
    'multi',
    'peri',
    'pre',
    'pro',
    'proto',
    'pseudo',
    're',
    'sub',
    'supra',
    'trans',
    'tri',
    'un',
    'out', //out-lived
    'ex',//ex-wife

    // 'counter',
    // 'mid',
    // 'out',
    // 'non',
    // 'over',
    // 'post',
    // 'semi',
    // 'super', //'super-cool'
    // 'ultra', //'ulta-cool'
    // 'under',
    // 'whole',
  ].reduce((h, str) => {
    h[str] = true;
    return h
  }, {});

  // dashed suffixes that are not independent words
  //  'flower-like', 'president-elect'
  var suffixes = {
    'like': true,
    'ish': true,
    'less': true,
    'able': true,
    'elect': true,
    'type': true,
    'designate': true,
    // 'fold':true,
  };

  //a hugely-ignorant, and widely subjective transliteration of latin, cryllic, greek unicode characters to english ascii.
  //approximate visual (not semantic or phonetic) relationship between unicode and ascii characters
  //http://en.wikipedia.org/wiki/List_of_Unicode_characters
  //https://docs.google.com/spreadsheet/ccc?key=0Ah46z755j7cVdFRDM1A2YVpwa1ZYWlpJM2pQZ003M0E
  let compact$1 = {
    '!': '¡',
    '?': '¿Ɂ',
    '"': '“”"❝❞',
    "'": '‘‛❛❜’',
    '-': '—–',
    a: 'ªÀÁÂÃÄÅàáâãäåĀāĂăĄąǍǎǞǟǠǡǺǻȀȁȂȃȦȧȺΆΑΔΛάαλАаѦѧӐӑӒӓƛæ',
    b: 'ßþƀƁƂƃƄƅɃΒβϐϦБВЪЬвъьѢѣҌҍ',
    c: '¢©ÇçĆćĈĉĊċČčƆƇƈȻȼͻͼϲϹϽϾСсєҀҁҪҫ',
    d: 'ÐĎďĐđƉƊȡƋƌ',
    e: 'ÈÉÊËèéêëĒēĔĕĖėĘęĚěƐȄȅȆȇȨȩɆɇΈΕΞΣέεξϵЀЁЕеѐёҼҽҾҿӖӗ',
    f: 'ƑƒϜϝӺӻҒғſ',
    g: 'ĜĝĞğĠġĢģƓǤǥǦǧǴǵ',
    h: 'ĤĥĦħƕǶȞȟΉΗЂЊЋНнђћҢңҤҥҺһӉӊ',
    I: 'ÌÍÎÏ',
    i: 'ìíîïĨĩĪīĬĭĮįİıƖƗȈȉȊȋΊΐΪίιϊІЇії',
    j: 'ĴĵǰȷɈɉϳЈј',
    k: 'ĶķĸƘƙǨǩΚκЌЖКжкќҚқҜҝҞҟҠҡ',
    l: 'ĹĺĻļĽľĿŀŁłƚƪǀǏǐȴȽΙӀӏ',
    m: 'ΜϺϻМмӍӎ',
    n: 'ÑñŃńŅņŇňŉŊŋƝƞǸǹȠȵΝΠήηϞЍИЙЛПийлпѝҊҋӅӆӢӣӤӥπ',
    o: 'ÒÓÔÕÖØðòóôõöøŌōŎŏŐőƟƠơǑǒǪǫǬǭǾǿȌȍȎȏȪȫȬȭȮȯȰȱΌΘΟθοσόϕϘϙϬϴОФоѲѳӦӧӨөӪӫ',
    p: 'ƤΡρϷϸϼРрҎҏÞ',
    q: 'Ɋɋ',
    r: 'ŔŕŖŗŘřƦȐȑȒȓɌɍЃГЯгяѓҐґ',
    s: 'ŚśŜŝŞşŠšƧƨȘșȿЅѕ',
    t: 'ŢţŤťŦŧƫƬƭƮȚțȶȾΓΤτϮТт',
    u: 'ÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųƯưƱƲǓǔǕǖǗǘǙǚǛǜȔȕȖȗɄΰυϋύ',
    v: 'νѴѵѶѷ',
    w: 'ŴŵƜωώϖϢϣШЩшщѡѿ',
    x: '×ΧχϗϰХхҲҳӼӽӾӿ',
    y: 'ÝýÿŶŷŸƳƴȲȳɎɏΎΥΫγψϒϓϔЎУучўѰѱҮүҰұӮӯӰӱӲӳ',
    z: 'ŹźŻżŽžƵƶȤȥɀΖ',
  };
  //decompress data into two hashes
  let unicode$2 = {};
  Object.keys(compact$1).forEach(function (k) {
    compact$1[k].split('').forEach(function (s) {
      unicode$2[s] = k;
    });
  });
  var unicode$3 = unicode$2;

  // https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7Bpunctuation%7D

  // punctuation to keep at start of word
  const prePunctuation = {
    '#': true, //#hastag
    '@': true, //@atmention
    '_': true,//underscore
    '°': true,
    // '+': true,//+4
    // '\\-',//-4  (escape)
    // '.',//.4
    // zero-width chars
    '\u200B': true,
    '\u200C': true,
    '\u200D': true,
    '\uFEFF': true
  };

  // punctuation to keep at end of word
  const postPunctuation = {
    '%': true,//88%
    '_': true,//underscore
    '°': true,//degrees, italian ordinal
    // '\'',// sometimes
    // zero-width chars
    '\u200B': true,
    '\u200C': true,
    '\u200D': true,
    '\uFEFF': true
  };

  const emoticons = {
    '<3': true,
    '</3': true,
    '<\\3': true,
    ':^P': true,
    ':^p': true,
    ':^O': true,
    ':^3': true,
  };

  var model$4 = {
    one: {
      aliases: aliases$1,
      abbreviations,
      prefixes,
      suffixes,
      prePunctuation,
      postPunctuation,
      lexicon: lexicon$2, //give this one forward
      unicode: unicode$3,
      emoticons
    },
  };

  const hasSlash = /\//;
  const hasDomain = /[a-z]\.[a-z]/i;
  const isMath = /[0-9]/;
  // const hasSlash = /[a-z\u00C0-\u00FF] ?\/ ?[a-z\u00C0-\u00FF]/
  // const hasApostrophe = /['’]s$/

  const addAliases = function (term, world) {
    let str = term.normal || term.text || term.machine;
    const aliases = world.model.one.aliases;
    // lookup known aliases like '&'
    if (aliases.hasOwnProperty(str)) {
      term.alias = term.alias || [];
      term.alias.push(aliases[str]);
    }
    // support slashes as aliases
    if (hasSlash.test(str) && !hasDomain.test(str) && !isMath.test(str)) {
      let arr = str.split(hasSlash);
      // don't split urls and things
      if (arr.length <= 2) {
        arr.forEach(word => {
          word = word.trim();
          if (word !== '') {
            term.alias = term.alias || [];
            term.alias.push(word);
          }
        });
      }
    }
    // aliases for apostrophe-s
    // if (hasApostrophe.test(str)) {
    //   let main = str.replace(hasApostrophe, '').trim()
    //   term.alias = term.alias || []
    //   term.alias.push(main)
    // }
    return term
  };
  var alias = addAliases;

  const hasDash$1 = /^\p{Letter}+-\p{Letter}+$/u;
  // 'machine' is a normalized form that looses human-readability
  const doMachine$1 = function (term) {
    let str = term.implicit || term.normal || term.text;
    // remove apostrophes
    str = str.replace(/['’]s$/, '');
    str = str.replace(/s['’]$/, 's');
    //lookin'->looking (make it easier for conjugation)
    str = str.replace(/([aeiou][ktrp])in'$/, '$1ing');
    //turn re-enactment to reenactment
    if (hasDash$1.test(str)) {
      str = str.replace(/-/g, '');
    }
    //#tags, @mentions
    str = str.replace(/^[#@]/, '');
    if (str !== term.normal) {
      term.machine = str;
    }
  };
  var machine$1 = doMachine$1;

  // sort words by frequency
  const freq = function (view) {
    let docs = view.docs;
    let counts = {};
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        let term = docs[i][t];
        let word = term.machine || term.normal;
        counts[word] = counts[word] || 0;
        counts[word] += 1;
      }
    }
    // add counts on each term
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        let term = docs[i][t];
        let word = term.machine || term.normal;
        term.freq = counts[word];
      }
    }
  };
  var freq$1 = freq;

  // get all character startings in doc
  const offset = function (view) {
    let elapsed = 0;
    let index = 0;
    let docs = view.document; //start from the actual-top
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        let term = docs[i][t];
        term.offset = {
          index: index,
          start: elapsed + term.pre.length,
          length: term.text.length,
        };
        elapsed += term.pre.length + term.text.length + term.post.length;
        index += 1;
      }
    }
  };


  var offset$1 = offset;

  // cheat- add the document's pointer to the terms
  const index = function (view) {
    // console.log('reindex')
    let document = view.document;
    for (let n = 0; n < document.length; n += 1) {
      for (let i = 0; i < document[n].length; i += 1) {
        document[n][i].index = [n, i];
      }
    }
    // let ptrs = b.fullPointer
    // console.log(ptrs)
    // for (let i = 0; i < docs.length; i += 1) {
    //   const [n, start] = ptrs[i]
    //   for (let t = 0; t < docs[i].length; t += 1) {
    //     let term = docs[i][t]
    //     term.index = [n, start + t]
    //   }
    // }
  };

  var index$1 = index;

  const wordCount = function (view) {
    let n = 0;
    let docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        if (docs[i][t].normal === '') {
          continue //skip implicit words
        }
        n += 1;
        docs[i][t].wordCount = n;
      }
    }
  };

  var wordCount$1 = wordCount;

  // cheat-method for a quick loop
  const termLoop$1 = function (view, fn) {
    let docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        fn(docs[i][t], view.world);
      }
    }
  };

  const methods$2 = {
    alias: (view) => termLoop$1(view, alias),
    machine: (view) => termLoop$1(view, machine$1),
    normal: (view) => termLoop$1(view, normal),
    freq: freq$1,
    offset: offset$1,
    index: index$1,
    wordCount: wordCount$1,
  };
  var compute$2 = methods$2;

  var tokenize$1 = {
    compute: compute$2,
    methods: methods$3,
    model: model$4,
    hooks: ['alias', 'machine', 'index', 'id'],
  };

  // const plugin = function (world) {
  //   let { methods, model, parsers } = world
  //   Object.assign({}, methods, _methods)
  //   Object.assign(model, _model)
  //   methods.one.tokenize.fromString = tokenize
  //   parsers.push('normal')
  //   parsers.push('alias')
  //   parsers.push('machine')
  //   // extend View class
  //   // addMethods(View)
  // }
  // export default plugin

  // lookup last word in the type-ahead prefixes
  const typeahead$1 = function (view) {
    const prefixes = view.model.one.typeahead;
    const docs = view.docs;
    if (docs.length === 0 || Object.keys(prefixes).length === 0) {
      return
    }
    let lastPhrase = docs[docs.length - 1] || [];
    let lastTerm = lastPhrase[lastPhrase.length - 1];
    // if we've already put whitespace, end.
    if (lastTerm.post) {
      return
    }
    // if we found something
    if (prefixes.hasOwnProperty(lastTerm.normal)) {
      let found = prefixes[lastTerm.normal];
      // add full-word as an implicit result
      lastTerm.implicit = found;
      lastTerm.machine = found;
      lastTerm.typeahead = true;
      // tag it, as our assumed term
      if (view.compute.preTagger) {
        view.last().unTag('*').compute(['lexicon', 'preTagger']);
      }
    }
  };

  var compute$1 = { typeahead: typeahead$1 };

  // assume any discovered prefixes
  const autoFill = function () {
    const docs = this.docs;
    if (docs.length === 0) {
      return this
    }
    let lastPhrase = docs[docs.length - 1] || [];
    let term = lastPhrase[lastPhrase.length - 1];
    if (term.typeahead === true && term.machine) {
      term.text = term.machine;
      term.normal = term.machine;
    }
    return this
  };

  const api$c = function (View) {
    View.prototype.autoFill = autoFill;
  };
  var api$d = api$c;

  // generate all the possible prefixes up-front
  const getPrefixes = function (arr, opts, world) {
    let index = {};
    let collisions = [];
    let existing = world.prefixes || {};
    arr.forEach((str) => {
      str = str.toLowerCase().trim();
      let max = str.length;
      if (opts.max && max > opts.max) {
        max = opts.max;
      }
      for (let size = opts.min; size < max; size += 1) {
        let prefix = str.substring(0, size);
        // ensure prefix is not a word
        if (opts.safe && world.model.one.lexicon.hasOwnProperty(prefix)) {
          continue
        }
        // does it already exist?
        if (existing.hasOwnProperty(prefix) === true) {
          collisions.push(prefix);
          continue
        }
        if (index.hasOwnProperty(prefix) === true) {
          collisions.push(prefix);
          continue
        }
        index[prefix] = str;
      }
    });
    // merge with existing prefixes
    index = Object.assign({}, existing, index);
    // remove ambiguous-prefixes
    collisions.forEach((str) => {
      delete index[str];
    });
    return index
  };

  var allPrefixes = getPrefixes;

  const isObject = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  const defaults = {
    safe: true,
    min: 3,
  };

  const prepare = function (words = [], opts = {}) {
    let model = this.model();
    opts = Object.assign({}, defaults, opts);
    if (isObject(words)) {
      Object.assign(model.one.lexicon, words);
      words = Object.keys(words);
    }
    let prefixes = allPrefixes(words, opts, this.world());
    // manually combine these with any existing prefixes
    Object.keys(prefixes).forEach(str => {
      // explode any overlaps
      if (model.one.typeahead.hasOwnProperty(str)) {
        delete model.one.typeahead[str];
        return
      }
      model.one.typeahead[str] = prefixes[str];
    });
    return this
  };

  var lib = {
    typeahead: prepare
  };

  const model$3 = {
    one: {
      typeahead: {} //set a blank key-val
    }
  };
  var typeahead = {
    model: model$3,
    api: api$d,
    lib,
    compute: compute$1,
    hooks: ['typeahead']
  };

  // order here matters
  nlp$1.extend(change); //0kb
  nlp$1.extend(output); //0kb
  nlp$1.extend(match); //10kb
  nlp$1.extend(pointers); //2kb
  nlp$1.extend(tag); //2kb
  nlp$1.plugin(contractions$2); //~6kb
  nlp$1.extend(tokenize$1); //7kb
  nlp$1.plugin(cache$1); //~1kb
  nlp$1.extend(lookup); //7kb
  nlp$1.extend(typeahead); //1kb
  nlp$1.extend(lexicon$3); //1kb
  nlp$1.extend(sweep); //1kb

  //a hugely-ignorant, and widely subjective transliteration of latin, cryllic, greek unicode characters to english ascii.
  //approximate visual (not semantic or phonetic) relationship between unicode and ascii characters
  //http://en.wikipedia.org/wiki/List_of_Unicode_characters
  //https://docs.google.com/spreadsheet/ccc?key=0Ah46z755j7cVdFRDM1A2YVpwa1ZYWlpJM2pQZ003M0E


  // allowed french symbols
  // ç – la cédille (the cedilla)
  // é – l'accent aigu (the acute accent)
  // â/ê/î/ô/û – l'accent circonflexe (the circumflex)
  // à/è/ì/ò/ù – l'accent grave (the grave accent)
  // ë/ï/ü 
  let compact = {
    '!': '¡',
    '?': '¿Ɂ',
    '"': '“”"❝❞',
    "'": '‘‛❛❜’',
    '-': '—–',
    a: 'ªÁÃÄÅáãäåĀāĂăĄąǍǎǞǟǠǡǺǻȀȁȂȃȦȧȺΆΑΔΛάαλАаѦѧӐӑӒӓƛæ',
    b: 'ßþƀƁƂƃƄƅɃΒβϐϦБВЪЬвъьѢѣҌҍ',
    c: '¢©ĆćĈĉĊċČčƆƇƈȻȼͻͼϲϹϽϾСсєҀҁҪҫ',
    d: 'ÐĎďĐđƉƊȡƋƌ',
    e: 'ĒēĔĕĖėĘęĚěƐȄȅȆȇȨȩɆɇΈΕΞΣέεξϵЀЁЕеѐёҼҽҾҿӖӗ',
    f: 'ƑƒϜϝӺӻҒғſ',
    g: 'ĜĝĞğĠġĢģƓǤǥǦǧǴǵ',
    h: 'ĤĥĦħƕǶȞȟΉΗЂЊЋНнђћҢңҤҥҺһӉӊ',
    I: 'Í',
    i: 'íĨĩĪīĬĭĮįİıƖƗȈȉȊȋΊΐΪίιϊІЇії',
    j: 'ĴĵǰȷɈɉϳЈј',
    k: 'ĶķĸƘƙǨǩΚκЌЖКжкќҚқҜҝҞҟҠҡ',
    l: 'ĹĺĻļĽľĿŀŁłƚƪǀǏǐȴȽΙӀӏ',
    m: 'ΜϺϻМмӍӎ',
    n: 'ÑñŃńŅņŇňŉŊŋƝƞǸǹȠȵΝΠήηϞЍИЙЛПийлпѝҊҋӅӆӢӣӤӥπ',
    o: 'ÓÕÖØðóõöøŌōŎŏŐőƟƠơǑǒǪǫǬǭǾǿȌȍȎȏȪȫȬȭȮȯȰȱΌΘΟθοσόϕϘϙϬϴОФоѲѳӦӧӨөӪӫ',
    p: 'ƤΡρϷϸϼРрҎҏÞ',
    q: 'Ɋɋ',
    r: 'ŔŕŖŗŘřƦȐȑȒȓɌɍЃГЯгяѓҐґ',
    s: 'ŚśŜŝŞşŠšƧƨȘșȿЅѕ',
    t: 'ŢţŤťŦŧƫƬƭƮȚțȶȾΓΤτϮТт',
    u: 'µÚúŨũŪūŬŭŮůŰűŲųƯưƱƲǓǔǕǖǗǘǙǚǛǜȔȕȖȗɄΰμυϋύ',
    v: 'νѴѵѶѷ',
    w: 'ŴŵƜωώϖϢϣШЩшщѡѿ',
    x: '×ΧχϗϰХхҲҳӼӽӾӿ',
    y: 'ÝýÿŶŷŸƳƴȲȳɎɏΎΥΫγψϒϓϔЎУучўѰѱҮүҰұӮӯӰӱӲӳ',
    z: 'ŹźŻżŽžƵƶȤȥɀΖ',
    oe: 'œ',
  };
  //decompress data into two hashes
  let unicode = {};
  Object.keys(compact).forEach(function (k) {
    compact[k].split('').forEach(function (s) {
      unicode[s] = k;
    });
  });

  var unicode$1 = unicode;

  var contractions$1 = [
    { word: "qu'il", out: ['que', 'il'] },
    { word: "n'y", out: ['ne', 'a'] },
    { word: "n'est", out: ['ne', 'est'] },
    { word: 'aux', out: ['à', 'les'] },
    { word: 'au', out: ['à', 'le'] },
    { before: 'm', out: ['me'] },
    { before: 's', out: ['se'] },
    { before: 't', out: ['tu'] },
    { before: 'n', out: ['ne'] },
    { before: 'qu', out: ['que'] },//tant qu'étudiant
    { before: 'puisqu', out: ['puisque'] },
    { before: 'lorsqu', out: ['lorsque'] },//lorsqu’il
    { before: 'jusqu', out: ['jusque'] },//jusqu'en
    { before: 'quelqu', out: ['quelque'] },//Quelqu'un

    { word: 'auquel', out: ['à', 'lequel'] },
    { word: 'auxquels', out: ['à', 'lesquels'] },
    { word: 'auxquelles', out: ['à', 'lesquelles'] },
    { word: 'duquel', out: ['de', 'lequel'] },
    { word: 'desquels', out: ['de', 'lesquels'] },
    { word: 'desquelles', out: ['de', 'lesquelles'] },
  ];

  const hasDash = /^\p{Letter}+-\p{Letter}+$/u;
  // 'machine' is a normalized form that looses human-readability
  const doMachine = function (term) {
    let str = term.implicit || term.normal || term.text;
    // remove apostrophes
    str = str.replace(/['’]s$/, '');
    str = str.replace(/s['’]$/, 's');
    //lookin'->looking (make it easier for conjugation)
    str = str.replace(/([aeiou][ktrp])in'$/, '$1ing');
    //turn re-enactment to reenactment
    if (hasDash.test(str)) {
      str = str.replace(/-/g, '');
    }
    // remove accented chars
    // str = str.replace(/è/g, 'e')
    //#tags, @mentions
    str = str.replace(/^[#@]/, '');
    if (str !== term.normal) {
      term.machine = str;
    }
  };
  var machine = doMachine;

  // cheat-method for a quick loop
  const termLoop = function (view, fn) {
    let docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        fn(docs[i][t], view.world);
      }
    }
  };
  var compute = {
    machine: (view) => termLoop(view, machine),
  };

  var tokenize = {
    mutate: (world) => {
      world.model.one.unicode = unicode$1;

      world.model.one.contractions = contractions$1;
    },
    compute
  };

  // 01- full-word exceptions
  const checkEx = function (str, ex = {}) {
    if (ex.hasOwnProperty(str)) {
      return ex[str]
    }
    return null
  };

  // 02- suffixes that pass our word through
  const checkSame = function (str, same = []) {
    for (let i = 0; i < same.length; i += 1) {
      if (str.endsWith(same[i])) {
        return str
      }
    }
    return null
  };

  // 03- check rules - longest first
  const checkRules = function (str, fwd, both = {}) {
    fwd = fwd || {};
    let max = str.length - 1;
    // look for a matching suffix
    for (let i = max; i >= 1; i -= 1) {
      let size = str.length - i;
      let suff = str.substring(size, str.length);
      // check fwd rules, first
      if (fwd.hasOwnProperty(suff) === true) {
        return str.slice(0, size) + fwd[suff]
      }
      // check shared rules
      if (both.hasOwnProperty(suff) === true) {
        return str.slice(0, size) + both[suff]
      }
    }
    // try a fallback transform
    if (fwd.hasOwnProperty('')) {
      return str += fwd['']
    }
    if (both.hasOwnProperty('')) {
      return str += both['']
    }
    return null
  };

  //sweep-through all suffixes
  const convert = function (str = '', model = {}) {
    // 01- check exceptions
    let out = checkEx(str, model.ex);
    // 02 - check same
    out = out || checkSame(str, model.same);
    // check forward and both rules
    out = out || checkRules(str, model.fwd, model.both);
    //return unchanged
    out = out || str;
    return out
  };
  var convert$1 = convert;

  const flipObj = function (obj) {
    return Object.entries(obj).reduce((h, a) => {
      h[a[1]] = a[0];
      return h
    }, {})
  };

  const reverse = function (model = {}) {
    return {
      reversed: true,
      // keep these two
      both: flipObj(model.both),
      ex: flipObj(model.ex),
      // swap this one in
      fwd: model.rev || {}
    }
  };
  var reverse$1 = reverse;

  const prefix = /^([0-9]+)/;

  const toObject = function (txt) {
    let obj = {};
    txt.split('¦').forEach(str => {
      let [key, vals] = str.split(':');
      vals = (vals || '').split(',');
      vals.forEach(val => {
        obj[val] = key;
      });
    });
    return obj
  };

  const growObject = function (key = '', val = '') {
    val = String(val);
    let m = val.match(prefix);
    if (m === null) {
      return val
    }
    let num = Number(m[1]) || 0;
    let pre = key.substring(0, num);
    let full = pre + val.replace(prefix, '');
    return full
  };

  const unpackOne = function (str) {
    let obj = toObject(str);
    return Object.keys(obj).reduce((h, k) => {
      h[k] = growObject(k, obj[k]);
      return h
    }, {})
  };

  const uncompress = function (model = {}) {
    if (typeof model === 'string') {
      model = JSON.parse(model);
    }
    model.fwd = unpackOne(model.fwd || '');
    model.both = unpackOne(model.both || '');
    model.rev = unpackOne(model.rev || '');
    model.ex = unpackOne(model.ex || '');
    return model
  };
  var uncompress$1 = uncompress;

  // generated in ./lib/models
  var packed = {
    "noun": {
      "plural": {
        "fwd": "s:¦oeurs:œur,œurs¦ses:x¦2x:au¦2ux:ial,éal,vail¦2es:is¦5es:ustin",
        "both": "5ses:yageur,ordeur,celeur¦5rices:lisateur,locuteur,ommateur¦5ères:apetier¦4rices:dacteur,venteur,ucateur,nnateur¦4es:féré,rmal,dian¦4nes:bien¦4ux:pital¦4ses:ileur,aneur¦4x:eveu,ijou¦4ves:aptif¦3ux:otal,étal,oral,éral,eval,imal¦3es:tué,han¦3x:jeu,ieu,hou,lou¦3rices:éateur¦2ux:pal,cal,nal¦oeux:œu¦oeuds:œud¦oeuvres:œuvre¦oeufs:œuf",
        "rev": "1:ns,ts,és,rs,us,is,as,ms,ls,cs,ks,os,gs,ys,ps,bs,ws,hs¦2:ges,tes,ies,des,hes,mes,ifs,efs,ues,xes,pes,bes,rds,nds,rfs,ids,oux,fes,yes,eds,afs,ïds,ees¦3:lles,nces,hées,ires,ares,gles,ines,lées,ones,rres,ules,tres,nées,ènes,ures,iles,cles,ores,lnes,mnes,rses,ises,eaux,oles,oses,lves,rnes,yaux,sses,bles,bres,pres,aces,ases,dres,înes,cres,sées,fres,èles,rces,unes,rves,ôles,dées,uves,nses,vées,ples,pses,èves,gnes,aves,bées,ênes,nres,uaux,èses,tées,âles,rles,ûres,oces,cées,èces,rofs,uces,ônes,êves,yles,sces¦4:lyses,dices,rmées,tères,hères,pices,nanes,canes,riaux,onnes,ouses,tanes,lices,tales,auses,éales,èvres,fères,muses,dales,rives,uanes,cales,mères,nantes,gères,cices,iales,ranes,léaux,yères,gales,cives,tices,ivres,annes,vaises,manes,sères,quées,vices,fices,sanes,fanes,rales,pères,pales,irées,sales,cères¦5:ulantes,rières,avanes,nières,uffles,abanes,dières,frères,atives,imales,onales,ctives,ndives,lières,inales,sières,meuses,onaises,ivrées,mières,éduses,yennes,rganes,auvres,oupées,écoises,idives,vières,olives¦1œur:hoeurs¦2eur:utrices,itrices,ctrices¦3r:heuses,ueuses,deuses,seuses¦3l:déaux,ivaux¦3eur:matrices¦3il:avaux¦4eur:tratrices¦4l:rciaux¦4r:lleuses,rteuses¦4x:gieuses¦5x:gineuses¦5eur:dicatrices",
        "ex": "yeux:œil¦oeillets:œillet¦oeilletons:œilleton¦oestrogènes:œstrogène¦oeufs:œuf¦oeuvres:œuvre¦11rices:administrateur¦8es:ambulant,augustin¦8ses:chercheur,cueilleur,demandeur¦9rices:distributeur¦10es:enseignant¦7ses:faucheur¦3x:feu,jeu,pou,eau¦5x:genou,hibou¦8rices:informateur¦5ses:joueur¦2ux:mal¦5rices:moniteur¦6ses:pondeur,porteur,tisseur¦7rices:producteur¦10rices:revendicateur¦4ux:rival¦2es:un¦3s:ale,île,ive¦7s:antenne,convive,litière,matière,matrice,pieuvre,rentrée,rizière¦10s:arpenteuse,bleuetière,locomotive,obsidienne¦5s:bière,bouée,durée,frère,marée,olive,purée¦4s:buse,cale,cane,fane,mère,pale,père,rive,ruse,veuf,vice¦9s:chargeuse,cicatrice,cimetière,frontière,gouttière,nébuleuse,sénatrice¦12s:charpentière¦1oeurs:cœur,mœurs,sœur¦6s:denrée,entrée,excuse,rangée¦11s:diapositive,visionneuse¦8s:éolienne¦2s:if¦13s:photocopieuse"
      }
    },
    "adjective": {
      "female": {
        "fwd": "1:e¦lle:au¦ue:û¦se:x¦1e:d¦1que:ïc¦1ue:g¦2se:as¦2e:un,ir,ur,ul,ar,ol¦2te:oi¦3e:ril",
        "both": "1:m,p¦2:pa,or,uo¦3:cho¦4:colo¦5te:illot,avori¦5ne:aysan¦5e:ormon,onfus¦5se:dalou¦4e:atil,btil,idon¦4te:olet,pret,âlot,llet,eret,luet,quet,ulot,elet¦4sse:ître¦4le:ntil¦4ète:omplet¦3te:jet,net,det¦3ète:eplet¦3que:blic,rec¦3e:cis,pon,mis,dou,uis,ris,vil,leu¦3le:eil¦3he:anc¦3gne:énin¦2e:cu,çu,ûr,yr,pu,vu,fu,bu,mu,hu,su,du,an,nu,al,in,ru,lu,tu¦2se:os¦2sse:aux,ta¦2ète:suet,cret¦2ne:on,en¦2ë:gu¦2le:el¦1que:rc¦1ète:iet¦1e:ï,i,t,é¦1îche:ais¦1ève:ref¦ère:er¦ve:f",
        "rev": "1:o,tte,c¦2:me,nde,rde,ge,ze,ude,be,xe,pe,oue¦3:ble,lte,gre,ire,oce,gle,rre,rune,bre,mune,tre,nse,ôle,ace,nole,rne,ade,èle,ide,oide,rasse,tune,vre,ongue,oule,yare,nce,gole,cure,âle,phe,ice,olote,ose,eule,ple,dre¦4:iste,thée,bile,cile,ïste,lite,aste,gile,uture,sque,nête,paire,èque,aune,uste,âche,isse,uche,cule,este,ogue,oche,oque,vère,ague,irile¦5:surde,tique,mique,sique,fique,nique,vique,lasse,crate,ingue,xique,pique,ivole,hique,stile,ature,utile,énile,gique,dique,rique,ncère,uille¦ec:èche¦1x:uce¦1u:olle¦2c:aïque¦2n:ligne¦2au:velle,celle,gelle¦2x:euse",
        "ex": "3:bio¦4:chic,apte,hâte,rare,sale¦5:digne,fonde,jeune,riche,utile¦6:chauve,propre¦7:fertile,stérile¦8:chouette,commande,continue,enceinte,héroïque,patriote,prospère¦9:disparate,idyllique¦10:alcoolique,initiative,symbolique¦4te:blet,muet¦3ce:doux¦4e:flou,cool,laid,noir,pair¦2lle:fou,beau¦2e:lu,nu,tu,vu¦4gne:malin¦3e:mou,vil,dur,nul,pur,sur¦3te:net,sot,coi¦6te:rigolo¦1èche:sec¦7te:simplet¦5e:tabou,clair,impur¦3se:bas¦1ue:dû¦5se:jaloux¦6e:puéril"
      },
      "plural": {
        "fwd": "1:s,x¦s:¦us:û¦2x:au",
        "both": "5ux:énatal¦4ux:gétal,macal,arcal,rutal¦3ux:ocal,otal,ival,stal,éval,etal,scal,ital,ntal,ccal,ical¦2ux:bal,çal,xal,yal,éal,dal,pal,gal,sal,ial,mal,ral,nal",
        "rev": "3:eaux,oux,ras,ros,eux¦4:pris,quis,umis¦5:onfus¦:s¦2l:caux,haux",
        "ex": "3:bas¦4:faux,gris¦5:frais¦6:précis¦4ux:ducal,fécal¦2ux:mal¦8ux:triomphal¦1us:dû"
      },
      "femalePlural": {
        "fwd": "lles:au¦ues:û¦ses:x¦1s:e¦1es:d¦1ques:ïc¦1ues:g¦2ses:as¦2es:un,ir,ur,ul,ar,ol¦2tes:oi¦3es:ril",
        "both": "5tes:illot,avori¦5nes:aysan¦5es:ormon,onfus¦5ses:dalou¦4es:atil,btil,idon¦4tes:olet,pret,âlot,llet,eret,luet,quet,ulot,elet¦4sses:ître¦4les:ntil¦4s:colo¦4ètes:omplet¦3tes:jet,net,det¦3ètes:eplet¦3ques:blic,rec¦3es:cis,pon,mis,dou,uis,ris,vil,leu¦3les:eil¦3s:cho¦3hes:anc¦3gnes:énin¦2es:cu,çu,ûr,yr,pu,vu,fu,bu,mu,hu,su,du,an,nu,al,in,ru,lu,tu¦2s:pa,or,uo¦2ses:os¦2sses:aux,ta¦2ètes:suet,cret¦2nes:on,en¦2ës:gu¦2les:el¦1ques:rc¦1ètes:iet¦1es:ï,i,t,é¦1îches:ais¦1s:m,p¦1èves:ref¦ères:er¦ves:f",
        "rev": "1:os,ttes,cs¦2:mes,ndes,rdes,ges,zes,udes,bes,xes,pes,oues¦3:bles,ltes,gres,ires,oces,gles,rres,runes,bres,munes,tres,nses,ôles,aces,noles,rnes,ades,èles,ides,oides,rasses,tunes,vres,ongues,oules,yares,nces,goles,cures,âles,phes,ices,olotes,oses,eules,ples,dres¦4:istes,thées,biles,ciles,ïstes,lites,astes,giles,utures,sques,nêtes,paires,èques,aunes,ustes,âches,isses,uches,cules,estes,ogues,oches,oques,vères,agues,iriles¦5:surdes,tiques,miques,siques,fiques,niques,viques,lasses,crates,ingues,xiques,piques,ivoles,hiques,stiles,atures,utiles,éniles,giques,diques,riques,ncères,uilles¦ec:èches¦1x:uces¦1u:olles¦2c:aïques¦2n:lignes¦2au:velles,celles,gelles¦2x:euses",
        "ex": "3s:bio¦4tes:blet,muet¦4s:chic,apte,hâte,rare,sale¦3ces:doux¦4es:flou,cool,laid,noir,pair¦2lles:fou,beau¦2es:lu,nu,tu,vu¦4gnes:malin¦3es:mou,vil,dur,nul,pur,sur¦3tes:net,sot,coi¦6tes:rigolo¦1èches:sec¦7tes:simplet¦5es:tabou,clair,impur¦10s:alcoolique,initiative,symbolique¦3ses:bas¦6s:chauve,propre¦8s:chouette,commande,continue,enceinte,héroïque,patriote,prospère¦5s:digne,fonde,jeune,riche,utile¦9s:disparate,idyllique¦1ues:dû¦7s:fertile,stérile¦5ses:jaloux¦6es:puéril"
      }
    },
    "futureTense": {
      "je": {
        "fwd": "errai:érir¦ai:e¦épartirai:epartir¦îtrai:itre¦1udrai:aloir¦1drai:uloir¦2rai:erir¦3ai:dir,uir¦3lerai:peler¦4ai:ller,tter",
        "both": "5ai:ucier,erver,rtrir,anier,ncier,ouser,itier,seyer,eurir,cuser,plier,laner,upler,auser,llier,blier,ertir,nchir,utier,psier,mbrir,ouver,buser,euver,rvoir,ortir,évoir,arler,téger¦4ai:vrir,frir,unir,ager,grir,aver,uger,stir,over,lser,nnir,ater,iger,blir,oler,rnir,fler,gner,iner,fier,oser,acer,gter,rger,nser,cter,bler,rcer,rrir,ayer,aler,iser,drir,ttir,ster,inir,iver,rier,rner,oter,plir,pter,utir,iter,aser,nner,olir,êtir,soir,eoir,ntir,énir,ncer,uler,nter,rser,uter,sser,rter,nger,gler,écer¦4rai:mouvoir¦3ai:bir,wer,zer,cir,xer,per,pir,gir,mer,mir,vir,sir,der,uer,rer,her,ber¦3lerai:celer,veler¦3rai:cevoir¦2udrai:faillir¦2êterai:rreter¦2èlerai:rteler¦2èterai:aleter,ureter¦2trai:âtre¦2ai:ïr¦2rai:urir¦2errai:nvoyer¦1errai:hoir¦1égerai:ieger¦1èlerai:deler¦1erai:faire¦1ènerai:mener,sener¦1urai:avoir¦1ierai:uyer,oyer¦1èterai:heter¦échirai:echir¦éerai:eer¦écierai:ecier¦èverai:ever¦iendrai:enir¦èserai:eser¦ècerai:ecer",
        "rev": "3:lirai,yerai¦4:ogerai,ndirai,userai,anerai,hierai,enerai,rlerai,ouirai,guirai,dierai¦5:otterai,ocierai,urdirai,enierai,atterai,allerai,utterai,icierai¦eler:èlerai¦evrer:èvrerai¦ener:ènerai¦2oir:uvrai,evrai,everrai¦2loir:vaudrai¦2e:orai,prai,crai¦2itre:raîtrai¦3e:atrai,lurai,firai,utrai,airai,ivrai,rdrai¦3er:tellerai,letterai¦3loir:voudrai¦4ir:eillerai¦4e:oîtrai,udirai,indrai,andrai,roirai,ettrai,ondrai,duirai,ruirai,crirai,attrai¦4er:ppellerai¦5e:oncirai,naîtrai,soudrai,rendrai,cendrai,pendrai,tendrai",
        "ex": "irai:aller¦serai:être¦1èlerai:geler,peler¦3terai:jeter¦1èvrerai:sevrer¦1ierai:oyer¦4erai:montrer¦1urai:avoir¦8ai:départir,bouillir,associer,diffuser,embellir,vieillir,officier,babiller,fouetter,habiller,interdire¦4rai:mouvoir¦6ai:partir,renier,hurler,mollir,verdir,sourire¦3rrai:pouvoir¦6erai:cueillir¦3rai:devoir¦9ai:assaillir¦1errai:voir¦1erai:faire¦7ai:abroger,limoger,mendier,repaître,bailler,revendre,guetter¦5lerai:atteler,bateler¦4ai:oser,user,fier,lier,nier,ayer,fuir,frire,boire,crire,luire,nuire,cuire¦5ai:paner,plier,faner,fuser,gener,loger,paître,iendre,coudre,moudre,naître,soudre,pendre,rendre,vendre,fendre¦6terai:pelleter¦13ai:photographier¦3errai:revoir¦5terai:voleter¦10ai:interroger¦1ènerai:mener¦2udrai:faillir,valoir¦2errai:quérir¦3drai:vouloir¦3ai:dire,lire,rire,uire¦1épartirai:repartir¦11ai:interpeller¦6rai:acquerir"
      },
      "tu": {
        "fwd": "erras:érir¦as:e¦épartiras:epartir¦îtras:itre¦1udras:aloir¦1dras:uloir¦2ras:erir¦3as:dir,uir¦3leras:peler¦4as:ller,tter",
        "both": "5as:ucier,erver,rtrir,anier,ncier,ouser,itier,seyer,eurir,cuser,plier,laner,upler,auser,llier,blier,ertir,nchir,utier,psier,mbrir,ouver,buser,euver,rvoir,ortir,évoir,arler,téger¦4as:vrir,frir,unir,ager,grir,aver,uger,stir,over,lser,nnir,ater,iger,blir,oler,rnir,fler,gner,iner,fier,oser,acer,gter,rger,nser,cter,bler,rcer,rrir,ayer,aler,iser,drir,ttir,ster,inir,iver,rier,rner,oter,plir,pter,utir,iter,aser,nner,olir,êtir,soir,eoir,ntir,énir,ncer,uler,nter,rser,uter,sser,rter,nger,gler,écer¦4ras:mouvoir¦3as:bir,wer,zer,cir,xer,per,pir,gir,mer,mir,vir,sir,der,uer,rer,her,ber¦3leras:celer,veler¦3ras:cevoir¦2udras:faillir¦2êteras:rreter¦2èleras:rteler¦2èteras:aleter,ureter¦2tras:âtre¦2as:ïr¦2ras:urir¦2erras:nvoyer¦1erras:hoir¦1égeras:ieger¦1èleras:deler¦1eras:faire¦1èneras:mener,sener¦1uras:avoir¦1ieras:uyer,oyer¦1èteras:heter¦échiras:echir¦éeras:eer¦écieras:ecier¦èveras:ever¦iendras:enir¦èseras:eser¦èceras:ecer",
        "rev": "3:liras,yeras¦4:ogeras,ndiras,useras,aneras,hieras,eneras,rleras,ouiras,guiras,dieras¦5:otteras,ocieras,urdiras,enieras,atteras,alleras,utteras,icieras¦eler:èleras¦evrer:èvreras¦ener:èneras¦2oir:uvras,evras,everras¦2loir:vaudras¦2e:oras,pras,cras¦2itre:raîtras¦3e:atras,luras,firas,utras,airas,ivras,rdras¦3er:telleras,letteras¦3loir:voudras¦4ir:eilleras¦4e:oîtras,udiras,indras,andras,roiras,ettras,ondras,duiras,ruiras,criras,attras¦4er:ppelleras¦5e:onciras,naîtras,soudras,rendras,cendras,pendras,tendras",
        "ex": "iras:aller¦seras:être¦1èleras:geler,peler¦3teras:jeter¦1èvreras:sevrer¦1ieras:oyer¦4eras:montrer¦1uras:avoir¦8as:départir,bouillir,associer,diffuser,embellir,vieillir,officier,babiller,fouetter,habiller,interdire¦4ras:mouvoir¦6as:partir,renier,hurler,mollir,verdir,sourire¦3rras:pouvoir¦6eras:cueillir¦3ras:devoir¦9as:assaillir¦1erras:voir¦1eras:faire¦7as:abroger,limoger,mendier,repaître,bailler,revendre,guetter¦5leras:atteler,bateler¦4as:oser,user,fier,lier,nier,ayer,fuir,frire,boire,crire,luire,nuire,cuire¦5as:paner,plier,faner,fuser,gener,loger,paître,iendre,coudre,moudre,naître,soudre,pendre,rendre,vendre,fendre¦6teras:pelleter¦13as:photographier¦3erras:revoir¦5teras:voleter¦10as:interroger¦1èneras:mener¦2udras:faillir,valoir¦2erras:quérir¦3dras:vouloir¦3as:dire,lire,rire,uire¦1épartiras:repartir¦11as:interpeller¦6ras:acquerir"
      },
      "il": {
        "fwd": "erra:érir¦a:e¦épartira:epartir¦îtra:itre¦1udra:aloir¦1dra:uloir¦2ra:erir¦3a:dir,uir¦3lera:peler¦4a:ller,tter",
        "both": "5a:ucier,erver,rtrir,anier,ncier,ouser,itier,seyer,eurir,cuser,plier,laner,upler,auser,llier,blier,ertir,nchir,utier,psier,mbrir,ouver,buser,euver,rvoir,ortir,évoir,arler,téger¦4a:vrir,frir,unir,ager,grir,aver,uger,stir,over,lser,nnir,ater,iger,blir,oler,rnir,fler,gner,iner,fier,oser,acer,gter,rger,nser,cter,bler,rcer,rrir,ayer,aler,iser,drir,ttir,ster,inir,iver,rier,rner,oter,plir,pter,utir,iter,aser,nner,olir,êtir,soir,eoir,ntir,énir,ncer,uler,nter,rser,uter,sser,rter,nger,gler,écer¦4ra:mouvoir¦3a:bir,wer,zer,cir,xer,per,pir,gir,mer,mir,vir,sir,der,uer,rer,her,ber¦3lera:celer,veler¦3ra:cevoir¦2udra:faillir¦2êtera:rreter¦2èlera:rteler¦2ètera:aleter,ureter¦2tra:âtre¦2a:ïr¦2ra:urir¦2erra:nvoyer¦1erra:hoir¦1égera:ieger¦1èlera:deler¦1era:faire¦1ènera:mener,sener¦1ura:avoir¦1iera:uyer,oyer¦1ètera:heter¦échira:echir¦éera:eer¦éciera:ecier¦èvera:ever¦iendra:enir¦èsera:eser¦ècera:ecer",
        "rev": "3:lira,yera¦4:ogera,ndira,usera,anera,hiera,enera,rlera,ouira,guira,diera¦5:ottera,ociera,urdira,eniera,attera,allera,uttera,iciera¦eler:èlera¦evrer:èvrera¦ener:ènera¦2oir:uvra,evra,everra¦2loir:vaudra¦2e:ora,pra,cra¦2itre:raîtra¦3e:atra,lura,fira,utra,aira,ivra,rdra¦3er:tellera,lettera¦3loir:voudra¦4ir:eillera¦4e:oîtra,udira,indra,andra,roira,ettra,ondra,duira,ruira,crira,attra¦4er:ppellera¦5e:oncira,naîtra,soudra,rendra,cendra,pendra,tendra",
        "ex": "ira:aller¦sera:être¦1èlera:geler,peler¦3tera:jeter¦1èvrera:sevrer¦1iera:oyer¦4era:montrer¦1ura:avoir¦8a:départir,bouillir,associer,diffuser,embellir,vieillir,officier,babiller,fouetter,habiller,interdire¦4ra:mouvoir¦6a:partir,renier,hurler,mollir,verdir,sourire¦3rra:pouvoir¦6era:cueillir¦3ra:devoir¦9a:assaillir¦1erra:voir¦1era:faire¦7a:abroger,limoger,mendier,repaître,bailler,revendre,guetter¦5lera:atteler,bateler¦4a:oser,user,fier,lier,nier,ayer,fuir,frire,boire,crire,luire,nuire,cuire¦5a:paner,plier,faner,fuser,gener,loger,paître,iendre,coudre,moudre,naître,soudre,pendre,rendre,vendre,fendre¦6tera:pelleter¦13a:photographier¦3erra:revoir¦5tera:voleter¦10a:interroger¦1ènera:mener¦2udra:faillir,valoir¦2erra:quérir¦3dra:vouloir¦3a:dire,lire,rire,uire¦1épartira:repartir¦11a:interpeller¦6ra:acquerir"
      },
      "nous": {
        "fwd": "errons:érir¦ons:e¦épartirons:epartir¦îtrons:itre¦1drons:uloir¦2rons:erir¦3ons:dir,uir¦3lerons:peler¦4ons:ller,tter",
        "both": "5ons:ucier,ffrir,urrir,rtrir,ncier,auger,itier,urler,ifler,arnir,mater,eurir,ernir,nfler,arler,nchir,arrir,ertir,errir,arner,rvoir,ortir,évoir,erner,téger¦5terons:elleter¦4ons:vrir,iger,iver,dier,grir,acer,unir,stir,ager,ayer,aner,rier,oler,iter,nier,hier,aver,nser,fier,lier,pter,oter,gter,oser,cter,rcer,aser,nnir,iser,aler,ster,drir,ttir,brir,inir,nner,user,gner,bler,oger,uver,utir,iner,êtir,soir,eoir,ntir,énir,ncer,uler,nter,rser,uter,sser,rter,nger,gler,écer¦4rons:mouvoir¦3ons:bir,wer,zer,cir,xer,per,pir,gir,mer,mir,lir,vir,sir,der,uer,rer,her,ber¦3lerons:celer,veler¦3rons:cevoir¦2êterons:rreter¦2èlerons:rteler¦2èterons:aleter,ureter¦2trons:âtre¦2ons:ïr¦2rons:urir¦2errons:nvoyer¦1errons:hoir¦1égerons:ieger¦1èlerons:deler¦1erons:faire¦1ènerons:mener,sener¦1urons:avoir¦1udrons:aloir¦1ierons:uyer,oyer¦1èterons:heter¦échirons:echir¦éerons:eer¦écierons:ecier¦èverons:ever¦iendrons:enir¦èserons:eser¦ècerons:ecer",
        "rev": "3:nirons,yerons¦4:ndirons,sierons,tierons,rgerons,rnerons,plerons,enerons,lserons,ouirons,guirons,aterons,rverons¦5:otterons,ocierons,urdirons,atterons,noverons,utterons,icierons¦eler:èlerons¦evrer:èvrerons¦ener:ènerons¦2oir:uvrons,evrons,everrons¦2e:orons,prons,crons¦2itre:raîtrons¦3e:atrons,lurons,firons,utrons,airons,ivrons,rdrons¦3er:tellerons,letterons¦3loir:voudrons¦4ir:eillerons¦4e:oîtrons,udirons,indrons,androns,roirons,ettrons,duirons,ondrons,crirons,attrons¦4er:ppellerons¦5e:oncirons,naîtrons,soudrons,rendrons,cendrons,pendrons,truirons,tendrons",
        "ex": "irons:aller¦serons:être¦1èlerons:geler,peler¦3terons:jeter¦1èvrerons:sevrer¦1ierons:oyer¦4erons:montrer¦1urons:avoir¦8ons:départir,associer,diverger,impulser,observer,officier,babiller,emballer,fouetter,habiller,interdire¦4rons:mouvoir¦6ons:partir,forger,verdir,sourire¦3rrons:pouvoir¦6erons:cueillir¦3rons:devoir¦1errons:voir¦1erons:faire¦5lerons:atteler,bateler¦9ons:autopsier,balbutier,retourner,grasseyer,installer¦5ons:orner,gener,juger,lover,mater,paître,iendre,coudre,moudre,naître,soudre,pendre,rendre,vendre,fendre¦4ons:oser,user,fier,lier,nier,ayer,fuir,frire,boire,crire,luire,nuire,cuire¦7ons:peupler,fournir,innover,repaître,bailler,revendre,guetter¦3errons:revoir¦5terons:voleter¦1ènerons:mener¦2errons:quérir¦3drons:vouloir¦3ons:dire,lire,rire,uire¦1épartirons:repartir¦11ons:interpeller¦6rons:acquerir"
      },
      "vous": {
        "fwd": "errez:érir¦épartirez:epartir¦îtrez:itre¦1drez:uloir¦2rez:erir¦3z:ure,dre,vre¦3ez:dir,uir¦3lerez:peler¦4z:rire,oire,uire,dire¦4ez:ller,tter¦5z:ncire",
        "both": "5ez:ucier,ffrir,liger,rtrir,ertir,itier,urler,ifler,arnir,mater,eurir,xiger,ernir,nfler,arler,erger,nchir,utier,psier,arner,uvrir,ortir,évoir,erner,téger¦5terez:elleter¦5z:laire¦4ez:unir,rrir,iver,dier,grir,acer,uger,ager,ayer,aner,rier,oler,iter,nier,hier,aver,nser,fier,lier,pter,oter,gter,oser,cter,rcer,aser,nnir,iser,aler,ster,drir,ttir,brir,inir,nner,user,gner,bler,oger,uver,utir,iner,êtir,soir,eoir,ntir,énir,ncer,uler,nter,rser,uter,sser,rter,nger,gler,écer¦4z:utre,ttre,fire,ître¦4rez:mouvoir¦3ez:bir,wer,zer,cir,xer,per,pir,gir,mer,mir,lir,vir,sir,der,uer,rer,her,ber¦3lerez:celer,veler¦3rez:cevoir¦3z:cre,pre,ore¦2êterez:rreter¦2èlerez:rteler¦2èterez:aleter,ureter¦2trez:âtre¦2ez:ïr¦2rez:urir¦2errez:nvoyer¦1errez:hoir¦1égerez:ieger¦1èlerez:deler¦1erez:faire¦1ènerez:mener,sener¦1urez:avoir¦1udrez:aloir¦1ierez:uyer,oyer¦1èterez:heter¦échirez:echir¦éerez:eer¦écierez:ecier¦èverez:ever¦iendrez:enir¦èserez:eser¦ècerez:ecer",
        "rev": "3:nirez,yerez¦4:voirez,atrez,lurez,airez,ivrez,ndirez,igerez,rnerez,rdrez,rgerez,enerez,lserez,overez,stirez,guirez,aterez,rverez¦5:otterez,udirez,indrez,andrez,roirez,ocierez,allerez,urdirez,uplerez,duirez,atterez,crirez,ncierez,ondrez¦eler:èlerez¦evrer:èvrerez¦ener:ènerez¦2oir:uvrez,evrez,everrez¦2itre:raîtrez¦3er:tellerez,letterez¦3loir:voudrez¦4ir:eillerez¦4er:ppellerez¦5ir:cquerrez",
        "ex": "irez:aller¦serez:être¦1èlerez:geler,peler¦3terez:jeter¦1èvrerez:sevrer¦1ierez:oyer¦4erez:montrer¦1urez:avoir¦8ez:départir,pourvoir,associer,impulser,investir,observer,officier,babiller,fouetter,habiller¦4rez:mouvoir¦6ez:partir,forger,verdir,lutter¦3rrez:pouvoir¦6erez:cueillir¦3rez:devoir¦1errez:voir¦7z:embatre,prendre,sourire¦5z:taire,frire,boire,crire,luire,nuire,cuire¦4z:dire,lire,rire,uire¦1erez:faire¦6z:braire,iendre,coudre,moudre,soudre,pendre,rendre,vendre,fendre¦5lerez:atteler,bateler¦7ez:diriger,peupler,fournir,innover,bailler,guetter¦5ez:orner,figer,gener,lover,mater,jouir¦4ez:oser,user,fier,lier,nier,ayer,fuir¦9ez:retourner,grasseyer,licencier¦3errez:revoir¦5terez:voleter¦1ènerez:mener¦2errez:quérir¦3drez:vouloir¦10z:circoncire,comprendre¦8z:résoudre,absoudre,attendre,rependre,revendre,entendre¦9z:descendre,reprendre,instruire,interdire,apprendre¦1épartirez:repartir¦11ez:interpeller"
      },
      "ils": {
        "fwd": "erront:érir¦ont:e¦épartiront:epartir¦îtront:itre¦1dront:uloir¦2ront:erir¦3ont:dir,uir¦3leront:peler¦4ont:tter¦5ont:eller",
        "both": "5ont:icier,urrir,tiver,igrir,ncier,ulser,seyer,eurir,mpter,ioler,arler,aller,nchir,ertir,errir,ocier,epter,rvoir,ortir,évoir,coler,téger¦5teront:elleter¦5ent:iller¦4ont:rier,rver,unir,trir,nier,acer,uger,stir,over,nnir,fler,ager,ater,iger,iter,rnir,vrir,lier,aner,hier,aver,nser,fier,rner,oter,gter,oser,cter,rcer,aser,ayer,iser,aler,ster,drir,ttir,brir,inir,nner,user,gner,bler,oger,uver,utir,iner,êtir,soir,eoir,ntir,énir,ncer,uler,nter,rser,uter,sser,rter,nger,gler,écer¦4ront:mouvoir¦3ont:bir,wer,zer,cir,xer,per,pir,gir,mer,mir,lir,vir,sir,der,uer,rer,her,ber¦3leront:celer,veler¦3ront:cevoir¦2êteront:rreter¦2èleront:rteler¦2èteront:aleter,ureter¦2tront:âtre¦2ont:ïr¦2ront:urir¦2erront:nvoyer¦1erront:hoir¦1égeront:ieger¦1èleront:deler¦1eront:faire¦1èneront:mener,sener¦1uront:avoir¦1udront:aloir¦1ieront:uyer,oyer¦1èteront:heter¦échiront:echir¦éeront:eer¦écieront:ecier¦èveront:ever¦iendront:enir¦èseront:eser¦èceront:ecer",
        "rev": "3:yeront¦4:ndiront,sieront,rriront,rgeront,pleront,oleront,eneront,rleront,ouiront,guiront,dieront,friront¦5:otteront,riveront,utieront,urdiront,atteront,itieront,utteront,ucieront¦eler:èleront¦evrer:èvreront¦:ent¦ener:èneront¦2oir:uvront,evront,everront¦2e:oront,pront,cront¦2itre:raîtront¦3ir:illeront¦3e:atront,luront,firont,utront,airont,ivront,rdront¦3er:telleront,letteront¦3loir:voudront¦4e:oîtront,udiront,indront,andront,roiront,ettront,duiront,ondront,criront,attront¦4er:ppelleront¦5e:onciront,naîtront,soudront,rendront,pendront,tendront",
        "ex": "iront:aller¦seront:être¦1èleront:geler,peler¦3teront:jeter¦1èvreront:sevrer¦1ieront:oyer¦4eront:montrer¦1uront:avoir¦8ont:départir,diverger,descendre,fouetter,instruire,interdire¦4ront:mouvoir¦6ont:partir,barrir,forger,hurler,isoler,offrir,verdir,sourire¦3rront:pouvoir¦6eront:cueillir¦3ront:devoir¦1erront:voir¦1eront:faire¦7ont:arriver,peupler,rigoler,initier,mendier,soucier,repaître,revendre,guetter¦5leront:atteler,bateler¦9ont:autopsier,balbutier¦9ent:aventurer¦5ont:opter,voler,gener,paître,iendre,coudre,moudre,naître,soudre,pendre,rendre,vendre,fendre¦4ont:oser,user,fier,lier,nier,ayer,fuir,frire,boire,crire,luire,nuire,cuire¦3erront:revoir¦5teront:voleter¦8ent:facturer¦1èneront:mener¦2erront:quérir¦3dront:vouloir¦3ont:dire,lire,rire,uire¦1épartiront:repartir¦11ont:interpeller¦6ront:acquerir"
      }
    },
    "imperfect": {
      "je": {
        "fwd": "ais:er¦isais:ésir¦oyais:eoir¦issais:ître¦quais:cre¦éais:eer¦édais:eder¦érais:erir¦1ais:loir,ure,pre,vre¦1ssais:itre¦2ais:enir,urir,uvoir,êtir,rmir,vrir,érir,avoir,atre,ttre,utre,rdre¦2yais:roire,raire¦3ais:éger,ondre¦3yais:rvoir",
        "both": "5ais:épartir,ssentir¦5ssais:aigrir,rantir,tentir,terrir,brutir¦4ais:ourire,vendre,pendre,cendre,tendre,pandre,pentir¦4ssais:ussir,urrir,rtrir,nguir,ravir,eurir,ellir,ertir,outir¦4sais:oncire¦3ssais:blir,unir,stir,rnir,nnir,drir,uvir,brir,plir,olir,udire,inir,énir,isir¦3ais:ager,uger,rger,nger,cevoir,iger,oger,rendre,illir¦3sais:rdire,faire,laire¦3vais:crire¦3yais:ssoir,évoir¦2ssais:bir,cir,hir,pir,gir,dir¦2érais:sferer¦2ais:frir¦2sais:uire,fire¦2lvais:soudre¦2tais:âtre¦1éférais:referer¦1égeais:ieger¦1gnais:indre¦1ssais:ïr¦éressais:eresser¦éciais:ecier¦épartissais:epartir¦çais:cer",
        "rev": "udre:lvais¦1er:bais,hais,uais,mais,pais,xais,zais,wais¦1ndre:egnais¦1eer:réais¦1eter:rêtais¦1eder:cédais¦2er:etais,ftais,esais,brais,glais,trais,rlais,inais,nnais,asais,itais,usais,arais,odais,stais,rnais,orais,osais,blais,elais,siais,ayais,adais,rrais,ctais,utais,rsais,gtais,otais,irais,fiais,liais,anais,nsais,plais,idais,niais,olais,flais,ptais,eyais,grais,lsais,tiais,ovais,diais,crais¦2eoir:rsoyais¦2ître:naissais,loissais¦2re:aisais¦2cre:inquais¦2r:missais,sissais,uissais¦2erir:quérais¦3er:turais,evrais,ardais,jurais,euvais,agnais,mulais,priais,senais,surais,risais,visais,tisais,eurais,ndrais,assais,loyais,untais,antais,dulais,vulais,durais,phiais,ussais,aurais,ariais,gurais,boyais,matais,ottais,revais,ravais,eulais,urtais,culais,ellais,gulais,nciais,uttais,aulais,tivais,murais,toyais,iciais,uciais¦3r:rvissais,llissais¦3ir:venais,ourais,artais,uvrais,vêtais,tenais¦3re:batais,uivais,endais,vivais,ompais,cluais¦3ître:croissais¦3tre:raissais¦4er:nvoyais,ppuyais,bondais,dentais,chevais,rrivais,mandais,ballais,portais,ientais,ointais,rouvais,alisais,droyais,landais,rattais,rondais,nondais,ventais,mentais,ipulais,troyais¦4r:tégeais,ortissais,arrissais¦4oir:évalais,mouvais¦4ir:dormais¦4re:mettais,fondais,battais¦5er:ttentais,bsentais,ssociais,essalais,caissais,seignais,ouettais,stallais,bservais¦5ir:ssortais¦5oir:evoulais¦5re:épondais",
        "ex": "étais:être¦7ssais:asservir,assortir¦2ais:avoir,rire,béer,ayer,oyer,oser,user,fier,lier,nier¦4ais:mentir,partir,sortir,servir,pendre,rendre,vendre,fendre,sentir,porter,mouvoir,pouvoir,dormir,quérir,vouloir,battre,foutre,mettre,avaler,bander,perdre,pondre,visser,fonder,livrer,mander,monter,mordre,broyer¦7ais:ressortir,desservir,resservir,organiser,fourvoyer¦3ais:devoir,aller,céder,vêtir,savoir,valoir,venir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,mener,mater,miser,murer,noyer,gérer,prier,tenir¦2yais:fuir,voir¦3sais:taire,coudre,faire¦2gnais:iendre¦1uvais:boire¦3vais:crire¦2sais:dire,lire,uire¦3lais:moudre¦2lvais:soudre¦5ssais:barrir,mollir¦4yais:revoir¦4ssais:vomir,jouir¦6ssais:grossir¦3êtais:arreter¦1isais:gésir¦6yais:pourvoir¦3issais:croître¦2issais:paître,naître¦4issais:repaître¦3yais:croire,braire¦5ais:aborder,baigner,baisser,dresser,emmener,flatter,glisser,grogner,guetter,laisser¦6ais:accorder,froisser"
      },
      "tu": {
        "fwd": "ais:er¦isais:ésir¦oyais:eoir¦issais:ître¦quais:cre¦éais:eer¦édais:eder¦érais:erir¦1ais:loir,ure,pre,vre¦1ssais:itre¦2ais:enir,urir,uvoir,êtir,rmir,vrir,érir,avoir,atre,ttre,utre,rdre¦2yais:roire,raire¦3ais:éger,ondre¦3yais:rvoir",
        "both": "5ais:épartir,ssentir¦5ssais:aigrir,rantir,tentir,terrir,brutir¦4ais:ourire,vendre,pendre,cendre,tendre,pandre,pentir¦4ssais:ussir,urrir,rtrir,nguir,ravir,eurir,ellir,ertir,outir¦4sais:oncire¦3ssais:blir,unir,stir,rnir,nnir,drir,uvir,brir,plir,olir,udire,inir,énir,isir¦3ais:ager,uger,rger,nger,cevoir,iger,oger,rendre,illir¦3sais:rdire,faire,laire¦3vais:crire¦3yais:ssoir,évoir¦2ssais:bir,cir,hir,pir,gir,dir¦2érais:sferer¦2ais:frir¦2sais:uire,fire¦2lvais:soudre¦2tais:âtre¦1éférais:referer¦1égeais:ieger¦1gnais:indre¦1ssais:ïr¦éressais:eresser¦éciais:ecier¦épartissais:epartir¦çais:cer",
        "rev": "udre:lvais¦1er:bais,hais,uais,mais,pais,xais,zais,wais¦1ndre:egnais¦1eer:réais¦1eter:rêtais¦1eder:cédais¦2er:etais,ftais,esais,brais,glais,trais,rlais,inais,nnais,asais,itais,usais,arais,odais,stais,rnais,orais,osais,blais,elais,siais,ayais,adais,rrais,ctais,utais,rsais,gtais,otais,irais,fiais,liais,anais,nsais,plais,idais,niais,olais,flais,ptais,eyais,grais,lsais,tiais,ovais,diais,crais¦2eoir:rsoyais¦2ître:naissais,loissais¦2re:aisais¦2cre:inquais¦2r:missais,sissais,uissais¦2erir:quérais¦3er:turais,evrais,ardais,jurais,euvais,agnais,mulais,priais,senais,surais,risais,visais,tisais,eurais,ndrais,assais,loyais,untais,antais,dulais,vulais,durais,phiais,ussais,aurais,ariais,gurais,boyais,matais,ottais,revais,ravais,eulais,urtais,culais,ellais,gulais,nciais,uttais,aulais,tivais,murais,toyais,iciais,uciais¦3r:rvissais,llissais¦3ir:venais,ourais,artais,uvrais,vêtais,tenais¦3re:batais,uivais,endais,vivais,ompais,cluais¦3ître:croissais¦3tre:raissais¦4er:nvoyais,ppuyais,bondais,dentais,chevais,rrivais,mandais,ballais,portais,ientais,ointais,rouvais,alisais,droyais,landais,rattais,rondais,nondais,ventais,mentais,ipulais,troyais¦4r:tégeais,ortissais,arrissais¦4oir:évalais,mouvais¦4ir:dormais¦4re:mettais,fondais,battais¦5er:ttentais,bsentais,ssociais,essalais,caissais,seignais,ouettais,stallais,bservais¦5ir:ssortais¦5oir:evoulais¦5re:épondais",
        "ex": "étais:être¦7ssais:asservir,assortir¦2ais:avoir,rire,béer,ayer,oyer,oser,user,fier,lier,nier¦4ais:mentir,partir,sortir,servir,pendre,rendre,vendre,fendre,sentir,porter,mouvoir,pouvoir,dormir,quérir,vouloir,battre,foutre,mettre,avaler,bander,perdre,pondre,visser,fonder,livrer,mander,monter,mordre,broyer¦7ais:ressortir,desservir,resservir,organiser,fourvoyer¦3ais:devoir,aller,céder,vêtir,savoir,valoir,venir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,mener,mater,miser,murer,noyer,gérer,prier,tenir¦2yais:fuir,voir¦3sais:taire,coudre,faire¦2gnais:iendre¦1uvais:boire¦3vais:crire¦2sais:dire,lire,uire¦3lais:moudre¦2lvais:soudre¦5ssais:barrir,mollir¦4yais:revoir¦4ssais:vomir,jouir¦6ssais:grossir¦3êtais:arreter¦1isais:gésir¦6yais:pourvoir¦3issais:croître¦2issais:paître,naître¦4issais:repaître¦3yais:croire,braire¦5ais:aborder,baigner,baisser,dresser,emmener,flatter,glisser,grogner,guetter,laisser¦6ais:accorder,froisser"
      },
      "il": {
        "fwd": "ait:er¦isait:ésir¦oyait:eoir¦issait:ître¦quait:cre¦épartissait:epartir¦éait:eer¦édait:eder¦érait:erir¦1ait:loir,ure,pre,vre¦1ssait:itre¦2ait:enir,urir,uvoir,êtir,rmir,vrir,érir,avoir,atre,ttre,utre,rdre¦2yait:roire,raire¦3ait:éger,ondre¦3yait:rvoir",
        "both": "5ssait:aigrir,rantir,tentir,terrir,brutir¦5ait:ssentir¦4ait:ourire,vendre,pendre,cendre,tendre,pandre,pentir¦4ssait:ussir,urrir,rtrir,nguir,ravir,eurir,ellir,ertir,outir¦4sait:oncire¦3ssait:blir,unir,stir,rnir,nnir,drir,uvir,brir,plir,olir,udire,inir,énir,isir¦3ait:ager,uger,rger,nger,cevoir,iger,oger,rendre,illir¦3sait:rdire,faire,laire¦3vait:crire¦3yait:ssoir,évoir¦2ssait:bir,cir,hir,pir,gir,dir¦2érait:sferer¦2ait:frir¦2sait:uire,fire¦2lvait:soudre¦2tait:âtre¦1éférait:referer¦1égeait:ieger¦1gnait:indre¦1ssait:ïr¦éressait:eresser¦éciait:ecier¦çait:cer",
        "rev": "udre:lvait¦1er:bait,hait,uait,mait,pait,xait,zait,wait¦1ndre:egnait¦1eer:réait¦1eter:rêtait¦1eder:cédait¦2er:etait,ftait,esait,brait,glait,trait,rlait,inait,nnait,asait,itait,usait,arait,odait,stait,rnait,orait,osait,blait,elait,siait,ayait,adait,rrait,ctait,utait,rsait,gtait,otait,irait,fiait,liait,anait,nsait,plait,idait,niait,olait,flait,ptait,eyait,grait,lsait,tiait,ovait,diait,crait¦2eoir:rsoyait¦2ître:naissait,loissait¦2re:aisait¦2cre:inquait¦2r:missait,sissait,uissait¦2erir:quérait¦3er:turait,evrait,ardait,jurait,euvait,agnait,mulait,priait,senait,surait,risait,visait,tisait,eurait,ndrait,assait,loyait,untait,antait,dulait,vulait,durait,phiait,ussait,aurait,ariait,gurait,boyait,matait,ottait,revait,ravait,eulait,urtait,culait,ellait,gulait,nciait,uttait,aulait,tivait,murait,toyait,iciait,uciait¦3r:rvissait,llissait¦3ir:venait,ourait,artait,uvrait,vêtait,tenait¦3re:batait,uivait,endait,vivait,ompait,cluait¦3ître:croissait¦3tre:raissait¦4er:nvoyait,ppuyait,bondait,dentait,chevait,rrivait,mandait,ballait,portait,ientait,ointait,rouvait,alisait,droyait,landait,rattait,rondait,nondait,ventait,mentait,ipulait,troyait¦4r:tégeait,ortissait,arrissait¦4oir:évalait,mouvait¦4ir:dormait¦4re:mettait,fondait,battait¦5er:ttentait,bsentait,ssociait,essalait,caissait,seignait,ouettait,stallait,bservait¦5ir:ssortait,sservait¦5re:épondait",
        "ex": "était:être¦7ssait:asservir,assortir,départir¦2ait:avoir,rire,béer,ayer,oyer,oser,user,fier,lier,nier¦4ait:mentir,partir,sortir,servir,pendre,rendre,vendre,fendre,sentir,porter,mouvoir,pouvoir,dormir,quérir,vouloir,battre,foutre,mettre,avaler,bander,perdre,pondre,visser,fonder,livrer,mander,monter,mordre,broyer¦7ait:ressortir,desservir,resservir,organiser,fourvoyer¦3ait:devoir,aller,céder,vêtir,savoir,valoir,venir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,mener,mater,miser,murer,noyer,gérer,prier,tenir¦2yait:fuir,voir¦3sait:taire,coudre,faire¦2gnait:iendre¦1uvait:boire¦3vait:crire¦2sait:dire,lire,uire¦3lait:moudre¦2lvait:soudre¦5ssait:barrir,mollir¦4yait:revoir¦4ssait:vomir,jouir¦6ssait:grossir¦3êtait:arreter¦1isait:gésir¦6yait:pourvoir¦3issait:croître¦2issait:paître,naître¦4issait:repaître¦3yait:croire,braire¦5ait:aborder,baigner,baisser,dresser,emmener,flatter,glisser,grogner,guetter,laisser¦6ait:accorder,revouloir,froisser¦1épartissait:repartir"
      },
      "nous": {
        "fwd": "ions:er¦isions:ésir¦oyions:eoir¦issions:ître¦quions:cre¦éions:eer¦édions:eder¦érions:erir¦1ions:loir,ure,pre,vre¦1ssions:itre¦2ions:uvoir,avoir,atre,ttre,utre,rdre¦2yions:soir,roire,raire¦3ons:enir,urir,êtir,rmir,vrir,érir¦3ions:ondre¦4yions:urvoir¦5ons:sentir",
        "both": "5ssions:rantir,tentir,bellir¦5ions:scendre¦5ons:pentir¦4ions:tendre,vendre,pendre,pandre¦4ssions:ussir,urrir,rtrir,ossir,eurir,ertir,arrir,errir,ouvir,mbrir¦4sions:oncire¦4ons:illir¦3ions:urire,rendre,cevoir¦3érions:nsferer¦3ssions:unir,grir,ouir,stir,avir,blir,rnir,nnir,drir,plir,utir,olir,udire,inir,énir,isir¦3sions:rdire,faire,laire¦3vions:crire¦3yions:évoir¦2ssions:bir,gir,cir,hir,pir,dir¦2êtions:rreter¦2sions:uire,fire¦2lvions:soudre¦2tions:âtre¦1éférions:referer¦1égions:ieger¦1gnions:indre¦1ssions:ïr¦éressions:eresser¦éciions:ecier¦épartissions:epartir",
        "rev": "udre:lvions¦1er:bions,cions,hions,uions,mions,pions,xions,zions,wions¦1ndre:egnions¦1eer:réions¦1eder:cédions¦2er:etions,ftions,esions,brions,glions,ngions,rlions,inions,nnions,asions,itions,usions,arions,odions,stions,rnions,orions,osions,blions,elions,siions,ayions,adions,rrions,ctions,utions,rsions,gtions,otions,irions,fiions,liions,anions,agions,nsions,plions,idions,niions,trions,olions,flions,ptions,igions,rgions,eyions,grions,lsions,tiions,ogions,ugions,ovions,diions,crions¦2eoir:rsoyions¦2ître:naissions,loissions¦2re:aisions¦2cre:inquions¦2r:missions,uissions¦2erir:quérions¦3er:turions,evrions,tégions,ardions,jurions,euvions,agnions,mulions,priions,senions,surions,risions,visions,tisions,eurions,ndrions,assions,loyions,untions,antions,dulions,vulions,durions,phiions,ussions,aurions,ariions,gurions,boyions,mations,ottions,revions,ravions,eulions,urtions,culions,ellions,gulions,nciions,uttions,pulions,aulions,tivions,murions,toyions,uciions¦3r:rvissions,llissions,frions¦3ir:ssoyions¦3re:bations,uivions,endions,vivions,ompions,cluions¦3ître:croissions¦3tre:raissions¦4er:nvoyions,ppuyions,bondions,dentions,chevions,rrivions,mandions,ballions,portions,ientions,ointions,alisions,droyions,landions,rattions,rondions,nondions,ventions,mentions,troyions¦4r:venions,ourions,artions,vêtions,ortissions,tenions,uvrions¦4oir:évalions,mouvions,voulions¦4re:mettions,fondions,pondions¦5er:ttentions,bsentions,prouvions,essalions,caissions,seignions,trouvions,ouettions,stallions,bservions¦5r:sortions,dormions¦5re:abattions",
        "ex": "étions:être¦7ssions:asservir,assortir¦2ions:avoir,rire,béer,ayer,oyer,oser,user,fier,lier,nier¦5ons:mentir,partir,sortir,servir,offrir,sentir,dormir,quérir¦8ons:ressortir,desservir,resservir,ressentir¦3ions:devoir,aller,céder,savoir,valoir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,mener,mater,miser,murer,noyer,gérer,prier¦2yions:fuir,voir¦3sions:taire,coudre,faire¦2gnions:iendre¦1uvions:boire¦3vions:crire¦2sions:dire,lire,uire¦3lions:moudre¦2lvions:soudre¦4ions:pendre,rendre,vendre,fendre,porter,mouvoir,pouvoir,vouloir,battre,foutre,mettre,avaler,bander,perdre,pondre,visser,fonder,livrer,mander,monter,mordre,broyer¦4yions:revoir¦4ssions:vomir¦6ssions:languir¦5ssions:mollir¦7ons:départir¦1isions:gésir¦4ons:vêtir,venir,tenir¦6yions:pourvoir¦3issions:croître¦2issions:paître,naître¦4issions:repaître¦3yions:croire,braire¦5ions:aborder,baigner,baisser,dresser,emmener,flatter,glisser,grogner,guetter,laisser¦6ions:accorder,associer,froisser,officier¦7ions:organiser,fourvoyer"
      },
      "vous": {
        "fwd": "iez:er¦isiez:ésir¦oyiez:eoir¦issiez:ître¦quiez:cre¦éiez:eer¦édiez:eder¦ériez:erir¦1iez:loir,ure,pre,vre¦1ssiez:itre¦2iez:uvoir,avoir,atre,ttre,utre,rdre¦2yiez:soir,roire,raire¦3ez:enir,urir,êtir,rmir,vrir,érir¦3iez:ondre¦4yiez:urvoir¦5ez:sentir",
        "both": "5ssiez:rantir,tentir,bellir¦5iez:scendre¦5ez:pentir¦4iez:tendre,vendre,pendre,pandre¦4ssiez:ussir,urrir,rtrir,ossir,eurir,ertir,arrir,errir,ouvir,mbrir¦4siez:oncire¦4ez:illir¦3iez:urire,rendre,cevoir¦3ériez:nsferer¦3ssiez:unir,grir,ouir,stir,avir,blir,rnir,nnir,drir,plir,utir,olir,udire,inir,énir,isir¦3siez:rdire,faire,laire¦3viez:crire¦3yiez:évoir¦2ssiez:bir,gir,cir,hir,pir,dir¦2êtiez:rreter¦2siez:uire,fire¦2lviez:soudre¦2tiez:âtre¦1éfériez:referer¦1égiez:ieger¦1gniez:indre¦1ssiez:ïr¦éressiez:eresser¦éciiez:ecier¦épartissiez:epartir",
        "rev": "udre:lviez¦1er:biez,ciez,hiez,uiez,miez,piez,xiez,ziez,wiez¦1ndre:egniez¦1eer:réiez¦1eder:cédiez¦2er:etiez,ftiez,esiez,briez,gliez,ngiez,rliez,iniez,nniez,asiez,itiez,usiez,ariez,odiez,stiez,rniez,oriez,osiez,bliez,eliez,siiez,ayiez,adiez,rriez,ctiez,utiez,rsiez,gtiez,otiez,iriez,fiiez,liiez,aniez,agiez,nsiez,pliez,idiez,niiez,triez,oliez,fliez,ptiez,igiez,rgiez,eyiez,griez,lsiez,tiiez,ogiez,ugiez,oviez,diiez,criez¦2eoir:rsoyiez¦2ître:naissiez,loissiez¦2re:aisiez¦2cre:inquiez¦2r:missiez,uissiez¦2erir:quériez¦3er:turiez,evriez,tégiez,ardiez,juriez,euviez,agniez,muliez,priiez,seniez,suriez,risiez,visiez,tisiez,euriez,ndriez,assiez,loyiez,untiez,antiez,duliez,vuliez,duriez,phiiez,ussiez,auriez,ariiez,guriez,boyiez,matiez,ottiez,reviez,raviez,euliez,urtiez,culiez,elliez,guliez,nciiez,uttiez,puliez,auliez,tiviez,muriez,toyiez,uciiez¦3r:rvissiez,llissiez,friez¦3ir:ssoyiez¦3re:batiez,uiviez,endiez,viviez,ompiez,cluiez¦3ître:croissiez¦3tre:raissiez¦4er:nvoyiez,ppuyiez,bondiez,dentiez,cheviez,rriviez,mandiez,balliez,portiez,ientiez,ointiez,alisiez,droyiez,landiez,rattiez,rondiez,nondiez,ventiez,mentiez,troyiez¦4r:veniez,ouriez,artiez,vêtiez,ortissiez,teniez,uvriez¦4oir:évaliez,mouviez,vouliez¦4re:mettiez,fondiez,pondiez¦5er:ttentiez,bsentiez,prouviez,essaliez,caissiez,seigniez,trouviez,ouettiez,stalliez,bserviez¦5r:sortiez,dormiez¦5re:abattiez",
        "ex": "étiez:être¦7ssiez:asservir,assortir¦2iez:avoir,rire,béer,ayer,oyer,oser,user,fier,lier,nier¦5ez:mentir,partir,sortir,servir,offrir,sentir,dormir,quérir¦8ez:ressortir,desservir,resservir,ressentir¦3iez:devoir,aller,céder,savoir,valoir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,mener,mater,miser,murer,noyer,gérer,prier¦2yiez:fuir,voir¦3siez:taire,coudre,faire¦2gniez:iendre¦1uviez:boire¦3viez:crire¦2siez:dire,lire,uire¦3liez:moudre¦2lviez:soudre¦4iez:pendre,rendre,vendre,fendre,porter,mouvoir,pouvoir,vouloir,battre,foutre,mettre,avaler,bander,perdre,pondre,visser,fonder,livrer,mander,monter,mordre,broyer¦4yiez:revoir¦4ssiez:vomir¦6ssiez:languir¦5ssiez:mollir¦7ez:départir¦1isiez:gésir¦4ez:vêtir,venir,tenir¦6yiez:pourvoir¦3issiez:croître¦2issiez:paître,naître¦4issiez:repaître¦3yiez:croire,braire¦5iez:aborder,baigner,baisser,dresser,emmener,flatter,glisser,grogner,guetter,laisser¦6iez:accorder,associer,froisser,officier¦7iez:organiser,fourvoyer"
      },
      "ils": {
        "fwd": "aient:er¦isaient:ésir¦oyaient:eoir¦issaient:ître¦quaient:cre¦éaient:eer¦édaient:eder¦éraient:erir¦1aient:loir,ure,pre,vre¦1ssaient:itre¦2aient:enir,urir,uvoir,êtir,rmir,vrir,érir,avoir,atre,ttre,utre,rdre¦2yaient:roire,raire¦3aient:éger,ondre¦3yaient:rvoir",
        "both": "5aient:épartir,ssentir¦5ssaient:aigrir,rantir,tentir,terrir,brutir¦4aient:ourire,vendre,pendre,cendre,tendre,pandre,pentir¦4ssaient:ussir,urrir,rtrir,nguir,ravir,eurir,ellir,ertir,outir¦4saient:oncire¦3ssaient:blir,unir,stir,rnir,nnir,drir,uvir,brir,plir,olir,udire,inir,énir,isir¦3aient:ager,uger,rger,nger,cevoir,iger,oger,rendre,illir¦3saient:rdire,faire,laire¦3vaient:crire¦3yaient:ssoir,évoir¦2ssaient:bir,cir,hir,pir,gir,dir¦2éraient:sferer¦2aient:frir¦2saient:uire,fire¦2lvaient:soudre¦2taient:âtre¦1éféraient:referer¦1égeaient:ieger¦1gnaient:indre¦1ssaient:ïr¦éressaient:eresser¦éciaient:ecier¦épartissaient:epartir¦çaient:cer",
        "rev": "udre:lvaient¦1er:baient,haient,uaient,maient,paient,xaient,zaient,waient¦1ndre:egnaient¦1eer:réaient¦1eter:rêtaient¦1eder:cédaient¦2er:etaient,ftaient,esaient,braient,glaient,traient,rlaient,inaient,nnaient,asaient,itaient,usaient,araient,odaient,staient,rnaient,oraient,osaient,blaient,elaient,siaient,ayaient,adaient,rraient,ctaient,utaient,rsaient,gtaient,otaient,iraient,fiaient,liaient,anaient,nsaient,plaient,idaient,niaient,olaient,flaient,ptaient,eyaient,graient,lsaient,tiaient,ovaient,diaient,craient¦2eoir:rsoyaient¦2ître:naissaient,loissaient¦2re:aisaient¦2cre:inquaient¦2r:missaient,sissaient,uissaient¦2erir:quéraient¦3er:turaient,evraient,ardaient,juraient,euvaient,agnaient,mulaient,priaient,senaient,suraient,risaient,visaient,tisaient,euraient,ndraient,assaient,loyaient,untaient,antaient,dulaient,vulaient,duraient,phiaient,ussaient,auraient,ariaient,guraient,boyaient,mataient,ottaient,revaient,ravaient,eulaient,urtaient,culaient,ellaient,gulaient,nciaient,uttaient,aulaient,tivaient,muraient,toyaient,iciaient,uciaient¦3r:rvissaient,llissaient¦3ir:venaient,ouraient,artaient,uvraient,vêtaient,tenaient¦3re:bataient,uivaient,endaient,vivaient,ompaient,cluaient¦3ître:croissaient¦3tre:raissaient¦4er:nvoyaient,ppuyaient,bondaient,dentaient,chevaient,rrivaient,mandaient,ballaient,portaient,ientaient,ointaient,rouvaient,alisaient,droyaient,landaient,rattaient,rondaient,nondaient,ventaient,mentaient,ipulaient,troyaient¦4r:tégeaient,ortissaient,arrissaient¦4oir:évalaient,mouvaient¦4ir:dormaient¦4re:mettaient,fondaient,battaient¦5er:ttentaient,bsentaient,ssociaient,essalaient,caissaient,seignaient,ouettaient,stallaient,bservaient¦5ir:ssortaient¦5oir:evoulaient¦5re:épondaient",
        "ex": "étaient:être¦7ssaient:asservir,assortir¦2aient:avoir,rire,béer,ayer,oyer,oser,user,fier,lier,nier¦4aient:mentir,partir,sortir,servir,pendre,rendre,vendre,fendre,sentir,porter,mouvoir,pouvoir,dormir,quérir,vouloir,battre,foutre,mettre,avaler,bander,perdre,pondre,visser,fonder,livrer,mander,monter,mordre,broyer¦7aient:ressortir,desservir,resservir,organiser,fourvoyer¦3aient:devoir,aller,céder,vêtir,savoir,valoir,venir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,mener,mater,miser,murer,noyer,gérer,prier,tenir¦2yaient:fuir,voir¦3saient:taire,coudre,faire¦2gnaient:iendre¦1uvaient:boire¦3vaient:crire¦2saient:dire,lire,uire¦3laient:moudre¦2lvaient:soudre¦5ssaient:barrir,mollir¦4yaient:revoir¦4ssaient:vomir,jouir¦6ssaient:grossir¦3êtaient:arreter¦1isaient:gésir¦6yaient:pourvoir¦3issaient:croître¦2issaient:paître,naître¦4issaient:repaître¦3yaient:croire,braire¦5aient:aborder,baigner,baisser,dresser,emmener,flatter,glisser,grogner,guetter,laisser¦6aient:accorder,froisser"
      }
    },
    "pastParticiple": {
      "prt": {
        "fwd": "1:cturer,rtuner¦2:uir,vir¦3:aturer¦u:ouvoir,euvoir,avoir,oire,aitre¦is:eoir,ettre,erir¦:jettir,iller,turber,iliser,iltrer,iliariser,illeter,iliter,ilier¦éparti:epartir¦1u:hoir,loir,paître,naître,pre,cre¦1is:uérir¦1su:stre¦2u:atre",
        "both": "1:nturer,ïr¦2:bir,cir,ieillir,gir,pir,dir,mir,lir,éer¦3:battre,rrir,trir,unir,stir,rnir,isir,nnir,drir,brir,utir,ffire,inir,ntir¦4:ourire,ussir,igrir,eurir,xclure,nchir,ortir¦5:onclure,rossir,vertir¦4t:truire,bsoudre¦4u:vendre,pendre,courir,tendre¦4s:eclure,assir¦3t:duire,nfire,énir¦3u:ondre,ccroître,andre¦3û:ecroître¦3i:uivre¦2égé:sieger¦2u:rdre,utre,êtir,évoir,rvoir,enir¦2t:rire,indre,dire,aire¦2s:cire¦2tu:âtre¦1éféré:referer¦1ert:frir,vrir¦1écu:vivre¦1is:rendre¦1s:ore¦ê:etir¦échi:echir¦éressé:eresser¦éé:eer¦écié:ecier¦çu:cevoir¦é:er",
        "rev": "ivre:écu¦eter:êté¦1urir:ort¦1ouvoir:mu¦1oître:rû¦1re:us,du¦1udre:olu¦1dre:nt,usu¦1ettre:mis¦1oir:vu¦1iltrer:f¦1iller:p¦2oir:llu,alu¦2ir:uru¦2aître:epu,nnu¦2tre:issu¦2re:mpu,ncu,uit¦2iller:sc,ou,qu,va¦2iliariser:am¦2iliser:ss¦2ilier:um¦3er:ichu¦3oir:échu¦3eoir:ursis¦3r:rvi,uvi,oui¦3re:rui,attu¦3turer:rac¦3tuner:por¦3erir:cquis¦4re:mbatu¦4oir:voulu¦4r:ravi,ngui¦5rer:rbatu",
        "ex": "2:rire,jaillir,bailler,utiliser,veiller¦3:clure,luire,huir,fuir,babiller,perturber,faciliter,feuilleter,habiliter¦4:bruire,assujettir¦5:partir¦7:départir,impartir¦eu:avoir¦été:être¦4u:ficher,courir,battre,pendre,rendre,vendre,fendre,vouloir¦3u:férir,issir,revoir,échoir,paraitre¦2rt:mourir¦1û:devoir¦1u:voir,taire,lire,mouvoir,pouvoir,savoir,boire¦2û:croître¦5s:inclure¦4lu:résoudre¦3t:iendre,nuire,cuire¦3su:coudre¦2t:dire,uire¦3lu:moudre¦1é:naître¦2lu:soudre¦1écu:vivre¦7u:descendre¦3êté:arreter¦1éré:gerer¦2u:choir,pleuvoir,croire¦3is:asseoir¦2is:quérir¦1is:seoir,mettre¦1éparti:repartir"
      }
    },
    "presentTense": {
      "je": {
        "fwd": "2:ier¦3:tter,ller¦4:fèrer¦èce:ecer,écer¦ège:éger¦ère:érer¦is:uïr,ître¦ois:eoir¦iers:érir,erir¦eux:ouloir¦s:vre¦1ux:aloir¦1s:uillir,rmir,ire,ttre,ure,itre¦1is:aïr,avoir¦1ère:ferer¦2s:uir,outre,dir¦2e:vrir¦3s:soir¦3le:peler",
        "both": "2:éer,wer,zer,xer,per,mer,ber¦3:nuer,rver,uter,ouer,uger,over,orer,fler,oser,iger,iter,ider,oder,bler,rler,luer,nser,ager,aner,aser,sser,oter,gter,rger,rser,iner,guer,rcer,rrer,ader,iser,aler,buer,ster,irer,iver,nner,uler,nter,arer,user,oger,uver,nder,ncer,gner,rder,cter,ayer,oler,rner,rter,nger,acer,urer¦4:ièger,acrer,rquer,ivrer,igrer,seyer,mpter,aquer,squer,iquer,acher,ocher,ucher,epter,ncher,rcher,icher¦5:anquer,pulser,rmater,iltrer,entrer¦5s:tablir,urtrir,tentir,esservir,ombrir,essortir¦5te:elleter¦5e:saillir,ueillir¦4s:vahir,ollir,igrir,estir,ennir,antir,eurir,iblir,ssentir,courir,ellir,ertir,nchir,annir,ouvir,pandre,rvoir,évoir¦3s:ôtir,hoir,unir,avir,rnir,ondre,rrir,drir,plir,utir,olir,endre,soudre,inir,pentir,énir¦3le:celer,veler¦2us:faillir¦2s:bir,rdre,cir,pir,gir,indre,âtre,êtir,sir¦2ête:rreter¦2e:frir¦2èle:rteler¦2ète:aleter,ureter¦2eus:omouvoir¦1èle:deler¦1ène:mener,sener¦1s:cre,pre,ore¦1ie:uyer,oyer¦1èque:héquer¦1ète:heter¦échis:echir¦ède:éder¦ève:ever¦çois:cevoir¦iens:enir¦èche:écher¦èbre:ébrer¦èse:eser",
        "rev": "voir:i¦evrer:èvre¦égler:ègle¦ourir:eurs¦eler:èle¦ener:ène¦1ecer:mèce¦1écer:ièce¦1éger:tège¦1érer:dère¦1tre:îs¦1re:ds¦1ouloir:veux¦2ecer:épèce¦2r:tis,lis,mis,nis,ye¦2tir:ars¦2loir:vaux¦2eoir:rsois¦2re:lus,fis¦2ître:nais,lois¦2tre:ats,ets¦2erer:sfère¦2erir:quiers¦3r:rvis,ndis,cie,sie,fie,lie,rie,hie,tre,vois,ene,ave,tie,guis,nie¦3ir:ours,uvre¦3mir:dors¦3re:udis,cris,duis,lais¦3ître:crois¦3er:telle,lette¦4r:otte,ssois,ndre,urdis,atte,alle,ngle,utte,ndie¦4re:oncis¦4er:ppelle¦4tre:arais¦5re:arfais,struis¦5r:euple,uette,éfère",
        "ex": "3:oser,user,huer,muer,nuer,ayer,fier,lier,nier¦4:baver,opter,paver,gener,laver,mater¦5:graver,moquer,entrer¦6:peupler,jongler¦8:effondrer¦9:rencontrer¦10:interpeller¦suis:être¦vais:aller¦1i:avoir¦1èle:geler,peler¦3te:jeter¦1èvre:sevrer¦1ie:oyer¦1ègle:régler¦4e:montrer¦7s:asservir,impartir,assortir,répartir,vieillir,interdire¦1is:gésir,ouïr¦3s:mentir,partir,sortir,servir,voir,iendre,soudre,sentir,huir,bouillir,dormir,fuir,taire,boire,crire,faire,foutre,luire,nuire,cuire¦1eurs:mourir¦1eus:mouvoir¦1eux:pouvoir,vouloir¦4s:courir,croître,coudre,moudre,vomir,croire,braire,revivre,jouir¦1ois:devoir¦5le:atteler,bateler¦5s:revoir,honnir,départir,verdir,sourire¦5te:voleter¦8te:feuilleter¦1ène:mener¦2ux:faillir,valoir¦2is:haïr,savoir,paître,naître¦2iers:quérir¦4is:repaître¦2s:dire,lire,rire,uire,vivre¦1ère:gérer"
      },
      "tu": {
        "fwd": "s:r,vre¦èces:ecer¦èges:éger¦ères:érer¦is:uïr,ître¦ois:eoir¦iers:érir,erir¦eux:ouloir¦1ux:aloir¦1s:uillir,rmir,ire,ttre,ure,itre¦1is:avoir¦1ères:ferer¦2es:vrir¦2s:outre",
        "both": "5s:esservir,essortir¦5es:saillir,ueillir¦4les:ppeler,ateler¦4tes:oleter,lleter¦4s:courir,pandre¦3les:veler,celer¦3s:sentir,ondre,endre,soudre,pentir¦2us:faillir¦2échis:flechir¦2êtes:rreter¦2es:frir¦2èles:rteler¦2ètes:ureter¦2s:rdre,indre,âtre,êtir¦2èces:piécer¦1èles:deler¦1ènes:mener,sener¦1s:cre,pre,ore¦1eus:mouvoir¦1ies:uyer,oyer¦1èques:héquer¦1ètes:heter¦èdes:éder¦èves:ever¦çois:cevoir¦iens:enir¦èches:écher¦èbres:ébrer¦èses:eser",
        "rev": "eler:èles¦evrer:èvres¦égler:ègles¦ourir:eurs¦eter:ètes¦ener:ènes¦1ecer:mèces,pèces¦1éger:tèges¦1érer:dères¦1tre:îs¦1re:ds¦1ouloir:veux¦2r:bes,sis,yes,nis,tis,lis,mes,gis,pis,pes,xes,cis,mis,zes,wes,ées,bis¦2tir:ars¦2loir:vaux¦2eoir:rsois¦2re:lus,fis¦2ître:nais,lois¦2tre:ats,ets¦2erer:sfères¦3r:ures,aces,nges,rtes,rnes,oles,rses,ntes,rdes,gnes,nces,rvis,vois,ines,nnes,uves,oges,bles,ptes,stes,ules,ndis,ores,ives,ires,uvis,dris,rris,bues,ises,otes,ties,rres,gues,ales,uses,nses,utes,sses,ases,lies,fies,ries,rces,ides,lues,tres,rles,ites,odes,iges,oses,rges,ages,fles,aves,gres,lses,oves,uges,oues,guis,gris,ndes,cres,rves,cies,hois,ahis¦3ir:ours,uvres¦3mir:dors¦3re:udis,duis,cris,ruis¦3ître:crois¦3erir:cquiers¦4r:iches,rches,ottes,nches,ssois,pares,oches,mbris,aches,lades,iques,inues,uches,rques,urdis,uades,phies,enies,sques,aques,attes,mates,nchis,ravis,actes,ngles,ivres,anies,ndies,oques,ièges¦4re:oncis¦4tre:arais¦5r:nectes,opsies,oigtes,balles,euples,pectes,leuris,uettes,anques,urtris,éfères¦5re:arfais,terdis",
        "ex": "es:être¦vas:aller¦1s:avoir¦1èles:geler,peler¦3tes:jeter¦1èvres:sevrer¦1ies:oyer¦1ègles:régler¦4es:montrer¦1is:gésir,ouïr¦3s:mentir,partir,sortir,servir,iendre,soudre,sentir,huir,bouillir,dormir,fuir,voir,taire,boire,crire,faire,foutre,luire,suivre,oser,user,fier,huer,lier,muer,nier,nuire,nuer,cuire¦1eurs:mourir¦1eus:mouvoir¦1eux:pouvoir,vouloir¦4s:courir,croître,coudre,moudre,croire,braire,paner,parer,revivre,faner,garer,gener,jouir,mater,plaire¦1ois:devoir¦2is:haïr,savoir,paître,naître¦5les:atteler¦3ètes:haleter¦1ènes:mener¦5s:départir,dicter,planer,verdir,lutter,sourire¦2ux:faillir,valoir¦2iers:quérir¦4is:repaître¦2s:dire,lire,rire,uire,vivre¦8s:effondrer,installer¦10s:interpeller¦1ères:gérer"
      },
      "il": {
        "fwd": "1:ttre¦2:ître,utre,ier¦3:tter,ller¦4:fèrer¦èce:ecer,écer¦ège:éger¦ère:érer¦eut:ouvoir,ouloir¦oit:eoir¦iert:érir,erir¦t:vre¦ît:itre¦1ut:aloir¦1t:uillir,rmir,ire,ure¦1it:aïr,avoir¦1ère:ferer¦2t:uir,dir¦2e:vrir¦3t:soir¦3le:peler",
        "both": "1:cre¦2:éer,wer,zer,rdre,xer,per,mer,âtre,êtir,ber¦3:buer,rver,ster,aser,luer,rler,user,ater,iger,orer,pter,oder,iter,rser,ondre,ider,nser,aver,ager,aner,sser,drer,oter,gter,oser,uter,nuer,bler,rcer,rrer,nner,ouer,aler,iser,irer,iver,guer,iner,uler,nter,arer,oger,uver,nder,endre,ncer,gner,rder,cter,ayer,oler,rner,rter,nger,acer,urer¦4:ièger,acrer,oquer,rquer,ivrer,auger,nover,igrer,seyer,ifler,ltrer,aquer,squer,sentir,upler,ucher,iquer,lader,acher,ocher,pandre,ncher,rcher,icher¦5:anquer,ongler,pulser,onfler,entrer,suader,epentir¦5t:tablir,rantir,aiblir,bellir,esservir,partir¦5e:saillir,ueillir¦4t:vahir,igrir,ennir,nchir,eurir,ertir,ouvir,courir,rvoir,évoir¦4te:lleter¦4le:ateler¦4it:ccroître¦3t:ôtir,unir,omir,rnir,rrir,drir,plir,brir,soudre,utir,olir,inir,énir¦3ut:éfaillir¦3le:celer,veler¦2ît|plait:laire¦2et:choir¦2t:bir,cir,pir,gir,indre,sir¦2ête:rreter¦2e:frir¦2èle:rteler¦2ète:aleter,ureter¦1èle:deler¦1ène:mener,sener¦1t:pre,ore¦1ie:uyer,oyer¦1èque:héquer¦1ète:heter¦échit:echir¦ède:éder¦ève:ever¦çoit:cevoir¦ient:enir¦èche:écher¦èbre:ébrer¦èse:eser",
        "rev": "eler:èle¦evrer:èvre¦égler:ègle¦ourir:eurt¦ener:ène¦1ecer:mèce¦1écer:ièce¦1éger:tège¦1érer:dère¦1ouvoir:meut¦1re:d¦1ouloir:veut¦2ecer:épèce¦2loir:vaut¦2eoir:rsoit¦2re:lut,fit¦2tre:at¦2r:tit,nit,lit,ye¦2erer:sfère¦2erir:quiert¦2itre:raît¦3r:rvit,ndit,cie,sie,rge,lie,fie,nie,rie,ene,avit,tie,ouit,guit,die,tre¦3ir:art,ourt,uvre¦3mir:dort¦3re:oît,fait,rait,duit,ruit,crit¦3tre:met¦3vre:evit¦4r:otte,ssoit,urdit,evoit,atte,alle,utte¦4ir:sort¦4re:oncit,naît,ourit¦4er:ttelle,olette,ppelle¦5re:epaît,terdit¦5r:aphie,uette,urtrit,éfère",
        "ex": "1:avoir¦3:oser,user,huer,muer,nuer,ayer,mettre,fier,lier,nier¦4:mentir,partir,sortir,coudre,moudre,gener,juger,lover,sentir,paître,foutre,naître¦5:forger,entrer¦7:ressortir,diverger¦9:rencontrer¦10:interpeller¦est:être¦va:aller¦1èle:geler,peler¦3te:jeter¦1èvre:sevrer¦1ie:oyer¦1ègle:régler¦4e:montrer¦7t:asservir,assortir,retentir,vieillir,investir,meurtrir¦4t:choir,courir,croire¦1ît:gésir¦1eurt:mourir¦1it:ouïr¦1oit:devoir¦3t:servir,voir,iendre,soudre,huir,bouillir,dormir,fuir,taire,boire,crire,faire,luire,suivre,nuire,cuire¦5le:atteler¦5t:bannir,revoir,gravir,honnir,mollir,maudire,verdir¦5te:voleter¦1ène:mener¦2ut:faillir,valoir¦1eut:mouvoir,pouvoir,vouloir¦2it:haïr,savoir¦2iert:quérir¦2t:dire,lire,rire,uire,vivre¦1ère:gérer"
      },
      "nous": {
        "fwd": "ons:er¦isons:ésir¦oyons:eoir¦issons:ître¦quons:cre¦égeons:èger¦érons:èrer,erir¦1sons:ore¦1ons:ure,pre,vre¦1érons:ferer¦1ssons:itre¦2ons:enir,urir,êtir,rmir,vrir,érir,utre,ttre,rdre¦2ns:loir¦2yons:roire¦3ons:éger,ondre¦3ns:uvoir¦3yons:rvoir",
        "both": "5ssons:aigrir,rantir,tentir,terrir,brutir¦5ons:ssentir,scendre¦4ssons:vahir,ussir,ollir,nguir,ossir,eurir,ellir,nchir,ertir,outir¦4yons:échoir¦4ons:vendre,pendre,tendre,pandre,pentir¦4sons:oncire¦4ns:cevoir¦3ssons:ôtir,blir,trir,unir,stir,avir,omir,rnir,nnir,drir,uvir,brir,plir,olir,udire,inir,énir,isir¦3ons:urire,uger,rger,nger,ager,iger,oger,rendre,illir¦3sons:rdire¦3vons:crire¦3yons:ssoir,évoir¦2ssons:bir,gir,cir,pir,dir¦2ons:frir¦2lvons:soudre¦2sons:uire,fire,aire¦2tons:âtre¦1gnons:indre¦1ssons:ïr¦échissons:echir¦çons:cer",
        "rev": "udre:lvons¦1er:bons,hons,uons,pons,mons,xons,zons,wons,éons¦1ndre:egnons¦1èger:iégeons¦1eter:rêtons¦2er:etons,esons,brons,glons,rnons,olons,ayons,ctons,irons,rrons,inons,nnons,asons,itons,usons,arons,odons,stons,orons,osons,blons,elons,sions,otons,adons,utons,gtons,drons,fions,lions,anons,nsons,plons,idons,nions,trons,flons,rsons,ptons,atons,eyons,rlons,lsons,tions,cions,dions,grons,crons¦2r:vissons,uissons,rissons,tissons¦2eoir:rsoyons¦2ître:naissons,loissons¦2cre:inquons¦2èrer:éférons¦2erer:sférons¦3er:turons,evrons,ardons,ottons,dérons,mulons,jurons,euvons,agnons,hevons,senons,tisons,risons,visons,culons,eurons,essons,assons,loyons,untons,antons,dulons,vulons,durons,phions,ussons,aurons,lisons,gurons,revons,ravons,eulons,urtons,novons,allons,gulons,ivrons,uttons,arions,tivons,murons,toyons,cédons¦3ir:venons,ourons,artons,uvrons,vêtons,tenons¦3re:closons,uivons,endons,vivons,ompons,cluons¦3ître:croissons¦3r:llissons¦3tre:raissons¦4er:nvoyons,ppuyons,rontons,bondons,dentons,oprions,rrivons,mentons,mandons,mmenons,ientons,ointons,portons,mboyons,droyons,landons,rattons,rondons,nondons,ventons,ipulons,iaulons,troyons¦4r:tégeons¦4ir:sortons,dormons¦4re:mettons,fondons,battons¦5er:ttentons,bsentons,prouvons,essalons,caissons,seignons,trouvons,ouettons,rpellons,bservons¦5ir:évalons,mouvons,voulons¦5re:épondons",
        "ex": "sommes:être¦3ns:avoir,choir¦4ons:montrer,mentir,partir,sortir,servir,pendre,rendre,vendre,fendre,sentir,porter,choyer,dormir,quérir,battre,foutre,mettre,aboyer,avaler,bander,perdre,pondre,visser,fonder,mander,mordre,broyer¦7ssons:asservir,impartir,assortir,répartir,vieillir¦3ssons:huir¦7ons:ressortir,desservir,resservir,organiser,fourvoyer¦4ns:devoir,savoir,valoir¦2yons:fuir,voir¦2gnons:iendre¦1uvons:boire¦3sons:coudre¦3vons:crire¦2sons:dire,lire,uire¦3lons:moudre¦2ons:rire,oyer,oser,user,fier,lier,nier,ayer¦2lvons:soudre¦5ssons:barrir¦4yons:revoir¦4ssons:jouir¦6ssons:nourrir¦3êtons:arreter¦6ons:départir,déborder,accorder,froisser¦3ons:aller,céder,vêtir,venir,clure,ompre,vivre,baver,biser,durer,paver,viser,gener,haler,jurer,lever,laver,lover,mener,miser,murer,noyer,gérer,prier,tenir¦5ons:daigner,aborder,assurer,baigner,baisser,flatter,glisser,grogner,guetter,laisser,mesurer¦1isons:gésir¦5ns:mouvoir,pouvoir,vouloir¦6yons:pourvoir¦3issons:croître¦2issons:paître,naître¦4issons:repaître¦3yons:croire¦4érons:acquerir"
      },
      "vous": {
        "fwd": "isez:ésir¦oyez:eoir¦issez:ître¦quez:cre¦égez:èger¦érez:èrer,erer,erir¦1ez:loir,ure,pre,vre¦1sez:ore¦1ssez:itre¦2z:ser,yer,der,ner,ver¦2ez:enir,urir,uvoir,êtir,rmir,vrir,érir,avoir,ttre,utre,rdre¦2yez:roire,hoir¦3z:urer,érer¦3yez:rvoir¦3ez:ondre",
        "both": "5ssez:rossir,tentir,anchir,brutir¦5ez:ssentir¦5z:entrer,otéger¦5tes:arfaire¦4ssez:vahir,ussir,rtrir,nguir,antir,eurir,ellir,ertir,ouvir,mbrir,outir¦4ez:tendre,vendre,pendre,cendre,pandre,pentir¦4z:ltrer,evrer¦4vez:scrire¦4sez:oncire¦3ez:illir,urire,rendre,cevoir¦3z:crer,uger,grer,rger,rrer,ager,drer,iger,orer,arer,oger,irer,nger,brer¦3ssez:grir,unir,stir,avir,blir,omir,rnir,nnir,rrir,drir,plir,olir,udire,inir,énir,isir¦3tes:rdire¦3yez:ssoir,évoir¦2ssez:bir,cir,pir,gir,dir¦2êtez:rreter¦2ez:frir¦2z:wer,zer,xer,mer,ier,uer,ber,per,her,cer,ler,ter¦2sez:uire,fire¦2lvez:soudre¦2tez:âtre¦1gnez:indre¦1ssez:ïr¦échissez:echir",
        "rev": "udre:lvez¦1ndre:egnez¦1re:ites¦1èger:iégez¦2r:vissez,uissez,tissez,éez¦2eoir:rsoyez¦2ître:naissez,loissez¦2re:aisez¦2cre:inquez¦2èrer:éférez¦2erer:sférez¦3r:esez,édez,rnez,ayez,inez,nnez,asez,usez,adez,nsez,anez,idez,trez,rsez,odez,llisez,eyez,lsez,ovez,llissez¦3ir:venez,ourez,artez,uvrez,vêtez,tenez,choyez¦3re:closez,uivez,endez,vivez,cluez,ompez¦3ître:croissez¦3erir:cquérez¦3tre:raissez¦4r:turez,ardez,puyez,jurez,euvez,hevez,rosez,surez,risez,tisez,eurez,posez,essez,assez,durez,ussez,aurez,toyez,boyez,agnez,revez,ognez,gurez,ivrez,murez¦4oir:évalez,mouvez,voulez¦4ir:dormez¦4re:mettez,fondez,battez¦5r:nvoyez,idérez,bondez,cordez,rrivez,mandez,ivisez,mmenez,anisez,ilisez,plosez,droyez,landez,rondez,nondez,otivez,troyez¦5ir:ssortez,sservez¦5re:épondez",
        "ex": "2es:être¦2ez:avoir,rire¦4ez:montrer,mentir,partir,sortir,servir,pendre,rendre,vendre,fendre,sentir,mouvoir,pouvoir,dormir,quérir,vouloir,battre,foutre,mettre,perdre,pondre,mordre¦7ssez:asservir,impartir,assortir,répartir¦3ssez:huir¦7ez:ressortir,desservir,resservir¦3ez:devoir,vêtir,savoir,valoir,venir,clure,ompre,vivre,tenir¦2yez:fuir,voir¦3sez:taire,coudre¦2gnez:iendre¦1uvez:boire¦3vez:crire¦2tes:dire¦3tes:faire¦2sez:lire,uire¦3lez:moudre¦2lvez:soudre¦9z:rencontrer,renseigner¦4yez:revoir¦7sez:vieillir¦4ssez:jouir,rôtir¦5z:livrer,entrer,choyer,aviser,bander,ployer,visser,fonder,graver,mander,broyer¦5ssez:mollir¦4z:créer,baver,biser,durer,paver,roser,viser,gener,jurer,lever,laver,mener,miser,murer,noyer,gérer¦4vez:écrire¦6ez:départir¦4sez:plaire¦3z:oyer,oser,user,ayer¦7z:déborder,employer,froisser,observer¦6z:daigner,aborder,assener,baigner,baisser,glisser,laisser¦1isez:gésir¦6yez:pourvoir¦3issez:croître¦2issez:paître,naître¦4issez:repaître¦3yez:croire¦8z:approuver,encaisser,retrouver,finaliser,fourvoyer¦11z:immortaliser"
      },
      "ils": {
        "fwd": "ècent:ecer,écer¦ègent:éger¦èrent:érer¦euvent:ouvoir¦oient:eoir¦ièrent:érir,erir¦eulent:ouloir¦issent:ître¦quent:cre¦1ient:oyer,uyer¦1sent:ore¦1ent:ure,pre,vre¦1èrent:ferer¦1ssent:itre¦2ent:aloir,êtir,rmir,vrir,avoir,ttre,utre,rdre¦2nt:ier¦3nt:urer,rter,tter,rder,gner,nder,uver,nter,uler,nner,iver,aler,iser,sser,luer,ller,rver¦3ent:soir,roire,ondre¦3lent:peler¦4ent:rvoir¦4nt:nquer,fèrer",
        "both": "5nt:arquer,pulser,isquer,entrer,verger¦5ssent:tentir,bellir¦5ent:ssentir,scendre,epentir¦4ent:choir,tendre,vendre,pendre,courir,pandre,évoir¦4nt:ièger,acrer,ivrer,ngler,igrer,seyer,ltrer,aquer,upler,ucher,ndrer,igter,iquer,acher,ocher,ncher,rcher,icher¦4ssent:ollir,ennir,antir,eurir,nchir,ertir,ouvir,mbrir¦4sent:erdire,oncire¦4tent:oleter,lleter¦4lent:ateler¦3ssent:ahir,trir,grir,guir,unir,stir,avir,blir,rnir,rrir,drir,plir,utir,olir,udire,inir,énir¦3sent:laire¦3nt:nuer,oter,ouer,over,rler,fler,ater,iger,pter,iter,ider,oder,oser,rser,nser,ager,aner,aser,orer,uter,iner,bler,guer,rcer,rrer,ader,buer,ster,irer,arer,user,oger,ncer,cter,ayer,oler,rner,nger,acer¦3lent:celer,veler¦3vent:crire¦3ent:raire,illir¦3nent:rendre¦2ssent:bir,cir,pir,gir,dir,sir¦2êtent:rreter¦2nt:éer,wer,zer,xer,per,mer,ber¦2ent:frir¦2èlent:rteler¦2ètent:aleter,ureter¦2sent:uire,fire¦2lvent:soudre¦2tent:âtre¦1èlent:deler¦1ènent:mener,sener¦1gnent:indre¦1ont:faire¦1ssent:ïr¦1èquent:héquer¦1ètent:heter¦échissent:echir¦èdent:éder¦èvent:ever¦çoivent:cevoir¦iennent:enir¦èchent:écher¦èbrent:ébrer¦èsent:eser",
        "rev": "eler:èlent¦evrer:èvrent¦égler:èglent¦aire:ont¦udre:lvent¦ener:ènent¦1ecer:mècent,pècent¦1écer:iècent¦1éger:tègent¦1érer:dèrent¦1ouvoir:meuvent¦1ndre:egnent¦1ouloir:veulent¦2yer:puient,boient,loient,toient¦2r:vissent,uissent,tissent,nissent,missent,yent¦2eoir:rsoient¦2ître:naissent,loissent¦2re:aisent¦2dre:oulent¦2cre:inquent¦2erer:sfèrent¦3yer:nvoient,droient,troient¦3ir:artent,ourent,uvrent,vêtent¦3re:closent,uivent,endent,vivent,ompent,cluent,urient¦3ître:croissent¦3r:rient,cient,sient,tient,fient,lient,hient,nient,llisent,rgent,enent,ugent,dient,trent¦3er:tellent¦3erir:cquièrent¦3tre:raissent¦4r:turent,ardent,ottent,mulent,ssoient,jurent,onnent,agnent,ouvent,surent,risent,visent,tisent,salent,essent,allent,assent,antent,dulent,vulent,durent,intent,ussent,aurent,evoient,annent,gurent,ravent,urtent,fluent,gulent,uttent,pulent,aulent,oquent,murent¦4oir:évalent¦4ir:dorment¦4re:fondent,battent,pondent¦4er:ppellent¦5r:tentent,bordent,bondent,dentent,rrivent,sculent,mandent,leurent,runtent,anisent,ientent,portent,ilisent,alisent,uettent,landent,rattent,rondent,oculent,ventent,mentent,anquent,otivent,éfèrent¦5ir:ssortent,sservent¦5re:rmettent,emettent",
        "ex": "sont:être¦ont:avoir¦vont:aller¦1èlent:geler,peler¦3tent:jeter¦1èvrent:sevrer¦1ient:oyer¦1èglent:régler¦4ent:montrer,mentir,partir,sortir,courir,servir,pendre,rendre,vendre,fendre,sentir,dormir,battre,croire,foutre,mettre,perdre,pondre,mordre¦7ssent:asservir,impartir,assortir,répartir¦1isent:gésir¦3ssent:huir¦1eurent:mourir¦7ent:ressortir,desservir,resservir,pourvoir¦1oivent:devoir¦3ent:fuir,voir,vêtir,savoir,valoir,clure,ompre,vivre¦3sent:taire,coudre¦2gnent:iendre¦3vent:boire,crire¦2sent:dire,lire,uire¦1ont:faire¦3lent:moudre¦2ent:rire¦2lvent:soudre¦5lent:atteler¦5ssent:bannir,honnir¦4nt:baver,paver,gener,juger,laver,biser,durer,viser,haler,jurer,miser,murer¦3nt:oser,user,huer,muer,nuer,ayer,fier,lier,nier¦9nt:rencontrer,confronter,renseigner¦5ent:revoir,sourire,omettre¦7sent:vieillir¦4ssent:vomir,jouir,rôtir¦5nt:forger,graver,jauger,moquer,entrer,porter,avaler,bander,visser,fonder,mander,meuler¦1ènent:mener¦6ent:départir¦3ient:choyer,broyer¦6nt:daigner,baigner,baisser,polluer,flatter,glisser,grogner,gueuler,inonder,laisser¦1euvent:mouvoir,pouvoir¦2ièrent:quérir¦1eulent:vouloir¦3issent:croître¦2issent:paître,naître¦4issent:repaître¦7nt:abreuver,absenter,accorder,demeurer,froisser,observer¦8nt:encaisser¦11ent:retransmettre¦6ient:fourvoyer¦10nt:interpeller¦2ient:noyer¦1èrent:gérer"
      }
    }
  };

  // uncompress them
  let model$1 = Object.keys(packed).reduce((h, k) => {
    h[k] = {};
    Object.keys(packed[k]).forEach(form => {
      h[k][form] = uncompress$1(packed[k][form]);
    });
    return h
  }, {});

  var model$2 = model$1;

  let fRev = reverse$1(model$2.adjective.female);
  let pRev$1 = reverse$1(model$2.adjective.plural);
  let fpRev = reverse$1(model$2.adjective.femalePlural);

  const toFemale = (str) => convert$1(str, model$2.adjective.female);
  const toPlural$1 = (str) => convert$1(str, model$2.adjective.plural);
  const toFemalePlural = (str) => convert$1(str, model$2.adjective.femalePlural);
  const fromFemale = (str) => convert$1(str, fRev);
  const fromPlural$1 = (str) => convert$1(str, pRev$1);
  const fromFemalePlural = (str) => convert$1(str, fpRev);

  const conjugate = function (str) {
    return {
      male: str,
      female: toFemale(str),
      plural: toPlural$1(str),
      femalePlural: toFemalePlural(str),
    }
  };

  const all$2 = (str) => {
    let arr = Object.values(conjugate(str));
    return arr.filter(s => s)
  };

  var adjective = {
    all: all$2,
    conjugate,
    toFemale,
    toPlural: toPlural$1,
    toFemalePlural,
    fromFemale,
    fromPlural: fromPlural$1,
    fromFemalePlural,
  };
  // console.log(conjugate('frais'))

  let pRev = reverse$1(model$2.noun.plural);
  const toPlural = (str) => convert$1(str, model$2.noun.plural);
  const fromPlural = (str) => convert$1(str, pRev);

  const all$1 = (str) => {
    let plr = toPlural(str);
    if (str === plr) {
      return [str]
    }
    return [str, plr]
  };
  var noun = {
    toPlural,
    fromPlural,
    all: all$1
  };

  // ---verbs--
  const reverseAll = function (obj) {
    return Object.keys(obj).reduce((h, k) => {
      h[k] = reverse$1(obj[k]);
      return h
    }, {})
  };

  const doVerb = function (str, m) {
    return {
      first: convert$1(str, m.je),
      second: convert$1(str, m.tu),
      third: convert$1(str, m.il),
      firstPlural: convert$1(str, m.nous),
      secondPlural: convert$1(str, m.vous),
      thirdPlural: convert$1(str, m.ils),
    }
  };
  const doOneVerb = function (str, form, m) {
    if (form === 'FirstPerson') {
      return convert$1(str, m.je)
    }
    if (form === 'SecondPerson') {
      return convert$1(str, m.tu)
    }
    if (form === 'ThirdPerson') {
      return convert$1(str, m.il)
    }
    if (form === 'FirstPersonPlural') {
      return convert$1(str, m.nous)
    }
    if (form === 'SecondPersonPlural') {
      return convert$1(str, m.vous)
    }
    if (form === 'ThirdPersonPlural') {
      return convert$1(str, m.ils)
    }
    return str
  };

  const toPresentTense = (str) => doVerb(str, model$2.presentTense);
  const toFutureTense = (str) => doVerb(str, model$2.futureTense);
  const toImperfect = (str) => doVerb(str, model$2.imperfect);
  const toPastParticiple = (str) => convert$1(str, model$2.pastParticiple.prt);

  const fromPresent = reverseAll(model$2.presentTense);
  const fromPresentTense = (str, form) => doOneVerb(str, form, fromPresent);

  const fromFuture = reverseAll(model$2.futureTense);
  const fromFutureTense = (str, form) => doOneVerb(str, form, fromFuture);

  const fromImperfect = reverseAll(model$2.imperfect);
  const fromImperfectTense = (str, form) => doOneVerb(str, form, fromImperfect);

  const fromParticiple = reverse$1(model$2.pastParticiple.prt);
  const fromPastParticiple = (str) => convert$1(str, fromParticiple);

  // do this one manually
  const fromPassive = function (str) {
    str = str.replace(/ées$/, 'er');
    str = str.replace(/ée$/, 'er');
    str = str.replace(/és$/, 'er');
    str = str.replace(/é$/, 'er');
    return str
  };

  // i don't really know how this works
  const toPassive = function (str) {
    if (str.endsWith('er')) {
      return [
        str.replace(/er$/, 'ées'),
        str.replace(/er$/, 'ée'),
        str.replace(/er$/, 'és'),
        str.replace(/er$/, 'é'),
      ]
    }
    return []
  };

  // an array of every inflection, for '{inf}' syntax
  const all = function (str) {
    let arr = [str].concat(
      Object.values(toPresentTense(str)),
      Object.values(toFutureTense(str)),
      Object.values(toImperfect(str)),
      toPassive(str)
    );
    arr.push(toPastParticiple(str));
    arr = arr.filter(s => s);
    arr = new Set(arr);
    return Array.from(arr)
  };

  var verb = {
    all,
    toPresentTense, toFutureTense, toImperfect, toPastParticiple,
    fromPresentTense, fromFutureTense, fromImperfectTense, fromPastParticiple, fromPassive
  };

  // console.log(presentTense('marcher'))
  // console.log(futureTense('marcher'))
  // console.log(imperfect('marcher'))
  // console.log(pastParticiple('marcher'))
  // console.log(noun('roche'))
  // console.log(adjective('gentil'))

  var methods$1 = { adjective, noun, verb };

  // generated in ./lib/lexicon
  var lexData = {
    "Negative": "true¦aucun,n0;!e,i",
    "Auxiliary": "true¦ai,ont,se",
    "Possessive": "true¦l5m4no3s2t0vo3;a,e5o0;i,n;a,es,on;s,tre;!a,e1on;eur0ui;!s",
    "Conjunction": "true¦&,car,donc,et,ma1ou,pu1s0voire;inon,oit;is",
    "Preposition": "true¦aQbecause,cMdIeDgrace,horCjusquBlors9malgPoutPp6qu4s1v0y,à;eGia,oici;a1elEoTu0;ivaPr;ns,uf;elqu0i,oi4;!';ar1endaLour0rPuis2;!quoi;! Lmi;qu0;!e;',e;m8s;n0xcepte;!tAv0;e1ir0;on;rs;!ans,e1u0;!ra8;!pu0rrie4s,va7;is;hez,o0;mme,n0ura4;cerna3t0;re;!fin,pr5u2v0;a0ec;nt; 0pr2;dess0;us;es",
    "Adverb": "true¦a0Ib0Ec08d03eZfXgWha07iVjSlOmNnMoKpEquAs7t1ultra,vi0;s a v0Mte;a3ertio,o1r0;es,op,ès;t,u0;jou0Rt0H;n0rd;d0Gt;ecu01i1o0urtoZ;i-disa0Huve0H;!c,de0Gt06;!a1e0;!lque;n0si;d,t;a3e2lut01ourta0Br0;esqu0imo;',e;le mele,ut-etK;r0s;fo03toN;rSu0;i,tre mX;ag9eanmoiJon;eAieux;a1o0;in,ngBrs; 0-dedaF;b02dessZ;a1us0;que Yte;dSmaS;dem,ntN;ue5;er0i;me;n0tc;co1fin,suite,tre 0;temps;re;avantage,e0orenL;bo2ca,da1ja,s0;ormaHs5;ns;ut;a,e3i1ombien,resce0;ndo;! dess0;oFus;pendaDrt0;es;e2ien0ref;!t0;ot;aucoup,l;iClAssez,u1vant hi0;er; de7-desso6par4ssi3t0;a4our,r0;efo0;is;!tôt;ava0;nt;us;la;i0o2;as;lleu0nsi;rs",
    "Determiner": "true¦au4ce3l1ol,un0;!e;a,e0;!s;s,tte;!x",
    "QuestionWord": "true¦quelle",
    "Date": "true¦aujourd'hui,demain,hier,weekend",
    "Adjective": "true¦quelques",
    "FirstName": "true¦aEblair,cCdevBj8k6lashawn,m3nelly,quinn,re2sh0;ay,e0iloh;a,lby;g1ne;ar1el,org0;an;ion,lo;as8e0r9;ls7nyatta,rry;am0ess1ude;ie,m0;ie;an,on;as0heyenne;ey,sidy;lex1ndra,ubr0;ey;is",
    "LastName": "true¦0:34;1:3B;2:39;3:2Y;4:2E;5:30;a3Bb31c2Od2Ee2Bf25g1Zh1Pi1Kj1Ek17l0Zm0Nn0Jo0Gp05rYsMtHvFwCxBy8zh6;a6ou,u;ng,o;a6eun2Uoshi1Kun;ma6ng;da,guc1Zmo27sh21zaR;iao,u;a7eb0il6o3right,u;li3Bs2;gn0lk0ng,tanabe;a6ivaldi;ssilj37zqu1;a9h8i2Go7r6sui,urn0;an,ynisJ;lst0Prr1Uth;at1Uomps2;kah0Vnaka,ylor;aEchDeChimizu,iBmiAo9t7u6zabo;ar1lliv2AzuE;a6ein0;l23rm0;sa,u3;rn4th;lva,mmo24ngh;mjon4rrano;midt,neid0ulz;ito,n7sa6to;ki;ch1dLtos,z;amBeag1Zi9o7u6;bio,iz,sD;b6dri1MgIj0Tme24osevelt,ssi,ux;erts,ins2;c6ve0F;ci,hards2;ir1os;aEeAh8ic6ow20;as6hl0;so;a6illips;m,n1T;ders5et8r7t6;e0Nr4;ez,ry;ers;h21rk0t6vl4;el,te0J;baBg0Blivei01r6;t6w1O;ega,iz;a6eils2guy5ix2owak,ym1E;gy,ka6var1K;ji6muW;ma;aEeCiBo8u6;ll0n6rr0Bssolini,ñ6;oz;lina,oKr6zart;al0Me6r0U;au,no;hhail4ll0;ssi6y0;!er;eWmmad4r6tsu07;in6tin1;!o;aCe8i6op1uo;!n6u;coln,dholm;fe7n0Qr6w0J;oy;bv6v6;re;mmy,rs5u;aBennedy,imuAle0Lo8u7wo6;k,n;mar,znets4;bay6vacs;asY;ra;hn,rl9to,ur,zl4;aAen9ha3imen1o6u3;h6nYu3;an6ns2;ss2;ki0Es5;cks2nsse0D;glesi9ke8noue,shik7to,vano6;u,v;awa;da;as;aBe8itchcock,o7u6;!a3b0ghNynh;a3ffmann,rvat;mingw7nde6rN;rs2;ay;ns5rrQs7y6;asDes;an4hi6;moJ;a9il,o8r7u6;o,tierr1;ayli3ub0;m1nzal1;nd6o,rcia;hi;erAis9lor8o7uj6;ita;st0urni0;es;ch0;nand1;d7insteHsposi6vaL;to;is2wards;aCeBi9omin8u6;bo6rand;is;gu1;az,mitr4;ov;lgado,vi;nkula,rw7vi6;es,s;in;aFhBlarkAo6;h5l6op0rbyn,x;em7li6;ns;an;!e;an8e7iu,o6ristens5u3we;i,ng,u3w,y;!n,on6u3;!g;mpb7rt0st6;ro;ell;aBe8ha3lanco,oyko,r6yrne;ooks,yant;ng;ck7ethov5nnett;en;er,ham;ch,h8iley,rn6;es,i0;er;k,ng;dDl9nd6;ers6rA;en,on,s2;on;eks7iy8var1;ez;ej6;ev;ams",
    "Noun": "true¦0:6R;1:6Q;2:6N;3:5I;4:6L;5:5H;6:5E;7:4D;a5Qb4Yc3Sd3Ce34f2Ug2Oh2Ni2Fj2Bkolkhozi59l24m1Gn1Do1Ap0Nqu0Jr07sXtKvFzona7é8œuf;cDdClAp9qui2Qt8va6V;oi4Vé;i6Bée;ect8épha4;e0r1E;i1uca1;lai37o5Sriva3uy2;aBen67i9o8ue;is3l,te,ya19;com4Ye8gner6si1vandi2;!illa7;c61drou3Kl5T;aIeHiGoDr9âc4Qélé8;pho20spec0E;a9i8ot1uand,ép34;e0ompha1;duc1gédi4Sit8nspor20;!é;mbe0rc4Ku8;rte1Gt8;! le monde;g62re0ssu;n5Qr61;hiti4Lil49n4Kpis,ul8;a7i2;aFcientifKerDk0BoCpAtrip-tea5Fu8œ0;c54isTj0Xpplic1Ir8;fe0veil4R;e8éc1A;ak2cY;r5Jup3Y;in,re,v8;a4e0;b3Zcrista3u8;te0vage6;aIeDiComanBubrAé9êve,ô8;de0t4A;ali2NcompenIdac1fug17gionK;iq49;!ci2ich00;de3Nen,sq47tH;cAm9n8présen4Vsqu2Qtrai1Bv29;a7fermé,ti2;iCpla37;e8herc3U;le0ve0;bat1ppor1se0yonne50;artier9elque cho8éman53;se;! génér8;al;aQeMhKiJlHoEr9èler3é8êc4Q;nite4quena1L;ince,oBé8êt56;pa56s8;en8i2O;ta1;cu1Sme5stit0X;i9rt8stu3Wu30è3L;e,i2ra3S;nt,vr3S;a8eu1OonP;ce0ig4St;on46q39s4DéN;otocop8ysQ;ie0;nsAr8stifé4Wu;ce0sonn8;el;e0ée;rAs9t8;i5r6;sQtouZ;cel2Ve4oissi37;b9ffi4Bpé4Mr,u8;rs6v1A;jectif,ser1Q;a9e8oce0u3Aèg4Iégocia1;tto3Gz;ge0;aJeHiEoBé8;can9dica41lan8;ge;ici2X;iss1Wn9rica0Pt8;a7e0if;i1t0Z;ll9n8ro2Dtra1G;et;e,ia7;nd1Vr3Vss8ub2E;ag2;ghréb3inte3Yl,nGquDr9s3Kt8;ela2Ain,on;aAch8e30i3F;e8é;!ur;ud,îch2;e9i8;l15sa7;re1Z;ch2Nge0i8q2I;fes36p8;ula1;aDec1iBoAu9ycé2Cé8;c38za7;r6t1;ge0up;cenc8on,t,v3N;ié;it,p3ve0;eûAo8;ng0Su8;e,vence1M;ne;ci,n8sole33;fDitiCsBt9vi8;té;erlocu1oxiq8;ué;pi3Ctitu1;a1é;a4ir0K;ab0Géri1Z;aCeô2Iol11r9u8éni1ê5;et1ér1T;a9ou8;pe;mmairi1Ond-duc;bar1Ug5lop3r2T;aDeCiBlAor9r8u2Uée;ang3ip6ot1;ce,e0me;ing1Bot1I;ancé,chi2gura4n;ig2Rr07;brica4ctu2ViAr8uc2D;a8ce0;ud;se0t;mBn9s8xplo1J;pi6tiva4;nemi,quê1tr8vB;aî5epre5;bAp8;l8ois07rein16;oyé;alTras21;aLessert,iIoGuFé8;cBfaut,jeun2m6paAt9vo8;re0;enu;n5r03;hique1l9o8;ra1uver0X;assé;c,r1P;m8n5r23;inica3p1;rec1s8;cours,e0pen8;sa1;n8r6uph3;g2se0;a09e so08h01i00lYoFrDu8œ0;eAisi1Cl8;ot0Sti8;va1;il8;le0;ac1Fet6ocodi06â5é8;mi2;ifPlNmInCpBrde16u8;r8s3tu11;e0ri2ti8;er,san;a3ie0;cCf9na0Ds8tribuabZ;eill2om1Api1Qtipé;ecti9i8;de4;on5;iIub3;m9por8te;te16;er9un8;ia4;ça4;l8ocat1E;abo1FégiZ;fe0;ie4ocha7;rd;toyV;aBeAi9ourave0roniqMâte8ô12;la3;e0ffN;rc0Ova0H;m8n1rcuW;e8pi6;au;ir;bAi9m0An8rava0Bs0Itc0Ju0I;did05e,ti0A;ssi2;le;aTeRiMlaJoEr8ûc0F;a8iqKuO;cBn9q8;ue0;c8le0;he;on01;hémiBtAu8v3;che8lang2tiN;!r;te;en;g9nch8;is01;ue;enfai1gBs8;cu9tro8;ti2;it;ot;au-frè0Drg2ug8;la4;bou3ig5laAmb3n9r6sket1t1;on;qui2;ye0;ne0;in;b0Gc0Ad02gr01iZllXmRnPpOrKssHteGuDv8;eAia1o8;c8r1;at;ntu8rtisseO;ri2;di1mô9to-stop8;pe0;ni2;li2;embl9is8;ta4;ée;me,r8;ac9o8;se0;he0;erçu,prenti;i8nivL;ma1;b9ende8i;me4;assaAul8;an8;ci2;de0;ié,u8;me0;de-soig8le;na4;icul1égé;joi4miCoBv8;ers8;ai8;re;ra1;nist8ra1;ré;nt;co9he1i2te0;er;mpagna1r8;dé;te0;ur;bé,onné",
    "MaleName": "true¦0:CD;1:BK;2:C1;3:BS;4:B4;5:BY;6:AS;7:9U;8:BC;9:AW;A:AN;aB3bA7c96d86e7Ff6Xg6Fh5Vi5Hj4Kk4Al3Qm2On2Do27p21qu1Zr1As0Qt06u05v00wNxavi3yGzB;aBor0;cBh8Hne;hCkB;!aB0;ar50eAZ;ass2i,oCuB;sDu24;nEsDusB;oBsC;uf;ef;at0g;aJeHiCoByaAO;lfgang,odrow;lBn1N;bDey,frBIlB;aA4iB;am,e,s;e88ur;i,nde7sB;!l6t1;de,lCrr5yB;l1ne;lBt3;a92y;aEern1iB;cCha0nceBrg9Ava0;!nt;ente,t59;lentin48n8Xughn;lyss4Lsm0;aTeOhKiIoErCyB;!l3ro8s1;av9PeBist0oy,um0;nt9Hv53y;bDd7WmBny;!as,mBoharu;aAXie,y;i82y;mBt9;!my,othy;adDeoCia7ComB;!as;!do7L;!de9;dErB;en8GrB;an8FeBy;ll,n8E;!dy;dgh,ic9Snn3req,ts44;aRcotPeNhJiHoFpenc3tBur1Nylve8Gzym1;anDeBua7A;f0phAEvBwa79;e56ie;!islaw,l6;lom1nA2uB;leyma8ta;dBl7Im1;!n6;aDeB;lBrm0;d1t1;h6Rne,qu0Tun,wn,y8;aBbasti0k1Wl40rg3Zth,ymo9H;m9n;!tB;!ie,y;lCmBnti20q4Hul;mAu4;ik,vato6U;aVeRhe91iNoFuCyB;an,ou;b6KdCf9pe6PssB;!elAH;ol2Ty;an,bHcGdFel,geEh0landA8meo,nDry,sCyB;!ce;coe,s;!a94nA;l3Jr;e4Qg3n6olfo,ri68;co,ky;bAe9U;cBl6;ar5Oc5NhCkBo;!ey,ie,y;a85ie;gCid,ub5x,yBza;ansh,nS;g8WiB;na8Ss;ch5Yfa4lDmCndBpha4sh6Uul,ymo70;al9Yol2By;i9Ion;f,ph;ent2inB;cy,t1;aFeDhilCier62ol,reB;st1;!ip,lip;d9Brcy,tB;ar,e2V;b3Sdra6Ft44ul;ctav2Vliv3m96rFsCtBum8Uw5;is,to;aCc8SvB;al52;ma;i,l49vJ;athJeHiDoB;aBel,l0ma0r2X;h,m;cCg4i3IkB;h6Uola;hol5XkBol5X;!ol5W;al,d,il,ls1vB;il50;anBy;!a4i4;aWeTiKoFuCyB;l21r1;hamCr5ZstaB;fa,p4G;ed,mF;dibo,e,hamDis1XntCsBussa;es,he;e,y;ad,ed,mB;ad,ed;cGgu4kElDnCtchB;!e7;a78ik;house,o03t1;e,olB;aj;ah,hBk6;a4eB;al,l;hClv2rB;le,ri7v2;di,met;ck,hNlLmOrHs1tDuricCxB;!imilian8Cwe7;e,io;eo,hCi52tB;!eo,hew,ia;eBis;us,w;cDio,k86lCqu6Gsha7tBv2;i2Hy;in,on;!el,oKus;achBcolm,ik;ai,y;amBdi,moud;adB;ou;aReNiMlo2RoIuCyB;le,nd1;cEiDkBth3;aBe;!s;gi,s;as,iaB;no;g0nn6RrenDuBwe7;!iB;e,s;!zo;am,on4;a7Bevi,la4SnDoBst3vi;!nB;!a60el;!ny;mCnBr67ur4Twr4T;ce,d1;ar,o4N;aIeDhaled,iBrist4Vu48y3B;er0p,rB;by,k,ollos;en0iEnBrmit,v2;!dCnBt5C;e0Yy;a7ri4N;r,th;na68rBthem;im,l;aYeQiOoDuB;an,liBst2;an,o,us;aqu2eJhnInGrEsB;eChBi7Bue;!ua;!ph;dBge;an,i,on;!aBny;h,s,th4X;!ath4Wie,nA;!l,sBy;ph;an,e,mB;!mA;d,ffGrDsB;sBus;!e;a5JemCmai8oBry;me,ni0O;i6Uy;!e58rB;ey,y;cHd5kGmFrDsCvi3yB;!d5s1;on,p3;ed,od,rBv4M;e4Zod;al,es,is1;e,ob,ub;k,ob,quB;es;aNbrahMchika,gKkeJlija,nuIrGsDtBv0;ai,sB;uki;aBha0i6Fma4sac;ac,iaB;h,s;a,vinBw2;!g;k,nngu52;!r;nacBor;io;im;in,n;aJeFina4VoDuByd56;be25gBmber4CsD;h,o;m3ra33sBwa3X;se2;aDctCitCn4ErB;be20m0;or;th;bKlJmza,nIo,rDsCyB;a43d5;an,s0;lEo4FrDuBv6;hi40ki,tB;a,o;is1y;an,ey;k,s;!im;ib;aQeMiLlenKoIrEuB;illerCsB;!tavo;mo;aDegBov3;!g,orB;io,y;dy,h57nt;nzaBrd1;lo;!n;lbe4Qno,ovan4R;ne,oDrB;aBry;ld,rd4U;ffr6rge;bri4l5rBv2;la1Zr3Eth,y;aReNiLlJorr0IrB;anDedBitz;!dAeBri24;ri23;cDkB;!ie,lB;in,yn;esJisB;!co,zek;etch3oB;yd;d4lBonn;ip;deriDliCng,rnB;an01;pe,x;co;bi0di;arZdUfrTit0lNmGnFo2rCsteb0th0uge8vBym5zra;an,ere2V;gi,iCnBrol,v2w2;est45ie;c07k;och,rique,zo;aGerFiCmB;aFe2P;lCrB;!h0;!io;s1y;nu4;be09d1iEliDmCt1viBwood;n,s;er,o;ot1Ts;!as,j43sB;ha;a2en;!dAg32mEuCwB;a25in;arB;do;o0Su0S;l,nB;est;aYeOiLoErDuCwByl0;ay8ight;a8dl6nc0st2;ag0ew;minFnDri0ugCyB;le;!l03;!a29nBov0;e7ie,y;go,icB;!k;armuCeBll1on,rk;go;id;anIj0lbeHmetri9nFon,rEsDvCwBxt3;ay8ey;en,in;hawn,mo08;ek,ri0F;is,nBv3;is,y;rt;!dB;re;lKmInHrDvB;e,iB;!d;en,iDne7rByl;eBin,yl;l2Vn;n,o,us;!e,i4ny;iBon;an,en,on;e,lB;as;a06e04hWiar0lLoGrEuCyrB;il,us;rtB;!is;aBistobal;ig;dy,lEnCrB;ey,neli9y;or,rB;ad;by,e,in,l2t1;aGeDiByI;fBnt;fo0Ct1;meCt9velaB;nd;nt;rDuCyB;!t1;de;enB;ce;aFeErisCuB;ck;!tB;i0oph3;st3;d,rlBs;eBie;s,y;cBdric,s11;il;lEmer1rB;ey,lCro7y;ll;!os,t1;eb,v2;ar02eUilTlaSoPrCuByr1;ddy,rtI;aJeEiDuCyB;an,ce,on;ce,no;an,ce;nCtB;!t;dCtB;!on;an,on;dCndB;en,on;!foBl6y;rd;bCrByd;is;!by;i8ke;al,lA;nFrBshoi;at,nCtB;!r10;aBie;rd0S;!edict,iCjam2nA;ie,y;to;n6rBt;eBy;tt;ey;ar0Xb0Nd0Jgust2hm0Gid5ja0ElZmXnPputsiOrFsaEuCveBya0ziz;ry;gust9st2;us;hi;aIchHi4jun,maFnDon,tBy0;hBu06;ur;av,oB;ld;an,nd0A;el;ie;ta;aq;dGgel05tB;hoEoB;i8nB;!i02y;ne;ny;reBy;!as,s,w;ir,mBos;ar;an,beOd5eIfFi,lEonDphonHt1vB;aMin;on;so,zo;an,en;onCrB;edP;so;c,jaEksandDssaExB;!and3;er;ar,er;ndB;ro;rtH;ni;en;ad,eB;d,t;in;aColfBri0vik;!o;mBn;!a;dFeEraCuB;!bakr,lfazl;hBm;am;!l;allEel,oulaye,ulB;!lCrahm0;an;ah,o;ah;av,on",
    "MaleAdjective": "true¦0:048;1:04A;2:035;3:038;4:03Z;5:03A;6:04E;7:04F;8:02Z;9:03T;A:02E;B:03N;C:03J;D:01O;E:VA;F:043;G:033;H:047;I:006;J:ZU;K:03X;L:00M;M:Y9;aZ2bX3cSHdOTeM8fKEgJ4hIGiFGjF8lEMmCOnBWoB0p7Zqu7Xr5Ps3Kt2Cu25v13zé12à 11â026éNô3;b0Xc0Md0Lg0Jhon3l0Dm09n08oZHp04qu02r01tTvN;aQeOiHToN;caLl9;il5ntN;ré,uGé;c9nNpo2s04B;es03Co029;aTeShRinceCoPrNudI;angNiq9oK;er,l03Y;fZQi5nn4uN;fVUrZO;iopiDé2;i0rnG;b02Wgé;a02Gein3o03LudK;ar02CiN;disElONvaSY;aPerR1iOlo2ouNrouv4uis4;stoufCvNE;cé,scop1;no01Urp02Ata0;amou2erv4orG1;aPiHDoNu,écJ;ti6GuN;s7va0;cIil5nci00D;aReQimPoOu,éN;ga0vaL;ig6qTB;i6é;ct9Ové;bo2nYG;aNoïs00NrilWQypUZ;l,ré;en3ifTTuc02I;aWerVhTlaSoPrOuN;lé,ma0;as4it;euHlo,rOuN;lé,r3;cJné;boIRir4t4;aNeO;nc2pZV;ve5;il5rtR2;aOerl9l4RouNrécJ;illMLrifYO;hi,ucJ;la moH7venir;b2lé;a0Ie09iYoSrai,u,éNê03H;cu,gétaQhéme0nOrN;ifIo5;al,iNérIQ;el,tiD;l,riDt8;cRi5lPt8uOyaNû3;geBnt;lu,é;aNeBé;nt,tIE;al,i9V;bHcWdé,eUf,giClTn4XolSrRsQtOvN;a0ifSZ;aNré;l,mi6;cUSsé,uGé;al,g02Xil,tuGuRI;aXEeV9;!aA;illNtnamiD;i02Mot;eVLto006;in0YlUnRrNspULuf,x4;b1dPmOnGDr00Qsé,tN;!-de-gOAic1ébr1;eHYouTW;i,oXE;dOgeBtNu;i5ru;u,éD;ou3u;cRgQiOll02MntaMrIuN;dZ3t2;lCnN;!cu;aI6in1;a0haMilC;kraiXBlRniQrPsOtN;iZTérA;aZLuGé;baAge0;!latU2versG;cé2tN;raviolZZérY9;a0Pe0Ih0Hi0Eo06rRuPyroWSâtVUéNê028;léNnu,t8I;pho6vi7;!a0méfIniTSrNé;buQMc,g00M;aUemSiQoOuq9éN;buZ8pi01V;mp01Bnq9pY6uN;bl4vé,é;b1cZTmestFComphaNsYMvi1;l,nt;blNpé;a0oEé;ceBd00Jhi,nPpOumatiFvaill015îN;na0tYT;u,ézoïd1;ch4quillPsN;cX1i,pNvers1;aZVlKQ;e,iF;caMléHmb4nTquSrQscZRt1uN;ch4ffu,lousaArNt-puXD;ang8RbillV8mLXnN;a0oW9é;dVArR9tuN;!r4;aMé;du,itrS7na0;béSDg2mOntinnabuCré,s7tN;ré,uba0;b2iF2o2;e7CéâXY;chn5Ki0mpSnQrNutXSxZF;m018ni,rN;iNoMS;en,fi4toOG;dNtaQJu;re,u;or7Gé2;bXOil5mi7nQpPquArOs7tN;illXKo9;abisco3d8i,é;ageBé;ge0né;a1Cc1Ae14i0XnobiSXo0Np0Jt0DuUyQéNûr;dNlectiVRm00Wpa2roposWNvèXY;at8uN;cLi1F;mpaPnNriD;coX1diN;c1q9;!thiF;a0b02c00d-YffXggeNWiWpSrOspeN;ct,nND;aPbaEAdévelKQfaKge5huFWme6naturGpOvN;iva0ol3;eup5reUX;igu,n6;erOpNérWM;lQGo7;fNpo7;iVWlu;ciZLnEvi;iFoca0;aNc7R;fWXméWX;cNeBré;eY9uOV;conscPRit,jeQRlim009merXKord00DsOtFJurbaAveN;nQ3rs8;tanQ0éqPH;aRimuComac1rPupéfOy5érN;iXNéotyWE;aKia0;eWKiNucVS;ct,de0é;biXJliV0ndardi7;aTOecWOiriQ0oPécN;iNulYM;alXPfI;n8Nrt8;ci1ign4leYPmVnUphistVVrEt,uN;dSfQleYYpM2rPsOteNveP2;nu,rP1;-ent3BcrK;d,ia0;fNré;lé,ra0;aAé;geBn4;bWPnoO8;bSciU9dF8gnQmOnNt9;guW0i61;pleA2ulN;ta6é;a5ifiNé;a0cY4;yNMéWU;cRigneuMPmpiP4nOrNul,xuGya0;eApeRUré,vi;sOtiN;!mePK;atY3it8oCRuGé;!oWNrX3;andaWRel5intYIulptNélérXS;ur1é;b5cZge,haWLiXlWngUouTrrasAtQuOvNxVQ;a0oyaM;greSNtN;ilCé;a6iNu2;né,sfaiN;sa0t;diDl;la0uinN;!oNJ;i6Pé;gT8lCn9EsN;iYOonQJ;caY0erdot1rN;ifIo-sai0é;a1De0Li0Ho0Au07ythY8âV1éNêvY5ôVO;a05barbXEc03duKel,f02g00jZn1pVsStPusPVvN;eWRolNélO7;t4u;iOrN;ospeP5éci;ce0f;erXOiNoPT;dNg6sE;enOCuG;aPuOétN;it8é;bliWKgSSté;nL4raL;ouiY7;lé,ulNéJN;aLiVH;lécGYorXRrigér4;alcitHeNhaufTGonforEurWI;nt,pt8;ct8li7;bicoVKgU0iOr1sNtiC;taMLé;né,sseC;mSnRse,tWRuNy1;couCgOl4maAquAsP7tiN;er,nier;eNisF;!aMFoSR;d,fCgeBrRO;aApu;a0cOdé,golNngaMsq9tuGv1;aMo;aNhe;in,na0;b0Dc06do05f04je3l01m00nZpVsRtPvNçu;enNu,êXV;dicWE;arWWenNi2rous7;tTIu;caTXpPseOtN;a0rei0;mbCnUIr2;eVYlendTE;entPlVDoOrNtiS7u;odKZésentUP;sa0usF;a0i;aT9cont2du,omWWtHvMD;pVVua0;aNeWHié,uiFâcJég9;tiNxa0;f,oW5;aKou5roiT9u7;nX6ub5;hercJoPrOuN;eilVOit,lé;oquevV8u;mmWBnOuN;rGSveLG;nNstitNX;aSWu;atX5onS7uE;b02c00diZfYgXilQWmWnUpSre,sQtPvOyN;onRCé;agWCiWS;aBGioVRé;a0sN;asIuH;iAMpN;or3rocJ;cNgé;i,uOG;as7ifIolV7pa0;eBoûE;fi6raîchSI;al,c1n,oaN6;iNoQI;al,sTC;atWOelaiOBougUJ;aNiUDotiTE;lO3nd mê8C;a20e1Qh1Ni1Kl18o0UrXuTyramid1âlDTéN;cUEda0jMTnQriVXtN;aOilCrNuCé;ifIoSU;nt,raWA;aNétH;l,rd;a0bPc3JdiC3isFni,rNtasO3érBL;!iNpurAuKV;ficaLtaA;iDlic;at0Ie0Gi0BoXuWéNêtRG;cTdSfRmQnat1oc7Rpo7sPtOvNétabUM;ePNoQW;enIT;e0idLVuVJ;aH0édi3;abrS0é2;aLesAI;iNé8Z;pi3té;de0sNN;ba0chZduYfXgramVChiFJlWmVnonQEpTsStQuUZvNémi92;enç1iOoN;ca0q9;dLLnRY;eNubéHéT3;cLsE;crKt2;iFIoNre67;rLJsé;etLpt,u;i2EonSXétaT0;essUDoSY;ctJIit;aAe;mQnOsMXvN;at8ilégIé;ciNtaN4;er,p1;it8ordi1é;miSIna0ssN;a0enS8é;iqID;cJiYlWmp02nVrtUsQtOuN;d2rT3ssUV;agSDeN;lé,nL0;it8sPtNé;al,éN;!rR7;eT2éU9;at8eBoRN;cL1dé2tifR9;iNynéMQ;!cP2ssRItiS6;gPAlu,ntNv2;eBu,é;aVeSiRoQuPéN;bNniS0;éiD;s,vi1;mEFnT3;a0s7;in,urN;a0nichN;aMeB;cé,iOnNq9ti6;!a0q9té;nt8sa0;afLVcaMmOqu4tNvoEétR3;ié,toresqHL;en3pa0;ilOosphorT2énN;iRNomén1;ippAosop9S;ct03inVlé,nUrPsOtKuN; imporR3p5;a0tilK4;cuEdu,forQlé,ma7HpéKBsOtNverR7çO4;i7GurDX;an,isEuaG3éN;cu3véH;a0ma0é;aILcJdu,sa0tu;aMt;i08lpiEn07rXsStOuTKvé,yNïD;a0sS9é;aIHePie0rN;iNon1;arc1ciD;ntP8rnG;sOtN;or1;a0iNé;f,onnN;a0el,é;aUcheGKeTfSiRl4oissi1tNveNBé;aPiN;al,cNel,sRX;iPWuQ5;gé,nt;gAZsiD;aKuT3;il,nt1;dox1guayDlys4noN;rm1;su,teCé;ll1Xr;b0Dc0Ador08ff06is8lfaJZm05nd04pZrSsé,ttomRNuNxygé6;a3blItPvN;eHQrN;aQPiQJ;il5rN;aRNecuiT8é;aSbIWcheRdQgPiNné,phelA;eAWginN;al,el;ani7;on6u7Q;st2;l,nQG;alApOt52uHPérN;atRVé;oOrN;esFiSH;r4Ksé;oNQul4;b0Lniprése0;ensNiODra0usq9;a0if,é;a0iN;féH;cNtogG5;asRKiNup4;deIZpIC;lPsNéOJ;cBeNti6éd4;rRRssRG;igNong;aPNea0é;a05e04i03oRuPéN;!gNvro7;at8ligFR;!anN0lNméro3pM6trO9;!laM;c8irXmVnchaCrRtQuNvaLyé;rriOvNé;eau;!ciPIsF;oiPEé;d-OmaNvéKD;l,nd;afOUcN;oréD;inaNmé;l,t8;!aGKci;cke5ppON;stoPHt,urFF;c2iUpolTrrQPsStQuOvNzi,ïf;al,r4;fNséa7S;raPA;al,iNurG;f,on1;al,ilKP;iIVéoMU;n,sF;a13e0Vi0No03uWéOê3MûrN;!isF;cTdOfHPl4BnagOWpriFriNtropoliIR;diF2ta0;iNu7;aPcOtNév1;at8erranéD;al,in1o-lég1;n,teB;ha0onHN;et,gNCltiSnicip1rRsPtN;a0iNuG;lé,n;c5icNq9ulmPM;al,iD;al,muH;na2IplI;biNRc6Pd05i03llP5m01nWqueBrTtSuNyD;chQil5lPra0sOtL0vN;a0emBO;su,tacFD;a0u,é;aMe3;iQ9oCR;al,dOf1i6XmNOtN;!-6el,ifH2;a0o2u;dQgolPopareHAtNuH9;aNé;gJ0nt;!iD;aAi1;enNifI;ta6;nNré,si;dNWs;ifIé2;gRliEnProOtN;oyDé;boCiE;eBiNuscuCWér1;er,m1sté44;nNraL;aMonN;!nOE;ilKFnQsPuNxiOO;b5rtriNsiD;!er;quAu2;aPsOtNu;al,eB;ongNJtruGuG;cé,ça0;boul,chQCg02igr01jeBlXmeHKnVrRsQtOudKximum,îtrN;e,i7;eG0hématiNHin1riNutQAé3Q;ciGmoni1;culAq9s8;b2chaNKgQ7iPoOBqu4ra0tN;iNyr;al,en;t1é;ié2qu4uN;el,scrK;aOfJNin,oNsaAvePA;doHuA;dNi7;e,if,roK;elNQichMG;isMKyar;a00eZiUoQuPâcJéN;cJgNn1AzarP0;al,er,islOG;!brHCcrOFiFminODst2théN6xurFQ;calNIinGRmbaMnOrEYti,uNy1;c53rdE3é;doKOgN;!itudPO;bPgo3mOp1CtNé;tHGuaKL;i3ousA;ertAidPKérN;a3Vé;nt,vé;bi1cTiSnRq9rPsOtNvé,xO4;e0in,ér1;c8sa0;gNmoK5;e,ué;ciJOguL5;d,tiMG;rym1é2;aSeQoOuN;biCif,ré;i0li,ncJuNvi1;eBffGEiN5rnaLLé;té,uneN;!t;casFillKWloux,unN;e,iOV;di6Cgnor4ll2Km1VnSrPsOtN;aJNinéH;o5raéJMsu;aJXi7rN;atNPiEéN;el,guLBsoG4;a1Jc18d10e0Vf0Ng0Mh0Li0IjustGFn0Ho0Dqui0Cs03tSuRvOéN;dKg1;aincu,estiOiNé1K;o5ta0;!gaL;si3tiM8;aOMeQo8MrPuKGéN;gr6BrN;eL4ieB;ansiMXi65;llSmpeBSnRrNstinH5;allIcontineESdKlBGmitENnOpo7roN;gN6m08;aNé;tiBT;s8tiOK;ecEFiBK;atisfaKcrKen7iToRpir4tOuN;ffiFlE;antOinEUruN;ct8it;!a6;le0uN;cE6mis,pçOC;gnNnF0pi1YsE;ifE4;et,siBEéE;cPffeE9nNApNuï;porNéH;tun;cuKA;oMOé;ntNti1;erromNéresF;pu;abitCWos1Ru35éM4;rMEéHD;aLEeTiniRlD4oOâNérJX;me;nMYrN;mNtu6;aJ2el,é;!tésN;im1;ctIWrn1;mploJGxN;aNIisEpN;lNreLJérim7Y;iq9oN;i3ré;iQoPuOéN;ce0fi8GpITterA7;!lAKst0V;-eurB3le0;caLen,fféLLgPq9reNAsNviduG;cNtinN9;iAArL4;e0né;aVeUhTiSli6oNurMC;héLGmplL1nN;dLYgA2nu,sOtNveHJ;i0Crô5;cCNiNo5titutLX;dé2sE;de0s8;anKD;ndIrE1sF;ndLLrN;cé2né;cRdQlPniMEpOrticu5ssouI6ttenNvo9;du,t8;erçu,proprI;té2;ap3éLC;heLWt8;ag0Ab09i3m01pN;aYerWlVoTrPuOérN;at8i1;de0isFls8r;essiGDoPuOéN;g6vu;de0;duD3mpMOvi7;ll9rtNs4te0;a0un,é;an3oH;soLAtiN;ne0;ir,rNtBXyé;faKti1;aRerJOiQoOéN;diKVmo9Mri3;biIQdé2rN;al,tG;g2ne0;cu5tN;uJ9éN;riG;i5Su;inKRé;imi3uNég1;mi6st2;a03e01i00oVuTyRâPéNôteIG;bé3rNsiEtérY;is7;lé,tN;e,if;briNdraE;de;i5mNpI3rC;aAili4;llywooIMmQnnêIIrOsN;pitaI6;izoBYm92riN;fIpiC;oseF5;laHndI9tléJ1vern1;rNur3xag8Y;bu,culéD;biQcJgaMlPnOrNuCK;aI0ceCdi,n4Z;dicaHRté;eEluc5N;lOtN;uKYé;i3lé;a0Oe0Li0Jl0Fo0CrXuRâ3éNên4;a0mH5nNorDE;iOéraN;l,teB;al,t1;erRiNtGXéJ6;llOnN;dé,éD;erIYoN;ti6;riI8;aWeViRoNéco-ro0B;ndeBsOuN;ilCpé;!siN;er,sF;ffDWllPmOnIZsN;!a0onF8é;aIXpa0;aI5é;c,lotEnu;is7mmatH0ndPsOtuKvN;e,itatJJé;!soui71;!iN;loq9YsF;gueCNnOuN;aEGdrKQlu,rHYverneAT;do5fl4;aOisFoNua0;usF;cNpGB;i1é;rondNtIMv2;!in;igCEntOrNsticuC;maA;il;gn4iTlRmAn3rPuN;cNf2;he;antCTdNni;iDé;a0bé,oN;n6pa0;!lCX;a16e11i0Wl0Lo09rYuRâcJéNê5;cPdOlAmNod1ru;inAor1;ér1N;al,oHC;gSlRm4rPsOtNya0;ur,é;e5il5;eLiNt8;boH7;guHmiE5;it8ueB;aVeUiSoPuOéNôDM;mFJquentEZtIZ;g1itDSst2;iOnNufrouE;cé,taG2;d,s7;aGYgorB5n14pé,q9sN;sD9é;la3uGD;cNgm3Wis,nco-aG2pp4te98;aFYtu2;c1et1llH9nUrPuN;!droE6isseBrNtu;bu,c7Ini,ré;aAcQesBKmPtN;!ifIuN;it,né;el,u5é;e6é;cPdN;aNé;ment,nt,teB;iGAtHXé;aSeRiQoOuNâneBécJ;et,orHOvi1;rNtEu;al,eBHisF;caMpF6;mmaMuGX;gPmNpi,tL;aGAbN;a0oDN;eNra0;l5oC;cQdè50er,gPli1nNsc1xé;aNiIL;l,nciFW;urFWé;e5hu,t8;i0n5DrPsAGuN;illNt2;e3u;mNré,ve0;en3é;ci1de,go3iVlUmSnRrQsciCVtOuNvoGH;bouFWcJt8x;al,igN;a0ué;ci,fe9N;farEXé;iliNé;al,er;ot;m,nBVsHFt maisET;ff1Ym1Kn0Frr0Es09ur5YxN;a06c02e01iZoYpStOuN;béHlE;erminaLraOéN;nu4rE8;conjug1vaN;ga0;a87e6DlQo7reG1ul7éN;dDSrimeN;ntN;al,é;icGLoN;i3raLs8;né2rbiE;gNlé,sE;ea0u;mpt,rCB;eOit4luN;!s8;l6BptNss8;ioGIé;cNgé2lt4spéH;er1At;carDVpaQsOtN;!iv1omDUudiaA1;eNouff5;n7Cu5;cé,gnol;a0o6; 0Qc0Kd0Ef0Ag08ivHj07l06n05r00sWtPvN;a02elopp4iNoûE;rB3saEP;aFEeShousiasE3iEIou2rNurYêt4;'oQaPeNoQ;bâFCcouDKlaBTpNteAT;o7reBM;nt,vé,î6;uve5J;n3Wr2;aPeOoN;leF6mmeF6rce5;igBGmb3BveFK;b5ngl06;aQegistB8huGIicPoOuN;ban6;bé,ué;hiGS;ci6gé;eiE8uCR;eFZu3N;o9ôAQ;ag8Bl9oN;rE4urCR;a98erG8iPlOoNuG8;nB9ui;amG6é;lé,év2;euEPiPoOurN;a0ci;loEKmmaDXrmi;aNma1T;b5mN;an3;aRhPlOoNr4Cu5;mbr4uraES;e1Oin;aNevêt2;ntFRî6;is7st2;avan05désordDEor;bTmSpN;aPe7ier2oOrNâ3êt2;es7isGDun3;r3ussié2;il5nNq24;acJ;erd7Jito93u2ê5;aSouQrOuNêE;sq9é;asNouE3uFI;sé,é;cJrN;bé;l5rraCF;aSeRiOlanq9ond2rN;ay4on3é6;cNlé;aNie0;ce;ct8rvED;cé,rN;a0oNé;ucJ;a38e31i23o1Xr1Uu1SéNû;b1Oc1AdicaA5f12g0Wha0Vl0Sm0Mn0Kp0Ar07sWtRvNçu;ast53eOoN;lu,ra0t,ué,yé;lNrgonEQ;opBS;aQeNo4Jraq9;nOrmN;in4;du,teB;cJil5;aWeVhUiSoPuOéquilN;ib2;et,ni;bliDLeuv2l4piCrN;dFDiN;en3;g6nNré;car6téres7;abD6onoHydra3éri3;mpa2rtADspé2;bu7ffec3pprobaLrEJ;aOiE5oNég5;bé,uE;ci6ng6H;aUeSlQoOrN;aE1eCXim4;itraCYli,r3uN;il5rvu;aNoAP;cé,iF;i0nNup5;aCTda0;rNs7;eCRte4X;aNuDV;tu2;ePoOuN;ni;dé,n3raC3;ntNsu2;!iN;!el;aOiN;bé2cCZnq59ra0é;b2is7vé;ncJ;aBOingDIling9oQrPuOéN;né2;enCCi7;ad4os5E;nf5uNût4;li8KrA6tE;aRenQiOoNraîcCHu0éCF;n8Orm4;c3Ngu2niN;!t8;du,s8;iOvoN;ri7;lCt;aZeYhUiTla2oPrNulot3éD5;iNo9RépK;t,é;lPmpo7nOrB2uN;pé,rag5Csu,ve26;cerEtrac3;le3o2;dé,s8;aPiNu;qNr4;ue3;r6us7î6;nt,va0;de0lé;aOorDHrNuE;aBLiCQ;rq9ucJ;bitC5c1rNve3;!ci;aco8Fes7oOu,ôN;le;g9it;du,le0mQn6rPté,uN;a50b5iNx,é;llB4;ma0s1é;inNp3;a2Mic1;a0Icta0Gffér0Fg0Dl0Bm0Ang09plôCNr07sQt,vN;erOiNor7O;n,sé;ge0t8X;c00gracIjoi0lZpXqual4NsTtN;a0enRinPrN;aNib9;it,ya0;ctNg9;!if;du;iPolOéN;mi6;u,va0;de0mul2Apé;aNer7o7ropor2Nu3;ru;oq9;iOoNrAI;nti66rCK;pli6;ectNig43;!ioBE;ue;ensBBin9;a3iN;ge0;eNit1ne;st8;e0é;toN;ri1;gNma4R;on1;hors,mSntRr3XsN;cPsa5tN;i6rN;ucL;enC1ript8;e5é;eu2i;ctylographIlto71mNnFté;as7né;a3Me3Ih2Yi2Vl2Mo09rVuQyclPâlAéNô47;lèb91réN;a8Dbr1;opéD;baAiOltNrAJta6;iAYurG;rOsNt,v2;a0i6;as7;aYiWoSuQéN;atOne5pN;iEu;eBif;!ciNel;al,fI;cPisOq2Et3uNya0;la0stAT;sa0é;hu;aMminGstaN;llA;int8moi2JquN;a0e5;c1Ydé,gn74hé9Li1Xl1Sm1En01opérA0qu00rTsRté,uN;cJl4Jp4rOsu,tumi8HveN;rt;bé,on6tNu;!aO;su,taN;ud;di1n45pQrNsé,t7EéD;eNi8Gos8;ctNsponB0;!eBio9W;orOuN;le0;at8el;et,in;!c0Ud0Sf0Lg0Ij0Hnu,quéHs06tTvNçu;aReNivi1ulsAJ;nOrN;ge0ti;tNu;io9MuG;inc4Ll9D;eViToSrN;aOefaits,it,ovN;er7;ctOiNri4s3;g4Znt;uGé;ur6;gu,nN;e0Rge0uG;mpOnN;t,u;l93oN;raA;ac2cWeUiTolRtPéN;cut8qN;ue0;a0ern4ituNru0T;a0t92é;aNi9F;nt,teB;g6sE;nErvN;aLé;ie0;oi0ug1;eOénN;it1;lé,sV;iQlicZond3SrN;aNon3;teN;rnG;a0dNné,r9Bsq9t;enN;tiG;am6iNucL;ti9V;ePilOl0Jor9Mr7JuN;pis8Dr7X;ia0;nt2pNr3;tuG;bZmWpNé6F;aUen7lToQrOuls8éN;te0;es7i8YometEéheN;ns8;rteNs4;meN;nt1;aiFet,iq9;ct,r6Is7t55;an8HeOun1VémN;or7X;n7Br5E;atEi6lé;lOoN;ni1ré,ss1;aOeNégi1;ct8;nt,t0X;!f48n3K;ardi66h5Ku;aRiQoOéN;me0r57;is92uNît2;té,é;gnoEma48nqPqueE;irPndestAqOssN;e,é;ua0;!on34se88;nOrconspe8Ose5tNvil6I;adAé;gl4t2;aXeViToRréQuchoEâOéN;ri,t8;taA;ta0;tiD;cola3iNqu4r1ucaMyé;si;a0c,ffNliDrurg4P;on6ré;nu,r,veN;lu;grAm1WnTpeau3rPs7to34uN;d,fNs7ve;fa0;bPgé,mOnN;el,u;a0eB;onV;ceCgNta0;ea0é;nPrN;né,tNv4B;ifI;d2sé,tr1;botAch06de05l03mZnne5outchou3pXrPsNtal66uFva4F;aNq9s4till65;ni53;aScRd7XesFiQmi6nOré,téN;siD;asNé;si4Z;ca3It6G;ér1;ctériNmé59;el,sé;itNt8;al,on6;bOpagNé;naM;odNré;giD;cNifor2Ié;i6u5;n1Zt;otNé;ti4K;a15e11i0Tl0No08rWuVyzaUâSéOêN;c5Ata;aPdouAga23nNt7G;iNédictA;n,t;nt,t;c0CtN;aMi;ntA;cc1ri6té;aVeUiToQuNési1Rûl4;isFnOtNya0;!al;!i;cJdé,nzé,uNyé;illNteB;on,é;dé,lCnguebaCsa0;ss52t3Fve3;ilOnN;cJla0;laM;i7mb00nYr6ssXt3uN;cVdUffTillSlRrNs4St6V;d0Fguign39rPsN;i3UoN;uf5;u,é;evers4ot;a0i,on0X;a0eBi,on;eBi6;hé,lé;e5u;!dNnaM;isFé;ar5Ké;aQeOin5JoN;nd,q9t38;ss4t,uN;!i,té;faMncNsé;!hi61;d2QenRgQrm4DsNzar39;corOeN;xuG;nu;ar2;-ai5IfOsNtôt,ve5B;éa0;aiF;auPdOlligéHrceBsNur2;ti1;on09;!cer2F;fo9g00lWnUptism1rSsRtNvaM;aOtN;a0u;ilN;leB;a6é;bNio5ré;a0e5ou3Pu;c1d4lieusaMni;rd;aPeinOlNza2S;a0on6;i2Oé;deBn00;arNué;reB;b50c4Ad3Wf3Ig3Ahu39i33j31l2Fm26n1Fp15r0Ts0Ft03uYvPzu2érNî6;iDoNé;nav1por3;aTeQiPoNé2;isiNr3ué;na0;l12né,sé;nOr24uglN;a0e;a0tu2;c3FnNrI;cé; delà,d0Ur26straQtNvergn3M;oNrichiD;colCma0DriN;sé,té;liD;héXroWtN;aUeQiPrNén9;aNib9;ya0;ra0t2;i0nN;dOtiN;f,on6;r0Ju;b5ch4r3V;ce,phI;niD;cZeXo0RpWsOtrN;al,ei0;assinTerSiRoNu2y1Y;cIifPm23r1FuN;pi,rN;di4A;fé;du,mi5s3é1Q;vi;!é;hyxIir21;pNx9;ti7;en45;chitecXdWgentVméUq9rPtiNyD;cu5fiNsan1;ciG;aPiOoNê3;ga0n02sé;vé,é2;cJn2D;hé;!niD;in,é;e0u;tur1;aiFeu2la0SpOérN;it8;a22lTrPuOétN;isF;yé;oNê3;fonOprIu2Txim2D;ié;di;iq9;a0Bc09dal08g02im00kylo7nXoWtN;iPéN;diluviDrN;ieB;aé0WcPdéraOsoN;ci1;pa0;iOlérN;ic1;pé;dArm1;e5onciaLuN;el,lé;teB;aNé;li0C;lo-OoiN;ss4;aOsaxN;on;méN;ri15;ou;esNiDré;tr1;l,rchisN;te;aig0PbTer,iSorRpQuFéN;lio2riN;caAnN;diD;ou5u3;ti;c1nci2I;iNré,uC;a0gu;a05c03e02gé00ig6lUpAsaTtQvPéaN;toiN;re;éo5;ernOiNé2;er;at8é;ciD;eQonPuOéN;cha0;mé,s8;gé;maN;nd;riD;en;r3xandrAz0C;alAooN;li7;ngOrN;ma0;ui;ouNus3;ré,té;gOlé,mNsé;a0e,é;rOuN;!i7;elNi;et;ri1L;aTenRi3oniFreQuN;erOicN;heB;ri;ss8;ouN;il5;ça0;fQghPriN;caA;in;an;aTeSilRliQol4rOéN;re0;ancNioC;hi;gea0;ié,é;ct0V;iNmé;bNré;li;dWhéUjaTmiRoProKéN;quN;at;lNpt0O;esP;nistrNrN;at8;ce0;re0s8;if;itN;ioN;nnG;el;cYhTidu5tOé2;ré;iPuN;ali3el;té;f,vé;lé;aOeN;vé;lNr6;anN;dé;abl4ent9identYoUrQuN;eNsé;ilC;la0;oNu;chNupi;eBé;ur;mOrt,utuN;mé;mo01pN;ag6li;el,é;ué;a03dom01erHjeYoWrSsOusN;if,é;e0oOtraK;it;lu,rb4;a0é;acadabHuN;pt,tiN;!sF;sa0;li,nN;da0;ct;ra0;nt;in1;al;is7ndOtN;tu;on6;né;sé",
    "WeekDay": "true¦dim7jeu6lun6m2sam1ven0;!d3;!e3;ar3er0;!c0;re0;di;!di;!anche",
    "FemaleName": "true¦0:FU;1:FY;2:FN;3:F9;4:F8;5:FO;6:EN;7:EL;8:EV;9:GB;A:G7;B:E1;C:G4;D:FK;E:FH;F:EC;aDZbD2cB5dAGe9Ef8Zg8Gh82i7Rj6Tk5Zl4Nm37n2So2Pp2Equ2Dr1Ns0Pt03ursu6vUwOyLzG;aJeHoG;e,la,ra;lGna;da,ma;da,ra;as7DeHol1SvG;et7onB6;le0sen3;an8endBLhiB1iG;lInG;if39niGo0;e,f38;a,helmi0lGma;a,ow;aLeIiG;ckCZviG;an9VenFX;da,l8Unus,rG;a,nGoniD0;a,iDA;leGnesE9;nDIrG;i1y;aSePhNiMoJrGu6y4;acG0iGu0E;c3na,sG;h9Lta;nHrG;a,i;i9Iya;a5IffaCFna,s5;al3eGomasi0;a,l8Fo6Xres1;g7To6WrHssG;!a,ie;eFi,ri9;bNliMmKnIrHs5tGwa0;ia0um;a,yn;iGya;a,ka,s5;a4e4iGmC9ra;!ka;a,t5;at5it5;a05carlet2Ye04hUiSkye,oQtMuHyG;bFGlvi1;e,sHzG;an2Tet7ie,y;anGi9;!a,e,nG;aEe;aIeG;fGl3DphG;an2;cF5r6;f3nGphi1;d4ia,ja,ya;er4lv3mon1nGobh74;dy;aKeGirlBKo0y6;ba,e0i6lIrG;iGrBOyl;!d6Z;ia,lBT;ki4nIrHu0w0yG;la,na;i,leAon,ron;a,da,ia,nGon;a,on;l5Yre0;bMdLi8lKmIndHrGs5vannaE;aEi0;ra,y;aGi4;nt5ra;lBLome;e,ie;in1ri0;a02eXhViToHuG;by,thBI;bQcPlOnNsHwe0xG;an92ie,y;aHeGie,lC;ann9ll1marBDtB;!lGnn1;iGyn;e,nG;a,d7V;da,i,na;an8;hel53io;bin,erByn;a,cGkki,na,ta;helBWki;ea,iannDUoG;da,n12;an0bIgi0i0nGta,y0;aGee;!e,ta;a,eG;cAPkaE;chGe,i0mo0n5EquCAvDy0;aC9elGi8;!e,le;een2ia0;aMeLhJoIrG;iGudenAU;scil1Uyamva8;lly,rt3;ilome0oebe,ylG;is,lis;arl,ggy,nelope,r6t4;ige,m0Fn4Oo6rvaB8tHulG;a,et7in1;ricGsy,tA7;a,e,ia;ctav3deHfATlGphAT;a,ga,iv3;l3t7;aQePiJoGy6;eHrG;aEeDma;ll1mi;aKcIkGla,na,s5ta;iGki;!ta;hoAZk8AolG;a,eBE;!mh;l7Rna,risF;dIi5OnHo23taG;li1s5;cy,et7;eAiCL;a01ckenz2eViLoIrignayani,uriBDyG;a,rG;a,na,tAP;i4ll9VnG;a,iG;ca,ka,qB1;a,chOkaNlJmi,nIrGtzi;aGiam;!n8;a,dy,erva,h,n2;a,dIi9HlG;iGy;cent,e;red;!e6;ae6el3G;ag4JgKi,lHrG;edi60isFyl;an2iGliF;nGsAJ;a,da;!an,han;b08c9Cd06e,g04i03l01nZrKtJuHv6Qx86yGz2;a,bell,ra;de,rG;a,eD;h73il8t2;a,cSgOiJjor2l6Gn2s5tIyG;!aGbe5PjaAlou;m,n9P;a,ha,i0;!aIbAIeHja,lCna,sGt52;!a,ol,sa;!l06;!h,m,nG;!a,e,n1;arIeHie,oGr3Kueri7;!t;!ry;et3IiB;elGi5Zy;a,l1;dGon,ue6;akranBy;iGlo36;a,ka,n8;a,re,s2;daGg2;!l2W;alCd2elGge,isBDon0;eiAin1yn;el,le;a0Ie08iWoQuKyG;d3la,nG;!a,dHe9PnGsAN;!a,e9O;a,sAL;aAYcJelIiFlHna,pGz;e,iB;a,u;a,la;iGy;a2Ae,l25n8;is,l1GrHtt2uG;el6is1;aIeHi9na,rG;a6Yi9;lei,n1tB;!in1;aQbPd3lLnIsHv3zG;!a,be4Jet7z2;a,et7;a,dG;a,sGy;ay,ey,i,y;a,iaIlG;iGy;a8De;!n4E;b7Rerty;!n5P;aNda,e0iLla,nKoIslAOtGx2;iGt2;c3t3;la,nGra;a,ie,o4;a,or1;a,gh,laG;!ni;!h,nG;a,d4e,n4L;cNdon7Qi6kes5na,rMtKurIvHxGy6;mi;ern1in3;a,eGie,yn;l,n;as5is5oG;nya,ya;a,isF;ey,ie,y;aZeUhadija,iMoLrIyG;lGra;a,ee,ie;istGy5A;a,en,iGy;!e,n46;ri,urtn97;aMerLl96mIrGzzy;a,stG;en,in;!berlG;eGi,y;e,y;a,stD;!na,ra;el6NiJlInHrG;a,i,ri;d4na;ey,i,l9Ns2y;ra,s5;c8Ti5WlOma6nyakumari,rMss5KtJviByG;!e,lG;a,eG;e,i75;a5DeHhGi3NlCri0y;ar5Ber5Bie,leDr9Cy;!lyn70;a,en,iGl4Tyn;!ma,n30sF;ei6Zi,l2;a04eVilToMuG;anKdJliGst55;aHeGsF;!nAt0W;!n8U;i2Qy;a,iB;!anLcelCd5Uel6Yhan6GlJni,sHva0yG;a,ce;eGie;fi0lCph4W;eGie;en,n1;!a,e,n34;!i0ZlG;!i0Y;anLle0nIrHsG;i5Osi5O;i,ri;!a,el6Mif1QnG;a,et7iGy;!e,f1O;a,e6ZiHnG;a,e6YiG;e,n1;cLd1mi,nHqueliAsmin2Svie4yAzG;min9;a9eHiG;ce,e,n1s;!lGsFt06;e,le;inHk2lCquelG;in1yn;da,ta;da,lPmNnMo0rLsHvaG;!na;aHiGob6R;do4;!belGdo4;!a,e,l2E;en1i0ma;a,di4es,gr5O;el8ogG;en1;a,eAia0o0se;aNeKilHoGyacin1M;ll2rten1G;aHdGlaH;a,egard;ry;ath0ViHlGnrietBrmiAst0V;en22ga;di;il72lKnJrGtt2yl72z6A;iGmo4Eri4F;etG;!te;aEnaE;ey,l2;aXeSiNlLold11rIwG;enGyne17;!dolC;acieHetGisel8;a,chD;!la;adys,enGor3yn1X;a,da,na;aJgi,lHna,ov6ZselG;a,e,le;da,liG;an;!n0;mYnIorgHrG;ald35i,m2Stru71;et7i0;a,eGna;s1Mvieve;briel3Fil,le,rnet,yle;aReOio0loMrG;anHe8iG;da,e8;!cG;esHiGoi0G;n1s3U;!ca;!rG;a,en42;lHrnG;!an8;ec3ic3;rHtiGy9;ma;ah,rah;d0FileDkBl00mUn48rRsMtLuKvG;aIelHiG;e,ta;in0Ayn;!ngel2H;geni1la,ni3Q;h50ta;meral8peranJtG;eHhGrel6;er;l2Pr;za;iGma,nest29yn;cGka,n;a,ka;eJilImG;aGie,y;!liA;ee,i1y;lGrald;da,y;aTeRiMlLma,no4oJsIvG;a,iG;na,ra;a,ie;iGuiG;se;a,en,ie,y;a0c3da,nJsGzaH;aGe;!beG;th;!a,or;anor,nG;!a;in1na;en,iGna,wi0;e,th;aVeKiJoGul2T;lor4Zminiq3Wn2ZrGtt2;a,eDis,la,othGthy;ea,y;an08naEonAx2;anObNde,eMiLlImetr3nGsir4S;a,iG;ce,se;a,iHla,orGphiA;es,is;a,l5H;d0Grd0G;!d4Lna;!b2CoraEra;a,d4nG;!a,e;hl3i0mMnKphn1rHvi1XyG;le,na;a,by,cHia,lG;a,en1;ey,ie;a,et7iG;!ca,el1Bka;arGia;is;a0Re0Nh05i03lUoJrHynG;di,th3;istGy05;al,i0;lOnLrHurG;tn1E;aId27iGn27riA;!nG;a,e,n1;!l1S;n2sG;tanGuelo;ce,za;eGleD;en,t7;aIeoHotG;il4A;!pat4;iKrIudG;et7iG;a,ne;a,e,iG;ce,sY;re;a4er4ndG;i,y;aPeMloe,rG;isHyG;stal;sy,tG;aHen,iGy;!an1e,n1;!l;lseHrG;i9yl;a,y;nLrG;isJlHmG;aiA;a,eGot7;n1t7;!sa;d4el1NtG;al,el1M;cHlG;es7i3D;el3ilG;e,ia,y;iYlXmilWndVrNsLtGy6;aJeIhGri0;erGleDrCy;in1;ri0;li0ri0;a2EsG;a2Die;a,iMlKmeIolHrG;ie,ol;!e,in1yn;lGn;!a,la;a,eGie,y;ne,y;na,sF;a0Ci0C;a,e,l1;isBl2;tlG;in,yn;arb0BeXianWlVoTrG;andRePiIoHyG;an0nn;nwCok9;an2LdgKg0GtG;n25tG;!aHnG;ey,i,y;ny;etG;!t9;an0e,nG;da,na;i9y;bbi9nG;iBn2;anGossom,ythe;ca;aRcky,lin8niBrNssMtIulaEvG;!erlG;ey,y;hHsy,tG;e,i0Yy9;!anG;ie,y;!ie;nGt5yl;adHiG;ce;et7iA;!triG;ce,z;a4ie,ra;aliy28b23d1Kg1Gi18l0Rm0Mn00rVsMthe0uIva,yG;anGes5;a,na;drIgusHrG;el3;ti0;a,ey,i,y;hHtrG;id;aKlGt1P;eHi9yG;!n;e,iGy;gh;!nG;ti;iIleHpiB;ta;en,n1t7;an19elG;le;aYdWeUgQiOja,nHtoGya;inet7n3;!aJeHiGmI;e,ka;!mGt7;ar2;!belHliFmT;sa;!le;ka,sGta;a,sa;elGie;a,iG;a,ca,n1qG;ue;!t7;te;je6rea;la;!bHmGstas3;ar3;el;aIberHel3iGy;e,na;!ly;l3n8;da;aTba,eNiKlIma,ta,yG;a,c3sG;a,on,sa;iGys0J;e,s0I;a,cHna,sGza;a,ha,on,sa;e,ia;c3is5jaIna,ssaIxG;aGia;!nd4;nd4;ra;ia;i0nHyG;ah,na;a,is,naE;c5da,leDmLnslKsG;haElG;inGyW;g,n;!h;ey;ee;en;at5g2nG;es;ie;ha;aVdiSelLrG;eIiG;anLenG;a,e,ne;an0;na;aKeJiHyG;nn;a,n1;a,e;!ne;!iG;de;e,lCsG;on;yn;!lG;iAyn;ne;agaJbHiG;!gaI;ey,i9y;!e;il;ah",
    "Month": "true¦aDdAf7j2ma1novBoct0septB;!oB;i,rs;an3ui0;l0n;!l0;!et;!v2;ev0év0;!r0;!ier;ec0éc0;!em0;bre;out,vr0;!il",
    "Country": "true¦0:3I;1:2Q;a31b2Hc25d21e1Tf1Ng1Ch1Ai13j10k0Yl0Tm0Fn04om3MpZqat1KrXsKtCu6v4wal3yemTz2;a28imbabwe;es,lis and futu33;a2enezue38ietnam;nuatu,tican city;.5gTkrai3Cnited 3ruXs2zbeE;a,sr;arab emirat0Jkingdom,states2;! of amer31;k.,s.2; 2Ba.;a7haBimor-les0Ao6rinidad4u2;nis0rk2valu;ey,me37s and caic1X; and 2-2;toba1N;go,kel0Znga;iw35ji2nz31;ki33;aCcotl1eBi8lov7o5pa2Gri lanka,u4w2yr0;az2ed9itzerl1;il1;d30riname;lomon1Zmal0uth 2;afr2LkKsud2Y;ak0en0;erra leo2Rn2;gapo2Lt maart2;en;negJrb0ychellX;int 2moa,n marino,udi arab0;hele2Aluc0mart24;epublic of ir0Dom2Mussi27w2;an2B;a3eGhilippinSitcairn1Oo2uerto riL;l1rtugD;ki2Ll3nama,pua new0Xra2;gu5;au,esti2F;aAe8i6or2;folk1Mth3w2;ay; k2ern mariana1G;or0R;caragua,ger2ue;!ia;p2ther1Dw zeal1;al;mib0u2;ru;a6exi5icro0Co2yanm06;ldova,n2roc4zamb9;a3gol0t2;enegro,serrat;co;c9dagasc01l6r4urit3yot2;te;an0i1A;shall10tin2;iq1R;a3div2i,ta;es;wi,ys0;ao,ed05;a5e4i2uxembourg;b2echtenste16thu1P;er0ya;ban0Lsotho;os,tv0;azakh1Oe2iriba07osovo,uwait,yrgyz1O;eling0Onya;a2erH;ma19p2;an,on;c7nd6r4s3tal2vory coast;ie,y;le of m1Irael;a2el1;n,q;ia,oJ;el1;aiVon2ungary;dur0Qg kong;aBeAha0Uibralt9re7u2;a5ern4inea2ya0T;!-biss2;au;sey;deloupe,m,tema0V;e2na0R;ce,nl1;ar;orgie,rmany;bVmb0;a6i5r2;ance,ench 2;guia0Hpoly2;nes0;ji,nl1;lklandVroeV;ast tim8cu7gypt,l salv7ngl1quatorial5ritr6s3t2;ats unis,hiop0;p0Mt2;on0; guin2;ea;ad2;or;enmark,jibou4ominica3r con2;go;!n B;ti;aAentral african 9h7o4roat0u3yprRzech2; 8ia;ba,racao;c3lo2morQngo-brazzaville,okFsta r02te d'ivoi05;mb0;osD;i2ristmasG;le,nS;republic;m2naVpe verde,yman9;bod0ero2;on;aGeChut06o9r4u2;lgar0r2;kina faso,ma,undi;az5etXitish 2unei,és5;virgin2; is2;lands;il;liv0naiOsnia and herzegoviHtswaHuvet2; isl1;and;l2n8rmuH;ar3gi2ize;qLum;us;h3ngladesh,rbad2;os;am3ra2;in;as;fghaKlFmeriDn6r4ustr2zerbaijM;ali2ia;a,e;genti2men0uba;na;dorra,g5t2;arct3igua and barbu2;da;ica;leter3o2uil2;la;re;ca,q2;ue;b4ger0lem2;ag2;ne;an0;ia;ni2;st2;an",
    "Region": "true¦a20b1Sc1Id1Des1Cf19g13h10i0Xj0Vk0Tl0Qm0FnZoXpSqPrMsDtAut9v5w2y0zacatec22;o05u0;cat18kZ;a0est vir4isconsin,yomi14;rwick1Qshington0;! dc;er2i0;ctor1Sr0;gin1R;acruz,mont;ah,tar pradesh;a1e0laxca1Cusca9;nnessee,x1Q;bas0Jmaulip1PsmI;a5i3o1taf0Nu0ylh12;ffUrrZs0X;me0Zno19uth 0;cRdQ;ber1Hc0naloa;hu0Rily;n1skatchew0Qxo0;ny; luis potosi,ta catari1H;a0hode6;j0ngp01;asth0Lshahi;inghai,u0;e0intana roo;bec,ensVreta0D;ara3e1rince edward0; isT;i,nnsylv0rnambu01;an13;!na;axa0Mdisha,h0klaho1Antar0reg3x03;io;ayarit,eAo2u0;evo le0nav0K;on;r0tt0Qva scot0W;f5mandy,th0; 0ampton0P;c2d1yo0;rk0N;ako0X;aroli0U;olk;bras0Wva00w0; 1foundland0;! and labrador;brunswick,hamp0Gjers0mexiIyork state;ey;a5i1o0;nta0Mrelos;ch2dlanAn1ss0;issippi,ouri;as geraFneso0L;igPoacP;dhya,harasht03ine,ni2r0ssachusetts;anhao,y0;land;p0toba;ur;anca03e0incoln03ouis7;e0iG;ds;a0entucky,hul09;ns07rnata0Cshmir;alis0iangxi;co;daho,llino1nd0owa;ia04;is;a1ert0idalDun9;fordS;mpRwaii;ansu,eorgVlou4u0;an1erre0izhou,jarat;ro;ajuato,gdo0;ng;cesterL;lori1uji0;an;da;sex;e3o1uran0;go;rs0;et;lawaDrbyC;a7ea6hi5o0umbrG;ahui3l2nnectic1rsi0ventry;ca;ut;iLorado;la;apDhuahua;ra;l7m0;bridge2peche;a4r3uck0;ingham0;shi0;re;emen,itish columb2;h1ja cal0sque,var1;iforn0;ia;guascalientes,l3r0;izo1kans0;as;na;a1ber0;ta;ba1s0;ka;ma",
    "Honorific": "true¦aPbrigadiOcHdFexcellency,fiAjudge,king,liCma9officOp6queen,r3s0taoiseach,vice5;e0ultK;c0rgeaB;ond li9retary;abbi,e0;ar0verend; adK;astGr0;eside5i0ofessF;me ministFnc7;gistrate,r4yD;eld mar3rst l0;ady,i0;eutena0;nt;shC;oct7utch0;ess;aptain,hance4o0;lonel,ngress1un0;ci2t;m0wom0;an;ll0;or;er;d0yatullah;mir0;al",
    "Infinitive": "true¦0:NB;1:N7;2:MW;3:KO;4:JY;5:NA;6:LP;7:LY;8:N9;9:MJ;A:K7;B:M2;C:EU;D:MZ;E:M1;F:L8;aJTbIScG2dDDeBMfANgA8h9Zi9Bj96ki95l8Tm87n80o7Pp68qu66r2Rs1Pt0Ru0Pv0DéGêt2ôt0;b08cZdu3g6HjeJFlXmouLBnWpRquPtKvG;aIeHit0oG;lu0qu0;i7nt8A;cu0lu0n2Z;aJeIoGr2Ru4B;nn0uG;ff0rd1;iKRnd2rn6;bl1l0;aLWiG;p0vaB7;aIel0iHlu4oGroN3u6;ng0us0;er,ngl0;iDZn2OrG;gn0pi7;e7Hum9;aGev0imAoiMN;bL1gu0rg1;arNhKlIoHrG;as0i2;nom6p0r4ut0;aGips0o2;irC5t0;aHoG;ir,u0;ng0pp0uIK;qLJt0;aHl2ArG;uCé4;h1uG;b1d1;aPeMiJoHromb1éGêt1;g8On9riF;iGl0m1t0uAJyDV;l0r;d0eiLYol0r0sGv2;er,iG;o8t0;i7nHrGx0;d1n1roL6s0;d2g0ir;g1inc2lGnt0;o1s0;i2n1rGs0tEW;g0in0;a08e04i01oYrKuJâIéG;léGt0;chaDLg5Wphon0;ch0t0;er,tJU;aMeKiIoGu3ébu4;mp0ttGuv0;er,in0;cGmbal0n3omph0;h0ot0;mGssaiLE;bl0p0;cLfi3h1it0nIqu0vGînL;ai7eG;rs0st1;ch0sG;fGg7Qir,poFO;o7Wè2ér0;a5er;l9mb0nd2p0rHuG;ch0rn0ss0;ch0tLL;rHsGtub0éd1;s0t2;ai7er;mpI0nETrGst0;giveDNmAn1rG;er,iG;fi0r;bJch0iIpHrGss0;d0ir,t1;er,ir,ot0;ll0re;a5l0;a0Ac09e07hoFYi04oWtTuIyHéG;ch0jouJJp47v1;mpath6nchron6;bPccOer,ffNgg9iMpKrGspeH3;enchEOf0g1ir,moEpa5sIvG;eGiv2ol0;i7n1;aJKeo1;erv6pG;li0oEXr98;c6Fv2;i2o3;oA0éd0;ir,stiEBve6X;aHimGXoGupéf8E;ck0pp0;bDGtI8;iKFll7YmMnLrt1uGûl0;ci0d2ffJhaClIpHrGs-est8ZtDvD;d2i2;er,ir0ço8;ag0ev0iKB;l0r1;d0g0n0;br0m0;gnHlFYmGrF9tu0ég0;pIMul0;al0er;cou38mGnt1o1rCXvr0;bl0er;a8e7rIX;bLcKiJlInctHToGGuHvoG;ir,ur0;pou9IrG2t0v0;er,ir,u0;gn0ll1s1;cBLriF;ot0r0;a25e07hAEi06o04u03éHêv0ôG;d0t1;a00cXdD6eVfUgTinRjQpNquisitHKsKtIuHvG;ei7is0oDHél0;n1ss1;aJ4rG;éc1;e4GiHoud2uG;lt0m0;d0gn0st0;aGoHEroJUuJKét0;nd2rG;er,t1;ou1;sta7tGvest1;èg2égr0;al0ir,l0n0;léBugi0;nvah1ss9IxG;amApé0M;apitFPhaHit0lJCoGup9;lt0m1Jnci4D;pp0uFE;g1l6n7Sp8Ds9V;g1in0;id1s1uG;g1ir,l0s4Dvr1;gF0m0poHXre,s3;-1Cb1Bc11d0Uf0Sg0Nj0Ml0Km0Cn07p00quCYreZsQtLvG;a7EeHoGêt1;ir,m1u7D;nHrG;d1n1;di3ir;aF9enJir0oIrG;aGoJ5;c0n4;mb0uHH;ir,t1;al1erv1pNsHtGurg1;aJ2er,iCI;aKeIoHuG;rg1scC;rt1uvD;mG0nt1rG;r0v1;is1ss0;eETir0leGC;m94s96;aKeGPlJoIrHè2éG;r0tr1;o4éseE;rt0s0u5;ac0i0;rGss0ît2;coHAl0t1;aC8cJdIfoANi0oHseiIAtr0vGâ84;eASoy0;nc0uvC7;o10re;hC2onHQ;aLbKerDUis0oJpHu0éG;di0;lGoFY;ac0ir;nt0r3;ouAJr1D;iGLrG;i0qu0;aGev0â4;nc0x0y0;aiHPet0ou0;aIrG;eHHimp0oG;ss1up0;gn0rG;d0n1;e48leGOo48rGus0;anBoid1;eKiffus0oIre5éG;couFNf10mG;aE7ol1;nn0rm1uG;bl0t0;maF8vG;en1o1;eFMhNlu2oIrHtiFuG;eiH9l0;oBCut0ép1;mInHuG;p0r1vr1;quB7ve80;mGpt0;aEZeFK;aGer4;mp1rg0;lanBoEZrou5ât1;pe1T;bo03cYdouc1fWgaillaHJiVjUlSmQnPpNqu0sKtIvGy0;al0iGo1;r,tCC;er,i5tG;a4rap0;er,sG;eGir,o7Nur0;mEBo1;eti5iéc0oiF4pG;el0oEQro4;c1g0im0;a5eGoGNp0;n0r,ut0;eEZlG;i0um0;e02oFK;d1re,so8;feGr81;rm1;cHkeG9oG;nt0rn1;oGro4;mGu1G;mGIpaGH;nn1uF2;adri7eGiG3ér1;re7stE6;a0Pe0Ihotog0Hi0Fl0Ao05rKuJâIéGê4;nB9r1tG;er,r1;l1t1;b1Dis0lvér6n1riF;ati3eYiXoPéGêt0ôn0;cMdéfLf9lev0mKoccup0pJsHvGétaFM;a4Jen1o1;eGid0um0;nt0rv0;ar0;un1;in1;iGonE5éd0;pCs0;cMfLgrKj47loEOmInoE9p52steEMtHuv0vG;en1o3;eEQég0;eGouE1;n0tt2;amm0e5;e5it0è2ér0;lFTur0éd0;er,s0v0;nd2sseG;nt1r;inJl1mp0rt0sIuG;rGss0vo1;cha5r1su4Vvo1;er,séd0t0;d2t0;aHeuGi0oE8;r0vo1;c0iHnG;er,iFqu0t0;d0re,saE;g0ll0nc0queGss0étA;-ni3r;raphi0;iKlACnJrGs0;ceHd2fDOmett2sGve5Y;iE2onnAMuBQév9;r,vo1;ch0s0;gn0nG;d2er;ct6lp0nLrIss0tGvA6y0ît2;aug0iGroE8;eEn0;achDVcoDZdo8f2Wi0l0tGvD;ag0iG;cD7r;i3s0;bMccLeu4DffJiCQmp2pIrHs0uGy0;bZrd1vr1ïr;do8gan6;p3Xè2ér0;eGr1;ns0;i2up0;jeAZl83sHteGé1;mp9n1;cuLeGtA;rv0;aLeKi90oHégG;l7YoA9;iHmm0n-saCPtGuDKy0;er,iF;rc1;ig0ttCKu9T;g0nt1r74vi74ît2;aUeQiOoJuHâ4éGêl0ûr1;dCfi0laD3pr6rCtamorph3H;g1ltipGn1rmEO;li0;b7AdiFiJll1ntIqu0uG;ch0d2fGi7r1vo1;et0t0;er,r0;s1t1;j97nGs0;c1im6;nHsGtt2urtr1;seo1ur0;ac0di0er,tiG;o8r;gn0iLnJqD5rHsGtA2udi2îtr6;sa7Tti3;chGi0qu0r0;aBMer;g0iGoeu3Cqu0;feCOpA9;gr1ntD;aOeNiKoIuHyn4â4éG;ch0gu0;i2tt0;c93g0ng0t1uG;ch0er;b9er,g8PmHquGre,ss0vr0;id0;er,it0;uA6v0;i5mHnGr68ss0v0;c0gu1;bAeE;dnaCJss0;aJeIoHuG;g0r0;iB7u9G;t0ûn0;ct0iD5un1;dentiFeB4gnBPmXnHrrCsG;ol0s1;cTdi3fQiti0oAYquiPsNtJvG;eGit0o3;nt0rGst1;s0t1;erHéG;re5;ag1ceD5di2f9rog0veG;n1rt1;iBUpGta7u6Qè2ér0;e99ir0;ét0;ilCHlHoG;rm0;ig0éB;aBIlGo2Aulp0;in0u2;agAit0mKpG;a3GlIoHrG;im0ov6;rtun0s0;aEi3or0;e4Gob5N;aLeKi5oIuHypothé3ât0éG;be4ErCsC;ir,m0rl0;ch0nG;n1or0;nn1uAC;biGllucArc6Fu5ïr;ll0tG;er,u0;aRel0lPoOrIuHâ4è2éGên0;m1nér7Qr0s1;eBZid0ér1;aKiIoG;ss1uG;i7p0;ll0mGnB;ac0p0;nd1tt0v88;b0rg0uveASût0;aGi5oriF;c0nd0p1;gHlop0mbe3UrGspi7uBv0z0;aA8d0er,n1;er,n0;a09e06i03lYoPrJuIâ4éGêt0;lGr1;icC;ir,m0si7;aKeJi4YoHéGôl0;m1queE;iGtt0;d1ss0;do8in0;nBpp0tern6y0îB;c72nMrIuG;eBBi7Il0rGt2;b1n1r0;cIfHmGtiF;e0Dul0;ai2;er,ir,lo2;cGd0;er,t98;aJeAEiIoHéG;ch1tr1;r1tt0;n41rt0;mb0n3tt0;a9Lch0gBMlHnGx0;a9Kir;er,m0;rHst9BuillG;et0;m0r0t45;bri3cJiIlHn0rc1ti3TuGx0;f9Fss0;lo1;bl1ll1re;ilCtBC;co9Uff14m0VnXrr0sQxG;aOcNe3Bhib0iMorc6pHtGéc9T;a9AermArap6U;ir0lIo56rHu55éG;di0ri7R;im0;i3oG;it0r0s0;g0st0;it0us0;g9mAuc0;ba8McKpJsItG;imeGourb1;nt,r;ay0uy0;ac0io8è2ér0;al71oG;mALrt0;c07d04f01gZhaAWiYjaXlVnUorgueiABqu4DrTsQtIvG;ah1elo9Ji0RoG;l0y0;aMeLoAQrGêt0;aIeGou8E;pGr,tDvo1;os0;id0pGîn0;er8E;nd2rr0;m0ss0;eHuG;iv2;iA4vel1;eg9MiBôl0;o9Huy0;aGev0;c0id1;mb0;vr0;ag0enGlo18ouACrai5ue6C;dr0;erHil0oGrei7Pu1;nc0u1;m0r0;oHurG;c1er;lor1mm1Frm1;aKerJhHlo2ourG;ag0ir;aGér1;nt0în0;cl0;dr0i5;bLmJpG;ar0il0lHoGruEua7Qê4;i9Hrt0;ir,oy0;eGén14;n0rd0;aGe97o0Ora5;ll0r1Et2uG;ch0m0;ac0ec32o1NrG;ay0;a23e1Yi1Jo1Fr1Du1CynamCéGîn0;amb5Mb13c0Rd0Pf0Kg0Ej0Dl0Bm08n07pZrXsPtKvG;eIiHoGêt1;il0r0;er,s0T;lo86rn1;aJeGou7Q;ct0nHrGst0;mAr0;d2ir;ch0i7;aKeIhHiGobé1un1épai06;gn0r0;abi7;mGng98sp9;pl1;ct8Emo15sGvY;soG;rt1;a7Fiv0oG;b0ul0;aMeLlIoGér1ê4;l1s0uG;i7r6R;aHoG;r0y0;c0i2;c0ns0;nn0rt1ss0;a6Ni4o6Q;aHe6MoGun1én03;l1n7X;nt2Brr0s3;e4LiGog0é10;mCvr0;ou0;aKlJoIroHuG;erp1is0st0;ss1;mm0u8K;ut1;g0rn1uB;aiJe5WiIle71oHrG;aîB;nc0ul0;er,l0n1;ll1re;i0oGui2;mmLu5A;aQePhMid0lLoIrG;i2o4éG;p1t0;d0ll0nne42uG;p0rGvr1;ag0;ar0en4in0o2;aHiGo1;f2Ar0;rg0;rn0vo1;mp0pCt1;aKouIrHuG;s3t0;an4o6N;cGl0;h0l0;ll0rG;qu0ra5;it0;p0rc1;aGe5;gu0mat6;mAnn0rIuG;bl0cGt0;h0ir;l27m1;aloTct0ffSrRsJvG;erHis0oGulS;rc0;g0t1;cKpIsHtG;a5AinOri3Z;im3Dé3;ara0VeGos0ut0;rs0;oGut0;nGur1;ti3RvD;e,ig0;us0è2ér0;gu0;mJssHvG;a4Zen1in0o1;aWerGin0;r0t1v1;a4Be6X;i6Kns0;a1Ye1Uh1Fi1Bl17oTrKuHéG;d0lébr0;ei6BisAlG;pabGt62;il6;aLeKiJoHéG;er,p1;iGqu0up1ît2;re,s0;er,re,ti3;us0v0;ch0i42mG;oGpo8;is1;exi4Zf0Sgn0i4Gl0Om0CnLoKrrJt1uGût0;ch0d2l0p0rGvr1;bGir;at6Eer;ig0;p9r6H;c04d03fZgYnWquVsOtJvG;eGi0o3;n1rG;g0s0t1;a25eIi2Tou4JrG;aGevDi2Uôl0;ct0ri0;mpl0nGr,st0;ir,t0;aLeKid9oJtHuG;lt0;at0iGrui2;tu0;l0mm0;nt1rv0;cr0;ér1;aGe1S;ît2;el0;eIiGroE;er,rGs3;e,m0;ct34ss0;amn0ui2;eGo49éd0;n4Trt0vo1;bQmMpG;aJlIoHre31t0uG;ls0;rt0s0;i3ot0ét0;rGt1;er,o1;a2ReHuniG;er,qu0;nGrc0;c0t0;in0l0;lGmat0on6;ab3AeG;ctGr;er,io8;fr0;aHi4RoGu2;re,u0ît2;meGp1qu0ss0;c0r;bl0rGt0;cGer;onGul0;ci2vD;aPeNiKoHronomGuchLér1;èt2é42;iHpGqu0;er,p0;r,s1;cHpG;ot0;an0;r4vG;au4ir;lo1mJnIrHss0to3FuG;ff0v1;g0ri0;c1g0t0;ai7;nHrGss0;n0tiF;trG;al6;ch0lLmKnJpHre5sGus0;s0tr0;it0DtG;er,ur0;al6d1to8;briSp0;c09mXt0;a04e03ienvDlYoTrLut0âJéGû4;er,nG;ir,éfiG;ci0;cl0ilGt1;lo8;aLiJoHuGûl0;i2n1s3;n4uiG;ll0r;cGdg0ll0s0;ol0;i2nGss0v0;ch0d1;i2mbaSnJrn0ss0tt0uGx0;cl0d0ffHg0i38m0rr0sG;cSi7;er,ir;d1ir,n1;aJeIoHuGâm0êm1;ff0;nd1qu0tt1;ss0tt1u1;gu0nB;ct0;digeo8gaQiOlaNnn1pt6rrKsItt2vG;aGer;rd0;cGer;ul0;er,iG;cGr;ad0;nc0y0;gn0sG;er,s0;rr0;b2Yc2Dd28ff20g1Sh1Ri1Oj1Ll1Fm16n0Zp0Er0AsXttPuMvGè2ér0;aKeIiHoG;ir,rt0u0;l1s0;nt30rt1uG;gl0l1;ch1l0nc0;gHtG;or6;meE;aMeKiJrHéG;nu0;ap0iG;bu0;r0s0éd1;i07l0ndrGrr1;e,ir;ch0qu0rd0;pir0sGti3;aOeMi13oIuHé4;ch0;jett1m0r0;ci0ir,mIrt1uG;pGrd1v1;ir,l1;br1m0;mGo1rv1;bl0;g1iHssAvo1;in0;ll1n1;b0Cch1Jm0peErG;aHiv0oGêt0;nd1s0;ch0ng0;a6erYitXlaWpGâl1;aSeRlOoNrGuy0ât0;eLivo6oIéGêt0;ci0heG;nd0;ch0foHuv0visG;io8;nd1;nd2;rt0;aHi3;qu0;ud1;l0saO;rHuG;vr1;ei7o1tD;n1t1;oy0;ceG;vo1;alys0esthéLnIo0NticHéaG;nt1;ip0;ihHoGul0;nc0;il0;si0;aMeLinc1oJpHus0éliG;or0;liF;fi0;ch1indr1ll1rG;c0t1;n0rr1;iGss0t1;gr1;angu1eKiJlHou17teGun1;rn0;er,oGum0;ng0;gn0meE;nt1rt0;oHuG;st0;ut0;d0gGm0nd2;r1u6;is0;ur1;enoLgrav0iKon1rHueG;rr1;aHe5iGé0;pp0;f0nd1;r,t0;ui7;ll0;aLeKiJol0rG;anBoEét0;nt0;ch1;ch0rm0;ct0rm1;d1iGl0;bl1;a02ir0miHoGre5vD;nn0pt0r0uc1;nGr0;isG;tr0;ariât2cKheJquHtG;iv0;iGér1;tt0;t0v0;aTeSlRoLroKuIéG;d0l9;è2ér0;eiGs0;ll1;ch0i2up1ît2;mHrd0st0urG;c1ir;mIpG;aGl1;gn0;od0;am0;pt0;bl0lm1;re;aMjLoKrIsGus0âtaOêt1îm0;orb0tD;en1;eGit0ut1ég0;uv0;l1rd0ut1;ur0;i5nJsG;ouG;rd1;ir;do8;nn0;ss0;er",
    "Person": "true¦ashton kutchSbRcMdKeIgastNhGinez,jEkDleCmBnettJoAp8r4s3t2v0;a0irgin maG;lentino rossi,n go3;heresa may,iger woods,yra banks;addam hussain,carlett johanssJlobodan milosevic,uB;ay romano,eese witherspoIo1ush limbau0;gh;d stewart,nald0;inho,o;a0ipJ;lmIris hiltD;prah winfrFra;essiaen,itt romnEubarek;bron james,e;anye west,iefer sutherland,obe bryant;aime,effers8k rowli0;ng;alle ber0itlBulk hogan;ry;ff0meril lagasse,zekiel;ie;a0enzel washingt2ick wolf;lt1nte;ar1lint0ruz;on;dinal wols1son0;! palm2;ey;arack obama,rock;er",
    "City": "true¦a2Yb28c1Yd1Te1Sf1Qg1Kh1Ci1Ajakar2Jk11l0Um0Gn0Co0ApZquiYrVsLtCuBv8w3y1z0;agreb,uri21;ang1Ve0okohama;katerin1Jrev36;ars3e2i0rocl3;ckl0Xn0;nipeg,terth0Y;llingt1Qxford;aw;a1i0;en2Jlni31;lenc2Wncouv0Hr2I;lan bat0Etrecht;a6bilisi,e5he4i3o2rondheim,u0;nVr0;in,ku;kyo,ronIulouC;anj25l15miso2Lra2C; haJssaloni0Z;gucigalpa,hr2Ql av0N;i0llinn,mpe2Dngi08rtu;chu24n2OpT;a3e2h1kopje,t0ydney;ockholm,uttga14;angh1Henzh1Z;o0Mv00;int peters0Wl3n0ppo1H; 0ti1D;jo0salv2;se;v0z0S;adV;eykjavik,i1o0;me,sario,t27;ga,o de janei19;to;a8e6h5i4o2r0ueb1Syongya1P;a0etor26;gue;rt0zn26; elizabe3o;ls1Irae26;iladelph21nom pe09oenix;r0tah tik1B;th;lerKr0tr12;is;dessa,s0ttawa;a1Jlo;a2ew 0;delVtaip0york;ei;goya,nt0Wpl0Wv1T;a6e5i4o1u0;mb0Nni0K;nt1sco0;u,w;evideo,real;l1Nn02skolc;dellín,lbour0T;drid,l5n3r0;ib1se0;ille;or;chest0dalXi10;er;mo;a5i2o0vBy02;nd0s angel0G;on,r0F;ege,ma0nz,sbZverpo1;!ss0;ol; pla0Iusan0F;a5hark4i3laipeda,o1rak0uala lump2;ow;be,pavog0sice;ur;ev,ng8;iv;b3mpa0Kndy,ohsiu0Hra0un03;c0j;hi;ncheMstanb0̇zmir;ul;a5e3o0; chi mi1ms,u0;stI;nh;lsin0rakliG;ki;ifa,m0noi,va0A;bu0SiltD;alw4dan3en2hent,iza,othen1raz,ua0;dalaj0Gngzhou;bu0P;eUoa,ève;sk;ay;es,rankfu0;rt;dmont4indhovU;a1ha01oha,u0;blRrb0Eshanbe;e0kar,masc0FugavpiJ;gu,je0;on;a7ebu,h2o0raioJuriti01;lo0nstanJpenhagNrk;gFmbo;enn3i1ristchur0;ch;ang m1c0ttagoL;ago;ai;i0lgary,pe town,rac4;ro;aHeBirminghWogoAr5u0;char3dap3enos air2r0sZ;g0sa;as;es;est;a2isba1usse0;ls;ne;silPtisla0;va;ta;i3lgrade,r0;g1l0n;in;en;ji0rut;ng;ku,n3r0sel;celo1ranquil0;la;na;g1ja lu0;ka;alo0kok;re;aBb9hmedabad,l7m4n2qa1sh0thens,uckland;dod,gabat;ba;k0twerp;ara;m5s0;terd0;am;exandr0maty;ia;idj0u dhabi;an;lbo1rh0;us;rg",
    "Place": "true¦aMbKcIdHeFfEgBhAi9jfk,kul,l7m5new eng4ord,p2s1the 0upJyyz;bronx,hamptons;fo,oho,under2yd;acifMek,h0;l,x;land;a0co,idDuc;libu,nhattK;a0gw,hr;s,x;ax,cn,ndianGst;arlem,kg,nd;ay village,re0;at 0enwich;britain,lak2;co,ra;urope,verglad0;es;en,fw,own1xb;dg,gk,hina0lt;town;cn,e0kk,rooklyn;l air,verly hills;frica,m5ntar1r1sia,tl0;!ant1;ct0;ic0; oce0;an;ericas,s",
    "Currency": "true¦$,aud,bScQdLeurKfJgbp,hkd,inr,jpy,kHlFnis,p8r7s3usd,x2y1z0¢,£,¥,ден,лв,руб,฿,₡,₨,€,₭,﷼;lotySł;en,uanR;af,of;h0t6;e0il6;k0q0;elM;iel,oubleLp,upeeL;e3ound0;! st0s;er0;lingH;n0soG;ceFn0;ies,y;e0i7;i,mpi6;n,r0wanzaByatB;!onaAw;ori7ranc9;!o8;en3i2kk,o0;b0ll2;ra5;me4n0rham4;ar3;ad,e0ny;nt1;aht,itcoin0;!s",
    "Cardinal": "true¦cinqCd6hBnAon7qu3s2tr0vingt,zero;e0ois;i5nC;ei4ix,oixA;a0in3;r8t0;or1re;eux,ix1ou0;ze;! 0;h1n0sept;euf;uit;!u0;an0;te",
    "Ordinal": "true¦cinquBd8huiCneuviDon9qu4s2tr0uniDvingCzeroiD;e0oisiC;i7nA;e0i7oix4;i5p8;a0in4;r1t0;or2ri6;an4;eu1i1ou0;zi3;xi2;an0i1;ti0;ème",
    "Unit": "true¦bHceFeDfahrenheitIgBhertz,jouleIk8liGm6p4terEy2z1°0µs;c,f,n;b,e1;b,o0;ttA;e0ouceD;rcent,t8;eg7il0³,è9;eAlili8;elvin9ilo1m0;!/h,s;!b6gr1mètre,s;ig2r0;amme5;b,x0;ab2;lsius,ntimè0;tre1;yte0;!s",
    "MaleNoun": "true¦0:0J;a08b06c03dZeXfTgRhiv02iNjourn0Flieu,mJniv07pDr7s6t4v3é1;chel08l1quiZtabl0Gvé0B;èOé0;en07égéta06;a1rai8;b04rif,ux;ala0Aeg0tatis8;e1èg3és00;c3mbour0An1staura0C;de0forNouvel1;le0;en07ru1;te0;a4er3la2oli1rofR;ti7;inVnV;fectiVspec9;ie0r1;apluie,le0teA;o3us1;i1ée;que;biNmeYuve0;dRn1;itia1vestT;ti1;ve;estion1ouverL;naO;i2onctionn1;aMe0;le,nan1;ce0;au,n1space;dro6ga7registre0seigEtenCvirD;egré,o2évelop1;pe0;cu0nnDssi1;er;han2ommentaDréd1;it;ge0;at1ur1énéficiaA;eau;ccro9ffa8gré0ir,n5pprovisi3ttein2utomobi1venir;le;te;on1;ne0;im2n1;ée;al;ire;is1;se0;me1;nt",
    "Organization": "true¦0:43;a38b2Pc29d21e1Xf1Tg1Lh1Gi1Dj19k17l13m0Sn0Go0Dp07qu06rZsStFuBv8w3y1;amaha,m0Xou1w0X;gov,tu2Q;a3e1orld trade organizati3Y;lls fargo,st1;fie22inghou16;l1rner br3A;-m11gree2Zl street journ24m11;an halNeriz3Tisa,o1;dafo2Fl1;kswagLvo;bs,kip,n2ps,s1;a tod2Pps;es32i1;lev2Vted natio2S; mobi2Iaco bePd bMeAgi frida9h3im horto2Rmz,o1witt2U;shiba,y1;ota,s r Y;e 1in lizzy;b3carpen30daily ma2Uguess w2holli0rolling st1Ms1w2;mashing pumpki2Muprem0;ho;ea1lack eyed pe3Cyrds;ch bo1tl0;ys;l2s1;co,la m12;efoni07us;a6e4ieme2Enp,o2pice gir5ta1ubaru;rbucks,to2K;ny,undgard1;en;a2Ox pisto1;ls;few23insbu24msu1V;.e.m.,adiohead,b6e3oyal 1yan2U;b1dutch she4;ank;/max,aders dige1Dd 1vl2Z;bu1c1Shot chili peppe2Hlobst26;ll;c,s;ant2Sizno2C;an5bs,e3fiz22hilip morrBi2r1;emier24octer & gamb1Pudenti13;nk floyd,zza hut;psi25tro1uge08;br2Nchina,n2N; 2ason1Vda2D;ld navy,pec,range juli2xf1;am;us;a9b8e5fl,h4i3o1sa,wa;kia,tre dame,vart1;is;ke,ntendo,ss0K;l,s;c,st1Ctflix,w1; 1sweek;kids on the block,york08;a,c;nd1Rs2t1;ional aca2Co,we0P;a,cYd0N;aAcdonald9e5i3lb,o1tv,yspace;b1Knsanto,ody blu0t1;ley crue,or0N;crosoft,t1;as,subisO;dica3rcedes2talli1;ca;!-benz;id,re;'s,s;c's milk,tt11z1V;'ore08a3e1g,ittle caesa1H;novo,x1;is,mark; pres5-z-boy,bour party;atv,fc,kk,m1od1H;art;iffy lu0Jo3pmorgan1sa;! cha1;se;hnson & johns1Py d1O;bm,hop,n1tv;g,te1;l,rpol; & m,asbro,ewlett-packaSi3o1sbc,yundai;me dep1n1G;ot;tac1zbollah;hi;eneral 6hq,l5mb,o2reen d0Gu1;cci,ns n ros0;ldman sachs,o1;dye1g09;ar;axo smith kliYencore;electr0Gm1;oto0S;a3bi,da,edex,i1leetwood mac,oFrito-l08;at,nancial1restoU; tim0;cebook,nnie mae;b04sa,u3xxon1; m1m1;ob0E;!rosceptics;aiml08e5isney,o3u1;nkin donuts,po0Tran dur1;an;j,w j1;on0;a,f leppa2ll,peche mode,r spiegXstiny's chi1;ld;rd;aEbc,hBi9nn,o3r1;aigsli5eedence clearwater reviv1ossra03;al;ca c5l4m1o08st03;ca2p1;aq;st;dplLgate;ola;a,sco1tigroup;! systems;ev2i1;ck fil-a,na daily;r0Fy;dbury,pital o1rl's jr;ne;aFbc,eBf9l5mw,ni,o1p,rexiteeV;ei3mbardiJston 1;glo1pizza;be;ng;ack & deckFo2ue c1;roW;ckbuster video,omingda1;le; g1g1;oodriM;cht3e ge0n & jer2rkshire hathaw1;ay;ryG;el;nana republ3s1xt5y5;f,kin robbi1;ns;ic;bWcRdidQerosmith,ig,lKmEnheuser-busDol,pple9r6s3t&t,v2y1;er;is,on;hland1sociated F; o1;il;by4g2m1;co;os; compu2bee1;'s;te1;rs;ch;c,d,erican3t1;!r1;ak; ex1;pre1;ss; 4catel2t1;air;!-luce1;nt;jazeera,qae1;da;as;/dc,a3er,t1;ivisi1;on;demy of scienc0;es;ba,c",
    "FemaleNoun": "true¦ambulance,confiture,géolog1l0poule,rue;ibrair0utte;ie",
    "SportsTeam": "true¦0:1A;1:1H;2:1G;a1Eb16c0Td0Kfc dallas,g0Ihouston 0Hindiana0Gjacksonville jagua0k0El0Bm01newToQpJqueens parkIreal salt lake,sAt5utah jazz,vancouver whitecaps,w3yW;ashington 3est ham0Rh10;natio1Oredski2wizar0W;ampa bay 6e5o3;ronto 3ttenham hotspur;blue ja0Mrapto0;nnessee tita2xasC;buccanee0ra0K;a7eattle 5heffield0Kporting kansas0Wt3;. louis 3oke0V;c1Frams;marine0s3;eah15ounG;cramento Rn 3;antonio spu0diego 3francisco gJjose earthquak1;char08paA; ran07;a8h5ittsburgh 4ortland t3;imbe0rail blaze0;pirat1steele0;il3oenix su2;adelphia 3li1;eagl1philNunE;dr1;akland 3klahoma city thunder,rlando magic;athle0Mrai3;de0; 3castle01;england 7orleans 6york 3;city fc,g4je0FknXme0Fred bul0Yy3;anke1;ian0D;pelica2sain0C;patrio0Brevolut3;ion;anchester Be9i3ontreal impact;ami 7lwaukee b6nnesota 3;t4u0Fvi3;kings;imberwolv1wi2;rewe0uc0K;dolphi2heat,marli2;mphis grizz3ts;li1;cXu08;a4eicesterVos angeles 3;clippe0dodDla9; galaxy,ke0;ansas city 3nE;chiefs,roya0E; pace0polis colU;astr06dynamo,rockeTtexa2;olden state warrio0reen bay pac3;ke0;.c.Aallas 7e3i05od5;nver 5troit 3;lio2pisto2ti3;ge0;broncZnuggeM;cowbo4maver3;ic00;ys; uQ;arCelKh8incinnati 6leveland 5ol3;orado r3umbus crew sc;api5ocki1;brow2cavalie0india2;bengaWre3;ds;arlotte horAicago 3;b4cubs,fire,wh3;iteB;ea0ulR;diff3olina panthe0; c3;ity;altimore 9lackburn rove0oston 5rooklyn 3uffalo bilN;ne3;ts;cel4red3; sox;tics;rs;oriol1rave2;rizona Ast8tlanta 3;brav1falco2h4u3;nited;aw9;ns;es;on villa,r3;os;c5di3;amondbac3;ks;ardi3;na3;ls",
    "Pronoun": "true¦c2elle1il1j2moi,n0on,t,v0;ous;!s;!e",
    "Uncountable": "true¦aXbTcMdIenviroSfEgDlogiciePmAnoc01o9p7r5s3t2v1é0;checs,pinar7;acancZictuEête9;ransporZénèI;ciences*,eOp0;aghettVectaT;avagVe0;cherchUmor1nseigne4pas;arasitToi0révis4âtT;ds;bsèquRrdurRs;euFunit1édica0;menQ;ioF;arbIraffitM;ianç1oiDruiNu0;mero1nér0;ai0;llJ;ata5evoiGé0;brGc0gâI;heHom0;brF;hev4o0revettEéréalE;m2nsei1or0rps;donnéC;ls;blA;eux,ro0;ns;ag1o6r0;as,ocol5;ag5g0;age;ba4ffair3ngla2rrh3sperg3udi0;teu0;rs;is;es;ts",
    "Expression": "true¦a02b01dXeVfuck,gShLlImHnGoDpBshAtsk,u7voi04w3y0;a1eLu0;ck,p;!a,hoo,y;h1ow,t0;af,f;e0oa;e,w;gh,h0;! 0h,m;huh,oh;eesh,hh,it;ff,hew,l0sst;ease,z;h1o0w,y;h,o,ps;!h;ah,ope;eh,mm;m1ol0;!s;ao,fao;a4e2i,mm,oly1urr0;ah;! mo6;e,ll0y;!o;ha0i;!ha;ah,ee,o0rr;l0odbye;ly;e0h,t cetera,ww;k,p;'oh,a0uh;m0ng;mit,n0;!it;ah,oo,ye; 1h0rgh;!em;la"
  };

  const BASE = 36;
  const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const cache = seq.split('').reduce(function (h, c, i) {
    h[c] = i;
    return h
  }, {});

  // 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
  const toAlphaCode = function (n) {
    if (seq[n] !== undefined) {
      return seq[n]
    }
    let places = 1;
    let range = BASE;
    let s = '';
    for (; n >= range; n -= range, places++, range *= BASE) {}
    while (places--) {
      const d = n % BASE;
      s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
      n = (n - d) / BASE;
    }
    return s
  };

  const fromAlphaCode = function (s) {
    if (cache[s] !== undefined) {
      return cache[s]
    }
    let n = 0;
    let places = 1;
    let range = BASE;
    let pow = 1;
    for (; places < s.length; n += range, places++, range *= BASE) {}
    for (let i = s.length - 1; i >= 0; i--, pow *= BASE) {
      let d = s.charCodeAt(i) - 48;
      if (d > 10) {
        d -= 7;
      }
      n += d * pow;
    }
    return n
  };

  var encoding = {
    toAlphaCode,
    fromAlphaCode
  };

  const symbols = function (t) {
    //... process these lines
    const reSymbol = new RegExp('([0-9A-Z]+):([0-9A-Z]+)');
    for (let i = 0; i < t.nodes.length; i++) {
      const m = reSymbol.exec(t.nodes[i]);
      if (!m) {
        t.symCount = i;
        break
      }
      t.syms[encoding.fromAlphaCode(m[1])] = encoding.fromAlphaCode(m[2]);
    }
    //remove from main node list
    t.nodes = t.nodes.slice(t.symCount, t.nodes.length);
  };
  var parseSymbols = symbols;

  // References are either absolute (symbol) or relative (1 - based)
  const indexFromRef = function (trie, ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    if (dnode < trie.symCount) {
      return trie.syms[dnode]
    }
    return index + dnode + 1 - trie.symCount
  };

  const toArray$1 = function (trie) {
    const all = [];
    const crawl = (index, pref) => {
      let node = trie.nodes[index];
      if (node[0] === '!') {
        all.push(pref);
        node = node.slice(1); //ok, we tried. remove it.
      }
      const matches = node.split(/([A-Z0-9,]+)/g);
      for (let i = 0; i < matches.length; i += 2) {
        const str = matches[i];
        const ref = matches[i + 1];
        if (!str) {
          continue
        }
        const have = pref + str;
        //branch's end
        if (ref === ',' || ref === undefined) {
          all.push(have);
          continue
        }
        const newIndex = indexFromRef(trie, ref, index);
        crawl(newIndex, have);
      }
    };
    crawl(0, '');
    return all
  };

  //PackedTrie - Trie traversal of the Trie packed-string representation.
  const unpack$2 = function (str) {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0
    };
    //process symbols, if they have them
    if (str.match(':')) {
      parseSymbols(trie);
    }
    return toArray$1(trie)
  };

  var traverse = unpack$2;

  const unpack = function (str) {
    if (!str) {
      return {}
    }
    //turn the weird string into a key-value object again
    const obj = str.split('|').reduce((h, s) => {
      const arr = s.split('¦');
      h[arr[0]] = arr[1];
      return h
    }, {});
    const all = {};
    Object.keys(obj).forEach(function (cat) {
      const arr = traverse(obj[cat]);
      //special case, for botched-boolean
      if (cat === 'true') {
        cat = true;
      }
      for (let i = 0; i < arr.length; i++) {
        const k = arr[i];
        if (all.hasOwnProperty(k) === true) {
          if (Array.isArray(all[k]) === false) {
            all[k] = [all[k], cat];
          } else {
            all[k].push(cat);
          }
        } else {
          all[k] = cat;
        }
      }
    });
    return all
  };

  var unpack$1 = unpack;

  var misc$1 = {
    // copulas (incomplete)
    es: ['Copula', 'PresentTense'],
    est: ['Copula', 'PresentTense'],
    suis: ['Copula', 'PresentTense'],
    sommes: ['Copula', 'PresentTense'],
    etes: ['Copula', 'PresentTense'],
    sont: ['Copula', 'PresentTense'],

    ete: ['Copula', 'PastTense'],
    etais: ['Copula', 'PastTense'],
    etions: ['Copula', 'PastTense'],

    serons: ['Copula', 'FutureTense'],
    seront: ['Copula', 'FutureTense'],
    serai: ['Copula', 'FutureTense'],

    cent: ['Multiple', 'Cardinal'],
    mille: ['Multiple', 'Cardinal'],
    million: ['Multiple', 'Cardinal'],
    milliard: ['Multiple', 'Cardinal'],
    quadrillion: ['Multiple', 'Cardinal'],
    centième: ['Multiple', 'Ordinal'],
    millième: ['Multiple', 'Ordinal'],
    millionième: ['Multiple', 'Ordinal'],
    milliardième: ['Multiple', 'Ordinal'],
    billionième: ['Multiple', 'Ordinal'],
    trillionième: ['Multiple', 'Ordinal'],
    // plural numbers
    septs: ['TextValue', 'Cardinal'],

    cents: ['Multiple', 'Cardinal'],
    milles: ['Multiple', 'Cardinal'],
    millions: ['Multiple', 'Cardinal'],
    milliards: ['Multiple', 'Cardinal'],

    êtes: ['Copula', 'PresentTense'],
    étions: ['Copula', 'PresentTense'],
    serez: ['Copula', 'PresentTense'],
    été: ['Copula'],
    fus: ['Copula', 'PastTense'],
    fut: ['Copula', 'PastTense'],
    fûmes: ['Copula', 'PastTense'],
    fûtes: ['Copula', 'PastTense'],
    furent: ['Copula', 'PastTense'],
    fusse: ['Copula', 'PastTense'],
    fusses: ['Copula', 'PastTense'],
    fût: ['Copula', 'PastTense'],
    fussions: ['Copula', 'PastTense'],
    fussiez: ['Copula', 'PastTense'],
    fussent: ['Copula', 'PastTense'],
    serais: ['Copula', 'PresentTense'],
    serait: ['Copula', 'PresentTense'],
    serions: ['Copula', 'PresentTense'],
    seriez: ['Copula', 'PresentTense'],
    seraient: ['Copula', 'PresentTense'],
    sois: ['Copula', 'PresentTense'],
    soyons: ['Copula', 'PresentTense'],
    soyez: ['Copula', 'PresentTense'],
    être: ['Copula', 'PresentTense'],



  };

  const tagMap = {
    first: 'FirstPerson',
    second: 'SecondPerson',
    third: 'ThirdPerson',
    firstPlural: 'FirstPersonPlural',
    secondPlural: 'SecondPersonPlural',
    thirdPlural: 'ThirdPersonPlural',
  };

  let words = {};
  Object.keys(lexData).forEach(tag => {
    let wordsObj = unpack$1(lexData[tag]);
    Object.keys(wordsObj).forEach(w => {
      words[w] = tag;

      // expand
      if (tag === 'MaleAdjective') {
        let res = methods$1.adjective.conjugate(w);
        words[res.female] = words[res.female] || 'FemaleAdjective';
        words[res.plural] = words[res.plural] || 'MaleAdjective';
        words[res.femalePlural] = words[res.femalePlural] || 'FemaleAdjective';
      }
      if (tag === 'Cardinal') {
        words[w] = ['TextValue', 'Cardinal'];
      }
      if (tag === 'Noun' || tag === 'MaleNoun' || tag === 'FemaleNoun') {
        words[w] = [tag, 'Singular'];
        let plur = methods$1.noun.toPlural(w);
        words[plur] = words[plur] || ['Noun', 'Plural'];
      }
      if (tag === 'Ordinal') {
        words[w] = ['TextValue', 'Ordinal'];
        let norm = w.replace(/è/, 'e');
        words[norm] = words[norm] || ['TextValue', 'Ordinal'];
      }
      if (tag === 'MaleNoun') {
        let p = methods$1.noun.toPlural(w);
        words[p] = words[p] || 'PluralNoun';
      }
      if (tag === 'Infinitive') {
        // do future-tense
        let res = methods$1.verb.toFutureTense(w);
        Object.keys(res).forEach(k => {
          if (!words[res[k]]) {
            words[res[k]] = words[res[k]] || [tagMap[k], 'FutureTense'];
          }
        });
        // do present-tense
        res = methods$1.verb.toPresentTense(w);
        Object.keys(res).forEach(k => {
          if (!words[res[k]]) {
            words[res[k]] = words[res[k]] || [tagMap[k], 'PresentTense'];
          }
        });
        // do imperfect mood
        res = methods$1.verb.toImperfect(w);
        Object.keys(res).forEach(k => words[res[k]] = words[res[k]] || 'Verb');
        // past-participle
        let out = methods$1.verb.toPastParticiple(w);
        words[out] = words[out] || 'PastParticiple';
      }
    });
  });

  let lexicon$1 = Object.assign({}, words, misc$1);
  // console.log(Object.keys(lexicon).length.toLocaleString(), 'words')
  // console.log(lexicon['ralentir'])
  var words$1 = lexicon$1;

  const verbForm$2 = function (term) {
    let want = [
      'FirstPerson',
      'SecondPerson',
      'ThirdPerson',
      'FirstPersonPlural',
      'SecondPersonPlural',
      'ThirdPersonPlural',
    ];
    return want.find(tag => term.tags.has(tag))
  };

  const root = function (view) {
    const transform = view.world.methods.two.transform;
    view.docs.forEach(terms => {
      terms.forEach(term => {
        let str = term.implicit || term.normal || term.text;
        // nouns -> singular masculine form
        if (term.tags.has('Noun') && !term.tags.has('Pronoun')) {
          let isPlural = term.tags.has('PluralNoun');
          // let isFemale = term.tags.has('FemaleNoun')
          if (isPlural) {
            term.root = transform.noun.fromPlural(str);
          }
        }
        // adjectives -> singular masculine form
        if (term.tags.has('Adjective')) {
          let isPlural = term.tags.has('PluralAdjective');
          let isFemale = term.tags.has('FemaleAdjective');
          if (isPlural && isFemale) {
            term.root = transform.adjective.fromFemalePlural(str);
          } else if (isFemale) {
            term.root = transform.adjective.fromFemale(str);
          } else if (isPlural) {
            term.root = transform.adjective.fromPlural(str);
          }
        }
        // verbs -> infinitive form
        if (term.tags.has('Verb')) {
          if (term.tags.has('PresentTense')) {
            let form = verbForm$2(term);
            term.root = transform.verb.fromPresentTense(str, form);
          }
          if (term.tags.has('FutureTense')) {
            let form = verbForm$2(term);
            term.root = transform.verb.fromFutureTense(str, form);
          }
          if (term.tags.has('Passive')) {
            let form = verbForm$2(term);
            term.root = transform.verb.fromPassive(str, form);
          } else if (term.tags.has('PastTense')) {
            let form = verbForm$2(term);
            term.root = transform.verb.fromPastParticiple(str, form);
          }
          //  fromImperfectTense, fromPastParticiple
        }
      });
    });
  };
  var root$1 = root;

  var lexicon = {
    methods: {
      two: {
        transform: methods$1
      }
    },
    words: words$1,
    compute: {
      root: root$1
    }
  };

  const hasApostrophe = /['‘’‛‵′`´]/;

  // normal regexes
  const doRegs = function (str, regs) {
    for (let i = 0; i < regs.length; i += 1) {
      if (regs[i][0].test(str) === true) {
        return regs[i]
      }
    }
    return null
  };

  const checkRegex = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let { regexText, regexNormal, regexNumbers } = world.model.two;
    let normal = term.machine || term.normal;
    let text = term.text;
    // keep dangling apostrophe?
    if (hasApostrophe.test(term.post) && !hasApostrophe.test(term.pre)) {
      text += term.post.trim();
    }
    let arr = doRegs(text, regexText) || doRegs(normal, regexNormal);
    // hide a bunch of number regexes behind this one
    if (!arr && /[0-9]/.test(normal)) {
      arr = doRegs(normal, regexNumbers);
    }
    if (arr) {
      setTag([term], arr[1], world, false, `2-regex- '${arr[2] || arr[0]}'`);
      term.confidence = 0.6;
      return true
    }
    return null
  };
  var checkRegex$1 = checkRegex;

  const isTitleCase = function (str) {
    return /^[A-Z][a-z'\u00C0-\u00FF]/.test(str) || /^[A-Z]$/.test(str)
  };

  // add a noun to any non-0 index titlecased word, with no existing tag
  const titleCaseNoun = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    if (i === 0) {
      return null
    }
    if (term.tags.size > 0) {
      return null
    }
    if (isTitleCase(term.text)) {
      setTag([term], 'ProperNoun', world, false, 'title-case');
      return true
    }
    return null
  };
  var titleCase$1 = titleCaseNoun;

  const min = 1400;
  const max = 2100;

  const dateWords = new Set(['pendant', 'dans', 'avant', 'apres', 'pour', 'en']);

  const seemsGood = function (term) {
    if (!term) {
      return false
    }
    if (dateWords.has(term.normal)) {
      return true
    }
    if (term.tags.has('Date') || term.tags.has('Month') || term.tags.has('WeekDay')) {
      return true
    }
    return false
  };

  const seemsOkay = function (term) {
    if (!term) {
      return false
    }
    if (term.tags.has('Ordinal')) {
      return true
    }
    return false
  };

  // recognize '1993' as a year
  const tagYear = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    const term = terms[i];
    if (term.tags.has('NumericValue') && term.tags.has('Cardinal') && term.normal.length === 4) {
      let num = Number(term.normal);
      // number between 1400 and 2100
      if (num && !isNaN(num)) {
        if (num > min && num < max) {
          if (seemsGood(terms[i - 1]) || seemsGood(terms[i + 1])) {
            setTag([term], 'Year', world, false, '2-tagYear');
            return true
          }
          // or is it really-close to a year?
          if (num > 1950 && num < 2025) {
            if (seemsOkay(terms[i - 1]) || seemsOkay(terms[i + 1])) {
              setTag([term], 'Year', world, false, '2-tagYear-close');
              return true
            }
          }
        }
      }
    }
    return null
  };
  var checkYear = tagYear;

  const oneLetterAcronym = /^[A-Z]('s|,)?$/;
  const isUpperCase = /^[A-Z-]+$/;
  const periodAcronym = /([A-Z]\.)+[A-Z]?,?$/;
  const noPeriodAcronym = /[A-Z]{2,}('s|,)?$/;
  const lowerCaseAcronym = /([a-z]\.)+[a-z]\.?$/;

  const oneLetterWord = {
    I: true,
    A: true,
  };
  // just uppercase acronyms, no periods - 'UNOCHA'
  const isNoPeriodAcronym = function (term, model) {
    let str = term.text;
    // ensure it's all upper-case
    if (isUpperCase.test(str) === false) {
      return false
    }
    // long capitalized words are not usually either
    if (str.length > 5) {
      return false
    }
    // 'I' is not a acronym
    if (oneLetterWord.hasOwnProperty(str)) {
      return false
    }
    // known-words, like 'PIZZA' is not an acronym.
    if (model.one.lexicon.hasOwnProperty(term.normal)) {
      return false
    }
    //like N.D.A
    if (periodAcronym.test(str) === true) {
      return true
    }
    //like c.e.o
    if (lowerCaseAcronym.test(str) === true) {
      return true
    }
    //like 'F.'
    if (oneLetterAcronym.test(str) === true) {
      return true
    }
    //like NDA
    if (noPeriodAcronym.test(str) === true) {
      return true
    }
    return false
  };

  const isAcronym = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    //these are not acronyms
    if (term.tags.has('RomanNumeral') || term.tags.has('Acronym')) {
      return null
    }
    //non-period ones are harder
    if (isNoPeriodAcronym(term, world.model)) {
      term.tags.clear();
      setTag([term], ['Acronym', 'Noun'], world, false, '3-no-period-acronym');
      return true
    }
    // one-letter acronyms
    if (!oneLetterWord.hasOwnProperty(term.text) && oneLetterAcronym.test(term.text)) {
      term.tags.clear();
      setTag([term], ['Acronym', 'Noun'], world, false, '3-one-letter-acronym');
      return true
    }
    //if it's a very-short organization?
    if (term.tags.has('Organization') && term.text.length <= 3) {
      setTag([term], 'Acronym', world, false, '3-org-acronym');
      return true
    }
    // upper-case org, like UNESCO
    if (term.tags.has('Organization') && isUpperCase.test(term.text) && term.text.length <= 6) {
      setTag([term], 'Acronym', world, false, '3-titlecase-acronym');
      return true
    }
    return null
  };
  var acronym = isAcronym;

  const hasBefore = {
    la: 'FemaleNoun',
    une: 'FemaleNoun',
    un: 'MaleNoun',
    du: 'MaleNoun',
    au: 'MaleNoun',
    des: 'PluralNoun',
    aux: 'PluralNoun',
    de: 'Noun',
    // modals
    dois: 'Verb',
    doit: 'Verb',
    devons: 'Verb',
    devez: 'Verb',
    doivent: 'Verb',

    peux: 'Verb',
    peut: 'Verb',
    pouvons: 'Verb',
    pouvez: 'Verb',
    peuvent: 'Verb',
    // (conditional)
    pouvait: 'Verb',
    pourrait: 'Verb',
    pourrais: 'Verb',
    pourrions: 'Verb',
    pourriez: 'Verb',
    pourraient: 'Verb',

    // 
    avoir: 'Noun',
    pas: 'Verb' //maybe
  };

  const tagNeighbours = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    if (terms[i - 1]) {
      let lastStr = terms[i - 1].normal;
      if (terms[i].tags.size === 0 && hasBefore.hasOwnProperty(lastStr)) {
        setTag([terms[i]], hasBefore[lastStr], world, false, 'neighbour');
        return true
      }
    }
    return null
  };
  var neighbours = tagNeighbours;

  const nounFallback = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    if (term.tags.size === 0) {
      setTag([term], 'Noun', world, false, 'fallback');
      return true
    }
    return null
  };
  var nounFallback$1 = nounFallback;

  //sweep-through all suffixes
  const suffixLoop = function (str = '', suffixes = []) {
    const len = str.length;
    let max = 7;
    if (len <= max) {
      max = len - 1;
    }
    for (let i = max; i > 1; i -= 1) {
      let suffix = str.substr(len - i, len);
      if (suffixes[suffix.length].hasOwnProperty(suffix) === true) {
        // console.log(suffix)
        let tag = suffixes[suffix.length][suffix];
        return tag
      }
    }
    return null
  };

  // decide tag from the ending of the word
  const suffixCheck = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let suffixes = world.model.two.suffixPatterns;
    let term = terms[i];
    if (term.tags.size === 0) {
      let tag = suffixLoop(term.normal, suffixes);
      if (tag !== null) {
        setTag([term], tag, world, false, '2-suffix');
        term.confidence = 0.7;
        return true
      }
      // try implicit form of word, too
      if (term.implicit) {
        tag = suffixLoop(term.implicit, suffixes);
        if (tag !== null) {
          setTag([term], tag, world, false, '2-implicit-suffix');
          term.confidence = 0.7;
          return true
        }
      }
    }
    return null
  };
  var suffixCheck$1 = suffixCheck;

  // guess a gender for each noun
  const nounGender = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    const guessGender = world.methods.one.guessGender;
    let { tags } = terms[i];
    if (tags.has('Noun') && !tags.has('MaleNoun') && !tags.has('FemaleNoun')) {
      let term = terms[i];
      // should these have genders?
      if (tags.has('ProperNoun') || tags.has('Pronoun') || tags.has('Possessive')) {
        return null
      }
      // look for 'le', look for suffix
      let found = guessGender(terms, i);
      if (found) {
        return setTag([term], found, world, false, '3-noun-gender')
      }
    }
    return null
  };
  var nounGender$1 = nounGender;

  const exceptions = new Set([
    'bras',
    'bus',
    'corps',
    'discours',
    'fils',
    'héros',
    'os',
    'pays',
    'procès',
    'poids',
    'repas',
    'sens',
    'succès',
  ]);
  // guess a plural/singular tag each noun
  const nounPlurals = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let tags = term.tags;
    let str = term.implicit || term.normal || term.text || '';
    if (tags.has('Noun')) {
      if (tags.has('Pronoun') || tags.has('ProperNoun') || tags.has('Uncountable') || tags.has('Date')) {
        return null
      }
      if (exceptions.has(str)) {
        return setTag([term], 'Singular', world, false, '3-plural-guess')
      }
      if (str.endsWith('s') && !str.endsWith('is')) {
        return setTag([term], 'PluralNoun', world, false, '3-plural-guess')
      }
    }
    return null
  };
  var nounPlurals$1 = nounPlurals;

  // guess a plural/singular tag each Adjective
  const adjPlurals = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let tags = term.tags;
    let str = term.implicit || term.normal || term.text || '';
    if (tags.has('Adjective')) {
      if (str.endsWith('s') || str.endsWith('aux')) {
        return setTag([term], 'PluralAdjective', world, false, '3-plural-adj')
      }
      // if (str.endsWith('euse')) {
      //   return setTag([term], 'SingularAdjective', world, false, '3-plural-adj')
      // }
    }
    return null
  };
  var adjPlurals$1 = adjPlurals;

  // maître
  // traître

  const guessGender$2 = function (str) {
    // female singular
    if (str.match(/[eë]$/)) {
      return 'f'
    }
    // female plurals
    let suffixes = [
      /[aei]lles$/,
      /[aei]les$/,
      /[aeiou]ttes$/,
      /ntes$/,
      /i[vct]es$/,
      /uses$/,
      /sses$/,
      /[èuay]res$/,
      /ires$/,
      /ées$/,
      /ues$/,
      /ies$/,
      /ée$/,
      /[ndvt]es$/,
    ];
    for (let i = 0; i < suffixes.length; i += 1) {
      if (suffixes[i].test(str)) {
        return 'f'
      }
    }


    return 'm'
  };

  // guess a gender tag each Adjective
  const adjGender = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let tags = term.tags;
    if (tags.has('Adjective') && !tags.has('FemaleAdjective') && !tags.has('#MaleAdjective')) {
      let str = term.implicit || term.normal || term.text || '';
      // i actually think there are no exceptions.
      if (guessGender$2(str) === 'f') {
        return setTag([term], 'FemaleAdjective', world, false, '3-adj-gender')
      } else {
        return setTag([term], 'MaleAdjective', world, false, '3-adj-gender')
      }
    }
    return null
  };
  var adjGender$1 = adjGender;

  // import data from '../../data/models/adjective/index.js'
  // let count = 0
  // Object.keys(data).forEach(m => {
  //   let [f, mp, fp] = data[m]
  //   if (guessGender(fp) !== 'f') {
  //     console.log(fp)
  //     count += 1
  //   }
  // })
  // console.log(count)

  const tenses = [
    'PresentTense',
    'Infinitive',
    'Imperative',
    'Gerund',
    'PastTense',
    'Modal',
    'Auxiliary',
    'PerfectTense',
    'Pluperfect',
    'ConditionalVerb',
    'FutureTense',
  ];


  let whichTense = [

    //er - present conditional 
    ['erais', 'ConditionalVerb'],
    ['erait', 'ConditionalVerb'],
    ['erions', 'ConditionalVerb'],
    ['eriez', 'ConditionalVerb'],
    ['eraient', 'ConditionalVerb'],

    //er- future
    ['erai', 'FutureTense'],
    ['era', 'FutureTense'],
    ['erons', 'FutureTense'],
    ['erez', 'FutureTense'],
    ['eront', 'FutureTense'],

    // er - imparfait -> PastTense
    ['ais', 'PastTense'],
    ['ait', 'PastTense'],
    ['ions', 'PastTense'],
    ['iez', 'PastTense'],
    ['ient', 'PastTense'],

    // past-participle
    ['ées', 'PastParticiple'],
    ['és', 'PastParticiple'],
    ['ée', 'PastParticiple'],
    ['é', 'Participle'],
    ['u', 'Participle'],//entendu
  ];


  // guess a tense tag each Verb
  const verbTense = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let tags = term.tags;
    if (tags.has('Verb')) {
      // console.log(term)
      let str = term.implicit || term.normal || term.text || '';
      // if we have no tense
      if (!tenses.find(s => tags.has(s))) {
        let found = whichTense.find(a => str.endsWith(a[0]));
        if (found) {
          setTag([term], found[1], world, false, '3-tense-suffix-' + found[1]);
        } else {
          setTag([term], 'PresentTense', world, false, '3-tense-fallback');
        }
      }
    }
    return null
  };
  var verbTense$1 = verbTense;

  let person = ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural'];

  let whichForm = [
    // future
    ['ai', 'FirstPerson'],
    ['tas', 'SecondPerson'],
    ['ta', 'ThirdPerson'],
    ['âmes', 'FirstPersonPlural'],
    ['âtes', 'SecondPersonPlural'],
    ['èrent', 'ThirdPersonPlural'],
    // imperfect
    ['ait', 'ThirdPerson'],
    // futur
    ['eras', 'SecondPerson'],
    ['eront', 'ThirdPersonPlural'],
    // imparfait
    ['asse', 'FirstPerson'],
    ['asses', 'SecondPerson'],
    ['tât', 'ThirdPerson'],
    // present
    ['es', 'SecondPerson'],
    ['ons', 'FirstPersonPlural'],
    ['ez', 'SecondPersonPlural'],
    ['ent', 'ThirdPersonPlural'],
  ];
  const pronouns = {
    je: 'FirstPerson',
    tu: 'SecondPerson',
    il: 'ThirdPerson',
    elle: 'ThirdPerson',
    nous: 'FirstPersonPlural',
    vous: 'SecondPersonPlural',
    ils: 'ThirdPersonPlural',
  };
  // can give us a hint to verb person, too
  const auxiliaries = {
    // etre
    suis: 'FirstPerson',
    es: 'SecondPerson',
    est: 'ThirdPerson',
    sommes: 'FirstPersonPlural',
    êtes: 'SecondPersonPlural',
    sont: 'ThirdPersonPlural',
    serai: 'FirstPerson',
    seras: 'SecondPerson',
    sera: 'ThirdPerson',
    serons: 'FirstPersonPlural',
    serez: 'SecondPersonPlural',
    seront: 'ThirdPersonPlural',
    serait: 'ThirdPerson',
    serions: 'FirstPersonPlural',
    seriez: 'SecondPersonPlural',
    seraient: 'ThirdPersonPlural',

    // 'avoir'
    ai: 'FirstPerson',
    as: 'SecondPerson',
    a: 'ThirdPerson',
    avons: 'FirstPersonPlural',
    avez: 'SecondPersonPlural',
    ont: 'ThirdPersonPlural',
    // future anterior
    aurai: 'FirstPerson',
    auras: 'SecondPerson',
    aura: 'ThirdPerson',
    aurons: 'FirstPersonPlural',
    aurez: 'SecondPersonPlural',
    auront: 'ThirdPersonPlural',
    // Plus-que-parfait
    'avait': 'ThirdPerson',
    'avions': 'FirstPersonPlural',
    'aviez': 'SecondPersonPlural',
    'avaient': 'ThirdPersonPlural',
    // conditional avoir
    aurait: 'ThirdPerson',
    aurions: 'FirstPersonPlural',
    auriez: 'SecondPersonPlural',
    auraient: 'ThirdPersonPlural',
  };

  // guess a tense tag each Verb
  const verbForm = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let tags = term.tags;
    if (tags.has('Verb')) {
      // console.log(term)
      let str = term.implicit || term.normal || term.text || '';
      // if we have no person-tag
      if (!person.find(s => tags.has(s))) {
        // look at the word suffix, for clues
        let found = whichForm.find(a => str.endsWith(a[0]));
        if (found) {
          return setTag([term], found[1], world, false, '3-person-suffix-' + found[1])
        }
        //look backwards for clues
        for (let back = 0; back < 3; back += 1) {
          if (!terms[i - back]) {
            break
          }
          let s = terms[i - back].normal;
          //look backwards for a pronoun
          if (terms[i - back].tags.has('Pronoun')) {
            if (pronouns.hasOwnProperty(s)) {
              return setTag([term], pronouns[s], world, false, '3-person-pronoun-' + s)
            }
          }
          //look backwards for a auxiliary verb - 'sont'
          if (terms[i - back].tags.has('Verb')) {
            if (auxiliaries.hasOwnProperty(s)) {
              return setTag([term], auxiliaries[s], world, false, '3-person-auxiliary-' + s)
            }
          }
        }
      }
    }
    return null
  };
  var verbForm$1 = verbForm;

  // const dateWords = new Set('en', 'entre', 'depuis', 'courant', 'pendant', 'dans', 'lorsque', 'avant', 'après')

  // guess a gender for each noun
  const numberTags = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let { tags } = terms[i];
    // tag some values as a year
    if (tags.has('Cardinal') && tags.has('NumericValue')) {
      let term = terms[i];
      let n = Number(term.text);
      if (n && n > 1600 && n < 2090 && n === parseInt(n, 10)) {
        return setTag([term], 'Year', world, false, '3-year')
      }
    }
    return null
  };
  var numberTypes = numberTags;

  // better guesses for 'le/la/les' in l'foo
  const fixContractions = function (terms, i) {
    let term = terms[i];
    // let tags = term.tags
    if (term.implicit === 'le') {
      let nextTerm = terms[i + 1];
      if (!nextTerm) {
        return null
      }
      if (nextTerm.tags.has('FemaleNoun')) {
        term.implicit = 'la';
      }
      // support female plural?
      if (nextTerm.tags.has('PluralNoun')) {
        term.implicit = 'les';
      }
    }
    return null
  };
  var fixContractions$1 = fixContractions;

  // 1st pass

  // these methods don't care about word-neighbours
  const firstPass = function (terms, world) {
    for (let i = 0; i < terms.length; i += 1) {
      //  is it titlecased?
      let found = titleCase$1(terms, i, world);
      // try look-like rules
      found = found || checkRegex$1(terms, i, world);
      // turn '1993' into a year
      checkYear(terms, i, world);
    }
  };
  const secondPass = function (terms, world) {
    for (let i = 0; i < terms.length; i += 1) {
      let found = acronym(terms, i, world);
      found = found || suffixCheck$1(terms, i, world);
      found = found || neighbours(terms, i, world);
      found = found || nounFallback$1(terms, i, world);
    }
  };
  const thirdPass = function (terms, world) {
    for (let i = 0; i < terms.length; i += 1) {
      nounGender$1(terms, i, world);
      nounPlurals$1(terms, i, world);
      adjPlurals$1(terms, i, world);
      adjGender$1(terms, i, world);
      verbTense$1(terms, i, world);
      verbForm$1(terms, i, world);
      numberTypes(terms, i, world);
    }
    // (4th pass)
    for (let i = 0; i < terms.length; i += 1) {
      fixContractions$1(terms, i);
    }
  };


  const tagger = function (view) {
    let world = view.world;
    view.docs.forEach(terms => {
      firstPass(terms, world);
      secondPass(terms, world);
      thirdPass(terms, world);
    });
    return view
  };
  var preTagger$1 = tagger;

  const boringTags = new Set(['Auxiliary', 'Possessive']);

  const sortByKids = function (tags, tagSet) {
    tags = tags.sort((a, b) => {
      // (unknown tags are interesting)
      if (boringTags.has(a) || !tagSet.hasOwnProperty(b)) {
        return 1
      }
      if (boringTags.has(b) || !tagSet.hasOwnProperty(a)) {
        return -1
      }
      let kids = tagSet[a].children || [];
      let aKids = kids.length;
      kids = tagSet[b].children || [];
      let bKids = kids.length;
      return aKids - bKids
    });
    return tags
  };

  const tagRank = function (view) {
    const { document, world } = view;
    const tagSet = world.model.one.tagSet;
    document.forEach(terms => {
      terms.forEach(term => {
        let tags = Array.from(term.tags);
        term.tagRank = sortByKids(tags, tagSet);
      });
    });
  };
  var tagRank$1 = tagRank;

  var regexNormal = [
    //web tags
    [/^[\w.]+@[\w.]+\.[a-z]{2,3}$/, 'Email'],
    [/^(https?:\/\/|www\.)+\w+\.[a-z]{2,3}/, 'Url', 'http..'],
    [/^[a-z0-9./].+\.(com|net|gov|org|ly|edu|info|biz|dev|ru|jp|de|in|uk|br|io|ai)/, 'Url', '.com'],

    // timezones
    [/^[PMCE]ST$/, 'Timezone', 'EST'],

    //names
    [/^ma?c'.*/, 'LastName', "mc'neil"],
    [/^o'[drlkn].*/, 'LastName', "o'connor"],
    [/^ma?cd[aeiou]/, 'LastName', 'mcdonald'],

    //slang things
    [/^(lol)+[sz]$/, 'Expression', 'lol'],
    [/^wo{2,}a*h?$/, 'Expression', 'wooah'],
    [/^(hee?){2,}h?$/, 'Expression', 'hehe'],
    [/^(un|de|re)\\-[a-z\u00C0-\u00FF]{2}/, 'Verb', 'un-vite'],

    // m/h
    [/^(m|k|cm|km)\/(s|h|hr)$/, 'Unit', '5 k/m'],
    // μg/g
    [/^(ug|ng|mg)\/(l|m3|ft3)$/, 'Unit', 'ug/L'],
  ];

  var regexNumbers = [

    [/^@1?[0-9](am|pm)$/i, 'Time', '3pm'],
    [/^@1?[0-9]:[0-9]{2}(am|pm)?$/i, 'Time', '3:30pm'],
    [/^'[0-9]{2}$/, 'Year'],
    // times
    [/^[012]?[0-9](:[0-5][0-9])(:[0-5][0-9])$/, 'Time', '3:12:31'],
    [/^[012]?[0-9](:[0-5][0-9])?(:[0-5][0-9])? ?(am|pm)$/i, 'Time', '1:12pm'],
    [/^[012]?[0-9](:[0-5][0-9])(:[0-5][0-9])? ?(am|pm)?$/i, 'Time', '1:12:31pm'], //can remove?

    // iso-dates
    [/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/i, 'Date', 'iso-date'],
    [/^[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,4}$/, 'Date', 'iso-dash'],
    [/^[0-9]{1,4}\/[0-9]{1,2}\/[0-9]{1,4}$/, 'Date', 'iso-slash'],
    [/^[0-9]{1,4}\.[0-9]{1,2}\.[0-9]{1,4}$/, 'Date', 'iso-dot'],
    [/^[0-9]{1,4}-[a-z]{2,9}-[0-9]{1,4}$/i, 'Date', '12-dec-2019'],

    // timezones
    [/^utc ?[+-]?[0-9]+$/, 'Timezone', 'utc-9'],
    [/^(gmt|utc)[+-][0-9]{1,2}$/i, 'Timezone', 'gmt-3'],

    //phone numbers
    [/^[0-9]{3}-[0-9]{4}$/, 'PhoneNumber', '421-0029'],
    [/^(\+?[0-9][ -])?[0-9]{3}[ -]?[0-9]{3}-[0-9]{4}$/, 'PhoneNumber', '1-800-'],


    //money
    //like $5.30
    [
      /^[-+]?[$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6][-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?([kmb]|bn)?\+?$/,
      ['Money', 'Value'],
      '$5.30',
    ],
    //like 5.30$
    [
      /^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?[$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]\+?$/,
      ['Money', 'Value'],
      '5.30£',
    ],
    //like
    [/^[-+]?[$£]?[0-9]([0-9,.])+(usd|eur|jpy|gbp|cad|aud|chf|cny|hkd|nzd|kr|rub)$/i, ['Money', 'Value'], '$400usd'],

    //numbers
    // 50 | -50 | 3.23  | 5,999.0  | 10+
    [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?\+?$/, ['Cardinal', 'NumericValue'], '5,999'],
    [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?(e|er)$/, ['Ordinal', 'NumericValue'], '53rd'],
    // .73th
    [/^\.[0-9]+\+?$/, ['Cardinal', 'NumericValue'], '.73th'],
    //percent
    [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?%\+?$/, ['Percent', 'Cardinal', 'NumericValue'], '-4%'],
    [/^\.[0-9]+%$/, ['Percent', 'Cardinal', 'NumericValue'], '.3%'],
    //fraction
    [/^[0-9]{1,4}\/[0-9]{1,4}(e|er)?s?$/, ['Fraction', 'NumericValue'], '2/3rds'],
    //range
    [/^[0-9.]{1,3}[a-z]{0,2}[-–—][0-9]{1,3}[a-z]{0,2}$/, ['Value', 'NumberRange'], '3-4'],
    //time-range
    [/^[0-9]{1,2}(:[0-9][0-9])?(am|pm)? ?[-–—] ?[0-9]{1,2}(:[0-9][0-9])?(am|pm)$/, ['Time', 'NumberRange'], '3-4pm'],
    //with unit
    [/^[0-9.]+([a-z]{1,4})$/, 'Value', '9km'],
  ];

  var regexText = [
    // #coolguy
    [/^#[a-z0-9_\u00C0-\u00FF]{2,}$/i, 'HashTag'],

    // @spencermountain
    [/^@\w{2,}$/, 'AtMention'],

    // period-ones acronyms - f.b.i.
    [/^([A-Z]\.){2}[A-Z]?/i, ['Acronym', 'Noun'], 'F.B.I'], //ascii-only

    // ending-apostrophes
    [/.{3}[lkmnp]in['‘’‛‵′`´]$/, 'Gerund', "chillin'"],
    [/.{4}s['‘’‛‵′`´]$/, 'Possessive', "flanders'"],

    // leading contractions
    // [/^s'[a-z]$/, 'Verb'],
    // [/^l'[a-z]$/, 'Noun'],
  ];

  const rb = 'Adverb';
  const nn = 'Noun';
  const vb = 'Verb';
  const jj = 'Adjective';
  const inf = 'Infinitive';
  // const pres = 'PresentTense'


  var suffixPatterns = [
    null,
    null,
    {
      //2-letter
      ce: nn,//connaissance
      ge: nn,
      ie: nn,

      er: inf,
      ir: inf,
      ée: vb,
      és: vb,
      sé: vb,
      ré: vb,
      çu: vb,//conçu
      ra: vb,//faudra
      it: vb,//fournit
      ez: vb,//consultez

      if: jj,//descriptif
    },
    {
      //3-letter
      ité: nn, //qualité
      eur: nn,//directeur
      ces: nn,//connaissances

      ées: vb,//énoncées
      ait: vb,//devrait
      era: vb,//aidera
      ser: vb,//utiliser
      ter: vb,//adopter

      ive: jj, //
      ifs: jj, //relatifs
      ile: jj, //civile
      ale: jj, //nationale
      ble: jj, //capable
      aux: jj, //nationaux
      eux: jj, //précieux
      nte: jj, //différente
    },
    {
      //4-letter
      ment: rb,

      elle: jj,
      bles: jj,
      ales: jj,
      ique: jj,
      aire: jj,
      ives: jj,
      ntes: jj, //différentes

      sent: vb,//produisent

      sion: nn,//commission
      eurs: nn,//directeurs
      tion: nn,//amélioration
      ance: nn,//croissance
      euse: jj,//rigoureuse
      ouce: jj//douce
    },
    {
      //5-letter
      tions: nn,//améliorations
      ments: nn,//aliments
      sions: nn,//commissions

      aient: vb,//auraient
      arant: vb,//préparant
      irant: vb,//inspirant
      orant: vb,//élaborant
      urant: vb,//assurant
      trant: vb,//montrant
      llant: vb,//détaillant

      ouces: jj,//douces
      elles: jj,
      iques: jj,
      aires: jj,
      euses: jj
    },
    {
      //6-letter
    },
    {
      //7-letter
    },
  ];

  var model = {
    regexNormal,
    regexNumbers,
    regexText,
    suffixPatterns
  };

  let masc = new Set(['le', 'un', 'du']);
  let femme = new Set(['la', 'une']);

  const femaleEnds = ['anse', 'ette', 'esse', 'ance', 'eine', 'ure', 'ion'];
  const maleEnds = [
    'age', 'isme', 'eau', 'ment', 'in', 'ou', 'et', 'ege', 'eme', 'ome', 'aume', 'age', 'isme', 'an', 'ent', 'ai', 'out', 'et', 'eu', 'ut', 'is', 'il', 'ex',
    'an', 'and', 'ant', 'ent', 'in', 'int', 'om', 'ond', 'ont', 'eau', 'au', 'aud', 'aut', 'o', 'os', 'ot', 'ai', 'ais', 'ait', 'es', 'et', 'ou', 'out', 'out', 'oux', 'i', 'il', 'it', 'is', 'y', 'at', 'as', 'ois', 'oit', 'u', 'us', 'ut',
    'eu', 'er', 'cé', 'age', 'ege', 'ème', 'ome', 'aume', 'isme', 'as', 'is', 'os', 'us', 'ex', 'it', 'est', 'al', 'el', 'il', 'ol', 'eul', 'all', 'if', 'ef', 'ac', 'ic', 'oc', 'uc', 'am', 'um', 'en', 'air', 'er',
    'erf', 'ert', 'ar', 'arc', 'ars', 'art', 'our', 'ours', 'or', 'ord', 'ors', 'ort', 'ir', 'oir', 'eur', 'ail', 'eil', 'euil', 'ueil', 'ing',
  ];


  const suffixGuess = function (term) {
    let str = term.normal;
    str = str.replace(/s$/, '');
    if (femaleEnds.find(suff => str.endsWith(suff))) {
      return 'FemaleNoun'
    }
    if (maleEnds.find(suff => str.endsWith(suff))) {
      return 'MaleNoun'
    }
    return null
  };

  const fallback = function (term) {
    let str = term.normal;
    if (str.endsWith('e') || str.endsWith('es')) {
      return 'FemaleNoun'
    }
    return null //-?
  };

  const lookLeft = function (terms, i) {
    for (let n = 1; n < 3; n += 1) {
      if (!terms[i - n]) {
        return null
      }
      let term = terms[i - n];
      if (masc.has(term.normal)) {
        return 'MaleNoun'
      }
      if (femme.has(term.normal)) {
        return 'FemaleNoun'
      }
    }
    return null
  };

  // look for a gendered adjective
  const lookRight = function (terms, i) {
    for (let n = 1; n < 2; n += 1) {
      if (!terms[i + n]) {
        return null
      }
      let term = terms[i + n];
      if (term.tags.has('MaleAdjective')) {
        return 'MaleNoun'
      }
      if (term.tags.has('FemaleAdjective')) {
        return 'FemaleNoun'
      }
    }
    return null
  };

  const guessGender = function (terms, i) {
    let { tags } = terms[i];
    if (!tags.has('Noun')) {
      return null
    }
    if (tags.has('MaleNoun')) {
      return 'MaleNoun'
    }
    if (tags.has('FemaleNoun')) {
      return 'FemaleNoun'
    }
    let found = lookLeft(terms, i);
    found = found || lookRight(terms, i);
    found = found || suffixGuess(terms[i]);
    found = found || fallback(terms[i]);
    return found
  };
  var guessGender$1 = guessGender;

  var methods = { one: { guessGender: guessGender$1 } };

  var preTagger = {
    compute: {
      preTagger: preTagger$1,
      tagRank: tagRank$1
    },
    methods,
    model: {
      two: model
    },
    hooks: ['preTagger']
  };

  const tagNoun = function (m) {
    let world = m.world;
    m.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        nounGender$1(terms, i, world);
        nounPlurals$1(terms, i, world);
      });
    });
  };
  const tagAdj = function (m) {
    let world = m.world;
    m.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        adjGender$1(terms, i, world);
        adjPlurals$1(terms, i, world);
      });
    });
  };
  const tagVerb = function (m) {
    let world = m.world;
    m.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        verbTense$1(terms, i, world);
      });
    });
  };

  const postTagger$1 = function (doc) {
    // ==Nouns==
    // l'inconnu
    doc.match('(le|un) [#Verb]', 0).tag(['MaleNoun', 'Singular'], 'le-verb');
    doc.match('(la|une) [#Verb]', 0).tag(['FemaleNoun', 'Singular'], 'la-verb');
    tagNoun(doc.match('(quelques|quelque) [#Verb]', 0).tag('Noun', 'quelque-verb'));
    tagNoun(doc.match('(des|les|mes|ces|tes|ses|nos|vos|leurs) [#Verb]', 0).tag('PluralNoun', 'des-verb'));

    // ==Verbs==
    // ne foo pas
    tagVerb(doc.match('ne [.] pas', 0).tag('Verb', 'ne-verb-pas'));
    // il active le
    tagVerb(doc.match('il [.] (le|la|les)', 0).tag('Verb', 'il-verb-le'));
    // reflexive
    tagVerb(doc.match('(se|me|te) [.]', 0).tag('Verb', 'se-noun'));
    // Elle interdit les transactions
    tagVerb(doc.match('(je|tu|il|elle|nous|vous|ils) [#Adjective] (la|le|les)', 0).tag('Verb', 'ils-x-les'));
    // sont interdites par l'interdiction
    tagVerb(doc.match('(est|été|sont|était|serait) [#Adjective] #Preposition', 0).tag('Verb', 'song-x-par'));
    // a dissimulées
    tagVerb(doc.match('(ai|as|a|avons|avez|ont) [#Adjective]', 0).tag('PastTense', 'have-adj'));
    // have unpacked
    doc.match('(ai|as|a|avons|avez|ont) [#PresentTense]', 0).tag('PastTense', 'have-pres');
    // passive voice - est-aimée
    doc.match('#Copula #Adverb?+ [#PastParticiple]', 0).tag('Passive', 'passive-voice');

    // ==Adjectives==
    // est bien calculée
    tagAdj(doc.match('#Copula (bien|très|pas|plus|tant|presque|seulement)+ [#Verb]', 0).tag('Adjective', 'est-bein-calculee'));

    // ==Numbers==
    doc.match('#Value et (un|#Value)').tag('TextValue', 'et-un');
    doc.match('#Value un').tag('TextValue', 'quatre-vingt-un');
    doc.match('moins #Value').tag('TextValue', 'moins-value');

    // ==Dates==
    doc.match('[#Value] #Month', 0).tag('Date', 'val-month');
    // ambig 'sept'
    doc.match('#Month [#Value] #Year', 0).tag('Date', 'mdy');
    doc.match('[#Value] #Month #Year', 0).tag('Date', 'dmy');
    doc.match('le #Value [sept]', 0).tag('Month', 'val-sept');
    doc.match('[sept] #Year', 0).tag('Month', 'sept-year');
    doc.match('[sept] (et|ou) #Month', 0).tag('Month', 'sept-et-month');
    doc.match('sept$').tag('TextValue', 'sept-alone');
    doc.match('et [sept]').tag('TextValue', 'et-sept');
    // sept trente
    doc.match('sept (dix|vingt|trente|quarante|cinquante|soixante|soixante|#Multiple)').tag('TextValue', 'sept-trente');
    doc.match('(dix|vingt|trente|quarante|cinquante|soixante|soixante|#Multiple) sept').tag('TextValue', 'trente-sept');
    // // sept-et-jun
    // doc.match('#Date [et] #Date', 0).tag('Date', 'date-et-date')
    // // courant juin
    // doc.match('(en|entre|depuis|courant|pendant|dans|lorsque|avant|après) #Date').tag('Date', 'depuis-date')
    // // jusque'en juin
    // doc.match('jusque (en|à) #Date').tag('Date', 'jusque-date')
    // // au cours de juin
    // doc.match('au cours de #Date').tag('Date', 'au-cours-de-date')
  };
  var postTagger$2 = postTagger$1;

  var postTagger = {
    compute: {
      postTagger: postTagger$2
    },
    hooks: ['postTagger']
  };

  const entity = ['Person', 'Place', 'Organization'];

  var nouns$1 = {
    Noun: {
      not: ['Verb', 'Adjective', 'Adverb', 'Value', 'Determiner'],
    },
    Singular: {
      is: 'Noun',
      not: ['PluralNoun'],
    },
    ProperNoun: {
      is: 'Noun',
    },
    Person: {
      is: 'Singular',
      also: ['ProperNoun'],
      not: ['Place', 'Organization', 'Date'],
    },
    FirstName: {
      is: 'Person',
    },
    MaleName: {
      is: 'FirstName',
      not: ['FemaleName', 'LastName'],
    },
    FemaleName: {
      is: 'FirstName',
      not: ['MaleName', 'LastName'],
    },
    LastName: {
      is: 'Person',
      not: ['FirstName'],
    },
    Honorific: {
      is: 'Noun',
      not: ['FirstName', 'LastName', 'Value'],
    },
    Place: {
      is: 'Singular',
      not: ['Person', 'Organization'],
    },
    Country: {
      is: 'Place',
      also: ['ProperNoun'],
      not: ['City'],
    },
    City: {
      is: 'Place',
      also: ['ProperNoun'],
      not: ['Country'],
    },
    Region: {
      is: 'Place',
      also: ['ProperNoun'],
    },
    Address: {
      // is: 'Place',
    },
    Organization: {
      is: 'ProperNoun',
      not: ['Person', 'Place'],
    },
    SportsTeam: {
      is: 'Organization',
    },
    School: {
      is: 'Organization',
    },
    Company: {
      is: 'Organization',
    },
    PluralNoun: {
      is: 'Noun',
      not: ['Singular'],
    },
    Uncountable: {
      is: 'Noun',
    },
    Pronoun: {
      is: 'Noun',
      not: entity,
    },
    Actor: {
      is: 'Noun',
      not: entity,
    },
    Activity: {
      is: 'Noun',
      not: ['Person', 'Place'],
    },
    Unit: {
      is: 'Noun',
      not: entity,
    },
    Demonym: {
      is: 'Noun',
      also: ['ProperNoun'],
      not: entity,
    },
    Possessive: {
      is: 'Noun',
    },
    // german genders
    MaleNoun: {
      is: 'Noun',
      not: ['FemaleNoun'],
    },
    FemaleNoun: {
      is: 'Noun',
      not: ['MaleNoun'],
    },
  };

  var verbs$1 = {
    Verb: {
      not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
    },
    PresentTense: {
      is: 'Verb',
      not: ['PastTense'],
    },
    Infinitive: {
      is: 'PresentTense',
      not: ['Gerund'],
    },
    Imperative: {
      is: 'Infinitive',
    },
    Gerund: {
      is: 'PresentTense',
      not: ['Copula'],
    },
    PastTense: {
      is: 'Verb',
      not: ['PresentTense', 'Gerund'],
    },
    Copula: {
      is: 'Verb',
    },
    Modal: {
      is: 'Verb',
      not: ['Infinitive'],
    },
    PerfectTense: {
      is: 'Verb',
      not: ['Gerund'],
    },
    Pluperfect: {
      is: 'Verb',
    },
    Participle: {
      is: 'PastTense',
    },
    PhrasalVerb: {
      is: 'Verb',
    },
    Passive: {
      is: 'PastTense',
    },
    Particle: {
      is: 'PhrasalVerb',
      not: ['PastTense', 'PresentTense', 'Copula', 'Gerund'],
    },
    Auxiliary: {
      is: 'Verb',
      not: ['PastTense', 'PresentTense', 'Gerund', 'Conjunction'],
    },

    // french verb forms
    PresentParticiple: {
      is: 'PresentTense',
      not: ['PastTense', 'FutureTense'],
    },
    PastParticiple: {
      is: 'PastTense',
      not: ['PresentTense', 'FutureTense'],
    },
    // [only formal]  parlai, parlâmes
    PastSimple: {
      is: 'PastTense',
      not: ['PresentTense', 'FutureTense'],
    },
    ConditionalVerb: {
      is: 'Verb',
    },
    FutureTense: {
      is: 'Verb',
      not: ['PresentTense', 'PastTense', 'Gerund'],
    },

    // 
    FirstPerson: {
      is: 'Verb',
      not: ['SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    SecondPerson: {
      is: 'Verb',
      not: ['FirstPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    ThirdPerson: {
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    FirstPersonPlural: {
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    SecondPersonPlural: {
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'ThirdPersonPlural']
    },
    ThirdPersonPlural: {
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural']
    },
  };

  var values = {
    Value: {
      not: ['Verb', 'Adjective', 'Adverb'],
    },
    Ordinal: {
      is: 'Value',
      not: ['Cardinal'],
    },
    Cardinal: {
      is: 'Value',
      not: ['Ordinal'],
    },
    Fraction: {
      is: 'Value',
      not: ['Noun'],
    },
    Multiple: {
      is: 'TextValue',
    },
    RomanNumeral: {
      is: 'Cardinal',
      not: ['TextValue'],
    },
    TextValue: {
      is: 'Value',
      not: ['NumericValue'],
    },
    NumericValue: {
      is: 'Value',
      not: ['TextValue'],
    },
    Money: {
      is: 'Cardinal',
    },
    Percent: {
      is: 'Value',
    },
  };

  var dates = {
    Date: {
      not: ['Verb', 'Adverb', 'Adjective'],
    },
    Month: {
      is: 'Singular',
      also: ['Date'],
      not: ['Year', 'WeekDay', 'Time'],
    },
    WeekDay: {
      is: 'Noun',
      also: ['Date'],
    },
    Year: {
      is: 'Date',
      not: ['RomanNumeral'],
    },
    FinancialQuarter: {
      is: 'Date',
      not: 'Fraction',
    },
    // 'easter'
    Holiday: {
      is: 'Date',
      also: ['Noun'],
    },
    // 'summer'
    Season: {
      is: 'Date',
    },
    Timezone: {
      is: 'Noun',
      also: ['Date'],
      not: ['ProperNoun'],
    },
    Time: {
      is: 'Date',
      not: ['AtMention'],
    },
    // 'months'
    Duration: {
      is: 'Noun',
      also: ['Date'],
    },
  };

  const anything = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord'];

  var misc = {
    Adjective: {
      not: ['Noun', 'Verb', 'Adverb', 'Value'],
    },
    Comparable: {
      is: 'Adjective',
    },
    Comparative: {
      is: 'Adjective',
    },
    Superlative: {
      is: 'Adjective',
      not: ['Comparative'],
    },
    MaleAdjective: {
      is: 'Adjective',
      not: ['FemaleAdjective'],
    },
    FemaleAdjective: {
      is: 'Adjective',
      not: ['MaleAdjective'],
    },
    PluralAdjective: {
      is: 'Adjective',
    },
    NumberRange: {},
    Adverb: {
      not: ['Noun', 'Verb', 'Adjective', 'Value'],
    },

    Determiner: {
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction', 'Preposition'], //allow 'a' to be a Determiner/Value
    },
    Conjunction: {
      not: anything,
    },
    Preposition: {
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
    },
    QuestionWord: {
      not: ['Determiner'],
    },
    Currency: {
      is: 'Noun',
    },
    Expression: {
      not: ['Noun', 'Adjective', 'Verb', 'Adverb'],
    },
    Abbreviation: {},
    Url: {
      not: ['HashTag', 'PhoneNumber', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
    },
    PhoneNumber: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
    },
    HashTag: {},
    AtMention: {
      is: 'Noun',
      not: ['HashTag', 'Email'],
    },
    Emoji: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Emoticon: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Email: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Acronym: {
      not: ['PluralNoun', 'RomanNumeral'],
    },
    Negative: {
      not: ['Noun', 'Adjective', 'Value'],
    },
    Condition: {
      not: ['Verb', 'Adjective', 'Noun', 'Value'],
    },
  };

  let tags = Object.assign({}, nouns$1, verbs$1, values, dates, misc);

  var tagset = {
    tags
  };

  const findNumbers = function (view) {
    let m = view.match('#Value+');

    //seventh fifth
    if (m.match('#Ordinal #Ordinal').match('#TextValue').found && !m.has('#Multiple')) {
      m = m.splitAfter('#Ordinal');
    }

    //fifth five
    m = m.splitBefore('#Ordinal [#Cardinal]', 0);
    //5-8
    m = m.splitAfter('#NumberRange');
    // june 5th 1999
    m = m.splitBefore('#Year');
    return m
  };
  var find$1 = findNumbers;

  var data = {

    ones: [
      [0, 'zero', 'zeroième'],
      [1, 'un', 'unième'],
      [2, 'deux', 'deuxième'],
      [3, 'trois', 'troisième'],
      [4, 'quatre', 'quatrième'],
      [5, 'cinq', 'cinquième'],
      [6, 'six', 'sixième'],
      [7, 'sept', 'septième'],
      [8, 'huit', 'huitième'],
      [9, 'neuf', 'neuvième'],
      [10, 'dix', 'dixième'],
      [11, 'onze', 'onzième'],
      [12, 'douze', 'douzième'],
      [13, 'treize', 'treizième'],
      [14, 'quatorze', 'quatorzième'],
      [15, 'quinze', 'quinzième'],
      [16, 'seize', 'seizième'],
      [17, 'dix sept', 'dix septième'],
      [18, 'dix huit', 'dix huitième'],
      [19, 'dix neuf', 'dix neuvième'],
    ],
    tens: [
      [20, 'vingt', 'vingtième'],
      [30, 'trente', 'trentième'],
      [40, 'quarante', 'quarantième'],
      [50, 'cinquante', 'cinquantième'],
      [60, 'soixante', 'soixantième'],
      [70, 'soixante dix', 'soixante dixième'],
      [80, 'quatre vingt', 'quatre vingtième'],
      [90, 'quatre vingt dix', 'quatre vingt dixième'],
    ],
    multiples: [
      [100, 'cent', 'centième'],
      [1000, 'mille', 'millième'],
      [1000000, 'million', 'millionième'],//million 1000,000
      [1000000000, 'milliard', 'milliardième'],//billion 1000,000,000
      // [1000000000000, 'mille milliards', 'mille milliardième'],//trillion 1000,000,000
    ]

  };

  const toCardinal = {};
  const toOrdinal = {};
  const toNumber = {};

  Object.keys(data).forEach(k => {
    data[k].forEach(a => {
      let [num, w, ord] = a;
      toCardinal[ord] = w;
      toOrdinal[w] = ord;
      toNumber[w] = num;
      // add ordinal without accents
      let norm = ord.replace(/è/, 'e');
      toNumber[norm] = num;
    });
  });

  // add some more
  Object.assign(toNumber, {
    cents: 100,
    milles: 1000,
    millions: 1000000,
    milliards: 1000000000,
  });

  const multiLeft = {
    dix: true,//dix huit
    soixante: true,//soixante dix
    quatre: true,//quatre vingt
    mille: true//mille milliards
  };

  const multiples$1 = {
    // cent: 100,//hundred
    mille: 1000,//thousand
    milles: 1000,//thousand
    million: 1000000,//million
    millions: 1000000,//million
    milliards: 1000000000//billion
  };

  // greedy scan for multi-word numbers, like 'quatre vingt'
  const scanAhead = function (terms, i) {
    let skip = 0;
    let add = 0;
    let words = [];
    for (let index = 0; index < 3; index += 1) {
      if (!terms[i + index]) {
        break
      }
      let w = terms[i + index].normal || '';
      if (toCardinal.hasOwnProperty(w)) {
        w = toCardinal[w];
      }
      words.push(w);
      let str = words.join(' ');
      if (toNumber.hasOwnProperty(str)) {
        skip = index;
        add = toNumber[str];
      }
    }
    return { skip, add }
  };

  const parseNumbers = function (terms = []) {
    let sum = 0;
    let carry = 0;
    let minus = false;
    let sums = [];
    for (let i = 0; i < terms.length; i += 1) {
      let { tags, normal } = terms[i];
      let w = normal || '';
      if (w === 'moins') {
        minus = true;
        continue
      }
      // ... et-un
      if (w === 'et') {
        continue
      }
      // 'huitieme'
      if (tags.has('Ordinal')) {
        w = toCardinal[w];
      }
      // add thousand, million
      if (multiples$1.hasOwnProperty(w)) {
        sum += carry;
        carry = 0;
        if (!sum) {
          sum = 1;
        }
        sum *= multiples$1[w];
        sums.push(sum);
        sum = 0;
        continue
      }
      // support 'quatre vingt dix', etc
      if (multiLeft.hasOwnProperty(w)) {
        let { add, skip } = scanAhead(terms, i);
        if (skip > 0) {
          carry += add;
          i += skip;
          continue
        }
      }

      // 'cent'
      if (tags.has('Multiple')) {
        let mult = toNumber[w] || 1;
        if (carry === 0) {
          carry = 1;
        }
        sum += mult * carry;
        carry = 0;
        continue
      }
      // 'trois'
      if (toNumber.hasOwnProperty(w)) {
        carry += toNumber[w];
      } else {
        let n = Number(w);
        if (n) {
          carry += n;
        }
      }
    }
    // include any remaining
    if (carry !== 0) {
      sum += carry;
    }
    sums.push(sum);
    sum = sums.reduce((h, n) => {
      return h + n
    }, 0);
    if (minus === true) {
      sum *= -1;
    }
    return sum
  };
  var fromText = parseNumbers;

  const fromNumber = function (m) {
    let str = m.text('normal').toLowerCase();
    str = str.replace(/(e|er)$/, '');
    let hasComma = false;
    if (/,/.test(str)) {
      hasComma = true;
      str = str.replace(/,/g, '');
    }
    // get prefix/suffix
    let arr = str.split(/([-0-9.,]*)/);
    let [prefix, num] = arr;
    let suffix = arr.slice(2).join('');
    if (num !== '' && m.length < 2) {
      num = Number(num || str);
      //ensure that num is an actual number
      if (typeof num !== 'number') {
        num = null;
      }
      // strip an ordinal off the suffix
      if (suffix === 'e' || suffix === 'er') {
        suffix = '';
      }
    }
    return {
      hasComma,
      prefix,
      num,
      suffix,
    }
  };

  const parseNumber = function (m) {
    let terms = m.docs[0];
    let num = null;
    let prefix = '';
    let suffix = '';
    let hasComma = false;
    let isText = m.has('#TextValue');
    if (isText) {
      num = fromText(terms);
    } else {
      let res = fromNumber(m);
      prefix = res.prefix;
      suffix = res.suffix;
      num = res.num;
      hasComma = res.hasComma;
    }
    return {
      hasComma,
      prefix,
      num,
      suffix,
      isText,
      isOrdinal: m.has('#Ordinal'),
      isFraction: m.has('#Fraction'),
      isMoney: m.has('#Money'),
    }
  };
  var parse = parseNumber;

  let ones = data.ones.reverse();
  let tens = data.tens.reverse();

  let multiples = [
    [1e12, 'mille milliard'],
    [1e11, 'cent milliard'],
    [1e9, 'milliard'],
    [1e8, 'cent million'],
    [1e6, 'million'],
    [100000, 'cent mille'],
    [1000, 'mille'],
    [100, 'cent'],
    [1, 'one'],
  ];

  //turn number into an array of magnitudes, like [[5, million], [2, hundred]]
  const getMagnitudes = function (num) {
    let working = num;
    let have = [];
    multiples.forEach(a => {
      if (num >= a[0]) {
        let howmany = Math.floor(working / a[0]);
        working -= howmany * a[0];
        if (howmany) {
          have.push({
            unit: a[1],
            num: howmany,
          });
        }
      }
    });
    return have
  };

  const twoDigit = function (num) {
    let words = [];
    // 20-90
    for (let i = 0; i < tens.length; i += 1) {
      if (tens[i][0] <= num) {
        words.push(tens[i][1]);
        num -= tens[i][0];
        break
      }
    }
    if (num === 0) {
      return words
    }
    // 0-19
    for (let i = 0; i < ones.length; i += 1) {
      if (ones[i][0] <= num) {
        // 'et un'
        if (words.length && ones[i][1] === 'un') {
          words.push('et');
        }
        words.push(ones[i][1]);
        num -= ones[i][0];
        break
      }
    }
    return words
  };

  // turn a number like 80 into words like 'quatre vingt'
  const toText$1 = function (num) {
    if (num === 0) {
      return ['zero']
    }
    let words = [];
    if (num < 0) {
      words.push('moins');
      num = Math.abs(num);
    }
    // handle multiples
    let found = getMagnitudes(num);
    found.forEach(obj => {
      let res = twoDigit(obj.num);
      if (obj.num === 1 && obj.unit !== 'one') ; else {
        words = words.concat(res);
      }
      if (obj.unit !== 'one') {
        words.push(obj.unit);
      }
    });
    return words
  };
  var toText$2 = toText$1;

  const makeSuffix = function (obj) {
    return {
      prefix: obj.prefix || '',
      suffix: obj.suffix || '',
    }
  };

  const formatNumber = function (parsed, fmt) {
    let { prefix, suffix } = makeSuffix(parsed);
    if (fmt === 'TextOrdinal') {
      let words = toText$2(parsed.num);
      let last = words[words.length - 1];
      words[words.length - 1] = toOrdinal[last];
      let num = words.join(' ');
      return `${prefix}${num}${suffix}`
    }
    if (fmt === 'TextCardinal') {
      let num = toText$2(parsed.num).join(' ');
      return `${prefix}${num}${suffix}`
    }
    // numeric formats
    // '55e'
    if (fmt === 'Ordinal') {
      let str = String(parsed.num);
      let last = str.slice(str.length - 1, str.length);
      if (last === '1') {
        let num = str + 'er';
        return `${prefix}${num}${suffix}`
      }
      let num = str + 'e';
      return `${prefix}${num}${suffix}`
    }
    if (fmt === 'Cardinal') {
      let num = String(parsed.num);
      return `${prefix}${num}${suffix}`
    }
    let num = String(parsed.num || '');
    return `${prefix}${num}${suffix}`
  };
  var format = formatNumber;

  // return the nth elem of a doc
  const getNth$3 = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  const api$a = function (View) {
    /**   */
    class Numbers extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Numbers';
      }
      parse(n) {
        return getNth$3(this, n).map(parse)
      }
      get(n) {
        return getNth$3(this, n).map(parse).map(o => o.num)
      }
      json(n) {
        let doc = getNth$3(this, n);
        return doc.map(p => {
          let json = p.toView().json(n)[0];
          let parsed = parse(p);
          json.number = {
            prefix: parsed.prefix,
            num: parsed.num,
            suffix: parsed.suffix,
            hasComma: parsed.hasComma,
          };
          return json
        }, [])
      }
      /** any known measurement unit, for the number */
      units() {
        return this.growRight('#Unit').match('#Unit$')
      }
      /** return only ordinal numbers */
      isOrdinal() {
        return this.if('#Ordinal')
      }
      /** return only cardinal numbers*/
      isCardinal() {
        return this.if('#Cardinal')
      }

      /** convert to numeric form like '8' or '8th' */
      toNumber() {
        let m = this.if('#TextValue');
        m.forEach(val => {
          let obj = parse(val);
          if (obj.num === null) {
            return
          }
          let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal';
          let str = format(obj, fmt);
          if (str) {
            val.replaceWith(str, { tags: true });
            val.tag('NumericValue');
          }
        });
        return this
      }
      /** convert to numeric form like 'eight' or 'eighth' */
      toText() {
        let m = this;
        let res = m.map(val => {
          if (val.has('#TextValue')) {
            return val
          }
          let obj = parse(val);
          if (obj.num === null) {
            return val
          }
          let fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal';
          let str = format(obj, fmt);
          if (str) {
            val.replaceWith(str, { tags: true });
            val.tag('TextValue');
          }
          return val
        });
        return new Numbers(res.document, res.pointer)
      }
      /** convert ordinal to cardinal form, like 'eight', or '8' */
      toCardinal() {
        let m = this;
        let res = m.map(val => {
          if (!val.has('#Ordinal')) {
            return val
          }
          let obj = parse(val);
          if (obj.num === null) {
            return val
          }
          let fmt = val.has('#TextValue') ? 'TextCardinal' : 'Cardinal';
          let str = format(obj, fmt);
          if (str) {
            val.replaceWith(str, { tags: true });
            val.tag('Cardinal');
          }
          return val
        });
        return new Numbers(res.document, res.pointer)
      }
      /** convert cardinal to ordinal form, like 'eighth', or '8th' */
      toOrdinal() {
        let m = this;
        let res = m.map(val => {
          if (val.has('#Ordinal')) {
            return val
          }
          let obj = parse(val);
          if (obj.num === null) {
            return val
          }
          let fmt = val.has('#TextValue') ? 'TextOrdinal' : 'Ordinal';
          let str = format(obj, fmt);
          if (str) {
            val.replaceWith(str, { tags: true });
            val.tag('Ordinal');
          }
          return val
        });
        return new Numbers(res.document, res.pointer)
      }

      /** return only numbers that are == n */
      isEqual(n) {
        return this.filter((val) => {
          let num = parse(val).num;
          return num === n
        })
      }
      /** return only numbers that are > n*/
      greaterThan(n) {
        return this.filter((val) => {
          let num = parse(val).num;
          return num > n
        })
      }
      /** return only numbers that are < n*/
      lessThan(n) {
        return this.filter((val) => {
          let num = parse(val).num;
          return num < n
        })
      }
      /** return only numbers > min and < max */
      between(min, max) {
        return this.filter((val) => {
          let num = parse(val).num;
          return num > min && num < max
        })
      }
      /** set these number to n */
      set(n) {
        if (n === undefined) {
          return this // don't bother
        }
        if (typeof n === 'string') {
          n = parse(n).num;
        }
        let m = this;
        let res = m.map((val) => {
          let obj = parse(val);
          obj.num = n;
          if (obj.num === null) {
            return val
          }
          let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal';
          if (val.has('#TextValue')) {
            fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal';
          }
          let str = format(obj, fmt);
          // add commas to number
          if (obj.hasComma && fmt === 'Cardinal') {
            str = Number(str).toLocaleString();
          }
          if (str) {
            val = val.not('#Currency');
            val.replaceWith(str, { tags: true });
            // handle plural/singular unit
            // agreeUnits(agree, val, obj)
          }
          return val
        });
        return new Numbers(res.document, res.pointer)
      }
      add(n) {
        if (!n) {
          return this // don't bother
        }
        if (typeof n === 'string') {
          n = parse(n).num;
        }
        let m = this;
        let res = m.map((val) => {
          let obj = parse(val);
          if (obj.num === null) {
            return val
          }
          obj.num += n;
          let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal';
          if (obj.isText) {
            fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal';
          }
          let str = format(obj, fmt);
          if (str) {
            val.replaceWith(str, { tags: true });
            // handle plural/singular unit
            // agreeUnits(agree, val, obj)
          }
          return val
        });
        return new Numbers(res.document, res.pointer)
      }
      /** decrease each number by n*/
      subtract(n, agree) {
        return this.add(n * -1, agree)
      }
      /** increase each number by 1 */
      increment(agree) {
        return this.add(1, agree)
      }
      /** decrease each number by 1 */
      decrement(agree) {
        return this.add(-1, agree)
      }
      // overloaded - keep Numbers class
      update(pointer) {
        let m = new Numbers(this.document, pointer);
        m._cache = this._cache; // share this full thing
        return m
      }
    }
    // aliases
    Numbers.prototype.isBetween = Numbers.prototype.between;
    Numbers.prototype.minus = Numbers.prototype.subtract;
    Numbers.prototype.plus = Numbers.prototype.add;
    Numbers.prototype.equals = Numbers.prototype.isEqual;

    View.prototype.numbers = function (n) {
      let m = find$1(this);
      m = getNth$3(m, n);
      return new Numbers(this.document, m.pointer)
    };
    // alias
    View.prototype.values = View.prototype.numbers;
  };
  var api$b = api$a;

  var numbers = {
    api: api$b
  };

  const findPeople = function () {
    let m = this.match('#Honorific+? #Person+');
    return m
  };

  const findOrgs = function () {
    return this.match('#Organization+')
  };

  const findPlaces = function () {
    let m = this.match('(#Place|#Address)+');

    // split all commas except for 'paris, france'
    let splits = m.match('@hasComma');
    splits = splits.filter(c => {
      // split 'europe, china'
      if (c.has('(asia|africa|europe|america)$')) {
        return true
      }
      // don't split 'paris, france'
      if (c.has('(#City|#Region|#ProperNoun)$') && c.after('^(#Country|#Region)').found) {
        return false
      }
      return true
    });
    m = m.splitAfter(splits);
    return m
  };

  const api$8 = function (View) {
    View.prototype.people = findPeople;
    View.prototype.organizations = findOrgs;
    View.prototype.places = findPlaces;
  };

  var api$9 = api$8;

  var topics = {
    api: api$9
  };

  const findVerbs = function (doc) {
    let m = doc.match('<Verb>');

    m = m.splitAfter('@hasComma');

    // the reason he will is ...
    // all i do is talk
    m = m.splitAfter('[(do|did|am|was|is|will)] (is|was)', 0);
    // m = m.splitAfter('[(do|did|am|was|is|will)] #PresentTense', 0)

    // cool

    // like being pampered
    m = m.splitBefore('(#Verb && !#Copula) [being] #Verb', 0);
    // like to be pampered
    m = m.splitBefore('#Verb [to be] #Verb', 0);

    // implicit conjugation - 'help fix'

    m = m.splitAfter('[help] #PresentTense', 0);
    // what i can sell is..
    m = m.splitBefore('(#PresentTense|#PastTense) [#Copula]$', 0);
    // what i can sell will be
    m = m.splitBefore('(#PresentTense|#PastTense) [will be]$', 0);

    // professes love
    let toVerbs = m.match('(#PresentTense|#PastTense) #Infinitive');
    if (toVerbs.found && !toVerbs.has('^go')) {
      m = m.splitBefore('(#PresentTense|#PastTense) [#Infinitive]', 0);
    }
    // 'allow yourself'
    m = m.not('#Reflexive$');
    //ensure there's actually a verb
    m = m.if('#Verb');
    // the reason he will is ...
    // ensure it's not two verbs
    return m
  };
  var find = findVerbs;

  // split adverbs as before/after the root
  const getAdverbs = function (vb, root) {
    let res = {
      pre: vb.none(),
      post: vb.none(),
    };
    if (!vb.has('#Adverb')) {
      return res
    }
    // pivot on the main verb
    let parts = vb.splitOn(root);
    if (parts.length === 3) {
      return {
        pre: parts.eq(0).adverbs(),
        post: parts.eq(2).adverbs(),
      }
    }
    // it must be the second one
    if (parts.eq(0).isDoc(root)) {
      res.post = parts.eq(1).adverbs();
      return res
    }
    res.pre = parts.eq(0).adverbs();
    return res
  };
  var getAdverbs$1 = getAdverbs;

  const getAuxiliary = function (vb, root) {
    let parts = vb.splitBefore(root);
    if (parts.length <= 1) {
      return vb.none()
    }
    let aux = parts.eq(0);
    aux = aux.not('(#Adverb|#Negative|#Prefix)');
    return aux
  };

  const getNegative = function (vb) {
    return vb.match('#Negative')
  };

  // pull-apart phrasal-verb into verb-particle
  // const getPhrasal = function (root) {
  //   let particle = root.match('#Particle$')
  //   return {
  //     verb: root.not(particle),
  //     particle: particle,
  //   }
  // }

  const getRoot$2 = function (view) {
    view.compute('root');
    let str = view.text('root');
    return str
  };

  const parseVerb = function (view) {
    let vb = view.clone();
    // vb.contractions().expand()
    const root = getRoot$2(vb);
    let res = {
      root: root,
      prefix: vb.match('#Prefix'),
      adverbs: getAdverbs$1(vb, root),
      auxiliary: getAuxiliary(vb, root),
      negative: getNegative(vb),
      // phrasal: getPhrasal(root),
    };
    return res
  };
  var parseVerb$1 = parseVerb;

  // import getGrammar from './parse/grammar/index.js'
  // import { getTense } from './lib.js'

  const toArray = function (m) {
    if (!m || !m.isView) {
      return []
    }
    const opts = { normal: true, terms: false, text: false };
    return m.json(opts).map(s => s.normal)
  };

  const toText = function (m) {
    if (!m || !m.isView) {
      return ''
    }
    return m.text('normal')
  };

  // const toInfinitive = function (root) {
  //   const { verbToInfinitive } = root.methods.two.transform
  //   let str = root.text('normal')
  //   return verbToInfinitive(str, root.model, getTense(root))
  // }

  const toJSON = function (vb) {
    let parsed = parseVerb$1(vb);
    vb = vb.clone().toView();
    // const info = getGrammar(vb, parsed)
    return {
      root: parsed.root,
      preAdverbs: toArray(parsed.adverbs.pre),
      postAdverbs: toArray(parsed.adverbs.post),
      auxiliary: toText(parsed.auxiliary),
      negative: parsed.negative.found,
      prefix: toText(parsed.prefix),
      infinitive: parsed.root,
      // grammar: info,
    }
  };
  var toJSON$1 = toJSON;

  // import getSubject from './parse/getSubject.js'
  // import getGrammar from './parse/grammar/index.js'
  // import toNegative from './conjugate/toNegative.js'
  // import debug from './debug.js'


  // return the nth elem of a doc
  const getNth$2 = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  const api$6 = function (View) {
    class Verbs extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Verbs';
      }
      parse(n) {
        return getNth$2(this, n).map(parseVerb$1)
      }
      json(opts, n) {
        let m = getNth$2(this, n);
        let arr = m.map(vb => {
          let json = vb.toView().json(opts)[0] || {};
          json.verb = toJSON$1(vb);
          return json
        }, []);
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
      // toPresentTense(n) {
      //   return getNth(this, n).map(vb => {
      //     let parsed = parseVerb(vb)
      //     let info = getGrammar(vb, parsed)
      //     return toPresent(vb, parsed, info.form)
      //   })
      // }
      toPastTense(n) {
        const methods = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          // let parsed = parseVerb(vb)
          let str = vb.compute('root').text('root');//whew
          let past = methods.toPastParticiple(str);
          return vb.replaceWith(past).tag('PastTense')
          // console.log(str, past)
          // let info = getGrammar(vb, parsed)
          // console.log(info)
          // return toPast(vb, parsed, info.form)
        })
      }
      // toFutureTense(n) {
      //   return getNth(this, n).map(vb => {
      //     let parsed = parseVerb(vb)
      //     let info = getGrammar(vb, parsed)
      //     return toFuture(vb, parsed, info.form)
      //   })
      // }
      // toGerund(n) {
      //   return getNth(this, n).map(vb => {
      //     let parsed = parseVerb(vb)
      //     let info = getGrammar(vb, parsed)
      //     return toGerund(vb, parsed, info.form)
      //   })
      // }
      conjugate(n) {
        const { toImperfect, toPresentTense, toFutureTense, toPastParticiple } = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          let parsed = parseVerb$1(vb);
          let root = parsed.root || '';
          return {
            Infinitive: root,
            PastTense: toImperfect(root),
            PresentTense: toPresentTense(root),
            FutureTense: toFutureTense(root),
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
        let m = new Verbs(this.document, pointer);
        m._cache = this._cache; // share this full thing
        return m
      }
    }
    Verbs.prototype.toPast = Verbs.prototype.toPastTense;
    Verbs.prototype.toPresent = Verbs.prototype.toPresentTense;
    Verbs.prototype.toFuture = Verbs.prototype.toFutureTense;

    View.prototype.verbs = function (n) {
      let vb = find(this);
      vb = getNth$2(vb, n);
      return new Verbs(this.document, vb.pointer)
    };
  };
  var api$7 = api$6;

  var verbs = {
    api: api$7,
  };

  const getNth$1 = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  // get root form of adjective
  const getRoot$1 = function (m) {
    m.compute('root');
    let str = m.text('root');
    return str
  };

  const api$4 = function (View) {
    class Adjectives extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Adjectives';
      }
      conjugate(n) {
        const methods = this.methods.two.transform.adjective;
        return getNth$1(this, n).map(m => {
          let adj = getRoot$1(m);
          return methods.conjugate(adj, methods)
        }, [])
      }
    }

    View.prototype.adjectives = function (n) {
      let m = this.match('#Adjective');
      m = getNth$1(m, n);
      return new Adjectives(this.document, m.pointer)
    };
  };
  var api$5 = api$4;

  var adjectives = {
    api: api$5,
  };

  const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  // get root form of adjective
  const getRoot = function (m) {
    m.compute('root');
    let str = m.text('root');
    // let isPlural = m.has('#PluralNoun')
    // if (isPlural) {
    //   return transform.adjective.fromPlural(str)
    // }
    return str
  };

  const api$2 = function (View) {
    class Nouns extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Nouns';
      }
      conjugate(n) {
        const methods = this.methods.two.transform.noun;
        return getNth(this, n).map(m => {
          let str = m.text();
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
        const methods = this.methods.two.transform.noun;
        return getNth(this, n).if('#Singular').map(m => {
          let str = getRoot(m);
          let plural = methods.toPlural(str);
          return m.replaceWith(plural)
        })
      }
      toSingular(n) {
        const methods = this.methods.two.transform.noun;
        return getNth(this, n).if('#PluralNoun').map(m => {
          let str = getRoot(m);
          let singular = methods.fromPlural(str);
          return m.replaceWith(singular)
        })
      }
    }

    View.prototype.nouns = function (n) {
      let m = this.match('#Noun');
      m = getNth(m, n);
      return new Nouns(this.document, m.pointer)
    };
  };
  var api$3 = api$2;

  var nouns = {
    api: api$3,
  };

  const titleCase = /^\p{Lu}[\p{Ll}'’]/u; //upercase, then lowercase
  // import contract from './contract.js'

  const toTitleCase = function (str = '') {
    str = str.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()); //TODO: support unicode
    return str
  };

  const api = function (View) {
    /** */
    class Contractions extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Contraction';
      }
      /** i've -> 'i have' */
      expand() {
        this.docs.forEach(terms => {
          let isTitleCase = titleCase.test(terms[0].text);
          terms.forEach((t, i) => {
            t.text = t.implicit;
            delete t.implicit;
            //add whitespace
            if (i < terms.length - 1 && t.post === '') {
              t.post += ' ';
            }
            // flag it as dirty
            t.dirty = true;
          });
          // make the first word title-case?
          if (isTitleCase) {
            terms[0].text = toTitleCase(terms[0].text);
          }
        });
        this.compute('normal'); //re-set normalized text
        return this
      }
    }
    // add fn to View
    View.prototype.contractions = function () {
      let m = this.match('@hasContraction+');
      return new Contractions(this.document, m.pointer)
    };
    // View.prototype.contract = contract
  };

  var api$1 = api;

  var contractions = {
    api: api$1
  };

  var version = '0.2.7';

  nlp$1.plugin(tokenize);
  nlp$1.plugin(tagset);
  nlp$1.plugin(lexicon);
  nlp$1.plugin(preTagger);
  nlp$1.plugin(postTagger);
  nlp$1.plugin(numbers);
  nlp$1.plugin(topics);
  nlp$1.plugin(verbs);
  nlp$1.plugin(adjectives);
  nlp$1.plugin(nouns);
  nlp$1.plugin(contractions);

  const fr = function (txt, lex) {
    let dok = nlp$1(txt, lex);
    return dok
  };

  // copy constructor methods over
  Object.keys(nlp$1).forEach(k => {
    if (nlp$1.hasOwnProperty(k)) {
      fr[k] = nlp$1[k];
    }
  });

  // this one is hidden
  Object.defineProperty(fr, '_world', {
    value: nlp$1._world,
    writable: true,
  });



  /** log the decision-making to console */
  fr.verbose = function (set) {
    let env = typeof process === 'undefined' ? self.env || {} : process.env; //use window, in browser
    env.DEBUG_TAGS = set === 'tagger' || set === true ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : '';
    return this
  };
  fr.version = version;

  return fr;

}));
