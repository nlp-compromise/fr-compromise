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
  let compute$9 = {};
  let hooks = [];

  var tmpWrld = { methods: methods$o, model: model$7, compute: compute$9, hooks };

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
  var compute$8 = fns$4;

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

  };
  utils.group = utils.groups;
  utils.fullSentence = utils.fullSentences;
  utils.sentence = utils.fullSentences;
  utils.lastTerm = utils.lastTerms;
  utils.firstTerm = utils.firstTerms;
  var util = utils;

  const methods$n = Object.assign({}, util, compute$8, loops);

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
      let document = this.document.slice(0);
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

  var version$1 = '14.5.0';

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
          m.toPast.exceptions[k] = conj[k].pastTense;
        }
        if (m.fromPast) {
          m.fromPast.exceptions[conj[k].pastTense] = k;
        }
      }
      if (conj[k].presentTense) {
        if (m.toPresent) {
          m.toPresent.exceptions[k] = conj[k].presentTense;
        }
        if (m.fromPresent) {
          m.fromPresent.exceptions[conj[k].presentTense] = k;
        }
      }
      if (conj[k].gerund) {
        if (m.toGerund) {
          m.toGerund.exceptions[k] = conj[k].gerund;
        }
        if (m.fromGerund) {
          m.fromGerund.exceptions[conj[k].gerund] = k;
        }
      }
      // adjective forms
      if (conj[k].comparative) {
        if (m.toComparative) {
          m.toComparative.exceptions[k] = conj[k].comparative;
        }
        if (m.fromComparative) {
          m.fromComparative.exceptions[conj[k].comparative] = k;
        }
      }
      if (conj[k].superlative) {
        if (m.toSuperlative) {
          m.toSuperlative.exceptions[k] = conj[k].superlative;
        }
        if (m.fromSuperlative) {
          m.fromSuperlative.exceptions[conj[k].superlative] = k;
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

  var compute$7 = {
    cache: function (view) {
      view._cache = view.methods.one.cacheDoc(view.document);
    }
  };

  var cache$1 = {
    api: api$m,
    compute: compute$7,
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
  const expand$2 = function (m) {
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
      return input.clone().docs[0] //assume one sentence
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
      terms = addIds$2(terms);
      if (prepend) {
        expand$2(view.update([ptr]).firstTerm());
        cleanPrepend(home, ptr, terms, document);
      } else {
        expand$2(view.update([ptr]).lastTerm());
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
    // support 'foo $0' replacements
    input = subDollarSign(input, main);

    let original = this.update(ptrs);
    // soften-up pointer
    ptrs = ptrs.map(ptr => ptr.slice(0, 3));
    // original.freeze()
    let oldTags = (original.docs[0] || []).map(term => Array.from(term.tags));
    // slide this in
    main.insertAfter(input);
    // are we replacing part of a contraction?
    if (original.has('@hasContraction') && main.contractions) {
      let more = main.grow('@hasContraction+');
      more.contractions().expand();
    }
    // delete the original terms
    main.delete(original); //science.
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
      // is it part of a contraction?
      if (self.has('@hasContraction') && self.contractions) {
        let more = self.grow('@hasContraction');
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
    // add a space
    let end = homeDocs[homeDocs.length - 1];
    let last = end[end.length - 1];
    if (/ /.test(last.post) === false) {
      last.post += ' ';
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
    home.document = combineDocs(home.document, input.document);
    return home.all()
  };

  var concat = {
    // add string as new match/sentence
    concat: function (input) {
      const { methods, document, world } = this;
      // parse and splice-in new terms
      if (typeof input === 'string') {
        let json = methods.one.tokenize.fromString(input, world);
        let ptrs = this.fullPointer;
        let lastN = ptrs[ptrs.length - 1][0];
        spliceArr(document, lastN + 1, json);
        return this.compute('index')
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

  const compute$5 = {
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

  var compute$6 = compute$5;

  var change = {
    api: api$l,
    compute: compute$6,
  };

  var contractions$5 = [
    // simple mappings
    { word: '@', out: ['at'] },
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
    { word: "there's", out: ['there', 'is'] },
    { word: 'dunno', out: ['do', 'not', 'know'] },
    { word: 'gonna', out: ['going', 'to'] },
    { word: 'gotta', out: ['have', 'got', 'to'] }, //hmm
    { word: 'gimme', out: ['give', 'me'] },
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

  var model$6 = { one: { contractions: contractions$5 } };

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

  const numUnit = /^([+-]?[0-9][.,0-9]*)([a-z°²³µ/]+)$/i;

  const notUnit = new Set([
    'st',
    'nd',
    'rd',
    'th',
    'am',
    'pm',
    'max'
  ]);

  const numberUnit = function (terms, i) {
    let term = terms[i];
    let parts = term.text.match(numUnit);
    if (parts !== null) {
      // is it a recognized unit, like 'km'?
      let unit = parts[2].toLowerCase().trim();
      // don't split '3rd'
      if (notUnit.has(unit)) {
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

  //really easy ones
  const contractions$3 = (view) => {
    let { world, document } = view;
    const { model, methods } = world;
    let list = model.one.contractions || [];
    new Set(model.one.units || []);
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
        words = numberUnit$1(terms, i);
        if (words) {
          words = toDocs(words, view);
          splice(document, [n, i], words);
          methods.one.setTag([words[1]], 'Unit', world, null, 'contraction-unit');
        }
      }
    });
  };
  var contractions$4 = contractions$3;

  var compute$4 = { contractions: contractions$4 };

  const plugin = {
    model: model$6,
    compute: compute$4,
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

  const prefix$2 = /^(under|over|mis|re|un|dis|semi|pre|post)-?/;
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
    if (prefix$2.test(word) === true) {
      let stem = word.replace(prefix$2, '');
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

  var compute$3 = {
    lexicon: lexicon$4
  };

  // derive clever things from our lexicon key-value pairs
  const expand$1 = function (words) {
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
  var expandLexicon = expand$1;

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
    compute: compute$3,
    lib: lib$5,
    hooks: ['lexicon']
  };

  // edited by Spencer Kelly
  // credit to https://github.com/BrunoRB/ahocorasick by Bruno Roberto Búrigo.

  const tokenize$3 = function (phrase, world) {
    const { methods, model } = world;
    let terms = methods.one.tokenize.splitTerms(phrase, model).map(methods.one.tokenize.splitWhitespace);
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
      //regex
      if (start(w) === '/' && end(w) === '/') {
        w = stripBoth(w);
        if (opts.caseSensitive) {
          obj.use = 'text';
        }
        obj.regex = new RegExp(w); //potential vuln - security/detect-non-literal-regexp
        return obj
      }

      //root/sense overloaded
      if (start(w) === '{' && end(w) === '}') {
        w = stripBoth(w);
        obj.id = w;
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
            obj.num = split[2];
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

  const hasDash$2 = /[a-z0-9][-–—][a-z]/i;

  // match 're-do' -> ['re','do']
  const splitHyphens$1 = function (regs, world) {
    let prefixes = world.model.one.prefixes;
    for (let i = regs.length - 1; i >= 0; i -= 1) {
      let reg = regs[i];
      if (reg.word && hasDash$2.test(reg.word)) {
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

  const addVerbs = function (token, world) {
    let { verbConjugate } = world.methods.two.transform;
    if (!verbConjugate) {
      return []
    }
    let res = verbConjugate(token.root, world.model);
    delete res.FutureTense;
    return Object.values(res).filter(str => str)
  };

  const addNoun = function (token, world) {
    let { nounToPlural } = world.methods.two.transform;
    let res = [token.root];
    if (!nounToPlural) {
      return res
    }
    res.push(nounToPlural(token.root, world.model));
    return res
  };

  const addAdjective = function (token, world) {
    let { adjToSuperlative, adjToComparative, adjToAdverb } = world.methods.two.transform;
    let res = [token.root];
    if (!adjToSuperlative || !adjToComparative || !adjToAdverb) {
      return res
    }
    res.push(adjToSuperlative(token.root, world.model));
    res.push(adjToComparative(token.root, world.model));
    res.push(adjToAdverb(token.root, world.model));
    return res
  };

  // turn '{walk}' into 'walking', 'walked', etc
  const inflectRoot = function (regs, world) {
    // do we have compromise/two?
    regs = regs.map(token => {
      // a reg to convert '{foo}'
      if (token.root) {
        // check if compromise/two is loaded
        if (world.methods.two && world.methods.two.transform && world.methods.two.transform.verbConjugate) {
          let choices = [];
          if (!token.pos || token.pos === 'Verb') {
            choices = choices.concat(addVerbs(token, world));
          }
          if (!token.pos || token.pos === 'Noun') {
            choices = choices.concat(addNoun(token, world));
          }
          // don't run these by default
          if (!token.pos || token.pos === 'Adjective') {
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
  const hasDash$1 = / [-–—] /;

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
    /** is there a slash '/' in term word? */
    hasSlash: term => /\//.test(term.text),
    /** a hyphen connects two words like-term */
    hasHyphen: term => hasHyphen$1.test(term.post) || hasHyphen$1.test(term.pre),
    /** a dash separates words - like that */
    hasDash: term => hasDash$1.test(term.post) || hasDash$1.test(term.pre),
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
      return reg.fastOr.has(term.implicit) || reg.fastOr.has(term.normal) || reg.fastOr.has(term.text) || reg.fastOr.has(term.machine)
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
      whitespace: 'some',
      punctuation: 'some',
      case: 'none',
      unicode: 'some',
      form: 'machine',
    },
    root: {
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
          text = '{' + t.sense + '}';
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = cli$1.yellow(text);
        let word = "'" + text + "'";
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
    out: out,
  };

  var out$1 = methods$9;

  const isObject$1 = val => {
    return Object.prototype.toString.call(val) === '[object Object]'
  };

  var text = {
    /** */
    text: function (fmt) {
      let opts = {
        keepSpace: true,
        keepPunct: true,
      };
      if (fmt && typeof fmt === 'string' && fmts$1.hasOwnProperty(fmt)) {
        opts = Object.assign({}, fmts$1[fmt]);
      } else if (fmt && isObject$1(fmt)) {
        opts = Object.assign({}, fmt, opts);//todo: fixme
      }
      if (this.pointer) {
        opts.keepSpace = false;
        let ptr = this.pointer[0];
        if (ptr && ptr[1]) {
          opts.keepPunct = false;
        } else {
          opts.keepPunct = true;
        }
      } else {
        opts.keepPunct = true;
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

  const max$1 = 4;

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
        if (obj.ifNo !== undefined && obj.ifNo.some(no => docCache[n].has(no)) === true) {
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
  const runMatch = function (maybeList, document, methods, opts) {
    let results = [];
    for (let n = 0; n < maybeList.length; n += 1) {
      for (let i = 0; i < maybeList[n].length; i += 1) {
        let m = maybeList[n][i];
        // ok, actually do the work.
        let res = methods.one.match([document[n]], m);
        // found something.
        if (res.ptrs.length > 0) {
          // let index=document[n][0].index
          res.ptrs.forEach(ptr => {
            ptr[0] = n; // fix the sentence pointer
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

    // maybeList.forEach((arr, i) => {
    //   let txt = document[i].map(t => t.text).join(' ')
    //   console.log(`==== ${txt} ====`)
    //   arr.forEach(m => {
    //     console.log(`    - ${m.match}`)
    //   })
    // })

    // now actually run the matches
    let results = runMatch$1(maybeList, document, methods, opts);
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
        if (terms.length === 1 && todo.tag === 'Noun') {
          if (looksPlural(terms[0].text)) {
            setTag(terms, 'Plural', world, todo.safe, 'quick-plural');
          } else {
            setTag(terms, 'Singular', world, todo.safe, 'quick-singular');
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
  const compute$2 = function (allTags) {
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
    const nodes = compute$2(allTags);
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
  const initSplit = /([.!?\u203D\u2E18\u203C\u2047-\u2049]+\s)/g;
  // merge these back into prev sentence
  const splitsOnly = /^[.!?\u203D\u2E18\u203C\u2047-\u2049]+\s$/;
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
  const openQuote = RegExp('(' + Object.keys(pairs).join('|') + ')', 'g');
  const closeQuote = RegExp('(' + Object.values(pairs).join('|') + ')', 'g');

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

  let notWord = ['.', '?', '!', ':', ';', '-', '–', '—', '--', '...', '(', ')', '[', ']', '"', "'", '`'];
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

  const allowBefore = [
    '#', //#hastag
    '@', //@atmention
    '_',//underscore
    '\\-',//-4  (escape)
    '+',//+4
    '.',//.4
  ];
  const allowAfter = [
    '%',//88%
    '_',//underscore
    // '\'',// \u0027
  ];

  //all punctuation marks, from https://en.wikipedia.org/wiki/Punctuation
  let beforeReg = new RegExp(`[${allowBefore.join('')}]+$`, '');
  let afterReg = new RegExp(`^[${allowAfter.join('')}]+`, '');

  //we have slightly different rules for start/end - like #hashtags.
  const endings = /[\p{Punctuation}\s]+$/u;
  const startings = /^[\p{Punctuation}\s]+/u;
  const hasApostrophe$1 = /['’]/;
  const hasAcronym = /^[a-z]\.([a-z]\.)+/i;
  const shortYear = /^'[0-9]{2}/;

  const normalizePunctuation = function (str) {
    let original = str;
    let pre = '';
    let post = '';
    // adhoc cleanup for pre
    str = str.replace(startings, found => {
      // punctuation symboles like '@' to allow at start of term
      let m = found.match(beforeReg);
      if (m) {
        pre = found.replace(beforeReg, '');
        return m
      }
      // support years like '97
      if (pre === `'` && shortYear.test(str)) {
        pre = '';
        return found
      }
      pre = found; //keep it
      return ''
    });
    // ad-hoc cleanup for post 
    str = str.replace(endings, found => {
      // punctuation symboles like '@' to allow at start of term
      let m = found.match(afterReg);
      if (m) {
        post = found.replace(afterReg, '');
        return m
      }

      // keep s-apostrophe - "flanders'" or "chillin'"
      if (hasApostrophe$1.test(found) && /[sn]['’]$/.test(original) && hasApostrophe$1.test(pre) === false) {
        post = post.replace(hasApostrophe$1, '');
        return `'`
      }
      //keep end-period in acronym
      if (hasAcronym.test(str) === true) {
        post = found.replace(/^\./, '');
        return '.'
      }
      post = found;//keep it
      return ''
    });
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

  const parseTerm = txt => {
    // cleanup any punctuation as whitespace
    let { str, pre, post } = tokenize$2(txt);
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
      terms = terms.map(splitWhitespace);
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

  var model$4 = {
    one: {
      aliases: aliases$1,
      abbreviations,
      prefixes,
      suffixes,
      lexicon: lexicon$2, //give this one forward
      unicode: unicode$3,
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
    //#tags, @mentions
    str = str.replace(/^[#@]/, '');
    if (str !== term.normal) {
      term.machine = str;
    }
  };
  var machine = doMachine;

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
  const termLoop = function (view, fn) {
    let docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        fn(docs[i][t], view.world);
      }
    }
  };

  const methods$2 = {
    alias: (view) => termLoop(view, alias),
    machine: (view) => termLoop(view, machine),
    normal: (view) => termLoop(view, normal),
    freq: freq$1,
    offset: offset$1,
    index: index$1,
    wordCount: wordCount$1,
  };
  var compute$1 = methods$2;

  var tokenize$1 = {
    compute: compute$1,
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

  var compute = { typeahead: typeahead$1 };

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
    compute,
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
    { after: 'puisqu', out: ['puisque'] },
    { after: 'lorsqu', out: ['lorsque'] },//lorsqu’il
    { after: 'jusqu', out: ['jusque'] },//jusqu’ici
    { word: 'quelqu', out: ['quelque'] },//Quelqu'un

    { word: 'auquel', out: ['à', 'lequel'] },
    { word: 'auxquels', out: ['à', 'lesquels'] },
    { word: 'auxquelles', out: ['à', 'lesquelles'] },
    { word: 'duquel', out: ['de', 'lequel'] },
    { word: 'desquels', out: ['de', 'lesquels'] },
    { word: 'desquelles', out: ['de', 'lesquelles'] },
  ];

  var tokenize = {
    mutate: (world) => {
      world.model.one.unicode = unicode$1;

      world.model.one.contractions = contractions$1;
    }
  };

  const prefix$1 = /^.([0-9]+)/;

  // handle compressed form of key-value pair
  const getKeyVal = function (word, model) {
    let val = model.exceptions[word];
    let m = val.match(prefix$1);
    if (m === null) {
      // return not compressed form
      return model.exceptions[word]
    }
    // uncompress it
    let num = Number(m[1]) || 0;
    let pre = word.substr(0, num);
    return pre + val.replace(prefix$1, '')
  };

  // get suffix-rules according to last char of word
  const getRules = function (word, rules = {}) {
    let char = word[word.length - 1];
    let list = rules[char] || [];
    // do we have a generic suffix?
    if (rules['']) {
      list = list.concat(rules['']);
    }
    return list
  };

  const convert = function (word, model, debug) {
    // check list of irregulars
    if (model.exceptions.hasOwnProperty(word)) {
      if (debug) {
        console.log("exception, ", word, model.exceptions[word]);
      }
      return getKeyVal(word, model)
    }
    // if model is reversed, try rev rules
    let rules = model.rules;
    if (model.reversed) {
      rules = model.rev;
    }
    // try suffix rules
    rules = getRules(word, rules);
    for (let i = 0; i < rules.length; i += 1) {
      let suffix = rules[i][0];
      if (word.endsWith(suffix)) {
        if (debug) {
          console.log("rule, ", rules[i]);
        }
        let reg = new RegExp(suffix + '$');
        return word.replace(reg, rules[i][1])
      }
    }
    if (debug) {
      console.log(' x - ' + word);
    }
    // return the original word unchanged
    return word
  };
  var convert$1 = convert;

  // index rules by last-char
  const indexRules = function (rules) {
    let byChar = {};
    rules.forEach((a) => {
      let suff = a[0] || '';
      let char = suff[suff.length - 1] || '';
      byChar[char] = byChar[char] || [];
      byChar[char].push(a);
    });
    return byChar
  };

  const prefix = /^([0-9]+)/;

  const expand = function (key = '', val = '') {
    val = String(val);
    let m = val.match(prefix);
    if (m === null) {
      return [key, val]
    }
    let num = Number(m[1]) || 0;
    let pre = key.substring(0, num);
    let full = pre + val.replace(prefix, '');
    return [key, full]
  };

  const toArray$2 = function (txt) {
    const pipe = /\|/;
    return txt.split(/,/).map(str => {
      let a = str.split(pipe);
      return expand(a[0], a[1])
    })
  };

  const uncompress = function (model = {}) {
    model = Object.assign({}, model);

    // compress fwd rules
    model.rules = toArray$2(model.rules);
    model.rules = indexRules(model.rules);

    // compress reverse rules
    if (model.rev) {
      model.rev = toArray$2(model.rev);
      model.rev = indexRules(model.rev);
    }

    // compress exceptions
    model.exceptions = toArray$2(model.exceptions);
    model.exceptions = model.exceptions.reduce((h, a) => {
      h[a[0]] = a[1];
      return h
    }, {});
    return model
  };
  var uncompress$1 = uncompress;

  // console.log(expand('fixture', '6ing'))
  // console.log(toArray('heard|4'))

  const reverseObj = function (obj) {
    return Object.entries(obj).reduce((h, a) => {
      h[a[1]] = a[0];
      return h
    }, {})
  };

  const reverse = function (model) {
    let { rules, exceptions, rev } = model;
    exceptions = reverseObj(exceptions);
    return {
      reversed: !Boolean(model.reversed),//toggle this
      rules,
      exceptions,
      rev
    }
  };
  var reverse$1 = reverse;

  // generated in ./lib/models
  var packed = {
    "noun": {
      "plural": {
        "rules": "ercheur|6ses,aucheur|6ses,aneur|4ses,eilleur|6ses,oyageur|6ses,rencier|5ères,ucateur|4rices,nnateur|4rices,dacteur|4rices,réateur|4rices,venteur|4rices,oniteur|4rices,ileur|4ses,ordeur|5ses,apetier|5ères,rceleur|6ses,œur|oeurs,r|1s,ravail|4ux,sionnel|7les,incipal|6ux,mercial|6ux,otal|3ux,heval|4ux,ormal|5es,déal|3ux,ittoral|6ux,arginal|7es,cal|2ux,mal|2ux,pital|4ux,étal|3ux,éral|3ux,nal|2ux,l|1s,tudiant|7es,tituant|7es,rvenant|7es,current|7es,sentant|7es,icipant|7es,lient|5es,lescent|7es,andidat|7es,résent|6e,etit|4es,rigeant|7es,mbulant|7es,prenant|7es,inquant|7es,stulant|7es,onjoint|7es,evenant|7es,rvivant|7es,ignant|6es,t|1s,rindien|7nes,ncien|5nes,itoyen|6nes,oréen|5nes,éricain|7es,ardien|6nes,esbien|6nes,édian|5es,tralien|7nes,fghan|5es,ugustin|7es,n|1s,ribu|4s,œu|oeux,ajou|4s,ertu|4s,issu|4s,lu|2s,étenu|5es,aribou|6s,outou|5s,neu|3s,ccru|4s,meu|3s,abou|4s,inou|4s,ïnou|4s,mprévu|6s,leu|3s,ndou|4s,çu|2s,écu|3s,rou|3s,enu|3s,du|2s,u|1x,élégué|6es,mployé|6es,îné|3es,ccusé|5es,ostitué|7es,iplômé|6es,ussigné|7es,référé|6es,é|1s,œurs|oeurs,is|2es,pprenti|7es,i|1s,œud|oeuds,d|1s,ketch|5es,h|1s,aptif|4ves,œuf|oeufs,f|1s,anœuvre|2oeuvres,e|1s,terview|7s,ub|2s,eux|2ses,y|1s,k|1s,g|1s,p|1s,m|1s,a|1s,o|1s,c|1s",
        "exceptions": "un|2es,œil|yeux,consommateur|9rices,producteur|7rices,agriculteur|8rices,résident|8es,demandeur|8ses,distributeur|9rices,immigrant|9es,utilisateur|8rices,administrateur|11rices,répondant|9es,match|5es,joueur|5ses,œuvre|oeuvre,lauréat|7es,praticien|9nes,interlocuteur|10rices,réalisateur|8rices,migrant|7es,garant|6es,tisseur|6ses,œillet|oeillets,œilleton|oeilletons,pondeur|6ses,œstrogène|oestrogènes,cou|3s,rival|4ux,informateur|8rices,revendicateur|10rices,amérindien|10nes,citoyen|7nes,adolescent|10es,mœurs|1oeurs,éducateur|6rices,gardien|7nes,coordonnateur|10rices,australien|10nes,créateur|5rices,papetier|6ères,augustin|8es",
        "rev": "ravaux|4il,ncipaux|5l,oeux|œu,erciaux|5l,déaux|3l,caux|2l,maux|2l,vaux|2l,raux|2l,taux|2l,naux|2l,ux|1,diantes|5,nnelles|4,ltrices|2eur,identes|5,rrentes|5,ntantes|5,ipantes|5,lientes|5,léguées|5,ployées|5,didates|5,réennes|4,aneuses|4r,ndantes|5,etites|4,geantes|5,lleuses|4r,ageuses|4r,ncières|3er,renties|5,înées|3,oueuses|4r,icaines|5,oeuds|œud,uréates|5,étenues|5,jointes|5,biennes|4,ccusées|5,tituées|5,plômées|5,ormales|5,édianes|5,aptives|4f,onaises|5,oeuvres|œuvre,fghanes|5,signées|5,ntrices|2eur,itrices|2eur,ileuses|4r,ivantes|5,ineuses|4x,sseuses|4r,ginales|5,gieuses|4x,éférées|5,uvaises|5,eleuses|4r,écoises|5,cheuses|4r,uantes|4,ciennes|4,ctrices|2eur,utrices|2eur,tches|3,ulantes|5,oeufs|œuf,deuses|3r,rantes|4,oeurs|œur,nantes|4,s|,résente|6"
      }
    },
    "adjective": {
      "female": {
        "rules": "ndalou|6se,eau|1lle,igu|3ë,u|1e,énin|3gne,ouffon|6ne,aysan|5ne,olisson|7ne,axon|4ne,ignon|5ne,illon|5ne,chon|4ne,ron|3ne,ton|3ne,en|2ne,n|1e,êta|3sse,ympa|4,oulot|5te,ésuet|3ète,âlot|4te,eplet|3ète,ieillot|7te,complet|5ète,quiet|3ète,cret|2ète,et|2te,t|1e,ref|1ève,f|ve,amp|3,hic|3,rec|3que,aïc|2que,ublic|4que,urc|2que,anc|3he,oi|2te,avori|5te,i|1e,û|ue,aux|2sse,ux|1se,rais|2îche,ros|3se,as|2se,s|1e,entil|5le,eil|3le,el|2le,l|1e,nouï|4e,agyar|5e,artyr|5e,nior|4,ûr|2e,ir|2e,ur|2e,er|ère,igolo|5te,o|1,m|1,aître|5sse,e|1,long|4ue,d|1e,é|1e",
        "exceptions": "bon|3ne,con|3ne,doux|3ce,fou|2lle,malin|4gne,sec|1èche,sot|3te,apte|4,bas|3se,beau|2lle,coi|3te,continue|8,digne|5,dû|1ue,fonde|5,jaloux|5se,raide|5,rare|4,sale|4,vide|4",
        "rev": "bsurde|6,dulte|5,dalouse|5,thée|4,veugle|6,êtasse|3,izarre|6,rève|1ef,ronze|5,hauve|5,houette|7,lasse|5,ommande|7,omplexe|7,oupe|4,mocrate|7,sparate|7,ouce|2x,rôle|4,goïste|6,lite|4,nceinte|7,mplaire|7,ausse|2x,avorite|5,ertile|6,olle|1u,ragile|6,raîche|2is,rivole|6,rasse|3,recque|3,rosse|3,âte|3,onnête|6,ostile|6,ybride|6,tiative|7,aune|4,eune|4,iciaire|7,uste|4,uvénile|7,aïque|2c,isse|4,ucide|5,odeste|6,essaire|7,ouvelle|4au,âle|3,atriote|7,ropre|5,rospère|7,ublique|4c,ucelle|3au,igolote|5,ose|3,èche|ec,évère|5,incère|6,lendide|7,térile|6,endre|5,angelle|4au,nquille|7,urque|2c,ulgaire|7,igne|1n,anche|3,be|2,cile|4,aste|4,ade|3,èle|3,rigide|6,mide|4,mature|6,utile|5,vre|3,aigre|5,îtresse|4,cule|4,longue|4,maire|5,bre|3,bile|4,ense|4,gue|3,daire|5,pide|4,lide|4,ple|3,raire|5,tre|3,rne|3,toire|5,naire|5,ulaire|6,ce|2,ge|2,he|2,iste|4,ète|et,me|2,taire|5,euse|2x,tte|1,ère|er,ble|3,que|3,lle|1,nne|1,ve|f,e|,amp|3,hic|3,ympa|4,m|1,nior|4,o|1,iguë|3"
      },
      "plural": {
        "rules": "ancal|5s,orfal|5s,naval|5s,ol|2s,ul|2s,il|2s,el|2s,al|1ux,amp|3s,û|us,nouï|4s,a|1s,m|1s,long|4s,eau|3x,u|1s,o|1s,c|1s,s|1,ux|2,r|1s,d|1s,i|1s,f|1s,n|1s,e|1s,t|1s,é|1s",
        "exceptions": "fatal|5s,natal|5s,bas|3,dû|1us,faux|4,frais|5,gris|4,précis|6",
        "rev": "ompris|6,onfus|5,xquis|5,ras|3,ros|3,nsoumis|7,s|,oux|3,eaux|3,eux|3,aux|1l"
      },
      "femalePlural": {
        "rules": "ndalou|6ses,eau|1lles,igu|3ës,u|1es,énin|3gnes,ouffon|6nes,aysan|5nes,olisson|7nes,axon|4nes,ignon|5nes,illon|5nes,chon|4nes,ron|3nes,ton|3nes,en|2nes,n|1es,êta|3sses,ympa|4s,oulot|5tes,ésuet|3ètes,âlot|4tes,eplet|3ètes,ieillot|7tes,complet|5ètes,quiet|3ètes,cret|2ètes,et|2tes,t|1es,ref|1èves,f|ves,amp|3s,hic|3s,rec|3ques,aïc|2ques,ublic|4ques,urc|2ques,anc|3hes,oi|2tes,avori|5tes,i|1es,û|ues,aux|2sses,ux|1ses,rais|2îches,ros|3ses,as|2ses,s|1es,entil|5les,eil|3les,el|2les,l|1es,nouï|4es,agyar|5es,artyr|5es,nior|4s,ûr|2es,ir|2es,ur|2es,er|ères,igolo|5tes,o|1s,m|1s,aître|5sses,e|1s,long|4ues,d|1es,é|1es",
        "exceptions": "bon|3nes,con|3nes,doux|3ces,fou|2lles,malin|4gnes,sec|1èches,sot|3tes,andalou|7ses,apte|4s,bas|3ses,beau|2lles,coi|3tes,continue|8s,digne|5s,dû|1ues,fonde|5s,jaloux|5ses,raide|5s,rare|4s,sale|4s,vide|4s",
        "rev": "bsurdes|6,dultes|5,thées|4,veugles|6,êtasses|3,izarres|6,rèves|1ef,ronzes|5,amps|3,hauves|5,hics|3,ouettes|6,lasses|5,mmandes|6,mplexes|6,oupes|4,ocrates|6,parates|6,ouces|2x,rôles|4,goïstes|6,lites|4,ceintes|6,plaires|6,ausses|2x,vorites|4,ertiles|6,olles|1u,ragiles|6,raîches|2is,rivoles|6,rasses|3,recques|3,rosses|3,âtes|3,onnêtes|6,ostiles|6,ybrides|6,iatives|6,aunes|4,eunes|4,ciaires|6,ustes|4,véniles|6,aïques|2c,isses|4,ucides|5,odestes|6,ssaires|6,uvelles|3au,âles|3,triotes|6,ropres|5,ospères|6,bliques|3c,ucelles|3au,golotes|4,oses|3,èches|ec,évères|5,incères|6,endides|6,tériles|6,ympas|4,endres|5,ngelles|3au,quilles|6,urques|2c,lgaires|6,ignes|1n,anches|3,bes|2,ciles|4,astes|4,ades|3,ms|1,èles|3,rigides|6,mides|4,matures|6,utiles|5,vres|3,niors|4,aigres|5,tresses|3,cules|4,longues|4,maires|5,bres|3,biles|4,enses|4,gues|3,daires|5,pides|4,lides|4,ples|3,raires|5,os|1,tres|3,rnes|3,iguës|3,toires|5,naires|5,ulaires|6,ces|2,ges|2,hes|2,istes|4,ètes|et,mes|2,taires|5,euses|2x,ttes|1,ères|er,bles|3,ques|3,lles|1,nnes|1,ves|f,es|"
      }
    },
    "futureTense": {
      "je": {
        "rules": "cheter|2èterai,eser|èserai,evrer|èvrerai,ppuyer|3ierai,ueillir|5erai,uérir|1errai,ssener|2ènerai,epartir|épartirai,ureter|2èterai,aleter|2èterai,arteler|3èlerai,odeler|2èlerai,precier|2écierai,ssieger|3égerai,reer|1éerai,rreter|2êterai,flechir|2échirai,cquerir|5rai,ecer|ècerai,mouvoir|4rai,avoir|1urai,mener|1ènerai,leter|3terai,envoyer|3errai,vouloir|3drai,choir|2errai,faillir|2udrai,valoir|2udrai,evoir|2rai,ever|èverai,ourir|3rai,eler|2lerai,enir|iendrai,oyer|1ierai,r|1ai,ariâtre|5trai,araitre|3îtrai,faire|1erai,re|1ai",
        "exceptions": "geler|1èlerai,aller|irai,jeter|3terai,montrer|4erai,pouvoir|3rrai,voir|1errai,être|serai,peler|1èlerai,revoir|3errai,circonvenir|7iendrai,convenir|4iendrai,cueillir|6erai,quérir|2errai,venir|1iendrai,frire|4ai,boire|4ai,dire|3ai,lire|3ai,luire|4ai,rire|3ai,uire|3ai,atteler|5lerai,bateler|5lerai,devenir|3iendrai,disconvenir|7iendrai,parvenir|4iendrai,pelleter|6terai,renouveler|8lerai,repartir|1épartirai,retenir|3iendrai,revenir|3iendrai,voleter|5terai,ficeler|5lerai,harceler|6lerai,interdire|8ai,intervenir|6iendrai,maintenir|5iendrai,nuire|4ai,niveler|5lerai,obtenir|3iendrai,appeler|5lerai,rappeler|6lerai,acquerir|6rai,cuire|4ai,tenir|1iendrai",
        "rev": "èserai|eser,èvrerai|evrer,puierai|2yer,iâttrai|3re,oncirai|5e,audirai|5e,roirai|4e,everrai|2oir,truirai|5e,écierai|ecier,iégerai|1eger,réerai|1eer,rêterai|1eter,échirai|echir,raîtrai|2itre,ourirai|5e,ècerai|ecer,nverrai|2oyer,aurai|1voir,clorai|4e,firai|3e,aincrai|5e,ferai|1aire,voudrai|3loir,cherrai|2oir,faudrai|2illir,èterai|eter,vaudrai|2loir,airai|3e,ivrai|3e,èverai|ever,ènerai|ener,duirai|4e,omprai|4e,èlerai|eler,clurai|4e,crirai|4e,ourrai|3ir,vrai|1oir,oierai|1yer,trai|2e,drai|2e,rai|1"
      },
      "tu": {
        "rules": "cheter|2èteras,eser|èseras,evrer|èvreras,ppuyer|3ieras,ueillir|5eras,uérir|1erras,ssener|2èneras,epartir|épartiras,ureter|2èteras,aleter|2èteras,arteler|3èleras,odeler|2èleras,precier|2écieras,ssieger|3égeras,reer|1éeras,rreter|2êteras,flechir|2échiras,cquerir|5ras,ecer|èceras,mouvoir|4ras,avoir|1uras,mener|1èneras,leter|3teras,envoyer|3erras,vouloir|3dras,choir|2erras,faillir|2udras,valoir|2udras,evoir|2ras,ever|èveras,ourir|3ras,eler|2leras,enir|iendras,oyer|1ieras,r|1as,ariâtre|5tras,araitre|3îtras,faire|1eras,re|1as",
        "exceptions": "geler|1èleras,aller|iras,jeter|3teras,montrer|4eras,pouvoir|3rras,voir|1erras,être|seras,peler|1èleras,revoir|3erras,circonvenir|7iendras,convenir|4iendras,cueillir|6eras,quérir|2erras,venir|1iendras,frire|4as,boire|4as,dire|3as,lire|3as,luire|4as,rire|3as,uire|3as,atteler|5leras,bateler|5leras,devenir|3iendras,disconvenir|7iendras,parvenir|4iendras,pelleter|6teras,renouveler|8leras,repartir|1épartiras,retenir|3iendras,revenir|3iendras,voleter|5teras,ficeler|5leras,harceler|6leras,interdire|8as,intervenir|6iendras,maintenir|5iendras,nuire|4as,niveler|5leras,obtenir|3iendras,appeler|5leras,rappeler|6leras,acquerir|6ras,cuire|4as,tenir|1iendras",
        "rev": "èseras|eser,èvreras|evrer,puieras|2yer,iâttras|3re,onciras|5e,audiras|5e,roiras|4e,everras|2oir,truiras|5e,écieras|ecier,iégeras|1eger,réeras|1eer,rêteras|1eter,échiras|echir,raîtras|2itre,ouriras|5e,èceras|ecer,nverras|2oyer,auras|1voir,cloras|4e,firas|3e,aincras|5e,feras|1aire,voudras|3loir,cherras|2oir,faudras|2illir,èteras|eter,vaudras|2loir,airas|3e,ivras|3e,èveras|ever,èneras|ener,duiras|4e,ompras|4e,èleras|eler,cluras|4e,criras|4e,ourras|3ir,vras|1oir,oieras|1yer,tras|2e,dras|2e,ras|1"
      },
      "il": {
        "rules": "cheter|2ètera,eser|èsera,evrer|èvrera,ppuyer|3iera,ueillir|5era,uérir|1erra,ssener|2ènera,epartir|épartira,ureter|2ètera,aleter|2ètera,arteler|3èlera,odeler|2èlera,precier|2éciera,ssieger|3égera,reer|1éera,rreter|2êtera,flechir|2échira,cquerir|5ra,ecer|ècera,mouvoir|4ra,avoir|1ura,mener|1ènera,leter|3tera,envoyer|3erra,vouloir|3dra,choir|2erra,faillir|2udra,valoir|2udra,evoir|2ra,ever|èvera,ourir|3ra,eler|2lera,enir|iendra,oyer|1iera,r|1a,ariâtre|5tra,araitre|3îtra,faire|1era,re|1a",
        "exceptions": "geler|1èlera,aller|ira,jeter|3tera,montrer|4era,pouvoir|3rra,voir|1erra,être|sera,peler|1èlera,revoir|3erra,quérir|2erra,frire|4a,boire|4a,dire|3a,lire|3a,luire|4a,rire|3a,uire|3a,repartir|1épartira,nuire|4a,appeler|5lera,rappeler|6lera,cuire|4a",
        "rev": "èsera|eser,èvrera|evrer,ppuiera|3yer,eillera|4ir,riâttra|4re,concira|6e,audira|5e,roira|4e,everra|2oir,struira|6e,terdira|6e,réciera|1ecier,siégera|2eger,réera|1eer,rrêtera|2eter,léchira|1echir,cquerra|5ir,araîtra|3itre,ourira|5e,ècera|ecer,aura|1voir,clora|4e,fira|3e,tellera|3er,fera|1aire,lettera|3er,vellera|3er,enverra|3oyer,voudra|3loir,cellera|3er,vaincra|6e,cherra|2oir,faudra|2illir,ètera|eter,vaudra|2loir,aira|3e,ivra|3e,èvera|ever,ènera|ener,duira|4e,ompra|4e,èlera|eler,clura|4e,tiendra|1enir,crira|4e,ourra|3ir,vra|1oir,viendra|1enir,oiera|1yer,tra|2e,dra|2e,ra|1"
      },
      "nous": {
        "rules": "cheter|2èterons,eser|èserons,evrer|èvrerons,ppuyer|3ierons,ueillir|5erons,uérir|1errons,ssener|2ènerons,epartir|épartirons,ureter|2èterons,aleter|2èterons,arteler|3èlerons,odeler|2èlerons,precier|2écierons,ssieger|3égerons,reer|1éerons,rreter|2êterons,flechir|2échirons,cquerir|5rons,ecer|ècerons,mouvoir|4rons,avoir|1urons,mener|1ènerons,leter|3terons,envoyer|3errons,vouloir|3drons,choir|2errons,valoir|2udrons,evoir|2rons,ever|èverons,ourir|3rons,eler|2lerons,enir|iendrons,oyer|1ierons,r|1ons,ariâtre|5trons,araitre|3îtrons,faire|1erons,re|1ons",
        "exceptions": "geler|1èlerons,aller|irons,jeter|3terons,montrer|4erons,pouvoir|3rrons,voir|1errons,être|serons,peler|1èlerons,revoir|3errons,envoyer|3errons,sevrer|1èvrerons,circonvenir|7iendrons,convenir|4iendrons,cueillir|6erons,quérir|2errons,venir|1iendrons,vouloir|3drons,circoncire|9ons,frire|4ons,boire|4ons,dire|3ons,lire|3ons,luire|4ons,rire|3ons,uire|3ons,atteler|5lerons,bateler|5lerons,devenir|3iendrons,disconvenir|7iendrons,parvenir|4iendrons,pelleter|6terons,renouveler|8lerons,renvoyer|4errons,repartir|1épartirons,retenir|3iendrons,revenir|3iendrons,revouloir|5drons,voleter|5terons,ficeler|5lerons,harceler|6lerons,interdire|8ons,intervenir|6iendrons,maintenir|5iendrons,nuire|4ons,niveler|5lerons,obtenir|3iendrons,apprecier|4écierons,assieger|4égerons,appeler|5lerons,rappeler|6lerons,réflechir|4échirons,acquerir|6rons,cuire|4ons,tenir|1iendrons,paraitre|4îtrons,sourire|6ons",
        "rev": "èserons|eser,uierons|1yer,âttrons|2re,udirons|4e,roirons|4e,ruirons|4e,réerons|1eer,êterons|eter,ècerons|ecer,aurons|1voir,clorons|4e,firons|3e,incrons|4e,ferons|1aire,herrons|1oir,èterons|eter,audrons|1loir,airons|3e,ivrons|3e,èverons|ever,ènerons|ener,duirons|4e,omprons|4e,èlerons|eler,clurons|4e,crirons|4e,ourrons|3ir,vrons|1oir,oierons|1yer,trons|2e,drons|2e,rons|1"
      },
      "vous": {
        "rules": "cheter|2èterez,eser|èserez,evrer|èvrerez,ppuyer|3ierez,ueillir|5erez,uérir|1errez,ssener|2ènerez,epartir|épartirez,ureter|2èterez,aleter|2èterez,arteler|3èlerez,odeler|2èlerez,precier|2écierez,ssieger|3égerez,reer|1éerez,rreter|2êterez,flechir|2échirez,cquerir|5rez,ecer|ècerez,mouvoir|4rez,avoir|1urez,mener|1ènerez,leter|3terez,envoyer|3errez,vouloir|3drez,choir|2errez,valoir|2udrez,evoir|2rez,ever|èverez,ourir|3rez,eler|2lerez,enir|iendrez,oyer|1ierez,r|1ez,ariâtre|5trez,araitre|3îtrez,faire|1erez,re|2z",
        "exceptions": "geler|1èlerez,aller|irez,jeter|3terez,montrer|4erez,pouvoir|3rrez,voir|1errez,être|serez,peler|1èlerez,revoir|3errez,circonvenir|7iendrez,convenir|4iendrez,cueillir|6erez,quérir|2errez,venir|1iendrez,frire|5z,boire|5z,dire|4z,lire|4z,luire|5z,rire|4z,uire|4z,atteler|5lerez,bateler|5lerez,devenir|3iendrez,disconvenir|7iendrez,parvenir|4iendrez,pelleter|6terez,renouveler|8lerez,repartir|1épartirez,retenir|3iendrez,revenir|3iendrez,voleter|5terez,ficeler|5lerez,harceler|6lerez,interdire|9z,intervenir|6iendrez,maintenir|5iendrez,nuire|5z,niveler|5lerez,obtenir|3iendrez,appeler|5lerez,rappeler|6lerez,acquerir|6rez,cuire|5z,tenir|1iendrez",
        "rev": "èserez|eser,èvrerez|evrer,puierez|2yer,iâttrez|3re,oncirez|6,audirez|6,roirez|5,everrez|2oir,truirez|6,écierez|ecier,iégerez|1eger,réerez|1eer,rêterez|1eter,échirez|echir,raîtrez|2itre,ourirez|6,ècerez|ecer,nverrez|2oyer,aurez|1voir,clorez|5,firez|4,aincrez|6,ferez|1aire,voudrez|3loir,cherrez|2oir,èterez|eter,vaudrez|2loir,airez|4,ivrez|4,èverez|ever,ènerez|ener,duirez|5,omprez|5,èlerez|eler,clurez|5,crirez|5,ourrez|3ir,vrez|1oir,oierez|1yer,trez|3,drez|3,rez|1"
      },
      "ils": {
        "rules": "cheter|2èteront,eser|èseront,evrer|èvreront,ppuyer|3ieront,ueillir|5eront,uérir|1erront,ssener|2èneront,enturer|7ent,epartir|épartiront,acturer|7ent,ureter|2èteront,aleter|2èteront,arteler|3èleront,odeler|2èleront,precier|2écieront,ssieger|3égeront,reer|1éeront,rreter|2êteront,flechir|2échiront,cquerir|5ront,ecer|èceront,mouvoir|4ront,avoir|1uront,mener|1èneront,leter|3teront,envoyer|3erront,vouloir|3dront,choir|2erront,valoir|2udront,evoir|2ront,ever|èveront,iller|5ent,ourir|3ront,eler|2leront,enir|iendront,oyer|1ieront,r|1ont,ariâtre|5tront,araitre|3îtront,faire|1eront,re|1ont",
        "exceptions": "geler|1èleront,aller|iront,jeter|3teront,montrer|4eront,pouvoir|3rront,voir|1erront,être|seront,peler|1èleront,revoir|3erront,envoyer|3erront,sevrer|1èvreront,circonvenir|7iendront,convenir|4iendront,cueillir|6eront,quérir|2erront,venir|1iendront,vouloir|3dront,circoncire|9ont,frire|4ont,boire|4ont,dire|3ont,lire|3ont,luire|4ont,rire|3ont,uire|3ont,atteler|5leront,bateler|5leront,devenir|3iendront,disconvenir|7iendront,parvenir|4iendront,pelleter|6teront,renouveler|8leront,renvoyer|4erront,repartir|1épartiront,retenir|3iendront,revenir|3iendront,revouloir|5dront,voleter|5teront,ficeler|5leront,harceler|6leront,interdire|8ont,intervenir|6iendront,maintenir|5iendront,nuire|4ont,niveler|5leront,obtenir|3iendront,apprecier|4écieront,assieger|4égeront,appeler|5leront,rappeler|6leront,réflechir|4échiront,acquerir|6ront,cuire|4ont,tenir|1iendront,paraitre|4îtront,sourire|6ont",
        "rev": "èseront|eser,uieront|1yer,âttront|2re,udiront|4e,roiront|4e,ruiront|4e,réeront|1eer,êteront|eter,èceront|ecer,auront|1voir,cloront|4e,firont|3e,incront|4e,feront|1aire,herront|1oir,èteront|eter,audront|1loir,airont|3e,ivront|3e,èveront|ever,èneront|ener,duiront|4e,ompront|4e,èleront|eler,cluront|4e,criront|4e,ourront|3ir,vront|1oir,erent|2,oieront|1yer,tront|2e,dront|2e,ront|1"
      }
    },
    "imperfect": {
      "je": {
        "rules": "ésir|isais,révoir|4yais,epentir|5ais,urseoir|3oyais,ssoir|3yais,aïr|2ssais,ourvoir|5yais,uérir|3ais,epartir|épartissais,ffrir|3ais,precier|2éciais,ssieger|3égeais,reer|1éais,rreter|2êtais,eresser|éressais,referer|1éférais,ucceder|3édais,nsferer|3érais,cquerir|3érais,vêtir|3ais,sentir|4ais,partir|4ais,dormir|4ais,ouvrir|4ais,illir|3ais,ourir|3ais,oir|ais,enir|2ais,ger|2ais,cer|çais,ir|1ssais,er|ais,ariâtre|5tais,mbatre|4ais,audire|4ssais,épandre|5ais,roire|2yais,outre|3ais,raire|2yais,araitre|4ssais,ourire|4ais,rdre|2ais,vaincre|4quais,soudre|2lvais,ivre|2ais,ondre|3ais,ompre|3ais,clure|3ais,prendre|4ais,crire|3vais,ttre|2ais,ître|issais,endre|3ais,indre|1gnais,ire|1sais",
        "exceptions": "mentir|4ais,ressortir|7ais,sortir|4ais,fuir|2yais,servir|4ais,voir|2yais,être|étais,iendre|2gnais,boire|1uvais,coudre|3sais,moudre|3lais,rire|2ais,desservir|7ais,resservir|7ais,revoir|4yais,asservir|7ssais,avoir|2ais,gésir|1isais,pouvoir|4ais,devoir|3ais,pourvoir|6yais,quérir|4ais,savoir|3ais,valoir|3ais,croître|3issais,maudire|5ssais,paître|2issais,recroître|5issais,renaître|4issais,repaître|4issais,aindre|2gnais,connaître|5issais,croire|3yais,accroître|5issais,foutre|4ais,lire|2sais,naître|2issais,cloître|3issais,braire|3yais,abolir|5ssais,accomplir|8ssais,assouplir|8ssais,assouvir|7ssais,astreindre|6gnais,atteindre|5gnais,embellir|7ssais,emplir|5ssais,empreindre|6gnais,peindre|3gnais,plaindre|4gnais,polir|4ssais,repartir|1épartissais,repeindre|5gnais,ressentir|7ais,restreindre|7gnais,faiblir|6ssais,feindre|3gnais,geindre|3gnais,gravir|5ssais,mollir|5ssais,mordre|4ais,morfondre|7ais,interesser|3éressais,établir|6ssais,remplir|6ssais,acquerir|4érais,craindre|4gnais,sentir|4ais,éteindre|4gnais,paraitre|5ssais",
        "rev": "évalais|4oir,évoyais|3ir,pentais|4ir,rsoyais|2eoir,ssoyais|3ir,aïssais|2r,iâttais|3re,ncisais|3re,mbatais|4re,egnais|1ndre,pandais|4re,uivais|3re,pissais|2r,erdais|3re,evoyais|3ir,missais|2r,ffrais|3ir,réciais|1ecier,iégeais|1eger,réais|1eer,rrêtais|2eter,éférais|eferer,ccédais|2eder,sférais|2erer,bissais|2r,ouriais|4re,sortais|4ir,cevais|3oir,mouvais|4oir,vêtais|3ir,fisais|2re,inquais|2cre,vivais|3re,voulais|4oir,disais|2re,uissais|2r,battais|4re,pondais|4re,partais|4ir,dormais|4ir,solvais|2udre,hissais|2r,ompais|3re,cluais|3re,aisais|2re,oignais|2ndre,gissais|2r,prenais|4dre,tenais|3ir,crivais|3re,ouvrais|4ir,illais|3ir,ourais|3ir,mettais|4re,cissais|2r,sissais|2r,dissais|2r,venais|3ir,uisais|2re,rissais|2r,tissais|2r,endais|3re,nissais|2r,geais|2r,çais|cer,ais|er"
      },
      "tu": {
        "rules": "ésir|isais,révoir|4yais,epentir|5ais,urseoir|3oyais,ssoir|3yais,aïr|2ssais,ourvoir|5yais,uérir|3ais,epartir|épartissais,ffrir|3ais,precier|2éciais,ssieger|3égeais,reer|1éais,rreter|2êtais,eresser|éressais,referer|1éférais,ucceder|3édais,nsferer|3érais,cquerir|3érais,vêtir|3ais,sentir|4ais,partir|4ais,dormir|4ais,ouvrir|4ais,illir|3ais,ourir|3ais,oir|ais,enir|2ais,ger|2ais,cer|çais,ir|1ssais,er|ais,ariâtre|5tais,mbatre|4ais,audire|4ssais,épandre|5ais,roire|2yais,outre|3ais,raire|2yais,araitre|4ssais,ourire|4ais,rdre|2ais,vaincre|4quais,soudre|2lvais,ivre|2ais,ondre|3ais,ompre|3ais,clure|3ais,prendre|4ais,crire|3vais,ttre|2ais,ître|issais,endre|3ais,indre|1gnais,ire|1sais",
        "exceptions": "mentir|4ais,ressortir|7ais,sortir|4ais,fuir|2yais,servir|4ais,voir|2yais,être|étais,iendre|2gnais,boire|1uvais,coudre|3sais,moudre|3lais,rire|2ais,desservir|7ais,resservir|7ais,revoir|4yais,asservir|7ssais,avoir|2ais,gésir|1isais,pouvoir|4ais,devoir|3ais,pourvoir|6yais,quérir|4ais,savoir|3ais,valoir|3ais,croître|3issais,maudire|5ssais,paître|2issais,recroître|5issais,renaître|4issais,repaître|4issais,aindre|2gnais,connaître|5issais,croire|3yais,accroître|5issais,foutre|4ais,lire|2sais,naître|2issais,cloître|3issais,braire|3yais,abolir|5ssais,accomplir|8ssais,assouplir|8ssais,assouvir|7ssais,astreindre|6gnais,atteindre|5gnais,embellir|7ssais,emplir|5ssais,empreindre|6gnais,peindre|3gnais,plaindre|4gnais,polir|4ssais,repartir|1épartissais,repeindre|5gnais,ressentir|7ais,restreindre|7gnais,faiblir|6ssais,feindre|3gnais,geindre|3gnais,gravir|5ssais,mollir|5ssais,mordre|4ais,morfondre|7ais,interesser|3éressais,établir|6ssais,remplir|6ssais,acquerir|4érais,craindre|4gnais,sentir|4ais,éteindre|4gnais,paraitre|5ssais",
        "rev": "évalais|4oir,évoyais|3ir,pentais|4ir,rsoyais|2eoir,ssoyais|3ir,aïssais|2r,iâttais|3re,ncisais|3re,mbatais|4re,egnais|1ndre,pandais|4re,uivais|3re,pissais|2r,erdais|3re,evoyais|3ir,missais|2r,ffrais|3ir,réciais|1ecier,iégeais|1eger,réais|1eer,rrêtais|2eter,éférais|eferer,ccédais|2eder,sférais|2erer,bissais|2r,ouriais|4re,sortais|4ir,cevais|3oir,mouvais|4oir,vêtais|3ir,fisais|2re,inquais|2cre,vivais|3re,voulais|4oir,disais|2re,uissais|2r,battais|4re,pondais|4re,partais|4ir,dormais|4ir,solvais|2udre,hissais|2r,ompais|3re,cluais|3re,aisais|2re,oignais|2ndre,gissais|2r,prenais|4dre,tenais|3ir,crivais|3re,ouvrais|4ir,illais|3ir,ourais|3ir,mettais|4re,cissais|2r,sissais|2r,dissais|2r,venais|3ir,uisais|2re,rissais|2r,tissais|2r,endais|3re,nissais|2r,geais|2r,çais|cer,ais|er"
      },
      "il": {
        "rules": "ésir|isait,révoir|4yait,epentir|5ait,urseoir|3oyait,ssoir|3yait,aïr|2ssait,ourvoir|5yait,uérir|3ait,epartir|épartissait,ffrir|3ait,precier|2éciait,ssieger|3égeait,reer|1éait,rreter|2êtait,eresser|éressait,referer|1éférait,ucceder|3édait,nsferer|3érait,cquerir|3érait,vêtir|3ait,sentir|4ait,dormir|4ait,ouvrir|4ait,illir|3ait,ourir|3ait,oir|ait,enir|2ait,ger|2ait,cer|çait,ir|1ssait,er|ait,ariâtre|5tait,mbatre|4ait,audire|4ssait,épandre|5ait,roire|2yait,outre|3ait,raire|2yait,araitre|4ssait,ourire|4ait,rdre|2ait,vaincre|4quait,soudre|2lvait,ivre|2ait,ondre|3ait,ompre|3ait,clure|3ait,prendre|4ait,crire|3vait,ttre|2ait,ître|issait,endre|3ait,indre|1gnait,ire|1sait",
        "exceptions": "mentir|4ait,partir|4ait,ressortir|7ait,sortir|4ait,fuir|2yait,servir|4ait,voir|2yait,être|était,iendre|2gnait,boire|1uvait,coudre|3sait,moudre|3lait,rire|2ait,desservir|7ait,resservir|7ait,revoir|4yait,asservir|7ssait,avoir|2ait,gésir|1isait,pouvoir|4ait,devoir|3ait,pourvoir|6yait,quérir|4ait,savoir|3ait,valoir|3ait,croître|3issait,maudire|5ssait,paître|2issait,recroître|5issait,renaître|4issait,repaître|4issait,aindre|2gnait,connaître|5issait,croire|3yait,accroître|5issait,foutre|4ait,lire|2sait,naître|2issait,cloître|3issait,braire|3yait,abolir|5ssait,accomplir|8ssait,assouplir|8ssait,assouvir|7ssait,astreindre|6gnait,atteindre|5gnait,embellir|7ssait,emplir|5ssait,empreindre|6gnait,peindre|3gnait,plaindre|4gnait,polir|4ssait,repartir|1épartissait,repeindre|5gnait,ressentir|7ait,restreindre|7gnait,faiblir|6ssait,feindre|3gnait,geindre|3gnait,gravir|5ssait,mollir|5ssait,mordre|4ait,morfondre|7ait,interesser|3éressait,établir|6ssait,remplir|6ssait,acquerir|4érait,craindre|4gnait,sentir|4ait,éteindre|4gnait,paraitre|5ssait",
        "rev": "artait|3ir,évalait|4oir,évoyait|3ir,pentait|4ir,rsoyait|2eoir,ssoyait|3ir,aïssait|2r,iâttait|3re,ncisait|3re,mbatait|4re,egnait|1ndre,pandait|4re,uivait|3re,pissait|2r,erdait|3re,evoyait|3ir,missait|2r,ffrait|3ir,réciait|1ecier,iégeait|1eger,réait|1eer,rrêtait|2eter,éférait|eferer,ccédait|2eder,sférait|2erer,bissait|2r,ouriait|4re,sortait|4ir,cevait|3oir,mouvait|4oir,vêtait|3ir,fisait|2re,inquait|2cre,vivait|3re,voulait|4oir,disait|2re,uissait|2r,battait|4re,pondait|4re,dormait|4ir,solvait|2udre,hissait|2r,ompait|3re,cluait|3re,aisait|2re,oignait|2ndre,gissait|2r,prenait|4dre,tenait|3ir,crivait|3re,ouvrait|4ir,illait|3ir,ourait|3ir,mettait|4re,cissait|2r,sissait|2r,dissait|2r,venait|3ir,uisait|2re,rissait|2r,endait|3re,tissait|2r,nissait|2r,geait|2r,çait|cer,ait|er"
      },
      "nous": {
        "rules": "ésir|isions,révoir|4yions,epentir|6ons,urseoir|3oyions,ssoir|3yions,aïr|2ssions,ourvoir|5yions,uérir|4ons,epartir|épartissions,ffrir|4ons,precier|2éciions,ssieger|3égions,reer|1éions,rreter|2êtions,eresser|éressions,referer|1éférions,ucceder|3édions,nsferer|3érions,cquerir|3érions,vêtir|4ons,sentir|5ons,partir|5ons,dormir|5ons,ouvrir|5ons,illir|4ons,ourir|4ons,oir|ions,enir|3ons,ir|1ssions,er|ions,ariâtre|5tions,mbatre|4ions,audire|4ssions,épandre|5ions,roire|2yions,outre|3ions,raire|2yions,araitre|4ssions,ourire|4ions,rdre|2ions,vaincre|4quions,soudre|2lvions,ivre|2ions,ondre|3ions,ompre|3ions,clure|3ions,prendre|4ions,crire|3vions,ttre|2ions,ître|issions,endre|3ions,indre|1gnions,ire|1sions",
        "exceptions": "mentir|5ons,ressortir|8ons,sortir|5ons,fuir|2yions,servir|5ons,voir|2yions,être|étions,iendre|2gnions,boire|1uvions,coudre|3sions,moudre|3lions,rire|2ions,desservir|8ons,resservir|8ons,revoir|4yions,choisir|6ssions,asservir|7ssions,avoir|2ions,bénir|4ssions,gésir|1isions,mouvoir|4ions,pouvoir|4ions,prévaloir|6ions,prévoir|5yions,repentir|7ons,surseoir|4oyions,assoir|4yions,devoir|3ions,endormir|7ons,dormir|5ons,promouvoir|7ions,pourvoir|6yions,quérir|5ons,savoir|3ions,valoir|3ions,finir|4ssions,croître|3issions,maudire|5ssions,oindre|2gnions,paître|2issions,recroître|5issions,renaître|4issions,repaître|4issions,aindre|2gnions,battre|4ions,répandre|6ions,connaître|5issions,crire|3vions,croire|3yions,accroître|5issions,foutre|4ions,lire|2sions,mettre|4ions,naître|2issions,joindre|3gnions,cloître|3issions,braire|3yions,vaincre|4quions,abolir|5ssions,aboutir|6ssions,abrutir|6ssions,accomplir|8ssions,approfondir|10ssions,arrondir|7ssions,assagir|6ssions,assainir|7ssions,assombrir|8ssions,assortir|7ssions,assoupir|7ssions,assouplir|8ssions,assouvir|7ssions,astreindre|6gnions,atteindre|5gnions,attendrir|8ssions,atterrir|7ssions,avertir|6ssions,bannir|5ssions,barrir|5ssions,blanchir|7ssions,dessaisir|8ssions,disjoindre|6gnions,divertir|7ssions,durcir|5ssions,embellir|7ssions,emplir|5ssions,empreindre|6gnions,omettre|5ions,ourdir|5ssions,peindre|3gnions,permettre|7ions,plaindre|4gnions,polir|4ssions,pondre|4ions,rendormir|8ons,repartir|1épartissions,repeindre|5gnions,resplendir|9ssions,ressaisir|8ssions,ressentir|8ons,restreindre|7gnions,retentir|7ssions,retranscrire|10vions,retransmettre|11ions,rougir|5ssions,vagir|4ssions,verdir|5ssions,vernir|5ssions,vomir|4ssions,faiblir|6ssions,farcir|5ssions,feindre|3gnions,fleurir|6ssions,fournir|6ssions,franchir|7ssions,garantir|7ssions,garnir|5ssions,geindre|3gnions,grandir|6ssions,gravir|5ssions,grossir|6ssions,hennir|5ssions,honnir|5ssions,inscrire|6vions,interagir|8ssions,intervertir|10ssions,investir|7ssions,jaunir|5ssions,jouir|4ssions,languir|6ssions,maigrir|6ssions,meurtrir|7ssions,mincir|5ssions,moisir|5ssions,mollir|5ssions,mordre|4ions,morfondre|7ions,munir|4ssions,noircir|6ssions,nourrir|6ssions,obscurcir|8ssions,interesser|3éressions,preferer|2éférions,succeder|4édions,transferer|6érions,éclaircir|8ssions,établir|6ssions,rebondir|7ssions,réfléchir|8ssions,remplir|6ssions,réunir|5ssions,réussir|6ssions,saisir|5ssions,subir|4ssions,acquerir|4érions,craindre|4gnions,écrire|4vions,sentir|5ons,convaincre|7quions,éteindre|4gnions,paraitre|5ssions,rabattre|6ions,rejoindre|5gnions,remettre|6ions,répondre|6ions",
        "rev": "ïssions|1r,âttions|2re,cisions|2re,bations|3re,egnions|1ndre,uivions|3re,erdions|3re,ffrions|4r,éciions|ecier,iégions|1eger,réions|1eer,rêtions|1eter,uriions|3re,artions|4r,cevions|3oir,oulions|3oir,vêtions|4r,fisions|2re,vivions|3re,disions|2re,olvions|1udre,ompions|3re,uvrions|4r,cluions|3re,aisions|2re,renions|3dre,tenions|4r,illions|4r,ourions|4r,venions|4r,uisions|2re,endions|3re,ions|er"
      },
      "vous": {
        "rules": "ésir|isiez,révoir|4yiez,epentir|6ez,urseoir|3oyiez,ssoir|3yiez,aïr|2ssiez,ourvoir|5yiez,uérir|4ez,epartir|épartissiez,ffrir|4ez,precier|2éciiez,ssieger|3égiez,reer|1éiez,rreter|2êtiez,eresser|éressiez,referer|1éfériez,ucceder|3édiez,nsferer|3ériez,cquerir|3ériez,vêtir|4ez,sentir|5ez,partir|5ez,dormir|5ez,ouvrir|5ez,illir|4ez,ourir|4ez,oir|iez,enir|3ez,ir|1ssiez,er|iez,ariâtre|5tiez,mbatre|4iez,audire|4ssiez,épandre|5iez,roire|2yiez,outre|3iez,raire|2yiez,araitre|4ssiez,ourire|4iez,rdre|2iez,vaincre|4quiez,soudre|2lviez,ivre|2iez,ondre|3iez,ompre|3iez,clure|3iez,prendre|4iez,crire|3viez,ttre|2iez,ître|issiez,endre|3iez,indre|1gniez,ire|1siez",
        "exceptions": "mentir|5ez,ressortir|8ez,sortir|5ez,fuir|2yiez,servir|5ez,voir|2yiez,être|étiez,iendre|2gniez,boire|1uviez,coudre|3siez,moudre|3liez,rire|2iez,desservir|8ez,resservir|8ez,revoir|4yiez,asservir|7ssiez,avoir|2iez,gésir|1isiez,pouvoir|4iez,devoir|3iez,pourvoir|6yiez,quérir|5ez,savoir|3iez,valoir|3iez,croître|3issiez,maudire|5ssiez,paître|2issiez,recroître|5issiez,renaître|4issiez,repaître|4issiez,aindre|2gniez,connaître|5issiez,croire|3yiez,accroître|5issiez,foutre|4iez,lire|2siez,naître|2issiez,cloître|3issiez,braire|3yiez,abolir|5ssiez,accomplir|8ssiez,assouplir|8ssiez,assouvir|7ssiez,astreindre|6gniez,atteindre|5gniez,embellir|7ssiez,emplir|5ssiez,empreindre|6gniez,peindre|3gniez,plaindre|4gniez,polir|4ssiez,repartir|1épartissiez,repeindre|5gniez,ressentir|8ez,restreindre|7gniez,faiblir|6ssiez,feindre|3gniez,geindre|3gniez,gravir|5ssiez,mollir|5ssiez,mordre|4iez,morfondre|7iez,interesser|3éressiez,établir|6ssiez,remplir|6ssiez,acquerir|4ériez,craindre|4gniez,sentir|5ez,éteindre|4gniez,paraitre|5ssiez",
        "rev": "évaliez|4oir,évoyiez|3ir,pentiez|5r,rsoyiez|2eoir,ssoyiez|3ir,aïssiez|2r,iâttiez|3re,ncisiez|3re,mbatiez|4re,egniez|1ndre,pandiez|4re,uiviez|3re,pissiez|2r,erdiez|3re,evoyiez|3ir,missiez|2r,ffriez|4r,réciiez|1ecier,siégiez|2eger,réiez|1eer,rrêtiez|2eter,éfériez|eferer,ccédiez|2eder,sfériez|2erer,bissiez|2r,ouriiez|4re,sortiez|5r,ceviez|3oir,mouviez|4oir,vêtiez|4r,fisiez|2re,inquiez|2cre,viviez|3re,vouliez|4oir,disiez|2re,uissiez|2r,battiez|4re,pondiez|4re,partiez|5r,dormiez|5r,solviez|2udre,hissiez|2r,ompiez|3re,cluiez|3re,aisiez|2re,oigniez|2ndre,gissiez|2r,preniez|4dre,teniez|4r,criviez|3re,ouvriez|5r,illiez|4r,ouriez|4r,mettiez|4re,cissiez|2r,sissiez|2r,dissiez|2r,veniez|4r,uisiez|2re,rissiez|2r,tissiez|2r,endiez|3re,nissiez|2r,iez|er"
      },
      "ils": {
        "rules": "ésir|isaient,révoir|4yaient,epentir|5aient,urseoir|3oyaient,ssoir|3yaient,aïr|2ssaient,ourvoir|5yaient,uérir|3aient,epartir|épartissaient,ffrir|3aient,precier|2éciaient,ssieger|3égeaient,reer|1éaient,rreter|2êtaient,eresser|éressaient,referer|1éféraient,ucceder|3édaient,nsferer|3éraient,cquerir|3éraient,vêtir|3aient,sentir|4aient,partir|4aient,dormir|4aient,ouvrir|4aient,illir|3aient,ourir|3aient,oir|aient,enir|2aient,ger|2aient,cer|çaient,ir|1ssaient,er|aient,ariâtre|5taient,mbatre|4aient,audire|4ssaient,épandre|5aient,roire|2yaient,outre|3aient,raire|2yaient,araitre|4ssaient,ourire|4aient,rdre|2aient,vaincre|4quaient,soudre|2lvaient,ivre|2aient,ondre|3aient,ompre|3aient,clure|3aient,prendre|4aient,crire|3vaient,ttre|2aient,ître|issaient,endre|3aient,indre|1gnaient,ire|1saient",
        "exceptions": "mentir|4aient,ressortir|7aient,sortir|4aient,fuir|2yaient,servir|4aient,voir|2yaient,être|étaient,iendre|2gnaient,boire|1uvaient,coudre|3saient,moudre|3laient,rire|2aient,desservir|7aient,resservir|7aient,revoir|4yaient,choisir|6ssaient,asservir|7ssaient,avoir|2aient,bénir|4ssaient,circonvenir|9aient,convenir|6aient,défaillir|7aient,faillir|5aient,gésir|1isaient,mourir|4aient,mouvoir|4aient,partir|4aient,pouvoir|4aient,prévaloir|6aient,prévoir|5yaient,repentir|6aient,surseoir|4oyaient,assoir|4yaient,bouillir|6aient,recevoir|5aient,courir|4aient,cueillir|6aient,devoir|3aient,endormir|6aient,dormir|4aient,haïr|3ssaient,promouvoir|7aient,ouvrir|4aient,pourvoir|6yaient,quérir|4aient,assaillir|7aient,savoir|3aient,valoir|3aient,venir|3aient,vouloir|4aient,finir|4ssaient,acariâtre|7taient,circoncire|8saient,croître|3issaient,embatre|5aient,inclure|5aient,maudire|5ssaient,oindre|2gnaient,paître|2issaient,recroître|5issaient,renaître|4issaient,repaître|4issaient,suffire|5saient,taire|3saient,aindre|2gnaient,battre|4aient,prendre|4aient,répandre|6aient,clure|3aient,confire|5saient,connaître|5issaient,crire|3vaient,croire|3yaient,accroître|5issaient,dire|2saient,faire|3saient,foutre|4aient,lire|2saient,luire|3saient,mettre|4aient,naître|2issaient,joindre|3gnaient,ompre|3aient,cloître|3issaient,plaire|4saient,braire|3yaient,suivre|4aient,uire|2saient,vaincre|4quaient,vivre|3aient,abolir|5ssaient,aboutir|6ssaient,abrutir|6ssaient,accomplir|8ssaient,accourir|6aient,approfondir|10ssaient,arrondir|7ssaient,assagir|6ssaient,assainir|7ssaient,assombrir|8ssaient,assortir|7ssaient,assoupir|7ssaient,assouplir|8ssaient,assouvir|7ssaient,astreindre|6gnaient,atteindre|5gnaient,attendre|6aient,attendrir|8ssaient,atterrir|7ssaient,avertir|6ssaient,bannir|5ssaient,barrir|5ssaient,blanchir|7ssaient,descendre|7aient,dessaisir|8ssaient,devenir|5aient,disconvenir|9aient,discourir|7aient,disjoindre|6gnaient,divertir|7ssaient,durcir|5ssaient,embellir|7ssaient,emplir|5ssaient,empreindre|6gnaient,omettre|5aient,ourdir|5ssaient,parcourir|7aient,parfaire|6saient,parvenir|6aient,peindre|3gnaient,pendre|4aient,percevoir|6aient,perdre|4aient,permettre|7aient,plaindre|4gnaient,polir|4ssaient,pondre|4aient,rendre|4aient,rendormir|7aient,repartir|1épartissaient,repeindre|5gnaient,rependre|6aient,reprendre|6aient,reproduire|8saient,resplendir|9ssaient,ressaisir|8ssaient,ressentir|7aient,restreindre|7gnaient,retenir|5aient,retentir|7ssaient,retranscrire|10vaient,retransmettre|11aient,revenir|5aient,revivre|5aient,revouloir|6aient,revendre|6aient,rompre|4aient,rouvrir|5aient,rougir|5ssaient,vagir|4ssaient,vendre|4aient,verdir|5ssaient,vernir|5ssaient,vomir|4ssaient,exclure|5aient,faiblir|6ssaient,farcir|5ssaient,feindre|3gnaient,fendre|4aient,fleurir|6ssaient,fournir|6ssaient,franchir|7ssaient,garantir|7ssaient,garnir|5ssaient,geindre|3gnaient,grandir|6ssaient,gravir|5ssaient,grossir|6ssaient,hennir|5ssaient,honnir|5ssaient,induire|5saient,inscrire|6vaient,instruire|7saient,interagir|8ssaient,interdire|7saient,interrompre|9aient,intervenir|8aient,intervertir|10ssaient,introduire|8saient,investir|7ssaient,jaunir|5ssaient,jouir|4ssaient,languir|6ssaient,maigrir|6ssaient,maintenir|7aient,meurtrir|7ssaient,mincir|5ssaient,moisir|5ssaient,mollir|5ssaient,mordre|4aient,morfondre|7aient,munir|4ssaient,nuire|3saient,noircir|6ssaient,nourrir|6ssaient,obscurcir|8ssaient,obtenir|5aient,apprecier|4éciaient,assieger|4égeaient,arreter|3êtaient,interesser|3éressaient,preferer|2éféraient,succeder|4édaient,transferer|6éraient,éclaircir|8ssaient,établir|6ssaient,rebondir|7ssaient,réfléchir|8ssaient,remplir|6ssaient,réunir|5ssaient,réussir|6ssaient,saisir|5ssaient,subir|4ssaient,acquerir|4éraient,cuire|3saient,conclure|6aient,couvrir|5aient,craindre|4gnaient,écrire|4vaient,sentir|4aient,tenir|3aient,apprendre|6aient,comprendre|7aient,convaincre|7quaient,entendre|6aient,éteindre|4gnaient,paraitre|5ssaient,rabattre|6aient,recouvrir|7aient,rejoindre|5gnaient,remettre|6aient,répondre|6aient,sourire|5aient,départir|6aient",
        "rev": "fraient|2ir,réaient|1eer,êtaient|2ir,lvaient|udre,geaient|2r,çaient|cer,aient|er"
      }
    },
    "pastParticiple": {
      "prt": {
        "rules": "éer|2,baturer|4,icher|3u,énir|3t,assir|4s,leuvoir|1u,uérir|1is,ujettir|1,rturber|1,epartir|éparti,ieillir|2,filtrer|1,illeter|,umilier|2,ortuner|2,ffrir|2ert,precier|2écié,ssieger|3égé,reer|1éé,rreter|2êté,eresser|éressé,referer|1éféré,flechir|2échi,cquerir|3is,etir|ê,ïr|1,cevoir|çu,vêtir|3u,iliser|,iliter|,ouvoir|u,seoir|1is,turer|,courir|4u,ouvrir|3ert,enir|2u,iller|,oir|u,ir|1,er|é,ariâtre|5tu,mbatre|4u,eclure|4s,uffire|4,istre|2su,épandre|5u,outre|3u,bsoudre|4t,araitre|2u,abattre|4,ourire|4,cire|2s,suivre|4i,croître|2û,aître|u,soudre|2lu,oire|u,rdre|2u,vivre|1écu,vaincre|5u,ompre|3u,clure|3,ondre|3u,prendre|2is,clore|3s,mettre|1is,endre|3u,indre|2t,ire|1t",
        "exceptions": "avoir|eu,férir|3u,issir|3u,mourir|2rt,devoir|1û,savoir|1u,bruire|4,inclure|5s,taire|1u,être|été,battre|4u,iendre|3t,coudre|3su,accroître|4u,lire|1u,luire|3,moudre|3lu,naître|1é,rire|2,familiariser|3,jaillir|2,gerer|1éré,pouvoir|1u,rassir|5s,pleuvoir|2u,quérir|2is,tistre|3su,boire|1u,croire|2u,assujettir|4,babiller|3,repartir|1éparti,utiliser|2,veiller|2,faciliter|3,feuilleter|3,habiliter|3",
        "rev": "ée|2r,ie|2illir,ourbatu|7rer,ichu|3er,allu|3oir,ariâttu|5re,mbatu|4re,epu|2aître,attu|3re,onnu|3aître,ousu|2dre,ccru|3oître,outu|3re,aqu|3iller,aru|2aitre,valu|3oir,çu|cevoir,mu|1ouvoir,vêtu|3ir,solu|2udre,vécu|1ivre,voulu|4oir,vaincu|5re,chu|2oir,ompu|3re,ou|2iller,clu|3re,vu|1oir,ru|1ir,enu|2ir,du|1re,énit|3r,ort|1urir,bsout|4dre,abat|4tre,ert|rir,nt|1dre,it|1re,rui|3re,uffi|4re,éfléchi|3echir,ouri|4re,suivi|4re,i|1r,sc|2iller,rac|3turer,er|2turber,mpor|4tuner,xf|2iltrer,am|2iliariser,um|2ilier,oss|3iliser,cquis|3erir,cis|2re,clus|3re,sis|1eoir,pris|2endre,clos|3re,mis|1ettre,asp|3iller,pprécié|3ecier,ssiégé|3eger,réé|1eer,rrêté|2eter,téressé|1eresser,référé|1eferer,é|er,ê|etir,ï|1r,crû|2oître,n|1turer,a|1iller"
      }
    },
    "presentTense": {
      "je": {
        "rules": "cheter|2ète,apiécer|3èce,eser|èse,evrer|èvre,élébrer|2èbre,brécher|2èche,égler|ègle,rotéger|3ège,théquer|2èque,ppuyer|3ie,ésir|is,uïr|is,epentir|4s,urseoir|3ois,ouillir|2s,ueillir|5e,aïr|1is,uérir|1iers,saillir|5e,ssener|2ène,ureter|2ète,aleter|2ète,arteler|3èle,odeler|2èle,ffrir|3e,rreter|2ête,nsferer|3ère,flechir|2échis,cquerir|3iers,ecer|èce,érer|ère,valoir|2ux,cevoir|çois,mouvoir|1eus,vêtir|3s,mener|1ène,sentir|3s,vouloir|1eux,céder|1ède,dormir|3s,ever|ève,leter|3te,courir|4s,ouvrir|4e,eler|2le,enir|iens,oyer|1ie,ir|1s,er|1,outre|2s,araitre|4s,vivre|2s,soudre|3s,ttre|1s,ître|is,indre|2s,re|s",
        "exceptions": "être|suis,avoir|1i,geler|1èle,aller|vais,jeter|3te,montrer|4e,mentir|3s,mourir|1eurs,partir|3s,pouvoir|1eux,ressortir|6s,sortir|3s,devoir|1ois,savoir|2is,servir|3s,croître|4s,iendre|3s,desservir|6s,peler|1èle,resservir|6s,défaillir|4us,départir|5s,faillir|2ux,gésir|1is,ouïr|1is,bouillir|3s,haïr|2is,quérir|2iers,taire|3s,boire|3s,croire|4s,dire|2s,foutre|3s,lire|2s,luire|3s,braire|4s,rire|2s,uire|2s,vivre|2s,nuire|3s,gérer|1ère,cuire|3s",
        "rev": "i|voir,apièce|3écer,èse|eser,èvre|evrer,élèbre|2ébrer,brèche|2écher,ègle|égler,rotège|3éger,othèque|3équer,ppuie|3yer,nsidère|4érer,ffre|3ir,rrête|2eter,ansfère|4erer,èce|ecer,ille|3ir,telle|3er,velle|3er,celle|3er,appelle|5er,cède|1éder,ète|eter,ève|ever,ène|ener,lette|3er,èle|eler,ouvre|4ir,oie|1yer,e|1r,eurs|ourir,epens|4tir,ursois|3eoir,cariâts|6re,rconcis|6re,roîs|3tre,nclos|4re,audis|4re,lois|2ître,evis|3vre,nstruis|6re,nterdis|6re,fléchis|2echir,cquiers|3erir,arais|4tre,ouris|4re,éfaus|3illir,lais|3re,sors|3tir,çois|cevoir,meus|1ouvoir,vêts|3ir,fais|3re,crois|3ître,pais|2ître,fis|2re,sens|3tir,vaincs|5re,pars|3tir,dors|3mir,nais|2ître,sous|3dre,sers|3vir,duis|3re,omps|3re,clus|3re,cours|4ir,cris|3re,ts|1tre,iens|enir,ins|2dre,ds|1re,is|1r,vaux|2loir,veux|1ouloir"
      },
      "tu": {
        "rules": "cheter|2ètes,apiécer|3èces,eser|èses,evrer|èvres,élébrer|2èbres,brécher|2èches,égler|ègles,rotéger|3èges,théquer|2èques,ppuyer|3ies,ésir|is,uïr|is,epentir|4s,urseoir|3ois,ouillir|2s,ueillir|5es,aïr|1is,uérir|1iers,saillir|5es,ssener|2ènes,ureter|2ètes,aleter|2ètes,arteler|3èles,odeler|2èles,ffrir|3es,rreter|2êtes,nsferer|3ères,flechir|2échis,cquerir|3iers,ecer|èces,érer|ères,valoir|2ux,cevoir|çois,mouvoir|1eus,vêtir|3s,mener|1ènes,sentir|3s,vouloir|1eux,céder|1èdes,dormir|3s,ever|èves,leter|3tes,courir|4s,ouvrir|4es,eler|2les,enir|iens,oyer|1ies,r|s,outre|2s,araitre|4s,soudre|3s,ivre|1s,ttre|1s,ître|is,indre|2s,re|s",
        "exceptions": "être|es,avoir|1s,geler|1èles,aller|vas,jeter|3tes,montrer|4es,mentir|3s,mourir|1eurs,partir|3s,pouvoir|1eux,ressortir|6s,sortir|3s,devoir|1ois,savoir|2is,servir|3s,croître|4s,iendre|3s,desservir|6s,peler|1èles,resservir|6s,défaillir|4us,départir|5s,faillir|2ux,gésir|1is,ouïr|1is,bouillir|3s,haïr|2is,quérir|2iers,taire|3s,boire|3s,croire|4s,dire|2s,foutre|3s,lire|2s,luire|3s,braire|4s,rire|2s,suivre|3s,uire|2s,vivre|2s,nuire|3s,gérer|1ères,cuire|3s",
        "rev": "apièces|3écer,èses|eser,èvres|evrer,élèbres|2ébrer,brèches|2écher,ègles|égler,rotèges|3éger,thèques|2équer,ppuies|3yer,sidères|3érer,eurs|ourir,epens|4tir,ursois|3eoir,cariâts|6re,rconcis|6re,roîs|3tre,nclos|4re,audis|4re,lois|2ître,evis|3vre,nstruis|6re,nterdis|6re,ffres|3ir,rrêtes|2eter,nsfères|3erer,fléchis|2echir,cquiers|3erir,arais|4tre,ouris|4re,éfaus|3illir,lais|3re,èces|ecer,sors|3tir,çois|cevoir,illes|3ir,meus|1ouvoir,vêts|3ir,fais|3re,crois|3ître,pais|2ître,fis|2re,telles|3er,velles|3er,sens|3tir,celles|3er,ppelles|4er,cèdes|1éder,vaincs|5re,pars|3tir,ètes|eter,dors|3mir,nais|2ître,sous|3dre,èves|ever,ènes|ener,sers|3vir,lettes|3er,duis|3re,omps|3re,èles|eler,clus|3re,cours|4ir,cris|3re,ouvres|4ir,ts|1tre,iens|enir,oies|1yer,ins|2dre,ds|1re,s|r,vaux|2loir,veux|1ouloir"
      },
      "il": {
        "rules": "cheter|2ète,apiécer|3èce,eser|èse,evrer|èvre,élébrer|2èbre,brécher|2èche,égler|ègle,rotéger|3ège,théquer|2èque,ppuyer|3ie,ésir|ît,uïr|it,epentir|5,urseoir|3oit,ouillir|2t,ueillir|5e,aïr|1it,uérir|1iert,saillir|5e,ssener|2ène,ureter|2ète,aleter|2ète,arteler|3èle,odeler|2èle,ffrir|3e,rreter|2ête,nsferer|3ère,flechir|2échit,cquerir|3iert,échoir|3et,ecer|èce,érer|ère,valoir|2ut,cevoir|çoit,vêtir|3,mener|1ène,sentir|4,vouloir|1eut,céder|1ède,faillir|2ut,ouvoir|eut,dormir|3t,ever|ève,leter|3te,courir|4t,ouvrir|4e,eler|2le,enir|ient,oyer|1ie,ir|1t,er|1,ariâtre|5,nclore|4t,outre|3,araitre|3ît,laire|2ît|plait,vaincre|5,soudre|3t,ivre|1t,ompre|3t,clure|3t,ttre|1,ître|2,indre|2t,dre|1,ire|1t",
        "exceptions": "être|est,avoir|1,geler|1èle,aller|va,jeter|3te,montrer|4e,mentir|4,mourir|1eurt,partir|4,ressortir|7,sortir|4,devoir|1oit,savoir|2it,servir|3t,iendre|3t,accroître|5it,desservir|6t,peler|1èle,resservir|6t,gésir|1ît,ouïr|1it,bouillir|3t,haïr|2it,quérir|2iert,boire|3t,croire|4t,dire|2t,foutre|4,lire|2t,luire|3t,rire|2t,suivre|3t,uire|2t,vivre|2t,nuire|3t,gérer|1ère,cuire|3t,plaire|3ît|plait",
        "rev": "apièce|3écer,èse|eser,èvre|evrer,élèbre|2ébrer,brèche|2écher,ègle|égler,rotège|3éger,othèque|3équer,ppuie|3yer,nsidère|4érer,ffre|3ir,rrête|2eter,ansfère|4erer,èce|ecer,ille|3ir,telle|3er,velle|3er,celle|3er,appelle|5er,cède|1éder,ète|eter,ève|ever,ène|ener,lette|3er,èle|eler,ouvre|4ir,oie|1yer,e|1r,eurt|ourir,art|3ir,epent|5ir,ursoit|3eoir,cariât|6re,rconcit|6re,nclot|4re,audit|4re,ccroit|4ître,evit|3vre,nstruit|6re,nterdit|6re,fléchit|2echir,cquiert|3erir,araît|3itre,ourit|4re,échet|3oir,vaut|2loir,sort|4ir,çoit|cevoir,vêt|3ir,fit|2re,sent|4ir,veut|1ouloir,bat|3tre,faut|2illir,eut|ouvoir,dort|3mir,sout|3dre,sert|3vir,duit|3re,ompt|3re,clut|3re,ait|2re,court|4ir,crit|3re,met|3tre,ît|2re,ient|enir,int|2dre,it|1r,vainc|5re,d|1re"
      },
      "nous": {
        "rules": "ésir|isons,révoir|4yons,epentir|5ons,urseoir|3oyons,ssoir|3yons,ouillir|5ons,ueillir|5ons,aïr|2ssons,ourvoir|5yons,uérir|3ons,ffrir|3ons,ssièger|3égeons,rreter|2êtons,réfèrer|3érons,nsferer|3érons,flechir|2échissons,cquerir|3érons,échoir|4yons,vêtir|3ons,sentir|4ons,dormir|4ons,aillir|4ons,ouvrir|4ons,ourir|3ons,enir|2ons,oir|1ns,ger|2ons,cer|çons,ir|1ssons,er|ons,ariâtre|5tons,nclore|4sons,audire|4ssons,épandre|5ons,roire|2yons,outre|3ons,araitre|4ssons,ourire|4ons,rdre|2ons,vaincre|4quons,soudre|2lvons,ivre|2ons,ondre|3ons,ompre|3ons,clure|3ons,prendre|4ons,crire|3vons,ttre|2ons,ître|issons,endre|3ons,indre|1gnons,ire|1sons",
        "exceptions": "être|sommes,montrer|4ons,mentir|4ons,partir|4ons,ressortir|7ons,sortir|4ons,fuir|2yons,servir|4ons,voir|2yons,iendre|2gnons,boire|1uvons,coudre|3sons,moudre|3lons,rire|2ons,desservir|7ons,resservir|7ons,revoir|4yons,départir|6ons,avoir|3ns,asservir|7ssons,choir|3ns,gésir|1isons,pouvoir|5ns,devoir|4ns,pourvoir|6yons,quérir|4ons,savoir|4ns,valoir|4ns,croître|3issons,maudire|5ssons,paître|2issons,recroître|5issons,renaître|4issons,repaître|4issons,aindre|2gnons,connaître|5issons,croire|3yons,accroître|5issons,foutre|4ons,lire|2sons,naître|2issons,cloître|3issons,abolir|5ssons,accomplir|8ssons,assouplir|8ssons,assouvir|7ssons,astreindre|6gnons,atteindre|5gnons,embellir|7ssons,emplir|5ssons,empreindre|6gnons,peindre|3gnons,plaindre|4gnons,polir|4ssons,repeindre|5gnons,ressentir|7ons,restreindre|7gnons,vieillir|7ssons,faiblir|6ssons,feindre|3gnons,geindre|3gnons,gravir|5ssons,mollir|5ssons,mordre|4ons,morfondre|7ons,établir|6ssons,réflechir|4échissons,remplir|6ssons,acquerir|4érons,craindre|4gnons,sentir|4ons,éteindre|4gnons,paraitre|5ssons,déchoir|5yons",
        "rev": "évalons|5ir,évoyons|3ir,pentons|4ir,rsoyons|2eoir,ssoyons|3ir,aïssons|2r,iâttons|3re,ncisons|3re,closons|3re,egnons|1ndre,pandons|4re,uivons|3re,pissons|2r,erdons|3re,evoyons|3ir,missons|2r,ffrons|3ir,iégeons|1èger,rrêtons|2eter,éférons|2èrer,sférons|2erer,bissons|2r,ourions|4re,sortons|4ir,cevons|4ir,mouvons|5ir,vêtons|3ir,fisons|2re,inquons|2cre,hissons|2r,vivons|3re,voulons|5ir,disons|2re,battons|4re,pondons|4re,partons|4ir,uissons|2r,dormons|4ir,solvons|2udre,oignons|2ndre,ompons|3re,cluons|3re,aisons|2re,gissons|2r,prenons|4dre,tenons|3ir,crivons|3re,ouvrons|4ir,ourons|3ir,illons|3ir,mettons|4re,cissons|2r,sissons|2r,dissons|2r,venons|3ir,uisons|2re,rissons|2r,endons|3re,tissons|2r,nissons|2r,geons|2r,çons|cer,ons|er"
      },
      "vous": {
        "rules": "ésir|isez,révoir|4yez,epentir|5ez,urseoir|3oyez,ssoir|3yez,aïr|2ssez,ourvoir|5yez,uérir|3ez,ieillir|6sez,ffrir|3ez,ssièger|3égez,rreter|2êtez,réfèrer|3érez,nsferer|3érez,flechir|2échissez,cquerir|3érez,échoir|4yez,vêtir|3ez,sentir|4ez,dormir|4ez,ouvrir|4ez,ourir|3ez,illir|3ez,oir|ez,enir|2ez,ir|1ssez,er|1z,ariâtre|5tez,nclore|4sez,audire|4ssez,épandre|5ez,roire|2yez,outre|3ez,araitre|4ssez,ourire|4ez,faire|3tes,rdre|2ez,dire|2tes,vaincre|4quez,soudre|2lvez,ivre|2ez,ondre|3ez,ompre|3ez,clure|3ez,prendre|4ez,crire|3vez,ttre|2ez,ître|issez,endre|3ez,ire|1sez,indre|1gnez",
        "exceptions": "être|2es,montrer|4ez,mentir|4ez,partir|4ez,ressortir|7ez,sortir|4ez,fuir|2yez,servir|4ez,voir|2yez,iendre|2gnez,boire|1uvez,coudre|3sez,moudre|3lez,rire|2ez,desservir|7ez,resservir|7ez,revoir|4yez,départir|6ez,avoir|2ez,gésir|1isez,pouvoir|4ez,devoir|3ez,pourvoir|6yez,quérir|4ez,savoir|3ez,valoir|3ez,croître|3issez,recroître|5issez,aindre|2gnez,croire|3yez,accroître|5issez,foutre|4ez,lire|2sez,feindre|3gnez,geindre|3gnez,mordre|4ez,réflechir|4échissez,sentir|4ez",
        "rev": "rvissez|3r,révalez|5oir,révoyez|4ir,epentez|5ir,ursoyez|3eoir,ssoyez|3ir,aïssez|2r,riâttez|4re,oncisez|4re,nclosez|4re,udissez|3re,egnez|1ndre,épandez|5re,loissez|2ître,uivez|3re,upissez|3r,uvissez|3r,erdez|3re,laignez|3ndre,ssentez|5ir,evoyez|3ir,illisez|4r,omissez|3r,avissez|3r,rfondez|5re,ffrez|3ir,ssiégez|3èger,rrêtez|2eter,référez|3èrer,nsférez|3erer,ubissez|3r,cquérez|3erir,raignez|3ndre,raissez|3tre,ouriez|4re,échoyez|4ir,sortez|4ir,cevez|3oir,mouvez|4oir,vêtez|3ir,paissez|2ître,fisez|2re,aisez|2re,ainquez|3cre,olissez|3r,teignez|3ndre,chissez|3r,sservez|5ir,llissez|3r,peignez|3ndre,vivez|3re,voulez|4oir,blissez|3r,battez|4re,pondez|4re,partez|4ir,uissez|2r,dormez|4ir,naissez|2ître,solvez|2udre,reignez|3ndre,joignez|3ndre,ompez|3re,cluez|3re,plissez|3r,gissez|2r,prenez|4dre,tenez|3ir,crivez|3re,ouvrez|4ir,ourez|3ir,illez|3ir,mettez|4re,cissez|2r,sissez|2r,dissez|2r,venez|3ir,uisez|2re,rissez|2r,endez|3re,tissez|2r,nissez|2r,ez|1r,ites|1re"
      },
      "ils": {
        "rules": "cheter|2ètent,apiécer|3ècent,eser|èsent,evrer|èvrent,élébrer|2èbrent,brécher|2èchent,égler|èglent,rotéger|3ègent,théquer|2èquent,ppuyer|3ient,ésir|isent,révoir|5ent,epentir|5ent,urseoir|3oient,ssoir|4ent,aïr|2ssent,ourvoir|6ent,uérir|1ièrent,ssener|2ènent,ieillir|6sent,ureter|2ètent,aleter|2ètent,arteler|3èlent,odeler|2èlent,ffrir|3ent,rreter|2êtent,nsferer|3èrent,flechir|2échissent,cquerir|3ièrent,échoir|5ent,ecer|ècent,érer|èrent,valoir|3ent,cevoir|çoivent,vêtir|3ent,mener|1ènent,sentir|4ent,vouloir|1eulent,céder|1èdent,ouvoir|euvent,dormir|4ent,ever|èvent,leter|3tent,courir|4ent,ouvrir|4ent,illir|3ent,eler|2lent,enir|iennent,oyer|1ient,ir|1ssent,er|1nt,ariâtre|5tent,nclore|4sent,audire|4ssent,épandre|5ent,roire|3ent,outre|3ent,raire|3ent,araitre|4ssent,ourire|4ent,faire|1ont,rdre|2ent,vaincre|4quent,soudre|2lvent,ivre|2ent,ondre|3ent,ompre|3ent,clure|3ent,prendre|4nent,crire|3vent,ttre|2ent,ître|issent,endre|3ent,indre|1gnent,ire|1sent",
        "exceptions": "être|sont,avoir|ont,geler|1èlent,aller|vont,jeter|3tent,montrer|4ent,mentir|4ent,mourir|1eurent,partir|4ent,ressortir|7ent,sortir|4ent,devoir|1oivent,fuir|3ent,savoir|3ent,servir|4ent,voir|3ent,iendre|2gnent,boire|3vent,coudre|3sent,moudre|3lent,rire|2ent,desservir|7ent,peler|1èlent,resservir|7ent,revoir|5ent,départir|6ent,asservir|7ssent,gésir|1isent,pouvoir|1euvent,pourvoir|7ent,quérir|2ièrent,valoir|3ent,croître|3issent,maudire|5ssent,paître|2issent,recroître|5issent,renaître|4issent,repaître|4issent,aindre|2gnent,connaître|5issent,croire|4ent,accroître|5issent,foutre|4ent,lire|2sent,naître|2issent,cloître|3issent,abolir|5ssent,accomplir|8ssent,assouplir|8ssent,assouvir|7ssent,astreindre|6gnent,atteindre|5gnent,embellir|7ssent,emplir|5ssent,empreindre|6gnent,peindre|3gnent,plaindre|4gnent,polir|4ssent,repeindre|5gnent,ressentir|7ent,restreindre|7gnent,faiblir|6ssent,feindre|3gnent,geindre|3gnent,gravir|5ssent,mollir|5ssent,mordre|4ent,morfondre|7ent,appeler|5lent,gérer|1èrent,rappeler|6lent,établir|6ssent,réflechir|4échissent,remplir|6ssent,acquerir|4ièrent,craindre|4gnent,sentir|4ent,éteindre|4gnent,paraitre|5ssent,déchoir|6ent",
        "rev": "piècent|2écer,èsent|eser,èvrent|evrer,lèbrent|1ébrer,rèchent|1écher,èglent|égler,otègent|2éger,hèquent|1équer,ppuient|3yer,idèrent|2érer,évalent|4oir,évoient|4r,pentent|4ir,rsoient|2eoir,ssoient|4r,aïssent|2r,iâttent|3re,ncisent|3re,closent|3re,egnent|1ndre,pandent|4re,oulent|2dre,raient|3re,uivent|3re,pissent|2r,erdent|3re,evoient|4r,llisent|3r,missent|2r,ffrent|3ir,rrêtent|2eter,sfèrent|2erer,bissent|2r,ourient|4re,ècent|ecer,sortent|4ir,çoivent|cevoir,meuvent|1ouvoir,vêtent|3ir,font|1aire,fisent|2re,aisent|2re,inquent|2cre,tellent|3er,hissent|2r,vellent|3er,vivent|3re,veulent|1ouloir,cellent|3er,disent|2re,cèdent|1éder,battent|4re,pondent|4re,partent|4ir,ètent|eter,uissent|2r,dorment|4ir,solvent|2udre,oignent|2ndre,èvent|ever,ènent|ener,lettent|3er,ompent|3re,èlent|eler,cluent|3re,rennent|3dre,courent|4ir,gissent|2r,crivent|3re,ouvrent|4ir,illent|3ir,mettent|4re,cissent|2r,sissent|2r,dissent|2r,uisent|2re,rissent|2r,endent|3re,tissent|2r,nissent|2r,iennent|enir,oient|1yer,ent|1r"
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

  var adjective = {
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

  var noun = {
    toPlural,
    fromPlural,
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

  const presentTense = (str) => doVerb(str, model$2.presentTense);
  const futureTense = (str) => doVerb(str, model$2.futureTense);
  const imperfect = (str) => doVerb(str, model$2.imperfect);
  const pastParticiple = (str) => convert$1(str, model$2.pastParticiple.prt);

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

  var verb = { presentTense, futureTense, imperfect, pastParticiple, fromPresentTense, fromFutureTense, fromImperfectTense, fromPastParticiple, fromPassive };

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
    "Conjunction": "true¦&,car,donc,et,ma2o1pu2s0voire;inon,oit;r,u;is",
    "Preposition": "true¦aQbecause,cMdIeDgrace,horCjusquBlors9malgPoutPp6qu4s1v0y,à;eGia,oici;a1elEoTu0;ivaPr;ns,uf;elqu0i,oi4;!';ar1endaLour0rPuis2;!quoi;! Lmi;qu0;!e;',e;m8s;n0xcepte;!tAv0;e1ir0;on;rs;!ans,e1u0;!ra8;!pu0rrie4s,va7;is;hez,o0;mme,n0ura4;cerna3t0;re;!fin,pr5u2v0;a0ec;nt; 0pr2;dess0;us;es",
    "Adverb": "true¦0:11;a0Tb0Pc0Id0De06f04g03h02i01jYlUmSnRoPpGquCr0Ks9t2ultra,vi1;s a v0Xte;a5ertio,o2r1;es,op;t,u1;jou12t1;!e0R;n1rd;d0Qt;ecu0Ai2o1urto08;i-disa0uve0;!c,de0t0G;!a2e1;!lque;n1si;d,t;a7e5lu4o3r1;esqu1imo;',e;i0urta0;s,t07;le mePu1;!t-etQ;r1s;fo0AtoT;rZu1;i,tre m04;agCeanmoiPon;a1eDieux,oiO;intena0l,tI;a2o1;in,ngDrs; 1-dedaK;b08dess05;a2us1;que 04te;dYmaY;ci,dem,ntT;aFiS;ue9;er1i,ort;me;n1tc;co5f4s2tre 1;temps;emb1uite;le;in;re;avantage,e1orenN;bo3ca,da2hoTja,s1;ormaJs7;ns;ut;a,e5i3omb2resce1;ndo;ien;! dess1;oGus;penda0rt1;es;e3ien1ref;!t1;ot;aucoup,l;iDlBssez,u2vant hi1;er; de8-desso7par5ssi4t1;a0our,re1;fo1;is;!tôt;ava0;nt;us;la;i1o3;as;lleu1nsi;rs",
    "Determiner": "true¦au4ce3l1ol,un0;!e;a,e0;!s;s,tte;!x",
    "QuestionWord": "true¦quelle",
    "Noun": "true¦aujourd'hui",
    "Adjective": "true¦quelques",
    "FirstName": "true¦aEblair,cCdevBj8k6lashawn,m3nelly,quinn,re2sh0;ay,e0iloh;a,lby;g1ne;ar1el,org0;an;ion,lo;as8e0r9;ls7nyatta,rry;am0ess1ude;ie,m0;ie;an,on;as0heyenne;ey,sidy;lex1ndra,ubr0;ey;is",
    "LastName": "true¦0:34;1:3B;2:39;3:2Y;4:2E;5:30;a3Bb31c2Od2Ee2Bf25g1Zh1Pi1Kj1Ek17l0Zm0Nn0Jo0Gp05rYsMtHvFwCxBy8zh6;a6ou,u;ng,o;a6eun2Uoshi1Kun;ma6ng;da,guc1Zmo27sh21zaR;iao,u;a7eb0il6o3right,u;li3Bs2;gn0lk0ng,tanabe;a6ivaldi;ssilj37zqu1;a9h8i2Go7r6sui,urn0;an,ynisJ;lst0Prr1Uth;at1Uomps2;kah0Vnaka,ylor;aEchDeChimizu,iBmiAo9t7u6zabo;ar1lliv2AzuE;a6ein0;l23rm0;sa,u3;rn4th;lva,mmo24ngh;mjon4rrano;midt,neid0ulz;ito,n7sa6to;ki;ch1dLtos,z;amBeag1Zi9o7u6;bio,iz,sD;b6dri1MgIj0Tme24osevelt,ssi,ux;erts,ins2;c6ve0F;ci,hards2;ir1os;aEeAh8ic6ow20;as6hl0;so;a6illips;m,n1T;ders5et8r7t6;e0Nr4;ez,ry;ers;h21rk0t6vl4;el,te0J;baBg0Blivei01r6;t6w1O;ega,iz;a6eils2guy5ix2owak,ym1E;gy,ka6var1K;ji6muW;ma;aEeCiBo8u6;ll0n6rr0Bssolini,ñ6;oz;lina,oKr6zart;al0Me6r0U;au,no;hhail4ll0;rci0ssi6y0;!er;eWmmad4r6tsu07;in6tin1;!o;aCe8i6op1uo;!n6u;coln,dholm;fe7n0Qr6w0J;oy;bv6v6;re;mmy,rs5u;aBennedy,imuAle0Lo8u7wo6;k,n;mar,znets4;bay6vacs;asY;ra;hn,rl9to,ur,zl4;aAen9ha3imen1o6u3;h6nYu3;an6ns2;ss2;ki0Es5;cks2nsse0D;glesi9ke8noue,shik7to,vano6;u,v;awa;da;as;aBe8itchcock,o7u6;!a3b0ghNynh;a3ffmann,rvat;mingw7nde6rN;rs2;ay;ns5rrQs7y6;asDes;an4hi6;moJ;a9il,o8r7u6;o,tierr1;ayli3ub0;m1nzal1;nd6o,rcia;hi;erAis9lor8o7uj6;ita;st0urni0;es;ch0;nand1;d7insteHsposi6vaL;to;is2wards;aCeBi9omin8u6;bo6rand;is;gu1;az,mitr4;ov;lgado,vi;nkula,rw7vi6;es,s;in;aFhBlarkAo6;h5l6op0rbyn,x;em7li6;ns;an;!e;an8e7iu,o6ristens5u3we;i,ng,u3w,y;!n,on6u3;!g;mpb7rt0st6;ro;ell;aBe8ha3lanco,oyko,r6yrne;ooks,yant;ng;ck7ethov5nnett;en;er,ham;ch,h8iley,rn6;es,i0;er;k,ng;dDl9nd6;ers6rA;en,on,s2;on;eks7iy8var1;ez;ej6;ev;ams",
    "MaleName": "true¦0:CD;1:BK;2:C1;3:BS;4:B4;5:BY;6:AS;7:9U;8:BC;9:AW;A:AN;aB3bA7c96d86e7Ff6Xg6Fh5Vi5Hj4Kk4Al3Qm2On2Do27p21qu1Zr1As0Qt06u05v00wNxavi3yGzB;aBor0;cBh8Hne;hCkB;!aB0;ar50eAZ;ass2i,oCuB;sDu24;nEsDusB;oBsC;uf;ef;at0g;aJeHiCoByaAO;lfgang,odrow;lBn1N;bDey,frBIlB;aA4iB;am,e,s;e88ur;i,nde7sB;!l6t1;de,lCrr5yB;l1ne;lBt3;a92y;aEern1iB;cCha0nceBrg9Ava0;!nt;ente,t59;lentin48n8Xughn;lyss4Lsm0;aTeOhKiIoErCyB;!l3ro8s1;av9PeBist0oy,um0;nt9Hv53y;bDd7WmBny;!as,mBoharu;aAXie,y;i82y;mBt9;!my,othy;adDeoCia7ComB;!as;!do7L;!de9;dErB;en8GrB;an8FeBy;ll,n8E;!dy;dgh,ic9Snn3req,ts44;aRcotPeNhJiHoFpenc3tBur1Nylve8Gzym1;anDeBua7A;f0phAEvBwa79;e56ie;!islaw,l6;lom1nA2uB;leyma8ta;dBl7Im1;!n6;aDeB;lBrm0;d1t1;h6Rne,qu0Tun,wn,y8;aBbasti0k1Wl40rg3Zth,ymo9H;m9n;!tB;!ie,y;lCmBnti20q4Hul;!mAu4;ik,vato6U;aVeRhe91iNoFuCyB;an,ou;b6KdCf9pe6PssB;!elAH;ol2Ty;an,bHcGdFel,geEh0landA8meo,nDry,sCyB;!ce;coe,s;!a94nA;l3Jr;e4Qg3n6olfo,ri68;co,ky;bAe9U;cBl6;ar5Oc5NhCkBo;!ey,ie,y;a85ie;gCid,ub5x,yBza;ansh,nS;g8WiB;na8Ss;ch5Yfa4lDmCndBpha4sh6Uul,ymo70;al9Yol2By;i9Ion;f,ph;ent2inB;cy,t1;aFeDhilCier62ol,reB;st1;!ip,lip;d9Brcy,tB;ar,e2V;b3Sdra6Ft44ul;ctav2Vliv3m96rFsCtBum8Uw5;is,to;aCc8SvB;al52;ma;i,l49vJ;athJeHiDoB;aBel,l0ma0r2X;h,m;cCg4i3IkB;h6Uola;hol5XkBol5X;!ol5W;al,d,il,ls1vB;il50;anBy;!a4i4;aWeTiKoFuCyB;l21r1;hamCr5ZstaB;fa,p4G;ed,mF;dibo,e,hamDis1XntCsBussa;es,he;e,y;ad,ed,mB;ad,ed;cGgu4kElDnCtchB;!e7;a78ik;house,o03t1;e,olB;aj;ah,hBk6;a4eB;al,l;hClv2rB;le,ri7v2;di,met;ck,hNlLmOrHs1tDuricCxB;!imilian8Cwe7;e,io;eo,hCi52tB;!eo,hew,ia;eBis;us,w;cDio,k86lCqu6Gsha7tBv2;i2Hy;in,on;!el,oKus;achBcolm,ik;ai,y;amBdi,moud;adB;ou;aReNiMlo2RoIuCyB;le,nd1;cEiDkBth3;aBe;!s;gi,s;as,iaB;no;g0nn6RrenDuBwe7;!iB;e,s;!zo;am,on4;a7Bevi,la4SnDoBst3vi;!nB;!a60el;!ny;mCnBr67ur4Twr4T;ce,d1;ar,o4N;aIeDhaled,iBrist4Vu48y3B;er0p,rB;by,k,ollos;en0iEnBrmit,v2;!dCnBt5C;e0Yy;a7ri4N;r,th;na68rBthem;im,l;aYeQiOoDuB;an,liBst2;an,o,us;aqu2eJhnInGrEsB;eChBi7Bue;!ua;!ph;dBge;an,i,on;!aBny;h,s,th4X;!ath4Wie,nA;!l,sBy;ph;an,e,mB;!mA;d,ffGrDsB;sBus;!e;a5JemCmai8oBry;me,ni0O;i6Uy;!e58rB;ey,y;cHd5kGmFrDsCvi3yB;!d5s1;on,p3;ed,od,rBv4M;e4Zod;al,es,is1;e,ob,ub;k,ob,quB;es;aNbrahMchika,gKkeJlija,nuIrGsDtBv0;ai,sB;uki;aBha0i6Fma4sac;ac,iaB;h,s;a,vinBw2;!g;k,nngu52;!r;nacBor;io;im;in,n;aJeFina4VoDuByd56;be25gBmber4CsD;h,o;m3ra33sBwa3X;se2;aDctCitCn4ErB;be20m0;or;th;bKlJmza,nIo,rDsCyB;a43d5;an,s0;lEo4FrDuBv6;hi40ki,tB;a,o;is1y;an,ey;k,s;!im;ib;aQeMiLlenKoIrEuB;illerCsB;!tavo;mo;aDegBov3;!g,orB;io,y;dy,h57nt;nzaBrd1;lo;!n;lbe4Qno,ovan4R;ne,oDrB;aBry;ld,rd4U;ffr6rge;bri4l5rBv2;la1Zr3Eth,y;aReNiLlJorr0IrB;anDedBitz;!dAeBri24;ri23;cDkB;!ie,lB;in,yn;esJisB;!co,zek;etch3oB;yd;d4lBonn;ip;deriDliCng,rnB;an01;pe,x;co;bi0di;arZdUfrTit0lNmGnFo2rCsteb0th0uge8vBym5zra;an,ere2V;gi,iCnBrol,v2w2;est45ie;c07k;och,rique,zo;aGerFiCmB;aFe2P;lCrB;!h0;!io;s1y;nu4;be09d1iEliDmCt1viBwood;n,s;er,o;ot1Ts;!as,j43sB;ha;a2en;!dAg32mEuCwB;a25in;arB;do;o0Su0S;l,nB;est;aYeOiLoErDuCwByl0;ay8ight;a8dl6nc0st2;ag0ew;minFnDri0ugCyB;le;!l03;!a29nBov0;e7ie,y;go,icB;!k;armuCeBll1on,rk;go;id;anIj0lbeHmetri9nFon,rEsDvCwBxt3;ay8ey;en,in;hawn,mo08;ek,ri0F;is,nBv3;is,y;rt;!dB;re;lKmInHrDvB;e,iB;!d;en,iDne7rByl;eBin,yl;l2Vn;n,o,us;!e,i4ny;iBon;an,en,on;e,lB;as;a06e04hWiar0lLoGrEuCyrB;il,us;rtB;!is;aBistobal;ig;dy,lEnCrB;ey,neli9y;or,rB;ad;by,e,in,l2t1;aGeDiByI;fBnt;fo0Ct1;meCt9velaB;nd;nt;rDuCyB;!t1;de;enB;ce;aFeErisCuB;ck;!tB;i0oph3;st3;d,rlBs;eBie;s,y;cBdric,s11;il;lEmer1rB;ey,lCro7y;ll;!os,t1;eb,v2;ar02eUilTlaSoPrCuByr1;ddy,rtI;aJeEiDuCyB;an,ce,on;ce,no;an,ce;nCtB;!t;dCtB;!on;an,on;dCndB;en,on;!foBl6y;rd;bCrByd;is;!by;i8ke;al,lA;nFrBshoi;at,nCtB;!r10;aBie;rd0S;!edict,iCjam2nA;ie,y;to;n6rBt;eBy;tt;ey;ar0Xb0Nd0Jgust2hm0Gid5ja0ElZmXnPputsiOrFsaEuCveBya0ziz;ry;gust9st2;us;hi;aIchHi4jun,maFnDon,tBy0;hBu06;ur;av,oB;ld;an,nd0A;el;ie;ta;aq;dGgel05tB;hoEoB;i8nB;!i02y;ne;ny;reBy;!as,s,w;ir,mBos;ar;an,beOd5eIfFi,lEonDphonHt1vB;aMin;on;so,zo;an,en;onCrB;edP;so;c,jaEksandDssaExB;!and3;er;ar,er;ndB;ro;rtH;ni;en;ad,eB;d,t;in;aColfBri0vik;!o;mBn;!a;dFeEraCuB;!bakr,lfazl;hBm;am;!l;allEel,oulaye,ulB;!lCrahm0;an;ah,o;ah;av,on",
    "MaleAdjective": "true¦0:033;1:035;2:021;3:02U;4:015;5:025;6:039;7:03A;8:01W;9:02O;A:01B;B:02I;C:UC;D:02Y;E:02E;F:00L;G:023;H:YV;I:032;J:Z7;K:02S;L:00B;aY4bW5cRJdNYeLGfJNgIIhHXiEZjETlE8mC9nBKoAPp7Squ7Rr5Js3Ht2Bu24v11zé10â012éMô4;b0Wc0Ld0Kg0Ihon4l0Cm08n07oYHp03qu01r00tSvM;aPeNiHBoM;ca005l9;il5ntM;ré,uGé;c9nMpo2s035;es028o015;aSeRhQinceEoOrMudJ;angMiq9oK;er,l02S;fYQi5nn3uM;fUXrYO;iopiFé2;i0rnG;b01Sgé;a01Cein4o02FudK;ar017iM;disClNSvaRZ;aOerQ5iNlo2ouMrouv3uis3;stoufEvMM;cé,scop1;no00Qrp016ta0;amou2erv3;aOiGVoMu,écH;ti6BuM;s7va0;cJil5nciZD;aQePimOoNu,éM;ga0vaZF;ig6qSC;i6é;ct9Cvé;bo2nXH;aMrilVSypU0;l,ré;en4ifSUuc01E;aVerUhSlaRoOrNuM;lé,ma0;as3it;euIrNuM;lé,r4;cHné;boI3ir3t3;aMeN;nc2pYV;ve5;il5rtQ4;aNerl9l4LouMrécH;illLTrifXO;hi,ucH;b2lé;a0Ie09iYoRrai,u,éMê02C;cu,gétaPhéme0nNrM;ifJo5;al,iMérI0;el,tiF;l,riFt8;cRiQlOt8uNyaMû4;geBnt;lu,é;aMeBé;nt,tHQ;lé,sA;al,i9K;bIcVdé,eTf,giElSnd4SolRrQsPtNvM;a0ifS0;aMré;l,mi6;cTVsé,uGé;al,g01Ril,tuGuQJ;aWFeUB;!aA;illMtnamiF;i01Got;eUNtoZ2;in0WlTnQrMspTOuf,x3;b1dOmNnFUrZMsé,tM;!-de-gNFic1ébr1;eH9ouSY;i,oWE;dNgeBtMu;i5ru;u,éF;ou4u;cQgPiNll01GntaVKrJuM;dY3t2;lEnM;!cu;aHFin1;a0haVFilE;kraiWBlQniPrOsNtM;iYPérA;aYHuGé;baAge0;!latT5versG;cé2tM;raviolYUérX9;a0Me0Gh0Fi0Co04rQuOyroVSâtUWéMê012;léMnu,t87;pho6vi7;!a0méfJniSVrMé;buPNc,gZI;aTemRiPoNuq9éM;buY4pi00P;mp005nq9pX6uM;bl3vé,é;b1cYOmestETomphaMvi1;l,nt;blMpé;a0oCé;ceBdZFhi,itW1nOpNumatiDvaillZZîM;na0tA4;u,ézoïd1;ch3quilliDsM;cW1i,pMvers1;aYRlJY;caUOléImb3nSquRrPscYOt1uM;ch3ffu,lousaArMt-puWE;ang4RbillUBmL3nM;a0oVAé;dUDrQBtuM;!r3;aUIé;du,itrR9na0;béRFg2mNntinnabuEré,ssTFtM;ré,uba0;b2o2;e72éâWZ;i0mpQnPrMutWTxYC;m003ni,rM;iMoLY;en,fi3toNJ;du,taPLu;or77é2;bWQil5mi7nPpOquArNs7tM;illWMo9;abisco4d8i,é;ageBé;ge0né;a18c16e10i0TnobiS2o0Lp0Ht0BuSyPéMûr;dMlectiUTmZSpa2roposVP;at8uM;cW9i1B;mpathiDnMriF;coW3diM;c1q9;a0b01cZd-XffWggeN1iVjXGpRrNspeM;ct,nMK;aObaDUdévelJYfaKge5huFAme6naturGpNvM;iva0ol4;eup5reU2;igu,n6;erNpMérVP;lPKo7;fMpo7;iUZlu;ciYInCvi;iDoca0;aMc7F;fW0méW0;cMeBré;eX7uNZ;conscOVit,jePWlimZ6merWJordZAsNtEXurbaAveM;nP7rs8;tanP4éqOL;aQimuEomac1rOupéfNy5érM;iWMéotyVH;aKia0;esDiMucUV;ct,de0é;biWIliU3ndardi7;aSTecVRiriP4oOécM;iMulXL;alWNfJ;n8Brt8;ci1ign3leXOmnoNLnSphistUYrCt,uM;dQfOleXVrNs94teMveO6;nu,rO5;d,ia0;fMré;lé,ra0;aAé;geBn3;bRciTEdEMgnPmNnMt9;guV5i5V;plWDulM;ta6é;a5ifiMé;a0cX5;yMSéVV;cQigneuLWmpiOAnNrMul,xuGya0;eApeR1ré,vi;sNtiM;!meOQ;atX4it8oCDuGé;!oVOrW3;andaVSel5intXHulptMélérWT;ur1é;b5cYhaVMiWlVngTouSrrasAtPuNvMxUV;a0oyaSD;greRUtM;ilEé;a6iMu2;né,sfaiM;sa0t;diFl;la0uinM;!oMP;i6Fé;gSFlEn2RsM;iXNonPR;caWZerdot1rM;ifJo-sai0é;a1De0Ki0Ho09u06ythX7âU6éMêvX4ôUR;a04barbWFc02duKel,f01gZjYn1pUsRtOusP2vM;olMélND;t3u;iNrM;ospeOCéGZ;ce0f;erWNiMoP0;dMg6sC;enNIuG;aOuNétM;it8é;bliVLgRZté;nKDraTX;ouiX6;lé,ulMéIX;aTUiL;lécGAorWQrigér3ugJ;alcitIeMhaufSLonforCurVJ;nt,pt8;ct8li7;bicoULgT5iNr1sMtiE;taLRé;né,sseE;mRnQtVSuMy1;couEgNl3maAquAsOEtiM;er,niL;eMisD;aLLoRW;d,fEgeBrQV;aMpu;in,n;a0caNdé,golMngaR3sq9tuGv1;aR2o;in,na0;b0Dc06do05f04je4l01m00nZpVsRtPvMçu;enMu,êWU;dMu;icVE;arVUenMi2rous7;tSMu;caT1pOseNtM;a0rei0;mbEnTKr2;eUYlendSI;entOlUCoNrMtiRBu;odK5ésentTP;sa0usD;a0i;aSDcont2du,omVUtIvLJ;pUVua0;aMeVFié,uiDâcHég9;tiMxa0;f,oV5;aKou5roiSDu7;nW4ub5;hercHoOrNuM;eilUOit,lé;oquevU8u;mmV9nNuM;rG3veKL;nMstitN2;aS0u;atW3onRBuC;b00cZdiYfXgWilQ2mVnTpRsPtOvNyM;onQIé;agVAiVQ;aAYioURé;a0sM;asJuI;ide,pM;or4rocH;cMgé;i,uNN;as7ifJolU7pa0;eBoûC;fi6raîchRM;al,c1n,oaMC;i1oPO;atVNelaiNJougTJ;alNCiTDotiSH;a1Ue1Lh1Ji1Hl15o0RrXuSyramid1âlD7éM;cTFda0jM0nPriUXtM;aNilErMuEé;ifJoS0;nt,raVA;aMétI;l,rd;a0bPcOdiBIisDni,rMtasNCérB2;!iMpurAuK2;ficaRStaA;eau;iFlic;e0Di08oUuTéMêtQL;cQdesA7fPmOnat1oc7Fpo7sNtenI4vMétabTN;eOUoQ1;e0idL2uUJ;aGBédi4;abrR6é2;iMé8O;pi4té;de0sMX;ba0chaAduYfXgramUDhiEXlWmVnonPMpSsRtPuU0vMémi8R;enç1iNoM;ca0q9;dKTnR5;eMubéIéS6;cRBsC;crKt2;oNreM;!t;rKQsé;etR6pt,u;i29onRZétaS2;essTFoS0;ctIPit;mPnNsM7vM;at8ilégJé;ciMtaME;er,p1;it8ordi1é;miLna0ssM;a0enRDé;cHiXlVmp01nUrtTsPtNuM;d2rS6ssTX;agLeM;lé,nK9;it8sOtMé;al,éM;!rQF;eS5éTB;at8eBoQV;cKAdé2tifQH;iMynéM1;!cOCssQQtiRA;gOKlu,ntMv2;eBu,é;aTeQiPoOuIVéM;bMniL;éiF;mDVnS8;a0s7;in,urM;a0nichM;aNZeB;cé,iOnNq9tM;!i6;!a0q9té;nt8sa0;afL6caNUmMqu3voCétQB;en4pa0;ilippAosphorS7énM;iQSomén1;ct01inTlé,nSrNsMtKup5;a0tilJG;cuCdu,forPlé,ma7ApéJNsNtMverQGçNH;i79urDF;an,isCoS9uaFJéM;cu4véI;a0ma0é;aHXcHdu,sa0tu;aNIt;i08lpiCn07rXsRtNuSPvé,yMïF;a0sRGé;aHTeOie0rM;iMon1;arc1ciF;ntOJrnG;sNtM;or1;aOiMé;f,onnM;a0el,é;gLnt;aTcheFYeSfRiQl3oissi1tMveMNé;aOiM;al,cMel,sR3;iP6uPF;gé,nt;gAHsiF;aKuS7;il,ntLI;dox1guayFlys3noM;rm1;su,teEé;ll1Sr;b0Cc09dor07ff05is8lfaJBm04nd03pYrRsé,ttomQTuMxygé6;a4blJtOvM;eH1rM;aPViL;il5rM;aQTecuiSCé;aRbI7cheQdPgOiMné,phelA;eAEginM;al,el;ani7;on6u7E;st2;l,nPM;alApNt4UuH0érM;atR1é;oNrM;esDiRL;r4Dsé;oN0ul3;b0Gniprése0;ensMiNNra0usq9;a0if,é;a0iM;féI;cMtogFH;asQQiMup3;deIApHN;jeIKlOsMéNT;cBeMti6éd3;rQVssQM;igJHong;a01e00iZoPuOéM;!gMvro7;at8liP1;!anMClKOméro4pLJtrNK;c8irUmSnchaErOté,uMvaO5yé;rriMé;!ciLsD;d-NmaMvéJU;l,nd;afO8cM;oréF;inaMmé;l,t8;!aFZci;cke5ppO1;stoORt,urEV;c2iTpolSrrPZsRtPuNvMzi,ïf;al,r3;fMséa7F;raOK;al,iMurG;f,on1;al,ilK5;iIAéoM8;n,sD;a12e0Ui0Mo02uVéNûrM;!isD;cSdNfH4l47nagLpriDriMtropoliI6;diEIta0;iMu7;aOcNtMév1;at8erranéF;al,in1o-lég1;n,teB;ha0onH2;et,gMQltiRnicip1rQsOtM;a0iMuG;lé,n;c5icMq9ulmOW;al,iF;al,muI;na2FplJ;biN5d04i02llOEm00nVqueBrStRuMyF;chPil5lOra0sNtKGvM;a0emB7;su,tacES;a0u,é;aKNe4;eBiPHoCA;al,dNf1i6KmN2tM;!-6el,ifGH;a0o2u;dPgolOopareGPtMuGO;aMé;gIHnt;!iF;aAi1;enMifJ;ta6;ndMré,si;re;ifJé2;gQliCnOroNtM;oyFé;boEiC;eBiMér1;er,m1sté3Z;nMraME;aK2onM;!nNN;ilJVnPsOuMxiNY;b5rtriMsiF;!er;quAu2;aOsNtMu;al,eB;ongLtruGuG;cé,ça0;boul,chPKg02igr01jeBlXmeH0nUrQsPtNudKîtrM;e,i7;eFFin1riMutPIé3L;ciGmoni1;culAq9s8;b2chaMUgPFiOoNLqu3ra0tM;iMyr;al,en;t1é;ié2qu3uM;el,sM;crK;aNfJ2in,oMsaAveOH;doIuA;dMi7;if,roK;elMYichLT;isLXyar;aZeYiToPuOâcHéM;cHgMn16zarO7;al,er,islNP;!brGScrNOiDminNMst2théMFxurF4;calMQinG5mbaJ6nNrECti,uMy1;rdDHé;doK1gM;!itudOV;bOgo4mNp18tMé;tGWuaJY;i4ousA;ertAidORérM;a3Mé;nt,vé;bi1cRiQnPq9rOsNtMvé,xND;e0in,ér1;c8sa0;g9moJI;ciJ4guKJ;d,tiL;rym1é2;aQePoNuM;biEif,ré;i0li,ncHuMvi1;eBffFUiMErnaKZé;té,unM7;casDillKBuniO5;di60gnor3ll2Hm1TnRrOsNtM;aJ3inéI;o5raéJ2su;aJDi7rM;atN1iCéM;el,guKRsoFM;a1Hc16d0Ye0Tf0Mg0Lh0Ki0HjustFYn0Go0Cqui0Bs02tRuQvNéM;dKg1;aincu,estiNiMé1I;o5t3;!gaKK;si4tiLK;aNWePo87rOuJWéM;gr5ZrM;eKKieB;ansiM9i5T;llRmpeBAnQrMstinGN;allJcontineE9dKlB0mitE4nNpo7roM;gMIm07;aMé;tiBB;s8tiNU;ecDWiB2;atisfaKcrKen7iSoQpir3tNuM;ffiDlC;antNinECruM;ct8it;!a6;le0uM;cDNpçNM;gnMnEHsC;ifDL;et,siAWéC;cOffeDQnMKpMuï;porMéI;tun;cuJQ;oM0é;ntMti1;erromMéresD;pu;abitCDos1Lu2WéLG;rLQéGV;aKQeRiniPlCLoMérJD;nM9rM;mMtu6;aIJel,é;!tésM;im1;ctIDrn1;mploIXxM;aMTisCpM;lMreKVérim7K;iq9oM;i4ré;iPoOuNéM;ce0fi82pIAter9S;!lA3st0T;-eurALle0;caJ7en,fféKYgOq9reMLsMviduG;cMtinMK;i9VrKG;e0né;aUeThSiRli6oMurLN;héKTmplKDnM;dLBg9Nnu,sNtMveH2;i0Brô5;cC5iMo5;dé2sC;de0s8;anJQ;ndJrDJsD;ndKYrM;cé2né;cQdPlOniLPpNrticu5ssouHNttenMvo9;du,t8;erçu,proprJ;té2;ap4éKP;heL7t8;ag08b07i4m00pM;aXerVlUoSrOuNérM;at8i1;de0isDls8r;essiFWoOuNéM;g6vu;de0;duCMmpLZvi7;ll9rtMs3te0;a0un,é;an4oI;soKNtiM;ne0;ir,rMtBFyé;faKti1;aQerJ1iPoNéM;diK8mo95ri4;biI7dé2rM;al,tG;g2ne0;cu5téM;riG;i5Hu;inK5é;imi4uMég1;mi6st2;aZeXiWoRuPydraCâOéMôteHY;bé4rMsiCtérU;is7;lé,t8;i5mMpHOrE;aAili3;llywooI5mPrNsM;pitaHR;izoBKm8PriM;fJpiE;oseES;laIndHUtléIIvern1;rMur4xag8L;bu,culéF;biPcHgaF7lOnNrMuC6;aHLceEdi,n4R;dicaHCté;eCluc5D;lNtM;uKDé;i4lé;a0Ke0Hi0Fl0Co09rWuQâ4éMên3;a0mGQnMorD2;iNéraM;l,teB;al,t1;erQiMtGIéIM;llNnM;dé,éF;erIEoM;ti6;riL;aUeTiPoMéco-ro07;ndeBssiNuM;ilEpé;er,sD;ffDKllOmNnIHsM;a0onEWé;aIFpa0;aHNé;c,lotCnu;is7mmatGMndNssoui6TtuKvM;e,itatJ1é;!iM;loq9MsD;gueCDnNuM;aE5drK7lu,rHHverneAH;do5fl3;aNisDoMua0;usD;cé,pFY;rondMtI6v2;!in;igC5ntNrMsticuE;maA;il;gn3iQlOmAn4rMuf2;antCLdMni;iFé;a0bé,oM;n6pa0;!lCP;a14e0Zi0Ul0Ko08rXuQâcHéMê5;cOdNlAmMod1ru;inAor1;ér1L;al,oGY;gRlQm3rOsNtMya0;ur,é;e5il5;eFYiMt8;boGT;guImiDX;it8ueB;aUeTiRoOuNéMôDE;mF9quentEPtIJ;g1itDKst2;iNnMufrouC;cé,taFS;d,s7;aGKgorAYn12pé,q9sM;sD1é;la4uG1;cMgm3Ris,nco-aFSpp3te8Z;aFOtu2;c1et1llGUnTrOuM;!droDWisseBrMtu;bu,c79ni,ré;aAcPesBCmOtM;ifJuM;it,né;el,u5é;e6é;cOdM;aMé;ment,nt,teB;iLtHJé;aQePi9ZoNuMâneBécH;et,orHAvi1;rMtCu;al,eB9isD;mmaCSuGJ;gOmMpi,tF2;aFXbM;a0oDE;eMra0;l5oE;cPer,gOli1nMsc1xé;!aMiI6;l,nciL;urFJé;e5hu,t8;i0n58rOsAAuM;illMt2;e4u;mMré,ve0;en4é;ci1go4iUlTmRnQrPsciCOtNuMvoG3;bouFJcHt8;al,igM;a0ué;ci,fe9G;farEOé;iliMé;al,er;ot;nBOsH0t;ff1Wm1In0Drr0Cs07ur5QxM;a04c00eZiXorbiCpRtNuM;béIlC;erminaEAraNéM;nu3rDZ;conjug1vaM;ga0;a7Ze65lPo7reFNul7éM;dDJrimeM;ntM;al,é;icG8oM;i4raE1s8;gMlé,sC;ea0u;mpt,rC4;eNit3luM;!s8;l64ptMss8;ioG6é;cMgé2lt3spéI;er19t;carDNpaPsNtM;iv1omDMudia9V;eMouff5;n75u5;cé,gnol;a0o6;c0Kd0Ef0Ag08ivIj07l06n04rZsVtOvM;a01elopp3iMoûC;rAXsaED;aF2eRiLou2rMurXêt3;'oPaOeMoP;bâF0couDClaBMpMteAN;o7reBG;nt,vé,î6;uve5C;n3Sr2;aOeNoM;leEUmmeEUrce5;igBAveF8;b5ngl06;aPegistB2huG4icOoNuM;ban6;bé,ué;hiGE;ci6gé;eMuCJ;iDVmi;eFKu3I;o9ôAJ;ag85l9oM;rDRurCI;a91erFTiOlNoMuFT;nB1ui;amFRé;lé,év2;euECiOoNurM;ci;loE6mmaDKrmi;aMma1P;b5mM;an4;aQhOlNoMr44u5;mbr3uraEF;e1Kin;aMevêt2;ntFCî6;is7st2;bSmRpM;aOe7ier2loBWoNrMâ4êt2;es7isFZun4;r4ussié2;il5nMq21;acH;erd7Eito8Xu2ê5;aRouPrNuMêC;sq9é;asMouDRuF4;sé,é;cHrM;bé;l5rraC7;aPeOiNlanq9ond2rM;ay3on4é6;c56lé;ct8rvE3;cé,rM;a0oMé;ucH;a34e2Xi21o1Vr1Tu1RéMû;b1Nc19dicaA0f11g0Vha0Ul0Rm0Ln0Jp09r06sVtQvMçu;ast4YeNoM;lu,ra0t,ué,yé;lMrgonEE;opBM;aPeMo4Eraq9;nNrmM;in3;du,teBu;cHil5;aVeUhTiRoOuNéquilM;ib2;et,ni;bliDBeuv2l3piErM;dF1iM;en4;g6nMré;car6téres7;abCWonoIydra4éri4;mpa2rtA7spé2;bu7ffec4pprobaBArE7;aNiDToMég5;bé,uC;ci6ng6E;aTeRlPoNrM;aDPeCMim3;itraCOli,r4uM;il5rvu;aMoAJ;cé,iD;i0nMup5;aCJda0;rMs7;eCHte4S;aMuDJ;tu2;eOoNuM;ni;dé,n4raBT;ntMsu2;!iM;!el;aNiM;bé2cCPnq54ra0é;b2is7vé;ncH;aBEingD6ling9oPrOuNéM;né2;enC2i7;ad3os5A;nf5uMût3;li8GrA0tC;aQenPiNoMraîcC7u0éC5;n8Jrm3;c3Igu2niM;!t8;du,s8;iNvoM;ri7;lEt;aYeXhTiSla2oOrMulot4éCT;iMo9LépK;t,é;lOmpo7nNrASuM;pé,rag59su,ve21;cerCtrac4;le4o2;dé,s8;aOiMu;qMr3;ue4;r6us7î6;nt,va0;de0lé;aNorD5rMuC;aBBiCE;rq9ucH;bitBVc1rMve4;!ci;aco89es7oMu;g9it;du,le0mPn6rOté,uM;a4Yb5iMé;llAU;ma0s1é;inMp4;a2Iic1;a0Fcta0Dffér0Cg0Al08m07plôCCr06sPt,vM;erNiMor7K;n,sé;ge0t8S;cZgracJjoi0lYpWqual4LsStM;a0enQinOrM;aMib9;it,ya0;ctMg9;!if;du;iOolNéM;mi6;u,va0;de0mul26pé;aMer7o7ropor2Ju4;ru;oq9;iNoMrA8;nti63rC9;pli6;ect11ig41;ensB4in9;a4iM;ge0;eMit1;st8;e0é;toM;ri1;gMma4Q;on1;mRntQr3XsM;cOsa5tM;i6rM;uc8G;enBSript8;e5é;eu2i;ctylogra6Xlto6YmMnD;as7né;a3Me3Ih2Wi2Tl2Lo07rTuOyclNâlAéréMô46;a8Bbr1;opéF;baAiNltMrADta6;iAQurG;rNsMt,v2;a0i6;as7;aXiVoRuPéM;atNne5pM;iCu;eBif;!ciMel;al,fJ;cOisNq2Dt4uMya0;la0stAL;sa0é;hu;a5HminGstaM;llA;int8moi2JquM;a0e5;c1Ydé,gn72hé9Fi1Xl1Sm1Dn00opér9UquZrSsQté,uM;cHl4Jp3rNsu,tumiLveM;rt;bé,on6tMu;!aN;su,taM;ud;di1n45pPrMsé,t7CéF;eMi8Aos8;ctMsponAS;!eBio9Q;orNuM;le0;at8el;et,in;!c0Td0Rf0Kg0Hj0Gnu,quéIs05tTvMçu;aReNiMulsAB;vi1;nNrM;ge0ti;tMu;io9FuG;inc4Kl96;eTiRoQrM;aNit,ovM;er7;ctMi0ri3s4;uGé;ur6;gu,nM;e0Qge0uG;mpNnM;t,u;l8XoM;raA;ac2cVeTiSolQtOéM;cut8qM;ue0;a0ern3ituMru0T;a0t8Wé;aMi97;nt,teB;g6sC;nCrvM;a6Gé;ie0;oi0ug1;eNénM;it1;lé,sU;iPlicYond3SrM;aMon4;teM;rnG;a0dMné,r93sq9t;enM;tiG;am6iMuc63;ti9N;eOilNl0Ior9Er7CuM;pis87r7R;ia0;nt2pMr4;tuG;bZmVpMé6B;aTen7lSoPrNuls8éM;te0;es7i8QometCéheM;ns8;rteMs3;meM;nt1;aiDet,iq9;ct,r6Cs7t53;an89eNun1VémM;or7R;n75rM;ci1ça0;atCi6lé;lNoM;ni1ré,ss1;aNeMégi1;ct8;nt,t0X;!f45n3I;ardiLh5Hu;aQiPoNéM;me0r54;is8TuMît2;té,é;gnoCma45nqNqueC;irNndestAqMs7;ua0;!on34se80;nNrconspe8Gse5tMvil6B;adAé;gl3t2;aYeViToQréPuchoCâNéM;ri,t8;taA;ta0;tiF;cola4iNqu3r1uMyé;ca2I;si;a0ffMliFrurg4M;on6ré;nu,rNveM;lu;!c62;grAm1UnSpeau4rOs7to30uM;d,fMs7;fa0;bOgé,mNnM;el,u;a0eB;onU;ceEgMta0;ea0é;nOrM;né,tMv47;ifJ;d2sé,tr1;botAch04de03l02mYnne5outchou4pWrOsMtal5YuDva4B;aMq9s3till5X;niL;aRcQd7NesDiPmi6nNré,téM;siF;asMé;siL;ca3Et68;ér1;ctériMmé51;el,sé;itMt8;al,on6;bNpagMé;na1K;odMré;giF;ci6ifor2Eé;n1Xt;otMé;tiL;a14e10i0Sl0Mo07rVuUyzaTâRéNêM;c52ta;aOdouAga20nMt77;iMédictA;n,t;nt,t;cHtM;a16i;ntA;cc1ri6té;aUeTiSoPuMési1Oûl3;isDnNtMya0;!al;!i;cHdé,nzé,uMyé;illMteB;on,é;dé,lEnguebaEsa0;ss4Vt3Cve4;ilNnM;cHla0;la0S;i7mbZnXr6ssWt4uMvA;cUdTffSillRlQrMs4Lt6M;d0Eguign36rOsM;iLoM;uf5;u,é;evers3ot;a0i,on0W;a0eBi,on;eBi6;hé,lé;e5u;!dMna0F;isDé;ar5Bé;aPeNin5AoM;nd,q9t33;ss3t,uM;!i,té;fa08ncMsé;!hi5S;enQgPrm46sM;corNeM;xuG;nu;ar2;-ai59fNsMve52;éa0;aiD;auOdNlligéIrceBsMur2;ti1;on08;!cer2C;fo9gZlVnTptism1rRsQtMvaU;aNtM;a0u;ilM;leB;a6é;bMio5ré;a0e5ou3Iu;c1d3lieusaMni;rd;aOeinNlMza2L;a0on6;iLé;deBnY;arMué;reB;b4Rc42d3Pf3Bg32hu31i2Wj2Ul2Am21n1Cp12r0Qs0Ct00uWvOzu2érMî6;iFoMé;nav1por4;aRePiOoMé2;isiMr4ué;na0;l0Zné,sé;nMr1ZugE;a0tu2;c39nMrJ;cé;d0Sr20straOtMvergn3G;oMrichiF;colEma0Bri7;liF;héWroVtM;aTePiOrMén9;aMib9;ya0;ra0t2;i0nM;dNtiM;f,on6;r0Iu;b5cHr3O;phJ;niF;cYeWo0QpVsNtrM;al,ei0;assinSerRiQoMu2y1T;cJifOm1Yr1CuM;pi,rM;di43;fé;du,mi5s4é1L;vi;!é;hyxJir3;pMx9;ti7;en3Y;chitecWdVgentUméTq9rOtiMyF;cu5fiMsan1;ciG;aOiNoMê4;ga0n01sé;vé,é2;cHn28;hé;!niF;in,é;e0u;tur1;aiDeu2la0PpNérM;it8;a1XlSrOuNétM;isD;yé;oMê4;fonNprJu2Mxim28;ié;di;iq9;al,c08dal07g01imZkylo7nWoVtM;iOéM;diluviFrM;ieB;aé0RcOdéraNsoM;ci1;pa0;iNlérM;ic1;pé;dArm1;e5onciaNuM;el,lé;teB;aMé;liL;lo-NoiM;ss3;aNsaxM;on;méM;ri10;ou;esMiFré;tr1;aig0LbSer,iRorQpPuDéM;lio2riM;caAnM;diF;ou5u4;ti;!c1nci2D;iMré,uE;a0gu;a02c00eZgéXig6lRpAsaQtNvM;éo5;ernNiLé2;er;at8é;ciF;ePié,onOuNéM;cha0;mé,s8;gé;maM;nd;riF;en;r4xandrAz0B;alAooM;li7;ngNrM;ma0;ui;ouMus4;ré,té;gMlé,m3sé;rNuM;!i7;elMi;et;ri1J;aTenRi4oniDrePuM;erNicM;heB;ri;ss8;té;ouM;il5;ça0;fPghOriM;caA;in;an;aSeRilQliPol3rNéM;re0;ancMioE;hi;gea0;ié,é;ct0S;iMmé;bMré;li;dVhéTjaSmiQoOroKéM;quM;at;lMpt0L;esO;nistrMrM;at8;ce0;re0s8;if;itM;ioM;nnG;cWhRidu5tNé2;ré;iNuG;el;f,vé;lé;aNeM;vé;lMr6;anM;dé;abl3ent9identXoTrPuM;eMsé;ilE;la0;oMu;chMupi;eBé;ur;mNrt,utuM;mé;mo00pM;ag6li;el,é;ué;a02dom00erIjeXoVrRsNusM;if,é;e0oNtraK;it;lu,rb3;a0é;acadabIuM;pt,tiM;!sD;sa0;li,nM;da0;ct;ra0;nt;in1;al;is7ndNtM;tu;on6;né;sé",
    "FemaleName": "true¦0:FU;1:FY;2:FN;3:F9;4:F8;5:FO;6:EN;7:EL;8:EV;9:GB;A:G7;B:E1;C:G4;D:FK;E:FH;F:EC;aDZbD2cB5dAGe9Ef8Zg8Gh82i7Rj6Tk5Zl4Nm37n2So2Pp2Equ2Dr1Ns0Pt03ursu6vUwOyLzG;aJeHoG;e,la,ra;lGna;da,ma;da,ra;as7DeHol1SvG;et7onB6;le0sen3;an8endBLhiB1iG;lInG;if39niGo0;e,f38;a,helmi0lGma;a,ow;aLeIiG;ckCZviG;an9VenFX;da,l8Unus,rG;a,nGoniD0;a,iDA;leGnesE9;nDIrG;i1y;aSePhNiMoJrGu6y4;acG0iGu0E;c3na,sG;h9Lta;nHrG;a,i;i9Iya;a5IffaCFna,s5;al3eGomasi0;a,l8Fo6Xres1;g7To6WrHssG;!a,ie;eFi,ri9;bNliMmKnIrHs5tGwa0;ia0um;a,yn;iGya;a,ka,s5;a4e4iGmC9ra;!ka;a,t5;at5it5;a05carlet2Ye04hUiSkye,oQtMuHyG;bFGlvi1;e,sHzG;an2Tet7ie,y;anGi9;!a,e,nG;aEe;aIeG;fGl3DphG;an2;cF5r6;f3nGphi1;d4ia,ja,ya;er4lv3mon1nGobh74;dy;aKeGirlBKo0y6;ba,e0i6lIrG;iGrBOyl;!d6Z;ia,lBT;ki4nIrHu0w0yG;la,na;i,leAon,ron;a,da,ia,nGon;a,on;l5Yre0;bMdLi8lKmIndHrGs5vannaE;aEi0;ra,y;aGi4;nt5ra;lBLome;e,ie;in1ri0;a02eXhViToHuG;by,thBI;bQcPlOnNsHwe0xG;an92ie,y;aHeGie,lC;ann9ll1marBDtB;!lGnn1;iGyn;e,nG;a,d7V;da,i,na;an8;hel53io;bin,erByn;a,cGkki,na,ta;helBWki;ea,iannDUoG;da,n12;an0bIgi0i0nGta,y0;aGee;!e,ta;a,eG;cAPkaE;chGe,i0mo0n5EquCAvDy0;aC9elGi8;!e,le;een2ia0;aMeLhJoIrG;iGudenAU;scil1Uyamva8;lly,rt3;ilome0oebe,ylG;is,lis;arl,ggy,nelope,r6t4;ige,m0Fn4Oo6rvaB8tHulG;a,et7in1;ricGsy,tA7;a,e,ia;ctav3deHfATlGphAT;a,ga,iv3;l3t7;aQePiJoGy6;eHrG;aEeDma;ll1mi;aKcIkGla,na,s5ta;iGki;!ta;hoAZk8AolG;a,eBE;!mh;l7Rna,risF;dIi5OnHo23taG;li1s5;cy,et7;eAiCL;a01ckenz2eViLoIrignayani,uriBDyG;a,rG;a,na,tAP;i4ll9VnG;a,iG;ca,ka,qB1;a,chOkaNlJmi,nIrGtzi;aGiam;!n8;a,dy,erva,h,n2;a,dIi9HlG;iGy;cent,e;red;!e6;ae6el3G;ag4JgKi,lHrG;edi60isFyl;an2iGliF;nGsAJ;a,da;!an,han;b08c9Cd06e,g04i03l01nZrKtJuHv6Qx86yGz2;a,bell,ra;de,rG;a,eD;h73il8t2;a,cSgOiJjor2l6Gn2s5tIyG;!aGbe5PjaAlou;m,n9P;a,ha,i0;!aIbAIeHja,lCna,sGt52;!a,ol,sa;!l06;!h,m,nG;!a,e,n1;arIeHie,oGr3Kueri7;!t;!ry;et3IiB;elGi5Zy;a,l1;dGon,ue6;akranBy;iGlo36;a,ka,n8;a,re,s2;daGg2;!l2W;alCd2elGge,isBDon0;eiAin1yn;el,le;a0Ie08iWoQuKyG;d3la,nG;!a,dHe9PnGsAN;!a,e9O;a,sAL;aAYcJelIiFlHna,pGz;e,iB;a,u;a,la;iGy;a2Ae,l25n8;is,l1GrHtt2uG;el6is1;aIeHi9na,rG;a6Yi9;lei,n1tB;!in1;aQbPd3lLnIsHv3zG;!a,be4Jet7z2;a,et7;a,dG;a,sGy;ay,ey,i,y;a,iaIlG;iGy;a8De;!n4E;b7Rerty;!n5P;aNda,e0iLla,nKoIslAOtGx2;iGt2;c3t3;la,nGra;a,ie,o4;a,or1;a,gh,laG;!ni;!h,nG;a,d4e,n4L;cNdon7Qi6kes5na,rMtKurIvHxGy6;mi;ern1in3;a,eGie,yn;l,n;as5is5oG;nya,ya;a,isF;ey,ie,y;aZeUhadija,iMoLrIyG;lGra;a,ee,ie;istGy5A;a,en,iGy;!e,n46;ri,urtn97;aMerLl96mIrGzzy;a,stG;en,in;!berlG;eGi,y;e,y;a,stD;!na,ra;el6NiJlInHrG;a,i,ri;d4na;ey,i,l9Ns2y;ra,s5;c8Ti5WlOma6nyakumari,rMss5KtJviByG;!e,lG;a,eG;e,i75;a5DeHhGi3NlCri0y;ar5Ber5Bie,leDr9Cy;!lyn70;a,en,iGl4Tyn;!ma,n30sF;ei6Zi,l2;a04eVilToMuG;anKdJliGst55;aHeGsF;!nAt0W;!n8U;i2Qy;a,iB;!anLcelCd5Uel6Yhan6GlJni,sHva0yG;a,ce;eGie;fi0lCph4W;eGie;en,n1;!a,e,n34;!i0ZlG;!i0Y;anLle0nIrHsG;i5Osi5O;i,ri;!a,el6Mif1QnG;a,et7iGy;!e,f1O;a,e6ZiHnG;a,e6YiG;e,n1;cLd1mi,nHqueliAsmin2Svie4yAzG;min9;a9eHiG;ce,e,n1s;!lGsFt06;e,le;inHk2lCquelG;in1yn;da,ta;da,lPmNnMo0rLsHvaG;!na;aHiGob6R;do4;!belGdo4;!a,e,l2E;en1i0ma;a,di4es,gr5O;el8ogG;en1;a,eAia0o0se;aNeKilHoGyacin1M;ll2rten1G;aHdGlaH;a,egard;ry;ath0ViHlGnrietBrmiAst0V;en22ga;di;il72lKnJrGtt2yl72z6A;iGmo4Eri4F;etG;!te;aEnaE;ey,l2;aXeSiNlLold11rIwG;enGyne17;!dolC;acieHetGisel8;a,chD;!la;adys,enGor3yn1X;a,da,na;aJgi,lHna,ov6ZselG;a,e,le;da,liG;an;!n0;mYnIorgHrG;ald35i,m2Stru71;et7i0;a,eGna;s1Mvieve;briel3Fil,le,rnet,yle;aReOio0loMrG;anHe8iG;da,e8;!cG;esHiGoi0G;n1s3U;!ca;!rG;a,en42;lHrnG;!an8;ec3ic3;rHtiGy9;ma;ah,rah;d0FileDkBl00mUn48rRsMtLuKvG;aIelHiG;e,ta;in0Ayn;!ngel2H;geni1la,ni3Q;h50ta;meral8peranJtG;eHhGrel6;er;l2Pr;za;iGma,nest29yn;cGka,n;a,ka;eJilImG;aGie,y;!liA;ee,i1y;lGrald;da,y;aTeRiMlLma,no4oJsIvG;a,iG;na,ra;a,ie;iGuiG;se;a,en,ie,y;a0c3da,nJsGzaH;aGe;!beG;th;!a,or;anor,nG;!a;in1na;en,iGna,wi0;e,th;aVeKiJoGul2T;lor4Zminiq3Wn2ZrGtt2;a,eDis,la,othGthy;ea,y;an08naEonAx2;anObNde,eMiLlImetr3nGsir4S;a,iG;ce,se;a,iHla,orGphiA;es,is;a,l5H;d0Grd0G;!d4Lna;!b2CoraEra;a,d4nG;!a,e;hl3i0mMnKphn1rHvi1XyG;le,na;a,by,cHia,lG;a,en1;ey,ie;a,et7iG;!ca,el1Bka;arGia;is;a0Re0Nh05i03lUoJrHynG;di,th3;istGy05;al,i0;lOnLrHurG;tn1E;aId27iGn27riA;!nG;a,e,n1;!l1S;n2sG;tanGuelo;ce,za;eGleD;en,t7;aIeoHotG;il4A;!pat4;iKrIudG;et7iG;a,ne;a,e,iG;ce,sY;re;a4er4ndG;i,y;aPeMloe,rG;isHyG;stal;sy,tG;aHen,iGy;!an1e,n1;!l;lseHrG;i9yl;a,y;nLrG;isJlHmG;aiA;a,eGot7;n1t7;!sa;d4el1NtG;al,el1M;cHlG;es7i3D;el3ilG;e,ia,y;iYlXmilWndVrNsLtGy6;aJeIhGri0;erGleDrCy;in1;ri0;li0ri0;a2EsG;a2Die;a,iMlKmeIolHrG;ie,ol;!e,in1yn;lGn;!a,la;a,eGie,y;ne,y;na,sF;a0Ci0C;a,e,l1;isBl2;tlG;in,yn;arb0BeXianWlVoTrG;andRePiIoHyG;an0nn;nwCok9;an2LdgKg0GtG;n25tG;!aHnG;ey,i,y;ny;etG;!t9;an0e,nG;da,na;i9y;bbi9nG;iBn2;anGossom,ythe;ca;aRcky,lin8niBrNssMtIulaEvG;!erlG;ey,y;hHsy,tG;e,i0Yy9;!anG;ie,y;!ie;nGt5yl;adHiG;ce;et7iA;!triG;ce,z;a4ie,ra;aliy28b23d1Kg1Gi18l0Rm0Mn00rVsMthe0uIva,yG;anGes5;a,na;drIgusHrG;el3;ti0;a,ey,i,y;hHtrG;id;aKlGt1P;eHi9yG;!n;e,iGy;gh;!nG;ti;iIleHpiB;ta;en,n1t7;an19elG;le;aYdWeUgQiOja,nHtoGya;inet7n3;!aJeHiGmI;e,ka;!mGt7;ar2;!belHliFmT;sa;!le;ka,sGta;a,sa;elGie;a,iG;a,ca,n1qG;ue;!t7;te;je6rea;la;!bHmGstas3;ar3;el;aIberHel3iGy;e,na;!ly;l3n8;da;aTba,eNiKlIma,ta,yG;a,c3sG;a,on,sa;iGys0J;e,s0I;a,cHna,sGza;a,ha,on,sa;e,ia;c3is5jaIna,ssaIxG;aGia;!nd4;nd4;ra;ia;i0nHyG;ah,na;a,is,naE;c5da,leDmLnslKsG;haElG;inGyW;g,n;!h;ey;ee;en;at5g2nG;es;ie;ha;aVdiSelLrG;eIiG;anLenG;a,e,ne;an0;na;aKeJiHyG;nn;a,n1;a,e;!ne;!iG;de;e,lCsG;on;yn;!lG;iAyn;ne;agaJbHiG;!gaI;ey,i9y;!e;il;ah",
    "Month": "true¦a6déc4févr3j1ma0nov4octo5sept4;i,rs;anv1ui0;llet,n;ier;em0;bre;out,vril",
    "Country": "true¦0:3I;1:2Q;a31b2Hc25d21e1Tf1Ng1Ch1Ai13j10k0Yl0Tm0Fn04om3MpZqat1KrXsKtCu6v4wal3yemTz2;a28imbabwe;es,lis and futu33;a2enezue38ietnam;nuatu,tican city;.5gTkrai3Cnited 3ruXs2zbeE;a,sr;arab emirat0Jkingdom,states2;! of amer31;k.,s.2; 2Ba.;a7haBimor-les0Ao6rinidad4u2;nis0rk2valu;ey,me37s and caic1X; and 2-2;toba1N;go,kel0Znga;iw35ji2nz31;ki33;aCcotl1eBi8lov7o5pa2Gri lanka,u4w2yr0;az2ed9itzerl1;il1;d30isse,riname;lomon1Zmal0uth 2;afr2LkKsud2Y;ak0en0;erra leo2Rn2;gapo2Lt maart2;en;negJrb0ychellX;int 2moa,n marino,udi arab0;hele2Aluc0mart24;epublic of ir0Dom2Mussi27w2;an2B;a3eGhilippinSitcairn1Oo2uerto riL;l1rtugD;ki2Ll3nama,pua new0Xra2;gu5;au,esti2F;aAe8i6or2;folk1Mth3w2;ay; k2ern mariana1G;or0R;caragua,ger2ue;!ia;p2ther1Dw zeal1;al;mib0u2;ru;a6exi5icro0Co2yanm06;ldova,n2roc4zamb9;a3gol0t2;enegro,serrat;co;c9dagasc01l6r4urit3yot2;te;an0i1A;shall10tin2;iq1R;a3div2i,ta;es;wi,ys0;ao,ed05;a5e4i2uxembourg;b2echtenste16thu1P;er0ya;ban0Lsotho;os,tv0;azakh1Oe2iriba07osovo,uwait,yrgyz1O;eling0Onya;a2erH;ma19p2;an,on;c7nd6r4s3tal2vory coast;ie,y;le of m1Irael;a2el1;n,q;ia,oJ;el1;aiVon2ungary;dur0Qg kong;aBeAha0Uibralt9re7u2;a5ern4inea2ya0T;!-biss2;au;sey;deloupe,m,tema0V;e2na0R;ce,nl1;ar;orgie,rmany;bVmb0;a6i5r2;ance,ench 2;guia0Hpoly2;nes0;ji,nl1;lklandVroeV;ast tim8cu7gypt,l salv7ngl1quatorial5ritr6s3t2;ats unis,hiop0;p0Mt2;on0; guin2;ea;ad2;or;enmark,jibou4ominica3r con2;go;!n B;ti;aAentral african 9h7o4roat0u3yprRzech2; 8ia;ba,racao;c3lo2morQngo-brazzaville,okFsta r02te d'ivoi05;mb0;osD;i2ristmasG;le,nS;republic;m2naVpe verde,yman9;bod0ero2;on;aGeChut06o9r4u2;lgar0r2;kina faso,ma,undi;az5etXitish 2unei,és5;virgin2; is2;lands;il;liv0naiOsnia and herzegoviHtswaHuvet2; isl1;and;l2n8rmuH;ar3gi2ize;qLum;us;h3ngladesh,rbad2;os;am3ra2;in;as;fghaKlFmeriDn6r4ustr2zerbaijM;ali2ia;a,e;genti2men0uba;na;dorra,g5t2;arct3igua and barbu2;da;ica;leter3o2uil2;la;re;ca,q2;ue;b4ger0lem2;ag2;ne;an0;ia;ni2;st2;an",
    "Region": "true¦a20b1Sc1Id1Des1Cf19g13h10i0Xj0Vk0Tl0Qm0FnZoXpSqPrMsDtAut9v5w2y0zacatec22;o05u0;cat18kZ;a0est vir4isconsin,yomi14;rwick1Qshington0;! dc;er2i0;ctor1Sr0;gin1R;acruz,mont;ah,tar pradesh;a1e0laxca1Cusca9;nnessee,x1Q;bas0Jmaulip1PsmI;a5i3o1taf0Nu0ylh12;ffUrrZs0X;me0Zno19uth 0;cRdQ;ber1Hc0naloa;hu0Rily;n1skatchew0Qxo0;ny; luis potosi,ta catari1H;a0hode6;j0ngp01;asth0Lshahi;inghai,u0;e0intana roo;bec,ensVreta0D;ara3e1rince edward0; isT;i,nnsylv0rnambu01;an13;!na;axa0Mdisha,h0klaho1Antar0reg3x03;io;ayarit,eAo2u0;evo le0nav0K;on;r0tt0Qva scot0W;f5mandy,th0; 0ampton0P;c2d1yo0;rk0N;ako0X;aroli0U;olk;bras0Wva00w0; 1foundland0;! and labrador;brunswick,hamp0Gjers0mexiIyork state;ey;a5i1o0;nta0Mrelos;ch2dlanAn1ss0;issippi,ouri;as geraFneso0L;igPoacP;dhya,harasht03ine,ni2r0ssachusetts;anhao,y0;land;p0toba;ur;anca03e0incoln03ouis7;e0iG;ds;a0entucky,hul09;ns07rnata0Cshmir;alis0iangxi;co;daho,llino1nd0owa;ia04;is;a1ert0idalDun9;fordS;mpRwaii;ansu,eorgVlou4u0;an1erre0izhou,jarat;ro;ajuato,gdo0;ng;cesterL;lori1uji0;an;da;sex;e3o1uran0;go;rs0;et;lawaDrbyC;a7ea6hi5o0umbrG;ahui3l2nnectic1rsi0ventry;ca;ut;iLorado;la;apDhuahua;ra;l7m0;bridge2peche;a4r3uck0;ingham0;shi0;re;emen,itish columb2;h1ja cal0sque,var1;iforn0;ia;guascalientes,l3r0;izo1kans0;as;na;a1ber0;ta;ba1s0;ka;ma",
    "Honorific": "true¦aPbrigadiOcHdGexcellency,fiBjudge,king,liDmaAofficOp6queen,r3s0taoiseach,vice5;e0ultK;c0rgeaC;ond liAretary;abbi,e0;ar0verend; adK;astGr0;eside6i0ofessF;me ministFnce0;!ss;gistrate,r4yC;eld mar3rst l0;ady,i0;eutena0;nt;shB;oct6utchess;aptain,hance4o0;lonel,ngress1un0;ci2t;m0wom0;an;ll0;or;er;d0yatullah;mir0;al",
    "Infinitive": "true¦0:N1;1:MX;2:MM;3:KD;4:JO;5:N0;6:LF;7:LO;8:MZ;9:M9;A:JX;B:LS;C:EK;D:MP;E:MB;F:LR;aJKbIIcFSdD6eBHfAHgA2h9Ti94j8ZkidnaLZl8Nm81n7Uo7Jp64qu62r2Os1Nt0Pu0Nv0BéGêt2ôt0;b06cYdu3g6DjeJ6lWmouL0nVpQquOtKvG;aIeHit0oG;lu0qu0;i7nt84;cu0lu0n2W;aIeALoGr2Ou47;nn0uG;ff0rd1;bl1l0;aLNiG;p0vaB3;aIel0iHlu4oGroMUu6;ng0us0;er,ngl0;iDSn2MrG;gn0pi7;e7Cum9;aGev0imAoiME;bKRgu0rg1;arMhJlHoGras0;nom6p0r4ut0;aGips0o2;irC0t0;aHoG;ir,u0;ng0pp0uID;qLBt0;aHl29rG;uCé4;h1uG;b1d1;aPeMiJoHromb1éGêt1;g8Jn9riKF;iGl0m1t0uAGyDO;l0r;d0eiEol0r0sGv2;er,iG;o8t0;i7nHrGx0;d1n1roKYs0;g0ir;g1inc2lGnt0;o1s0;i2n1rGs0tEP;g0in0;a08e04i01oYrKuJâIéG;léGt0;chaDEg5Tphon0;ch0t0;er,tJL;aMeKiIoGu3ébu4;mp0ttGuv0;er,in0;cGmbal0n3omph0;h0ot0;mGssaiE;bl0p0;cLfi3h1it0nIqu0vGînL;ai7eG;rs0st1;ch0sG;fGg7Lir,poFG;o7Rè2ér0;a5er;l9mb0p0rHuG;ch0rn0ss0;ch0tLD;rHsGtub0éd1;s0t2;ai7er;mpHTnEMrGst0;giveDFmAn1rG;er,iG;fi0r;bJch0iIpHrGss0;d0ir,t1;er,ir,ot0;ll0re;a5l0;a09c08e06hoFQi03oWtTuIyHéG;ch0jouJBp45v1;mpath6nchron6;bPccOer,ffNgg9iMpKrGspeGW;enchEHf0g1ir,moFpa5sIvG;eGol0;i7n1;aJCeo1;erv6pG;li0oEPr95;c6Bv2;i2o3;o9Véd0;ir,stiE4ve6S;aHimGQoGupéf8B;ck0pp0;bD9tI0;iK7ll7UmLnKrt1uGûl0;ci0d2ffIhaClHpGrd2s-est8WtDvD;er,ir0ço8;ag0ev0iK4;l0r1;d0g0n0;br0m0;gnHlFRmGrF2tu0ég0;pIEul0;al0er;cou37mGnt1o1rCQvr0;bl0er;a8e7rIQ;bLcKiJlInctHMoGAuHvoG;ir,ur0;pou9ErFVt0v0;er,ir,u0;gn0ll1s1;cBFriI5;ot0r0;a24e07hA9i06o04u03éHêv0ôG;d0t1;a00cXdD0eVfUgTinRjQpNquisitHDsKtIuHvG;ei7is0oDBél0;n1ss1;aIXrG;éc1;e4DiHoud2uG;lt0m0;d0gn0st0;aGroJNuJDét0;nd2rG;er,t1;ou1;sta7tGvest1;èg2égr0;al0ir,l0n0;léBugi0;nvah1ss9ExG;amApé0L;apitFJhaHit0lJ5oGup9;lt0m1Inci4A;pp0uF8;g1l6n7Qp8Bs9Q;g1in0;id1s1uG;g1ir,l0s4Avr1;gETm0poHQre,s3;-1Bb1Ac10d0Tf0Rg0Mj0Ll0Jm0Bn07p00quCSreZsQtLvG;a7CeHoGêt1;ir,m1u7B;nHrG;d1n1;di3ir;aF3enJir0oIrG;aGoIY;c0n4;mb0uHA;ir,t1;al1erv1pNsHtGurg1;aIViCC;aKeIoHuG;rg1scC;rt1uvD;mFTnt1rG;r0v1;is1ss0;eENir0leG5;m8Zs91;aKeGHlJoIrHè2éG;r0tr1;o4éseF;rt0s0u5;ac0i0;rGss0ît2;coH3l0t1;aC2cIdo12foAGi0oHseiI3tr0vGâ80;eALoy0;nc0uvC1;hBXonHK;aLbKerDOis0oJpHu0éG;di0;lGoFR;ac0ir;nt0r3;ouADr1D;iGFrG;i0qu0;aGev0â4;nc0x0y0;aiEet0ou0;aIrG;eHBimp0oG;ss1up0;gn0rG;d0n1;e45leGIo45rGus0;anBoid1;eKiffus0oIre5éG;couFGf10mG;aE2ol1;nn0rm1uG;bl0t0;maF2vG;en1o1;eFFhNlu2oIrHtiFQuG;eiEl0;oB7ut0ép1;mInHuG;p0r1vr1;quB2ve7W;mGpt0;aETeFD;aGer4;mp1rg0;lanBoETrou5ât1;pe1R;bo03cYdouc1fWgaillaHDiVjUlSmQnPpNqu0sKtIvGy0;al0iGo1;r,tC6;er,i5tG;a4rap0;er,sG;eGir,o7Jur0;mE5o1;eti5iéc0oiEXpG;el0oEJro4;c1g0im0;a5eGoEp0;n0r,ut0;eESlG;i0um0;e02oFE;d1re,so8;feGr7X;rm1;cHkeG3oG;nt0rn1;oGro4;mGu1E;mGCpaGB;nn1uEW;adri7eGiFXér1;re7stE0;a0Ne0Hhotog0Gi0El09o04rKuJâIéGê4;nB3r1tG;er,r1;l1t1;b1Bis0lvér6n1riEJ;ati3eXiWoPéGêt0ôn0;cMdéfLf9lev0mKoccup0pJsHvGétaFG;a4Ien1o1;eGid0um0;nt0rv0;ar0;un1;in1;iGonDYéd0;pCs0;cLfKgrJj46loEImInoE2p51steEGtHuv0vG;en1o3;eEKég0;en0ouDU;amm0e5;e5it0è2ér0;lFOur0éd0;er,s0v0;nd2sseG;nt1r;inJl1mp0rt0sIuG;rGss0vo1;cha5r1vo1;er,séd0t0;d2t0;aHeuGi0oE3;r0vo1;c0iHnG;er,iDQqu0t0;d0re,saF;g0ll0nc0queGss0étA;-ni3r;raphi0;iKlA7nJrGs0;ceHfDImett2sGve5V;iDXonnAHuBMév9;r,vo1;ch0s0;gn0n0;ct6lp0nLrIss0tGvA2y0ît2;aug0iGroE4;eFn0;achDRcoDVdo8f2Xi0l0tGvD;ag0iG;cD2r;i3s0;bMccLeu4CffJi1Omp2pIrHs0uGy0;bZrd1vr1ïr;do8gan6;p3Yè2ér0;eGiADr1;ns0;i2up0;jeAWl80sHteGé1;mp9n1;cuLeGtA;rv0;aLeKi8WoHégG;l7VoA5;iHmm0n-saCKtGuDGy0;er,iCU;rc1;ig0ttCFu9P;g0nt1r70vi70ît2;aUeQiOoJuHâ4éGêl0ûr1;dCfi0laCZpr6rCtamorph3I;g1ltipGn1rmEK;li0;b77diCMiJll1ntIqu0uG;ch0d2fGi7r1vo1;et0t0;er,r0;s1t1;j93nGs0;c1im6;nHsGtt2urtr1;seo1ur0;ac0di0er,tiG;o8r;gn0iLnJqD1rHsGt9Yudi2îtr6;sa7Qti3;chGi0qu0r0;aBIer;g0iGoeu3Bqu0;feCKpA6;gr1ntD;aOeNiKoIuHyn4â4éG;ch0gu0;i2tt0;c8Zg0ng0t1uG;ch0er;b9er,g8LmHquGre,ss0vr0;id0;er,it0;uA3v0;i5mHnGr64ss0v0;c0gu1;bAeF;aJeIoHuG;g0r0;i06u9D;t0ûn0;ct0iEun1;dentiBNe03gnBLmXnHrrCsG;ol0s1;cTdi3fQiti0oAVquiPsNtJvG;eGit0o3;nt0rGst1;s0t1;erHéG;re5;ag1ceD2f9rog0veG;n1rt1;iBRpGta7u6Oè2ér0;e97ir0;ét0;ilCElHoG;rm0;ig0éB;aBFlGo2Aulp0;in0u2;agAit0mKpG;a3FlIoHrG;im0ov6;rt3Us0;aFi3or0;e4Eob5L;nd2;aLeKi5oIuHypothé3ât0éG;be4BrCsC;ir,m0rl0;ch0nG;n1or0;nn1uA7;biGllucArc6Cu5ïr;ll0tG;er,u0;aRel0lPoOrIuHâ4è2éGên0;m1nér7Mr0s1;eBVid0ér1;aKiIoG;ss1uG;i7p0;ll0mGnB;ac0p0;nd1tt0v84;b0rg0uveAOût0;aGi5oriAF;c0nd0p1;gHlop0mbe3RrGspi7uBv0z0;aA3d0er,n1;er,n0;a0Ae07i04lZoQrJuIâ4éGêt0;lGr1;icC;ir,m0si7;aKeJi4VoHéGôl0;m1queF;iGtt0;d1ss0;do8in0;nBpp0teGy0îB;rn6;c6XnMrIuG;eB6i7Dl0rGt2;b1n1r0;cIfHmGti9W;e0Dul0;ai2;er,ir,lo2;cGd0;er,t93;aJeA9iIoHéG;ch1tr1;r1tt0;n3Wrt0;mb0n3tt0;a9Fch0gBHlHnGx0;a9Eir;er,m0;rHst95uillG;et0;m0r0t41;bri3cJiIlHn0rc1ti3OuGx0;f99ss0;lo1;bl1ll1re;ilCtB7;ff12m0TnXrr0sQxG;aOcNe36hib0iMorc6pHtGéc9O;a94ermArap6P;ir0lIo51rHu50éG;di0ri7N;im0;i3oG;it0r0s0;g0st0;it0us0;g9mAuc0;ba8GcKpJsItG;imeGourb1;nt,r;ay0uy0;ac0io8è2ér0;al6XoG;mAGrt0;c05d02fZgXhaARiWjaVlTnSorgueiEqu49rRsPtIvG;ah1elo9Ei0PoG;l0y0;aLe6WoALrGêt0;aIeGou88;pGr,tDvo1;os0;id0pGîn0;er88;m0ss0;eGuiv2;iA1vel1;eg9JiBôl0;o9Euy0;aGev0;c0id1;mb0;vr0;ag0enGlo17ouA9rai5ue6A;dr0;erHil0oGu1;nc0u1;m0r0;oHurG;c1er;lor1mm1Drm1;aKerJhHlo2ourG;ag0ir;aGér1;nt0în0;cl0;dr0i5;bLmJpG;ar0il0lHoGruFua7Mê4;i9Ert0;ir,oy0;eGén12;n0rd0;aGeEo0Nra5;ll0r1Bt2uG;ch0m0;ac0ec30o1KrG;ay0;a20e1Vi1Go1Cr1Au19ynamCéGîn0;amb5Kb11c0Pd0Nf0Jg0Dj0Bl09m06n05pYrWsOtKvG;eIiHoGêt1;il0r0;er,s0R;lo83rn1;aIeGou7N;ct0n1rGst0;mAr0;ch0i7;aKeIhHiGobé1un1épai06;gn0r0;abi7;mGng96sp9;pl1;ct8Cmo13sGvou0;soG;rt1;a7Div0oG;b0ul0;aLeKlIoGér1ê4;l1s0uG;i7r6O;ac0oG;r0y0;c0ns0;nn0rt1ss0;a6Li4o6O;aHe6KoGun1én03;l1n7W;nt2Brr0s3;e4LiGog0é0Z;mCvr0;eGou0;un0;aKlJoIroHuG;erp1is0st0;ss1;mm0u8I;ut1;g0rn1uB;aiEiIle6ZoHrG;aîB;nc0ul0;er,l0n1;i0oG;mmLu59;aQePhMid0lLoIrG;o4éG;p1t0;d0ll0nne42uG;p0rGvr1;ag0;ar0en4in0o2;aHiGo1;f29r0;rg0;rn0vo1;mp0pCt1;aJouIrHuG;s3t0;an4o6M;c3Jl0;ll0rG;qu0ra5;it0;p0rc1;aGe5;gu0mat6;mAnn0rIuG;bl0cGt0;h0ir;l27m1;aloTct0ffSrRsJvG;erHis0oGulS;rc0;g0t1;cKpIsHtG;a59inOri40;im3Eé3;eGos0ut0;rs0;oGut0;nGur1;ti3SvD;e,ig0;us0è2ér0;gu0;mJssHvG;a4Yen1in0o1;aXerGin0;r0t1v1;a4Be6X;i6Kns0;a1Ye1Uh1Fi1Bl17oUrLuIéG;d0lG;èb2ébr0;eiEisAlG;pabGt61;il6;aLeKiJoHéG;er,p1;iGqu0up1ît2;re,s0;er,re,ti3;us0v0;ch0mG;oGpo8;is1;exi4Yf0Rgn0i4El0Nm0BnLoKrrJt1uGût0;ch0d2l0p0rGvr1;bGir;at6Der;ig0;p9r6G;c03damn0fZgYnWquVsOtJvG;eGi0o3;n1rG;g0s0t1;a25eIi2Tou4IrG;aGevDi2Uôl0;ct0ri0;mpl0nGr,st0;ir,t0;aLeKid9oJtHuG;lt0;at0iG;tu0;l0mm0;i7nt1rv0;cr0;ér1;aGe1S;ît2;el0;eIiGroF;er,rGs3;e,m0;ct33ss0;eGo49éd0;n4Trt0vo1;bQmMpG;aJlIoHt0uG;ls0;rt0s0;i3ot0ét0;rGt1;er,o1;a2ReHuniG;er,qu0;nGrc0;c0t0;in0l0;lGmat0on6;ab39eG;ctGr;er,io8;fr0;aHi4RoGu2;re,u0ît2;meGp1qu0ss0;c0r;bl0rGt0;cGer;onGul0;ci2vD;aPeNiKoHronomGuchLér1;èt2é42;iHpGqu0;er,p0;r,s1;cHpG;ot0;an0;r4vG;au4ir;lo1mJnIrHss0to3FuG;ff0v1;g0ri0;c1g0t0;ai7;nHrGss0;n0ti2J;trG;al6;ch0lLmKnJpHre5sGus0;s0tr0;it0EtG;er,ur0;al6d1to8;briSp0;c0AmXt0;a05e04ienvDlZoTrLut0âJéGû4;er,nG;ir,éfiG;ci0;cl0ilGt1;lo8;aLiJoHuGûl0;i2n1s3;n4uiG;ll0r;cGdg0ll0s0;ol0;i2nGss0v0;ch0d1;i2mbaTnKrn0ss0tt0uGx0;cId0ffHg0iEm0rr0sG;cTi7;er,ir;h0l0;d1ir,n1;aJeIoHuGâm0êm1;ff0;nd1qu0tt1;ss0tt1u1;gu0nB;ct0;digeo8gaQiOlaNnn1pt6rrKsItt2vG;aGer;rd0;cGer;ul0;er,iG;cGr;ad0;nc0y0;gn0sG;er,s0;rr0;b2Xc2Cd27ff1Zg1Rh1Qi1Nj1Kl1Em14n0Xp0Dr09sWttPuMvGè2ér0;aKeIiHoG;ir,rt0u0;l1s0;nt2Zrt1uG;gl0l1;ch1l0nc0;gHtG;or6;meF;aLeKiJrHéG;nu0;ap0iG;bu0;r0s0éd1;l0n0Vrr1;ch0qu0rd0;pir0sGti3;aOeMi13oIuHé4;ch0;jett1m0r0;ci0ir,mIrt1uG;pGrd1v1;ir,l1;br1m0;mGo1rv1;bl0;g1iHssAvo1;in0;ll1n1;b0Bch1Jm0peFrG;aHiv0oGêt0;nd1s0;ch0ng0;a6erXitWlaVpGâl1;aReQlNoMrGuy0ât0;ivo6oIéGêt0;ci0heG;nd0;ch0foHuv0visG;io8;nd1;rt0;aHi3;qu0;ud1;l0saO;rHuG;vr1;ei7o1tD;n1t1;oy0;ceG;vo1;alys0esthéLnIo0OticHéaG;nt1;ip0;ihHoGul0;nc0;il0;si0;aNeMinc1oJpHus0éliG;or0;liG;fi0;ch1inHll1rG;c0t1;dr1;n0rr1;iGss0t1;gr1;angu1eKiJlHou17teGun1;rn0;er,oGum0;ng0;gn0meF;nt1rt0;oHuG;st0;ut0;d0gGm0nd2;r1u6;is0;ur1;enoLgrav0iKon1rHueG;rr1;aHe5iGé0;pp0;f0nd1;r,t0;ui7;ll0;aLeKiJol0rG;anBoFét0;nt0;ch1;ch0rm0;ct0rm1;d1iGl0;bl1;a02ir0miHoGre5vD;nn0pt0r0uc1;nGr0;isG;tr0;ariât2cKheJquHtG;iv0;iGér1;tt0;t0v0;aTeSlRoLroKuIéG;d0l9;è2ér0;eiEs0;ll1;ch0i2up1ît2;mHrd0st0urG;c1ir;mIpG;aGl1;gn0;od0;am0;pt0;bl0lm1;re;aMjLoKrIsGus0âtaOêt1îm0;orb0tD;en1;eGit0ut1ég0;uv0;l1rd0ut1;ur0;i5nJsG;ouG;rd1;ir;do8;nn0;ss0;er",
    "Person": "true¦ashton kutchSbRcMdKeIgastNhGinez,jEkDleCmBnettJoAp8r4s3t2v0;a0irgin maG;lentino rossi,n go3;heresa may,iger woods,yra banks;addam hussain,carlett johanssJlobodan milosevic,uB;ay romano,eese witherspoIo1ush limbau0;gh;d stewart,nald0;inho,o;a0ipJ;lmIris hiltD;prah winfrFra;essiaen,itt romnEubarek;bron james,e;anye west,iefer sutherland,obe bryant;aime,effers8k rowli0;ng;alle ber0itlBulk hogan;ry;ff0meril lagasse,zekiel;ie;a0enzel washingt2ick wolf;lt1nte;ar1lint0ruz;on;dinal wols1son0;! palm2;ey;arack obama,rock;er",
    "City": "true¦a2Yb28c1Yd1Te1Sf1Qg1Kh1Ci1Ajakar2Jk11l0Um0Gn0Co0ApZquiYrVsLtCuBv8w3y1z0;agreb,uri21;ang1Ve0okohama;katerin1Jrev36;ars3e2i0rocl3;ckl0Xn0;nipeg,terth0Y;llingt1Qxford;aw;a1i0;en2Jlni31;lenc2Wncouv0Hr2I;lan bat0Etrecht;a6bilisi,e5he4i3o2rondheim,u0;nVr0;in,ku;kyo,ronIulouC;anj25l15miso2Lra2C; haJssaloni0Z;gucigalpa,hr2Ql av0N;i0llinn,mpe2Dngi08rtu;chu24n2OpT;a3e2h1kopje,t0ydney;ockholm,uttga14;angh1Henzh1Z;o0Mv00;int peters0Wl3n0ppo1H; 0ti1D;jo0salv2;se;v0z0S;adV;eykjavik,i1o0;me,sario,t27;ga,o de janei19;to;a8e6h5i4o2r0ueb1Syongya1P;a0etor26;gue;rt0zn26; elizabe3o;ls1Irae26;iladelph21nom pe09oenix;r0tah tik1B;th;lerKr0tr12;is;dessa,s0ttawa;a1Jlo;a2ew 0;delVtaip0york;ei;goya,nt0Wpl0Wv1T;a6e5i4o1u0;mb0Nni0K;nt1sco0;u,w;evideo,real;l1Nn02skolc;dellín,lbour0T;drid,l5n3r0;ib1se0;ille;or;chest0dalXi10;er;mo;a5i2o0vBy02;nd0s angel0G;on,r0F;ege,ma0nz,sbZverpo1;!ss0;ol; pla0Iusan0F;a5hark4i3laipeda,o1rak0uala lump2;ow;be,pavog0sice;ur;ev,ng8;iv;b3mpa0Kndy,ohsiu0Hra0un03;c0j;hi;ncheMstanb0̇zmir;ul;a5e3o0; chi mi1ms,u0;stI;nh;lsin0rakliG;ki;ifa,m0noi,va0A;bu0SiltD;alw4dan3en2hent,iza,othen1raz,ua0;dalaj0Gngzhou;bu0P;eUoa,ève;sk;ay;es,rankfu0;rt;dmont4indhovU;a1ha01oha,u0;blRrb0Eshanbe;e0kar,masc0FugavpiJ;gu,je0;on;a7ebu,h2o0raioJuriti01;lo0nstanJpenhagNrk;gFmbo;enn3i1ristchur0;ch;ang m1c0ttagoL;ago;ai;i0lgary,pe town,rac4;ro;aHeBirminghWogoAr5u0;char3dap3enos air2r0sZ;g0sa;as;es;est;a2isba1usse0;ls;ne;silPtisla0;va;ta;i3lgrade,r0;g1l0n;in;en;ji0rut;ng;ku,n3r0sel;celo1ranquil0;la;na;g1ja lu0;ka;alo0kok;re;aBb9hmedabad,l7m4n2qa1sh0thens,uckland;dod,gabat;ba;k0twerp;ara;m5s0;terd0;am;exandr0maty;ia;idj0u dhabi;an;lbo1rh0;us;rg",
    "Place": "true¦aMbKcIdHeFfEgBhAi9jfk,kul,l7m5new eng4ord,p2s1the 0upJyyz;bronx,hamptons;fo,oho,under2yd;acifMek,h0;l,x;land;a0co,idDuc;libu,nhattK;a0gw,hr;s,x;ax,cn,ndianGst;arlem,kg,nd;ay village,re0;at 0enwich;britain,lak2;co,ra;urope,verglad0;es;en,fw,own1xb;dg,gk,hina0lt;town;cn,e0kk,rooklyn;l air,verly hills;frica,m5ntar1r1sia,tl0;!ant1;ct0;ic0; oce0;an;ericas,s",
    "Currency": "true¦$,aud,bScQdLeurKfJgbp,hkd,inr,jpy,kHlFnis,p8r7s3usd,x2y1z0¢,£,¥,ден,лв,руб,฿,₡,₨,€,₭,﷼;lotySł;en,uanR;af,of;h0t6;e0il6;k0q0;elM;iel,oubleLp,upeeL;e3ound0;! st0s;er0;lingH;n0soG;ceFn0;ies,y;e0i7;i,mpi6;n,r0wanzaByatB;!onaAw;ori7ranc9;!o8;en3i2kk,o0;b0ll2;ra5;me4n0rham4;ar3;ad,e0ny;nt1;aht,itcoin0;!s",
    "Cardinal": "true¦cinqDd7hCnBon8qu4s2tr0vingt,zero;e0ois;i6nD;e0ix,oixB;i4pt;a0in3;r8t0;or1re;eux,ix1ou0;ze;! 0;h1n0sept;euf;uit;!u0;an0;te",
    "Ordinal": "true¦cinquFd8hDnCon9qu4s2tr0uniHvingGzeroiH;e0oisiG;i7nE;e0iBoix4;i5pC;a0in4;r1t0;or2riA;an8;eu5ix1ou0;zi7; 0i6;h1n0sep4;euvi4;ui2;xi2;an0i1;ti0;ème",
    "Unit": "true¦bHceFeDfahrenheitIgBhertz,jouleIk8liGm6p4terEy2z1°0µs;c,f,n;b,e1;b,o0;ttA;e0ouceD;rcent,t8;eg7il0³,è9;eAlili8;elvin9ilo1m0;!/h,s;!b6gr1mètre,s;ig2r0;amme5;b,x0;ab2;lsius,ntimè0;tre1;yte0;!s",
    "MaleNoun": "true¦0:0L;a0Ab08c05d01eZfVgThiv04iPjOlieu,mKniv09pDr7s6t4v3é1;chel0Al1qui01tabl0Ivé0D;èQé0;en09égéta08;a1echniIrai8;b06rif,ux;ala0Ceg0tatis9;e1èg3és02;c3mbour0Cn1staura0E;de0forPouvel1;le0;en09ru1;te0;a5er4la3oli2r1;a1ofS;ti7;inWnW;fectiWspecA;ie0r1;apluie,le0teB;er,o3us1;i1ée;que;biOmeZuve0;eu,ournT;dRn1;itia1vestT;ti1;ve;estion1ouverL;naO;i2onctionn1;aMe0;le,nan1;ce0;au,n1space;dro6ga7registre0seigEtenCvirD;egré,o2évelop1;pe0;cu0nnDssi1;er;han2ommentaDréd1;it;ge0;at1ur1énéficiaA;eau;ccro9ffa8gré0ir,n5pprovisi3ttein2utomobi1venir;le;te;on1;ne0;im2n1;ée;al;ire;is1;se0;me1;nt",
    "Organization": "true¦0:43;a38b2Pc29d21e1Xf1Tg1Lh1Gi1Dj19k17l13m0Sn0Go0Dp07qu06rZsStFuBv8w3y1;amaha,m0Xou1w0X;gov,tu2Q;a3e1orld trade organizati3Y;lls fargo,st1;fie22inghou16;l1rner br3A;-m11gree2Zl street journ24m11;an halNeriz3Tisa,o1;dafo2Fl1;kswagLvo;bs,kip,n2ps,s1;a tod2Pps;es32i1;lev2Vted natio2S; mobi2Iaco bePd bMeAgi frida9h3im horto2Rmz,o1witt2U;shiba,y1;ota,s r Y;e 1in lizzy;b3carpen30daily ma2Uguess w2holli0rolling st1Ms1w2;mashing pumpki2Muprem0;ho;ea1lack eyed pe3Cyrds;ch bo1tl0;ys;l2s1;co,la m12;efoni07us;a6e4ieme2Enp,o2pice gir5ta1ubaru;rbucks,to2K;ny,undgard1;en;a2Ox pisto1;ls;few23insbu24msu1V;.e.m.,adiohead,b6e3oyal 1yan2U;b1dutch she4;ank;/max,aders dige1Dd 1vl2Z;bu1c1Shot chili peppe2Hlobst26;ll;c,s;ant2Sizno2C;an5bs,e3fiz22hilip morrBi2r1;emier24octer & gamb1Pudenti13;nk floyd,zza hut;psi25tro1uge08;br2Nchina,n2N; 2ason1Vda2D;ld navy,pec,range juli2xf1;am;us;a9b8e5fl,h4i3o1sa,wa;kia,tre dame,vart1;is;ke,ntendo,ss0K;l,s;c,st1Ctflix,w1; 1sweek;kids on the block,york08;a,c;nd1Rs2t1;ional aca2Co,we0P;a,cYd0N;aAcdonald9e5i3lb,o1tv,yspace;b1Knsanto,ody blu0t1;ley crue,or0N;crosoft,t1;as,subisO;dica3rcedes2talli1;ca;!-benz;id,re;'s,s;c's milk,tt11z1V;'ore08a3e1g,ittle caesa1H;novo,x1;is,mark; pres5-z-boy,bour party;atv,fc,kk,m1od1H;art;iffy lu0Jo3pmorgan1sa;! cha1;se;hnson & johns1Py d1O;bm,hop,n1tv;g,te1;l,rpol; & m,asbro,ewlett-packaSi3o1sbc,yundai;me dep1n1G;ot;tac1zbollah;hi;eneral 6hq,l5mb,o2reen d0Gu1;cci,ns n ros0;ldman sachs,o1;dye1g09;ar;axo smith kliYencore;electr0Gm1;oto0S;a3bi,da,edex,i1leetwood mac,oFrito-l08;at,nancial1restoU; tim0;cebook,nnie mae;b04sa,u3xxon1; m1m1;ob0E;!rosceptics;aiml08e5isney,o3u1;nkin donuts,po0Tran dur1;an;j,w j1;on0;a,f leppa2ll,peche mode,r spiegXstiny's chi1;ld;rd;aEbc,hBi9nn,o3r1;aigsli5eedence clearwater reviv1ossra03;al;ca c5l4m1o08st03;ca2p1;aq;st;dplLgate;ola;a,sco1tigroup;! systems;ev2i1;ck fil-a,na daily;r0Fy;dbury,pital o1rl's jr;ne;aFbc,eBf9l5mw,ni,o1p,rexiteeV;ei3mbardiJston 1;glo1pizza;be;ng;ack & deckFo2ue c1;roW;ckbuster video,omingda1;le; g1g1;oodriM;cht3e ge0n & jer2rkshire hathaw1;ay;ryG;el;nana republ3s1xt5y5;f,kin robbi1;ns;ic;bWcRdidQerosmith,ig,lKmEnheuser-busDol,pple9r6s3t&t,v2y1;er;is,on;hland1sociated F; o1;il;by4g2m1;co;os; compu2bee1;'s;te1;rs;ch;c,d,erican3t1;!r1;ak; ex1;pre1;ss; 4catel2t1;air;!-luce1;nt;jazeera,qae1;da;as;/dc,a3er,t1;ivisi1;on;demy of scienc0;es;ba,c",
    "FemaleNoun": "true¦ambulance,confiture,géolog1l0poule,rue;ibrair0utte;ie",
    "SportsTeam": "true¦0:1A;1:1H;2:1G;a1Eb16c0Td0Kfc dallas,g0Ihouston 0Hindiana0Gjacksonville jagua0k0El0Bm01newToQpJqueens parkIreal salt lake,sAt5utah jazz,vancouver whitecaps,w3yW;ashington 3est ham0Rh10;natio1Oredski2wizar0W;ampa bay 6e5o3;ronto 3ttenham hotspur;blue ja0Mrapto0;nnessee tita2xasC;buccanee0ra0K;a7eattle 5heffield0Kporting kansas0Wt3;. louis 3oke0V;c1Frams;marine0s3;eah15ounG;cramento Rn 3;antonio spu0diego 3francisco gJjose earthquak1;char08paA; ran07;a8h5ittsburgh 4ortland t3;imbe0rail blaze0;pirat1steele0;il3oenix su2;adelphia 3li1;eagl1philNunE;dr1;akland 3klahoma city thunder,rlando magic;athle0Mrai3;de0; 3castle01;england 7orleans 6york 3;city fc,g4je0FknXme0Fred bul0Yy3;anke1;ian0D;pelica2sain0C;patrio0Brevolut3;ion;anchester Be9i3ontreal impact;ami 7lwaukee b6nnesota 3;t4u0Fvi3;kings;imberwolv1wi2;rewe0uc0K;dolphi2heat,marli2;mphis grizz3ts;li1;cXu08;a4eicesterVos angeles 3;clippe0dodDla9; galaxy,ke0;ansas city 3nE;chiefs,roya0E; pace0polis colU;astr06dynamo,rockeTtexa2;olden state warrio0reen bay pac3;ke0;.c.Aallas 7e3i05od5;nver 5troit 3;lio2pisto2ti3;ge0;broncZnuggeM;cowbo4maver3;ic00;ys; uQ;arCelKh8incinnati 6leveland 5ol3;orado r3umbus crew sc;api5ocki1;brow2cavalie0india2;bengaWre3;ds;arlotte horAicago 3;b4cubs,fire,wh3;iteB;ea0ulR;diff3olina panthe0; c3;ity;altimore 9lackburn rove0oston 5rooklyn 3uffalo bilN;ne3;ts;cel4red3; sox;tics;rs;oriol1rave2;rizona Ast8tlanta 3;brav1falco2h4u3;nited;aw9;ns;es;on villa,r3;os;c5di3;amondbac3;ks;ardi3;na3;ls",
    "Pronoun": "true¦c2elle1il1j2moi,n0on,t,v0;ous;!s;!e",
    "Date": "true¦aujourd hui,demain,heir,weekend",
    "Expression": "true¦a02b01dXeVfuck,gShLlImHnGoDpBshAtsk,u7voi04w3y0;a1eLu0;ck,p;!a,hoo,y;h1ow,t0;af,f;e0oa;e,w;gh,h0;! 0h,m;huh,oh;eesh,hh,it;ff,hew,l0sst;ease,z;h1o0w,y;h,o,ps;!h;ah,ope;eh,mm;m1ol0;!s;ao,fao;a4e2i,mm,oly1urr0;ah;! mo6;e,ll0y;!o;ha0i;!ha;ah,ee,o0rr;l0odbye;ly;e0h,t cetera,ww;k,p;'oh,a0uh;m0ng;mit,n0;!it;ah,oo,ye; 1h0rgh;!em;la",
    "WeekDay": "true¦dimanche,jeu2lun2m0same2vend1;ar1erc0;re0;di"
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

    sommes: ['Copula', 'PresentTense'],
    êtes: ['Copula', 'PresentTense'],
    sont: ['Copula', 'PresentTense'],
    étions: ['Copula', 'PresentTense'],
    serez: ['Copula', 'PresentTense'],
    seront: ['Copula', 'PresentTense'],
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
        words[res.female] = 'FemaleAdjective';
        words[res.plural] = 'MaleAdjective';
        words[res.femalePlural] = 'FemaleAdjective';
      }
      if (tag === 'Cardinal') {
        words[w] = ['TextValue', 'Cardinal'];
      }
      if (tag === 'Ordinal') {
        words[w] = ['TextValue', 'Ordinal'];
      }
      if (tag === 'MaleNoun') {
        let p = methods$1.noun.toPlural(w);
        words[p] = 'PluralNoun';
      }
      if (tag === 'Infinitive') {
        // do future-tense
        let res = methods$1.verb.futureTense(w);
        Object.keys(res).forEach(k => {
          if (!words[res[k]]) {
            words[res[k]] = [tagMap[k], 'FutureTense'];
          }
        });
        // do present-tense
        res = methods$1.verb.presentTense(w);
        Object.keys(res).forEach(k => {
          if (!words[res[k]]) {
            words[res[k]] = [tagMap[k], 'PresentTense'];
          }
        });
        // do imperfect mood
        res = methods$1.verb.imperfect(w);
        Object.keys(res).forEach(k => words[res[k]] = 'Verb');
        // past-participle
        let out = methods$1.verb.pastParticiple(w);
        words[out] = 'PastParticiple';
      }
    });
  });

  let lexicon$1 = Object.assign({}, words, misc$1);
  // console.log(Object.keys(lexicon).length.toLocaleString(), 'words')
  // console.log(lexicon['suis'])
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
    model: {
      one: {
        lexicon: words$1
      }
    },
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

  // guess a plural/singular tag each noun
  const nounPlurals = function (terms, i, world) {
    let setTag = world.methods.one.setTag;
    let term = terms[i];
    let tags = term.tags;
    let str = term.implicit || term.normal || term.text || '';
    if (tags.has('Noun')) {
      if (tags.has('Pronoun') || tags.has('ProperNoun')) {
        return null
      }
      if (str.endsWith('s')) {
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
          let str = terms[i - back].normal;
          //look backwards for a pronoun
          if (terms[i - back].tags.has('Pronoun')) {
            if (pronouns.hasOwnProperty(str)) {
              return setTag([term], pronouns[str], world, false, '3-person-pronoun-' + str)
            }
          }
          //look backwards for a auxiliary verb - 'sont'
          if (terms[i - back].tags.has('Verb')) {
            if (auxiliaries.hasOwnProperty(str)) {
              return setTag([term], auxiliaries[str], world, false, '3-person-auxiliary-' + str)
            }
          }
        }
      }
    }
    return null
  };
  var verbForm$1 = verbForm;

  // better guesses for 'le/la/les' in l'foo
  const fixContractions = function (terms, i, world) {
    let term = terms[i];
    term.tags;
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
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction'], //allow 'a' to be a Determiner/Value
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
    });
  });

  // add some more
  Object.assign(toNumber, {
    cents: 100,
    milles: 1000,
    millions: 1000000,
    milliards: 1000000000,
  });

  const multiNums = {
    dix: true,//dix huit
    soixante: true,//soixante dix
    quatre: true,//quatre vingt
    mille: true//mille milliards
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
        // console.log(str)
      }
    }
    return { skip, add }
  };

  const parseNumbers = function (terms = []) {
    let sum = 0;
    let carry = 0;
    let minus = false;
    for (let i = 0; i < terms.length; i += 1) {
      let { tags, normal } = terms[i];
      let w = normal || '';

      // support 'quatre vingt dix', etc
      if (multiNums.hasOwnProperty(w)) {
        let { add, skip } = scanAhead(terms, i);
        if (skip > 0) {
          carry += add;
          i += skip;
          // console.log('skip', skip, 'add', add)
          continue
        }
      }
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
      // 'cent'
      if (tags.has('Multiple')) {
        let mult = toNumber[w] || 1;
        if (carry === 0) {
          carry = 1;
        }
        // sum += carry
        // sum = sum* mult
        // console.log('carry', carry, 'mult', mult, 'sum', sum)
        sum += mult * carry;
        carry = 0;
        continue
      }
      // 'trois'
      if (toNumber.hasOwnProperty(w)) {
        carry += toNumber[w];
      }
    }
    // include any remaining
    if (carry !== 0) {
      sum += carry;
    }
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
    let arr = str.split(/([0-9.,]*)/);
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
        let num = str += 'er';
        return `${prefix}${num}${suffix}`
      }
      let num = str += 'e';
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

  // import getRoot from './root.js'

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

  const getRoot$2 = function (view) {
    const m = view.methods.two.transform.verb;
    let str = view.text('normal');
    if (view.has('#PastParticiple')) {
      return m.fromPastParticiple(str)
    }
    if (view.has('#PresentTense')) {
      return m.fromPresentTense(str)
    }
    if (view.has('#PastTense')) {
      return m.fromImperfectTense(str)
    }
    if (view.has('#FutureTense')) {
      return m.fromFutureTense(str)
    }
    if (view.has('#ConditionalVerb')) {
      return m.fromConditional(str)
    }
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
      // toPastTense(n) {
      //   return getNth(this, n).map(vb => {
      //     let parsed = parseVerb(vb)
      //     let info = getGrammar(vb, parsed)
      //     return toPast(vb, parsed, info.form)
      //   })
      // }
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
        const m = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          let parsed = parseVerb$1(vb);
          let root = parsed.root || '';
          return {
            Infinitive: root,
            PastTense: m.imperfect(root),
            PresentTense: m.presentTense(root),
            FutureTense: m.futureTense(root),
            PastParticiple: m.pastParticiple(root),
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
    let str = m.text('normal');
    let isPlural = m.has('PluralAdjective');
    let isFemale = m.has('FemaleAdjective');
    if (isPlural && isFemale) {
      return transform.adjective.fromFemalePlural(str)
    } else if (isFemale) {
      return transform.adjective.fromFemale(str)
    } else if (isPlural) {
      return transform.adjective.fromPlural(str)
    }
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
          return methods.conjugate(adj)
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
    let str = m.text('normal');
    let isPlural = m.has('Plural');
    if (isPlural) {
      return transform.adjective.fromPlural(str)
    }
    return str
  };

  const api$2 = function (View) {
    class Nouns extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Nouns';
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
        }, [])
      }
      toSingular(n) {
        const methods = this.methods.two.transform.noun;
        return getNth(this, n).if('#PluralNoun').map(m => {
          let str = getRoot(m);
          let singular = methods.toSingular(str);
          return m.replaceWith(singular)
        }, [])
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

  var version = '0.2.0';

  // import nlp from 'compromise/one'

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

  fr.world = nlp$1.world;
  fr.model = nlp$1.model;
  fr.methods = nlp$1.methods;
  fr.tokenize = nlp$1.tokenize;
  fr.plugin = nlp$1.plugin;
  fr.extend = nlp$1.extend;


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
