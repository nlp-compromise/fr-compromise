(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.frCompromise = factory());
})(this, (function () { 'use strict';

  const methods$o = {
    one: {},
    two: {},
    three: {},
    four: {},
  };

  const model$6 = {
    one: {},
    two: {},
    three: {},
  };
  const compute$8 = {};
  const hooks = [];

  var tmpWrld = { methods: methods$o, model: model$6, compute: compute$8, hooks };

  const fns$4 = {
    /** add metadata to term objects */
    compute: function (input, options) {
      const { world } = this;
      const compute = world.compute;
      // do one method
      if (typeof input === 'string' && Object.hasOwn(compute, input)) {
        compute[input](this, options);
      }
      // allow a list of methods
      else if (Array.isArray(input)) {
        input.forEach(name => {
          if (Object.hasOwn(world.compute, name)) {
            compute[name](this, options);
          } else {
            console.warn('no compute:', input); // eslint-disable-line
          }
        });
      }
      // allow a custom compute function
      else if (typeof input === 'function') {
        input(this, options);
      } else {
        console.warn('no compute:', input); // eslint-disable-line
      }
      return this
    },
  };

  // wrappers for loops in javascript arrays

  // call the callback with a one-match view
  const wrap$3 = (view, cb) => (ptr, i) => cb(view.update([ptr]), i);

  const forEach = function (cb) {
    this.fullPointer.forEach(wrap$3(this, cb));
    return this
  };

  const map = function (cb, empty) {
    const run = wrap$3(this, cb);
    const res = this.fullPointer.map((ptr, i) => {
      const out = run(ptr, i);
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
    return this.update(this.fullPointer.filter(wrap$3(this, cb)))
  };

  const find = function (cb) {
    const found = this.fullPointer.find(wrap$3(this, cb));
    if (found === undefined) {
      return this.update([])
    }
    return this.update([found])
  };

  const some$1 = function (cb) {
    return this.fullPointer.some(wrap$3(this, cb))
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
  var loops = { forEach, map, filter, find, some: some$1, random };

  // small helpers shared by the View class and its methods

  // the pointer, or one per sentence for a full document
  const rawPointer = view => view.pointer || view.docs.map((_d, n) => [n]);

  // tag new terms, if the tagger is loaded
  const retag = function (view, computes) {
    view.compute([...computes, 'freeze', 'lexicon']);
    if (view.world.compute.preTagger) {
      view.compute('preTagger');
    }
    view.compute('unfreeze');
    return view
  };

  const utils = {
    /** */
    termList: function () {
      return this.methods.one.termList(this.docs)
    },
    /** return individual terms*/
    terms: function (n) {
      const m = this.match('.');
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
      const res = {};
      Object.keys(this._groups).forEach(k => {
        res[k] = this.update(this._groups[k]);
      });
      // this._groups = null
      return res
    },
    /** */
    eq: function (n) {
      const ptr = rawPointer(this);
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
      const n = this.fullPointer.length - 1;
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
      return this.update(rawPointer(this).slice(min, max))
    },

    /** return a view of the entire document */
    all: function () {
      return this.update().toView()
    },
    /**  */
    fullSentences: function () {
      const ptrs = this.fullPointer.map(a => [a[0]]); //lazy!
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
      const aPtr = this.fullPointer;
      const bPtr = b.fullPointer;
      if (aPtr.length !== bPtr.length) {
        return false
      }
      // ensure [n, start, end] are all the same
      return aPtr.every((ptr, i) => bPtr[i] && ptr[0] === bPtr[i][0] && ptr[1] === bPtr[i][1] && ptr[2] === bPtr[i][2])
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
      const ptrs = this.pointer;
      if (!ptrs) {
        return true
      }
      // must start at beginning
      if (ptrs.length === 0 || ptrs[0][0] !== 0) {
        return false
      }
      let wantTerms = 0;
      let haveTerms = 0;
      this.document.forEach(terms => wantTerms += terms.length);
      this.docs.forEach(terms => haveTerms += terms.length);
      return wantTerms === haveTerms
      // for (let i = 0; i < ptrs.length; i += 1) {
      //   let [n, start, end] = ptrs[i]
      //   // it's not the start
      //   if (n !== i || start !== 0) {
      //     return false
      //   }
      //   // it's too short
      //   if (document[n].length > end) {
      //     return false
      //   }
      // }
      // return true
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

  const methods$n = { ...utils, ...fns$4, ...loops };

  // aliases
  methods$n.get = methods$n.eq;

  class View {
    constructor(document, pointer, groups = {}) {
      // invisible props
      const props = [
        ['document', document],
        ['world', tmpWrld],
        ['_groups', groups],
        ['_cache', null],
      ];
      props.forEach(a => {
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
      const { docs, ptrs, document } = this;
      // compute a proper pointer, from docs
      const pointers = ptrs || docs.map((_d, n) => [n]);
      // do we need to repair it, first?
      return pointers.map(a => {
        // eslint-disable-next-line prefer-const
        let [n, start, end, id, endId] = a;
        start ||= 0;
        end ||= (document[n] || []).length;
        //add frozen id, for good-measure
        if (document[n]?.[start]) {
          id ||= document[n][start].id;
          if (document[n][end - 1]) {
            endId ||= document[n][end - 1].id;
          }
        }
        return [n, start, end, id, endId]
      })
    }
    // create a new View, from this one
    update(pointer) {
      const m = new View(this.document, pointer);
      // send the cache down, too?
      if (this._cache && pointer?.length > 0) {
        // only keep cache if it's a full-sentence
        const cache = [];
        pointer.forEach((ptr, i) => {
          const [n, start, end] = ptr;
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
      const document = methods.one.tokenize.fromString(input, this.world);
      const doc = new View(document);
      doc.world = this.world;
      return retag(doc, ['normal'])
    }
    clone() {
      // clone the whole document
      let document = this.document.slice(0); //node 17: structuredClone(document);
      document = document.map(terms => {
        return terms.map(term => {
          term = { ...term };
          term.tags = new Set(term.tags);
          return term
        })
      });
      // clone only sub-document ?
      const m = this.update(this.pointer);
      m.document = document;
      m._cache = this._cache; //clone this too?
      return m
    }
  }
  Object.assign(View.prototype, methods$n);
  // subclasses set their own name on their prototype
  View.prototype.viewType = 'View';

  var version$1 = '14.20.0';

  const isObject$1 = function (item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  };

  const isUnsafeKey = key => key === '__proto__' || key === 'constructor' || key === 'prototype';

  // recursive merge of objects
  function mergeDeep(model, plugin) {
    if (isObject$1(plugin)) {
      for (const key in plugin) {
        // prevent prototype pollution
        if (isUnsafeKey(key)) {
          continue
        }
        if (isObject$1(plugin[key])) {
          if (!model[key]) {
            model[key] = {};
          }
          mergeDeep(model[key], plugin[key]); //recursion
        } else if (Array.isArray(plugin[key]) && Array.isArray(model[key])) {
          // a list, like model.one.contractions, is added to - not replaced
          model[key] = model[key].concat(plugin[key]);
        } else {
          model[key] = plugin[key];
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
      if (isUnsafeKey(key)) continue
      model[key] ||= {};
      Object.assign(model[key], plugin[key]);
    }
    return model
  }

  // verb forms, then adjective forms
  const irregularForms = [
    ['pastTense', 'Past'],
    ['presentTense', 'Present'],
    ['gerund', 'Gerund'],
    ['comparative', 'Comparative'],
    ['superlative', 'Superlative'],
  ];

  const addIrregulars = function (model, conj) {
    const m = model.two.models || {};
    Object.keys(conj).forEach(k => {
      irregularForms.forEach(([prop, name]) => {
        const form = conj[k][prop];
        if (!form) {
          return
        }
        if (m['to' + name]) {
          m['to' + name].ex[k] = form;
        }
        if (m['from' + name]) {
          m['from' + name].ex[form] = k;
        }
      });
    });
  };

  const extend = function (plugin, world, View, nlp) {
    // support array of plugins
    if (Array.isArray(plugin)) {
      plugin.forEach(p => extend(p, world, View, nlp));
      return
    }
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
    // Notify plugins when replacement creates new terms.
    if (plugin.onReplace) {
      methods.one.onReplace = (methods.one.onReplace || []).concat(plugin.onReplace);
    }
    // assign new class methods
    if (plugin.api) {
      plugin.api(View);
    }
    if (plugin.lib) {
      Object.keys(plugin.lib).forEach(k => (nlp[k] = plugin.lib[k]));
    }
    if (plugin.tags) {
      nlp.addTags(plugin.tags);
    }
    if (plugin.words) {
      nlp.addWords(plugin.words);
    }
    if (plugin.frozen) {
      nlp.addWords(plugin.frozen, true);
    }
    if (plugin.mutate) {
      plugin.mutate(world, nlp);
    }
  };

  // Shared CLI colors and styles. Plain text when NO_COLOR is set, as the convention asks
  const off = typeof process !== 'undefined' && Object.hasOwn(process.env || {}, 'NO_COLOR');
  const color = code => s => (off ? s : '\x1b[' + code + 'm' + s + '\x1b[0m');

  const green = color(32);
  const red = color(31);
  const blue = color(34);
  const cyan = color(36);
  const yellow = color(33);
  // used by name, from the tagset colors
  const magenta = color(35);
  const dim = color(2);
  const i$1 = color(3);
  const b = color(1);
  const ul = color(4);
  const grey = color(90);

  var cli = /*#__PURE__*/Object.freeze({
    __proto__: null,
    b: b,
    blue: blue,
    cyan: cyan,
    dim: dim,
    green: green,
    grey: grey,
    i: i$1,
    magenta: magenta,
    red: red,
    ul: ul,
    yellow: yellow
  });

  const env = globalThis.process?.env ?? globalThis.env ?? {};
  const debug$2 = { tags: Boolean(env.DEBUG_TAGS) };

  // Capture only the requested terms, and only while tracing.
  const before = term => {
    if (debug$2.tags && (!debug$2.word || debug$2.word === (term.normal || term.text || term.implicit || '').toLowerCase())) {
      return [...term.tags]
    }
    return null
  };

  // Show actual changes, including conflict removals.
  const log = (term, previous, reason = '') => {
    if (!previous) {
      return
    }
    const added = [...term.tags].filter(tag => !previous.includes(tag));
    const removed = previous.filter(tag => !term.tags.has(tag));
    if (!added.length && !removed.length) {
      return
    }
    const text = term.text || term.implicit || '';
    const index = term.index?.join(':') || '?';
    const prefix = debug$2.prefix || '   ';
    if (debug$2.rule !== reason) {
      const headingPrefix = debug$2.prefix ? prefix.replace('│  ', '│ ') : '  ';
      console.log(`${headingPrefix}${dim((reason || 'tag change') + ':')}`); // eslint-disable-line no-console
      debug$2.rule = reason;
    }
    const print = (tags, sign, color) => {
      if (!tags.length) {
        return
      }
      const word = color(`'${text}'`);
      const changes = tags.map(tag => color(`#${tag}`)).join(' ');
      console.log(`${prefix}${color(sign)} ${word} ${dim(index.padEnd(9))} ${changes}`); // eslint-disable-line no-console
    };
    print(removed, '−', red);
    print(added, '+', green);
  };

  debug$2.before = before;
  debug$2.log = log;

  // Install only while verbose matching is enabled; restore the original hot path.
  const matchDebug = (world, options) => {
    const one = world.methods.one;
    const match = one.match;
    const parse = one.parseMatch;
    const sources = new WeakMap();
    const word = options.word?.toLowerCase();
    const includesWord = terms =>
      !word || terms.some(term => (term.normal || term.text || term.implicit || '').toLowerCase() === word);

    const parseLogged = function (...args) {
      const regs = parse.apply(this, args);
      sources.set(regs, String(args[0]));
      return regs
    };
    const matchLogged = function (docs, todo, cache) {
      const result = match.call(this, docs, todo, cache);
      const pattern = todo.match || sources.get(todo.regs) || '[parsed pattern]';
      if (options.pattern !== undefined && pattern !== options.pattern) {
        return result
      }
      if (word && !docs.some(includesWord)) {
        return result
      }
      const matches = result.ptrs
        .map(([n, start, end]) => docs[n].slice(start, end))
        .filter(includesWord);
      if (word && result.ptrs.length && !matches.length) {
        return result
      }
      debug$2.rule = undefined;
      const status = result.ptrs.length ? green('✓') : red('✗');
      const spans = matches.map(terms => {
        const text = terms.map(term => term.text || term.implicit).join(' ');
        return `${green("'" + text + "'")} ${dim(terms[0]?.index?.join(':') || '?')}`
      }).join(', ');
      const rule = pattern.length > 80 ? pattern.slice(0, 79) + '…' : pattern;
      const words = spans ? spans + '  ' : ' ---         ';
      console.log(`${debug$2.prefix || '   '}${status} ${words}${dim(i$1(rule))}`); // eslint-disable-line no-console
      return result
    };
    one.parseMatch = parseLogged;
    one.match = matchLogged;
    return () => {
      // Do not overwrite a plugin's replacement installed during tracing.
      if (one.parseMatch === parseLogged) {
        one.parseMatch = parse;
      }
      if (one.match === matchLogged) {
        one.match = match;
      }
    }
  };

  const colorSpec = doc => {
    return doc.docs
      .map((terms, index) => {
        const plain = terms.map(t => t.pre + t.text + t.post).join('').trim();
        const text = dim("'" + plain + "'");
        const spec = doc.update([[index]]).out('spec');
        return text + grey(i$1(spec.slice(plain.length)))
      })
      .join('\n')
  };

  // Trace the actual pipeline once, including the initial tokenized document.
  const hooksDebug = headings => (doc, hooks) => {
    const width = Math.max('tokenize'.length, ...hooks.map(hook => hook.length));
    const snapshot = (hook, nested = false) => {
      const output = colorSpec(doc);
      output.split('\n').forEach((line, index, lines) => {
        if (nested) {
          const branch = index === lines.length - 1 ? ' ╰─' : '│ ';
          console.log(`  ${dim(branch)} ${line}`); // eslint-disable-line no-console
          return
        }
        const label = (index === 0 ? hook : '').padEnd(width);
        console.log(`  ${dim(label)}  ${line}`); // eslint-disable-line no-console
      });
    };
    snapshot('tokenize');
    hooks.forEach(hook => {
      const nested = headings;
      const prefix = debug$2.prefix;
      const rule = debug$2.rule;
      debug$2.rule = undefined;
      if (nested) {
        console.log(`  ${blue(b(ul(hook + ':')))}`); // eslint-disable-line no-console
        debug$2.prefix = dim('   │  ');
      }
      // Restore the log prefix even when a plugin hook throws.
      try {
        doc.compute(hook);
        snapshot(hook, nested);
      } finally {
        debug$2.prefix = prefix;
        debug$2.rule = rule;
      }
    });
  };

  let restoreMatch;

  /** log the decision-making to console */
  const verbose = function (set = true, options = {}) {
    restoreMatch?.();
    restoreMatch = undefined;
    if (set === 'match' || set === true) {
      restoreMatch = matchDebug(this._world, options);
    }
    debug$2.hooks = set === 'hooks' || set === true ? hooksDebug(set === true) : undefined;
    debug$2.word = options.word?.toLowerCase();
    debug$2.contractions = set === 'contractions' || set === true;
    debug$2.rule = undefined;
    debug$2.tags = set === 'tagger' || set === true;
    debug$2.spec = set === 'spec' || set === true;
    return this
  };

  // a plain object - not an array, null, or class instance
  const isObject = val => Object.prototype.toString.call(val) === '[object Object]';

  // internal Term objects are slightly different
  const fromJson = function (json) {
    return json.map(o => {
      return o.terms.map(term => {
        if (Array.isArray(term.tags)) {
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
    const doc = new View([]);
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
      const document = methods.one.tokenize.fromString(input, world);
      return new View(document)
    }
    // handle compromise View
    if (isObject(input) && input.isView) {
      return new View(input.document, input.ptrs)
    }
    // handle json input
    if (Array.isArray(input)) {
      // pre-tokenized array-of-arrays 
      if (Array.isArray(input[0])) {
        const document = preTokenized(input);
        return new View(document)
      }
      // handle json output
      const document = fromJson(input);
      return new View(document)
    }
    return doc
  };

  const world = { ...tmpWrld };
  // the steps to run before (or without) the tagger
  const preTag = ['alias', 'normal', 'machine', 'contractions'];

  const nlp = function nlp(input, lex) {
    if (lex) {
      nlp.addWords(lex);
    }
    const doc = inputs(input, View, world);
    if (input) {
      if (debug$2.hooks) {
        debug$2.hooks(doc, world.hooks);
      } else {
        doc.compute(world.hooks);
      }
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
    const doc = inputs(input, View, world);
    // give contractions a shot, at least
    if (debug$2.hooks) {
      debug$2.hooks(doc, compute.contractions ? preTag : []);
    } else if (compute.contractions) {
      doc.compute(preTag); //run it if we've got it
    }
    return doc
  };

  /** extend compromise functionality */
  nlp.plugin = function (plugin) {
    extend(plugin, this._world, View, this);
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

  // log the decision-making to console
  nlp.verbose = verbose;
  // current library release version
  nlp.version = version$1;

  const createCache = function (document) {
    const cache = document.map(terms => {
      const items = new Set();
      terms.forEach(term => {
        // add words
        if (term.normal !== '') {
          items.add(term.normal);
        }
        // cache switch-status - '%Noun|Verb%'
        if (term.switch) {
          items.add(`%${term.switch}%`);
        }
        // cache implicit words, too
        if (term.implicit) {
          items.add(term.implicit);
        }
        if (term.machine) {
          items.add(term.machine);
        }
        if (term.root) {
          items.add(term.root);
        }
        // cache slashes words, etc
        if (term.alias) {
          term.alias.forEach(str => items.add(str));
        }
        term.tags.forEach(tag => {
          items.add('#' + tag);
        });
      });
      return items
    });
    return cache
  };

  var methods$m = {
    one: {
      cacheDoc: createCache,
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

  var compute$7 = {
    cache: function (view) {
      view._cache = view.methods.one.cacheDoc(view.document);
    }
  };

  var cache$1 = {
    api: addAPI$3,
    compute: compute$7,
    methods: methods$m,
  };

  // visit every term of a nested document: fn(term, terms, t, n)
  const eachTerm = (docs, fn) => {
    for (let n = 0; n < docs.length; n += 1) {
      const terms = docs[n];
      for (let t = 0; t < terms.length; t += 1) {
        fn(terms[t], terms, t, n);
      }
    }
  };

  // uppercase the first letter - todo: support unicode?
  const titleCase$2 = str => str.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase());

  // change the text of every term
  const mapText = function (view, fn) {
    view.termList().forEach(t => {
      t.text = fn(t.text);
    });
    return view
  };

  var caseFns = {
    /** */
    toLowerCase: function () {
      return mapText(this, str => str.toLowerCase())
    },
    /** */
    toUpperCase: function () {
      return mapText(this, str => str.toUpperCase())
    },
    /** */
    toTitleCase: function () {
      return mapText(this, titleCase$2)
    },
    /** */
    toCamelCase: function () {
      eachTerm(this.docs, (t, terms, i) => {
        if (i !== 0) {
          t.text = titleCase$2(t.text);
        }
        if (i !== terms.length - 1) {
          t.post = '';
        }
      });
      return this
    },
  };

  // case logic for the first character of a word
  const isTitleCase$1 = str => /^\p{Lu}[\p{Ll}'’]/u.test(str) || /^\p{Lu}$/u.test(str);
  const toTitleCase$1 = str => str.replace(/^\p{Ll}/u, x => x.toUpperCase());
  const toLowerCase = str => str.replace(/^\p{Lu}/u, x => x.toLowerCase());

  // give a new word the case of the one it replaced: 'Danes' -> 'Dane', 'DANES' -> 'DANE'
  const matchCase = (original, str) => {
    if (original.length > 1 && original === original.toUpperCase() && original !== original.toLowerCase()) {
      return str.toUpperCase()
    }
    return /^\p{Lu}/u.test(original) ? toTitleCase$1(str) : str
  };

  // Heal the edges of a sentence, when its first or last words change.
  // Shared by insert and remove, and by the noun and verb conversions.

  // a capital of its own, not the sentence's - 'Spencer', 'NASA', 'I', or 'Plan B'
  const ownsCapital = function (term) {
    if (term.tags.has('ProperNoun') || term.tags.has('Acronym')) {
      return true
    }
    return term.text.length === 1 || !isTitleCase$1(term.text)
  };

  // the first word of a sentence lends its capital to a new first word
  const passCapital = function (from, to, drop) {
    if (!/^\p{Lu}/u.test(from.text)) {
      return
    }
    to.text = toTitleCase$1(to.text);
    if (drop && !ownsCapital(from)) {
      from.text = toLowerCase(from.text);
    }
  };

  // quotes, brackets and newlines open a phrase, so they stay in front of it
  const passOpening = function (from, to) {
    to.pre = from.pre + to.pre;
    from.pre = '';
  };

  // a bare hyphen joins two words - 'well-fed'
  const isJoiner = post => /^[-–]$/.test(post);

  // "dogs' bowls" - with no opening quote before it, an apostrophe belongs to its word
  const isPossessive = function (terms, i) {
    if (!/^['’]/.test(terms[i].post)) {
      return false
    }
    return !terms.slice(0, i + 1).some(term => /['‘]/.test(term.pre))
  };

  // periods, commas, closing quotes and brackets end a phrase, so they stay behind it
  const passClosing = function (terms, i, to) {
    const from = terms[i];
    // nothing to move, or it is part of the word
    if (!from.post || isJoiner(from.post) || isPossessive(terms, i)) {
      return false
    }
    let post = from.post;
    // the new words may bring their own ending - 'loudly!'
    if (/[.?!…]/.test(to.post)) {
      post = post.replace(/^[.?!…]+/, '');
    }
    to.post = to.post.trimEnd() + post;
    from.post = ' ';
    return true
  };

  // splice an array into an array
  const spliceArr = (parent, index, child) => {
    // tag them as dirty
    child.forEach(term => term.dirty = true);
    if (parent) {
      parent.splice(index, 0, ...child);
    }
    return parent
  };

  // add a space at end, if required
  const endSpace = function (terms) {
    const hasSpace = / $/;
    const hasDash = /[-–—]/;
    const lastTerm = terms.at(-1);
    if (lastTerm && !hasSpace.test(lastTerm.post) && !hasDash.test(lastTerm.post)) {
      lastTerm.post += ' ';
    }
  };

  // put these words before the others
  const cleanPrepend = function (home, ptr, needle, document, agree) {
    const [n, start, end] = ptr;
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
    if (agree) {
      // '"dogs' -> '"the dogs'
      passOpening(home[start], needle[0]);
      // 'Dogs' -> 'The dogs'
      if (start === 0) {
        passCapital(home[start], needle[0], true);
      }
    }
    spliceArr(home, start, needle);
  };

  const cleanAppend = function (home, ptr, needle, document, agree) {
    const [n, , end] = ptr;
    const total = (document[n] || []).length;
    // 'bark.' -> 'bark loudly.'
    const moved = agree && home[end - 1] && passClosing(home, end - 1, needle.at(-1));
    if (!moved && end < total) {
      // in the middle - add trailing space on self
      endSpace(needle);
    } else if (!moved) {
      // at the end - add a space to predecessor
      endSpace(home);
      // is there another sentence after?
      if (document[n + 1]) {
        needle.at(-1).post += ' ';
      }
    }
    spliceArr(home, ptr[2], needle);
    // set new endId
    ptr[4] = needle.at(-1).id;
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
  let index$1 = 0;

  const pad3 = str => str.padStart(3, '0');

  const toId = function (term) {
    let [n, i] = term.index || [0, 0];
    index$1 += 1;

    //don't overflow index
    index$1 = index$1 > 46655 ? 0 : index$1;
    //don't overflow sentences
    n = n > 46655 ? 0 : n;
    // //don't overflow terms
    i = i > 1294 ? 0 : i;

    // 3 digits for time
    let id = pad3(index$1.toString(36));
    // 3 digit  for sentence index (46k)
    id += pad3(n.toString(36));

    // 1 digit for term index (36)
    id += i.toString(36).padStart(2, '0');

    // 1 digit random number
    const r = parseInt(Math.random() * 36, 10);
    id += (r).toString(36);

    return term.normal + '|' + id.toUpperCase()
  };

  // setInterval(() => console.log(toId(4, 12)), 100)

  // are we changing part of a contraction? expand it first
  const expandContraction = function (m) {
    if (m.has('@hasContraction') && m.contractions) {
      m.grow('@hasContraction').contractions().expand();
    }
  };

  // set new ids for each terms
  const addIds$2 = function (terms) {
    terms = terms.map(term => {
      term.id = toId(term);
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
    if (Array.isArray(input)) {
      return Array.isArray(input[0]) ? input[0] : input
    }
    return []
  };

  // {agree: false} skips moving any capitals or punctuation
  const insert = function (input, view, prepend, opts = {}) {
    const agree = opts.agree !== false;
    const { document, world } = view;
    view.uncache();
    // insert words at end of each doc
    const ptrs = view.fullPointer;
    const selfPtrs = view.fullPointer;
    view.forEach((m, i) => {
      const ptr = m.fullPointer[0];
      const [n] = ptr;
      // add-in the words
      const home = document[n];
      let terms = getTerms(input, world);
      // are we inserting nothing?
      if (terms.length === 0) {
        return
      }
      terms = addIds$2(terms);
      if (prepend) {
        expandContraction(view.update([ptr]).firstTerm());
        cleanPrepend(home, ptr, terms, document, agree);
      } else {
        expandContraction(view.update([ptr]).lastTerm());
        cleanAppend(home, ptr, terms, document, agree);
      }
      // harden the pointer
      if (document[n]?.[ptr[1]]) {
        ptr[3] = document[n][ptr[1]].id;
      }
      // change self backwards by len
      selfPtrs[i] = ptr;
      // extend the pointer
      ptr[2] += terms.length;
      ptrs[i] = ptr;
    });
    const doc = view.toView(ptrs);
    // shift our self pointer, if necessary
    view.ptrs = selfPtrs;
    // try to tag them, too
    return retag(doc, ['id', 'index'])
  };

  const fns$3 = {
    insertAfter: function (input, opts) {
      return insert(input, this, false, opts)
    },
    insertBefore: function (input, opts) {
      return insert(input, this, true, opts)
    },
  };
  fns$3.append = fns$3.insertAfter;
  fns$3.prepend = fns$3.insertBefore;
  fns$3.insert = fns$3.insertAfter;

  const dollarStub = /\$[0-9a-z]+/g;
  const fns$2 = {};

  // doc.replace('foo', (m)=>{})
  const replaceByFn = function (main, fn, keep) {
    const ptrs = [];
    main.forEach((m, i) => {
      const out = m.replaceWith(fn(m, i), keep);
      ptrs.push(...out.fullPointer);
    });
    // a full document needs no new pointer
    if (main.ptrs) {
      main.ptrs = ptrs;
    }
    return main
  };

  // support 'foo $0' replacements, using this match's own groups
  const subDollarSign = function (input, main, [n, start, end]) {
    const groups = main._groups;
    return input.replace(dollarStub, a => {
      const name = a.replace(/\$/, '');
      const ptrs = Object.hasOwn(groups, name) ? groups[name] : [];
      const found = ptrs.find(ptr => ptr[0] === n && ptr[1] >= start && ptr[2] <= end);
      if (found) {
        // any end-punctuation will be moved over from the original
        return main.update([found]).text({ keepEndPunct: false })
      }
      return a
    })
  };

  // remember each match, before we change it
  const getOriginal = function (terms) {
    const last = terms.at(-1);
    return {
      pre: terms[0].pre,
      post: last.post,
      isTitleCase: isTitleCase$1(terms[0].text),
      text: terms[0].text,
      isPossessive: last.tags.has('Possessive'),
      tags: terms.map(term => Array.from(term.tags)),
    }
  };

  // keep any punctuation, and "John's"
  const restoreOriginal = function (terms, original, keep) {
    const last = terms.at(-1);
    if (keep.possessives && original.isPossessive && !last.tags.has('Possessive')) {
      last.text += "'s";
      last.normal += "'s";
      last.tags.add('Possessive');
    }
    // try to keep some pre-punctuation
    if (original.pre) {
      terms[0].pre = original.pre;
    }
    // try to keep any post-punctuation
    if (original.post) {
      // the punctuation may have moved here without its spaces - ' - '
      const post = last.post.trim();
      if (!post || post === original.post.trim()) {
        last.post = original.post;
      }
    }
  };

  fns$2.replaceWith = function (input, keep = {}) {
    // support keep-all option
    if (keep === true) {
      keep = {
        tags: true,
        case: true,
        possessives: true,
      };
    }
    const main = this;
    this.uncache();
    if (!main.found) {
      return main
    }
    if (typeof input === 'function') {
      return replaceByFn(main, input, keep)
    }
    // each match has its own '$0' text
    if (typeof input === 'string' && input.includes('$') && Object.keys(main._groups).length > 0) {
      const strs = main.fullPointer.map(ptr => subDollarSign(input, main, ptr));
      return replaceByFn(main, (_m, i) => strs[i], keep)
    }
    const originals = main.docs.map(getOriginal);
    // Preserve old Term identities for plugins before insertion/deletion changes the view.
    const replacements =
      this.world.methods.one.onReplace &&
      this.fullPointer.map(([n, start, end]) => ({
        sentence: this.document[n],
        before: new Set(this.document[n]),
        oldTerms: this.document[n].slice(start, end),
      }));
    const original = this.update(this.fullPointer);
    // slide this in
    if (typeof input === 'string') {
      input = this.fromText(input).compute('id');
    }
    // {agree: false} swaps the words, and nothing else
    const agree = keep.agree !== false;
    main.insertAfter(input, { agree });
    // New terms follow each old match; stop at an existing term to separate nearby matches.
    if (replacements) {
      replacements.forEach(group => {
        const start = group.sentence.indexOf(group.oldTerms.at(-1)) + 1;
        group.newTerms = [];
        for (let i = start; i < group.sentence.length && !group.before.has(group.sentence[i]); i += 1) {
          group.newTerms.push(group.sentence[i]);
        }
      });
    }
    // are we replacing part of a contraction?
    if (original.has('@hasContraction') && main.contractions) {
      const more = main.grow('@hasContraction+');
      more.contractions().expand();
    }
    // delete the original terms
    // (we restore the start of the phrase ourselves, below)
    // the new words take the sentence's capital, unless {case: false}
    // (we restore the punctuation ourselves, below)
    main.delete(original, { agree, start: keep.case !== false, end: false }); //science.

    // main now points at only the new terms
    if (agree) {
      main.docs.forEach((terms, i) => restoreOriginal(terms, originals[i], keep));
    }

    // what should we return?
    const m = retag(main.toView(), ['index']);
    // replace any old tags
    if (keep.tags) {
      m.forEach((match, i) => {
        match.terms().forEach((term, k) => term.tagSafe(originals[i].tags[k]));
      });
    }
    // try to co-erce case, too
    if (keep.case) {
      m.docs.forEach((terms, i) => {
        const transformCase = originals[i].isTitleCase ? toTitleCase$1 : toLowerCase;
        // 'DOGS' -> 'CATS'
        terms[0].text = matchCase(originals[i].text, transformCase(terms[0].text));
      });
    }
    // Transfer plugin metadata after replacement text, punctuation, and case are finalized.
    if (m.world.methods.one.onReplace) {
      replacements.forEach(({ oldTerms, newTerms }) => {
        m.world.methods.one.onReplace.forEach(fn => fn({ oldTerms, newTerms, document: m.document }));
      });
    }
    return m
  };

  fns$2.replace = function (match, input, keep) {
    if (match && input === undefined) {
      return this.replaceWith(match, keep)
    }
    const m = this.match(match);
    if (!m.found) {
      return this
    }
    this.soften();
    return m.replaceWith(input, keep)
  };

  // Remove only the first qualifying run, matching String.replace without /g.
  const removeRunBefore = (str, run, following) => {
    let i = 0;
    while (i < str.length) {
      if (!run.includes(str[i])) {
        i++;
        continue
      }
      const start = i;
      while (i < str.length && run.includes(str[i])) i++;
      if (i < str.length && following.includes(str[i])) {
        return str.slice(0, start) + str.slice(i)
      }
    }
    return str
  };

  // transfer sentence-ending punctuation
  const repairPunct = function (terms, len) {
    const last = terms.length - 1;
    const from = terms[last];
    const to = terms[last - len];
    if (to && from) {
      to.post += from.post; //this isn't perfect.
      to.post = removeRunBefore(to.post, ' ', '.?!,;:"”)]');
      // don't allow any silly punctuation outcomes like ',!'
      to.post = removeRunBefore(to.post, ',;:', '.?!');
    }
  };

  const pairs$1 = { '(': ')', '[': ']', '"': '"', '“': '”', '‘': '’' };

  // a quote or bracket that opens and closes on the removed words leaves with them - '(loudly)'
  const dropPairs = function (terms, start, end) {
    const first = terms[start];
    const last = terms[end - 1];
    Object.keys(pairs$1).forEach(open => {
      if (first.pre.includes(open) && last.post.includes(pairs$1[open])) {
        first.pre = first.pre.replace(open, '');
        last.post = last.post.replace(pairs$1[open], '');
      }
    });
  };

  // the word before us becomes the end of the phrase - 'bark loudly, and' -> 'bark, and'
  const repairEnd = function (terms, start, end) {
    const prev = terms[start - 1];
    const post = terms[end - 1].post;
    // is there anything to keep, and room to keep it?
    if (prev && /\S/.test(post) && !/\S/.test(prev.post)) {
      prev.post = post;
    }
  };

  // the words after us become the start of the phrase
  const repairStart = function (terms, start, end) {
    const next = terms[end];
    if (!next) {
      return
    }
    // '"the dogs' -> '"dogs'
    passOpening(terms[start], next);
    // 'The dogs' -> 'Dogs'
    if (start === 0) {
      passCapital(terms[start], next);
    }
  };

  // remove terms from document json
  const pluckOut = function (document, nots, opts = {}) {
    nots.forEach(ptr => {
      const [n, start, end] = ptr;
      const len = end - start;
      if (!document[n]) {
        return // weird!
      }
      if (opts.agree !== false) {
        dropPairs(document[n], start, end);
        if (end === document[n].length && end > 1) {
          repairPunct(document[n], len);
        } else if (opts.end !== false) {
          repairEnd(document[n], start, end);
        }
        if (opts.start !== false) {
          repairStart(document[n], start, end);
        }
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
          const terms = document[i - 1];
          const lastTerm = terms.at(-1);
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

  // which sentences will have no terms left?
  const getEmptied = function (gonePtrs, document) {
    return Object.keys(gonePtrs).map(Number).filter(n => {
      const count = gonePtrs[n].reduce((sum, no) => sum + no[2] - no[1], 0);
      return document[n] && count >= document[n].length
    })
  };

  // gonePtrs must run from last-to-first, in each sentence
  const fixPointers$1 = function (ptrs, gonePtrs, emptied) {
    ptrs = ptrs.map(ptr => {
      const [n] = ptr;
      const gone = gonePtrs[n] || [];
      gone.forEach(no => {
        const len = no[2] - no[1];
        // does it effect our pointer?
        if (ptr[1] <= no[1] && ptr[2] >= no[2]) {
          ptr[2] -= len;
        } else if (ptr[1] >= no[2]) {
          // terms before our pointer are gone
          ptr[1] -= len;
          ptr[2] -= len;
        }
      });
      // sentences before our pointer are gone
      ptr[0] -= emptied.filter(k => k < n).length;
      // remove old hard-pointers
      ptr[3] = null;
      ptr[4] = null;
      return ptr
    });
    // remove any now-empty pointers
    return ptrs.filter(ptr => ptr[2] - ptr[1] > 0)
  };

  const methods$k = {
    // {agree: false} skips moving any capitals or punctuation
    remove: function (reg, opts) {
      const { indexN } = this.methods.one.pointer;
      // allow .remove({agree: false})
      if (reg && Object.hasOwn(reg, 'agree')) {
        opts = reg;
        reg = undefined;
      }
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
      const isFull = !self.ptrs;
      // is it part of a contraction?
      expandContraction(not);

      let ptrs = self.fullPointer;
      const nots = not.fullPointer.reverse();
      const gonePtrs = indexN(nots);
      const emptied = getEmptied(gonePtrs, this.document);
      // remove them from the actual document)
      const document = pluckOut(this.document, nots, opts);
      // repair our pointers
      ptrs = fixPointers$1(ptrs, gonePtrs, emptied);
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
      const res = self.toView(ptrs); //return new document
      return res
    },
  };

  // aliases
  methods$k.delete = methods$k.remove;

  // set or append the pre/post of the first/last term of each match
  const setSide = function (view, side, str, concat) {
    view.docs.forEach(terms => {
      const term = side === 'pre' ? terms[0] : terms.at(-1);
      if (concat === true) {
        term[side] += str;
      } else {
        term[side] = str;
      }
    });
    return view
  };

  // put these characters around each match
  const wrap$2 = function (view, start, end) {
    view.docs.forEach(terms => {
      terms[0].pre = start + terms[0].pre;
      const last = terms.at(-1);
      last.post = end + last.post;
    });
    return view
  };

  const methods$j = {
    /** add this punctuation or whitespace before each match: */
    pre: function (str, concat) {
      if (str === undefined && this.found) {
        return this.docs[0][0].pre
      }
      return setSide(this, 'pre', str, concat)
    },

    /** add this punctuation or whitespace after each match: */
    post: function (str, concat) {
      if (str === undefined) {
        const last = this.docs.at(-1);
        return last.at(-1).post
      }
      return setSide(this, 'post', str, concat)
    },

    /** remove whitespace from start/end */
    trim: function () {
      if (!this.found) {
        return this
      }
      const docs = this.docs;
      const start = docs[0][0];
      start.pre = start.pre.trimStart();
      const last = docs.at(-1);
      const end = last.at(-1);
      end.post = end.post.trimEnd();
      return this
    },

    /** connect words with hyphen, and remove whitespace */
    hyphenate: function () {
      //remove whitespace
      eachTerm(this.docs, (t, terms, i) => {
        if (i !== 0) {
          t.pre = '';
        }
        if (terms[i + 1]) {
          t.post = '-';
        }
      });
      return this
    },

    /** remove hyphens between words, and set whitespace */
    dehyphenate: function () {
      const hasHyphen = /[-–—]/;
      //remove whitespace
      eachTerm(this.docs, t => {
        if (hasHyphen.test(t.post)) {
          t.post = ' ';
        }
      });
      return this
    },

    /** add quotations around these matches */
    toQuotations: function (start, end) {
      return wrap$2(this, start || '"', end || '"')
    },

    /** add brackets around these matches */
    toParentheses: function (start, end) {
      return wrap$2(this, start || '(', end || ')')
    },
  };

  // aliases
  methods$j.deHyphenate = methods$j.dehyphenate;
  methods$j.toQuotation = methods$j.toQuotations;

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

  /** count the # of characters of each match - longest first */
  const length = (a, b) => b.normal.trim().length - a.normal.trim().length;

  /** count the # of terms in each match - most first */
  const wordCount$1 = (a, b) => b.words - a.words;

  /** document order - sentence, then start, then end of each match */
  const sequential = (a, b) => a.pointer[0] - b.pointer[0] || a.pointer[1] - b.pointer[1] || a.pointer[2] - b.pointer[2];

  /** sort by # of duplicates in the document*/
  const byFreq = function (arr) {
    const counts = Object.create(null);
    arr.forEach(o => {
      counts[o.normal] ??= 0;
      counts[o.normal] += 1;
    });
    // sort by freq - most first
    arr.sort((a, b) => counts[b.normal] - counts[a.normal]);
    return arr
  };

  var methods$i = { alpha, length, wordCount: wordCount$1, sequential, byFreq };

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
    const { docs } = this;
    this.uncache();
    if (typeof input === 'function') {
      return customSort(this, input)
    }
    input ||= 'alpha';
    const ptrs = rawPointer(this);
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
  const reverse$1 = function () {
    const ptrs = [].concat(rawPointer(this)).reverse();
    if (this._cache) {
      this._cache = this._cache.reverse();
    }
    return this.update(ptrs)
  };

  /** remove any duplicate matches */
  const unique = function () {
    const already = new Set();
    const res = this.filter(m => {
      const txt = m.text('machine');
      if (already.has(txt)) {
        return false
      }
      already.add(txt);
      return true
    });
    // this.ptrs = res.ptrs //mutate original?
    return res//.compute('index')
  };

  var sort$1 = { unique, reverse: reverse$1, sort };

  // append a new document, somehow
  const combineDocs = function (homeDocs, inputDocs) {
    if (homeDocs.length > 0) {
      // add a space
      const end = homeDocs.at(-1);
      const last = end.at(-1);
      if (!/ /.test(last.post)) {
        last.post += ' ';
      }
    }
    homeDocs = homeDocs.concat(inputDocs);
    return homeDocs
  };

  const combineViews = function (home, input) {
    // is it a view from the same document?
    if (home.document === input.document) {
      const ptrs = home.fullPointer.concat(input.fullPointer);
      return home.toView(ptrs).compute('index')
    }
    // update n of new pointer, to end of our pointer
    const ptrs = input.fullPointer;
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
        const more = this.fromText(input);
        // easy concat
        if (!this.found || !this.ptrs) {
          this.document = this.document.concat(more.document);
        } else {
          // if we are in the middle, this is actually a splice operation
          const ptrs = this.fullPointer;
          const at = ptrs.at(-1)[0];
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
      if (Array.isArray(input)) {
        const docs = combineDocs(this.document, input);
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
    if (!ptr || ptr.length === 0) {
      return this
    }
    ptr = ptr.map(a => a.slice(0, 3));
    this.ptrs = ptr;
    return this
  };
  var harden$1 = { harden, soften };

  const methods$h = { ...caseFns, ...fns$3, ...fns$2, ...methods$k, ...methods$j, ...sort$1, ...concat, ...harden$1 };

  const addAPI$2 = function (View) {
    Object.assign(View.prototype, methods$h);
  };

  const compute$6 = {
    id: function (view) {
      eachTerm(view.docs, term => {
        term.id ||= toId(term);
      });
    }
  };

  var change = {
    api: addAPI$2,
    compute: compute$6,
  };

  // one 'word:out words' per line - decoded once into { [key]: word, out: [...] }
  const parse$3 = (str, key) =>
    str
      .trim()
      .split('\n')
      .map(s => {
        const [k, out] = s.trim().split(':');
        return { [key]: k, out: out.split(' ') }
      });

  var contractions$3 = [
    // that's and let's are decided here, before any tagging
    // (step 1 of the 's decision - the list is in 2-two/contraction-two/compute/index.js)
    // simple mappings
    ...parse$3(
      `
@:at
arent:are not
alot:a lot
brb:be right back
cannot:can not
dun:do not
can't:can not
shan't:should not
won't:will not
that's:that is
what's:what is
let's:let us
dunno:do not know
gonna:going to
gotta:have got to
gimme:give me
outta:out of
tryna:trying to
gtg:got to go
im:i am
imma:I will
imo:in my opinion
irl:in real life
ive:i have
rn:right now
tbh:to be honest
wanna:want to
c'mere:come here
c'mon:come on
shoulda:should have
coulda:could have
woulda:would have
musta:must have
tis:it is
twas:it was
y'know:you know
ne'er:never
o'er:over
  `,
      'word'
    ),
    // contraction-part mappings
    ...parse$3(
      `
ll:will
ve:have
re:are
m:am
  `,
      'after'
    ),
    // french contractions - t'aime
    ...parse$3(
      `
c:ce
m:me
n:ne
qu:que
s:se
t:tu
  `,
      'before'
    ),
    // missing apostrophes, apostrophe-d
    ...parse$3(
      `
shouldnt:should not
couldnt:could not
wouldnt:would not
hasnt:has not
wasnt:was not
isnt:is not
cant:can not
dont:do not
wont:will not
howd:how did
whatd:what did
whend:when did
whered:where did
  `,
      'word'
    ),
  ];

  // one entry per line, in a template string
  const toList = str => str.trim().split('\n').map(s => s.trim());

  // ['a', 'b'] → { a: true, b: true }
  const toHash = list => Object.fromEntries(list.map(s => [s, true]));

  // number suffixes that are not units
  // s=1990s, e=18e french/spanish ordinal, er=french 1er, ère/ème=french 2ème
  var numberSuffixes = toHash(toList(`
st
nd
rd
th
am
pm
max
°
s
e
er
ère
ème
`));

  var model$5 = {
    one: {
      contractions: contractions$3,
      numberSuffixes
    }
  };

  // Log decisions before splicing replaces the original term.
  const contractionDebug = (term, expansion) => {
    if (!debug$2.contractions || (debug$2.word && debug$2.word !== (term.normal || term.text).toLowerCase())) {
      return
    }
    debug$2.rule = undefined;
    const result = expansion ? '[' + expansion.map(word => yellow(`'${word}'`)).join(', ') + ']' : 'possessive (kept)';
    console.log(`${debug$2.prefix || '   '}${yellow(JSON.stringify(term.text))} →  ${result}`); // eslint-disable-line no-console
  };

  // put n new words where 1 word was
  const insertContraction = function (document, point, words) {
    const [n, w] = point;
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
    const before = terms[i].normal.split(hasContraction$1)[0];

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

  //ain't -> are/is not
  const apostropheT = function (terms, i) {
    if (terms[i].normal === "ain't" || terms[i].normal === 'aint') {
      return null //do this in ./two/
    }
    const before = terms[i].normal.replace(/n't/, '');
    return [before, 'not']
  };

  const twoApostrophes = /^(.+)'(t|d|ll)'ve$/;

  // wouldn't've -> would not have,  i'd've -> i would have
  const doubled = function (terms, i) {
    const m = terms[i].normal.match(twoApostrophes);
    if (m === null) {
      return null
    }
    const head = m[1];
    if (m[2] === 'd') {
      return [head, 'would', 'have']
    }
    if (m[2] === 'll') {
      return [head, 'will', 'have']
    }
    // n't've - but can't've, won't've
    if (head === 'can') {
      return ['can', 'not', 'have']
    }
    if (head === 'won') {
      return ['will', 'not', 'have']
    }
    return [head.replace(/n$/, ''), 'not', 'have']
  };

  const hasContraction = /'/;
  const isFeminine = /(e|é|aison|sion|tion)$/;
  const isMasculine = /(age|isme|acle|ege|oire)$/;
  // l' words that end in e, but take le - accents are already stripped
  const masculineE = new Set(['homme', 'arbre', 'espace', 'exemple', 'ordre', 'ange', 'etre', 'ete', 'empire', 'oncle', 'angle', 'article', 'orchestre', 'insecte', 'episode']);
  // l' words that take la, without ending in e
  const feminineEnd = /(eau|tion|sion)$/;
  // the word after the apostrophe
  const getAfter = (terms, i) => terms[i].normal.split(hasContraction)[1];

  // l'amour, l'homme, l'eau
  const preL = (terms, i) => {
    // le/la
    const after = getAfter(terms, i);
    // quick french gender disambig (rough)
    if (after && ((after.endsWith('e') && !masculineE.has(after)) || feminineEnd.test(after))) {
      return ['la', after]
    }
    return ['le', after]
  };

  // d'amerique
  const preD = (terms, i) => {
    const after = getAfter(terms, i);
    // quick guess for noun-agreement (rough)
    if (after && isFeminine.test(after) && !isMasculine.test(after)) {
      return ['du', after]
    } else if (after && after.endsWith('s')) {
      return ['des', after]
    }
    return ['de', after]
  };

  // j'aime
  const preJ = (terms, i) => ['je', getAfter(terms, i)];

  var french = {
    preJ,
    preL,
    preD,
  };

  const isRange = /^([0-9.]{1,4}[a-z]{0,2}) ?[-–—] ?([0-9]{1,4}[a-z]{0,2})$/i;
  const timeRange = /^([0-9]{1,2}(:[0-9][0-9])?(am|pm)?) ?[-–—] ?([0-9]{1,2}(:[0-9][0-9])?(am|pm)?)$/i;
  const phoneNum = /^[0-9]{3}-[0-9]{4}$/;

  const numberRange = function (terms, i) {
    const term = terms[i];
    let parts = term.text.match(isRange);
    if (parts !== null) {
      // 123-1234 is a phone number, not a number-range
      if (term.tags.has('PhoneNumber') || phoneNum.test(term.text)) {
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

  const numUnit = /^([+-]?[0-9][.,0-9]*)([a-z°²³µ/]+)$/; //(must be lowercase)

  const numberUnit = function (terms, i, world) {
    const notUnit = world.model.one.numberSuffixes || {};
    const term = terms[i];
    const parts = term.text.match(numUnit);
    if (parts !== null) {
      // is it a recognized unit, like 'km'?
      const unit = parts[2].toLowerCase().trim();
      // don't split '3rd'
      if (Object.hasOwn(notUnit, unit)) {
        return null
      }
      return [parts[1], unit] //split it
    }
    return null
  };

  const byApostrophe = /'/;
  const numDash = /^[0-9][^-–—]*[-–—].*?[0-9]/;

  // poor-mans reindexing of this sentence only
  const reIndex = function (terms) {
    terms.forEach((t, i) => {
      if (t.index) {
        t.index[1] = i;
      }
    });
  };

  const byEnd = {
    // ain't
    t: apostropheT,
    // how'd
    d: _apostropheD,
  };

  const byStart = {
    // j'aime
    j: french.preJ,
    // l'amour
    l: french.preL,
    // d'amerique
    d: french.preD,
  };

  // pull-apart known contractions from model
  const knownOnes = function (list, term, before, after) {
    for (let i = 0; i < list.length; i += 1) {
      const o = list[i];
      // look for word-word match (cannot-> [can, not])
      if (o.word === term.normal) {
        return o.out
      }
      // look for after-match ('re -> [_, are])
      else if (after !== null && after === o.after) {
        return [before].concat(o.out)
      }
      // look for before-match (l' -> [le, _])
      else if (before !== null && before === o.before && after && after.length > 2) {
        return o.out.concat(after)
        // return [o.out, after] //typeof o.out === 'string' ? [o.out, after] : o.out(terms, i)
      }
    }
    return null
  };

  // turn the words into terms, and put them where the contraction was
  const expand$1 = function (words, view, document, n, i) {
    contractionDebug(document[n][i], words);
    const doc = view.fromText(words.join(' '));
    doc.compute(['id', 'alias']);
    words = doc.docs[0];
    insertContraction(document, [n, i], words);
    return words
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
  const contractions$2 = view => {
    const { world, document } = view;
    const { model, methods } = world;
    const list = model.one.contractions || [];
    // let units = new Set(model.one.units || [])
    // each sentence
    document.forEach((terms, n) => {
      const len = terms.length;
      // loop through terms backwards
      for (let i = terms.length - 1; i >= 0; i -= 1) {
        // already expanded - this runs on the whole document, and must be re-runnable
        if (terms[i].implicit) {
          continue
        }
        let before = null;
        let after = null;
        if (byApostrophe.test(terms[i].normal)) {
          const res = terms[i].normal.split(byApostrophe);
          before = res[0];
          after = res[1];
        }
        // wouldn't've, then any known-ones, like 'dunno'
        let words = doubled(terms, i) || knownOnes(list, terms[i], before, after);
        // ['foo', 's']
        if (!words && Object.hasOwn(byEnd, after)) {
          words = byEnd[after](terms, i, world);
        }
        // ['j', 'aime']
        if (!words && Object.hasOwn(byStart, before)) {
          words = byStart[before](terms, i);
        }
        // 'there is' vs 'there has'
        if (before === 'there' && after === 's') {
          words = thereHas(terms, i);
        }
        // actually insert the new terms
        if (words) {
          expand$1(words, view, document, n, i);
          continue
        }
        // '44-2' has special care
        if (numDash.test(terms[i].normal)) {
          words = numberRange(terms, i);
          if (words) {
            words = expand$1(words, view, document, n, i);
            methods.one.setTag(words, 'NumberRange', world); //add custom tag
            // is it a time-range, like '5-9pm'
            if (words[2] && words[2].tags.has('Time')) {
              methods.one.setTag([words[0]], 'Time', world, null, 'time-range');
            }
          }
          continue
        }
        // split-apart '4km'
        words = numberUnit(terms, i, world);
        if (words) {
          words = expand$1(words, view, document, n, i);
          methods.one.setTag([words[1]], 'Unit', world, null, 'contraction-unit');
        }
      }
      // new terms shift the indexes of any terms after them
      if (terms.length !== len) {
        reIndex(terms);
      }
    });
  };

  var compute$5 = { contractions: contractions$2 };

  const plugin = {
    model: model$5,
    compute: compute$5,
    hooks: ['contractions'],
  };

  const freeze$1 = function (view) {
    const world = view.world;
    const { model, methods } = view.world;
    const setTag = methods.one.setTag;
    const { frozenLex } = model.one;
    const multi = model.one._multiCache || {};

    eachTerm(view.docs, (t, terms, i) => {
      // basic lexicon lookup
      const word = t.machine || t.normal;

      // test a multi-word
      if (multi[word] !== undefined && terms[i + 1]) {
        const end = i + multi[word] - 1;
        for (let k = end; k > i; k -= 1) {
          const words = terms.slice(i, k + 1);
          const str = words.map(term => term.machine || term.normal).join(' ');
          // lookup frozen lexicon
          if (Object.hasOwn(frozenLex, str)) {
            setTag(words, frozenLex[str], world, false, '1-frozen-multi-lexicon');
            words.forEach(term => (term.frozen = true));
          }
        }
      }
      // test single word
      if (frozenLex[word] !== undefined && Object.hasOwn(frozenLex, word)) {
        setTag([t], frozenLex[word], world, false, '1-freeze-lexicon');
        t.frozen = true;
      }
    });
  };

  const unfreeze = function (view) {
    eachTerm(view.docs, term => {
      delete term.frozen;
    });
    return view
  };
  var compute$4 = { frozen: freeze$1, freeze: freeze$1, unfreeze };

  var freeze = {
    // add .compute('freeze')
    compute: compute$4,

    mutate: world => {
      const methods = world.methods.one;
      // add @isFrozen method
      methods.termMethods.isFrozen = term => term.frozen === true;
      // `.debug('frozen')` is the tags view, which marks frozen terms
      methods.debug.freeze = view => methods.debug.tags(view);
      methods.debug.frozen = methods.debug.freeze;
    },

    api: function (View) {
      // set all terms to reject any desctructive tags
      View.prototype.freeze = function () {
        eachTerm(this.docs, term => {
          term.frozen = true;
        });
        return this
      };
      // reset all terms to allow  any desctructive tags
      View.prototype.unfreeze = function () {
        this.compute('unfreeze');
      };
      // return all frozen terms
      View.prototype.isFrozen = function () {
        return this.match('@isFrozen+')
      };
    },
    // run it in init
    hooks: ['freeze'],
  };

  // scan-ahead to match multiple-word terms - 'jack rabbit'
  const multiWord = function (terms, start_i, world) {
    const { model, methods } = world;
    const setTag = methods.one.setTag;
    const multi = model.one._multiCache || {};
    const { lexicon } = model.one || {};
    const t = terms[start_i];
    const word = t.machine || t.normal;

    // found a word to scan-ahead on
    if (multi[word] !== undefined && terms[start_i + 1]) {
      const end = start_i + multi[word] - 1;
      for (let i = end; i > start_i; i -= 1) {
        const words = terms.slice(start_i, i + 1);
        if (words.length <= 1) {
          return false
        }
        const str = words.map(term => term.machine || term.normal).join(' ');
        // lookup regular lexicon
        if (Object.hasOwn(lexicon, str)) {
          const tag = lexicon[str];
          // 'is off-white' is not the phrasal verb 'is off'.
          if (tag && tag.includes('PhrasalVerb') && words[words.length - 1].post === '-') {
            continue
          }
          setTag(words, tag, world, false, '1-multi-lexicon');
          // special case for phrasal-verbs - 2nd word is a #Particle
          if (tag && tag.length === 2 && (tag[0] === 'PhrasalVerb' || tag[1] === 'PhrasalVerb')) {
            setTag([words[1]], 'Particle', world, false, '1-phrasal-particle');
          }
          return true
        }
      }
      return false
    }
    return null
  };

  const prefix$2 = /^(under|over|mis|re|un|dis|semi|pre|post)-?/;
  // anti|non|extra|inter|intra|over
  const allowPrefix = new Set(['Verb', 'Infinitive', 'PastTense', 'Gerund', 'PresentTense', 'Adjective', 'Participle']);

  // tag any words in our lexicon
  const checkLexicon = function (terms, i, world) {
    const { model, methods } = world;
    // const fastTag = methods.one.fastTag
    const setTag = methods.one.setTag;
    const { lexicon } = model.one;

    // basic lexicon lookup
    const t = terms[i];
    const word = t.machine || t.normal;
    // normal lexicon lookup
    if (lexicon[word] !== undefined && Object.hasOwn(lexicon, word)) {
      setTag([t], lexicon[word], world, false, '1-lexicon');
      return true
    }
    // '#gojetsgo' can be in the lexicon with its hash
    if (t.machine && Object.hasOwn(lexicon, t.normal)) {
      setTag([t], lexicon[t.normal], world, false, '1-lexicon-normal');
      return true
    }
    // lookup aliases in the lexicon
    if (t.alias) {
      const found = t.alias.find(str => Object.hasOwn(lexicon, str));
      if (found) {
        setTag([t], lexicon[found], world, false, '1-lexicon-alias');
        return true
      }
    }
    // prefixing for verbs/adjectives
    if (prefix$2.test(word)) {
      const stem = word.replace(prefix$2, '');
      if (Object.hasOwn(lexicon, stem) && stem.length > 3) {
        // only allow prefixes for verbs/adjectives
        if (allowPrefix.has(lexicon[stem])) {
          // console.log('->', word, stem, lexicon[stem])
          setTag([t], lexicon[stem], world, false, '1-lexicon-prefix');
          return true
        }
      }
    }
    return null
  };

  // tag any words in our lexicon - even if it hasn't been filled-up yet
  // rest of pre-tagger is in ./two/preTagger
  const lexicon$4 = function (view) {
    const world = view.world;
    // loop through our terms
    eachTerm(view.docs, (term, terms, i) => {
      if (term.tags.size === 0) {
        let found = null;
        found ||= multiWord(terms, i, world);
        // lookup known words
        found ||= checkLexicon(terms, i, world);
      }
    });
  };

  var compute$3 = {
    lexicon: lexicon$4,
  };

  // derive clever things from our lexicon key-value pairs
  const expand = function (words) {
    // const { methods, model } = world
    const lex = {};
    // console.log('start:', Object.keys(lex).length)
    const _multi = {};
    // go through each word in this key-value obj:
    Object.keys(words).forEach(word => {
      const tag = words[word];
      // normalize lexicon a little bit
      word = word.toLowerCase().trim();
      word = word.replace(/'s\b/, '');
      // cache multi-word terms
      const split = word.split(/ /);
      if (split.length > 1) {
        // prefer longer ones
        if (_multi[split[0]] === undefined || split.length > _multi[split[0]]) {
          _multi[split[0]] = split.length;
        }
      }
      lex[word] ||= tag;
    });
    // cleanup
    delete lex[''];
    delete lex[null];
    delete lex[' '];
    return { lex, _multi }
  };

  var methods$g = {
    one: {
      expandLexicon: expand,
    }
  };

  /** insert new words/phrases into the lexicon */
  const addWords = function (words, isFrozen = false) {
    const world = this.world();
    const { methods, model } = world;
    if (!words) {
      return
    }
    // normalize tag vals
    Object.entries(words).forEach(([k, v]) => {
      if (typeof v === 'string' && v.startsWith('#')) {
        words[k] = v.replace(/^#/, '');
      }
    });
    // these words go into a seperate lexicon
    if (isFrozen === true) {
      const { lex, _multi } = methods.one.expandLexicon(words, world);
      Object.assign(model.one._multiCache, _multi);
      Object.assign(model.one.frozenLex, lex);
      return
    }
    // add some words to our lexicon
    if (methods.two.expandLexicon) {
      // do fancy ./two version
      const { lex, _multi } = methods.two.expandLexicon(words, world);
      Object.assign(model.one.lexicon, lex);
      Object.assign(model.one._multiCache, _multi);
    }
    // do basic ./one version
    const { lex, _multi } = methods.one.expandLexicon(words, world);
    Object.assign(model.one.lexicon, lex);
    Object.assign(model.one._multiCache, _multi);
  };

  var lib$5 = { addWords };

  const model$4 = {
    one: {
      lexicon: {}, //setup blank lexicon
      _multiCache: {},
      frozenLex: {}, //2nd lexicon
    },
  };

  var lexicon$3 = {
    model: model$4,
    methods: methods$g,
    compute: compute$3,
    lib: lib$5,
    hooks: ['lexicon'],
  };

  // edited by Spencer Kelly
  // credit to https://github.com/BrunoRB/ahocorasick by Bruno Roberto Búrigo.

  const tokenize$2 = function (phrase, world) {
    const { methods, model } = world;
    const terms = methods.one.tokenize.splitTerms(phrase, model).map(t => methods.one.tokenize.splitWhitespace(t, model));
    return terms.map(term => term.text.toLowerCase())
  };

  // turn an array or object into a compressed aho-corasick structure
  const buildTrie = function (phrases, world) {

    // const tokenize=methods.one.
    const goNext = [{}];
    const endAs = [null];
    const failTo = [0];

    const xs = [];
    let n = 0;
    phrases.forEach(function (phrase) {
      let curr = 0;
      // let wordsB = phrase.split(/ /g).filter(w => w)
      const words = tokenize$2(phrase, world);
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (goNext[curr] && Object.hasOwn(goNext[curr], word)) {
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
    for (const word in goNext[0]) {
      n = goNext[0][word];
      failTo[n] = 0;
      xs.push(n);
    }

    while (xs.length > 0) {
      const r = xs.shift();
      // for each symbol a such that g(r, a) = s
      const keys = Object.keys(goNext[r]);
      for (let i = 0; i < keys.length; i += 1) {
        const word = keys[i];
        const s = goNext[r][word];
        xs.push(s);
        // set state = f(r)
        n = failTo[r];
        while (n > 0 && !Object.hasOwn(goNext[n], word)) {
          n = failTo[n];
        }
        if (Object.hasOwn(goNext, n)) {
          const fs = goNext[n][word];
          failTo[s] = fs;
          if (endAs[fs]) {
            endAs[s] ||= [];
            endAs[s] = endAs[s].concat(endAs[fs]);
          }
        } else {
          failTo[s] = 0;
        }
      }
    }
    return { goNext, endAs, failTo }
  };

  // console.log(buildTrie(['smart and cool', 'smart and nice']))

  // follow our trie structure
  const scanWords = function (terms, trie, opts) {
    let n = 0;
    const results = [];
    for (let i = 0; i < terms.length; i++) {
      const word = terms[i][opts.form] || terms[i].normal;
      // main match-logic loop:
      while (n > 0 && (trie.goNext[n] === undefined || !Object.hasOwn(trie.goNext[n], word))) {
        n = trie.failTo[n] || 0; // (usually back to 0)
      }
      // did we fail?
      if (!Object.hasOwn(trie.goNext[n], word)) {
        continue
      }
      n = trie.goNext[n][word];
      if (trie.endAs[n]) {
        const arr = trie.endAs[n];
        for (let o = 0; o < arr.length; o++) {
          const len = arr[o];
          const term = terms[i - len + 1];
          const [no, start] = term.index;
          results.push([no, start, start + len, term.id]);
        }
      }
    }
    return results
  };

  const cacheMiss = function (words, cache) {
    for (let i = 0; i < words.length; i += 1) {
      if (cache.has(words[i])) {
        return false
      }
    }
    return true
  };

  const scan = function (view, trie, opts) {
    let results = [];
    opts.form ||= 'normal';
    const docs = view.docs;
    if (!trie.goNext || !trie.goNext[0]) {
      console.error('Compromise invalid lookup trie');//eslint-disable-line
      return view.none()
    }
    const firstWords = Object.keys(trie.goNext[0]);
    // do each phrase
    for (let i = 0; i < docs.length; i++) {
      // can we skip the phrase, all together?
      if (view._cache && view._cache[i] && cacheMiss(firstWords, view._cache[i]) === true) {
        continue
      }
      const terms = docs[i];
      const found = scanWords(terms, trie, opts);
      if (found.length > 0) {
        results = results.concat(found);
      }
    }
    return view.update(results)
  };

  function api$8 (View) {

    /** find all matches in this document */
    View.prototype.lookup = function (input, opts = {}) {
      if (!input) {
        return this.none()
      }
      if (typeof input === 'string') {
        input = [input];
      }
      const trie = isObject(input) ? input : buildTrie(input, this.world);
      let res = scan(this, trie, opts);
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

  /** pre-compile a list of matches to lookup */
  const lib$4 = {
    /** turn an array or object into a compressed trie*/
    buildTrie: function (input) {
      const trie = buildTrie(input, this.world());
      return compress(trie)
    }
  };
  // add alias
  lib$4.compile = lib$4.buildTrie;

  var lookup = {
    api: api$8,
    lib: lib$4
  };

  const relPointer = function (ptrs, parent) {
    if (!parent) {
      return ptrs
    }
    ptrs.forEach(ptr => {
      const n = ptr[0];
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
    let { ptrs } = res;
    const { byGroup } = res;
    ptrs = relPointer(ptrs, parent);
    Object.keys(byGroup).forEach(k => {
      byGroup[k] = relPointer(byGroup[k], parent);
    });
    return { ptrs, byGroup }
  };

  // turn any matchable input intp a list of matches
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

  // did they pass-in a compromise object?
  const isView = val => val && isObject(val) && val.isView === true;

  const isNet = val => val && isObject(val) && val.isNet === true;

  // sweep options when only finding, not tagging
  const noTag = { tagger: false };

  // parse the match-syntax, then run it over the docs
  const doMatch = (view, regs, group, opts, justOne) => {
    regs = parseRegs(regs, opts, view.world);
    return view.methods.one.match(view.docs, { regs, group, justOne }, view._cache)
  };

  // turn match results into a view
  const asView = (view, res) => {
    const { ptrs, byGroup } = fixPointers(res, view.fullPointer);
    const out = view.toView(ptrs);
    out._groups = byGroup;
    return out
  };

  const match$1 = function (regs, group, opts) {
    // support param as view object
    if (isView(regs)) {
      return this.intersection(regs)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, noTag).view.settle()
    }
    return asView(this, doMatch(this, regs, group, opts))
  };

  const matchOne = function (regs, group, opts) {
    // support at view as a param
    if (isView(regs)) {
      return this.intersection(regs).eq(0)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, { tagger: false, matchOne: true }).view
    }
    return asView(this, doMatch(this, regs, group, opts, true))
  };

  const has = function (regs, group, opts) {
    // support view as input
    if (isView(regs)) {
      return this.intersection(regs).fullPointer.length > 0
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      return this.sweep(regs, noTag).view.found
    }
    return doMatch(this, regs, group, opts, true).ptrs.length > 0
  };

  // keep only the matches that do (or don't) contain this match
  const ifBy = want => function (regs, group, opts) {
    // support view as input
    if (isView(regs)) {
      return this.filter(m => m.intersection(regs).found === want)
    }
    // support a compiled set of matches
    if (isNet(regs)) {
      const m = this.sweep(regs, noTag).view.settle();
      return this.filter(v => v.intersection(m).found === want)
    }
    // otherwise parse the match string
    regs = parseRegs(regs, opts, this.world);
    const todo = { regs, group, justOne: true };
    const cache = this._cache || [];
    const view = this.filter((m, i) => {
      return (this.methods.one.match(m.docs, todo, cache[i]).ptrs.length > 0) === want
    });
    // try to reconstruct the cache
    if (this._cache) {
      view._cache = view.ptrs.map(ptr => cache[ptr[0]]);
    }
    return view
  };

  var match$2 = { matchOne, match: match$1, has, if: ifBy(true), ifNo: ifBy(false) };

  // the words before (or after) each match, in its sentence
  const lookaround = function (view, isAfter, regs, group, opts) {
    const { indexN } = view.methods.one.pointer;
    const { document } = view;
    const dir = isAfter ? -1 : 1;
    const ptrs = [];
    const byN = indexN(view.fullPointer);
    Object.keys(byN).forEach(k => {
      // check only the earliest (or latest) match in the sentence
      const [n, start, end] = byN[k].sort((a, b) => (a[1] > b[1] ? dir : -dir))[0];
      if (isAfter) {
        if (end < document[n].length) {
          ptrs.push([n, end, document[n].length]);
        }
      } else if (start > 0) {
        ptrs.push([n, 0, start]);
      }
    });
    const words = view.toView(ptrs);
    if (!regs) {
      return words
    }
    return words.match(regs, group, opts)
  };

  // extend each match left (or right), while the terms beside it match
  const growSide = function (view, isRight, regs, group, opts) {
    if (typeof regs === 'string') {
      regs = view.world.methods.one.parseMatch(regs, opts, view.world);
    }
    // ensure matches are beside us
    if (isRight) {
      regs[0].start = true;
    } else {
      regs[regs.length - 1].end = true;
    }
    const ptrs = view.fullPointer;
    view.forEach((m, n) => {
      const more = isRight ? m.after(regs, group) : m.before(regs, group);
      if (more.found) {
        const terms = more.terms();
        if (isRight) {
          ptrs[n][2] += terms.length;
          ptrs[n][4] = null; //remove end-id
        } else {
          ptrs[n][1] -= terms.length;
          ptrs[n][3] = terms.docs[0][0].id;
        }
      }
    });
    return view.update(ptrs)
  };

  // bind a direction to a method
  const side = (fn, flag) => function (regs, group, opts) {
    return fn(this, flag, regs, group, opts)
  };

  const grow = function (regs, group, opts) {
    return this.growRight(regs, group, opts).growLeft(regs, group, opts)
  };

  var lookaround$1 = {
    before: side(lookaround, false),
    after: side(lookaround, true),
    growLeft: side(growSide, false),
    growRight: side(growSide, true),
    grow,
  };

  // do the pointers intersect?
  const doesOverlap = function (a, b) {
    if (a[0] !== b[0]) {
      return false
    }
    const [, startA, endA] = a;
    const [, startB, endB] = b;
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
    const byN = {};
    ptrs.forEach(ref => {
      byN[ref[0]] ||= [];
      byN[ref[0]].push(ref);
    });
    return byN
  };

  // remove exact duplicates
  const uniquePtrs = function (arr) {
    const obj = {};
    for (let i = 0; i < arr.length; i += 1) {
      obj[arr[i].join(',')] = arr[i];
    }
    return Object.values(obj)
  };

  // turn a match-string, array, or view into a view
  const getDoc$1 = (reg, view, group) => {
    if (typeof reg === 'string' || Array.isArray(reg)) {
      return view.match(reg, group)
    }
    if (!reg) {
      return view.none()
    }
    // support pre-parsed reg object
    return reg
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

  const combine = function (left, right) {
    return [left[0], left[1], right[2]]
  };

  const addIds$1 = function (ptr, view) {
    const [n, start, end] = ptr;
    if (view.document[n]?.[start]) {
      ptr[3] ||= view.document[n][start].id;
      if (view.document[n][end - 1]) {
        ptr[4] ||= view.document[n][end - 1].id;
      }
    }
    return ptr
  };

  // split each match, then collect the pieces into pointers
  const split = function (view, m, group, collect) {
    const { splitAll } = view.methods.one.pointer;
    const splits = getDoc$1(m, view, group).fullPointer;
    const all = splitAll(view.fullPointer, splits);
    const res = collect(all).filter(p => p).map(p => addIds$1(p, view));
    return view.update(res)
  };

  const methods$f = {};
  // [before], [match], [after]
  methods$f.splitOn = function (m, group) {
    return split(this, m, group, all => all.flatMap(o => [o.passthrough, o.before, o.match, o.after]))
  };

  // [before], [match after]
  methods$f.splitBefore = function (m, group) {
    return split(this, m, group, all => {
      // repair matches to favor [match, after]
      // - instead of [before, match]
      for (let i = 0; i < all.length; i += 1) {
        // move a before to a preceding after
        if (!all[i].after && all[i + 1]?.before) {
          // ensure it's from the same original sentence
          if (all[i].match && all[i].match[0] === all[i + 1].before[0]) {
            all[i].after = all[i + 1].before;
            delete all[i + 1].before;
          }
        }
      }
      return all.flatMap(o => {
        // a, [x, b]
        if (o.match && o.after) {
          return [o.passthrough, o.before, combine(o.match, o.after)]
        }
        // a, [x], b
        return [o.passthrough, o.before, o.match]
      })
    })
  };

  // [before match], [after]
  methods$f.splitAfter = function (m, group) {
    return split(this, m, group, all => all.flatMap(o => {
      if (o.before && o.match) {
        return [o.passthrough, combine(o.before, o.match), o.after]
      }
      return [o.passthrough, o.before, o.match, o.after]
    }))
  };
  methods$f.split = methods$f.splitAfter;

  // check if two pointers are perfectly consecutive
  const isNeighbour = function (ptrL, ptrR) {
    // validate
    if (!ptrL || !ptrR) {
      return false
    }
    // same sentence
    if (ptrL[0] !== ptrR[0]) {
      return false
    }
    // ensure R starts where L ends
    return ptrL[2] === ptrR[1]
  };

  // join two neighbouring words, if they both match
  const mergeIf = function (doc, lMatch, rMatch) {
    const world = doc.world;
    const parseMatch = world.methods.one.parseMatch;
    lMatch ||= '.$'; //defaults
    rMatch ||= '^.';
    const leftMatch = parseMatch(lMatch, {}, world);
    const rightMatch = parseMatch(rMatch, {}, world);
    // ensure end-requirement to left-match, start-requiremnts to right match
    leftMatch[leftMatch.length - 1].end = true;
    rightMatch[0].start = true;
    // let's get going.
    const ptrs = doc.fullPointer;
    const res = [ptrs[0]];
    for (let i = 1; i < ptrs.length; i += 1) {
      const ptrL = res[res.length - 1];
      const ptrR = ptrs[i];
      const left = doc.update([ptrL]);
      const right = doc.update([ptrR]);
      // should we marge left+right?
      if (isNeighbour(ptrL, ptrR) && left.has(leftMatch) && right.has(rightMatch)) {
        // merge right ptr into existing result
        res[res.length - 1] = [ptrL[0], ptrL[1], ptrR[2], ptrL[3], ptrR[4]];
      } else {
        res.push(ptrR);
      }
    }
    // return new pointers
    return doc.update(res)
  };

  const methods$e = {
    //  merge only if conditions are met
    joinIf: function (lMatch, rMatch) {
      return mergeIf(this, lMatch, rMatch)
    },
    // merge all neighbouring matches
    join: function () {
      return mergeIf(this)
    },
  };

  const methods$d = { ...match$2, ...lookaround$1, ...methods$f, ...methods$e };
  // aliases
  methods$d.lookBehind = methods$d.before;
  methods$d.lookBefore = methods$d.before;

  methods$d.lookAhead = methods$d.after;
  methods$d.lookAfter = methods$d.after;

  methods$d.notIf = methods$d.ifNo;
  const matchAPI = function (View) {
    Object.assign(View.prototype, methods$d);
  };

  // Split parenthesized match blocks without retrying long rejected prefixes or
  // bodies. Preserve the original grammar, including its greedy capture header.
  const prefix$1 = new Set('!~[^');
  const suffix$1 = new Set('?]+*$~{},0123456789');
  const whitespace$2 = /\s/;

  const splitGroups = str => {
    if (!str.includes('(') || !str.includes(')')) return [str]
    const length = str.length;
    const afterSuffix = new Uint32Array(length + 1);
    const bodyEnd = new Uint32Array(length);
    const captureEnd = new Uint32Array(length);
    afterSuffix[length] = length;
    let close = -1;
    let capture = 0;
    for (let i = length - 1; i >= 0; i--) {
      afterSuffix[i] = suffix$1.has(str[i]) ? afterSuffix[i + 1] : i;
      if (str[i] === ')') close = i;
      if (str[i] === '(' && close >= i + 3 && str[close - 1] !== '\\') {
        const end = afterSuffix[close + 1];
        if (end === length || whitespace$2.test(str[end])) bodyEnd[i] = end;
      }
      // The optional <...> header cannot cross another '<', and prefers the
      // rightmost '>' which is followed by a valid parenthesized block.
      if (str[i] === '<') {
        captureEnd[i] = capture;
        capture = 0;
      } else if (str[i] === '>' && !capture) {
        // the block may be negative - [<name>!(a|b)]
        capture = bodyEnd[str[i + 1] === '!' ? i + 2 : i + 1] || 0;
      }
    }
    const parts = [];
    let previous = 0;
    let i = 0;
    while (i < length) {
      const start = i;
      while (i < length && prefix$1.has(str[i])) i++;
      const end = str[i] === '<' ? captureEnd[i] : bodyEnd[i];
      if (end) {
        parts.push(str.slice(previous, start), str.slice(start, end));
        // The old delimiter consumes one following whitespace character.
        i = end < length ? end + 1 : end;
        previous = i;
      } else if (i === start) {
        i++;
      }
    }
    parts.push(str.slice(previous));
    return parts
  };

  // Split out /regex/ tokens - 'foo /yes/' and not 'foo/no/bar' - in linear time.
  // Has the grammar of this pattern, which rescans the line for each rejected opener:
  // (?:^|\s)([![^]*(?:<[^<]*>)?\/.*?[^\\/]\/[?\]+*$~]*)(?=\s|$)
  const prefix = new Set('![^');
  const suffix = new Set('?]+*$~');
  const newline = new Set('\n\r  '); // what '.' can't cross
  const whitespace$1 = /\s/;

  const splitRegs = str => {
    if (!str.includes('/')) {
      return [str]
    }
    const length = str.length;
    const afterSuffix = new Uint32Array(length + 1);
    const ends = new Uint32Array(length); // a token's end, by its opening '/' or '<'
    afterSuffix[length] = length;
    let close = 0; // the nearest valid closing, for a body starting at i+1
    let capture = 0; // the rightmost valid '>' wins, and it can't cross another '<'
    for (let i = length - 1; i >= 0; i--) {
      if (str[i] === '/') {
        ends[i] = close;
      }
      afterSuffix[i] = suffix.has(str[i]) ? afterSuffix[i + 1] : i;
      if (newline.has(str[i])) {
        close = 0;
      }
      if (str[i + 1] === '/' && str[i] !== '/' && str[i] !== '\\') {
        const end = afterSuffix[i + 2];
        if (end === length || whitespace$1.test(str[end])) {
          close = end;
        }
      }
      if (str[i] === '<') {
        ends[i] = capture;
        capture = 0;
      } else if (str[i] === '>' && !capture && str[i + 1] === '/') {
        capture = ends[i + 1];
      }
    }
    const parts = [];
    let previous = 0;
    // -1 stands in for the '^' start
    for (let i = -1; i < length; i++) {
      if (i === -1 || whitespace$1.test(str[i])) {
        let start = i + 1;
        while (prefix.has(str[start])) {
          start++;
        }
        const end = ends[start];
        if (end) {
          parts.push(str.slice(previous, Math.max(i, 0)), str.slice(i + 1, end));
          // the whitespace after this token can also open the next one
          previous = end + 1;
          i = end - 1;
        }
      }
    }
    parts.push(str.slice(previous));
    return parts
  };

  // any whitespace separates terms, the same as the tokenizer
  const byWord = /\s+/;

  const isBlock = str => {
    return /^[![^]*(<[^<]*>)?!?\(/.test(str) && /\)[?\]+*$~{},0-9]*$/.test(str)
  };
  const isReg = str => {
    return /^[![^]*(<[^<]*>)?\//.test(str) && /\/[?\]+*$~]*$/.test(str)
  };
  const never = () => false;

  const cleanUp = function (arr) {
    arr = arr.map(str => str.trim());
    arr = arr.filter(str => str);
    return arr
  };

  const parseBlocks = function (txt, opts = {}) {
    // {noRegex} - slashes are plain characters
    const isRegex = opts.noRegex ? never : isReg;
    // parse by /regex/ first
    const arr = opts.noRegex ? [txt] : splitRegs(txt);
    let res = [];
    // parse by (blocks), next
    arr.forEach(str => {
      if (isRegex(str)) {
        res.push(str);
        return
      }
      res = res.concat(splitGroups(str));
    });
    res = cleanUp(res);
    // split by spaces, now - but not inside (blocks) or /regexes/
    const final = res.flatMap(str => {
      if (isBlock(str) || isRegex(str)) {
        return str
      }
      return str.split(byWord)
    });
    return cleanUp(final)
  };

  const hasMinMax = /\{([0-9]+)?(, *[0-9]*)?\}/;
  const andSign = /&&/;
  // const hasDash = /\p{Letter}[-–—]\p{Letter}/u
  const captureName = /^<\s*([^\s>]+)\s*>/;
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
  const titleCase$1 = str => str.charAt(0).toUpperCase() + str.substring(1);
  const end = (str) => str.charAt(str.length - 1);
  const start = (str) => str.charAt(0);
  const stripStart = (str) => str.substring(1);
  const stripEnd = (str) => str.substring(0, str.length - 1);

  const stripBoth = function (str) {
    str = stripStart(str);
    str = stripEnd(str);
    return str
  };
  // is the token wrapped in these chars, like (foo)
  const wrapped = (str, a, b = a) => start(str) === a && end(str) === b;
  //
  const parseToken = function (w, opts, aliases) {
    const obj = {};
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
      if (end(w) === '?') {
        obj.optional = true;
        w = stripEnd(w);
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
          if (!res) {
            throw new SyntaxError('Invalid named capture: expected [<name> ...]')
          }
          if (res.length >= 2) {
            obj.group = res[1];
            w = w.replace(res[0], '');
          }
        }
      }
      //back-flags
      if (end(w) === '+' && !w.endsWith('\\+')) {
        obj.greedy = true;
        w = stripEnd(w);
      }
      // 'foo*' is zero or more
      if (w !== '*' && end(w) === '*' && !w.endsWith('\\*')) {
        obj.greedy = true;
        obj.optional = true;
        w = stripEnd(w);
      }
      if (start(w) === '!') {
        obj.negative = true;
        // obj.optional = true
        w = stripStart(w);
      }
      //soft-match
      if (wrapped(w, '~') && w.length > 2) {
        w = stripBoth(w);
        obj.fuzzy = true;
        obj.min = opts.fuzzy ?? 0.85;
        if (!/\(/.test(w)) {
          obj.word = w;
          return obj
        }
      }

      //regex - {noRegex} leaves it as a plain word, to avoid redos from user-input
      if (wrapped(w, '/') && w.length > 2 && !opts.noRegex) {
        w = stripBoth(w);
        if (opts.caseSensitive) {
          obj.use = 'text';
        }
        obj.regex = new RegExp(w); //potential vuln - security/detect-non-literal-regexp
        return obj
      }

      // support foo{1,9}
      if (hasMinMax.test(w)) {
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
      if (wrapped(w, '(', ')')) {
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
        const last = obj.choices.length - 1;
        obj.choices[last] = stripEnd(obj.choices[last]);
        // clean up the results
        obj.choices = obj.choices.map(s => s.trim());
        obj.choices = obj.choices.filter(s => s);
        //recursion alert!
        obj.choices = obj.choices.map(str => {
          return str.split(/\s+/).map(s => parseToken(s, opts, aliases))
        });
        w = '';
      }

      //root/sense overloaded
      if (wrapped(w, '{', '}')) {
        w = stripBoth(w);
        // obj.sense = w
        obj.root = w;
        if (/\//.test(w)) {
          const split = obj.root.split(/\//);
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
      if (wrapped(w, '<', '>')) {
        w = stripBoth(w);
        obj.chunk = titleCase$1(w);
        obj.greedy = true;
        return obj
      }
      if (wrapped(w, '%')) {
        w = stripBoth(w);
        obj.switch = w;
        return obj
      }
    }
    //do the actual token content
    if (start(w) === '#') {
      const name = stripStart(w);
      obj.tag = aliases?.[name];
      if (!obj.tag) {
        obj.tag = titleCase$1(name);
        obj.tag = aliases?.[obj.tag] || obj.tag;
      }
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
      w = w.replace('\\+', '+');
      w = w.replace('\\/', '/');
      if (opts.caseSensitive) {
        obj.use = 'text';
      } else {
        w = w.toLowerCase();
      }
      obj.word = w;
    }
    return obj
  };

  // Text recognition, rather than full email/URL validation. Share these rules with
  // the tagger so hyphens in recognized addresses survive tokenization.
  const email = /^[\w.!#$%&'*+/=?^`{|}~-]+@(?:[\w-]+\.)+[a-z]{2,}$/i;
  const explicitUrl = /^(?:https?:(?:\/\/)?|www\.)(?:[a-z0-9-]+\.)+[a-z]{2,}(?::[0-9]+)?(?:[/?#]\S*)?$/i;
  const bareUrl = /^(?:[a-z0-9-]+\.)+(?:com|net|gov|org|ly|edu|info|biz|dev|ru|jp|de|in|uk|br|io|ai)(?::[0-9]+)?(?:[/?#]\S*)?$/i;

  const isWebToken = function (str) {
    if (!str.includes('.')) {
      return false
    }
    let start = 0;
    let end = str.length;
    while (start < end && /[\s("'“‘<]/.test(str[start])) start++;
    while (end > start && /[\s).,!?:;"'”’>]/.test(str[end - 1])) end--;
    const text = str.slice(start, end);
    return email.test(text) || explicitUrl.test(text) || bareUrl.test(text)
  };

  const hasHyphen$1 = function (str, model) {
    const parts = str.split(/[-–—]/);
    if (parts.length <= 1) {
      return false
    }
    if (isWebToken(str)) {
      return false
    }
    const { prefixes, suffixes } = model.one;

    // l-theanine, x-ray
    if (parts[0].length === 1 && /[a-z]/i.test(parts[0])) {
      return false
    }
    //dont split 're-do'
    if (Object.hasOwn(prefixes, parts[0])) {
      return false
    }
    //dont split 'flower-like'
    parts[1] = parts[1].trim().replace(/[.?!]$/, '');
    if (Object.hasOwn(suffixes, parts[1])) {
      return false
    }
    //letter-number 'aug-20'
    const reg = /^([a-z\u00C0-\u00FF`"'/]+)[-–—]([a-z0-9\u00C0-\u00FF].*)/i;
    if (reg.test(str)) {
      return true
    }
    //number-letter '20-aug'
    const reg2 = /^[('"]?([0-9]{1,4})[-–—]([a-z\u00C0-\u00FF`"'/-]+[)'"]?$)/i;
    if (reg2.test(str)) {
      return true
    }
    return false
  };

  const splitHyphens$1 = function (word) {
    const arr = [];
    //support multiple-hyphenated-terms
    const hyphens = word.split(/[-–—]/);
    let whichDash = '-';
    const found = word.match(/[-–—]/);
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

  // match 're-do' -> ['re','do']
  // split them the same way the tokenizer does - 'x-ray' stays one word
  const splitHyphens = function (regs, world) {
    for (let i = regs.length - 1; i >= 0; i -= 1) {
      const reg = regs[i];
      if (reg.word && hasHyphen$1(reg.word, world.model)) {
        let words = reg.word.split(/[-–—]/g);
        words = words.filter(w => w).reverse();
        regs.splice(i, 1);
        words.forEach(w => {
          const obj = { ...reg };
          obj.word = w;
          regs.splice(i, 0, obj);
        });
      }
    }
    return regs
  };

  // add all inflections of this verb/noun/adjective
  const inflect = function (token, world, kind, fallback) {
    const { all } = world.methods.two.transform[kind] || {};
    if (!all) {
      return fallback
    }
    return all(token.root, world.model)
  };

  // explicitly-set POS - '{sweet/adjective}'
  const byPos = { Verb: 'verb', Noun: 'noun', Adjective: 'adjective' };

  // turn '{walk}' into 'walking', 'walked', etc
  const inflectRoot = function (regs, world) {
    // do we have compromise/two?
    regs = regs.map(token => {
      // a reg to convert '{foo}'
      if (token.root) {
        // check if compromise/two is loaded
        if (world.methods.two && world.methods.two.transform) {
          let choices = [];
          if (token.pos) {
            if (Object.hasOwn(byPos, token.pos)) {
              const kind = byPos[token.pos];
              choices = inflect(token, world, kind, kind === 'verb' ? [] : [token.root]);
            }
          } else {
            // do verb/noun/adj by default
            choices = [
              ...inflect(token, world, 'verb', []),
              ...inflect(token, world, 'noun', [token.root]),
              ...inflect(token, world, 'adjective', [token.root]),
            ];
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
        const shouldPack = token.choices.every(block => {
          if (block.length !== 1) {
            return false
          }
          const reg = block[0];
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

  /** parse a match-syntax string into json */
  const syntax = function (input, opts, world) {
    // fail-fast
    if (input === null || input === undefined || input === '') {
      return []
    }
    opts ||= {};
    if (typeof input === 'number') {
      input = String(input); //go for it?
    }
    let tokens = parseBlocks(input, opts);
    //turn them into objects
    tokens = tokens.map(str => parseToken(str, opts, world.model.one.tagAliases));
    // '~re-do~'
    tokens = splitHyphens(tokens, world);
    // '{walk}'
    tokens = inflectRoot(tokens, world);
    //clean up anything weird
    tokens = postProcess(tokens);
    // console.log(tokens)
    return tokens
  };

  const anyIntersection = function (setA, setB) {
    for (const elem of setB) {
      if (setA.has(elem)) {
        return true
      }
    }
    return false
  };
  // check words/tags against our cache
  const failFast = function (regs, cache) {
    for (let i = 0; i < regs.length; i += 1) {
      const reg = regs[i];
      if (reg.optional === true || reg.negative === true || reg.fuzzy === true) {
        continue
      }
      // is the word missing from the cache?
      if (reg.word !== undefined && !cache.has(reg.word)) {
        return true
      }
      // is the tag missing?
      if (reg.tag !== undefined && !cache.has('#' + reg.tag)) {
        return true
      }
      // are all of the fast-or words missing?
      if (reg.fastOr !== undefined && !anyIntersection(reg.fastOr, cache)) {
        return true
      }
    }
    return false
  };

  // fuzzy-match (damerau-levenshtein)
  // Based on  tad-lispy /node-damerau-levenshtein
  // https://github.com/tad-lispy/node-damerau-levenshtein/blob/master/index.js
  // count steps (insertions, deletions, substitutions, or transpositions)
  const editDistance = function (strA, strB) {
    const aLength = strA.length,
      bLength = strB.length;
    // fail-fast
    if (aLength === 0) {
      return bLength
    }
    if (bLength === 0) {
      return aLength
    }
    // If the limit is not defined it will be calculate from this and that args.
    const limit = (bLength > aLength ? bLength : aLength) + 1;
    if (Math.abs(aLength - bLength) > (limit || 100)) {
      return limit || 100
    }
    // init the array
    const matrix = [];
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
        const shouldUpdate =
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
    const length = Math.max(strA.length, strB.length);
    const relative = length === 0 ? 0 : steps / length;
    const similarity = 1 - relative;
    return similarity
  };

  // these methods are called with '@hasComma' in the match syntax
  // various unicode quotation-mark formats
  const startQuote =
    /([\u0022\uFF02\u0027\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F])/;

  const endQuote = /([\u0022\uFF02\u0027\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4])/;

  const hasHyphen = /^[-–—]$/;
  const hasDash$3 = / [-–—]{1,3} /;

  /** search the term's 'post' punctuation  */
  const hasPost = (term, punct) => term.post.indexOf(punct) !== -1;
  /** search the term's 'pre' punctuation  */
  // const hasPre = (term, punct) => term.pre.indexOf(punct) !== -1

  const methods$c = {
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
    hasEllipses: term => hasPost(term, '..') || hasPost(term, '…'),
    /** is there a semicolon after term word? */
    hasSemicolon: term => hasPost(term, ';'),
    /** is there a colon after term word? */
    hasColon: term => hasPost(term, ':'),
    /** is there a slash '/' in term word? */
    hasSlash: term => /\//.test(term.text),
    /** a hyphen connects two words like-term */
    hasHyphen: term => hasHyphen.test(term.post) || hasHyphen.test(term.pre),
    /** a dash separates words - like that */
    hasDash: term => hasDash$3.test(term.post) || hasDash$3.test(term.pre),
    /** is it multiple words combinded */
    hasContraction: term => Boolean(term.implicit),
    /** is it an acronym */
    isAcronym: term => term.tags.has('Acronym'),
    /** does it have any tags */
    isKnown: term => term.tags.size > 0,
    /** uppercase first letter, then a lowercase - also 'Tis */
    isTitleCase: term => /^['\u2019]?\p{Lu}[a-z'\u00C0-\u00FF]/u.test(term.text),
    /** uppercase all letters */
    isUpperCase: term => /^\p{Lu}+$/u.test(term.text),
  };
  // aliases
  methods$c.hasQuotation = methods$c.hasQuote;

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
      // support ~ fuzzy match
      if (reg.fuzzy === true) {
        if (reg.word === term.root) {
          return true
        }
        const score = fuzzyMatch(reg.word, term.normal);
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
      return term.tags.has(reg.tag)
    }
    //support @method
    if (reg.method !== undefined) {
      if (typeof methods$c[reg.method] === 'function' && methods$c[reg.method](term) === true) {
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
      if (reg.regex.global || reg.regex.sticky) {
        const lastIndex = reg.regex.lastIndex;
        try {
          reg.regex.lastIndex = 0;
          return reg.regex.test(str)
        } finally {
          reg.regex.lastIndex = lastIndex;
        }
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
      const str = term.root || term.implicit || term.machine || term.normal;
      return reg.fastOr.has(str) || reg.fastOr.has(term.text)
    }
    //support slower (one|two)
    // each choice is a list of tokens - this term can only test the first one
    if (reg.choices !== undefined) {
      // try to support && operator
      if (reg.operator === 'and') {
        // must match them all
        return reg.choices.every(r => wrapMatch(term, r[0], index, length))
      }
      // or must match one
      return reg.choices.some(r => wrapMatch(term, r[0], index, length))
    }
    return false
  };
  // wrap result for !negative match logic
  wrapMatch = function (t, reg, index, length) {
    const result = doesMatch$1(t, reg, index, length);
    if (reg.negative === true) {
      return !result
    }
    return result
  };

  const getGroup$1 = function (state, term_index) {
    // Most attempts fail without capturing anything.
    if (!state.groups) {
      state.groups = {};
    }
    if (state.groups[state.inGroup]) {
      return state.groups[state.inGroup]
    }
    state.groups[state.inGroup] = {
      start: term_index,
      length: 0,
    };
    return state.groups[state.inGroup]
  };

  // add any terms used since startAt, to the current capture
  const logGroup = function (state, startAt) {
    if (state.hasGroup === true && state.t > startAt) {
      getGroup$1(state, startAt).length += state.t - startAt;
    }
  };

  // test the reg against the term at array-index t
  const matchAt = (state, reg, t) => wrapMatch(state.terms[t], reg, state.start_i + t, state.phrase_length);

  // anchors should not apply to repeated terms
  const noAnchors = reg => ({ ...reg, start: false, end: false });

  // how many terms a match must have - optional and negative regs don't count
  const getMinLength = regs => regs.filter(reg => reg.optional !== true && reg.negative !== true).length;

  // for greedy checking, we no longer care about the reg.start
  // value, and leaving it can cause failures for anchored greedy
  // matches.  ditto for end-greedy matches: we need an earlier non-
  // ending match to succceed until we get to the actual end.
  const getGreedy = function (state, endReg) {
    const reg = noAnchors(state.regs[state.r]);
    const start = state.t;
    for (; state.t < state.terms.length; state.t += 1) {
      // the number of terms we've matched, if we stop here
      const count = state.t - start + 1;
      //stop for next-reg match - unless we're still under our min
      if (endReg && matchAt(state, endReg, state.t)) {
        if (reg.min === undefined || count >= reg.min) {
          return state.t
        }
      }
      // is it max-length now?
      if (reg.max !== undefined && count === reg.max) {
        return state.t
      }
      //stop here
      if (matchAt(state, reg, state.t) === false) {
        // is it too short?
        if (reg.min !== undefined && count < reg.min) {
          return null
        }
        return state.t
      }
    }
    // we ran out of terms - did we reach our min?
    if (reg.min !== undefined && state.t - start + 1 < reg.min) {
      return null
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
      if (matchAt(state, nextReg, t) === true) {
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
        const tmpReg = { ...reg, end: false };
        if (matchAt(state, tmpReg, state.t) === true) {
          // console.log(`endGreedy ${state.terms[state.t].normal}`)
          return true
        }
      }
    }
    return false
  };

  //support 'unspecific greedy' .* properly
  // its logic is 'greedy until', where it's looking for the next token
  // '.+ foo' means we check for 'foo', indefinetly
  const doAstrix = function (state) {
    const { regs } = state;
    const reg = regs[state.r];

    const skipto = greedyTo(state, regs[state.r + 1]);
    //maybe we couldn't find it
    if (skipto === null || skipto === state.offset) {
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
      const g = getGroup$1(state, state.t);
      // accumulate onto any tokens already captured before the wildcard,
      // so '[one .* after]' keeps its leading (and trailing) tokens
      g.length += skipto - state.t;
    }
    state.t = skipto;
    // log(`✓ |greedy|`)
    return true
  };

  // try to match a list of tokens, starting at state.t + skipN
  // returns the number of terms it consumed, or 0 for no-match
  const tryChoice = function (state, regs, skipN) {
    let len = 0;
    for (let w = 0; w < regs.length; w += 1) {
      const cr = regs[w];
      const t = state.t + skipN + len;
      if (state.terms[t] === undefined) {
        return 0
      }
      if (matchAt(state, cr, t) !== true) {
        return 0
      }
      len += 1;
      // this can be greedy - '(foo+ bar)'
      if (cr.greedy === true) {
        // like getGreedy, anchors should not apply to the repeated terms
        const gr = noAnchors(cr);
        for (let i = t + 1; i < state.terms.length; i += 1) {
          if (matchAt(state, gr, i) !== true) {
            break
          }
          len += 1;
        }
      }
    }
    return len
  };

  // match the first choice that works - '(a b|c)'
  const tryChoices = function (state, skipN) {
    const block = state.regs[state.r];
    for (let c = 0; c < block.choices.length; c += 1) {
      const regs = block.choices[c];
      if (!Array.isArray(regs)) {
        return 0
      }
      const len = tryChoice(state, regs, skipN);
      if (len > 0) {
        return len
      }
    }
    return 0
  };

  const tryAndBlock = function (state, skipN) {
    let longest = 0;
    // all blocks must match, and we return the greediest match
    const reg = state.regs[state.r];
    const allDidMatch = reg.choices.every(block => {
      //  for multi-word blocks, all must match
      const allWords = block.every((cr, w_index) => {
        const tryTerm = state.t + skipN + w_index;
        if (state.terms[tryTerm] === undefined) {
          return false
        }
        return matchAt(state, cr, tryTerm)
      });
      if (allWords === true && block.length > longest) {
        longest = block.length;
      }
      return allWords
    });
    if (allDidMatch === true) {
      return longest
    }
    return 0
  };

  // match a block, and keep going if it's greedy - '(a b|c)+', '(a && b){2,3}'
  const repeatBlock = function (state, tryBlock) {
    const reg = state.regs[state.r];
    let skipN = tryBlock(state, 0);
    if (skipN === 0 || reg.greedy !== true) {
      return skipN
    }
    const next = state.regs[state.r + 1];
    let count = 1;
    while (count !== reg.max) {
      const t = state.t + skipN;
      const term = state.terms[t];
      const hasMin = reg.min === undefined || count >= reg.min;
      // stop for the next token, like 'foo+ bar'
      if (!term || (next && hasMin && matchAt(state, next, t))) {
        break
      }
      const more = tryBlock(state, skipN);
      if (more === 0) {
        break
      }
      skipN += more;
      count += 1;
    }
    // 'foo{2,3}' was too short
    if (reg.min !== undefined && count < reg.min) {
      return 0
    }
    return skipN
  };

  const doOrBlock$1 = state => repeatBlock(state, tryChoices);
  const doAndBlock$1 = state => repeatBlock(state, tryAndBlock);

  // 'foo? foo' matches are tricky.
  // should this optional token leave its term for the next one?
  const leaveForNext = function (state) {
    const next = state.regs[state.r + 1];
    if (!next || !matchAt(state, next, state.t)) {
      return false
    }
    // but does the next reg match the next term??
    // only skip if it doesn't
    const nextTerm = state.terms[state.t + 1];
    return !nextTerm || !matchAt(state, next, state.t + 1)
  };

  const negGreedy = function (state, reg, nextReg) {
    let skip = 0;
    for (let t = state.t; t < state.terms.length; t += 1) {
      let found = matchAt(state, reg, t);
      // we don't want a match, here
      if (found) {
        break//stop going
      }
      // are we doing 'greedy-to'?
      // - "!foo+ after"  should stop at 'after'
      if (nextReg) {
        found = matchAt(state, nextReg, t);
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
    // '!foo* after' can match nothing, and leave this term for the next token
    if (skip === 0) {
      return reg.optional === true //dead, otherwise
    }
    // did we satisfy min for !foo{min,max}
    if (reg.min && reg.min > skip) {
      return false//dead
    }
    state.t += skip;
    // state.r += 1
    return true
  };

  // a negative block didn't find its terms - that's good news
  const negativeBlock = function (state) {
    const reg = state.regs[state.r];
    const startAt = state.t;
    let alive = true;
    if (reg.greedy === true) {
      // '!(a|b)+' keeps going - anchors should not apply to the repeated terms
      alive = negGreedy(state, noAnchors({ ...reg, negative: false }), state.regs[state.r + 1]);
    } else if (!reg.optional) {
      // but a '!(a b)?' can pass-through without consuming anything
      state.t += 1;
    }
    logGroup(state, startAt);
    return alive
  };

  // shared logic for '(a|b)' or-blocks and '(a && b)' and-blocks
  const makeBlock = tryBlock => function (state) {
    const { regs } = state;
    const reg = regs[state.r];
    const skipNum = tryBlock(state);
    // did we find a match?
    if (skipNum) {
      // handle 'not' logic - but '!(a|b)*' can match nothing
      if (reg.negative === true) {
        return reg.optional === true && reg.greedy === true
      }
      // '(a|b)? a' - go on to the next token, without using this term
      if (reg.optional === true && leaveForNext(state)) {
        return true
      }
      // tuck in as named-group
      if (state.hasGroup === true) {
        const g = getGroup$1(state, state.t);
        g.length += skipNum;
      }
      // ensure we're at the end
      if (reg.end === true) {
        const end = state.phrase_length;
        if (state.t + state.start_i + skipNum !== end) {
          return null
        }
      }
      state.t += skipNum;
      return true
    }
    // we didn't find it - for a negative-block, that's good news
    if (reg.negative === true) {
      return negativeBlock(state)
    }
    if (!reg.optional) {
      return null //die
    }
    return true
  };

  // '(a|b)' - match any choice on the term
  var doOrBlock = makeBlock(doOrBlock$1);

  // '(foo && #Noun)' - require all matches on the term
  var doAndBlock = makeBlock(doAndBlock$1);

  // '!foo' should match anything that isn't 'foo'
  // if it matches, return false
  const doNegative = function (state) {
    const { regs } = state;
    const reg = regs[state.r];
    const startAt = state.t;

    // match *anything* but this term
    const tmpReg = { ...reg };
    tmpReg.negative = false; // try removing it

    // found it? if so, we die here
    const found = matchAt(state, tmpReg, state.t);
    if (found) {
      // but '!foo*' can match nothing - '!foo?' stays a lookahead
      return reg.optional === true && reg.greedy === true
    }
    // negative greedy - !foo+  - super hard!
    if (reg.greedy) {
      // like getGreedy, anchors should not apply to the repeated terms
      const alive = negGreedy(state, noAnchors(tmpReg), regs[state.r + 1]);
      logGroup(state, startAt);
      return alive
    }
    // should we skip the term too?
    if (reg.optional) {
      // "before after" - "before !foo? after"
      // does the next reg match the this term?
      const nextReg = regs[state.r + 1];
      if (nextReg) {
        const fNext = matchAt(state, nextReg, state.t);
        if (fNext) {
          return true // leave the term, and any capture, to the next reg
        }
        if (nextReg.optional && regs[state.r + 2]) {
          // ugh. ok,
          // support "!foo? extra? need"
          // but don't scan ahead more than that.
          const fNext2 = matchAt(state, regs[state.r + 2], state.t);
          if (fNext2) {
            return true
          }
        }
      }
    }
    state.t += 1;
    logGroup(state, startAt);
    return true
  };

  // keep 'foo+' or 'foo*' going..
  const greedyMatch = function (state) {
    const { regs, phrase_length } = state;
    const reg = regs[state.r];
    // foo{2,4} min-lengths are enforced inside getGreedy
    state.t = getGreedy(state, regs[state.r + 1]);
    if (state.t === null) {
      return null //greedy was too short
    }
    // 'foo+$' - if also an end-anchor, ensure we really reached the end
    if (reg.end === true && state.start_i + state.t !== phrase_length) {
      return null //greedy didn't reach the end
    }
    return true
  };

  // for: ['we', 'have']
  // a match for "we have" should work as normal
  // but matching "we've" should skip over implict terms
  const contractionSkip = function (state) {
    const term = state.terms[state.t];
    const reg = state.regs[state.r];
    // did we match the first part of a contraction?
    if (!term.implicit || !state.terms[state.t + 1]?.implicit) {
      return
    }
    // we matched "we've", or @hasContraction - skip over all of its hidden words, [we, have]
    if (reg.word === term.normal || reg.method === 'hasContraction') {
      let next = state.terms[state.t + 1];
      // a hidden word has no text of its own - the next contraction starts at a word that does
      while (next && next.implicit && next.text === '') {
        state.t += 1;
        next = state.terms[state.t + 1];
      }
    }
  };

  // '[foo]' should also be logged as a group
  const setGroup = function (state, startAt) {
    const reg = state.regs[state.r];
    // Get or create capture group
    const g = getGroup$1(state, startAt);
    // Update group - add greedy or increment length
    if (state.t - state.offset > 1 && reg.greedy) {
      g.length += state.t - startAt;
    } else {
      g.length++;
    }
  };

  // when a reg matches a term
  const simpleMatch = function (state) {
    const { regs } = state;
    const reg = regs[state.r];
    const term = state.terms[state.t];
    const startAt = state.t;
    // if it's a negative optional match... :0
    if (reg.optional && regs[state.r + 1] && reg.negative) {
      return true
    }
    // okay, it was a match, but if it's optional too,
    // go on to the next token, without using this term
    if (reg.optional && leaveForNext(state)) {
      return true
    }
    // Contraction skip:
    // did we match the first part of a contraction?
    if (term.implicit && state.terms[state.t + 1]) {
      contractionSkip(state);
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
      const alive = greedyMatch(state);
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

  // i formally apologize for how complicated this is.

  // choose how to consume this reg: a step function, null to die, or undefined to skip it
  const pickStep = function (reg, state) {
    // support 'unspecific greedy' .* properly
    if (reg.anything === true && reg.greedy === true) {
      return doAstrix
    }
    // slow-OR - multi-word OR (a|b|foo bar)
    if (reg.choices !== undefined && reg.operator === 'or') {
      return doOrBlock
    }
    // slow-AND - multi-word AND (#Noun && foo) blocks
    if (reg.choices !== undefined && reg.operator === 'and') {
      return doAndBlock
    }
    // support '.' as any-single
    if (reg.anything === true) {
      // '!.' negative anything should insta-fail
      if (reg.negative) {
        return null
      }
      return simpleMatch
    }
    // support 'foo*$' until the end
    if (isEndGreedy(reg, state) === true) {
      return simpleMatch
    }
    // ok, it doesn't match - but maybe it wasn't *supposed* to?
    if (reg.negative) {
      // we want *anything* but this term
      return doNegative
    }
    // ok, finally test the term-reg
    if (matchAt(state, reg, state.t) === true) {
      return simpleMatch
    }
    //ok who cares, keep going
    if (reg.optional === true) {
      return undefined
    }
    // finally, we die
    return null
  };

  /**
   * try a sequence of match tokens ('regs')
   * on a sequence of terms,
   * starting at this certain term.
   */
  const tryHere = function (terms, regs, start_i, phrase_length, offset = 0) {
    // console.log(`\n\n:start: '${terms[0].text}':`)
    if (offset >= terms.length || regs.length === 0) {
      return null
    }
    // Use the original terms with a cursor instead of copying the remaining
    // sentence at every starting position. origin maps array indices to match
    // pointers; offset marks the beginning of this attempt within the array.
    const origin = start_i - offset;
    const state = {
      t: offset,
      offset: offset,
      terms: terms,
      r: 0,
      regs: regs,
      groups: null,
      start_i: origin,
      phrase_length: phrase_length,
      inGroup: null,
    };

    // we must satisfy every token in 'regs'
    // if we get to the end, we have a match.
    for (; state.r < regs.length; state.r += 1) {
      const reg = regs[state.r];
      // Check if this reg has a named capture group
      state.hasGroup = Boolean(reg.group);
      // Reuse previous capture group if same
      state.inGroup = state.hasGroup ? reg.group : null;
      //have we run-out of terms?
      if (!state.terms[state.t]) {
        //are all remaining regs optional or negative?
        const alive = regs.slice(state.r).some(remain => !remain.optional);
        if (alive === false) {
          break //done!
        }
        return null // die
      }
      const step = pickStep(reg, state);
      if (step === null) {
        return null
      }
      if (step && !step(state)) {
        return null
      }
    }
    //return our results, as pointers
    const pntr = [null, start_i, state.t + origin];
    if (pntr[1] === pntr[2]) {
      return null //found 0 terms
    }
    const groups = {};
    if (state.groups) {
      Object.keys(state.groups).forEach(k => {
        const o = state.groups[k];
        const start = origin + o.start;
        groups[k] = [null, start, start + o.length];
      });
    }
    return { pointer: pntr, groups: groups }
  };

  // support returning a subset of a match
  // like 'foo [bar] baz' -> bar
  const getGroup = function (res, group) {
    const ptrs = [];
    const byGroup = {};
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
        Object.entries(r.groups).forEach(([k, ptr]) => {
          byGroup[k] ||= [];
          byGroup[k].push(ptr);
        });
      });
    }
    return { ptrs, byGroup }
  };

  // drop any results that contain this match
  const notIf = function (results, not, docs) {
    return results.filter(res => {
      const [n, start, end] = res.pointer;
      const terms = docs[n].slice(start, end);
      return !terms.some((_t, i) => tryHere(terms, not, i, terms.length, i) !== null)
    })
  };

  // Compiled sweeps cache this check; editable public patterns are rechecked.
  const isFixed = regs => regs.every(reg => !reg.optional && !reg.greedy &&
    !reg.negative && !reg.choices && !reg.anything &&
    (reg.word !== undefined || reg.tag !== undefined || reg.switch !== undefined || reg.fastOr !== undefined));

  const fromFixed = (terms, regs, start, length, offset = 0) => {
    if (offset + regs.length > terms.length) {
      return null
    }
    for (let r = 0; r < regs.length; r += 1) {
      const term = terms[offset + r];
      // A literal contraction can consume more than one term.
      if (term.implicit) {
        return tryHere(terms, regs, start, length, offset)
      }
      if (wrapMatch(term, regs[r], start + r, length) !== true) {
        return null
      }
    }
    // Failed attempts never need capture state.
    const groups = {};
    for (let r = 0; r < regs.length; r += 1) {
      const name = regs[r].group;
      if (name) {
        if (!groups[name]) {
          groups[name] = [null, start + r, start + r];
        }
        groups[name][2] += 1;
      }
    }
    return { pointer: [null, start, start + regs.length], groups }
  };

  // make proper pointers
  const addSentence = function (res, n) {
    res.pointer[0] = n;
    Object.keys(res.groups).forEach(k => {
      res.groups[k][0] = n;
    });
    return res
  };

  const handleStart = function (terms, regs, n, attempt) {
    let res = attempt(terms, regs, 0, terms.length);
    if (res) {
      res = addSentence(res, n);
      return res //getGroup([res], group)
    }
    return null
  };

  // ok, here we go.
  const runMatch$1 = function (docs, todo, cache) {
    cache ||= [];
    const { regs, group, justOne, checkFirst } = todo;
    let results = [];
    if (!regs || regs.length === 0) {
      return { ptrs: [], byGroup: {} }
    }
    const attempt = (todo.fixed ?? isFixed(regs)) ? fromFixed : tryHere;

    // Compiled rules carry this value; public parsed patterns can still be edited
    // by callers, so calculate their minimum without caching on the token array.
    let minLength = todo.minLength;
    if (minLength === undefined) {
      minLength = getMinLength(regs);
    }
    docs: for (let n = 0; n < docs.length; n += 1) {
      const terms = docs[n];
      // let index = terms[0].index || []
      // can we skip this sentence?
      if (cache[n] && failFast(regs, cache[n])) {
        continue
      }
      // ^start regs only run once, per phrase
      if (regs[0].start === true) {
        const foundStart = handleStart(terms, regs, n, attempt);
        if (foundStart) {
          results.push(foundStart);
        }
        continue
      }
      //ok, try starting the match now from every term
      for (let i = 0; i < terms.length; i += 1) {
        // ensure it's long-enough
        if (terms.length - i < minLength) {
          break
        }
        // Compiled sweep rules can reject a start before allocating match state.
        if (checkFirst && !wrapMatch(terms[i], regs[0], i, terms.length)) {
          continue
        }
        let res = attempt(terms, regs, i, terms.length, i);
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
          const end = res.pointer[2];
          if (Math.abs(end - 1) > i) {
            i = Math.abs(end - 1);
          }
        }
      }
    }
    // ensure any end-results ($) match until the last term
    if (regs[regs.length - 1].end === true) {
      results = results.filter(res => {
        const n = res.pointer[0];
        return docs[n].length === res.pointer[2]
      });
    }
    if (todo.notIf) {
      results = notIf(results, todo.notIf, docs);
    }
    // grab the requested group
    results = getGroup(results, group);
    // add ids to pointers
    results.ptrs.forEach(ptr => {
      const [n, start, end] = ptr;
      ptr[3] = docs[n][start].id;//start-id
      ptr[4] = docs[n][end - 1].id;//end-id
    });
    return results
  };

  const methods$b = {
    one: {
      termMethods: methods$c,
      parseMatch: syntax,
      match: runMatch$1,
    },
  };

  var lib$3 = {
    /** pre-parse any match statements */
    parseMatch: function (str, opts) {
      const world = this.world();
      const killUnicode = world.methods.one.killUnicode;
      if (killUnicode) {
        str = killUnicode(str, world);
      }
      return world.methods.one.parseMatch(str, opts, world)
    }
  };

  var match = {
    api: matchAPI,
    methods: methods$b,
    lib: lib$3,
  };

  const isClass = /^\../;
  const isId = /^#./;

  const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
  const escapeXml = str => str.replace(/[&<>"']/g, c => escapes[c]);

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
    const starts = {};
    const ends = {};
    Object.keys(obj).forEach(k => {
      let res = obj[k];
      const tag = toTag(k);
      if (typeof res === 'string') {
        res = doc.match(res);
      }
      res.docs.forEach(terms => {
        // don't highlight implicit terms
        if (terms.every(t => t.implicit)) {
          return
        }
        const a = terms[0].id;
        starts[a] ||= [];
        starts[a].push(tag.start);
        const b = terms.at(-1).id;
        ends[b] ||= [];
        ends[b].push(tag.end);
      });
    });
    return { starts, ends }
  };

  const html = function (obj) {
    // index ids to highlight
    const { starts, ends } = getIndex(this, obj);
    // create the text output
    let out = '';
    eachTerm(this.docs, t => {
      // do a span tag
      if (Object.hasOwn(starts, t.id)) {
        out += starts[t.id].join('');
      }
      out += t.pre || '';
      out += t.text || '';
      if (Object.hasOwn(ends, t.id)) {
        out += ends[t.id].join('');
      }
      out += t.post || '';
    });
    return out
  };
  var html$1 = { html };

  // Walk the trailing punctuation run once, rather than retrying at every offset.
  const endPunctuation = /[,:;)\]*.?~!\u0022\uFF02\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4—-]/;
  const trimEnd = str => {
    let end = str.length;
    while (end > 0 && endPunctuation.test(str[end - 1])) end--;
    return str.slice(0, end)
  };
  const trimStart =
    /^[(['"*~\uFF02\u201C\u2018\u201F\u201B\u201E\u2E42\u201A\u00AB\u2039\u2035\u2036\u2037\u301D\u0060\u301F]+/;

  const punctToKill = /[,:;)('"\uFF02\u201D\u2019\u00BB\u203A\u2032\u2033\u2034\u301E\u00B4\]]/;
  const isHyphen = /^[-–—]$/;
  const hasSpace = / /;

  // the original text of these terms, with any outer whitespace removed
  const rawText = terms => terms.reduce((str, t) => str + t.pre + t.text + t.post, '').trim();

  const textFromTerms = function (terms, opts, keepSpace = true) {
    let txt = '';
    terms.forEach((t, i) => {
      let pre = t.pre || '';
      let post = t.post || '';
      if (opts.punctuation === 'some') {
        pre = pre.replace(/[,،]/g, '');
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
        post = post.replace(/[,،…]|\.{2,}/g, '');
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
          post = trimEnd(post);
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
      // add an implicit space, for contractions - but not after the last word
      if ((opts.form === 'machine' || opts.form === 'implicit' || opts.form === 'root') && t.implicit && i < terms.length - 1) {
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
    if (opts.keepEndPunct === false) {
      // don't remove ':)' etc
      if (!docs[0][0].tags.has('Emoticon')) {
        text = text.replace(trimStart, '');
      }
      // remove ending periods
      const last = docs.at(-1);
      if (!last.at(-1).tags.has('Emoticon')) {
        text = trimEnd(text);
        // removing a spaced dash leaves its space behind
        if (!opts.keepSpace) {
          text = text.trimEnd();
        }
      }
      // kill end quotations
      if (text.endsWith(`'`) && !text.endsWith(`s'`)) {
        text = text.replace(/'/, '');
      }
    }
    if (opts.cleanWhitespace === true) {
      text = text.trim();
    }
    return text
  };

  const some = {
    whitespace: 'some',
    punctuation: 'some',
    unicode: 'some',
  };
  const fmts = {
    text: {
      form: 'text',
    },
    normal: {
      ...some,
      case: 'some',
      form: 'normal',
    },
    machine: {
      ...some,
      keepSpace: false,
      case: 'none',
      form: 'machine',
    },
    root: {
      ...some,
      keepSpace: false,
      case: 'some',
      form: 'root',
    },
    implicit: {
      form: 'implicit',
    }
  };
  fmts.clean = fmts.normal;
  fmts.reduced = fmts.root;

  /* eslint-disable no-bitwise, no-multi-assign */

  // https://github.com/jbt/tiny-hashes/
  const k = [];
  let i = 0;
  for (; i < 64; i++) {
    k[i] = 0 | (Math.sin((i + 1) % Math.PI) * 4294967296);
  }

  const md5 = function (s) {
    let b,
      c,
      d,
      j = decodeURI(encodeURI(s)) + '\x80',
      a = j.length;

    const h = [(b = 0x67452301), (c = 0xefcdab89), ~b, ~c],
      words = [];

    s = (--a / 4 + 2) | 15;

    words[--s] = a * 8;

    for (; ~a; ) {
      words[a >> 2] |= j.charCodeAt(a) << (8 * a--);
    }

    for (i = j = 0; i < s; i += 16) {
      a = h;

      for (
        ;
        j < 64;
        a = [
          (d = a[3]),
          b +
            (((d =
              a[0] +
              [(b & c) | (~b & d), (d & b) | (~d & c), b ^ c ^ d, c ^ (b | ~d)][(a = j >> 4)] +
              k[j] +
              ~~words[i | ([j, 5 * j + 1, 3 * j + 5, 7 * j][a] & 15)]) <<
              (a = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][4 * a + (j++ % 4)])) |
              (d >>> -a)),
          b,
          c,
        ]
      ) {
        b = a[1] | 0;
        c = a[2];
      }
      for (j = 4; j; ) h[--j] += a[j];
    }

    for (s = ''; j < 32; ) {
      s += ((h[j >> 3] >> ((1 ^ j++) * 4)) & 15).toString(16);
    }

    return s
  };
  // console.log(md5('food-safety'))

  const defaults$1 = {
    text: true,
    terms: true,
  };

  const opts = { case: 'none', unicode: 'some', form: 'machine', punctuation: 'some' };

  // text in this format, keeping punctuation
  const punct = (terms, fmt) => textFromTerms(terms, { ...fmt, keepPunct: true }, false);

  const fns$1 = {
    text: terms => punct(terms),
    normal: terms => punct(terms, fmts.normal),
    implicit: terms => punct(terms, fmts.implicit),

    machine: terms => textFromTerms(terms, opts, false),
    root: terms => textFromTerms(terms, { ...opts, form: 'root' }, false),

    hash: terms => md5(punct(terms)),

    offset: terms => {
      const len = fns$1.text(terms).length;
      // the text keeps leading punctuation but trims whitespace, so start where the text starts
      const raw = terms[0].pre + terms[0].text;
      const lead = terms[0].pre.length - (raw.length - raw.trimStart().length);
      return {
        index: terms[0].offset.index,
        start: terms[0].offset.start - lead,
        length: len,
      }
    },
    terms: terms => {
      return terms.map(t => ({ ...t, tags: [...t.tags] }))
    },
    confidence: (_terms, view, i) => view.eq(i).confidence(),
    syllables: (_terms, view, i) => view.eq(i).syllables(),
    sentence: (_terms, view, i) => view.eq(i).fullSentence().text(),
    dirty: terms => terms.some(t => t.dirty === true),
  };
  fns$1.sentences = fns$1.sentence;
  fns$1.clean = fns$1.normal;
  fns$1.reduced = fns$1.root;

  const toJSON$1 = function (view, option) {
    option ||= {};
    if (typeof option === 'string') {
      option = {};
    }
    option = { ...defaults$1, ...option };
    // run any necessary upfront steps
    if (option.offset) {
      view.compute('offset');
    }
    return view.docs.map((terms, i) => {
      const res = {};
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
      const res = toJSON$1(this, n);
      if (typeof n === 'number') {
        return res[n]
      }
      return res
    },
  };
  methods$a.data = methods$a.json;

  // Output the requested format, or the default tags view
  const debug$1 = function (fmt) {
    const debugMethods = this.methods.one.debug || {};
    if (!fmt || !Object.hasOwn(debugMethods, fmt)) {
      fmt = 'tags';
    }
    debugMethods[fmt](this);
    return this
  };

  const toText$2 = function (term) {
    const pre = term.pre || '';
    const post = term.post || '';
    return pre + term.text + post
  };

  const findStarts = function (doc, obj) {
    const starts = {};
    Object.keys(obj).forEach(reg => {
      const m = doc.match(reg);
      m.fullPointer.forEach(a => {
        starts[a[3]] = { fn: obj[reg], end: a[2] };
      });
    });
    return starts
  };

  const wrap$1 = function (doc, obj) {
    // index ids to highlight
    const starts = findStarts(doc, obj);
    let text = '';
    doc.docs.forEach((terms, n) => {
      for (let i = 0; i < terms.length; i += 1) {
        const t = terms[i];
        // do a span tag
        if (Object.hasOwn(starts, t.id)) {
          const { fn, end } = starts[t.id];
          const m = doc.update([[n, i, end]]);
          text += terms[i].pre || '';
          text += fn(m);
          i = end - 1;
          text += terms[i].post || '';
        } else {
          text += toText$2(t);
        }
      }
    });
    return text
  };

  // the 'spec' output format - a clean sentence + an ordered list of top-level tags
  // designed to round-trip between compromise and LLMs (see docs/spec-format.md)

  // roots that describe a token's shape, not its part-of-speech - never picked over a real POS
  const attributeTags = new Set(['Hyphenated', 'Prefix', 'SlashedTerm']);

  // walk a tag up to its top-level (root) ancestor
  const rootOf = function (tag, tagSet) {
    const entry = tagSet[tag];
    if (!entry || !entry.parents || entry.parents.length === 0) {
      return tag
    }
    for (let i = 0; i < entry.parents.length; i += 1) {
      const p = entry.parents[i];
      if (tagSet[p] && (!tagSet[p].parents || tagSet[p].parents.length === 0)) {
        return p
      }
    }
    return entry.parents.at(-1)
  };

  // reduce a term's tag-set to a single top-level tag (or '-' when untagged)
  const slotForTerm = function (term, tagSet) {
    const tags = Array.from(term.tags || []);
    if (tags.length === 0) {
      return '-'
    }
    const primary = tags.find(t => !attributeTags.has(rootOf(t, tagSet))) || tags[0];
    return rootOf(primary, tagSet)
  };

  const makeAliases = function (tagSet, registered) {
    const aliases = Object.create(null);
    for (const tag in tagSet) {
      const entry = tagSet[tag];
      // A leading null explicitly keeps the canonical name.
      const preferred = entry.aliases === undefined ? entry.alias : entry.aliases[0];
      if (preferred && registered[preferred] === tag) {
        aliases[tag] = preferred;
      }
    }
    return aliases
  };

  // one line per sentence: '<text> {Tag,Tag,…}'
  const toSpec = function (doc, world) {
    const tagSet = world.model.one.tagSet;
    const aliases = makeAliases(tagSet, world.model.one.tagAliases);
    return doc.docs.map(terms => {
      const text = rawText(terms);
      const tags = terms.map(t => {
        const tag = slotForTerm(t, tagSet);
        return aliases[tag] || tag
      }).join(',');
      return `${text} {${tags}}`
    }).join('\n')
  };

  // sort by frequency
  const topk = function (arr) {
    const counts = new Map();
    arr.forEach(word => {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });
    const res = Array.from(counts, ([normal, count]) => ({ normal, count }));
    return res.sort((a, b) => b.count - a.count)
  };

  // named output formats
  const outputs = {
    // text formats
    text: view => view.text(),
    normal: view => view.text('normal'),
    root: view => view.text('root'),
    machine: view => view.text('machine'),
    hash: view => md5(view.text()),
    // tagged-sentence format for LLMs (see docs/spec-format.md)
    spec: view => toSpec(view, view.world),
    // json data formats
    json: view => view.json(),
    offset: view => {
      view.compute('offset');
      return view.json({ offset: true })
    },
    array: view => view.docs.map(rawText).filter(str => str),
    // return terms sorted by frequency
    freq: view => topk(view.json({ normal: true }).map(o => o.normal)),
    // some handy ad-hoc outputs
    terms: view => view.docs.flatMap(terms => terms.map(t => t.text).filter(Boolean)),
    tags: view => {
      return view.docs.map(terms => {
        return terms.reduce((h, t) => {
          h[t.implicit || t.normal] = Array.from(t.tags);
          return h
        }, {})
      })
    },
    'best-tag': view => {
      view.compute('tagRank');
      return view.docs
        .map(ts => {
          return ts.map(t => (t.tagRank?.[0] ? `#${t.tagRank[0]}` : '')).join(' ')
        })
        .join('\n')
    },
    debug: view => view.debug(), //allow
  };
  // aliases
  outputs.reduced = outputs.machine;
  outputs.md5 = outputs.hash;
  outputs.offsets = outputs.offset;
  outputs.frequency = outputs.freq;
  outputs.topk = outputs.freq;

  /** some named output formats */
  const out = function (method) {
    // support custom outputs
    if (isObject(method)) {
      return wrap$1(this, method)
    }
    if (Object.hasOwn(outputs, method)) {
      return outputs[method](this)
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

  // a dash between two words, like '2025-05-11 - they'
  const spacedDash = /^\s+[-—]\s+$/;

  var text = {
    /** */
    text: function (fmt) {
      let opts = {};
      if (fmt && typeof fmt === 'string' && Object.hasOwn(fmts, fmt)) {
        opts = { ...fmts[fmt] };
      } else if (fmt && isObject(fmt)) {
        opts = { ...fmt }; //todo: fixme
      }
      // is it a full document?
      if (opts.keepSpace === undefined && !this.isFull()) {
        //
        opts.keepSpace = false;
      }
      if (opts.keepEndPunct === undefined && this.pointer) {
        const ptr = this.pointer[0];
        const lastTerm = this.docs.at(-1)?.at(-1);
        if (ptr?.[1] || spacedDash.test(lastTerm?.post)) {
          opts.keepEndPunct = false;
        } else {
          opts.keepEndPunct = true;
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

  const methods$8 = { ...methods$9, ...text, ...methods$a, ...html$1 };

  const addAPI$1 = function (View) {
    Object.assign(View.prototype, methods$8);
  };

  /* eslint-disable no-console */

  const tagString = function (tags, model) {
    if (model.one.tagSet) {
      tags = tags.map(tag => {
        if (!Object.hasOwn(model.one.tagSet, tag)) {
          return tag
        }
        // an unknown color should not break the output
        const paint = cli[model.one.tagSet[tag].color] || blue;
        return paint(tag)
      });
    }
    return tags.join(', ')
  };

  // browser consoles get a collapsible table per sentence
  const showClient = function (view) {
    console.log('%c -=-=- ', 'background-color:#6699cc;');
    view.forEach(m => {
      console.groupCollapsed(m.text());
      const out = m.docs[0].map(t => {
        const text = t.implicit ? '[' + t.implicit + ']' : t.text || '-';
        return { text, tags: '[' + Array.from(t.tags).join(', ') + ']' }
      });
      console.table(out, ['text', 'tags']);
      console.groupEnd();
    });
  };

  const showTags = function (view) {
    if (typeof window !== 'undefined' && window.document) {
      showClient(view);
      return
    }
    const { docs, model } = view;
    if (docs.length === 0) {
      console.log(blue('\n     ──────'));
    }
    docs.forEach(terms => {
      console.log(blue('\n  ╭─────────'));
      terms.forEach(t => {
        const tags = [...(t.tags || [])];
        let text = t.text || '-';
        if (t.sense) {
          text = `{${t.normal}/${t.sense}}`;
        }
        if (t.implicit) {
          text = '[' + t.implicit + ']';
        }
        text = yellow(text);
        let word = "'" + text + "'";
        if (t.frozen === true) {
          word += ' ❄️';
        }
        if (t.reference) {
          const str = view.update([t.reference]).text('normal');
          word += ` - ${dim(i$1('[' + str + ']'))}`;
        }
        word = word.padEnd(18);
        const str = blue('  │ ') + i$1(word) + '  - ' + tagString(tags, model);
        console.log(str);
      });
    });
    console.log('\n');
  };

  /* eslint-disable no-console */

  const colors$1 = { Noun: blue, Verb: green, Adjective: yellow, Pivot: red };

  const showChunks = view => {
    console.log('');
    view.docs.forEach(terms => {
      const out = terms.map(term => {
        const text = term.implicit || term.normal;
        if (Object.hasOwn(colors$1, term.chunk)) {
          return colors$1[term.chunk](text)
        }
        return text
      });
      console.log(out.join(' '), '\n');
    });
    console.log('\n');
  };

  /* eslint-disable no-console */

  // each match on its own line: green, inside its grey sentence, aligned at the middle column
  const width = 55;
  const half = 27;
  const dots = '…';

  // drop words from the outer edge until the side fits, leaving room for an ellipsis
  const fit = (arr, max, fromStart) => {
    let cut = false;
    const size = () => (fromStart ? arr.join('').trimStart() : arr.join('').trimEnd()).length + (cut ? 2 : 0);
    while (arr.length > 0 && size() > max) {
      if (fromStart) {
        arr.shift();
      } else {
        arr.pop();
      }
      cut = true;
    }
    return cut
  };

  // the padded context before the match, the match, and the context after it
  const parts = (terms, start, end) => {
    const arrs = [[], [], []]; // before, match, after
    terms.forEach((t, i) => {
      const str = (t.pre + t.text + t.post).replace(/\s+/g, ' ');
      const arr = arrs[(i >= start ? 1 : 0) + (i >= end ? 1 : 0)];
      // blank terms fold into the word before them
      if (str.trim() === '' && arr.length > 0) {
        arr[arr.length - 1] = (arr.at(-1) + str).replace(/\s+/g, ' ');
      } else {
        arr.push(str);
      }
    });
    const [before, match, after] = arrs;
    const left = (fit(before, half, true) ? dots + ' ' : '') + before.join('').trimStart();
    let mid = match.join('');
    const cutR = fit(after, width - half - mid.length, false);
    const right = after.join('').trimEnd() + (cutR ? ' ' + dots : '');
    if (right === '') {
      mid = mid.trimEnd();
    }
    return [' '.repeat(Math.max(0, half - left.length)) + left, mid, right]
  };

  const showHighlight = function (view) {
    const client = typeof window !== 'undefined' && window.document;
    view.fullPointer.forEach(([n, s, e]) => {
      const [left, mid, right] = parts(view.document[n], s, e);
      if (client) {
        console.log('%c' + left + '%c' + mid + '%c' + right, 'color:grey', 'color:green', 'color:grey');
      } else {
        console.log(grey(left) + green(mid) + (right ? grey(right) : ''));
      }
    });
  };

  const debug = {
    tags: showTags,
    chunks: showChunks,
    highlight: showHighlight,
  };

  const lastBrace = /\{(?=[^{]*$)/; // split on the last { only
  const comment = /\}[ \t]*#(.*)$/s; // an optional '# comment' after the last {tags} block


  // parse the spec output
  const parseLine = function (line = '') {
    let [text, tags] = line.split(lastBrace); // eslint-disable-line prefer-const
    if (tags === undefined) {
      const note = text.match(/\s#(.*)$/s)?.[1] || '';
      // no {tags} block on this line
      return { text: text.replace(/\s#.*$/s, '').trim(), tags: null, comment: note.trim() }
    }
    const note = (tags.match(comment)?.[1] || '').trim();
    tags = tags.replace(comment, '}'); // drop the comment - only ever one, always last
    tags = tags.split(',').map(tag => tag.trim());
    const lastTag = tags[tags.length - 1];
    tags[tags.length - 1] = lastTag.replace(/\}$/, '');
    tags = tags.map(tag => tag.split('|').map(t => t.trim()));
    if (tags.length === 1 && tags[0].length === 1 && tags[0][0] === '') {
      tags = []; // empty '{}'; retain empty slots in nonempty lists
    }
    return { text: text.trim(), tags, comment: note }
  };

  // parse a whole spec into [{ line, text, tags, comment }], skipping blank and comment lines
  const parseSpec = function (spec = '') {
    const list = [];
    spec.split('\n').forEach((str, i) => {
      if (str.trim() && !/^\s*#/.test(str)) {
        list.push({ line: i + 1, ...parseLine(str) });
      }
    });
    return list
  };

  // make a match syntax looping through the arrays of tags
  const toMatchString = function (tags, aliases) {
    // Slots accept tags and '.', never match-syntax quantifiers or groups.
    if (tags.some(slot => slot.some(tag => tag !== '.' && !/^!?#?[a-z][a-z0-9]*$/i.test(tag)))) {
      return null
    }
    return tags.map(arr => {
      arr = arr.map(str => {
        if (str === '.') {
          return '.'
        }
        const negative = str.startsWith('!');
        const tag = str.replace(/^!?#?/, '');
        const prefix = negative ? '!#' : '#';
        return prefix + (aliases[tag] || tag)
      });
      if (arr.length > 1) {
        return `(${arr.join(' && ')})`
      }
      return arr[0]
    }).join(' ')
  };

  // Apply only positive constraints; negatives remain assertions.
  const applyTags = (doc, slots, aliases) => {
    const terms = doc.terms();
    // Tokenization can supply structural tags; literal slots replace them.
    doc.docs.flat().forEach(term => term.tags.clear());
    slots?.forEach((slot, i) => {
      const tags = slot.filter(tag => tag !== '.' && !tag.startsWith('!')).map(tag => {
        tag = tag.replace(/^#/, '');
        return aliases[tag] || tag
      });
      terms.eq(i).tag(tags, 'fromSpec');
    });
  };

  // Diagnostics describe the original parse, before the returned View is mutated.
  const specFailures = (doc, slots, aliases) => {
    const terms = doc.docs.flat();
    const patterns = slots.map(slot => toMatchString([slot], aliases));
    const pattern = toMatchString(slots, aliases);
    if (terms.length === slots.length && pattern !== null && doc.has(pattern)) {
      return [] // valid
    }
    const failures = [];
    if (terms.length !== slots.length) {
      failures.push({
        code: 'length', expected: slots.length, actual: terms.length,
        message: `expected ${slots.length} terms, got ${terms.length}`,
      });
    }
    doc.compute('tagRank');
    slots.forEach((slot, i) => {
      const term = terms[i];
      const actual = term ? Array.from(term.tags) : [];
      const detail = { term: i + 1, word: term?.implicit || term?.text || '', expected: slot, actual };
      if (patterns[i] === null) {
        failures.push({ ...detail, code: 'syntax', message: `term ${i + 1}: invalid slot ${slot.join('|')}` });
        return
      }
      if (!term) {
        return // covered by the length error
      }
      const problems = [];
      slot.forEach(value => {
        if (value === '.') {
          return
        }
        const negative = value.startsWith('!');
        const tag = value.replace(/^!?#?/, '');
        const present = term.tags.has(aliases[tag] || tag);
        if (negative && present) {
          problems.push(`unexpected #${tag}`);
        } else if (!negative && !present) {
          problems.push(`missing #${tag}`);
        }
      });
      if (problems.length > 0) {
        const best = term.tagRank?.[0] || actual.at(-1) || 'Untagged';
        failures.push({
          ...detail, code: 'tags',
          message: `term ${i + 1} '${detail.word}': #${best}, ${problems.join(', ')}`,
        });
      }
    });
    if (failures.length === 0) {
      failures.push({ code: 'match', message: 'tags align, but the sentence pattern did not match' });
    }
    return failures
  };

  const logSpec = (doc, slots, failures, aliases) => {
    const terms = doc.docs.flat();
    const wrong = new Set(failures.filter(failure => failure.term).map(failure => failure.term - 1));
    const invalid = new Set(failures.filter(failure => failure.code === 'syntax').map(failure => failure.term - 1));
    const unmatched = failures.some(failure => failure.code === 'match');
    let visible = 0;
    terms.forEach((term, i) => {
      if (term.text) {
        visible = i;
      }
      // Implicit terms share their visible contraction or number-range token.
      if (wrong.has(i) || i >= slots.length || unmatched) {
        wrong.add(visible);
      }
    });
    const text = terms.map((term, i) => {
      const word = wrong.has(i) && term.text ? red(term.text) : term.text;
      return term.pre + word + term.post
    }).join('').trim();
    const tags = slots.map((slot, i) => {
      const term = terms[i];
      if (!term || invalid.has(i) || unmatched) {
        return red(slot.join('|'))
      }
      return slot.map(value => {
        if (value === '.') {
          return value
        }
        const negative = value.startsWith('!');
        const tag = value.replace(/^!?#?/, '');
        const present = term.tags.has(aliases[tag] || tag);
        return present === negative ? red(value) : value
      }).join('|')
    }).join(',');
    const block = slots.length === 0 ? red('{}') : `{${tags}}`;
    return `${text} ${block}`
  };

  // one ✓ or ✗ line per spec line, for verbose mode
  const logLine = (text, tags, detail) => {
    const block = tags === null ? '' : ` {${tags.map(slot => slot.join('|')).join(',')}}`;
    if (detail) {
      return `${red('✗')} ${text}${dim(block)} - ${red(detail)}`
    }
    return `${green('✓')} ${green(dim(text))}${dim(block)}`
  };

  const fromSpec = function (spec, { tags: tagMode = 'ignore', failures: failureMode = 'ignore', verbose = false } = {}) {
    if (!['ignore', 'use'].includes(tagMode) || !['ignore', 'throw', 'retain', 'log'].includes(failureMode)) {
      throw new Error('Invalid fromSpec options')
    }
    const aliases = this.world().model.one.tagAliases;
    const result = this('');
    result.failures = [];
    parseSpec(spec).forEach(({ line, text, tags }) => {
      const doc = tagMode === 'use' ? this.tokenize(text) : this(text);
      let failures = [];
      if (tags !== null && (tagMode === 'use' || failureMode !== 'ignore')) {
        const count = doc.docs.reduce((sum, terms) => sum + terms.length, 0);
        const pattern = toMatchString(tags, aliases);
        // Assigning slots is unsafe when the shape or syntax is invalid.
        const canApply = count === tags.length && pattern !== null;
        if (tagMode === 'use' && !canApply && failureMode !== 'log') {
          const invalid = specFailures(doc, tags, aliases);
          throw new Error(`${text} - ${invalid.map(failure => failure.message).join('; ')}`)
        }
        if (tagMode === 'use') {
          applyTags(doc, canApply ? tags : null, aliases);
        }
        if (failureMode !== 'ignore') {
          failures = specFailures(doc, tags, aliases)
            .map(failure => ({ line, text, ...failure }));
          result.failures.push(...failures);
        }
      } else if (tagMode === 'use') {
        applyTags(doc, null, aliases);
      }
      const detail = failures.map(failure => failure.message).join('; ');
      if (failureMode === 'log' && failures.length > 0) {
        console.error(logSpec(doc, tags, failures, aliases)); //eslint-disable-line no-console
      } else if (verbose || debug$2.spec) {
        console.log(logLine(text, tags, detail)); //eslint-disable-line no-console
      }
      if (failures.length > 0 && failureMode === 'throw') {
        throw new Error(`${text} - ${detail}`)
      }
      if (failureMode === 'retain' && tags !== null && failures.length === 0) {
        return
      }
      // Preserve the parsed terms and assigned tags, without running hooks twice.
      if (doc.found) {
        const previous = result.document.at(-1)?.at(-1);
        if (previous) {
          previous.post += '\n';
        }
        result.document.push(...doc.docs);
      }
    });
    return result
  };

  // Keep the legacy logging and throwing arguments on the compatibility wrapper.
  const testSpec = function (spec, verbose = true, throwError = false) {
    const result = this.fromSpec(spec, { tags: 'ignore', failures: 'retain', verbose });
    if (throwError && result.failures.length > 0) {
      const failure = result.failures[0];
      throw new Error(`${failure.text} - ${failure.message}`)
    }
    return result
  };

  var output = {
    lib: {
      fromSpec,
      testSpec,
    },
    api: addAPI$1,
    methods: {
      one: {
        hash: md5,
        debug,
        parseSpec,
      },
    },
  };

  // split a pointer, by match pointer
  const pivotBy = function (full, m) {
    const [n, start] = full;
    const mStart = m[1];
    const mEnd = m[2];
    const res = {};
    // is there space before the match?
    if (start < mStart) {
      const end = mStart < full[2] ? mStart : full[2]; // find closest end-point
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
    const byN = indexN(m);
    const res = [];
    full.forEach(ptr => {
      const [n] = ptr;
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
        const found = pivotBy(carry, p);
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

  const max$1 = 20;

  // sweep-around looking for our start term uuid
  const blindSweep = function (id, doc, n) {
    for (let i = 0; i < max$1; i += 1) {
      // look up a sentence, then down one
      for (const k of [n - i, n + i]) {
        if (doc[k]) {
          const index = doc[k].findIndex(term => term.id === id);
          if (index !== -1) {
            return [k, index]
          }
        }
      }
    }
    return null
  };

  const repairEnding = function (ptr, document) {
    const [n, start, , , endId] = ptr;
    const terms = document[n];
    // look for end-id
    const newEnd = terms.findIndex(t => t.id === endId);
    if (newEnd === -1) {
      // if end-term wasn't found, so go all the way to the end
      ptr[2] = document[n].length;
      ptr[4] = terms.length > 0 ? terms[terms.length - 1].id : null;
    } else {
      ptr[2] = newEnd + 1; // repair ending pointer, which is exclusive
    }
    return document[n].slice(start, ptr[2])
  };

  /** return a subset of the document, from a pointer */
  const getDoc = function (ptrs, document) {
    let doc = [];
    ptrs.forEach((ptr, i) => {
      if (!ptr) {
        return
      }
      // eslint-disable-next-line prefer-const
      let [n, start, end, id, endId] = ptr;
      let terms = document[n] || [];
      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = terms.length;
      }
      if (id && (!terms[start] || terms[start].id !== id)) {
        // console.log('  repairing pointer...')
        const wild = blindSweep(id, document, n);
        if (wild !== null) {
          const len = end - start;
          terms = document[wild[0]].slice(wild[1], wild[1] + len);
          // actually change the pointer
          const startId = terms[0] ? terms[0].id : null;
          // the ending may have moved too, if its term still exists
          endId = document[wild[0]].some(term => term.id === endId) ? endId : undefined;
          ptr = [wild[0], wild[1], wild[1] + len, startId, endId];
          ptrs[i] = ptr;
        } else {
          // our start-term was deleted (replaced?) - trust the index, and adopt the term now there
          terms = terms.slice(start, end);
          ptr[3] = terms[0] ? terms[0].id : null;
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

  // flat list of terms from nested document
  const termList = docs => docs.flat();

  var methods$7 = {
    one: {
      termList,
      getDoc,
      pointer: {
        indexN,
        splitAll,
      }
    },
  };

  // a union is a + b, minus duplicates
  const getUnion = function (a, b) {
    const both = a.concat(b);
    const byN = indexN(both);
    let res = [];
    both.forEach(ptr => {
      const [n] = ptr;
      if (byN[n].length === 1) {
        // we're alone on this sentence, so we're good
        res.push(ptr);
        return
      }
      // there may be overlaps
      const hmm = byN[n].filter(m => doesOverlap(ptr, m));
      hmm.push(ptr);
      const range = getExtent(hmm);
      res.push(range);
    });
    res = uniquePtrs(res);
    return res
  };

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
    const res = [];
    const found = splitAll(refs, not);
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

  // console.log(subtract([[0, 0, 2]], [[0, 0, 1]]))
  // console.log(subtract([[0, 0, 2]], [[0, 1, 2]]))

  // [a,a,a,a,-,-,]
  // [-,-,b,b,b,-,]
  // [-,-,x,x,-,-,]
  const intersection = function (a, b) {
    // find the latest-start
    const start = a[1] < b[1] ? b[1] : a[1];
    // find the earliest-end
    const end = a[2] > b[2] ? b[2] : a[2];
    // does it form a valid pointer?
    if (start < end) {
      return [a[0], start, end]
    }
    return null
  };

  const getIntersection = function (a, b) {
    const byN = indexN(b);
    const res = [];
    a.forEach(ptr => {
      let hmm = byN[ptr[0]] || [];
      hmm = hmm.filter(p => doesOverlap(ptr, p));
      // no sentence-pairs, so no intersection
      if (hmm.length === 0) {
        return
      }
      hmm.forEach(h => {
        const overlap = intersection(ptr, h);
        if (overlap) {
          res.push(overlap);
        }
      });
    });
    return res
  };

  // console.log(getIntersection([[0, 1, 3]], [[0, 2, 4]]))

  // 'harden' our json pointers, again
  const addIds = function (ptrs, docs) {
    return ptrs.map(ptr => {
      const [n, start] = ptr;
      if (docs[n] && docs[n][start]) {
        ptr[3] = docs[n][start].id;
      }
      return ptr
    })
  };

  // a new view from the pointers
  const toView = (view, ptrs) => view.toView(addIds(ptrs, view.document));

  // combine our pointers with another view's
  const setOp = fn => function (m) {
    m = getDoc$1(m, this);
    return toView(this, fn(this.fullPointer, m.fullPointer))
  };

  const methods$6 = {};

  // all parts, minus duplicates
  methods$6.union = setOp(getUnion);
  methods$6.and = methods$6.union;

  // only parts they both have
  methods$6.intersection = setOp(getIntersection);

  // only parts of a that b does not have
  methods$6.not = setOp(subtract);
  methods$6.difference = methods$6.not;

  // get opposite of a match
  methods$6.complement = function () {
    return toView(this, subtract(this.all().fullPointer, this.fullPointer))
  };

  // remove overlaps
  methods$6.settle = function () {
    let ptrs = this.fullPointer;
    ptrs.forEach(ptr => {
      ptrs = getUnion(ptrs, [ptr]);
    });
    ptrs = addIds(ptrs, this.document);
    return this.update(ptrs)
  };

  const addAPI = function (View) {
    // add set/intersection/union
    Object.assign(View.prototype, methods$6);
  };

  var pointers = {
    methods: methods$7,
    api: addAPI,
  };

  var lib$2 = {
    // compile a list of matches into a match-net
    buildNet: function (matches) {
      const methods = this.methods();
      const net = methods.one.buildNet(matches, this.world());
      net.isNet = true;
      return net
    }
  };

  const api$7 = function (View) {

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
        const ptr = o.pointer;
        const term = docs[ptr[0]][ptr[1]];
        const len = ptr[2] - ptr[1];
        if (term.index) {
          o.pointer = [
            term.index[0],
            term.index[1],
            term.index[1] + len
          ];
        }
        return o
      });
      const ptrs = found.map(o => o.pointer);
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

  const sets = new WeakMap();
  const empty = new Set();

  // Normalization replaces these arrays when plugins rebuild the tag graph.
  const getTagSet = (tags) => {
    if (!tags || tags.length === 0) {
      return empty
    }
    let set = sets.get(tags);
    if (!set) {
      set = new Set(tags);
      sets.set(tags, set);
    }
    return set
  };

  // strip the '#', then follow any alias
  const resolveTag = (tag, aliases) => {
    tag = tag.replace(/^#/, '');
    return aliases?.[tag] || tag
  };

  // Resolve actions and index hints once, alongside the match expression.
  const resolveAliases = (rule, aliases) => {
    const tag = value => {
      if (Array.isArray(value)) {
        return value.map(tag)
      }
      if (typeof value !== 'string') {
        return value
      }
      return value.trim().split(/ +/).map(name => resolveTag(name, aliases)).join(' ')
    };
    const hook = value => {
      if (typeof value === 'string' && value.startsWith('#')) {
        return '#' + tag(value)
      }
      return value
    };
    if (rule.tag !== undefined) {
      rule.tag = tag(rule.tag);
    }
    if (rule.unTag !== undefined) {
      rule.unTag = tag(rule.unTag);
    }
    if (rule.hook !== undefined) {
      rule.hook = hook(rule.hook);
    }
    if (rule.ifNo !== undefined) {
      rule.ifNo = [rule.ifNo].flat().map(hook);
    }
  };

  // Only precheck required, single-term tokens without special matching steps.
  const canCheck = reg => Boolean(reg && !reg.optional && !reg.negative && !reg.greedy &&
    !reg.choices && !reg.anything && !reg.regex && !reg.method);

  const getBoundary = (reg, boundary) => {
    if (!canCheck(reg) || !reg[boundary]) {
      return null
    }
    return reg
  };

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

  // Only allow hooks that every successful match must contain. In particular,
  // a word inside an optional or negative AND block is not a required hook.
  const hasRequiredHook = function (regs, hook) {
    return regs.some(reg => {
      if (reg.optional || reg.negative) {
        return false
      }
      if (getTokenNeeds(reg) === hook) {
        return true
      }
      return reg.operator === 'and' && reg.choices &&
        reg.choices.some(side => hasRequiredHook(side, hook))
    })
  };

  const getNeeds = function (regs) {
    const needs = [];
    regs.forEach(reg => {
      needs.push(getTokenNeeds(reg));
      // support AND (foo && tag) - but an optional or negative block requires nothing
      if (reg.operator === 'and' && reg.choices && !reg.optional && !reg.negative) {
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
    const wants = [];
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
              const n = getTokenNeeds(r);
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
      resolveAliases(obj, world.model.one.tagAliases);
      obj.regs = parseMatch(obj.match, {}, world);
      obj.fixed = isFixed(obj.regs);
      obj.checkFirst = canCheck(obj.regs[0]);
      obj.startTerm = getBoundary(obj.regs[0], 'start');
      obj.endTerm = getBoundary(obj.regs[obj.regs.length - 1], 'end');
      if (obj.notIf) {
        obj.notIf = parseMatch(obj.notIf, {}, world);
      }
      // cache any requirements up-front 
      obj.needs = getNeeds(obj.regs);
      if (obj.hook !== undefined) {
        if (typeof obj.hook !== 'string' || !obj.needs.includes(obj.hook) || !hasRequiredHook(obj.regs, obj.hook)) {
          throw new Error(`Invalid hook "${obj.hook}" for match "${obj.match}": use a required word, #Tag, or %Switch%.`)
        }
      }
      const { wants, count } = getWants(obj.regs);
      obj.wants = wants;
      obj.minWant = count;
      // get rid of tiny sentences
      obj.minWords = obj.regs.filter(o => !o.optional).length;
      // The matcher excludes negative tokens from its own minimum. Cache that
      // separately rather than changing the sweep's existing length filter.
      obj.minLength = getMinLength(obj.regs);
    });
    return matches
  };

  // Choose one necessary hook per rule. A missing required hook guarantees that
  // the rule cannot match, so broader hooks need not enqueue it as well.
  const buildIndex = function (matches, hooks, hookOrder) {
    const index = Object.create(null);
    const seen = new Set();
    const lastRank = Object.keys(hooks).length;
    matches.forEach((rule, order) => {
      if (seen.has(rule)) {
        return
      }
      seen.add(rule);
      let anchor = null;
      let rank = lastRank;
      for (let i = 0; i < rule.needs.length; i += 1) {
        const key = rule.needs[i];
        // Prefer the hook shared by the fewest rules in this network.
        if (anchor === null || hooks[key].length < hooks[anchor].length) {
          anchor = key;
        }
        rank = Math.min(rank, hookOrder[key]);
      }
      // Explicit hooks have already been checked against required match tokens.
      if (rule.hook !== undefined) {
        anchor = rule.hook;
      }
      // Historically, any earlier matching alternative could determine where
      // this rule ran. Retain that ordering even when using a required anchor.
      const earlier = [...new Set(rule.wants)]
        .filter(key => hookOrder[key] < rank)
        .sort((a, b) => hookOrder[a] - hookOrder[b]);
      const keys = anchor === null ? [...new Set(rule.wants)] : [anchor];
      // The bucket already proves its anchor; check each remaining need once.
      const needs = [...new Set(rule.needs)].filter(key => key !== anchor);
      const entry = { rule, order, rank, earlier, needs, single: keys.length === 1 };
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        index[key] ||= [];
        index[key].push(entry);
      }
    });
    return index
  };

  // do some indexing on the list of matches
  const buildNet = function (matches, world) {
    // turn match-syntax into json
    matches = parse$2(matches, world);

    // collect by wants and needs
    const hooks = {};
    matches.forEach(obj => {
      // add needs, then wants
      obj.needs.concat(obj.wants).forEach(str => {
        hooks[str] = Array.isArray(hooks[str]) ? hooks[str] : [];
        hooks[str].push(obj);
      });
    });
    // Record enumeration order, including numeric keys, so input-driven lookup
    // can preserve the order in which tag actions have always been applied.
    const hookOrder = Object.create(null);
    Object.keys(hooks).forEach((k, i) => {
      hookOrder[k] = i;
      // remove duplicates
      const already = new Set();
      hooks[k] = hooks[k].filter(obj => {
        if (already.has(obj)) {
          return false
        }
        already.add(obj);
        return true
      });
    });

    // keep all un-cacheable matches (those with no needs) 
    const always = matches.filter(o => o.needs.length === 0 && o.wants.length === 0);
    return {
      hooks,
      hookOrder,
      index: buildIndex(matches, hooks, hookOrder),
      always
    }
  };

  // Reject impossible candidates before allocating and sorting their entries.
  const canMatch = (obj, haves, terms, needs = obj.needs) => {
    const termCount = terms.length;
    if (!(termCount >= obj.minWords)) {
      return false
    }
    for (let j = 0; j < needs.length; j += 1) {
      if (!haves.has(needs[j])) {
        return false
      }
    }
    if (obj.ifNo !== undefined) {
      for (let j = 0; j < obj.ifNo.length; j += 1) {
        if (haves.has(obj.ifNo[j])) {
          return false
        }
      }
    }
    if (obj.wants.length > 0) {
      let count = 0;
      for (let j = 0; j < obj.wants.length; j += 1) {
        if (haves.has(obj.wants[j])) {
          count += 1;
          if (count >= obj.minWant) {
            break
          }
        }
      }
      if (!(count >= obj.minWant)) {
        return false
      }
    }
    // Required anchors must match the sentence boundary, not just occur in it.
    if (termCount && obj.startTerm && !wrapMatch(terms[0], obj.startTerm, 0, termCount)) {
      return false
    }
    if (termCount && obj.endTerm && !wrapMatch(terms[termCount - 1], obj.endTerm, termCount - 1, termCount)) {
      return false
    }
    return true
  };

  // Required anchors narrow the candidate list. Sort surviving entries by their
  // original first matching hook, then their position within that hook's bucket.
  const getIndexed = function (set, index, hookOrder, terms) {
    const found = [];
    const seen = new Set();
    set.forEach(key => {
      const bucket = index[key];
      if (!Array.isArray(bucket)) {
        return
      }
      for (let i = 0; i < bucket.length; i += 1) {
        const entry = bucket[i];
        // Single-bucket entries cannot be encountered twice. Older nets fall back.
        if (entry.single !== true) {
          if (seen.has(entry)) {
            continue
          }
          seen.add(entry);
        }
        if (!canMatch(entry.rule, set, terms, entry.needs)) {
          continue
        }
        let rank = entry.rank;
        for (let j = 0; j < entry.earlier.length; j += 1) {
          const earlier = entry.earlier[j];
          if (set.has(earlier)) {
            rank = hookOrder[earlier];
            break
          }
        }
        if (rank === entry.rank) {
          found.push(entry);
        } else {
          found.push({ rule: entry.rule, rank, order: entry.order });
        }
      }
    });
    found.sort((a, b) => a.rank - b.rank || a.order - b.order);
    return found.map(entry => entry.rule)
  };

  // for each cached-sentence, find a list of possible matches
  const getHooks = function (docCaches, net, document) {
    const { hooks, index, always } = net;
    let { hookOrder } = net;
    // Older compiled nets may not include the precomputed hook order.
    if (!hookOrder) {
      hookOrder = Object.create(null);
      Object.keys(hooks).forEach((k, i) => { hookOrder[k] = i; });
    }
    const lists = docCaches.map((set, n) => {
      if (index) {
        return getIndexed(set, index, hookOrder, document[n])
      }
      const keys = [];
      set.forEach(k => {
        if (typeof hookOrder[k] === 'number') {
          keys.push(k);
        }
      });
      keys.sort((a, b) => hookOrder[a] - hookOrder[b]);
      // Append each rule once, without concatenating and then filtering buckets.
      const maybe = [];
      const already = new Set();
      for (let i = 0; i < keys.length; i += 1) {
        const bucket = hooks[keys[i]];
        for (let j = 0; j < bucket.length; j += 1) {
          const m = bucket[j];
          if (!already.has(m)) {
            already.add(m);
            if (canMatch(m, set, document[n])) {
              maybe.push(m);
            }
          }
        }
      }
      return maybe
    });
    // Apply the same exclusions to unindexed rules, preserving their final position.
    lists.forEach((list, n) => {
      for (let i = 0; i < always.length; i += 1) {
        if (canMatch(always[i], docCaches[n], document[n])) {
          list.push(always[i]);
        }
      }
    });
    return lists
  };

  // finally,
  // actually run these match-statements on the terms
  const runMatch = function (maybeList, document, methods, opts) {
    const results = [];
    for (let n = 0; n < maybeList.length; n += 1) {
      const sentence = [document[n]];
      for (let i = 0; i < maybeList[n].length; i += 1) {
        const m = maybeList[n][i];
        // ok, actually do the work.
        const res = methods.one.match(sentence, m);
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
            results.push({ ...m, pointer: ptr });
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

  const sweep$1 = function (document, net, methods, opts = {}) {
    // find suitable matches to attempt, on each sentence
    const docCache = methods.one.cacheDoc(document);
    // filter candidates before sorting them into execution order
    const maybeList = getHooks(docCache, net, document);

    // now actually run the matches
    const results = runMatch(maybeList, document, methods, opts);
    // console.dir(results, { depth: 5 })
    return results
  };

  // quick check if this tag will require any untagging
  const canBe$1 = function (term, tag, tagSet) {
    if (!Object.hasOwn(tagSet, tag)) {
      return true // everything can be an unknown tag
    }
    const conflicts = getTagSet(tagSet[tag].not);
    if (conflicts.size === 0) {
      return true
    }
    for (const existing of term.tags) {
      if (conflicts.has(existing)) {
        return false
      }
    }
    return true
  };

  // is this tag consistent with the tags they already have?
  const canBe = (terms, tag, model) => terms.every(term => canBe$1(term, tag, model.one.tagSet));

  const tagger$1 = function (list, document, world) {
    const { model, methods } = world;
    const { getDoc, setTag, unTag } = methods.one;
    const looksPlural = methods.two.looksPlural;
    if (list.length === 0) {
      return list
    }
    return list.map(todo => {
      if (!todo.tag && !todo.chunk && !todo.unTag) {
        return
      }
      const reason = todo.reason || todo.match;
      const terms = getDoc([todo.pointer], document)[0];
      let validated;
      // handle 'safe' tag
      if (todo.safe === true) {
        // check for conflicting tags
        if (canBe(terms, todo.tag, model) === false) {
          return
        }
        // dont tag half of a hyphenated word
        if (terms[terms.length - 1].post === '-') {
          return
        }
        // Only an exact single tag was checked by canBe; arrays and shorthand
        // still need their individual checks in setTag.
        if (typeof todo.tag === 'string' && Object.hasOwn(model.one.tagSet, todo.tag)) {
          validated = model.one.tagSet[todo.tag];
        }
      }
      if (todo.tag !== undefined) {
        setTag(terms, todo.tag, world, todo.safe, `[post] '${reason}'`, validated);
        // quick and dirty plural tagger 😕
        if (todo.tag === 'Noun' && looksPlural) {
          const term = terms[terms.length - 1];
          if (looksPlural(term.text)) {
            setTag([term], 'Plural', world, todo.safe, 'quick-plural');
          } else {
            setTag([term], 'Singular', world, todo.safe, 'quick-singular');
          }
        }
        // allow freezing this match, too
        if (todo.freeze === true) {
          terms.forEach(term => (term.frozen = true));
        }
      }
      if (todo.unTag !== undefined) {
        unTag(terms, todo.unTag, model.one.tagSet, reason);
      }
      // allow setting chunks, too
      if (todo.chunk) {
        terms.forEach(t => (t.chunk = todo.chunk));
      }
    })
  };

  var methods$5 = {
    buildNet,
    bulkMatch: sweep$1,
    bulkTagger: tagger$1
  };

  var sweep = {
    lib: lib$2,
    api: api$7,
    methods: {
      one: methods$5,
    }
  };

  const isMulti = / /;

  const addChunk = function (term, tag) {
    if (tag === 'Noun' || tag === 'Verb') {
      term.chunk = tag;
    }
  };

  // eslint-disable-next-line max-params
  const tagTerm = function (term, tag, tagSet, isSafe, validated, reason) {
    // does it already have this tag?
    if (term.tags.has(tag)) {
      return null
    }
    // allow this shorthand in multiple-tag strings
    if (tag === '.') {
      return null
    }
    // don't overwrite any tags, if term is frozen
    if (term.frozen === true) {
      isSafe = true;
    }
    const previous = debug$2.tags ? debug$2.before(term) : null;
    // for known tags, do logical dependencies first
    const known = tagSet[tag];
    if (known) {
      // first, we remove any conflicting tags
      if (known !== validated && known.not && known.not.length > 0) {
        const conflicts = getTagSet(known.not);
        for (const existing of term.tags) {
          if (conflicts.has(existing)) {
            // Safe and frozen terms cannot lose conflicting tags.
            if (isSafe === true) {
              return null
            }
            term.tags.delete(existing);
          }
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
    if (previous) {
      debug$2.log(term, previous, reason);
    }
    return true
  };

  // support '#Noun . #Adjective' syntax
  // eslint-disable-next-line max-params
  const multiTag = function (terms, tagString, tagSet, aliases, isSafe, reason) {
    const tags = tagString.split(isMulti);
    terms.forEach((term, i) => {
      const tag = tags[i];
      if (tag) {
        tagTerm(term, resolveTag(tag, aliases), tagSet, isSafe, undefined, reason);
      }
    });
  };

  // add a tag to all these terms
  // Whole-match validation is separate from per-term safety.
  // eslint-disable-next-line max-params
  const setTag = function (terms, tag, world = {}, isSafe, reason, validated) {
    const tagSet = world.model.one.tagSet || {};
    if (!tag) {
      return
    }
    if (Array.isArray(tag)) {
      tag.forEach(tg => setTag(terms, tg, world, isSafe, reason));
      return
    }
    if (typeof tag !== 'string') {
      console.warn(`compromise: Invalid tag '${tag}'`); // eslint-disable-line
      return
    }
    tag = tag.trim();
    // support '#Noun . #Adjective' syntax
    if (isMulti.test(tag)) {
      multiTag(terms, tag, tagSet, world.model.one.tagAliases, isSafe, reason);
      return
    }
    tag = resolveTag(tag, world.model.one.tagAliases);
    for (let i = 0; i < terms.length; i += 1) {
      tagTerm(terms[i], tag, tagSet, isSafe, validated, reason);
    }
  };

  // remove this tag, and its children, from these terms
  const unTag = function (terms, tag, tagSet, reason = 'untag') {
    tag = tag.trim().replace(/^#/, '');
    const children = getTagSet(tagSet[tag]?.children);
    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];
      // don't untag anything if term is frozen
      if (term.frozen === true) {
        continue
      }
      const previous = debug$2.tags ? debug$2.before(term) : null;
      // support clearing all tags, with '*'
      if (tag === '*') {
        term.tags.clear();
        if (previous) {
          debug$2.log(term, previous, reason);
        }
        continue
      }
      // removing #Verb should also remove #PastTense
      if (children.size > 0) {
        for (const existing of term.tags) {
          if (children.has(existing)) {
            term.tags.delete(existing);
          }
        }
      }
      term.tags.delete(tag);
      if (previous) {
        debug$2.log(term, previous, reason);
      }
    }
  };

  const validate$1 = function (node) {
    node.children = node.children || [];
    node._cache = node._cache || {};
    node.props = node.props || {};
    node._cache.parents = node._cache.parents || [];
    return node
  };

  // Iterative DFS keeps deep inputs safe and distinguishes shared nodes from cycles.
  const checkCycles = roots => {
    const states = new Map();
    const stack = roots.map(node => [node, false]);
    for (; stack.length > 0;) {
      const [node, done] = stack.pop();
      if (done) {
        states.set(node, 2);
      } else if (states.get(node) === 1) {
        throw new Error('[Grad] - cyclic input')
      } else if (!states.has(node)) {
        states.set(node, 1);
        stack.push([node, true]);
        for (const child of node.children || []) {
          stack.push([child, false]);
        }
      }
    }
    return states.keys()
  };

  // turn parent-index rows into nested json
  const fromArray = function (rows) {
    const index = new Map();
    // addTags allocates these rows for this graph, so initialize them in place.
    rows.forEach(node => {
      validate$1(node);
      index.set(node.id, node);
    });
    const root = validate$1({});
    rows.forEach(node => {
      if (node.parent) {
        if (index.has(node.parent)) {
          const parent = index.get(node.parent);
          delete node.parent; //no-longer needed
          parent.children.push(node);
        } else {
          console.warn(`[Graph] - missing node '${node.parent}'`); // eslint-disable-line no-console
        }
        return
      }
      // no parent, add it to root
      root.children.push(node);
    });
    checkCycles(rows);
    return root
  };

  // [a, a1, b, b1]
  // Visitor-only callers can skip collecting nodes.
  const byDepth = (root, fn, collect = true) => {
    const list = collect ? [] : null;
    const queue = [root];
    for (; queue.length > 0;) {
      // get first
      const node = queue.pop();
      if (collect) {
        list.push(node);
      }
      // add kids to queue
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i -= 1) {
          const child = node.children[i];
          if (fn) {
            fn(node, child);
          }
          queue.push(child);
        }
      }
    }
    return list
  };

  // Fresh graph nodes already have empty caches; fill ancestors in root-to-parent order.
  const cacheParents = root => {
    byDepth(root, (parent, child) => {
      if (parent.id) {
        child._cache.parents = parent._cache.parents.concat([parent.id]);
      }
    }, false);
  };

  // addTags supplies only exclusions, additional parents, and these scalar flags.
  const inherit = (props, parent) => {
    if (parent.not) {
      props.not = new Set([...props.not, ...parent.not]);
    }
    if (Array.isArray(parent.also) && (props.also === undefined || Array.isArray(props.also))) {
      props.also = parent.also.concat(props.also || []);
    } else if (props.also === undefined) {
      props.also = parent.also;
    }
    if (props.is === undefined) {
      props.is = parent.is;
    }
    if (props.novel === undefined) {
      props.novel = parent.novel;
    }
    return props
  };

  const fillDown = root => {
    byDepth(root, (parent, child) => {
      child.props = inherit(child.props, parent.props);
    }, false);
  };

  const toArray$2 = function (json) {
    // The tag formatter only reads these graph-owned nodes.
    const nodes = byDepth(json);
    // should we show the root?
    const root = nodes[0];
    if (root && !root.id && Object.keys(root.props).length === 0) {
      nodes.shift();
    }
    return nodes
  };

  // The tag-inheritance subset of grad-school;
  // https://github.com/spencermountain/grad-school

  class Graph {
    constructor(json) {
      Object.defineProperty(this, 'json', {
        enumerable: false,
        value: json,
        writable: true,
      });
    }
    cache() {
      cacheParents(this.json);
      return this
    }
    fillDown() {
      fillDown(this.json);
      return this
    }
    // the graph's nodes, parents first
    toArray() {
      // fillDown changes properties, so the cached graph relationships still hold.
      return toArray$2(this.json)
    }
  }

  const graph = rows => new Graph(fromArray(rows));

  // i just made these up
  const colors = {
    Noun: 'blue',
    Verb: 'green',
    Negative: 'green',
    Date: 'red',
    Value: 'red',
    Adjective: 'magenta',
    Connector: 'cyan',
    Determiner: 'cyan',
    Hyphenated: 'cyan',
    Adverb: 'cyan',
  };

  const getColor = function (node) {
    if (Object.hasOwn(colors, node.id)) {
      return colors[node.id]
    }
    if (Object.hasOwn(colors, node.is)) {
      return colors[node.is]
    }
    const found = node._cache.parents.find(c => colors[c]);
    return colors[found]
  };

  // convert tags to our final format
  const fmt = function (nodes) {
    const res = {};
    const each = fn => Object.keys(res).forEach(fn);
    nodes.forEach(node => {
      const { not, also, is, novel } = node.props;
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
        children: [],
        color: getColor(node),
        // Retain the preferred output name for legacy model consumers.
        alias: node.aliases === undefined ? node.alias : node.aliases[0],
        aliases: node.aliases,
      };
    });
    // `also` is another inheritance edge. Resolve its ancestors before building
    // reverse edges, so removing any parent also removes all dependent tags.
    const resolved = new Set();
    const resolving = new Set();
    const resolveParents = function (tag) {
      if (resolved.has(tag)) {
        return res[tag].parents
      }
      if (resolving.has(tag)) {
        throw new Error(`compromise: cyclic tag inheritance at '${tag}'`)
      }
      resolving.add(tag);
      const parents = new Set();
      res[tag].parents.forEach(parent => {
        if (res[parent]) {
          resolveParents(parent).forEach(ancestor => parents.add(ancestor));
        }
        parents.add(parent);
      });
      res[tag].parents = Array.from(parents);
      resolving.delete(tag);
      resolved.add(tag);
      return res[tag].parents
    };
    each(resolveParents);
    each(tag => {
      res[tag].parents.forEach(parent => {
        if (res[parent]) {
          res[parent].children.push(tag);
        }
      });
    });

    // Inherit exclusions through every parent, then exclude all descendants of
    // each conflicting tag. Read a snapshot to keep this independent of order.
    const exclusions = {};
    each(tag => { exclusions[tag] = res[tag].not; });
    each(k => {
      const nots = new Set(exclusions[k]);
      res[k].parents.forEach(parent => {
        for (const not of exclusions[parent] || []) {
          nots.add(not);
        }
      });
      Array.from(nots).forEach(not => {
        if (res[not]) {
          res[not].children.forEach(tag => nots.add(tag));
        }
      });
      res[k].not = Array.from(nots);
      getTagSet(res[k].not);
      getTagSet(res[k].children);
      // Keep accepting custom definitions, but flag impossible combinations once
      // per tag, after both inheritance and reciprocal exclusions are resolved.
      const conflicts = [k, ...res[k].parents].filter(tag => nots.has(tag));
      if (conflicts.length > 0) {
        const names = conflicts.map(tag => `#${tag}`).join(', ');
        console.warn(`compromise: contradictory tag '#${k}' requires and excludes: ${names}`); // eslint-disable-line no-console
      }
    });
    return res
  };

  // Compile once per registration. Real tag names always take precedence.
  const compileAliases = (tags, normalize) => {
    const aliases = Object.create(null);
    Object.keys(tags).forEach(tag => { aliases[tag] = tag; });
    Object.keys(tags).forEach(tag => {
      const entry = tags[tag];
      const names = entry.aliases === undefined ? [entry.alias] : [entry.aliases].flat();
      names.forEach(name => {
        if (name === null || name === undefined) {
          return
        }
        if (typeof name !== 'string' || !/^[\p{L}_][\p{L}\p{M}\p{N}_-]*$/u.test(name)) {
          throw new Error(`compromise: invalid alias for '#${tag}'`)
        }
        // Match strings undergo Unicode normalization before parsing.
        const spellings = normalize ? [name, normalize(name)] : [name];
        spellings.forEach(spelling => {
          if (Object.hasOwn(tags, spelling)) {
            if (spelling !== name && spelling !== tag) {
              throw new Error(`compromise: tag alias '${name}' normalizes to '#${spelling}'`)
            }
            return
          }
          if (aliases[spelling] && aliases[spelling] !== tag) {
            throw new Error(`compromise: duplicate tag alias '${spelling}'`)
          }
          aliases[spelling] = tag;
        });
      });
    });
    return aliases
  };

  const toArr = function (input) {
    if (!input) {
      return []
    }
    if (typeof input === 'string') {
      return [input]
    }
    return input.slice()
  };

  const addImplied = function (tags) {
    const aliases = compileAliases(tags);
    const resolve = tag => aliases[tag] || tag;
    // add an implicit entry for any tag we reference
    const ensure = tag => {
      if (!Object.hasOwn(tags, tag)) {
        tags[tag] = {};
      }
    };
    Object.keys(tags).forEach(k => {
      const o = tags[k];
      // support deprecated fmts
      if (o.isA) {
        o.is = o.isA;
      }
      if (o.notA) {
        o.not = o.notA;
      }
      if (typeof o.is === 'string') {
        o.is = resolve(o.is);
      }
      if (o.also) {
        o.also = toArr(o.also).map(resolve);
      }
      if (o.not) {
        o.not = toArr(o.not).map(resolve);
      }
      // add any implicit 'is' tags
      if (o.is && typeof o.is === 'string') {
        ensure(o.is);
      }
      // Additional parents need entries too, including parents introduced by plugins.
      toArr(o.also).forEach(ensure);
      // add any implicit 'not' tags
      toArr(o.not).forEach(ensure);
    });
    return tags
  };


  const validate = function (tags, already) {
    // Reciprocal links must reach previously registered tags too. Copy entries
    // before normalization so the existing compiled model remains untouched.
    tags = Object.fromEntries(Object.keys({ ...already, ...tags }).map(tag => [tag, { ...already[tag], ...tags[tag] }]));
    tags = addImplied(tags);

    // property validation
    Object.keys(tags).forEach(k => {
      const o = tags[k];
      if (o.aliases !== undefined) {
        o.aliases = toArr(o.aliases);
      }
      o.children = toArr(o.children);
      o.not = toArr(o.not);
      if (o.also) {
        o.also = toArr(o.also);
      }
    });
    // not links are bi-directional
    // add any incoming not tags
    Object.keys(tags).forEach(k => {
      const nots = tags[k].not || [];
      nots.forEach(no => {
        if (tags[no] && tags[no].not && !tags[no].not.includes(k)) {
          tags[no].not.push(k);
        }
      });
    });
    return tags
  };

  // 'fill-down' parent logic inference
  const compute$2 = function (allTags) {
    // setup graph-lib format
    const flatList = Object.keys(allTags).map(k => {
      const o = allTags[k];
      const props = { not: new Set(o.not), also: o.also, is: o.is, novel: o.novel };
      return { id: k, parent: o.is, props, children: [], alias: o.alias, aliases: o.aliases?.slice() }
    });
    const graph$1 = graph(flatList).cache().fillDown();
    return graph$1.toArray()
  };

  const fromUser = function (tags) {
    Object.entries(tags).forEach(([k, v]) => {
      tags[k] = { ...v, novel: true };
    });
    return tags
  };

  const addTags$1 = function (tags, already) {
    // Normalization owns its definitions, including when callers reuse a tagset.
    tags = Object.fromEntries(Object.entries(tags).map(([tag, definition]) => [tag, { ...definition }]));
    // are these tags internal ones, or user-generated?
    if (Object.keys(already).length > 0) {
      tags = fromUser(tags);
    }
    tags = validate(tags, already);

    // do some basic setting-up
    // 'fill-down' parent logic
    const nodes = compute$2(tags);
    // convert it to our final format
    const res = fmt(nodes);
    return res
  };

  var methods$4 = {
    one: {
      setTag,
      unTag,
      addTags: addTags$1,
      canBe: canBe$1,
    },
  };

  // shared guards - returns the terms to change, or null
  const prep = function (view, input) {
    if (!view.found || !input) {
      return null
    }
    const terms = view.termList();
    if (terms.length === 0) {
      return null
    }
    return terms
  };

  const fns = {
    /** add a given tag, to all these terms */
    tag: function (input, reason = '', isSafe) {
      const terms = prep(this, input);
      if (terms) {
        this.methods.one.setTag(terms, input, this.world, isSafe, reason);
        this.uncache();
      }
      return this
    },

    /** add a given tag, only if it is consistent */
    tagSafe: function (input, reason = '') {
      return this.tag(input, reason, true)
    },

    /** remove a given tag from all these terms */
    unTag: function (input, reason) {
      const terms = prep(this, input);
      if (terms) {
        const { methods, model } = this;
        const { tagSet, tagAliases } = model.one;
        const list = Array.isArray(input) ? input : [input];
        list.forEach(tag => methods.one.unTag(terms, resolveTag(tag.trim(), tagAliases), tagSet, reason));
        this.uncache();
      }
      return this
    },

    /** return only the terms that can be this tag  */
    canBe: function (tag) {
      const { tagSet, tagAliases } = this.model.one;
      tag = resolveTag(tag, tagAliases);
      const canBe = this.methods.one.canBe;
      const nope = [];
      eachTerm(this.document, (term, terms, i, n) => {
        if (!canBe(term, tag, tagSet)) {
          nope.push([n, i, i + 1]);
        }
      });
      const noDoc = this.update(nope);
      return this.difference(noDoc)
    },
  };

  const tagAPI = function (View) {
    Object.assign(View.prototype, fns);
  };

  // wire-up more pos-tags to our model
  const addTags = function (tags) {
    const world = this.world();
    const { model, methods } = world;
    const tagSet = model.one.tagSet;
    const fn = methods.one.addTags;
    const res = fn(tags, tagSet);
    const aliases = compileAliases(res, name => methods.one.killUnicode(name, world));
    model.one.tagSet = res;
    model.one.tagAliases = aliases;
    return this
  };

  var lib$1 = { addTags };

  const boringTags$1 = new Set(['Auxiliary', 'Possessive']);

  const sortByKids$1 = function (tags, tagSet) {
    tags = tags.sort((a, b) => {
      // (unknown tags are interesting)
      if (boringTags$1.has(a) || !Object.hasOwn(tagSet, b)) {
        return 1
      }
      if (boringTags$1.has(b) || !Object.hasOwn(tagSet, a)) {
        return -1
      }
      let kids = tagSet[a].children || [];
      const aKids = kids.length;
      kids = tagSet[b].children || [];
      const bKids = kids.length;
      return aKids - bKids
    });
    return tags
  };

  const tagRank$1 = function (view) {
    const { document, world } = view;
    const tagSet = world.model.one.tagSet;
    eachTerm(document, term => {
      const tags = Array.from(term.tags);
      term.tagRank = sortByKids$1(tags, tagSet);
    });
  };

  var tag = {
    model: {
      one: { tagSet: {}, tagAliases: Object.create(null) }
    },
    compute: {
      tagRank: tagRank$1
    },
    methods: methods$4,
    api: tagAPI,
    lib: lib$1
  };

  // Scan punctuation runs once. Searching for an unanchored run followed by
  // whitespace repeatedly rescans long runs that have no following whitespace.
  const stops = new Set('.!?\u203D\u2E18\u203C\u2047\u2048\u2049\u0964\u0965\u061F\u06D4\u0589\u1362\u1367\u104B\u17D4\u3002');
  const cjkStops = new Set('。！？｡');
  const openers$1 = new Set('「『（【〔《〈“');
  const closers = new Set('」』）】〕》〉”');
  const whitespace = /\s/;
  const splitsOnly = /^[.!?‽⸘‼\u2047-\u2049।॥؟۔։።፧။។。]+\s$/;
  const splitsOnlyCjk = /^(?:[.!?‽⸘‼\u2047-\u2049।॥؟۔։።፧။។。！？｡]+\s|[。！？｡]+[」』）】〕》〉”]*)$/;
  const newLine = /((?:\r?\n|\r)+)/;

  const basicSplit = function (text) {
    const all = [];
    const isCjk = /[。！？｡]/.test(text);
    const activeStops = isCjk ? new Set([...stops, ...cjkStops]) : stops;
    for (const line of text.split(newLine)) {
      let start = 0;
      const arr = [];
      const emit = (from, end) => {
        arr.push(line.slice(start, from), line.slice(from, end));
        start = end;
      };
      let i = 0;
      while (i < line.length) {
        if (!activeStops.has(line[i])) {
          i++;
          continue
        }
        const runStart = i;
        while (i < line.length && activeStops.has(line[i])) i++;
        if (i < line.length && whitespace.test(line[i])) {
          emit(runStart, i + 1);
          i++;
          continue
        }
        if (!isCjk) continue
        // A CJK stop ends a sentence without whitespace. Following closing quotes
        // only end it when followed by whitespace, another opener, or end of text.
        let j = runStart;
        while (j < i) {
          if (!cjkStops.has(line[j])) {
            j++;
            continue
          }
          const from = j;
          while (j < i && cjkStops.has(line[j])) j++;
          let end = j;
          while (end < line.length && closers.has(line[end])) end++;
          if (end === j || end === line.length || whitespace.test(line[end]) || openers$1.has(line[end])) {
            emit(from, end);
            if (end > i) i = end;
          }
        }
      }
      arr.push(line.slice(start));
      // Preserve the existing merge behavior, including punctuation-only pieces.
      for (let k = 0; k < arr.length; k++) {
        const next = arr[k + 1];
        if (next && (isCjk ? splitsOnlyCjk : splitsOnly).test(next)) {
          arr[k] += next;
          arr[k + 1] = '';
        }
        if (arr[k]) all.push(arr[k]);
      }
    }
    return all
  };

  // a letter, number, or symbol/emoji in any script - otherwise it's only punctuation
  const hasLetter$3 = /[\p{L}\p{N}\p{So}]/u;
  const hasSomething$1 = /\S/;

  const notEmpty = function (splits) {
    const chunks = [];
    let lead = ''; // whitespace+punctuation, before the first chunk
    for (let i = 0; i < splits.length; i++) {
      const s = splits[i];
      if (s === undefined || s === '') {
        continue
      }
      //this is meaningful whitespace
      if (!hasSomething$1.test(s) || !hasLetter$3.test(s)) {
        //add it to the last one
        if (chunks[chunks.length - 1]) {
          chunks[chunks.length - 1] += s;
          continue
        } else if (splits[i + 1]) {
          //add it to the next one
          lead += s;
          continue
        }
      }
      //else, only whitespace, no terms, no sentence
      chunks.push(lead + s);
      lead = '';
    }
    return chunks
  };

  const hasLetter$2 = /\p{L}/u;

  const hasNewline = function (c) {
    return Boolean(/\n$/.test(c))
  };

  //loop through these chunks, and join the non-sentence chunks back together..
  // (only check the end of the joined text - re-reading it for every chunk is quadratic)
  const smartMerge = function (chunks, world) {
    const isSentence = world.methods.one.tokenize.isSentence;
    const abbrevs = world.model.one.abbreviations || new Set();

    const sentences = [];
    let sentence = '';
    let tail = '';
    let foundLetter = false;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      sentence += c;
      tail = (tail + c).slice(-64);
      foundLetter ||= hasLetter$2.test(c);
      //should this chunk be combined with the next one?
      if (chunks[i + 1] && !isSentence(tail, abbrevs, foundLetter) && !hasNewline(c)) {
        continue
      }
      //this chunk is a proper sentence..
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      sentence = '';
      tail = '';
      foundLetter = false;
    }
    return sentences
  };

  /* eslint-disable regexp/no-dupe-characters-character-class */

  // merge embedded quotes into 1 sentence
  // like - 'he said "no!" and left.'
  const MAX_QUOTE$1 = 280;// ¯\_(ツ)_/¯

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
    '\u300C': '\u300D', // 'CornerBrackets' 「」
    '\u300E': '\u300F', // 'WhiteCornerBrackets' 『』
  };
  const openQuote = RegExp('[' + Object.keys(pairs).join('') + ']', 'g');
  const closeQuote = RegExp('[' + Object.values(pairs).join('') + ']', 'g');

  const closesQuote = function (str) {
    if (!str) {
      return false
    }
    const m = str.match(closeQuote);
    if (m !== null && m.length === 1) {
      return true
    }
    return false
  };

  // allow micro-sentences when inside a quotation, like:
  // the doc said "no sir. i will not beg" and walked away.
  const quoteMerge = function (splits) {
    const arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      const split = splits[i];
      // do we have an open-quote and not a closed one?
      const m = split.match(openQuote);
      if (m !== null && m.length === 1) {
        // is the quote already closed in this chunk? - '“Yes!” said Tom. “No!” said Ann.'
        const closed = split.match(closeQuote);
        if (closed !== null && closed[0] !== m[0]) {
          arr.push(split);
          continue
        }

        // look at the next sentence for a closing quote,
        if (closesQuote(splits[i + 1]) && splits[i + 1].length < MAX_QUOTE$1) {
          splits[i] += splits[i + 1];// merge them
          arr.push(splits[i]);
          splits[i + 1] = '';
          i += 1;
          continue
        }
        // look at n+2 for a closing quote,
        if (closesQuote(splits[i + 2])) {
          const toAdd = splits[i + 1] + splits[i + 2];// merge them all
          //make sure it's not too-long
          if (toAdd.length < MAX_QUOTE$1) {
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

  const MAX_LEN = 250;// ¯\_(ツ)_/¯

  // support unicode variants?
  // https://stackoverflow.com/questions/13535172/list-of-all-unicodes-open-close-brackets
  const hasOpen = /[(\uFF08]/g;
  const hasClosed = /[)\uFF09]/g;
  const mergeParens = function (splits) {
    const arr = [];
    for (let i = 0; i < splits.length; i += 1) {
      const split = splits[i];
      const m = split.match(hasOpen);
      if (m !== null && m.length === 1) {
        // look at next sentence, for closing parenthesis
        if (splits[i + 1] && splits[i + 1].length < MAX_LEN) {
          const m2 = splits[i + 1].match(hasClosed);
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

  //(Rule-based sentence boundary segmentation) - chop given text into its proper sentences.
  // Ignore periods/questions/exclamations used in acronyms/abbreviations/numbers, etc.
  //regs-
  const hasSomething = /\S/;
  const startWhitespace = /^\s+/;

  const splitSentences = function (text, world) {
    text ||= '';
    text = String(text);
    // Ensure it 'smells like' a sentence
    if (!text || typeof text !== 'string' || !hasSomething.test(text)) {
      return []
    }
    // First do a greedy-split..
    const splits = basicSplit(text);
    // Filter-out the crap ones
    let sentences = notEmpty(splits);
    //detection of non-sentence chunks:
    sentences = smartMerge(sentences, world);
    // allow 'he said "no sir." and left.'
    sentences = quoteMerge(sentences);
    // allow 'i thought (no way!) and left.'
    sentences = mergeParens(sentences);
    //if we never got a sentence, return the given text
    if (sentences.length === 0) {
      return [text]
    }
    //move whitespace to the ends of sentences, when possible
    //['hello',' world'] -> ['hello ','world']
    for (let i = 1; i < sentences.length; i += 1) {
      const ws = sentences[i].match(startWhitespace);
      if (ws !== null) {
        sentences[i - 1] += ws[0];
        sentences[i] = sentences[i].replace(startWhitespace, '');
      }
    }
    return sentences
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

  const wordlike = /\S/;
  const isBoundary = /^[!?.]+$/;
  const naiiveSplit = /(\S+)/;

  const notWord = new Set(toList(`
.
?
!
:
;
-
–
—
--
...
(
)
[
]
"
'
\`
«
»
*
•
`));

  //turn a string into an array of strings (naiive for now, lumped later)
  const splitWords = function (str, model) {
    let result = [];
    let arr = [];
    //start with a naiive split
    str ||= '';
    if (typeof str === 'number') {
      str = String(str);
    }
    if (Array.isArray(str)) {
      return str
    }
    const words = str.split(naiiveSplit);
    for (let i = 0; i < words.length; i++) {
      //split 'one-two'
      if (hasHyphen$1(words[i], model)) {
        arr = arr.concat(splitHyphens$1(words[i]));
        continue
      }
      arr.push(words[i]);
    }
    //greedy merge whitespace+arr to the right
    let carry = '';
    for (let i = 0; i < arr.length; i++) {
      const word = arr[i];
      //if it's more than a whitespace
      if (wordlike.test(word) && !notWord.has(word) && !isBoundary.test(word)) {
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
    result = combineSlashes(result);
    result = combineRanges(result);
    // remove empty results
    result = result.filter(s => s);
    return result
  };

  //all punctuation marks, from https://en.wikipedia.org/wiki/Punctuation

  //we have slightly different rules for start/end - like #hashtags.
  const isLetter$1 = /\p{Letter}/u;
  const isMark = /\p{Mark}/u;
  const isNumber = /[\p{Number}\p{Currency_Symbol}]/u;
  const hasAcronym = /^[a-z]\.([a-z]\.)+/i;
  const chillin = /[sn]['’]$/;
  // a leading apostrophe that stands for letters - 'tis, 'em, 'cause
  const elision$1 = /^['’](tis|twas|em|cause|til|bout|round)\b/i;
  const isFullNumber = /^[(+\-]?\d+(th|st|nd|rd)?[)+\-]?$/;
  const openers = { ')': '(', ']': '[', '}': '{' };

  // does this closing bracket close one inside the word, like 'foo(bar)'
  const closesInside = function (chars, start, end) {
    const close = chars[end - 1];
    let depth = 0;
    for (let i = start; i < end - 1; i += 1) {
      if (chars[i] === openers[close]) {
        depth += 1;
      } else if (chars[i] === close) {
        depth -= 1;
      }
    }
    return depth > 0
  };

  const normalizePunctuation = function (str, model) {
    // quick lookup for allowed pre/post punctuation
    const { prePunctuation, postPunctuation, emoticons } = model.one;
    const original = str;
    const trimmed = str.trim();
    let pre = '';
    let post = '';
    const chars = Array.from(str);
    let start = 0;
    let end = chars.length;

    // punctuation-only words, like '<3'
    if (Object.hasOwn(emoticons, trimmed)) {
      return { str: trimmed, pre, post: ' ' } //not great
    }

    // Locate the first retained code point without shifting the array.
    while (start < end) {
      const c = chars[start];
      // keep any declared chars
      if (prePunctuation[c] === true) {
        break//keep it
      }
      // keep '+' or '-' only before a number
      if ((c === '+' || c === '-' || c === '(') && isFullNumber.test(trimmed)) {
        break//done
      }
      // start of word
      if (isLetter$1.test(c) || isNumber.test(c)) {
        break //done
      }
      // keep an elided apostrophe - 'tis
      if ((c === "'" || c === '’') && elision$1.test(chars.slice(start).join(''))) {
        break//keep it
      }
      // punctuation
      start++;
    }

    // Locate the last retained code point.
    while (end > start) {
      const c = chars[end - 1];
      // keep any declared chars
      if (postPunctuation[c] === true) {
        break//keep it
      }
      // start of word
      if (isLetter$1.test(c) || isNumber.test(c)) {
        break //done
      }
      // Keep marks attached to letters, but not variation selectors after symbols.
      if (isMark.test(c)) {
        let base = end - 2;
        while (base >= start && isMark.test(chars[base])) {
          base--;
        }
        if (base >= start && isLetter$1.test(chars[base])) {
          break
        }
        end = base + 1;
        continue
      }
      // F.B.I.
      if (c === '.' && hasAcronym.test(original)) {
        break//keep it
      }
      //  keep s-apostrophe - "flanders'" or "chillin'"
      if (c === "'" && chillin.test(original)) {
        break//keep it
      }
      // keep '+' or ')' only for a number like (800) or 500+
      if ((c === '+' || c === ')') && isFullNumber.test(trimmed)) {
        break//done
      }
      if (Object.hasOwn(openers, c) && closesInside(chars, start, end)) {
        break//keep it
      }
      // punctuation
      end--;
    }
    pre = chars.slice(0, start).join('');
    post = chars.slice(end).join('');
    str = chars.slice(start, end).join('');
    //we went too far..
    if (str === '') {
      // do a very mild parse, and hope for the best.
      let last = original.length;
      while (last > 0 && original[last - 1] === ' ') last--;
      post = original.slice(last);
      str = original.slice(0, last);
      pre = '';
    }
    return { str, pre, post }
  };

  const parseTerm = (txt, model) => {
    // cleanup any punctuation as whitespace
    const { str, pre, post } = normalizePunctuation(txt, model);
    const parsed = {
      text: str,
      pre: pre,
      post: post,
      tags: new Set(),
    };
    return parsed
  };

  // 'Björk' to 'Bjork'.
  const killUnicode = function (str, world) {
    const unicode = world.model.one.unicode || {};
    str ||= '';
    const chars = str.split('');
    chars.forEach((s, i) => {
      if (unicode[s]) {
        chars[i] = unicode[s];
      }
    });
    return chars.join('')
  };

  // Inspect the trailing run once, including when punctuation occurs internally.
  const trimPunctuation = (str, punctuation) => {
    let end = str.length;
    while (end > 0 && punctuation.test(str[end - 1])) end--;
    return str.slice(0, end)
  };

  /** some basic operations on a string to reduce noise */
  const clean = function (str) {
    str ||= '';
    str = str.toLowerCase();
    str = str.trim();
    const original = str;
    //punctuation
    str = trimPunctuation(str, /[,;.!?]/);
    //coerce Unicode ellipses
    str = str.replaceAll('…', '...');
    //en-dash
    str = str.replaceAll('–', '-');
    //strip leading & trailing grammatical punctuation
    if (!/^[:;]/.test(str)) {
      str = trimPunctuation(str, /[",.!:;?)]/);
      str = str.replace(/^['’"(]+/g, '');
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

  // do acronyms need to be ASCII?  ... kind of?
  const acronyms = [
    /^([A-Z]\.)+[A-Z]?,?$/, //like N.D.A
    /^([a-z]\.)+[a-z]\.?$/, //like c.e.o
    /^[A-Z]\.,?$/, //like 'F.'
    /^[A-Z]{2,}('s|,)?$/, //like NDA
  ];

  const isAcronym$2 = str => acronyms.some(re => re.test(str));

  const doAcronym = function (str) {
    if (isAcronym$2(str)) {
      str = str.replace(/\./g, '');
    }
    return str
  };

  const normalize = function (term, world) {
    const killUnicode = world.methods.one.killUnicode;
    // console.log(world.methods.one)
    let str = term.text || '';
    str = clean(str);
    //(very) rough ASCII transliteration -  bjŏrk -> bjork
    str = killUnicode(str, world);
    str = doAcronym(str);
    term.normal = str;
  };

  // turn a string input into a 'document' json format
  const parse$1 = function (input, world) {
    const { methods, model } = world;
    const { splitSentences, splitTerms, splitWhitespace } = methods.one.tokenize;
    input ||= '';
    // split into sentences
    const sentences = splitSentences(input, world);
    // split into word objects
    input = sentences.map((txt) => {
      let terms = splitTerms(txt, model);
      // split into [pre-text-post]
      terms = terms.map(t => splitWhitespace(t, model));
      // add normalized term format, always
      terms.forEach((t) => {
        normalize(t, world);
      });
      return terms
    });
    return input
  };

  const isAcronym$1 = /[ .][A-Z]\.? *$/i; //asci - 'n.s.a.'
  const hasEllipse$1 = /(?:\u2026|\.{2}) *$/; // '...'
  const hasLetter$1 = /\p{L}/u;
  const hasPeriod$1 = /\. *$/;
  const leadInit = /^[A-Z]\. $/; // "W. Kensington"

  /** does this look like a sentence? - str can be the end of it, if foundLetter is given */
  const isSentence$1 = function (str, abbrevs, foundLetter = hasLetter$1.test(str)) {
    // must have a letter
    if (foundLetter === false) {
      return false
    }
    // check for 'F.B.I.'
    if (isAcronym$1.test(str)) {
      return false
    }
    // check for leading initial - "W. Kensington"
    if (str.length === 3 && leadInit.test(str)) {
      return false
    }
    //check for '...'
    if (hasEllipse$1.test(str)) {
      return false
    }
    const txt = str.replace(/[.!?\u203D\u2E18\u203C\u2047-\u2049] *$/, '');
    const words = txt.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    // check for 'Mr.' (and not mr?)
    if (Object.hasOwn(abbrevs, lastWord) && hasPeriod$1.test(str)) {
      return false
    }
    // //check for jeopardy!
    // if (blacklist.hasOwnProperty(lastWord)) {
    //   return false
    // }
    return true
  };

  var methods$3 = {
    one: {
      killUnicode,
      tokenize: {
        splitSentences,
        isSentence: isSentence$1,
        splitTerms: splitWords,
        splitWhitespace: parseTerm,
        fromString: parse$1,
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

  // prob=probably, pron=pronunciation, gal=gallon, fig=figure, lat/lng=latitude/longitude,
  // vol=volume, fm (not am), def=definition, plz=please, ea=each, sec=second, pref=preface,
  // pl=plural, pp=pages, qt=quarter, fr=french, nee=given name at birth, ss=ship or sections,
  // ver=version, fem/masc, eng=engineering/english, adj/vb/rb/inf=grammar, situ/vivo/vitro=in situ..
  // wr=world record
  var misc$2 = toList(`
approx
apt
bc
cyn
eg
esp
est
etc
ex
exp
prob
pron
gal
min
pseud
fig
jd
lat
lng
vol
fm
def
misc
plz
ea
ps
sec
pt
pref
pl
pp
qt
fr
sq
nee
ss
tel
temp
vet
ver
fem
masc
eng
adj
vb
rb
inf
situ
vivo
vitro
wr
`);

  // (not miss, misses)
  var honorifics = toList(`
adj
adm
adv
asst
atty
bldg
brig
capt
cmdr
comdr
cpl
det
dr
esq
gen
gov
hon
jr
llb
lt
maj
messrs
mlle
mme
mr
mrs
ms
mstr
phd
prof
pvt
rep
reps
res
rev
sen
sens
sfc
sgt
sir
sr
supt
surg
`);

  var months = toList(`
jan
feb
mar
apr
jun
jul
aug
sep
sept
oct
nov
dec
`);

  var nouns$2 = toList(`
ad
al
arc
ba
bl
ca
cca
col
corp
ft
fy
ie
lit
ma
md
pd
tce
`);

  var organizations = toList(`
dept
univ
assn
bros
inc
ltd
co
`);

  // streets, then states/provinces (not ct)
  var places = toList(`
rd
st
dist
mt
ave
blvd
cl
cres
hwy
ariz
cal
calif
colo
conn
fla
fl
ga
ida
ia
kan
kans
minn
neb
nebr
okla
penna
penn
pa
dak
tenn
tex
ut
vt
va
wis
wisc
wy
wyo
usafa
alta
ont
que
sask
`);

  // units that are abbreviations too (not ft, gb, pa - ambiguous)
  // dm=decimeter, hr/hrs=hour, dg/cg/mg/µg=grams, lb=pound, oz=ounce, hz=hertz,
  // mps=meters per second, kmph=kilometers per hour, kb/mb/tb/yb=bytes, lx=lux, lm=lumen
  var units = toList(`
dl
ml
gal
qt
pt
tbl
tsp
tbsp
km
dm
cm
mm
mi
td
hr
hrs
kg
hg
dg
cg
mg
µg
lb
oz
sq ft
hz
mps
mph
kmph
kb
mb
tb
lx
lm
fl oz
yb
`);

  // add our abbreviation list to our lexicon
  const list = [
    [misc$2],
    [units, 'Unit'],
    [nouns$2, 'Noun'],
    [honorifics, 'Honorific'],
    [months, 'Month'],
    [organizations, 'Organization'],
    [places, 'Place'],
  ];
  // create key-val for sentence-tokenizer
  const abbreviations = {};
  // add them to a future lexicon
  const lexicon$2 = {};

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
  //  'mid-century', 'pre-history', 'out-lived', 'ex-wife'
  // (not counter, mid, non, over, post, semi, super, ultra, under, whole)
  var prefixes = toHash(toList(`
anti
bi
co
contra
de
extra
infra
inter
intra
macro
micro
mis
mono
multi
peri
pre
pro
proto
pseudo
re
sub
supra
trans
tri
un
out
ex
`));

  // dashed suffixes that are not independent words
  //  'flower-like', 'president-elect'  (not fold)
  var suffixes = toHash(toList(`
like
ish
less
able
elect
type
designate
`));

  //a hugely-ignorant, and widely subjective transliteration of latin, cryllic, greek unicode characters to english ascii.
  //approximate visual (not semantic or phonetic) relationship between unicode and ascii characters
  //http://en.wikipedia.org/wiki/List_of_Unicode_characters
  //https://docs.google.com/spreadsheet/ccc?key=0Ah46z755j7cVdFRDM1A2YVpwa1ZYWlpJM2pQZ003M0E
  const compact$1 = {
    '!': '¡',
    '?': '¿Ɂ',
    '"': '“”"❝❞',
    "'": '‘‛❛❜’',
    '-': '—–',
    a: 'ªÀÁÂÃÄÅàáâãäåĀāĂăĄąǍǎǞǟǠǡǺǻȀȁȂȃȦȧȺΆΑΔΛάαλАаѦѧӐӑӒӓƛæ',
    b: 'ßþƀƁƂƃƄƅɃΒβϐϦБВЪЬвъьѢѣҌҍ',
    c: '¢©ÇçĆćĈĉĊċČčƆƇƈȻȼͻͼϲϹϽϾСсєҀҁҪҫ',
    d: 'ÐĎďĐđƉƊȡƋƌ',
    e: 'ÈÉÊËèéêëĒēĔĕĖėĘęĚěƐȄȅȆȇȨȩɆɇΈΕΞΣέεξϵЀЁЕеѐёҼҽҾҿӖӗễ',
    f: 'ƑƒϜϝӺӻҒғſ',
    g: 'ĜĝĞğĠġĢģƓǤǥǦǧǴǵ',
    h: 'ĤĥĦħƕǶȞȟΉΗЂЊЋНнђћҢңҤҥҺһӉӊ',
    I: 'ÌÍÎÏ',
    i: 'ìíîïĨĩĪīĬĭĮįİıƖƗȈȉȊȋΊΐΪίιϊІЇіїi̇',
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
  const unicode$1 = {};
  Object.keys(compact$1).forEach(function (k) {
    compact$1[k].split('').forEach(function (s) {
      unicode$1[s] = k;
    });
  });
  // fullwidth ascii - 'Ｈｅｌｌｏ ２０２４' to 'Hello 2024'
  for (let i = 0x21; i <= 0x7E; i += 1) {
    unicode$1[String.fromCharCode(i + 0xFEE0)] = String.fromCharCode(i);
  }

  // https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7Bpunctuation%7D

  // zero-width chars
  const zeroWidth = '\u200B\u200C\u200D\uFEFF';

  // punctuation to keep at start of word - #hastag, @atmention, underscore
  // (not +4, -4, .4)
  const prePunctuation = toHash(('#@_°' + zeroWidth).split(''));

  // punctuation to keep at end of word - 88%, underscore, degrees/italian ordinal
  const postPunctuation = toHash(('%_°' + zeroWidth).split(''));

  const emoticons = toHash('<3 </3 <\\3 :^P :^p :^O :^3'.split(' '));

  var model$3 = {
    one: {
      aliases,
      abbreviations,
      prefixes,
      suffixes,
      prePunctuation,
      postPunctuation,
      lexicon: lexicon$2, //give this one forward
      unicode: unicode$1,
      emoticons
    },
  };

  const hasSlash = /\//;
  const hasDomain = /[a-z]\.[a-z]/i;
  const isMath = /[0-9]/;
  // const hasSlash = /[a-z\u00C0-\u00FF] ?\/ ?[a-z\u00C0-\u00FF]/
  // const hasApostrophe = /['’]s$/

  const addAliases = function (term, world) {
    const str = term.normal || term.text || term.machine;
    const aliases = world.model.one.aliases;
    // lookup known aliases like '&'
    if (Object.hasOwn(aliases, str)) {
      term.alias ||= [];
      term.alias.push(aliases[str]);
    }
    // support slashes as aliases
    if (hasSlash.test(str) && !hasDomain.test(str) && !isMath.test(str)) {
      const arr = str.split(hasSlash);
      // don't split urls and things
      if (arr.length <= 3) {
        arr.forEach(word => {
          word = word.trim();
          if (word !== '') {
            term.alias ||= [];
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

  const hasDash$2 = /^\p{Letter}+-\p{Letter}+$/u;
  // 'machine' is a normalized form that looses human-readability
  const doMachine$1 = function (term) {
    let str = term.implicit || term.normal || term.text;
    // remove apostrophes
    str = str.replace(/['’]s$/, '');
    str = str.replace(/s['’]$/, 's');
    //lookin'->looking (make it easier for conjugation)
    str = str.replace(/([aeiou][ktrp])in'$/, '$1ing');
    //turn re-enactment to reenactment
    if (hasDash$2.test(str)) {
      str = str.replace(/-/g, '');
    }
    //#tags, @mentions
    str = str.replace(/^[#@]/, '');
    if (str !== term.normal) {
      term.machine = str;
    }
  };

  // sort words by frequency
  const freq = function (view) {
    const docs = view.docs;
    const counts = Object.create(null);
    eachTerm(docs, term => {
      const word = term.machine || term.normal;
      counts[word] ??= 0;
      counts[word] += 1;
    });
    // add counts on each term
    eachTerm(docs, term => {
      term.freq = counts[term.machine || term.normal];
    });
  };

  // get all character startings in doc
  const offset = function (view) {
    let elapsed = 0;
    let index = 0;
    //start from the actual-top
    eachTerm(view.document, term => {
      term.offset = {
        index: index,
        start: elapsed + term.pre.length,
        length: term.text.length,
      };
      elapsed += term.pre.length + term.text.length + term.post.length;
      index += 1;
    });
  };

  // cheat- add the document's pointer to the terms
  const index = function (view) {
    eachTerm(view.document, (term, terms, t, n) => {
      term.index = [n, t];
    });
  };

  const wordCount = function (view) {
    let n = 0;
    eachTerm(view.docs, term => {
      //skip implicit words
      if (term.normal !== '') {
        n += 1;
        term.wordCount = n;
      }
    });
  };

  // cheat-method for a quick loop
  const termLoop$1 = (view, fn) => eachTerm(view.docs, term => fn(term, view.world));

  const methods$2 = {
    alias: (view) => termLoop$1(view, addAliases),
    machine: (view) => termLoop$1(view, doMachine$1),
    normal: (view) => termLoop$1(view, normalize),
    freq,
    offset,
    index,
    wordCount,
  };

  var tokenize$1 = {
    compute: methods$2,
    methods: methods$3,
    model: model$3,
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
    const lastTerm = docs.at(-1)?.at(-1);
    // if we've already put whitespace, end.
    if (!lastTerm || lastTerm.post) {
      return
    }
    // if we found something
    if (Object.hasOwn(prefixes, lastTerm.normal)) {
      const found = prefixes[lastTerm.normal];
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
    const term = docs.at(-1)?.at(-1);
    if (term?.typeahead === true && term.machine) {
      term.text = term.machine;
      term.normal = term.machine;
    }
    return this
  };

  const api$6 = function (View) {
    View.prototype.autoFill = autoFill;
  };

  // generate all the possible prefixes up-front
  const getPrefixes = function (arr, opts, world) {
    let index = {};
    const collisions = [];
    const existing = world.prefixes || {};
    arr.forEach((str) => {
      str = str.toLowerCase().trim();
      let max = str.length;
      if (opts.max && max > opts.max) {
        max = opts.max;
      }
      for (let size = opts.min; size < max; size += 1) {
        const prefix = str.substring(0, size);
        // ensure prefix is not a word
        if (opts.safe && Object.hasOwn(world.model.one.lexicon, prefix)) {
          continue
        }
        // does it already exist?
        if (Object.hasOwn(existing, prefix)) {
          collisions.push(prefix);
          continue
        }
        if (Object.hasOwn(index, prefix)) {
          collisions.push(prefix);
          continue
        }
        index[prefix] = str;
      }
    });
    // merge with existing prefixes
    index = { ...existing, ...index };
    // remove ambiguous-prefixes
    collisions.forEach((str) => {
      delete index[str];
    });
    return index
  };

  const defaults = {
    safe: true,
    min: 3,
  };

  const prepare = function (words = [], opts = {}) {
    const model = this.model();
    opts = { ...defaults, ...opts };
    if (isObject(words)) {
      Object.assign(model.one.lexicon, words);
      words = Object.keys(words);
    }
    const prefixes = getPrefixes(words, opts, this.world());
    // manually combine these with any existing prefixes
    Object.keys(prefixes).forEach(str => {
      // explode any overlaps
      if (Object.hasOwn(model.one.typeahead, str)) {
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

  const model$2 = {
    one: {
      typeahead: {} //set a blank key-val
    }
  };
  var typeahead = {
    model: model$2,
    api: api$6,
    lib,
    compute: compute$1,
    hooks: ['typeahead']
  };

  // order here matters
  nlp.extend(change); //0kb
  nlp.extend(output); //0kb
  nlp.extend(match); //10kb
  nlp.extend(pointers); //2kb
  nlp.extend(tag); //2kb
  nlp.plugin(plugin); //~6kb
  nlp.extend(tokenize$1); //7kb
  nlp.extend(freeze); //
  nlp.plugin(cache$1); //~1kb
  nlp.extend(lookup); //7kb
  nlp.extend(typeahead); //1kb
  nlp.extend(lexicon$3); //1kb
  nlp.extend(sweep); //1kb

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
  const compact = {
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
  const unicode = {};
  Object.keys(compact).forEach(function (k) {
    compact[k].split('').forEach(function (s) {
      unicode[s] = k;
    });
  });

  var contractions$1 = [
    { word: "qu'il", out: ['que', 'il'] },
    { word: "n'est", out: ['ne', 'est'] },
    { word: 'aux', out: ['à', 'les'] },
    { word: 'au', out: ['à', 'le'] },
    // 'before' rules only fire when the remainder is 3+ chars,
    // so short forms like "n'y" need explicit entries below
    { before: 'm', out: ['me'] },
    { before: 's', out: ['se'] },
    { before: 't', out: ['te'] },
    { before: 'n', out: ['ne'] },
    { before: 'c', out: ['ce'] },//c'était
    { before: 'd', out: ['de'] },//d'autres - d' is always 'de'
    { before: 'qu', out: ['que'] },//tant qu'étudiant
    { before: 'puisqu', out: ['puisque'] },
    { before: 'lorsqu', out: ['lorsque'] },//lorsqu’il
    { before: 'jusqu', out: ['jusque'] },//jusqu'en
    { before: 'quelqu', out: ['quelque'] },//Quelqu'un

    // ne + short word
    { word: "n'y", out: ['ne', 'y'] },
    { word: "n'a", out: ['ne', 'a'] },
    { word: "n'ai", out: ['ne', 'ai'] },
    { word: "n'as", out: ['ne', 'as'] },
    { word: "n'es", out: ['ne', 'es'] },
    { word: "n'en", out: ['ne', 'en'] },
    // c'est
    { word: "c'est", out: ['ce', 'est'] },
    // object clitics + avoir
    { word: "m'a", out: ['me', 'a'] },
    { word: "m'as", out: ['me', 'as'] },
    { word: "m'en", out: ['me', 'en'] },
    { word: "m'y", out: ['me', 'y'] },
    { word: "t'a", out: ['te', 'a'] },
    { word: "t'en", out: ['te', 'en'] },
    { word: "t'y", out: ['te', 'y'] },
    { word: "s'en", out: ['se', 'en'] },
    { word: "s'y", out: ['se', 'y'] },
    { word: "l'a", out: ['le', 'a'] },
    { word: "l'ai", out: ['le', 'ai'] },
    { word: "l'as", out: ['le', 'as'] },
    // informal tu
    { word: "t'as", out: ['tu', 'as'] },
    { word: "t'es", out: ['tu', 'es'] },
    // que + short word
    { word: "qu'on", out: ['que', 'on'] },
    { word: "qu'un", out: ['que', 'un'] },
    { word: "qu'à", out: ['que', 'à'] },
    { word: "qu'en", out: ['que', 'en'] },
    // de + une (core guesses 'du' here)
    { word: "d'une", out: ['de', 'une'] },

    { word: 'auquel', out: ['à', 'lequel'] },
    { word: 'auxquels', out: ['à', 'lesquels'] },
    { word: 'auxquelles', out: ['à', 'lesquelles'] },
    { word: 'duquel', out: ['de', 'lequel'] },
    { word: 'desquels', out: ['de', 'lesquels'] },
    { word: 'desquelles', out: ['de', 'lesquelles'] },
  ];

  const hasDash$1 = /^\p{Letter}+-\p{Letter}+$/u;
  // 'machine' is a normalized form that looses human-readability
  const doMachine = function (term) {
    let str = term.implicit || term.normal || term.text;
    //turn re-enactment to reenactment
    if (hasDash$1.test(str)) {
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

  // cheat-method for a quick loop
  const termLoop = function (view, fn) {
    const docs = view.docs;
    for (let i = 0; i < docs.length; i += 1) {
      for (let t = 0; t < docs[i].length; t += 1) {
        fn(docs[i][t], view.world);
      }
    }
  };
  var compute = {
    machine: (view) => termLoop(view, doMachine),
  };

  // sentence-splitting rules that the english parser doesn't have.
  // - isSentence() replaces the english one, and only sees the end of a chunk
  // - wrap() runs after the english splitter, so it can see the next sentence too
  // all of the language-specific parts are in ./abbreviations.js
  const MAX_QUOTE = 500;
  const MAX_MERGE = 6;

  const hasLetter = /\p{L}/u;
  const hasUpper = /\p{Lu}/u;
  const hasPeriod = /\. *$/;
  const hasEllipse = /(?:\u2026|\.{2,}) *$/;
  // an uppercase initial - 'A. S. Pushkin', or a dotted letter - 'F.B.I.', 'u.a.'
  const isInitial = /(?:(?:^|[\s([«»„“"'-])\p{Lu}|\.\p{L})\. *$/u;
  // one lowercase letter - 'z. B.', 'i. d. R.'
  const isLetter = /(?:^|[\s([«»„“"'])\p{Ll}\. *$/u;
  // '3.' or '102.', and 'VIII.'
  const isOrdinal = /(?:\d|(?<!\p{L})[IVX]{2,})\. *$/u;
  const trailing = /[.!?\u203D\u2E18\u203C\u2047\u2048\u2049]+ *$/;
  const leading = /^[([{«»„“”"'‚‘¿¡—–-]+/;
  const elision = /^\p{L}+['’]/u; // l'avv.
  const endsNewline = /\n\s*$/;
  // 'Who's there? — he asked.'
  const endsAsk = /[?!\u2026]["»“”«]*[ \t\u00A0\u202F]*$/;
  const startsLower = /^\p{Ll}/u;
  const startsDash = /^[—–]\s*\p{Ll}/u;

  const escape = str => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const count = (str, char) => str.split(char).length - 1;

  const build = function (config) {
    const { quotes = [], enders = [], starters = [] } = config;

    // the last word of a chunk - 'dr', 'pág', 'avv'
    const lastWord = function (str) {
      let w = str.replace(trailing, '').split(/\s/).pop() || '';
      w = w.replace(leading, '').replace(elision, '');
      return w.toLowerCase()
    };

    /** does this look like the end of a sentence? */
    const isSentence = function (str, abbrevs, foundLetter = hasLetter.test(str)) {
      // must have a letter
      if (foundLetter === false) {
        return false
      }
      // 'F.B.I.' or 'A. S. Pushkin'
      if (isInitial.test(str)) {
        return false
      }
      if (config.singleLetters && isLetter.test(str)) {
        return false
      }
      // 'am 3. Mai'
      if (config.ordinals && isOrdinal.test(str)) {
        return false
      }
      // '...' - may get split again, below
      if (hasEllipse.test(str)) {
        return false
      }
      if (hasPeriod.test(str)) {
        // 'Dr.' but not 'Dr?'
        const w = lastWord(str);
        if (Object.hasOwn(abbrevs, w) || Object.hasOwn(abbrevs, w.split('.').pop())) {
          return false
        }
        // 'Hauptstr.'
        if (config.suffix && config.suffix.test(w)) {
          return false
        }
        // words that are only sometimes abbreviations - 'em set.'
        if (config.conditional && config.conditional.test(str)) {
          return false
        }
      }
      return true
    };

    // are we inside a quotation, or some brackets?
    const isOpen = function (str) {
      return quotes.some(([open, close]) => {
        if (open === close) {
          return count(str, open) % 2 === 1
        }
        return count(str, open) > count(str, close)
      })
    };

    // put a quotation back together, when it has many sentences in it
    const quoteMerge = function (arr) {
      const out = [];
      for (let i = 0; i < arr.length; i += 1) {
        let str = arr[i];
        if (isOpen(str)) {
          let merged = str;
          for (let n = i + 1; n < arr.length && n - i < MAX_MERGE; n += 1) {
            if (endsNewline.test(merged)) {
              break
            }
            merged += arr[n];
            if (merged.length > MAX_QUOTE) {
              break
            }
            if (!isOpen(merged)) {
              // the quotation closes here
              str = merged;
              i = n;
              break
            }
          }
        }
        out.push(str);
      }
      return out
    };

    // places where a sentence ends, that are only clear from the word after it
    const opens = escape(quotes.map(a => a[0]).join(''));
    const closes = escape(quotes.map(a => a[1]).join(''));
    const upper = `(?=(?:[—–-]\\s?)?[${opens}¿¡]*\\p{Lu})`;
    const rules = [];
    if (closes) {
      // 'he said "no." Then he left'
      rules.push(`[.!?\u2026][ \u00A0\u202F]?[${closes}]+\\s+${upper}`);
    }
    {
      // 'I don't know... Maybe tomorrow'
      rules.push(`(?:\u2026|\\.{2,})\\s+${upper}`);
    }
    if (enders.length > 0) {
      // 'bread, milk, etc. Then he left'
      rules.push(`(?<![\\p{L}\\p{N}])(?:${enders.join('|')})\\.\\s+${upper}`);
    }
    if (starters.length > 0) {
      // 'Ich habe 5. Du hast 3.'
      rules.push(`\\d\\.\\s+(?=(?:${starters.join('|')})(?!\\p{L}))`);
    }
    const boundary = rules.length > 0 ? new RegExp(rules.join('|'), 'gu') : null;

    const resplit = function (str) {
      if (boundary === null) {
        return [str]
      }
      const out = [];
      let start = 0;
      for (const m of str.matchAll(boundary)) {
        const end = m.index + m[0].length;
        const before = str.slice(start, end);
        // don't split inside a quotation, or leave a piece with no words in it
        if (!hasLetter.test(before) || isOpen(before)) {
          continue
        }
        out.push(before);
        start = end;
      }
      out.push(str.slice(start));
      return out
    };

    // '— Come here! — she said.' is one sentence
    const dialogueMerge = function (arr) {
      const out = [];
      arr.forEach(str => {
        const last = out[out.length - 1];
        if (last !== undefined && endsAsk.test(last)) {
          // lowercase text gives us no clues, so only trust it after a capital
          if (startsDash.test(str) || (startsLower.test(str) && hasUpper.test(last))) {
            out[out.length - 1] += str;
            return
          }
        }
        out.push(str);
      });
      return out
    };

    /** add our own passes to the end of the english sentence-splitter */
    const wrap = function (splitSentences) {
      return function (text, world) {
        let arr = splitSentences(text, world);
        arr = quoteMerge(arr);
        arr = arr.flatMap(resplit);
        arr = dialogueMerge(arr);
        return arr
      }
    };

    return { isSentence, wrap }
  };

  // abbreviations, and the other language-specific parts of the sentence-parser
  // (these replace the english abbreviations, which collide with real words here)
  const toObj = str => Object.fromEntries(str.trim().split(/\s+/).map(w => [w, true]));

  var sentenceRules = {
    // words that never end a sentence, when they have a period
    abbreviations: toObj(`
    mm mme mmes mlle mlles dr drs pr prof mgr st ste
    p ex cf env éd éds chap fig art tél tel t réf
    av apr boul bd cie hab vs min etc
    c.-à-d
    janv févr fév avr juil oct nov déc
  `),
    // abbreviations that end a sentence, when a capital comes next
    enders: ['etc', 'J\\.-C'],
    quotes: [['«', '»'], ['“', '”'], ['"', '"'], ['(', ')']]};

  const { isSentence, wrap } = build(sentenceRules);


  var tokenize = {
    mutate: (world) => {
      world.model.one.unicode = unicode;

      world.model.one.contractions = contractions$1;

      // our own abbreviations, and sentence-boundary rules
      world.model.one.abbreviations = { ...sentenceRules.abbreviations };
      world.methods.one.tokenize.isSentence = isSentence;
      world.methods.one.tokenize.splitSentences = wrap(world.methods.one.tokenize.splitSentences);
      // ordinal endings are not units - don't split '1re' or '2nde' like '5km'
      const notUnit = world.model.one.numberSuffixes || {};
      world.model.one.numberSuffixes = notUnit;
      'ers,re,res,ere,eres,es,eme,emes,ieme,iemes,nde,nds,ndes'.split(',').forEach(str => {
        notUnit[str] = true;
      });
    },
    compute
  };

  /*! spencermountain/suffix-thumb 6.1.0 MIT */
  // the four parts of a model, in the order they are packed
  const sections = ['fwd', 'both', 'rev', 'ex'];

  // characters with a meaning in the packed format - words containing these cannot be learned
  const reserved = /[~|:,{}0-9]/;

  const decodeVal = function (key, str) {
    const m = str.match(/^[0-9]+/);
    const n = m ? Number(m[0]) : 0;
    const tail = m ? str.slice(m[0].length) : str;
    return key.slice(0, key.length - n) + tail
  };

  // apply a model to one word:
  //   1. whole-word exceptions
  //   2. the longest suffix with a rule (a rule may match the entire word)
  //   3. the '' rule, if any, as a fallback (a plain append)
  //   4. otherwise, the word is returned unchanged
  const convert = function (str = '', model = {}) {
    if (typeof model === 'string') {
      throw new Error('suffix-thumb: convert expects a model - uncompress() a packed string first')
    }
    const { ex = {}, fwd = {}, both = {} } = model;
    if (Object.hasOwn(ex, str)) {
      return ex[str]
    }
    // longest suffix first - the stem is only cut once a rule matches
    for (let i = 0; i <= str.length; i += 1) {
      const suff = str.slice(i);
      if (Object.hasOwn(fwd, suff)) {
        return str.slice(0, i) + fwd[suff]
      }
      if (Object.hasOwn(both, suff)) {
        return str.slice(0, i) + both[suff]
      }
    }
    return str
  };

  const flipObj = function (obj = {}) {
    return Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, key]))
  };

  // swap the direction of a model
  const reverse = function (model = {}) {
    return {
      reversed: !model.reversed,
      // these two work both ways
      both: flipObj(model.both),
      ex: flipObj(model.ex),
      // and the one-way rules trade places
      fwd: model.rev || {},
      rev: model.fwd || {},
    }
  };

  const invalid = function () {
    throw new Error('suffix-thumb: invalid packed model')
  };

  // suffix-trie → list of keys
  const unpackKeys = function (str, suff = '', out = []) {
    let i = 0;
    do {
      let chain = '';
      while (i < str.length && str[i] !== ',' && str[i] !== '{') {
        chain += str[i];
        i += 1;
      }
      if (reserved.test(chain)) {
        invalid();
      }
      if (str[i] === '{') {
        // find the matching brace
        let depth = 1;
        let j = i + 1;
        while (depth > 0 && j < str.length) {
          if (str[j] === '{') {
            depth += 1;
          } else if (str[j] === '}') {
            depth -= 1;
          }
          j += 1;
        }
        if (depth !== 0 || (j < str.length && str[j] !== ',')) {
          invalid();
        }
        unpackKeys(str.slice(i + 1, j - 1), chain + suff, out);
        i = j;
      } else {
        out.push(chain + suff);
      }
      i += 1; // step over the comma
    } while (i <= str.length)
    return out
  };

  const unpackSection = function (str = '') {
    const obj = Object.create(null);
    if (!str) {
      return { ...obj }
    }
    str.split('|').forEach(group => {
      const i = group.indexOf(':');
      const val = group.slice(0, i);
      const count = val.match(/^[0-9]+/);
      if (i < 0 || !count || reserved.test(val.slice(count[0].length))) {
        invalid();
      }
      unpackKeys(group.slice(i + 1)).forEach(k => {
        if (Number(count[0]) > k.length) {
          invalid();
        }
        obj[k] = decodeVal(k, val);
      });
    });
    return { ...obj }
  };

  // one string → model
  const uncompress = function (str = '') {
    if (typeof str !== 'string' || str[0] === '{') {
      throw new Error('suffix-thumb: uncompress expects a packed string. Models made before v6 must be learned again.')
    }
    const parts = str.split('~');
    // Preserve the empty/default input shorthand for an empty model.
    if (str !== '' && parts.length !== sections.length) {
      invalid();
    }
    const model = {};
    sections.forEach((s, i) => {
      model[s] = unpackSection(parts[i]);
    });
    return model
  };

  // generated in ./lib/models
  var packed = {
    "noun": {
      "plural": "0es:ustin,s|2ères:rnier|0x:au|0s:eu{l,n,m},al{b,cit,av,tiv,rv,rr}|2ux:vail|4oeurs:œurs|1ses:x~0s:n,t,e,r,é,d,i,u,f,a,m,l,c,k,o,g,y,p,b,w,h|8oeilletons:œilleton|6oeillets:œillet|0es:rmal,ant{bul,eign},han,dian,tué,féré|9oestrogènes:œstrogène|0nes:sbien|3rices:teur{a{istr,endic,uc,omm,nform,nn,é,lis},rlocu,ven,oni,dac}|2ères:ier{pet,renc,irm}|5oeuvres:œuvre|1ses:eur{yag,rch,uch,eill,cel,il,ord,an,jou}|1ves:aptif|3oeurs:œur|3oeuds:œud|3oeufs:œuf|1ux:al|0x:u{o{ij,l,h,en,hib,p},e}|2oeux:œu|3yeux:œil~2:es{gustin,is{co,ona,va}}|4er:dernières|3x:euses{in,gi}|5œurs:moeurs|1:aux{e,ri,y,lé,u}|2il:avaux~1ses:eur{demand,pond,port,tiss}|3rices:teur{distribu,produc}|0es:un"
    },
    "adjective": {
      "female": "2lle:au|0e:l,alot,on{d,m,p},r|0te:implet,oi|0sse:a|1que:c|1se:x|1ue:û|0ue:g~0:e,o,p,hic,m,or,pa|0e:é,u,t,i,d,n,us,is,ï|0que:ec|0le:el,ntil,eil|1lle:fou|0te:vori,et,lot,sot,golo|2ète:et{pl,cr,su,i}|1ve:f|2ève:ref|0ne:en,on,ysan|1gne:énin,malin|2ère:er|0se:alou,s|1sse:aux|0sse:ître|1ce:doux|0he:nc|2îche:ais|2èche:sec|0ë:gu~0:e{thé,qu,gu,téril,vol,cul,t{cein,ap,li,cra,ara,l,ouet,s,rio,â,nê},d{sur,mman,a,i},iativ,hauv,n{g,au,eu,r},r{spè,vè,cè,atu},lass,iss}|3c:que{bli,aï,r}|2:ongue,coite|1:e{l{a,i{v,bt,at,r},o,u},oid,laid,r{noi,clai,pai,u,ya,y,û}}|3au:elle{b,v,c,g}|2x:use{jalo,e}|3:tasse~0:continue,fonde,sale|1ue:dû|0e:est",
      "plural": "0x:au|0s:al{av,nc,fat,f}|0:s|1us:û~0s:é,u,t,i,e,f,l,n,d,r,a,o,c,p,m,ï,g|0:x|1ux:al~0:s{nfu,i{pr,qu,um,préc,fra},ba,ra,ro},faux|1:eaux~1us:dû|0:gris|0s:natal",
      "femalePlural": "2lles:au|0es:l,alot,on{d,m,p},r|0tes:implet,oi|0sses:a|1ques:c|1ses:x|1ues:û|0ues:g~0s:e,o,p,hic,m,or,pa|0es:é,u,t,i,d,n,us,is,ï|0ques:ec|0les:el,ntil,eil|1lles:fou|0tes:vori,et,lot,sot,golo|2ètes:et{pl,cr,su,i}|1ves:f|2èves:ref|0nes:en,on,ysan|1gnes:énin,malin|2ères:er|0ses:alou,s|1sses:aux|0sses:ître|1ces:doux|0hes:nc|2îches:ais|2èches:sec|0ës:gu~1:es{thé,qu,gu,téril,vol,cul,t{cein,ap,li,cra,ara,l,ouet,s,rio,â,nê},d{sur,mman,a,i},iativ,hauv,n{g,au,eu,r},r{spè,vè,cè,atu},lass,iss}|4c:ques{bli,aï,r}|3:ongues,coites|2:es{l{a,i{v,bt,at,r},o,u},oid,laid,r{noi,clai,pai,u,ya,y,û}}|4au:elles{b,v,c,g}|3x:uses{jalo,e}|4:tasses~0s:continue,fonde,sale|1ues:dû|0es:est"
    },
    "futureTense": {
      "je": "0ai:r,gener|2rai:ender,erir|4drai:uloir|4serai:être|4îtrai:itre|0rai:ge|5querai:uvais~1ai:e|4èterai:eter|2terai:eter{j,ll,ol}|3erai:montrer|4êterai:rreter|4èlerai:eler{g,rt,d,nc}|2erai:ueillir|2lerai:eler|4ècerai:ecer|5èvrerai:evrer|4èserai:eser|3ierai:yer{o,u}|5écierai:ecier|4égerai:eger|4ènerai:ener|4erai:faire|4èverai:ever|3éerai:eer|7épartirai:epartir|6élégirai:elegir|5échirai:echir|4errai:nvoyer,quérir|3errai:oir{rev,h}|2rai:ourir|4rrai:pouvoir|4urai:avoir|4iendrai:enir|4udrai:loir|5udrai:faillir|3rai:voir{u,e}|2trai:âtre~2:rai{e,rpelle,tége,i{,départ,fu,ou,gu},ï}|3:énagerai|6uvais:maquerai|2e:rai{i{bo,ro,u,cr,our,onc,ud,terd,f,a},oud}|3ir:cquerrai|4loir:voudrai|5itre:raîtrai~5irai:aller|3errai:voir|1ai:re{i{r,fr,d,l},iend}|4serai:être|4èlerai:peler",
      "tu": "0as:r,gener|2ras:ender,erir|4dras:uloir|4seras:être|4îtras:itre|0ras:ge|5queras:uvais~1as:e|4èteras:eter|2teras:eter{j,ll,ol}|3eras:montrer|4êteras:rreter|4èleras:eler{g,rt,d,nc}|2eras:ueillir|2leras:eler|4èceras:ecer|5èvreras:evrer|4èseras:eser|3ieras:yer{o,u}|5écieras:ecier|4égeras:eger|4èneras:ener|4eras:faire|4èveras:ever|3éeras:eer|7épartiras:epartir|6élégiras:elegir|5échiras:echir|4erras:nvoyer,quérir|3erras:oir{rev,h}|2ras:ourir|4rras:pouvoir|4uras:avoir|4iendras:enir|4udras:loir|5udras:faillir|3ras:voir{u,e}|2tras:âtre~2:ras{e,rpelle,tége,i{,départ,fu,ou,gu},ï}|3:énageras|6uvais:maqueras|2e:ras{i{bo,ro,u,cr,our,onc,ud,terd,f,a},oud}|3ir:cquerras|4loir:voudras|5itre:raîtras~5iras:aller|3erras:voir|1as:re{i{r,fr,d,l},iend}|4seras:être|4èleras:peler",
      "il": "0a:r,gener|2ra:ender,erir|4dra:uloir|4sera:être|4îtra:itre|0ra:ge|5quera:uvais~1a:e|4ètera:eter|2tera:eter{j,ll,ol}|3era:montrer|4êtera:rreter|4èlera:eler{g,rt,d,nc}|2era:ueillir|2lera:eler|4ècera:ecer|5èvrera:evrer|4èsera:eser|3iera:yer{o,u}|5éciera:ecier|4égera:eger|4ènera:ener|4era:faire|4èvera:ever|3éera:eer|7épartira:epartir|6élégira:elegir|5échira:echir|4erra:nvoyer,quérir|3erra:oir{rev,h}|2ra:ourir|4rra:pouvoir|4ura:avoir|4iendra:enir|4udra:loir|5udra:faillir|3ra:voir{u,e}|2tra:âtre~1:ra{e,rpelle,tége,i{,départ,fu,ou,gu},ï}|2:énagera|5uvais:maquera|1e:ra{i{bo,ro,u,cr,our,onc,ud,terd,f,a},oud}|2ir:cquerra|3loir:voudra|4itre:raîtra~5ira:aller|3erra:voir|1a:re{i{r,fr,d,l},iend}|4sera:être|4èlera:peler",
      "nous": "0ons:r,gener|2rons:ender,erir|4drons:uloir|4serons:être|4îtrons:itre|0rons:ge|5querons:uvais~1ons:e|4èterons:eter|2terons:eter{j,ll,ol}|3erons:montrer|4êterons:rreter|4èlerons:eler{g,rt,d,nc}|2erons:ueillir|2lerons:eler|4ècerons:ecer|5èvrerons:evrer|4èserons:eser|3ierons:yer{o,u}|5écierons:ecier|4égerons:eger|4ènerons:ener|4erons:faire|4èverons:ever|3éerons:eer|7épartirons:epartir|6élégirons:elegir|5échirons:echir|4errons:nvoyer,quérir|3errons:oir{rev,h}|2rons:ourir|4rrons:pouvoir|4urons:avoir|4iendrons:enir|4udrons:loir|3rons:voir{u,e}|2trons:âtre~3:rons{e,rpelle,tége,i{,départ,fu,ou,gu},ï}|4:énagerons|7uvais:maquerons|3e:rons{i{bo,ro,u,cr,our,onc,ud,terd,f,a},oud}|4ir:cquerrons|5loir:voudrons|6itre:raîtrons~5irons:aller|3errons:voir|1ons:re{i{r,fr,d,l},iend}|4serons:être|4èlerons:peler",
      "vous": "0ez:r,gener|2rez:ender,erir|4drez:uloir|4serez:être|4îtrez:itre|0rez:ge|5querez:uvais~0z:e|4èterez:eter|2terez:eter{j,ll,ol}|3erez:montrer|4êterez:rreter|4èlerez:eler{g,rt,d,nc}|2erez:ueillir|2lerez:eler|4ècerez:ecer|5èvrerez:evrer|4èserez:eser|3ierez:yer{o,u}|5écierez:ecier|4égerez:eger|4ènerez:ener|4erez:faire|4èverez:ever|3éerez:eer|7épartirez:epartir|6élégirez:elegir|5échirez:echir|4errez:nvoyer,quérir|3errez:oir{rev,h}|2rez:ourir|4rrez:pouvoir|4urez:avoir|4iendrez:enir|4udrez:loir|3rez:voir{u,e}|2trez:âtre~2:rez{e,rpelle,tége,i{,départ,fu,ou,gu},ï}|3:énagerez|6uvais:maquerez|1:rez{i{bo,ro,u,cr,our,onc,ud,terd,f,a},oud}|3ir:cquerrez|4loir:voudrez|5itre:raîtrez~5irez:aller|3errez:voir|0z:re{i{r,fr,d,l},iend}|4serez:être|4èlerez:peler",
      "ils": "0ont:r,aturer,gener|2ront:ender,erir|4dront:uloir|4seront:être|4îtront:itre|0ront:ge|5queront:uvais~1ont:e|4èteront:eter|2teront:eter{j,ll,ol}|3eront:montrer|4êteront:rreter|4èleront:eler{g,rt,d,nc}|2eront:ueillir|2leront:eler|4èceront:ecer|5èvreront:evrer|4èseront:eser|3ieront:yer{o,u}|5écieront:ecier|4égeront:eger|4èneront:ener|4eront:faire|4èveront:ever|3éeront:eer|7épartiront:epartir|6élégiront:elegir|5échiront:echir|4erront:nvoyer,quérir|3erront:oir{rev,h}|2ront:ourir|4rront:pouvoir|4uront:avoir|4iendront:enir|4udront:loir|3ront:voir{u,e}|2tront:âtre|0ent:turer,iller~3:ront{e,rpelle,tége,i{,départ,fu,ou,gu},ï}|4:énageront|7uvais:maqueront|3e:ront{i{bo,ro,u,cr,our,onc,ud,terd,f,a},oud}|4ir:cquerront|5loir:voudront|6itre:raîtront~5iront:aller|3erront:voir|1ont:re{i{r,fr,d,l},iend}|4seront:être|4èleront:peler"
    },
    "imperfect": {
      "je": "1ssais:r,asservir,tentir|4isais:ésir|2yais:oir|3ais:oir{av,uv,ev,l}|5évoyais:revoir|4oyais:eoir|2ais:ir{en,ent,vr,ér,rm},re,rire|4érais:erir|2ïssais:air|3yais:uïr,ire{ra,ro}|4issais:ître|3ssais:itre|2sais:ire|3quais:cre~2ais:r{e,i{essort,art,êt,ill,our,fr,rv}}|4êtais:rreter|2tais:âtre|4étais:être|3lais:moudre|3éais:eer|3çais:cer|4érais:erer|6éférais:eferer|2yais:fuir|2ssais:udire|7épartissais:epartir|7éressais:eresser|3sais:coudre|4édais:eder|1ais:ger|4égeais:eger|4uvais:oire|4lvais:udre|2vais:crire|3ais:prendre|4gnais:ndre{i,ie}|5éciais:ecier~3ir:ais{ent{p,s},uvr,ven,ten,dorm}|3er:ais{bsent,aval,bé,gér,voy{n,four},iss{fro,a,gl},rouv,euv,bserv,ign{ba,se}}|3re:ais{batt,mett,fout,d{mor,er,n{pa,po,rfo,e}},clu,uiv,viv,omp,uri}|3oir:ais{val,oul,v{sa,ou,ce,de}}|5erir:uérais|4ir:oyais{v,ss}|5eoir:soyais|4ire:croyais|5r:ssais{i,ï}|6ître:issais{o,pa,na}|5tre:raissais|5ésir:gisais|4re:isais{c,f,a,d,u}|3r:tégeais|5cre:inquais~2ais:r{céde,visse,menti,sorti,quéri},rire|3ais:avoir|2sais:lire|3yais:braire|2yais:revoir",
      "tu": "1ssais:r,asservir,tentir|4isais:ésir|2yais:oir|3ais:oir{av,uv,ev,l}|5évoyais:revoir|4oyais:eoir|2ais:ir{en,ent,vr,ér,rm},re,rire|4érais:erir|2ïssais:air|3yais:uïr,ire{ra,ro}|4issais:ître|3ssais:itre|2sais:ire|3quais:cre~2ais:r{e,i{essort,art,êt,ill,our,fr,rv}}|4êtais:rreter|2tais:âtre|4étais:être|3lais:moudre|3éais:eer|3çais:cer|4érais:erer|6éférais:eferer|2yais:fuir|2ssais:udire|7épartissais:epartir|7éressais:eresser|3sais:coudre|4édais:eder|1ais:ger|4égeais:eger|4uvais:oire|4lvais:udre|2vais:crire|3ais:prendre|4gnais:ndre{i,ie}|5éciais:ecier~3ir:ais{ent{p,s},uvr,ven,ten,dorm}|3er:ais{bsent,aval,bé,gér,voy{n,four},iss{fro,a,gl},rouv,euv,bserv,ign{ba,se}}|3re:ais{batt,mett,fout,d{mor,er,n{pa,po,rfo,e}},clu,uiv,viv,omp,uri}|3oir:ais{val,oul,v{sa,ou,ce,de}}|5erir:uérais|4ir:oyais{v,ss}|5eoir:soyais|4ire:croyais|5r:ssais{i,ï}|6ître:issais{o,pa,na}|5tre:raissais|5ésir:gisais|4re:isais{c,f,a,d,u}|3r:tégeais|5cre:inquais~2ais:r{céde,visse,menti,sorti,quéri},rire|3ais:avoir|2sais:lire|3yais:braire|2yais:revoir",
      "il": "1ssait:r,asservir,tentir|4isait:ésir|2yait:oir|3ait:oir{av,uv,ev,l}|5évoyait:revoir|4oyait:eoir|2ait:ir{en,ent,vr,ér,rm},re,rire|4érait:erir|2ïssait:air|3yait:uïr,ire{ra,ro}|4issait:ître|3ssait:itre|2sait:ire|3quait:cre~2ait:r{e,i{essort,êt,ill,our,fr,rv}}|4êtait:rreter|2tait:âtre|4était:être|3lait:moudre|3éait:eer|3çait:cer|4érait:erer|6éférait:eferer|2yait:fuir|2ssait:udire|7épartissait:epartir|7éressait:eresser|3sait:coudre|4édait:eder|1ait:ger|4égeait:eger|4uvait:oire|4lvait:udre|2vait:crire|3ait:prendre|4gnait:ndre{i,ie}|5éciait:ecier~3ir:ait{ent{p,s},uvr,ven,ten,dorm}|3er:ait{bsent,aval,bé,gér,voy{n,four},iss{fro,a,gl},rouv,euv,bserv,ign{ba,se}}|3re:ait{batt,mett,fout,d{mor,er,n{pa,po,rfo,e}},clu,uiv,viv,omp,uri}|3oir:ait{val,oul,v{sa,ou,ce,de}}|5erir:uérait|4ir:oyait{v,ss}|5eoir:soyait|4ire:croyait|5r:ssait{i,départi,ï}|6ître:issait{o,pa,na}|5tre:raissait|5ésir:gisait|4re:isait{c,f,a,d,u}|3r:tégeait|5cre:inquait~2ait:r{céde,visse,i{ment,part,sort,quér}},rire|3ait:avoir|2sait:lire|3yait:braire|2yait:revoir",
      "nous": "1ssions:r,tentir|4isions:ésir|2yions:oir|3ions:oir{av,uv,ev,l}|5évoyions:revoir|4oyions:eoir|1ons:ir{en,ent,vr,ér,rm}|4érions:erir|2ïssions:air|3yions:uïr,ire{ra,ro}|2ions:re,rire|4issions:ître|3ssions:itre|2sions:ire|3quions:cre~2ions:er|1ons:ir{essort,art,êt,ill,our,fr,esserv}|4êtions:rreter|2tions:âtre|4étions:être|3lions:moudre|3éions:eer|4érions:erer|6éférions:eferer|2yions:fuir|2ssions:udire|7épartissions:epartir|7éressions:eresser|3sions:coudre|4édions:eder|4égions:eger|4uvions:oire|4lvions:udre|2vions:crire|3ions:prendre|4gnions:ndre{i,ie}|5éciions:ecier~3r:ions{ent{p,ss},uvr,ven,ten,dorm}|4re:ions{batt,mett,fout,d{mor,er,n{pa,po,rfo,e}},clu,uiv,viv,omp,uri}|4oir:ions{val,oul,v{sa,ou,ce,de}}|4er:ions{aval,bé,gér,voy{n,four},iss{fro,a,gl},tég,rouv,euv,ign{ba,se}}|6erir:uérions|5ir:oyions{v,ss}|6eoir:soyions|5ire:croyions|6r:ssions{i,ï}|7ître:issions{o,pa,na}|6tre:raissions|6ésir:gisions|5re:isions{c,f,a,d,u}|6cre:inquions~2ions:céder,visser,rire|3ions:avoir|1ons:ir{ment,sent,sort,quér,serv}|2sions:lire|3yions:braire|2yions:revoir",
      "vous": "1ssiez:r,tentir|4isiez:ésir|2yiez:oir|3iez:oir{av,uv,ev,l}|5évoyiez:revoir|4oyiez:eoir|1ez:ir{en,ent,vr,ér,rm}|4ériez:erir|2ïssiez:air|3yiez:uïr,ire{ra,ro}|2iez:re,rire|4issiez:ître|3ssiez:itre|2siez:ire|3quiez:cre~2iez:er|1ez:ir{essort,art,êt,ill,our,fr,esserv}|4êtiez:rreter|2tiez:âtre|4étiez:être|3liez:moudre|3éiez:eer|4ériez:erer|6éfériez:eferer|2yiez:fuir|2ssiez:udire|7épartissiez:epartir|7éressiez:eresser|3siez:coudre|4édiez:eder|4égiez:eger|4uviez:oire|4lviez:udre|2viez:crire|3iez:prendre|4gniez:ndre{i,ie}|5éciiez:ecier~2r:iez{ent{p,ss},uvr,ven,ten,dorm}|3re:iez{batt,mett,fout,d{mor,er,n{pa,po,rfo,e}},clu,uiv,viv,omp,uri}|3oir:iez{val,oul,v{sa,ou,ce,de}}|3er:iez{aval,bé,gér,voy{n,four},iss{fro,a,gl},tég,rouv,euv,ign{ba,se}}|5erir:uériez|4ir:oyiez{v,ss}|5eoir:soyiez|4ire:croyiez|5r:ssiez{i,ï}|6ître:issiez{o,pa,na}|5tre:raissiez|5ésir:gisiez|4re:isiez{c,f,a,d,u}|5cre:inquiez~2iez:céder,visser,rire|3iez:avoir|1ez:ir{ment,sent,sort,quér,serv}|2siez:lire|3yiez:braire|2yiez:revoir",
      "ils": "1ssaient:r,asservir,tentir|4isaient:ésir|2yaient:oir|3aient:oir{av,uv,ev,l}|5évoyaient:revoir|4oyaient:eoir|2aient:ir{en,ent,vr,ér,rm},re,rire|4éraient:erir|2ïssaient:air|3yaient:uïr,ire{ra,ro}|4issaient:ître|3ssaient:itre|2saient:ire|3quaient:cre~2aient:r{e,i{essort,art,êt,ill,our,fr,rv}}|4êtaient:rreter|2taient:âtre|4étaient:être|3laient:moudre|3éaient:eer|3çaient:cer|4éraient:erer|6éféraient:eferer|2yaient:fuir|2ssaient:udire|7épartissaient:epartir|7éressaient:eresser|3saient:coudre|4édaient:eder|1aient:ger|4égeaient:eger|4uvaient:oire|4lvaient:udre|2vaient:crire|3aient:prendre|4gnaient:ndre{i,ie}|5éciaient:ecier~5ir:aient{ent{p,s},uvr,ven,ten,dorm}|5er:aient{bsent,aval,bé,gér,voy{n,four},iss{fro,a,gl},rouv,euv,bserv,ign{ba,se}}|5re:aient{batt,mett,fout,d{mor,er,n{pa,po,rfo,e}},clu,uiv,viv,omp,uri}|5oir:aient{val,oul,v{sa,ou,ce,de}}|7erir:uéraient|6ir:oyaient{v,ss}|7eoir:soyaient|6ire:croyaient|7r:ssaient{i,ï}|8ître:issaient{o,pa,na}|7tre:raissaient|7ésir:gisaient|6re:isaient{c,f,a,d,u}|5r:tégeaient|7cre:inquaient~2aient:r{céde,visse,menti,sorti,quéri},rire|3aient:avoir|2saient:lire|3yaient:braire|2yaient:revoir"
    },
    "pastParticiple": {
      "prt": "1:r,roir|4éré:erer|6éféré:eferer|4égé:eger|6:turber|3éé:eer|4is:erir,eoir|3u:oir|5évu:prevoir|5u:avoir,tre{oî,ai}|6u:uvoir{o,e}|3is:soir|5échi:echir|2u:issir,re|1s:assir|2ï:air|5û:oitre|4été:être|4u:oire|2:urire,ure|2i:vre~2é:er|7éressé:eresser|10uicidé:e suicider|4êté:rreter|17contrebalancé:se contrebalancer|14désertifié:se désertifier|9méfié:se méfier|10récrié:se récrier|5écié:ecier|5u:aître|4u:taire|2tu:âtre|3:aturer,rabattre|2u:ir{êt,our,fér,en}|10ouvenu:e souvenir|6çu:cevoir|3u:lire|3lu:moudre|4lu:soudre|4écu:vivre|3su:udre,stre|7éparti:epartir|2:ire{bru,lu,ff}|3t:dre{bsou,in,ien}|2t:ire|1t:énir|3ert:rir{v,f}|4rt:mourir|5is:ettre,prendre|4is:quérir|2s:re{ci,o,clu{in,e}}|3s:ssoudre|5:nturer,babiller,ieillir|5û:ecroître,devoir|4ê:etir~5eferer:préféré|3eger:ssiégé|1re:u{tt,ut,d,c,mp},ivi|1oître:cru|1oire:bu|1oir:u{h,ll,ul,al,v}|0re:clu,ouri|1euvoir:plu|1avoir:su|1ouvoir:mu|0r:i,départi,ï|4echir:éfléchi|2erir:cquis|2eoir:sis|1r:rassis|0turber:r~5eu:avoir|5u:tre{cloî,parai}|3éé:creer|4u:croire|5û:croître|4été:être|2u:ficher,issir|4éré:gerer|6û:mouvoir|5é:naître|2:rire"
    },
    "presentTense": {
      "je": "3s:re{t,iend,v}|4is:ître,avoir,ésir|1:r,gener|4ois:eoir|3is:ouir,uïr|1s:tir{mpar,répar,assor,ten,len}|2e:vrir|4iers:erir|5échis:echir|4ète:reter|4èce:écer|4ère:erer|4èse:eser|4ène:éner|4ème:émer|2is:ïr~2s:re,âtre,courir,êtir|1s:ir{,jou,asserv}|4suis:être|5vais:-aller|3ais:uvoir|6çois:cevoir|5ois:devoir|3s:ir{ent,part,sort,rv,orm},dre{in,sou}|4iens:enir|5eurs:ourir|4iers:quérir|5s:uillir|6eus:ouvoir|5us:faillir|4ète:ter{é,he,ale}|2te:eter|4ête:rreter|4èle:ler{é,e{g,rt,nt,od,éc,ec}}|5ègle:égler|2e:ir{ill{cue,ssa},fr}|2le:eler|4èce:ecer|5èvre:evrer|5èbre:ébrer|4ère:érer|5ètre:étrer|5ègre:égrer|3ie:yer{o,u}|5èche:écher|4èse:éser|4ède:éder|4ège:éger|5èque:équer|5ègue:éguer|5ègne:égner|4ène:ener|4èpe:eper|4ève:ever|4ème:emer|4ux:loir|6eux:oir{oul,pouv}~1re:s{i{u,a,bo,onc,d{mau,ter,é,e},f,cr,our,él,rel},lu}|1vre:is{rsu,rv,ev}|1r:is{u{h,f,g,e},ouff}|2ïr:hais|2voir:sais|2ître:is{pa,na,cro,lo}|1tre:arais,fous,ts|3eoir:rsois|5echir:éfléchis|4erir:cquiers|0r:e{,ett{ou,gu,r},ell{sc,xc,rp},préfèr,iffr,ufr,ssièg}|3eter:urète|3écer:ièce|1ir:ouvre|3erer:sfère|3eser:pèse|3éner:ène{i,l,g}|3émer:rème~4i:avoir|5vais:aller|4is:gésir|3is:ouïr|3s:re{croît,iend,viv}|2s:ire{cro,d,l,r}|4èle:peler|5ux:faillir",
      "tu": "3s:re{t,iend,v}|4es:être|4is:ître,avoir,ésir|1s:r{,ti{mpar,répar,assor,ten,len},gene}|4ois:eoir|3is:ouir,uïr|2es:vrir|4iers:erir|5échis:echir|4ètes:reter|4èces:écer|4ères:erer|4èses:eser|4ènes:éner|4èmes:émer|2is:ïr~2s:re,âtre,courir,êtir|4ètes:ter{é,he,ale}|2tes:eter|4êtes:rreter|4èles:ler{é,e{g,rt,nt,od,éc,ec}}|5ègles:égler|2es:ir{ill{cue,ssa},fr}|2les:eler|4èces:ecer|5èvres:evrer|5èbres:ébrer|4ères:érer|5ètres:étrer|5ègres:égrer|3ies:yer{o,u}|5èches:écher|4èses:éser|4èdes:éder|4èges:éger|5èques:équer|5ègues:éguer|5ègnes:égner|4ènes:ener|4èpes:eper|4èves:ever|4èmes:emer|5vas:-aller|1s:asservir,jouir|6çois:cevoir|5ois:devoir|3ais:uvoir|3s:ir{ent,part,sort,rv,orm},dre{in,sou}|4iens:enir|5eurs:ourir|4iers:quérir|5s:uillir|6eus:ouvoir|5us:faillir|4ux:loir|6eux:oir{oul,pouv}~1r:s{e{,ett{ou,gu,r},ell{sc,xc,rp},préfèr,iffr,ufr,ssièg},i{,u{h,f,g,e},ouff}}|4eter:urètes|4écer:ièces|2ir:ouvres|4erer:sfères|4eser:pèses|4éner:ènes{i,l,g}|4émer:rèmes|1vre:is{rv,ev,su}|3eoir:rsois|2ître:is{cro,lo,pa,na}|1re:s{i{bo,u,a,onc,d{mau,ter,é,e},f,cr,our,él,rel},lu}|2ïr:hais|2voir:sais|1tre:arais,fous,ts|5echir:éfléchis|4erir:cquiers~4es:être|4s:avoir|5vas:aller|4is:gésir|3is:ouïr|3s:re{croît,iend,viv}|2s:ire{cro,d,l,r}|4èles:peler|5ux:faillir",
      "il": "2t:re|2:tre|4ît:itre|3t:iendre,vre|1:r,gener|4it:avoir|4t:uvoir|4ut:loir|6eut:ouloir|4oit:eoir|3it:ouir,uïr|2e:vrir|4iert:erir|5échit:echir|4ète:reter|4èce:écer|4ère:erer|4èse:eser|4ène:éner|4ème:émer|2it:ïr~3:ttre|4est:être|1t:ir{,asserv,jou}|6çoit:cevoir|5oit:devoir|4it:ccroître|4ient:enir|2:tir{en{m,p,s},epar,essor,ê},dre,cre|3t:dre{in,sou},rvir,ormir|4ît:ésir|5eurt:ourir|2t:courir|4iert:quérir|5t:uillir|6eut:ouvoir|5ut:faillir|3et:déchoir|5va:-aller|4ète:ter{é,he,ale}|2te:eter|4ête:rreter|4èle:ler{é,e{g,rt,nt,od,éc,ec}}|5ègle:égler|2e:ir{ill{cue,ssa},fr}|2le:eler|4èce:ecer|5èvre:evrer|5èbre:ébrer|4ère:érer|5ètre:étrer|5ègre:égrer|3ie:yer{o,u}|5èche:écher|4èse:éser|4ède:éder|4ège:éger|5èque:équer|5ègue:éguer|5ègne:égner|4ène:ener|4èpe:eper|4ève:ever|4ème:emer~1vre:it{rv,ev,su}|3eoir:rsoit|1re:t{i{bo,cro,u,a,onc,d{mau,ter,é,e},f,cr,our,él,rel},lu,o,p}|1r:it{u{h,f,g,e},ouff}|2ïr:hait|2voir:sait|5echir:éfléchit|0re:t{oî,aî,fou,â}|2itre:raît|4erir:cquiert|3ouloir:veut|1voir:leut|2loir:aut|0r:e{,ett{ou,gu,r},ell{sc,xc,rp},préfèr,iffr,ufr,ssièg}|3eter:urète|3écer:ièce|1ir:ouvre|3erer:sfère|3eser:pèse|3éner:ène{i,l,g}|3émer:rème~4:avoir|5va:aller|3it:ouïr|2:rtir{pa,so}|3t:iendre,vivre|2t:ire{d,l,r}|4èle:peler|5grit:aigrir",
      "nous": "2ons:re,rire,ir{rv,en,ment,êt,our,vr,fr,uill,orm}|4issons:ître|3ssons:itre|2sons:ire,ore|2ssons:udire|3yons:ire{ra,ro},ouir,uïr|4uvons:oire|4gnons:indre|3quons:cre|1ssons:r{,roi,asservi,joui}|2yons:oir|2ns:oir{av,uv,l}|4oyons:eoir|4isons:ésir|4érons:erir,èrer,erer|5échissons:echir|2ïssons:air|4égeons:èger~4sommes:être|2ons:r{e,i{t{essor,dépar,epar,pen,sen},ill{cue,ssa,fa},quér}}|2ns:evoir{c,d}|4lvons:udre|2vons:crire|2tons:âtre|4êtons:rreter|3lons:moudre|3çons:cer|2yons:fuir|3sons:coudre|1ons:ger|4gnons:iendre|3ons:prendre|3ions:euvoir~2ir:ons{sav,mouv,pouv,voul,éval}|5oire:buvons|3ir:ons{serv{s,e},dément,vêt,bouill,r{mou,cou,ouv,ff},ven,ten,dorm}|3re:ons{suiv,viv,fout,batt,mett,d{mor,tor,er,n{pa,po,fo,e}},clu,omp,uri}|3er:ons{aviv,sent{b,é},iffr,voy{n,four},s{is{fro,a,gl,ul},pai,pui,gui},end{nsc,h,m},seign,omp{tr,p}}|5erir:cquérons|5èrer:préférons|5erer:sférons|4ir:oyons{v,éch,ss}|5eoir:soyons|4ire:yons{cro,tra}|5r:ssons{i,aroi,ï}|6ître:issons{o,pa,na}|5re:maudissons|5tre:raissons|9echir:éfléchissons|5ésir:gisons|4re:sons{i{nc,a,f,d,el,u},clo}|6èger:ssiégeons|5cre:inquons|5ndre:ignons{la,ra,jo,e}~2ns:oir{av,ch,val}|2ons:r{i{ment,part,sort,serv},e{iss{v,t,l,h},fond}},rire|4gnons:aindre|2sons:lire{,é}",
      "vous": "2ez:re,rire,ir{rv,en,ment,êt,vr,uill}|4issez:ître|3ssez:itre|2sez:ire,ore|2ssez:udire|3yez:ire{ra,ro},ouir,uïr|4uvez:oire|4gnez:indre|3quez:cre|1ssez:r{,roi,asservi,joui}|2yez:oir|3ez:oir{av,uv,l}|4oyez:eoir|4isez:ésir|8servez:reservir|4érez:erir,èrer,erer|5échissez:echir|2ïssez:air|4égez:èger~2es:être|2tes:ire{fa,rd}|1z:er|3ez:evoir{c,d},prendre|4lvez:udre|2vez:crire|2ez:ir{t{essor,dépar,epar,pen,sen},ill{cue,ssa,fa},our,quér,fr,orm}|2tez:âtre|4êtez:rreter|3lez:moudre|2yez:fuir|1sez:ieillir|3sez:coudre|4gnez:iendre|3iez:euvoir~2oir:ez{sav,mouv,pouv,voul,éval}|4oire:buvez|2ir:ez{sserv,dément,vêt,bouill,ouvr,ven,ten}|2re:ez{suiv,viv,fout,batt,mett,d{mor,tor,er,n{pa,po,fo,e}},clu,omp,uri}|1r:ez{aviv,sent{b,é},r{tou,vou,iff,uf},voy{n,four},s{is{fro,a,gl,ul},pai,pui,gui},end{nsc,h,m},seign,omp{tr,p},form}|4erir:cquérez|4èrer:préférez|4erer:sférez|3ir:oyez{v,éch,ss}|4eoir:soyez|3ire:yez{cro,tra}|4r:ssez{i,aroi,ï}|5ître:issez{o,pa,na}|4re:maudissez|4tre:raissez|8echir:éfléchissez|4ésir:gisez|3re:sez{i{nc,f,a,el,u,d},clo}|4èger:ssiégez|4cre:inquez|4ndre:ignez{la,ra,jo,e}~3ez:oir{av,val}|2ez:ir{ment,part,sort,serv},rire|4gnez:aindre|2tes:dire{,re}|2sez:lire{,é}|1z:er{iss{v,t,l,h},fond}",
      "ils": "2ent:re{,roi,ri},ir{rv,ment,êt,vr,uill}|4issent:ître|3ssent:itre|2sent:ire,ore|2ssent:udire|4gnent:indre|3quent:cre|1ssent:r{,roi,asservi,joui}|1ent:oir|3ent:oir{av,l}|6eulent:ouloir|4oient:eoir|4isent:ésir|8servent:reservir|3ient:ouir,uïr|5eurent:ourir|4ièrent:erir|5échissent:echir|2ïssent:air|4ètent:reter|4ècent:écer|4èrent:erer|4èsent:eser|1nt:gener|4ènent:éner|4èment:émer~4sont:être|5vont:-aller|4ont:faire|1nt:er|4ètent:ter{é,he,ale}|2tent:eter,âtre|2ent:ir{t{essor,dépar,epar,pen,sen},ill{cue,ssa,fa},cour,fr,orm},raire|4êtent:rreter|4èlent:ler{é,e{g,rt,nt,od,éc,ec}}|5èglent:égler|3lent:moudre|2lent:eler|4ècent:ecer|5èvrent:evrer|5èbrent:ébrer|4èrent:érer|4ièrent:quérir|5ètrent:étrer|5ègrent:égrer|3ient:yer{o,u}|1ent:fuir|3aient:uvoir|5èchent:écher|4èsent:éser|1sent:ieillir|3sent:coudre|4èdent:éder|4ègent:éger|5èquent:équer|5èguent:éguer|4gnent:iendre|5ègnent:égner|4iennent:enir|3nent:prendre|4ènent:ener|4èpent:eper|6euvent:ouvoir|2vent:ire{o,cr}|6çoivent:cevoir|5oivent:devoir|4lvent:udre|4èvent:ever|4èment:emer~5eter:urètent|3re:ent{mett,batt,fout,croi,uri,d{mor,tor,er,n{pa,po,fo,e}},clu,omp,suiv,viv}|2r:ent{t{et{ou,gu,r},sen{b,é}},ell{sc,xc,rp},préfèr,iffr,ufr,s{is{fro,a,gl,ul},pai,pui,gui},end{nsc,h,m},ssièg,seign,omp{tr,p},reuv,aviv,form}|3ir:ent{dément,vêt,bouill,ouvr,sserv}|6ouloir:veulent|3oir:ent{éval,sav}|5écer:iècent|6erir:cquièrent|5erer:sfèrent|3r:oient{v,éch,ss}|4yer:voient{n,four}|5eoir:soient|5eser:pèsent|5r:ssent{i,aroi,ï}|6ître:issent{o,pa,na}|5re:maudissent|5tre:raissent|9echir:éfléchissent|5ésir:gisent|4re:sent{i{nc,f,a,d,el,u},clo}|5cre:inquent|5ndre:ignent{la,ra,jo,e}|5éner:ènent{i,l,g}|5émer:rèment~5ont:avoir|5vont:aller|2ent:ir{ment,part,sort,serv},rire|5eurent:mourir|3ent:valoir|4gnent:aindre|2sent:lire{,é}|4èlent:peler|1nt:er{iss{v,t,l,h},fond}"
    }
  };

  // uncompress them
  const model$1 = Object.keys(packed).reduce((h, k) => {
    h[k] = {};
    Object.keys(packed[k]).forEach(form => {
      h[k][form] = uncompress(packed[k][form]);
    });
    return h
  }, {});

  const fRev = reverse(model$1.adjective.female);
  const pRev$1 = reverse(model$1.adjective.plural);
  const fpRev = reverse(model$1.adjective.femalePlural);

  // gaps in the suffix-thumb model
  const femIrregular = {
    vieux: 'vieille',
    mou: 'molle',
  };
  const femIrregularRev = Object.entries(femIrregular).reduce((h, [k, v]) => {
    h[v] = k;
    return h
  }, {});

  const toFemale = (str) => femIrregular[str] || convert(str, model$1.adjective.female);
  const toPlural$1 = (str) => convert(str, model$1.adjective.plural);
  // irregular females just add an 's' - vieille -> vieilles
  const toFemalePlural = (str) => (femIrregular[str] ? femIrregular[str] + 's' : convert(str, model$1.adjective.femalePlural));
  const fromFemale = (str) => femIrregularRev[str] || convert(str, fRev);
  const fromPlural$1 = (str) => convert(str, pRev$1);
  const fromFemalePlural = (str) => {
    if (str.endsWith('s') && femIrregularRev[str.slice(0, -1)]) {
      return femIrregularRev[str.slice(0, -1)]
    }
    return convert(str, fpRev)
  };

  const conjugate = function (str) {
    return {
      male: str,
      female: toFemale(str),
      plural: toPlural$1(str),
      femalePlural: toFemalePlural(str),
    }
  };

  const all$2 = (str) => {
    const arr = Object.values(conjugate(str));
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

  // gaps in the suffix-thumb model
  const irregular = {
    monsieur: 'messieurs',
    madame: 'mesdames',
    mademoiselle: 'mesdemoiselles',
  };
  const irregularRev = Object.entries(irregular).reduce((h, [k, v]) => {
    h[v] = k;
    return h
  }, {});

  // nouns already ending in s/x/z are invariable - 'le prix'/'les prix'
  const invariable = /[sxz]$/;

  const pRev = reverse(model$1.noun.plural);
  const toPlural = (str) => {
    if (irregular[str]) {
      return irregular[str]
    }
    if (invariable.test(str)) {
      return str
    }
    return convert(str, model$1.noun.plural)
  };
  const fromPlural = (str) => irregularRev[str] || convert(str, pRev);

  const all$1 = (str) => {
    const plr = toPlural(str);
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
      h[k] = reverse(obj[k]);
      return h
    }, {})
  };

  const doVerb = function (str, m) {
    return {
      first: convert(str, m.je),
      second: convert(str, m.tu),
      third: convert(str, m.il),
      firstPlural: convert(str, m.nous),
      secondPlural: convert(str, m.vous),
      thirdPlural: convert(str, m.ils),
    }
  };
  const personMap = {
    FirstPerson: 'je',
    SecondPerson: 'tu',
    ThirdPerson: 'il',
    FirstPersonPlural: 'nous',
    SecondPersonPlural: 'vous',
    ThirdPersonPlural: 'ils',
  };
  const allPersons = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

  // reverse a conjugated form to its infinitive.
  // the person-tag is a hint - the surface suffix decides, so we
  // round-trip each candidate and keep the one that converts back
  const doOneVerb = function (str, form, revModel, fwdModel) {
    let keys = allPersons;
    const want = personMap[form];
    if (want) {
      keys = [want].concat(allPersons.filter(k => k !== want));
    }
    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i];
      const inf = convert(str, revModel[k]);
      // an unmatched convert() returns its input, which would round-trip trivially
      if (inf && inf !== str && convert(inf, fwdModel[k]) === str) {
        return inf
      }
    }
    return str
  };

  const toPresentTense = (str) => doVerb(str, model$1.presentTense);
  const toFutureTense = (str) => doVerb(str, model$1.futureTense);
  const toImperfect = (str) => doVerb(str, model$1.imperfect);

  // gaps in the suffix-thumb model
  const ppIrregular = {
    pouvoir: 'pu',
    pleuvoir: 'plu',
  };
  const toPastParticiple = (str) => ppIrregular[str] || convert(str, model$1.pastParticiple.prt);

  // conditional = future stem + imperfect endings
  // future forms always end in ai/as/a/ons/ez/ont, so we can derive it
  const toConditional = function (str) {
    const f = toFutureTense(str);
    return {
      first: f.first ? f.first.replace(/ai$/, 'ais') : '',
      second: f.second ? f.second.replace(/as$/, 'ais') : '',
      third: f.third ? f.third.replace(/a$/, 'ait') : '',
      firstPlural: f.firstPlural ? f.firstPlural.replace(/ons$/, 'ions') : '',
      secondPlural: f.secondPlural ? f.secondPlural.replace(/ez$/, 'iez') : '',
      thirdPlural: f.thirdPlural ? f.thirdPlural.replace(/ont$/, 'aient') : '',
    }
  };

  const fromPresent = reverseAll(model$1.presentTense);
  const fromPresentTense = (str, form) => doOneVerb(str, form, fromPresent, model$1.presentTense);

  const fromFuture = reverseAll(model$1.futureTense);
  const fromFutureTense = (str, form) => doOneVerb(str, form, fromFuture, model$1.futureTense);

  const fromImperfect = reverseAll(model$1.imperfect);
  const fromImperfectTense = (str, form) => doOneVerb(str, form, fromImperfect, model$1.imperfect);

  const fromParticiple = reverse(model$1.pastParticiple.prt);
  const ppIrregularRev = { pu: 'pouvoir' };
  const fromPastParticiple = (str) => ppIrregularRev[str] || convert(str, fromParticiple);

  // map a conditional ending back to its future-tense form, then reverse that
  const fromConditional = function (str) {
    let form = 'FirstPerson';
    let s = str;
    if (/aient$/.test(s)) {
      s = s.replace(/aient$/, 'ont');
      form = 'ThirdPersonPlural';
    } else if (/ions$/.test(s)) {
      s = s.replace(/ions$/, 'ons');
      form = 'FirstPersonPlural';
    } else if (/iez$/.test(s)) {
      s = s.replace(/iez$/, 'ez');
      form = 'SecondPersonPlural';
    } else if (/ait$/.test(s)) {
      s = s.replace(/ait$/, 'a');
      form = 'ThirdPerson';
    } else if (/ais$/.test(s)) {
      s = s.replace(/ais$/, 'ai');
      form = 'FirstPerson';
    }
    return fromFutureTense(s, form)
  };

  // do this one manually
  const fromPassive = function (str) {
    if (/ée?s?$/.test(str)) {
      return str.replace(/ée?s?$/, 'er')
    }
    // agreement endings on non-er participles: 'venues' -> 'venu', 'prises' -> 'pris'
    const base = str.replace(/([uist])e?s?$/, '$1');
    return fromPastParticiple(base)
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
      Object.values(toConditional(str)),
      toPassive(str)
    );
    arr.push(toPastParticiple(str));
    arr = arr.filter(s => s);
    arr = new Set(arr);
    return Array.from(arr)
  };

  var verb = {
    all,
    toPresentTense, toFutureTense, toImperfect, toConditional, toPastParticiple,
    fromPresentTense, fromFutureTense, fromImperfectTense, fromConditional, fromPastParticiple, fromPassive
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
    "Auxiliary": "true¦ai,me,ont,se,te",
    "Conjunction": "true¦&,car,donc,et,ma1ou,pu1s0voire;inon,oit;is",
    "Preposition": "true¦aQbecause,cMdIeDgrace,horCjusquBlors9malgPoutPp6qu4s1v0y,à;eGia,oici;a1elEoTu0;ivaPr;ns,uf;elqu0i,oi4;!';ar1endaLour0rPuis2;!quoi;! Lmi;qu0;!e;',e;m8s;n0xcepte;!tAv0;e1ir0;on;rs;!ans,e1u0;!ra8;!pu0rrie4s,va7;is;hez,o0;mme,n0ura4;cerna3t0;re;!fin,pr5u2v0;a0ec;nt; 0pr2;dess0;us;es",
    "Adverb": "true¦:!1:#$%&():ed,ua,uq,er,uo,tnava;'%s&p,a0Nc0Md0Je0Af&b,i07leb,m#i,n03o01pZrXsBt0%,xueim,zessa;n4ot3u0ôtiss$;ah,o0;b#,tr0;ap,us;!is,neib,ulp;a1e0;dis,vu3;dnepLsid-i2t1%,va0;n&od,rap$;!r(p,$;os;aJeGiAn8pmet7r4u0èO;oss#2ss#0;! 0;al,ic;! ic,-$;ol1u0;ellRoj7;!a; &tVgnol;ad#0iomnaen;!-A;am4d3of0v a siv;e0rap;rt$,t0;(t;aj,nT;aj,rosZ;r1tr0;ec;o,t;b 0ila,p;al;e0(tR;ih ),m &t(,tni;o0(c$6;rt;dn0itret,miR;ecs&c,uces;eib1i0on;fAol;!moc;eb;c,f,s0(;!aCn0sG;ia;ga)d,lem el7m6r3t1%0;!le9seH;i0sD;us1v;eug1oc0te-tu3;ne;!an;em,ref;ep;na1r0;at;%;is,te;c4j3l0rtlu; e%s1# 0;$;uj;#;!#;rp",
    "Determiner": "true¦au4ce3l1ol,un0;!e;a,e0;!s;s,tte;!x",
    "QuestionWord": "true¦quelle",
    "Date": "true¦aujourd'hui,demain,hier,weekend",
    "Adjective": "true¦quelques",
    "PresentTense": "true¦essaie0;!nt,s",
    "FirstName": "true¦:aFeBholiHlem,n5ol7rialb,si4y0;aGbleGdissac,e0llen,rrF;rbua,s0;a0lD;c,k;rk,xela;a2niuq,o0wahsal;i0v2;ram;g1v0;ed;er,rom;duj,i1n0;er,neyehc;m0ssej;aj,maj;e1rdna,ttayn0;ek;hs",
    "LastName": "true¦!1:#$%&()*+-./<=>?@[]^:an,in,er,ns,li,va,ng,to,ar,il,is,es,en,hi,ch,ss,rr,rn,as;0:34;1:3B;2:39;3:2Y;4:2E;5:30;a3Bb31c2Od2Ee2Bf25g1Zh1Pi1Kj1Ek17l0Zm0Nn0Jo0Gp05rYsMtHvFwCxBy8zh6;a6ou,u;*,o;a6eun2Uos>da,un;ma6*;da,guc>,mo+,sh21zaR;iao,u;a7eb0.6o3right,u;(3Bs2;gn0lk0*,t#abe;a6i)ldi;@.jev,zqu1;a9h8i#,o7r6sui,u]0;#,yn/J;ls+y,[<,th;at1Uomps2;kah0Vnaka,ylor;aE?DeC>mizu,iBmiAo9t7u6zabo;-1l(v#,zuE;a6e$0;l$,rm0;sa,u3;]4th;l),mmo&,*h;mjon4[#o;midt,neid0ulz;i+,n7sa6+;ki;?1dL+s,z;amBeag#,i9o7u6;bio,iz,sD;b6dri1MgIj^,m%o,osevelt,@i,ux;%ts,$s2;c6v%a;ci,h-ds2;ir1os;aEeAh8ic6ow20;^6hl0;so;a6.(ps;m,n1T;d%s5et8r7t6;e0Nr4;ez,ry;%s;h21rk0t6vl4;el,te0J;baBg0B(veira,r6;t6w1O;ega,iz;a6e.s2guy5ix2owak,ym#;gy,ka6)[o;ji6muW;ma;aEeCiBo8u6;ll0n6[ay,@ol$i,ñ6;oz;l$a,oKr6z-t;al<,e6r/;au,no;hha.4ll0;@i6y0;!%;eWmmad4r6tsu07;$6t$1;!o;aCe8i6op1uo;!n6u;coln,dholm;fe7n$,r6w/;oy;bv6v6;re;mmy,rs5u;aB=nedy,imuAle$,o8u7wo6;k,n;m-,znets4;bay6)cs;^Y;ra;hn,rl9+,ur,zl4;aA=9ha3im=1o6u3;h6nYu3;#6&2;@2;k$s,s5;cks2&se&;gl<i9ke8noue,s>k7+,v#o6;u,v;awa;da;^;aBe8it?cock,o7u6;!a3b0ghNynh;a3ffm#n,r)t;m$gw7nde6rN;rs2;ay;&5[Qs7y6;^D<;#4>6;moJ;a9.,o8r7u6;o,ti%r1;ay(3ub0;m1nzal1;nd6o,rcia;>;%A/9lor8o7uj6;ita;st0u]i0;<;?0;n#d1;d7$steHsposi6)L;+;/2w-ds;aCeBi9om$8u6;bo6r#d;/;gu1;az,mitr4;ov;lgado,vi;nkula,rw7vi6;<,s;$;aFhBl-kAo6;h5l6op0rbyn,x;em7(6;&;#;!e;#8e7iu,o6r/te&5u3we;i,*,u3w,y;!n,on6u3;!g;mpb7rt0st6;ro;ell;aBe8ha3l#co,oyko,r6y]e;ooks,y#t;*;ck7ethov5nnett;=;%,ham;?,h8.ey,]6;<,i0;%;k,*;dDl9nd6;%s6rA;=,on,s2;on;eks7iy8)r1;ez;ej6;ev;ams",
    "Noun": "true¦:!1:#$%&()*+./<=>?@[]^_`~:ér,ne,na,uo,it,ar,rt,hc,ot,si,re,or,rp,pé,ir,ap,uq,op,ra,oc,ss;0:62;1:6K;2:58;3:66;4:48;5:3A;cud6Xd6Je4Zf4Wi4Sl4On3Tp&l,r0Es0DtNuIzen,é6;bGc%if,dFgé0X+r1iDm<fn3nnoGp(2VrC~aBt8u7yo6;lpme,v$;qix.5t(s=p;i6r^s%*,é;)t6v5;!er;lc2p#t;t/nimda,éf(sep;c6guf#,lla,ti5;ilppus,$cil;avé,r17;ba;ae7ep,$6~(,ç<pa;t2v3;c$v&j,d@,ma4r6;e6&ts[;tr&t,]1;aUeTiPn8o7<~ed,u6;af2.;gib,+n1rvi^;aCe7io6;jda,p;di9ilc,m6r[,tinép;acidém,e6;d$ma,lo/,nnoy),~(<va,tr6;[2^m0;fn0s#p;c@baf,f5h?lé,iDlCnArugif,t8v7ç6;alpm3<D;(se,rR;$s#p3s6;ef0Qi46;etni1gi6;alp,ef,os-edia;gueb,lievrus,uts^;d$m,nu6;mm0;a7l,olpxe,_bag,u6;c/b,n,rb;f,l,*6;!r^;jus,nim;cova,did%c,lp;ipat,r&c/d;e1Mi1Ko,u6;e7œ6;c,s;bm.,c1Ed1Cf1Bg19+16i14l0Ym0Vn0Op0Nr0Js0CtEuBv8y6;alab,er1.t6;en;a7ec3r6;es;l,r&4;gnilf,q6;)b,i6;n=4p;aMcIeHiEluciD%4om,pmod,roBt7u6ê]$;as,col<t5t(s5;ab8e7=6ul;f,t;ksab,ug;!);pp6va;);rga;af$ib,d7n6/v;om,ég;ua,é;hM]i+2;a8e6ud)t;l6rD;!é;!d#;cudé,hpmoi*,iLluJmIng[mGrBs9t7v6;(luc,<sbo;ceps6$s#p;!é3R;ila#,$ps6;id;[#p,i7o6épo;ba2Ac2da;m7psn6;i,`;da;`6;ca;i%,mo0H;céps,p6;in1;cogén,ti5va;aBiAlav,n9=_,s6uac;a7i6;ann0+n2Np,réug,tôr;c,m,rbme;ad,ep;af,d;et-pi*s,r;i8o7tnom,u6v&;c=p,elp,`;f,v2;alcé,t;mac,p.s-.ua;eAg9([,n6ârc,êg,îaB;[2o6;d,(cefn0s6;i^me,/om;ag,iab;m=p,>e6;*$;rod,u6ô4;f,l6;la;ec3gnAl6%rb;abme,i6;)tim,bah,euc,u6;=dav,q6;am,s3;oj;+,ks,p`6*;!.ohp;)7r6tZuaf,él,êp,ûb;am,e4;c,_;an,n6ol,éip;am,oB;fi0log,rus;a~abma,n6_g,ôr;amé],ev;a7on,r6;af,ep;lp;o6p&s;rim,s ec;g00+Zi8kae7llie6nuej2yucé;sn0;ps;cQd%viv,+PlNmKnErB~At7]6;(&b,%b;@éh,n3o*s7r6tolGuc_4;a],^,u0;ib;alet1iE;cus,ru0ut6;$6u0;va;av)Ai8no7ôm6;ua;c)b,ffi4ip;/6tn7;uc;ac;r6#c;ef,if5;ni;ave4e6oZuat,ôeg;dr0ta;if;a,iA%7r6;em,os;c7lub6m=,$t;ma;av;ffo,?;&b,î)1;a~7%6<b;d,l&b;[,em;aZeRiDo6;egavuMiAm2piHr8sr7t6;am,erc;&;a6engiv,t[,ul;b,d;l,p6;ma4se;aDbBf,g%Ahpuad,p8<7s6t1&bCvob;iov,u0;lèp,s;al,ol6;ag;rf;m6ucn0#hg1;ab;cinimAl8p0t/rc7v@6;cé;as;etâ4&p;+;od;i7y.ic6écyl;!n0;ci8dég)t,gé7méhob,r6s/=[,tihat,zohklok;!iamm)g;ll0;%cém,*ce7sy6;hp;lé;m8s(ru0;a8e6ov;+i%m6nnosrH;=;m,noigYrénég <(_XtJ;ci,m7t$>6;pa;a,en6;$;(6uœ;cej6om;bo;c0Ndnom el t&t,g0J+0Eiv,l04mr03n01p00rRsNtFu9vêr,é6;f,@1lbme7?,rud,sn6;ep;~a;gAoj,q6v;i7n1s6;@;f($ics,rb6;!ur;alb;m`CnAov,r8to7è6;^;b,lf;ev&c2^;éd;at,ie>6;me;!iv;im3$pm`8o+ e]le7/6;us;];#;gDiaA<9tê>,utc8v7èrf-ua6;eb;il;af;s,t;s<v6tacol0;da,in6;%;(,èn;i]é,&rg;ac,oh?6ûej;lét;a,of;bBi9l6;ecr7i6;at,m;[;a,d`o6.é;rc;a7u6;em;c,s,ubi*n0;`;%9r7u6ât;ob;am,e+3.;er;rb;ay7%l6;ém;ov;.;ni6rof;>;%uI_9ua6;c@9$]7_6;f,m;ép;+oDillCl9n8/]1t6zél;om;am;er,oz;lie7u6;at;iv;im;lc;*;!-d%6;rg",
    "MaleName": "true¦!1:#$%&()*+-./<=>?@[]^_`~:an,ar,on,er,is,nd,as,en,st,ie,ri,in,ol,ce,ha,al,us,th,or,il,nt,le;0:CD;1:BK;2:C1;3:BS;4:B4;5:BY;6:AS;7:9U;8:BC;9:AW;A:AN;aB3bA7c96d86e7Ff6Xg6Fh5Vi5Hj4Kk4Al3Qm2On2Do27p21qu1Zr1As0Qt06u05v00wNxavi3yGzB;aB^0;cBhid,ne;hCkB;!$y;$50&y;*s2i,oCuB;sDuma;nEsD[B;oBsC;uf;ef;at0g;aJeHiCoByatt;lfg#g,odrow;lBn1N;bDey,frBIlB;$d,iB;am,e,s;&t,ur;i,)e7sB;!l6t1;de,lCrr5yB;l1ne;lBt3;a>,y;aE&n1iB;cC?0n>Brg_,va0;!`;+te,t^;l+t<48n>,ughn;lysses,sm0;aTeOhKiIoErCyB;!l3ro8s1;av(,eB(t0oy,um0;`9Hv^,y;bDd7WmBny;!*,mBoh$u;*o,.,y;i*,y;mBt9;!my,o]y;adDeoCiago,omB;!*;!d^e;!de9;dErB;+>,rB;#>,eBy;ll,n>;!dy;dgh,ichi,nn3req,ts44;aRcotPeNhJiHoFp+c3tBuraj,ylve8Gzym1;#DeBu$t;f0phAEvBw$t;e56.;!(law,l6;lom1nny,uB;~yma8ta;dBl*,m1;!n6;aDeB;lBrm0;d1t1;hid,ne,qu0Tun,wn,y8;aBb*ti0kou,lim,rgio,],ymour;m9n;!tB;!.,y;lCmB`<o,qib,ul;mAu4;ik,vat^e;aVeRhett,iNoFuCyB;#,ou;b6KdCf9p&t,ssB;!elAH;=ph,y;#,bHcGdFel,geEh0l#dA8meo,nDry,sCyB;!>;coe,s;!@d,nA;lio,r;e4Qg3n6=fo,/go;co,ky;bAe9U;cBl6;$do,c5NhCkBo;!ey,.,y;$d,.;gCid,ub5x,yBza;#sh,nS;g.,iB;n@d,s;chid,fa4lDmC)Bp?4s?d,ul,ym%d;@9Y=ph,y;iro,%;f,ph;+t2<B;cy,t1;aFeDh_Ci&re,=,reB;-1;!ip,lip;dro,rcy,tB;$,e2V;blo,draig,t44ul;ctavio,liv3m96rFsCtBum$,w5;(,to;aCc$,vB;@do;ma;i,l49vJ;a]JeHiDoB;aBel,l0ma0r2X;h,m;cCg4_o,kB;h_,=a;h=*,kB=*;!=*;@,d,_,ls1vB;_~;#By;!a4i4;aWeTiKoFuCyB;~s,r1;?mCrad,-aB;fa,p?;ed,mF;dibo,e,?mD(es,`CsB[sa;es,he;e,y;ad,ed,mB;ad,ed;cGgu4kElDnCtchB;!e7;ato,ik;ho[e,o03t1;e,=B;aj;ah,hBk6;a4eB;@,l;hClv2rB;~,/7v2;di,met;ck,hNlLmOrHs1tDu/cCxB;!im_i#8Cwe7;e,io;eo,hCi*,tB;!eo,hew,ia;eB(;[,w;cDio,k86lCqu(,s?7tBv2;i2Hy;<,%;!el,oK[;achBc=m,ik;ai,y;amBdi,moud;adB;ou;aReNiMloyd,oIuCyB;~,)1;cEiDkB]3;aBe;!s;gi,s;*,iaB;no;g0nn.,r+DuBwe7;!iB;e,s;!zo;am,%4;a7Bevi,l#d,nDoB-3vi;!nB;!a60el;!ny;mCnBrry,ur4Twr4T;>,d1;$,%t;aIeD?~d,iBr(t4Vu48y~;&0p,rB;by,k,=los;+0iEnBrmit,v2;!dCnBt5C;e],y;a7/ck;r,];nata,rB]em;im,l;aYeQiOoDuB;#,liB-2;#,o,[;aqu2eJhnInGrEsB;eChBiah,ue;!ua;!ph;dBge;#,i,%;!aBny;h,s,]4X;!a]4W.,nA;!l,sBy;ph;#,e,mB;!mA;d,ffGrDsB;sB[;!e;@d,emCmai8oBry;me,nimo;iah,y;!&y,rB;ey,y;cHd5kGmFrDsCvi3yB;!d5s1;%,p3;ed,od,rBv(;ett,od;@,es,(1;e,ob,ub;k,ob,quB;es;aNbrahMchika,gKkeJlija,nuIrGsDtBv0;ai,sB;uki;aB?0iah,ma4sac;ac,iaB;h,s;a,v<Bw2;!g;k,nnguaq;!r;nacB^;io;im;<,n;aJeF<ata,oDuByd$;b&t,gBmb&to,sD;h,o;m3ra>,sBw$d;se2;aDctCitCnry,rB;b&t,m0;^;];bKlJmza,nIo,rDsCyB;ato,d5;#,s0;lE=d,rDuBv6;hito,ki,tB;a,o;(1y;#,ey;k,s;!im;ib;aQeMiLl+KoIrEuB;_l&CsB;!tavo;mo;aDegBov3;!g,^B;io,y;dy,?m,`;nzaBrd1;lo;!n;lbe4Qno,ov#ni;ne,oDrB;aBry;ld,rd4U;ffr6rge;b/4l5rBv2;l#d,r3E],y;aReNiLlJ^r0IrB;#DedBitz;!dAeB/ck;/ck;cDkB;!.,lB;<,yn;esJ(B;!co,zek;etch3oB;yd;d4lB%n;ip;d&iDliCng,rnB;#do;pe,x;co;bi0di;$ZdUfrTit0lNmGnFo2rC-eb0]0uge8vBym5zra;#,&ett;gi,iCnBr=,v2w2;e-45.;c07k;och,/que,zo;aG&FiCmB;aFett;lCrB;!h0;!io;s1y;nu4;b&t,d1iEliDmCt1viBwood;n,s;&,o;ot1Ts;!*,jah,sB;?;a2+;!dAg$,mEuCwB;a25<;$B;do;%d,u);l,nB;e-;aYeOiLoErDuCwByl0;ay8ight;a8dl6nc0-2;ag0ew;m<FnD/0ugCyB;~;!l*;!@d,nBov0;e7.,y;go,icB;!k;$muCeBll1%,rk;go;id;#Ij0lbeHmet/9nF%,rEsDvCwBxt3;ay8ey;+,<;?wn,m%d;ek,/ck;(,nBv3;(,y;rt;!dB;re;lKmInHrDvB;e,iB;!d;+,iDne7rByl;eB<,yl;l2Vn;n,o,[;!e,i4ny;iB%;#,+,%;e,lB;*;a06e04hWi$0lLoGrEuCyrB;_,[;rtB;!(;aB(tob@;ig;dy,lEnCrB;ey,neli9y;^,rB;ad;by,e,<,l2t1;aGeDiByI;fB`;f^d,t1;meCt9velaB;);`;rDuCyB;!t1;de;+B;>;aFeEr(CuB;ck;!tB;i0oph3;-3;d,rlBs;eB.;s,y;cBd/c,s$;_;lEm&1rB;ey,lCro7y;ll;!os,t1;eb,v2;$02eU_TlaSoPrCuByr1;ddy,rtI;aJeEiDuCyB;#,>,%;>,no;#,>;nCtB;!t;dCtB;!%;#,%;dC)B;+,%;!foBl6y;rd;bCrByd;(;!by;i8ke;@,lA;nFrBshoi;at,nCtB;!ram;aB.;rd0S;!edict,iCjam2nA;.,y;to;n6rBt;eBy;tt;ey;$0Xb0Nd0Jgu-2hm0Gid5j#i,lZmXnPputsiOrFsaEuCveBya0ziz;ry;gu-9-2;[;hi;aIchHi4jun,maFnD%,tBy0;hBuro;ur;av,oB;ld;#,)0A;el;.;ta;aq;dGgel05tB;hoEoB;i8nB;!i02y;ne;ny;reBy;!*,s,w;ir,mBos;$;#,beOd5eIfFi,lE%Dph%Ht1vB;aM<;%;so,zo;#,+;%CrB;edP;so;c,jaEks#dDssaExB;!#d3;&;$,&;)B;ro;rtH;ni;+;ad,eB;d,t;<;aC=fB/0vik;!o;mBn;!a;dFeEraCuB;!bakr,lfazl;hBm;am;!l;@lEel,oulaye,ulB;!lCrahm0;#;ah,o;ah;av,%",
    "MaleAdjective": "true¦:!1:#$%&()*+./<=>?@[]^_`~:uo,éd,re,ér,na,or,ni,hc,oc,ne,ra,ar,té,cé,rt,ém,ts,ro,ép,ev,mi;0:03Y;1:00L;2:03N;3:052;4:03S;5:01M;6:02T;7:01G;8:05H;9:037;A:012;B:04Q;C:05J;D:04W;E:04H;F:NU;G:01N;H:01B;I:WU;J:013;K:02A;a06Ac064d04Ee02HfZVgnolZUiXRlS9mS8nPBoloPArN4sN1tD5uBJxuBHàled ua,éLï#2ûd;bBAcAZdAJffAFgA0+9Hi8Yl7Km77n5Sp5Er3Ts2Lt0Xu05vSxRyLzn)b;aOoMuL;n4ppa;+,lpLn,rb,v1;me2$;p00FrL;!ffe;`,if;aVeTiQrN#rLêr;pLt;!pa,é;eLuc2;né,sL;bo,n0&;rMtL;ca,luc,om;p,<,$;+a5lL;!er,/,#s,é;lYLp,rL;g,p1t4;b0Bcavé,g09l08n06o03qNtLxesa;!iL/cca;bah,s,tZD;aZiVnSoQ<PsLu9;aNiMuL;bFffo,m;fn0r;c,m;!b1m;+,lLt,vo3;b,r00Ms6;aLo9;lLm;ffe,p;dnNlpMp,rL]ihpos;bafé3f,>;m0pa,xe2;i,ys;lX3@1;d,fab,jYLlIOn,rMtat,vL;!a5$;/,t;im6étL;ta,xe;g4lop~,ové,%bé;ab,itaf,*L)d,<l,élA;lg1]6;i@E7me;a15c12e0Xi0Pl0Nn0Ao07p06r00sYtoXuSâRéPêMô,ûoL;g1v;rLt4;pL<;!pa;béh,pL;!&;g,pF;aOb,?00Relb,f,oMpL;ma,s6&;+t#Eja,lL;c,`;epaDs;b,luc1rc;aLissa,op,uja;rZNv1;a?,ePoMuL;eh,.é;pLva;mLoSKpK$;e,i;cn0la,s1;ada2ecGlucs,mod,oda;cMd,gLn,r[un;af,il;!siba<t;aTeOiNoLurpF;hé,mX0rfL;fe,n0;eré,op;dOg<,i^J2mLsYOtIuqéCvé;`uBgaCiMrL;ef,#t;p,réV;!icca,é;g,hNlLma7KvHZ;g(s4li#bé,pL;!~,s01B;!c4;aGovL;r7&;bQCcRd[é3ga,lQmOolNpiCDrLsu2uC;otua,éL;hs1m~;pxe5;!iL;!l1W;autca,ibah;!xe,é3;+uBjKPllNuqMvL;erb,ud;apFi+1;iL.1;ap,uef;=tn8XeL;fLpsA;faIC*;d,lMrL#;!dyFH;?,eCid,.oD;a0QepFi0Blu0A/09o03r00sMuLylRA;!baI7cca,d[,fAr;aVeRiNuL;a+W0oL;mé,p,@A;aMlp,n%v,oLréh,t,v;g(,rf;bLc4l1rg;a,r7;lb,rL;d,pL],ét*HY;!mL;e,.;cM+,lc,ma93pEKrLt;ah,bFc4iuc,rE7;!aC;eL.;ps6vL;!eE6nA)XW;!lyk(,pMrL;<,vén;!eFUmNo3pM%Ls6xe,é3;p7t2;o,us;i,.VF;c,ffo,pm0s5;pGvn0;aIEd<d(],lWmat,(VoUrQtOuMvL;!a,id,oF9élét;gLpé;ia,$;amLpesa;ilc,otua,^f2;f,gNi,oLtî8étcQ6;r%t,tLvaf1;om,ua;!-ed-t%v;b,rc;g^,>t;aMiLo.la,[Q0;ba],ré],tu5vic;col,d(cs,iX5^m1&;b,lb,rLvé;bF?;a12b10c0Xd0Vf0Tg0Ri0Po0Lr0Ft05uZvXéL;a,bilUUcUdSfRgQh>,iPnNpMtLva;la5év2;met,o,ses1;oGéL;gé83v;n8r<,ss#pF;aGirfJ;f6é3;isLnHomW2éf;!nP4;aLlu,rAL;!l;an,iLueos1éif4;g,op,uc;ePgifUGj,mFoOsNtLza;aLcaC/va,^t;mé3n1s;emUDsa;ja,mané,t4;med,pa;iSnQsNuMêLîolc;pFveIG;av,ef,o;ac4e+^,i*s,o3uL;lLrf;!li;eLic,.nA;cn0vé;tLv;!ta;aPeNuL;eb,oL;b,f;f,ipFsLt4;!sA;b,c,gib,maD;balé,c1dNf%p,il[a,lL~t,ngi,pavé;.TTpL;xe2é;!rB;aL+1om,psD4s1tI1;ffa,l?;iLét2;m~,t;fiDuL;ag,os;nLuH;ec,offe;aM(Lus;!+é;n,sP6;al1iliuqéFKmLr8éz;aE2it,.4;ffe,gé,lc1pLt;!mLés;es1.;aWiUmS.nys,pP<cse,uLyto&é],âr;ccoNoL;cLrg;!eDJ$;!*,é3;aMol`Luh;/,$N9;+é,rf;e9oL;@,]e;cLrf,ss6;it(,(mé;cLt;id(h,sA;!-trBa0We0Vg0Qi0EmadOMnXoVrNutNOéMêg,îaL;!+TB@4;gyxo,rffe;aPeNoM#tL;!n0$;!b,c9A;c,tL;la,*,sn0;cM+L;a,$;!*ER;hpélLr%;ét;aZi,oL;dWffiDiSlQrPsNtLçpGG;ipE#b,éL;!b;!iL;olc,rpF;d#g,u0;ag,laL;b,v;ssItL;celés,idn0/L^p)p2Hsegn0;tLvb7;*,ta;!(ba,^L;!b7s1;bLr7t;rut4ur4;bm0cVd#b,eUfTlSmPrub,sOtLur,va;aMoFEsL;bo,edS5;lp,s,tK;iuc,sIS;ativ,e+rIilé,rMulLéGJ;li,/;ac,etEC;c2picsFJ;fKn0;lab,v;=S7lEuBV;aOiLéBO;d2la,oMsL;!n0é51;lé,s;g,pmDZ;c^f,mr7;f,p,sab,tL;as,lu~s,nLuc;aEBemBops;aVesrialc,htyr,iRmPrNuLôlp6;ap,fLhr4lla,rbFsé3tuDT;!/,rI;aDJefRZiL6ofL;!*,é4Q;aLonFN;lf4rgo3;aNlé,(5rL;pL_;!m0po,$;!-7B;c,fL;!fa;a0Wb0Rc0Qe0If0Eg0Ci08lYoUpuepTrSuNy],âh,éMêLô@nLNûrb;f,mF;vJz;cOdNesse,mMn(,oL;c7JfAm,pma,r;is17^f;ica,no;am~,er,it<5lE/,é;ap,ep;!r7$;dnog,ffa,iNrév,sMv,éL;rua,vla;i,nLB$;<b,v2;abFeTiL;aQbahCUeP/ug1p<pé,rg,suOt#,uLveuq)cAâbeB1;ed4oL;b<b,m,/ga,p1rL;b15%v;f,ob;l05mm05<p1vé9R;?,mé,/p1pFrLt2Jva9;b1ti30é;cs,galf;a,fN~ssa,oMtLuh,xe;/v,um;>,v;fRZ/;nL&QC;=>,ic;f#sNnM#L;sGPtimF;e,ogQ8;!se;b<b,cQgPkcin,nOp,sNtMuq=c,vL;e+é,%?;/d,op,<?;ic,sob,uf;(AQ&c;n0r7;if,rL;os4;sum,#b,âb;aOmNuL;em,oL;dE6@;e9.;cca,id4sQEtta;cPSngis,sL;!sed;c01d00fRgélivi3hpQlOrLsassKtip,xyhpsa;aLc1p)ppa5];m,rRZvL;!a;!b#,er,iLl=RZpiMC$;ffa,muh;=golytcad,)ta;iL[ut;cRdBlauqQmPrNtL;rLsuj2;ec,of;bul,cas,ogiCrL>p,év;et,oh;=,om;!s6;urc,_s;nGIu>;aLossa;mé,rgs6;a00nVoTrSuOâNéL;lLmé,rbé;!f;b,f,lDF;aNoL;bLc,<ffe,t5;!me;béBXf;e+A.é;p,rL;b,cca,ppK;aMeLoj;lc4p;h1mMrL;b,t;id4;c,h,nMr<,tL;ta,$;apF<h;aUiSnOrMâ,éL;issa,to3;aDemLog4;b7~;aMolL;la,o3;+5l[,rL;!o,$;en4f,lLrJ1;bo,gén;gOUllirg,mOrNsMtLvK;rIé;iv4u;bmo,fuan,/,u5Ov#;i,mO5;iLo>,ua+J;oMrL;g,#bé;c,ssa;aZiWnSoQ<OuNéL;c1sL;bo,sH;n1os;bmob,g,tLzél;er,ta;c,m1rL;b,é;aNiMoL;b,f5g%v1*;lb,ug;b,g*g1la+a,mm4Gsiaf;cMloOPrLv;!bNS;i7$;ccas,rg1uQY;aTiSnNrL;eGoL;f,v6;aNedEi0oL;fLno3rf;!/,$;lLun,va;ab,é;lHpé;cid1ffe,lL/m,pse;e7Rg,oiv,pNF;iPlag,moO)NUrL;ecaGosba,uL;oLt%p;bFcBM;b,lp,t;b~,ho3;af,oL;d,laj;ae15b13c11d0Relb,ff0Qgi0P+0Ol0Fm0En04o01pZrXsTtPvNçL;er,n0%pL$;!a2;!er,ruLé71;op1;!nNpmo6Z^t,tabM#f,êL;t,vBB;!a66er;ep,iH;nIsMuL;.MW;i,oLuB;b,c;aps6cLd,gnHCr#b,t/v,u0éf;!ca,er;a9er,m)Lpil,&c;!%54;bat,dMf,lL;ad(,f;*h,uav;!ePitn.s6n.OrMéL;g2t;aD.L;!sib;!er,*;+,m,rgOtMvL;!n0rIé3;!erLn0#s;!t4;!uas;o3é;!cGeRfQiHliuef,oN#Lé;g,mLv;!%v;sMvéL;d,r;ba,s6&FM;fOTrH9;f<f,m8vL;!eD;a]uBif,)c,r#f,$;aG6bma,tn0xe;irg,#t;issa,nNod,rL;a,ep2HoL;m,t;apJeMi,oL;fn0t;fLUpOr,tLv;!/Ms6ta5éL;d,rp;!-s#s;!s7;*avL.,év;!nOS;~,rL;ab,eh,#f;b,cup,g(5Hv#n;a9Ec98e8Ui8AnVoTpRrLse,urb,ê3ôt1O;eMoLu0;cca,f,m;pGs1vL;!#L;!'5RcL@4;!er,$;mLurba;eGo3;girIidi,lLs,v1;af,lieiv,#b,âp;a1BeSiLuf1;aPeMojL;!n0s6;f,pL6@sMtL;!ta,é;a,er;rNEsL;!-)cas;c0Vd0Rg0Ki0Gl0Amé09n04rXsUtRuMvrL;ef;lf2qL;olNéL;rf,sL;b7n0;id(rg,é;aMn.Lop~,timrN7éNT;![;l,p;ba,&pL;!inL;mo;apQrucPéL;fMhL;da,*,.5;fL$;a,id5;n0&;pa,sP3;am%p,iL;mMtL;nEY%pLV;~,éL;!o3;d,hév,lc;!aviJTlEQoOuL;brut,cc7pMrL;iv,up;o,r0;d5iv,nLs2;iug(s,mos;cLtapLL;ifMsn.L;!b7*;fe,$;iOlud2nNrL;`Lu;id,n0;at,iM9;d2lL;gLid,lM9;én;ac1iN<,uMéL;?3;p~,rpL8;c2@s,ss6vé;ajda,itJon2sMéL;d5r;eLipuDA;dnOgrut,lNnM^Lv%ffe;hpsohp,ulf;avé,imul;aE1oda;ac2;b65c63d5Qeg5Hff5Eg5Ch58i4Xl43m3Wn36p31r2Fs16t0Cu02vZxYyQçNéL;b,g,*af,sL;/ib;aMnL%p;eLCirg;ga,~rg,/m;aPes,oMuL;f,rb;bmalf,dMeOQm<l,n36rLtaDvJF;c,d#f;no,%v;géb,p,rL;ffe,tL;s6ta;alA`;as,ec1ivD8lo7P%né,#L;mLrpé;!é;lTmAnSp,qN@inot,s,tL;!i]nL;.79;aOip,nMoLr8;+,rc;am,ilL;c,$;lc,rc;is2étG;cn0g;a0De0Ci09l07n05o04r01sVtSuPéOêNûoL;gLv4;=,$;bFt4;iG9p;bMc%p,m,)L;f#C$;er,$;abMem)LHolLu2K;erg,f;!m0;ePiLnLJ;dNsLxe5;nL%p,&;i,.5;!iHT;r,to3;ap,ecnMoL;fn.Jp~,s;.1;+uDlbme9ngilc,vip;aDeLi7om;pAsn0t;aGovJuL;s2xe;b^GcGlim,)im,pMrLséh,v2;ri,[;lI&c;lah,uqilc;l?,pé,rdyh;=0Sep,i0Mn0Jop0I%ve0HsMuLylD3;ac,ma;a0Ae06iM#L;bal?,lg,pA;an03c*ma,d00guZhXlVméUnSoRpalg,rQsPtOuLvKébo;g(l,oMpLrb;!-t#t,~;jJlbé;aKN/tA%v6urba,_pa;ias,s)g;d/tta,giama,olf,r#H2uha,ûm;g(,rcHL;if,uL;aj;g,rf;as,g,iva,liLu0;aj,eiv;av4cL;ir4(lb,éHMî=fK;m,),r;nMr#L;ssa,>;=g,elpsAob5L;!er,n.A;c2lb,rL;ac,pM],éL;t*5;!po;cNl,p,rL;ah,rL;abF;!aL;j,rf;l#b;er,mK2;ad,eL;fLp;fo;aNffus5htapmys,llLEnoga,rMtamua9uL;c,dés,l54pé;b,g,p[;fMlpLpa;!m0$;l8/ib,sitas;!?;a05b04ff03galf,i00oXrVtTuRvQéL;buOfiNgiMlot,*ti,pLuqn0véJU;o2saG;lleb,rfJ;cov,lo3^do;to3xe;an,i4;d4eLgluf,mrum,om,ssKt^t;lp,oU;iclacJ/Lén_;!r;am,eL;!ba;do3Cf%p,lp~,nLv1;gi,oL;hs1;alM+1l1psLtta;a,*;?;o,#s;adac=ba,iv,m.4;ffe,g,lih;=$it(,ici91mNolag,pMuL;cco,.;aCilf,ol`4;=,iL;p,rg;a09e05g01iWnoMrLêg,îa9;etGR#t;dTissRlliPrNsMtLyK;!uBât,é;!irg,siC;iLn);alc,v4;bL#b;r#t;ap,eL;rp~;eb,r#b;cNluMmLsiova;luf,od,%t1;og1;(l,saf,uL;llah;ag,iLupJ;aMes4oL;p,s;rHNs;rpMvL;a,n9T;!eLr7;@4;cir,lp;af2iQmossa,rMuL;?,f;aNoL;d,fL;%p,$;+,la;a,rp1;a0Db0Be08f05g03i01lS(rb,oQrPuLûrb;bNci]eg,dno,~],oL>p;c#r,m,rL;!c;an*t*t,ma;ap,uh;b)im,egalf,ffa,irffa,sLv;n0$;ab,iM.L;!otua;aQcav,eOrb,tM#L;b,rg;*cs,s#rc,uas,éL;p,rf;ucca,vL;l8/ib;f1s,v;buj,giv,pLtur;ir^h,os1;nLu`a;as,ic;noM#]L;#pé;g,r;cLssiur,tnI;nL<h;aDi>;acca,meL#9;@,ssA;beug*rb,g,+non;bma,c23fR+,lNrL;!=GFuL;os,xul;iMpL;!p7;cn0mL;uh;iMn0éL;m,pu];dé,nLr%t,trBviv;gis5él;cLpBS;atta,(9uMéL;lla,m;bé9ot;avaBViL*C)<,élé;@2taf;aip,uL;aDoL;b,>;aRiOnL;aLolp;+,rL;<,$;lLr6s(@2xe;boLffa;!s1;g4rL;t#,#cDT;=WiVnQommPrMéL;p,sbo;emFoL;b1cLm,t;n0s6;.ca;ab,eMoL;ba,dAf8Vpserr0;csMpL;$5;a,ed,(9;pé9uce@#;a>p,g1;av,*a7GoL;ff7vo3;mMo3rLutit;ab,osba;alf,ot;aZb7dXfn0néb,)Up&c1rPtep,uL;c14dNrMtL;=g,^f;]2;o3é1W;cLtn0;sMéL;!d;*,o3uL;n8os;dL>;!aL;!l8;!rEUuLé2;am,ré;fM@sL;ba,id;er,rMsitas5éL;d,pu];apDRus;dEiuq5lQnPrMuL;lf,m,q0s1;cMeLpo3;lliug;es,n0sV;!nongim,uej;b,ergiaRlOoivNpL;er,mL;is,.5;!=tlu;i#MoL;f,m;d,ss=g;!m;aPeMi@s,*]L;id5;f2jba,psMrL;id5r0;n.ric,us;pm0t2xe5;cil1id9Eng%vua,rLuq$a5éb;g2élécs;=g,iL*B)g,^hed,tiaferDZulp;aCmLrg;#s2;ayg8e0Yi0Wo 4uLytr8û5G;csbo,d,eLpD0tuf;c0Td0RfBVg0N+0Liré0Ij8l0Dm18n0Cpmo9r0Bssi#f,tMuLvêr;guf,oj,qB;aUcPeruf,nMrHtL#rb;alf,emo3;aMeLiH;m,t1;+4;eOuL;dL@sed;n0)pLés;!er;rr0to3;b)ppas1cWdVgi]A2iUlR*mQrOtNvL&c;on,%C2éL;lé;/t,sav1;apJgim,olpGéL;bil,nég;od,%tG;oBWuLévJ;gJ~L;ss6;cnon(,d[;nof,é3;iMoL;vé;d2firup;<gab,]iger4;im,âlf;g(r>,liNoMôL;j4rf;cKv;aLem;r,tab,#g,va9;f2p7tL;lu,nLsHxe;a,i;iL)cca,_,êb;nGN@,uga;aNnL;`,oL;r,s;pat,r,vKyov;alab,n)g,%mF#b;me;a9%b,us;aL/v à,on;lc,pBO;g09+,iLma;c05d<c0f,lZmYnSrQsNtL;iLla,/,se^f,to+E#r,ôc;al,uC;r#b,sL;aLef,)g;nrEtup;%ug,t9Dud^,vL;#;aPiOnoL%d,ucnKélp;bMsiL;as,rp;<D;elab,m,t#r;sEt*3#d;e3utu0;aOetôh,iN)>p,uL;ci2QgL;*s,&35;b3Pmaf;~(,nrCBtLvE&éc;ipsoh5noC;iMnL;a*f,i3of;lHrr#n;aMnLél;=>,o3E;n[,tH;?,gir;a2Be16iXoNuL;mm0rb,t^pL;~,po5;b,c,dib,f9N+TlliSmrBngiQppPrOsNtMxasL;!-olg(;erb,uet,éip;iam tiaf,silH;af(f,ecuaeb;in;m,ugL;r#b;tat,#rb;irgi8.;a06d03e02lZmag,nYpXrWsUtOuLv6;g(s,oMqL;at,.,sem,#r;dQl8;al,cidénPnMobE%bil,seLum;d(lc,t2;aMeL;g<,p%s,^lf;f4idu]e,ma6zyb;éb;=<s,sL#~l;assa;d(xela,gaDuprup,étu;la,piDE;iméf,éb;aMc4ehp^,lLucs8âc,éf;a]irc,ybis;cla,m,po,s;lp,%s;aLn)ig,o(;r,tL;ic;b05cZdY+o3liv,mUn,rRsQtLv;iN*ol,rMuLâDébit;ah;ec2;lopLrup;an,)>m;!l8#l#t;`#s,oMrL;et#s,ol;f,pAG;)N%g,uL;hL);!*,r7;!-.&g;nB#s;iL)8;lbupJrLxem;!faSotrH[aL;!-L;d7oL;c(Clg(;ruLuc;!b7;iTyRéLïI;d/v,luc%h,nPpoNr.L;!-dL;^n,us;lcyc,rueL;!-od2;=%t5Oiug;aug2SoL<;m,tim;bup,c0Cd09g07+i@ua,l02manteiv,nWpoihVrQsNtMvulidét(,éL;bélp,pmH;inév,pygé,r8&D;iMsu3uem,éL;nylHtrE;alebKnut,rI;aNotM%t,#buaf,ys61éL;a5Sbis,gla,htul,ltih,név;civ,sen;has,>L;gév,lo3;>;aPiOoM^filEéL;hta,m<;c=d,dnol,tlLélopan;ad;=ku,la];ri,util;aNiMoLé=si;gnBryt,é;cis,+,s&b,tpA;@sLti;ua;dobmE^Lév^n;ég;itouq,*Moowylloh,<g,uL[0;eCoas;!r[a;aNiL(;néhp,@Isum,tL;améht8ilH;sla,zlab;csot,hgfa,id[,lPmOsMtLxet,zela;ig;iL%p,serb,yI;trI;lusum,otto,rib;atEli]Ep;iaf,u~x8;a1LeViOoNuL;es,n,oL;as,b8;gnBngapse;eQrPtMvL;!ic;alMb7nL;eg;ov;iv,éup;m%v,rI;i0Ym0Xn0Cr07s%vinu,t05uM&L;!ri;di02n01rZsXtOxesL;!ib,oL;moh,rétL;éh;cQiN/vMpeLriv,um,_%p;cn0;n0é;bMrL;!ips;ah5;aMell86ilLnH;fn0;!r82;iv,/Lu;m,s;c,tL;s/m;am,i7X(;sJvid2;/dicca,rL;om6Z;opOutL;anMlL;uc;!r7;met,r0;i04nOrL;aDetL;aLipmes,é;m,p,rf10;elos,oL;iLs%p~;sVtL;aScQidO/NoMpLuti]n.5;ecG;mé;vn0;a9da,nL;.2;erLnof;id,r0;lArLs/s,tiv=g;!ri,_o;acco,/m6sL;ap,eL;fo3sbo;gi^,~rc;^f5;ciTnév,rPtL;nLrI;a]b7eL;diLli]ep,m1r^t,sYtH;fn0s&3Pvo3;os/s,]NétL;am61cLsi*m;=E;e~9ud2;fL@8;fo,it<,rL;ep7;b30c2Nd2LfrBg2Ehp2Di1Rm1Kn0Wp0Tr09s07tSvNxodMyoLç/2B;l,r;=I;anNiLé2E;r,tL;se;!oL;réa;aYeof,iVnNoMsHuLégév;rb;d%cas,t;eLozi^h;dicco,i^,mN*tn.M<pL;!onB;!r6E;!adnof,eMiLunB;r_Gt/s;n%v#g,trL;ap1o6W;b^,g6négMpLr8v;ac,icco;!n0;f,n3Y;an,rLsol0;`s8Cod;bé03gét2iv,oZtXuSéL;bil,cQdPnOps`,tL;alLtil;!iLl0;nu;im,ég;is,éf;rEsiv;m,r,tL;acirEcNpluMtL;ug;cs;eti+<,u@s;ceps,/c,sLâéht;a,ec(,ig8;!+,lf,mNpmet,tL;ceLsI;lé,p;!~,éf;réc,t%v;icM.siL;pé;inum,*3;a07iYoO%Mu51éL;monéhp,p,r,v;f2vL;ih;gQiNm^h,rL;tIuL;en;dir[,tanL;!iLr58;tlum;aMotL;co;id,xL;eh;c0RdRf,gO+8mMtL;am,s51ut8;ilb7oL%t,és;dba,n;av,iMrL;am,iv;^;ibLrEutignol;il;!sit<;iPrLsitpab,yrcal;eNonL;!aL;!rI;ht;*m,séti*f2tL;po;bal,c02d00géll0liZnXrRssi)ItOvL;iMoj,ulL;f,p;@,vn0;aps,i2pun,<MsL;eb;m,p3I;oLuengies,_~;mOtL;atc6iL;r%t,siL;uq2;[~;oLég;l0~@8;f,maf;=,nB^L;c,~3;aN*MosL%3Ourc,_s;!a,it(;vo3;f,lg,r;moi9;uOéL;!lL*;!-.Lli;id[;jn.Lrf;!aL;@G;im=yp,oLïoz_a9;éf;amoWcViN(b,oM<i@Isif,ud,éf;ap;f,l,v;dRfitnHgruriDma,*mQpo9rélcPsOtMvrL;ec;amm=g,rL;`,.;um;!it(;od;=,nys,[;ub;];i9%v;a1Mc1Hd1Bf1Ah14l0Um0Sn0N.,p0Lr08s02tRuNvLzan;=,i7%sL#ssa2;!sa;elb,g(la,oL;f4jJlM(L;pé,vé;bé;alpa,nQol,rNsMtolb,urLâb,ôr;ba;`2;`MoL;ma,ssa;a,n0%p;=OeL;m1pAsL;!serL;!p;ag;iN(9sL;)g1uL;),&;as,oL;+,mL;!=c;at,gVoTrPtNuMéL;+,ug;elf,ha;ruL;em;aNeuM#L;n,p;ga;uqé;lWvL;af;iaL#bK;!ma;alf,#L;rcUssa;ifO(b,rMuL;!aj,m1p,rb,s1;ag,et,uL;of;!*,$5;ed,rL;od4;bS`4ClPoNpmL;er,.L;ca;ba,j,pL;!$;iLomK;eL#b;iv,ucA;a>LiafQ;!é3;aPcL;ava,ir4(MéLî=f1;lfJ;lb,rfL;fa;bé,@,v4;f#b;i)fAnoOrL;ah,`,#L;gLssa,>;/,$;bAf17rL;<;nNrLé0L;af,ion,udL;!/;=,iL;ma;g,rv;!bo;iMuLïan;`;c23d21s1BtLuj,v;a0Fc05iWnUoTpRrQseOuMâh,éL;+,r;af,?L;sn0;gLpm10;g7id;ops,uf;ac,ecJircsLoda;ed;mé,v;etta5iaL;lp,rc;dSgR~3nQrOsL>pJut2;nMopL;!)és;es;tL_a;un;g0if1;uf;ua,_G;aTeOif,*]NuL;d)pL@sn19;!~;id,*;ffOjb7lNpsL;er,oL;@J;l0és;a,e;!flo,*,oidK&;b<bJc0Adés,g08l02~x00nYrQtLvi3xal,&c;iN/sM),rHégL;év;&pA;bud,dLrE;[;a0PcRimda,oN<n,]i*mda,uM_L;~,o0;c,gif;c1jMméLpr0;mm0;_;$;ul;!iL%tla;ga~,mon;)pL;pa;er,pOsigNuL;?L;ps;él;meL;tn0;)rLén;et2;iLudé;dnLfingis,lpG;`Aiv;er;&;a08i06lu04nYoX%vb7sOuMéhL;da;ba,lL;cGla;aReMiLuH;#j;cOrMssH;op;ga,pL;xe5$;c7xe;m,p;us;lpGrr0;apGeL;fMh&Lt2;pm0;fo5$;!*;xe;pmLvn0;i,.;cLo;*,$;uLvé;s%p;al8rL;at;on,sal;c1Dd15g13h0Xl0Lm0Hn0Er00sYtSuNvL;aLuaD;rg;gn6qL;iMse^ttL;ip;n+Lta3;et;^p~ uep,sMâh,ênnL;oh;ais#ht4iLïogé;cK+<L@;(;=;),saL;lc;=,bWdUiPpo3<zOtîaNutamMèvL;és;~;m,@;ib;otMpL;sa;aLon;gilLéla;bo;nL^s$ 4;et,iB;mYèlL;éc;g6uL;aj,ej;id;ia,^Nâf2êmL;! d(L;uq;né;bmVgueUlRpOucsunNèdMôL;rd;if;im;mMuL;os;is;iuqL;(9;@;va;es4;cNposoL;liL;hp;ir,oMuL;ag,ol;m,rp;as,rL#r;al;aRiMom alL; à;mOpMrbL;yh;=,is2;*;it;f,l8;acifNipo3(va 4)L;ta;/;fe;i18n0PrTuaL;dr#l,eQ+,nPriOtL;ap,ru0sL;.,ur;.;on;ep;guL;);aM#L;l,s;bmol,c0Afalb,g08+04irc,lXmmelf,nPsueilnOtNuqMvOyovL;as;ot;(v,âb;ab;eugog,gOiMnL_;ob;bons,eL;p,v;aMiL;eg,m;pmEtnB;ac;ecPlLogW;iLun;aMrLsan;gé;g,p,rb;iv;rc;av,inMuB;om;rueL;lp;ah,nL;ir;iMot,#D;+;lf,p;ol;aWoL;bPcNfo3lb,rL;!ig;rp;es,ibLéf;ur;aNiL;dup,rL;om,uf;gMésuL;an;av;+r8iCmLrg;aOelNrL;on,uL;og;la;lf;am;al,oC;rf;ePiN(MrL;ut;lb;+,lbL;up;rg,s;pmLtêb;ys",
    "WeekDay": "true¦dim7jeu6lun6m2sam1ven0;!d3;!e3;ar3er0;!c0;re0;di;!di;!anche",
    "FemaleName": "true¦!1:#$%&()*+-./<=>?@[]^_`~:an,el,na,le,ie,en,is,et,ri,in,ra,da,on,er,ia,ey,la,ce,ta,yn,ma,th;0:FU;1:FY;2:FN;3:F9;4:F8;5:FO;6:EN;7:EL;8:EV;9:GB;A:G7;B:E1;C:G4;D:FK;E:FH;F:EC;aDZbD2cB5dAGe9Ef8Zg8Gh82i7Rj6Tk5Zl4Nm37n2So2Pp2Equ2Dr1Ns0Pt03ursu6vUwOyLzG;aJeHoG;e,[,/;lG%;<,`;<,/;as7DeHol1SvG;+7=B6;&0s)3;#8)dBLhiB1iG;lInG;if39niGo0;e,f38;a,h$mi0lG`;a,ow;aLeIiG;ckCZviG;#9V)FX;<,l`,nus,rG;a,nG=ica;a,i];&GnesE9;nDIrG;i1y;aSePhNiMoJrGu6y4;acG0iGudy;c3%,sG;h9L^;nHrG;a,i;i9Iya;a5Iff#y,%,s5;al3eGo`si0;a,l`,o6Xres1;g#,o6WrHssG;!a,(;eFi,-9;bNliMmKnIrHs5tGwa0;?0um;a,_;iGya;a,ka,s5;a4e4iGmC9/;!ka;a,t5;at5it5;a05car&t2Ye04hUiSkye,oQtMuHyG;bil,lvi1;e,sHzG;#2T+7(,y;#Gi9;!a,e,nG;aEe;aIeG;fGl3DphG;#2;cF5r6;f3nGphi1;d4?,ja,ya;>4lv3m=1nGobh#;dy;aKeGirlBKo0y6;ba,e0i6lIrG;iGrBOyl;!d#;?,lBT;ki4nIrHu0w0yG;[,%;i,&A=,r=;a,<,?,nG=;a,=;l5Yre0;bMdLi8lKmIndHrGs5v#%E;aEi0;/,y;aGi4;nt5/;lBLome;e,(;.1-0;a02eXhViToHuG;by,~BI;bQcPlOnNsHwe0xG;#92(,y;aHeG(,lC;#n9ll1`rBDtB;!lGnn1;iG_;e,nG;a,d7V;<,i,%;#8;h$53io;b.,>B_;a,cGkki,%,^;h$&,ki;ea,i#n=,oG;<,n12;#0bIgi0i0nG^,y0;aGee;!e,^;a,eG;cca,kaE;chGe,i0mo0ndi,qu$,vDy0;a$,$Gi8;!e,&;e)2?0;aMeLhJoIrG;iGud)];scil1Uyamva8;lly,rt3;ilome0oebe,ylG;*,l*;arl,ggy,n$ope,r6t4;ige,m0Fn4Oo6rvati,tHulG;a,+7.1;-cGsy,tA7;a,e,?;c^v3deHfATlGphAT;a,ga,iv3;l3t7;aQePiJoGy6;eHrG;aEeD`;ll1mi;aKcIkG[,%,s5^;iGki;!^;ho&,k8AolG;a,eBE;!mh;l7R%,r*F;dIi`,nHomi,^G;li1s5;cy,+7;eAiCL;a01ck)z2eViLoI-g%y#i,u-$,yG;a,rG;a,%,t&;i4ll9VnG;a,iG;ca,ka,que;a,chOkaNlJmi,nIrGtzi;aG?m;!n8;a,dy,>va,h,n2;a,dIica,lG;iGy;c)t,e;red;!e6;ae6$3G;ag#,gKi,lHrG;edi~,*Fyl;#2iGliF;nGsAJ;a,<;!#,h#;b08c9Cd06e,g04i03l01nZrKtJuHv*,x86yGz2;a,b$l,/;de,rG;a,eD;h73il8t2;a,cSgOiJjor2l6Gn2s5tIyG;!aGb+h,jaAlou;m,n9P;a,ha,i0;!aIb$,eHja,lC%,sGtza;!a,ol,sa;!l06;!h,m,nG;!a,e,n1;arIeH(,oGr3Kue-7;!t;!ry;+3IiB;$Gi5Zy;a,l1;dG=,ue6;akr#By;iGlory;a,ka,n8;a,re,s2;<Gg2;!l2W;alCd2$Gge,*=,=0;eiA.1_;$,&;a0Ie08iWoQuKyG;d3[,nG;!a,dHe9PnGs@;!a,e9O;a,s@;#n,cJ$IiFlH%,pGz;e,iB;a,u;a,[;iGy;a2Ae,l25n8;*,l1GrHtt2uG;$6*1;aIeHi9%,rG;a6Yi9;&i,n1tB;!.1;aQbPd3lLnIsHv3zG;!a,b+h,+7z2;a,+7;a,dG;a,sGy;ay,@,i,y;a,?IlG;iGy;a8De;!n4E;b7R>ty;!n5P;aN<,e0iL[,nKoIslAOtGx2;iGt2;c3t3;[,nG/;a,(,o4;a,or1;a,gh,[G;!ni;!h,nG;a,d4e,n4L;cNd=7Qi6kes5%,rMtKurIvHxGy6;mi;>n1.3;a,eG(,_;l,n;as5*5oG;nya,ya;a,*F;@,(,y;aZeUhadija,iMoLrIyG;lG/;a,ee,(;*tGy5A;a,),iGy;!e,n46;-,urtn@;aM>L&y,mIrGzzy;a,stG;),.;!b>lG;eGi,y;e,y;a,stD;!%,/;$6NiJlInHrG;a,i,-;d4%;@,i,l9Ns2y;/,s5;c@,i5WlO`6nyaku`-,rMss5KtJviByG;!e,lG;a,eG;e,igh;a5DeHhGi3NlC-0y;ar5B>5B(,&Dr9Cy;!l_70;a,),iGl4T_;!`,n30sF;eigh,i,l2;a04eVilToMuG;#KdJliGst55;aHeGsF;!nAt0W;!n8U;i~,y;a,iB;!#Lc$Cd5U$&,h#6GlJni,sHva0yG;a,];eG(;fi0lCph4W;eG(;),n1;!a,e,n34;!i#,lG;!i#;#L&0nIrHsG;ica,sica;i,-;!a,$&,if>,nG;a,+7iGy;!e,f>;a,e6ZiHnG;a,e6YiG;e,n1;cLd1mi,nHqu$iAsm.2Sv(4yAzG;m.9;a9eHiG;],e,n1s;!lGsFt06;e,&;.Hk2lCqu$G;.1_;<,^;<,lPmNnMo0rLsHvaG;!%;aHiGob$;do4;!b$Gdo4;!a,e,l2E;)1i0`;a,di4es,g-d;$8ogG;)1;a,eA?0o0se;aNeKilHoGyac.~;ll2rt)se;aHdG[H;a,egard;ry;a~>,iHlGnr(tBrmiAst>;)22ga;di;i&y,lKnJrGtt2y&y,z$;iGm=y,-4F;+G;!te;aE%E;@,l2;aXeSiNlLold11rIwG;)G_+h;!dolC;ac(H+G*$8;a,chD;![;adys,)Gor3_*;a,<,%;aJgi,lH%,ov6Zs$G;a,e,&;<,liG;#;!n0;mYnIorgHrG;ald35i,m2Strude;+7i0;a,eG%;s*,v(ve;b-$3Fil,&,rn+,y&;aReOio0loMrG;#He8iG;<,e8;!cG;esHiGo*e;n1sca;!ca;!rG;a,)];lHrnG;!#8;ec3ic3;rHtiGy9;`;ah,/h;d0Fi&DkBl00mUnid,rRsMtLuKvG;aI$HiG;e,^;.0A_;!ng$2H;g)i1[,ni];h$,^;me/l8p>#JtG;eHhGr$6;>;l2Pr;za;iG`,nest29_;cGka,n;a,ka;eJilImG;aG(,y;!liA;ee,i1y;lG/ld;<,y;aTeRiMlL`,no4oJsIvG;a,iG;%,/;a,(;iGuiG;se;a,),(,y;a0c3<,nJsGzaH;aGe;!beG;~;!a,or;#or,nG;!a;.1%;),iG%,wi0;e,~;aVeKiJoGul];lores,m.ique,n2ZrGtt2;a,eD*,[,o~G~y;ea,y;#08%E=Ax2;#ObNde,eMiLlIm+r3nGsiree;a,iG;],se;a,iH[,orGphiA;es,*;a,[h;dre,rdre;!dee,%;!b2Co/E/;a,d4nG;!a,e;hl3i0mMnKphn1rHvi1XyG;&,%;a,by,cH?,lG;a,)1;@,(;a,+7iG;!ca,$1Bka;arG?;*;a0Re0Nh05i03lUoJrH_G;di,~3;*tGy05;al,i0;lOnLrHurG;tn1E;aId27iGn27-A;!nG;a,e,n1;!l1S;n2sG;t#Gu$o;],za;eG&D;),t7;aIeoHotG;ilde;!pat4;iKrIudG;+7iG;a,ne;a,e,iG;],sY;re;a4>4ndG;i,y;aPeMloe,rG;*HyG;s^l;sy,tG;aH),iGy;!#1e,n1;!l;lseHrG;i9yl;a,y;nLrG;*JlHmG;aiA;a,eGot7;n1t7;!sa;d4$&,tG;al,$&;cHlG;es7i3D;$3ilG;e,?,y;iYlXmilWndVrNsLtGy6;aJeIhG-0;>G&DrCy;.1;-0;li0-0;a2EsG;a2D(;a,iMlKmeIolHrG;(,ol;!e,.1_;lGn;!a,[;a,eG(,y;ne,y;%,sF;a],i];a,e,l1;*Bl2;tlG;.,_;arb0BeXi#WlVoTrG;#dRePiIoHyG;#0nn;nwCok9;#2LdgKgid,tG;n@,tG;!aHnG;@,i,y;ny;+G;!t9;#0e,nG;<,%;i9y;bbi9nG;iBn2;#Gossom,y~e;ca;aRcky,l.8niBrNssMtIu[EvG;!>lG;@,y;hHsy,tG;e,i0Yy9;!#G;(,y;!(;nGt5yl;adHiG;];+7iA;!t-G;],z;a4(,/;aliyah,b23d1Kg1Gi18l0Rm0Mn00rVsM~e0uIva,yG;#Ges5;a,%;drIgusHrG;$3;ti0;a,@,i,y;hHtrG;id;aKlGt=;eHi9yG;!n;e,iGy;gh;!nG;ti;iI&HpiB;^;),n1t7;#19$G;&;aYdWeUgQiOja,nHtoGya;.+7n3;!aJeHiGmI;e,ka;!mGt7;ar2;!b$HliFmT;sa;!&;ka,sG^;a,sa;$G(;a,iG;a,ca,n1qG;ue;!t7;te;je6rea;[;!bHmGs^s3;ar3;$;aIb>H$3iGy;e,%;!ly;l3n8;<;aTba,eNiKlI`,^,yG;a,c3sG;a,=,sa;iGys=;e,s=;a,cH%,sGza;a,ha,=,sa;e,?;c3*5jaI%,ssaIxG;aG?;!nd4;nd4;/;?;i0nHyG;ah,%;a,*,%E;c5<,&DmLnslKsG;haElG;.GyW;g,n;!h;@;ee;);at5g2nG;es;(;ha;aVdiS$LrG;eIiG;#L)G;a,e,ne;#0;%;aKeJiHyG;nn;a,n1;a,e;!ne;!iG;de;e,lCsG;=;_;!lG;iA_;ne;agaJbHiG;!gaI;@,i9y;!e;il;ah",
    "Month": "true¦aDdAf7j2ma1novBoct0septemC;!oB;i,rs;an3ui0;l0n;!l0;!et;!v2;ev0év0;!r0;!ier;ec0éc0;!em0;bre;out,vr0;!il",
    "Country": "true¦!1:#$%&()*+/<=>?@[]^_`~:an,in,er,ar,ma,ra,na,al,ri,en,ne,ca,te,st,or,at,ba,el,ti,on;0:3I;1:2Q;a31b2Hc25d21e1Tf1Ng1Ch1Ai13j10k0Yl0Tm0Fn04om#,pZq]&,rXsKtCu6v4w+3yemTz2;a28im^bwe;es,lis #d futu*;a2<ezu_a,iet*m;nu]u,`c# city;.5gTk)$e,ni?d 3ruXs2zbeE;a,sr;&ab emi)?s,k$gdom,@a?s2;! of am%31;k.,s.2; 2Ba.;a7haBim[-les?,o6r$idad4u2;nis0rk2v+u;ey,me37s #d >ic1X; #d 2-2;to^go;go,k_au,nga;iw#,ji2nz31;ki33;aCcotl1eBi8lov7o5pa$,/ l#ka,u4w2yr0;az2ed9itz%l1;il1;d#,r$ame;lom~1Z(l0uth 2;afr2LkKsud#;ak0<0;%) leo=,n2;gap[e,t (&t2;<;=gJrb0ych_lX;$t 2moa,n m&$o,udi &ab0;h_e*,luc0m&t$;epublic of ir0Dom2Mussi27w2;#da;a3eGhilipp$Sit>irn1Oo2u%to /L;l1rtugD;ki2Ll3*(,pua =w0X)2;gu5;au,e@$e;aAe8i6[2;folk1Mth3w2;ay; k2%n m&i#a1G;[ea;c&agua,g%2ue;!ia;p2th%1Dw ze+1;+;mib0u2;ru;a6exi5icro0Co2y#m&;ldova,n2roc4zamb9;a3gol0t2;<egro,s%)t;co;c9dagasc&,l6r4u/t3yot2;?;#0ius;sh+l10t$2;ique;a3div2i,ta;es;wi,ys0;ao,ed05;a5e4i2uxembourg;b2echt<s?$,thu1P;%0ya;b#~,sotho;os,tv0;azakh1Oe2i/b]i,osovo,uwait,yrgyz1O;_$g0Onya;a2%H;(19p2;#,~;c7nd6r4s3t+2v[y coa@;ie,y;le of m#,)_;a2_1;n,q;ia,oJ;_1;aiV~2ung&y;du)s,g k~g;aBeAh#a,ib)lt9re7u2;a5%n4$ea2y#a;!-biss2;au;sey;d_oupe,m,?(la;e2*da;ce,nl1;&;[gie,rm#y;bVmb0;a6i5r2;#ce,<ch 2;gui#a,poly2;=s0;ji,nl1;lkl#dVroeV;a@ `m8cu7gypt,l s+v7ngl1qu]o/+5/tr6s3t2;]s unis,hiop0;p0Mt2;~0; gu$2;ea;ad2;[;<m&k,jibou4om$i>3r c~2;go;!n B;`;aA<t)l af/c# 9h7o4ro]0u3yprRzech2; 8ia;^,)>o;c3lo2m[Qngo-b)zzaville,okF@a r02? d'ivoire;mb0;osD;i2/@(sG;le,nS;republic;m2*Vpe v%de,ym#9;bod0%o2;~;aGeChut#,o9r4u2;lg&0r2;k$a faso,(,undi;az5etXi`sh 2u=i,és5;virg$2; is2;l#ds;il;liv0*iOsnia #d h%zegoviHtswaHuvet2; isl1;#d;l2n8rmuH;&3gi2ize;qLum;us;h3ngladesh,r^d2;os;am3)2;$;as;fghaKlFm%iDn6r4u@r2z%^ijM;+i2ia;a,e;g<`2m<0u^;*;d[),g5t2;&ct3igua #d b&bu2;da;i>;let%3o2uil2;la;re;>,q2;ue;b4g%0lem2;ag2;=;#0;ia;ni2;@2;#",
    "Region": "true¦:!1:#$%&()*+-./<=>?@[]^_`:na,ra,at,ro,am,ac,ni,re,sa,oc,tn,ci,an,en,il,uh,hs,ah,rb,ss,ot;a0Tc0Pd#l0Le05gn02h00iXkUnOoIrGsAt5u4xe_3y0zurca7;d#m&n,e1kcu/ek,li<s,n0r/ev.;)sut,oxas;rrTs+j03;e,us;ohziZs#g;a$jYe2i$y=,nom1u0;<tc>n.,v=J;+v;hlys,sr0;emos,od;a2d1e/e?)-uga,i0ole&m,ttes@ca_(;a+g -*m,o*lli;eX#ldim;cet)az,p1s#k0xet;!$;a0E?u(%;imh-k,oda^al d# d#ld07up0;gnHi#m;]#$m,c3da&l.,g2hadi,i1or a#t*uq,r0taujaK;%e+uq,er+K;ho,$/o;ladih,#rud;ixemJs0ubm=+p;ab%,?aj;a2eme^,isn.siw,o0;el ove0ge&,k2t01;un;cao1gi1ht-j7ijuf,n@,t)0@<s,wehctak-s;uy;h<m;<wsnu^Blof0;f0&n;us;]g*q,ep,ha[j1iaw],ppi_i0ruo0s`op siul #s,xg#ij;_Y;ar;a0sedarp $t0;tu;imoyw,odg0;#0;ug;e_>nEhcepD*(,r1t%s k&y0uq-b; w>;awalAi[0;)#l,d&f8egdi^Ak5m]g*4n3pm]2+tsec0ybr9;i0uolg;el;! w>;l.*l,`pma3;kcub,tton;<wrD&y0;! 0;htrZ;f%s,t+h,xo;ed;m);et;d2s0y$m;i 0nee3;d$wde ec*rp,edohr;nuofw>;d n`1ebe0;uq;g*[0;aw;b`i#m,cZdX[ido,iLkIlHmFn6ol=Or4t1@a@0woi,yhd(;ihc;o0+bE;kad6s>n0;im;a0on6th-$hW;ec,p;a5i0l@k,ozi$;lo$c1$t) %n0;as; ht0;rBu0;os;i1$p,/0;om;d*,siuol;aba0?Kohalko;la;)xalt,i@aI;%=r1-0;la,^E;ak;bmul. [itiAg&eg,h9n3r1t.s av0;on;av7bmuc,eb0`<v;is;a2igriv1&f?)0;! aj4;! tsew;ms1vlysnn0;ep;%;ab;^;av0i&lf;>;axao,isr0;.;(",
    "Honorific": "true¦:dnerevSeQgnik,hPibbar,lInEr8sse7tn1y0;cnellecxe,dal t4raterc5;a0ediseBuH;egr3netueil0;! 0;dnoc1t0;srI;es;cni5hctud;e3o0;ll1ssefo3t0yH;cod,sap;ecnahc,icnu7;ciffo,idagirb,tsinim emi0;rp;a0eeuq,iatpac;m0tlus;ows0s0;sergn1;a1enol0;oc;hsram2rimda0;! 0;eciv,ra5;! dle0;if;allutaya,caesioat;gduj,tartsig0;am;er",
    "Infinitive": "true¦:!1:#$%&()*+./<=>?@[]^_`~:éd,er,ér,ne,uo,oc,xe,cé,hc,na,ra,ca,té,pa,ar,ac,rt,re,sa,om,ni;0:VQ;1:VN;2:U9;3:VM;4:U3;5:SC;6:VJ;7:TC;8:VL;9:V5;A:UC;B:VO;C:TV;D:TX;E:UU;F:T4;G:QV;H:TF;$SPrJt&mI;itse,rof;e46iJïI;ah,(;ah,b41c3Vd3Gff(b,g3Bh33l2Mm2Jn1Yo1Hp1Er0Os0HtRuNvIéboSO;@LeF^sJuIés;aFos_;!$,sI;a,eJ1;!g;elORfKg/lHSh,oI;!fJXjClbé,/IrQB;pé,vé;!$,&;a05i`,n01o00rQsOtMuKâJêIôr;ba,vLH;bLGp;lg5oIrba;bCPlg6;eIolb;jus_,lb;evI(r;aD~C;aPeMoI;ma,sI;!sI;aI$1;!r,s5%;sLDvI;a,b8id,nTE^I;p,tA;pIt;!$,mi,éID;c,l;aKeIiopG;la7m3p4sIt4;!n0s$PZ;n3<g,sep?,upme,é/;c5lImH0pm0;c,?;iL/Dor,sIég;@,iJorgKRuI;or,%;!apéRL;asDHoI;.,mI;!@c;at,bm1Hdn06euq=,ff05g03ol02rYtWuSvuPéIûm;f,.Lp3uI;g,qI;!=,$,nI;e,)1;!&I;!rI;!us;ap?,oI;!cIrUF;!$,#1;as,elfKAha,oIs;cIm;!=,eInKN<p1s9;r,s;ruem,éI;lf,p1;aKeJ(I;n,p;ma,t4Duga;b,uqé;f,od6;iaI(bG;!m8O;o,uE;e4Ei`a;aJma.4^ug5(I%cJV;rcSKs_;l4Rt;esW.HZlT<pSs_,vI;!aPeLr(p3uIé2;elp,oI;mIp;!o2é;cId1rTQ;$,n)MS^pI#;!aI;!]6%;!r,sI;!-non,_;!m0?;aIlaf,(v1;.,vI;!$,iuqé,é2;!r8sI;a7em;al?,eUiRnPoOrMuIéb;!aj,ejGla,mJp,rbIs5%;!m4;!éI;d,rp;agJ6eI)G(f;t,vJ5;b,ga;ab,eh,oI;b5Lh;as_,fI;!#I;!$,é2;tNvI;!b8da,eLnJo2rI(s6Bé2;ap,etAus;eib,)I;!ric,s9;d1rRR;!bo,$SVnIrHYsba,uE#;iam,);l[RGov1rJéIêlb;g,rf;effa7odG4;as1bVeves6iva,lNoMpIueva,âpET;mJuI;os_;eI)=;!r1s5;ba,m#1p3;ebme,iI`7D;aLeI(b;iv,uI;cIgro6;!=,$;f3j1sI;!sI;a,eD;a>JiafL2onI;a,&;!r,é2;aOcI;ava,elfBir6nK`a,uag3élfJî@fI;!@,#;!~,%;aIirg;lb1rfI;!$,fa;bé,],v&C;aLrJuI%;m,or,r;alé,usI;!$,s4;!rQQs_,v,%;affa,iTnPrKuaIéit24;bIlp?;!se,é;aLev1on,(I;!gJla,sI>;aba,_;&OJ#;h6lliagGtâba;aJel82oI;b1foMHlb,r6P;c,rI;b,gDO;aJorI;!f1;l6r;nLrI(d6A%>7;af,iJof,uI;csbo,dFO)M4;al+,on;aIimDG;.,r;morv,r(JuI;abé,s;f,tse;bNLcMKdLFfL7gK2hJ7iHIkcHHlF3mEAnBNpB0r8Hs59t22u0Nv02weivrQ1xYyMzLéI;b,rI;cIga;!$,o2;ag,norb;aPess@g,oJuI;n6p?,sse;!bMd3U.,lpLn,rKtJvI;&7r(f;i?,sef,ten,ut,ôc;b,d(f,tco;!meEL#;a,malf;gHlKnn`,p,rIsseC;!b5LfI;!fe;ab,$;aKeJiIob,ul;f,m;dAn/,v;!f,l4t;aZeUiQoO^MuIêr;as,$ba,oI;n4rI;pIt1;!?,é7;nM5sI;bo,n0%LH;l,nI;~,%;.<,rKtJuIvG;qse,s;=FMluc,/tsb8`;!p,<,#;.KlIr15;!$,&,uEéI;!rp;!aI;!rH;b,g,l,p,rI;b,gIt6;!ga;bi]0V=vé,d@g,g0Lh,l0Jm1n0Go0EqL]s&m,s,tI;!ats,ceffe,iI&c=,rot,ép^p;bah,s,tsI;b8eD9nO7;a05iVlucAnSoPrNsKuJéI;b,htopyh,ss9;dé,ob,];am3iJuI;b5rb;fn0r;aI`4;bI2m1;ff8.,lb3m,rJvI;nN1o2é7;c,picB;aIiD;b,lIm;f,p;dPfaDlNnMp,rbLtI;a2irc,&htua,sIé;aIihpEonga9;!m;!af;!-euqip,ap,orFuG6;c,pI;mMP?,ud,*,%;@é,nI;ev4i12;lKn<,rJtIv;!ta;!b,c,t;c,pI;!-7Z$L8;ces,h+,jF2lIn1vaLY;!c,la;!iJ^>,éI;tta;m9sK4tn)KY;aIfAid,lop,ové;s,véC;aPiNluM~LoKrIujn0él3;aIev6;!l,n;la9v;lf,ts9;mo2v9;dI]Ataf,van;&,o2;d,lIrMSv;b,é;n0sid1ta;a2Jc2Ae23f(m,giod,i1Nl1Jn0Zo0Sp0Mr0Fs06tZuQâPéLêJô,ûoI;c,g;bme,f,rIt6uq6;pF8<;gév,iKlJpCrIt;c5ffa,prNB;f4pm0;p,uqA;b5h,p?,t;aOb3cNemGfB.Mj,l3mM6oKpJrcI;$,s;mLOs9;-kcol,cId1.t([,ja7rb;e,é;!@H;rEUs9é*;f,sI;!r8;aNeLiuqMSoJuI;l,ogé;b,lf,rI;f,t;kcGrg4uI;g,of;lf,rg;eMiKn0oJuI;g5ja7;c=,ob,pGG;l,p3sI*KQ;b8nL6^p,_,%;fi/mKr,tJ(drI;on;!n0o2ta,#;!-6J;aNeMilf,oIueh;cse,fn)Ch*,pIva;!$,mJpIsKR*,élét;a7us;e7i,);cn0la;+,f;aMecLmJoIyrc3;!da;e*,)I;!$,se;=,rM7;c,da;bas,cNd,gil,.Mjim,lLnKohs,pJris,vI;!ip;at,iF;!girg;ep,ip,pm0rod;ab,uF;=,iD;aXeMiop,oIurpme;cKmJrfI;fa,n0;!$,r8#;!@;dic=,g~J2iRmLp<,r,sKtJuq%f,vI;~Cé;!nKAta;ba,éAF;al,eLgua,iKm0uJéI;lpmi,rcA;cod,g<,l`é,r3I;laAHrép*;lgIv(m;èr,%;roCtap31;hKlJrc,sIv;ialp;g/s6p2Y;!cAV;[,oKuI;cco,sI;nJV%;cBvB;aVbUcRdéQfo2ga,liPmNolp*A5pMrKsJurbé,vI;~,é;a<pit/,iv,/Dse+n,éh;ba,ri,éI;h,m;[5i+2;anyd,iI;!l3;bahC=f;!m,rcI5;!a?cAilJ~,susI*,%;!s4;lEp*,éf;ahIZ#;huE];od;fN.MjLlJrIuqi>;<,uf;ah,lIov;ep,iuef;!$,o2#;a7orc;[,(m;aOeIidHH;b,fMjLlKnn)JpsIt5;$,~,us;!rKK#;l0#;bo,~,é;faC~IH;j,pmIZ]Itn0;n0%;dLl+,mKrItIQ;!dIip,é;yh;!l0rof;!id/c;a2Mep,i0Vl0Tn0Po0Hpil+,r0CsQuKylaJéI;lG2rg;/,rHt[;!aMba,cL$c,fJma,oI;laj,pé;!$,fidI;!$,oidG;=,*;c,p;aWeQiMoLuI;aJoI;p1rb4t;f,h1;b,d6rb;aKh,k,lJorf,p,tIv;!@,epG;!g,u0;bSc6l,rg6;c,fMlb,rI;[,dKgJpIétA;!m)3;a,o2sHZ;!a,$;n0o2;bat,cN.Ml56mLnîaDpKrIss4t91;bI<bD2;!me;!-$t(,$,r8#;!a7;!r(p;!aD;eJ(bI;m4#;ps9vI;!aDel(b,ig^t,nIorGK#;$,i,);!d,hpr`a>m,lpOpJrI;!<;!$KEmLo2pKrVsJ*82#I;!-^ssilg;id,/D;a,o,us;i,)3;mi,*;aKeI;c4dn0ffo,pI;!-4$,m)1Ns9#;d,p;av,upI;mHFo2*;a17b,c15h11l07m05n00oZrRtNuLvIénég`oh;!a,idJo5OrI%;ep8;!b8;gIpFL;ia,#;aJcH),?b,ta,éI;htnys,rFM;mIrc`5vi2;@d,otua,étsys;aOb,f,oMpLtîam,uKéI;mIt=<c,vlup;un,ylop;+s,e&FR;!ém;lav,mém,pIsnops,tua,vaf;av,met;!ilimaf,lugB>lo2;m,rc,t$t6viEE;aLis,medAn$ép,oK^I;d`,tI;@f,é;+2gat/,l0m<h,r.nys;groCt;!anyd1$,iIon)é,rofinu;~m,tpo,xam;aRiJ#I;if,`;bKréts,ssof,tI;rIuC;ef;aJis&s,`I;!mi;pluc,snoJtI;n4pm0s3;ps4;cYgéXiTmroSnOrKtJuIvir,%;siv,t=;iv4r`mi;tJéI;bil,déf,nég;&c3uI;en;[,iKnoIoitGr(j,ép;itutiIs^p;tsA;f,g<m,mirc;f,n;cJtI;iH1&top;ifI^9F;fo;!l;idJoI;f,l;nJém;cJtapmI;ys;/I<réih;rf;in.Iro*,é2;et;b,?;b,c,j,rI;!bI+,f;a,me;a1Xb1Uc1Qd1OefsFCf1Mg1Ji1Do12r0Ut0Ku01vWèfé2éI;a,bil3=,dUfSgQhda,lF7mPnMpKsGJtJvéI;r,s^p;iBla,s;$,mF0oEZsIucB;eEWo2;o*,umBéI;gIv;!é5A;olgn0uné;!a*,g8iI;d,rfB;f9i5Ln0o2rGPsF0éI;d,rCV;iCW`;es,iLuI;eoJoI;!c4;!/m;l3&;aYco2dXeVgTjSmRoQsPtI;abru0bo,cKnJ?c,rIu0ôlc;ot;eva,iep;aJeIu]s1;jn0ti.<;f,rI;f,tn0;em,_7;t6vas;!-07rum;!ba;ifIuaA;!nD3;lImed,?;ffe,p;!&,^p;s,tsI;$,~;i?FlifQnMsK(,éI;mInép;!@HoEO;[,iIulli;g$6~mda;eKoI;cIm3;!n4;!cEFr,vé;!~,*;aMeJuI;el,o9W;!f52sJtI;!&,ta,#;!se41;b,cJgab,mIn;!#1;$CQ;bQc5d2QfPiNjam,lLmé7EnKpIv5;aIr)A;vé;gi,oh;),pI;mi,*,#;léIrét5;ma;!^p;alIoFV<;l0é;al+Mc,da,.5mLof,pJs5tIv;!$,ta,uEé;me,sIuE*;a,$,~;da;!o]B;iIétEI;mIn5;!mi,é;fIuE;i.3);[6nI(puas;eg6offe;aJnI;a,e;n,sI;n0_m;as,iImEéléc;lIv;[,iuqéC;gBFlc5pI;![=,$,m63éI;rAQs;a01ec4iYlXmUoRpMrLuIyto%éts;cco8Rd,oI;cIl,rg1s;!$FM#;ah,usu;aKiJoI;.,levC3ts;lf,rga;hIj,ndik,rf;!+7;cJd,.,lIt;ag,c;so>ngam,é;aJeDirg1oI;p,];c3l,r;ap,ucA;citJss9uI;qé;/,rH;lJrIs,t;d,tta7;!c;a23e21g1Pi0WmaAXnYoXrOuNâMéLêg,îJôrIûej;p,t;aId;.6]38;g,ila,lg,rg5;lf;ej,tropmi;aPeMoL(I;jJtI;!$,n0#;a,és;!b,c;cJtIv(g;la,so2;!n0s9#;cA.a;hpélét,lc;a0EoI;b0Cd09egidab,.(b-$it,iSlQpmaPrNsKtJxalk,yGçI;af,puE;im,/c,é;!iIsi`,%;aIopme,rpme;r,s_;af/f,nI;or;rc;a>,liI;s,t/h+,âb;pse,sTtI;ats,cNiK&Jseuq,ulovI;$,%;m,vb8;dJsI>p;iuqBop1;da,n0;a,eJnI;as,of;fJlI;l0és;n0^p;[Liv4G&mid4sIuf;ap,eJimI;uE#;rpmi;co;!a,$5Z/ba,rI;ap,oI;!b8);a,<F;cs,p3v;a08b06c04d,e03f02g01lZmRpé,rPsMtJuIved;of,q)a,r;ap,sJtoDéI;ip;bo,ed;iJsIuAD%;as_,ed;uc;amIu,ét6;!a;!aOe.NiMo0G^tLuI;lJtI;ib;li;!*,#;lé,rcA;a,rH;tn0*C;cIpics9(m;~,#;aSiro;fa7n0uaep;p,rf,v;cI_f,ullah;av;!mI;al,);l,rI;!d,rH;aSiLoK<pé,upB%I;!pI;mi;c,rg;aNeMlLoJsI;!ed,n0_,éZ;lé,mIpme,s;et,ét;!a,c,uE;p,s&7;b,d,s;g1m,p77;g,mIrg3s_;!a7$,me,o2;ciFf,lp,mé,p,vH;a08es,g@h?9i01lYmTooz,rM_t/f,uKâJ%+,îI;ba,d;lb;abme,f,h,lla7ob,sI;n0_,%7B;a93eMifLofJuI;og;!$,n9KorolFs9CéI;d,r;faCn9I;fIg;!$,&7;aKoI;g5n1sI;!n0_;lf6rgoI;rp1;[,ifI;!orcI;im;a,l,m,/NrLtI;iJseI;!-7M;gél;!pI;!m92p8*,%;!r,%;lcIr,t6;!=,o2%;a1Qb1Hc1Fe17f14g11i0Xl0D/rbé,o07p05r03uLéKêm3ôrJûI;os,rb;f,&,tn0;rr0vB;aYbXcTdSeQgPmNn/,oKpiJs?c6tIvo;i?cCsop;/m,ts;as,b5cJf1Cm,rI;!+,&,#;!é9F;iIrof1uc9Z;s78ts;uj,%;m,ugI;!&;no,`;$,iJl[,oAric,sIéps;ab,(b;hév,tI;<;af,ma5;im,pé;ap1uI;h,o;iDme70uI;ep,)9K;cirb,ffa,gMiK?]*,sJvI;!&,r8;i,n0;rbIv;[,m[;ir;aZeXiI)3;aUbahTcso,eQpPrOsuNts9uI;oKqI;am,<I;+;f,m,&ga,p5rItaF;b2Ng,^v3tH;f,ob;b,dauq,g,ht;!<pé,_g;rJvI;!r8é7;ap?;!r,s5;maFrit,tIvaD;!ivG#;cIpr93^uq;s,*;!-r8b2Jts~I;!s5%;fJhin/,m35oIpm0It&v,ur;>,v3;!&,uI#;af;nJueI%;va;@>,ipé,oj;fuJig,noI(m[;g,r;os,sA;cNdMgLpKtJvI;in,(n4;ab,/m5<m,ta;!aF?7é;!n0#;`1r0;$,if,rI#;ah;^c6(b3yc4âI;b,n4;aPiOmK(I;dI];!$,#;eI);],sI;!sI;a7$;c,rc;c=,ssLt;bmiDc5ed,fLgé7h,ngis,sJ>,vI;a7eF;!sI;ed;fa;ah,ots;c10d0Xf09g08h?rg06ks,lZnXpWrOsLtKvI;nI#;e,);iAn$12ublab;aJpotua,éhtseI;/;f,t*;aNcCotKpJ<FtIés;!apG;!o3S;rJsI;ih;epB;m1pIr4Wv;!?;),é;!am1$,uIégA;mm0;!buN$,iLlaK&,pI;!$,itlIp8#;um;!p,r;cn)Imuh,sB;!$,%;o,p;otIélét;ohp,<c;ufBélivi2;iJn0éI;d,m;c00dYlVnSrPsOtI;@,c4nKon,rIsuj;eIof;c,s5;aTeI;di,htI;ua;n6Z^v9_lc;alc,bul,=s,oJrIup,év;et,oh;lg;aJgIob,u;is;lp;aJpmI;a,is;uq;ilEoIé;c,m;apJéI;ps;!o;@J&m,u>,éI;d,gn0m4p*C;!ri;ifénéb,nKoI^m4uEé2I;gén1ssI;a,id;atsno6IeI;cil,rI;éff9;cJpI;moiDo]_t[;a07i05n01oWrTuPâOéKêIôc,ûb;pIrp;!me,#;lKrJsI;!_;bé;!f;b,f,g,l1m,t;aKbéDlpé,oI;bIc5Ud,l,m,t;me,#;bme,veF;am,eJoI;+,t;.1p;cLh,lc,p,rI;cJpI;$,?7;!=7#;!ir;aJeIorb,yl;lc3Fp;lp,rI;b3t1;fIn5];!fa;c,h,rJtI;!ta7#;c,<;a0Gdirb,i0Bn05o03rTuOèMéI;iKlJrIto2;ba;la;l,p,s;isI;_;aLfirolKjJoI;b,f;!é2;[;j,tH;a.OeJoIu1B;f,g;bKmJvI;id,n0;mi,é;mIéh;ag;!-1X$,r8éI;d,lI;ét;l3mil,rI;ba,o2r4T#;aKev,is,oI;lIpé,r,s;!la,o2p;.1JlJm,rI;!<,#;ém;dBen,f,lJp,rIs2X*;id1r0é;bo,fAgI;én;rb;cMg19luEmLnJpo2r(c28siv28tIyov;rHé;!am,émI;aCme,#;i,mod24;ap,=s;@OfIr8;$g,i0oMuI;a.Jlb,oI;b,>;!éI;!r0D;>;ga;a0Hi08n00oWrNuLyxo,éIôr;cIssop;!cIn0o2*,é2;a,us;lé,oI]*;b,c,s;aKemme,oI;bIcS;!a,#;bLgJngiop,tIvab;!$,ta;!eI;r,vuas;mI#;ob;c0GmJrI;!b;m)I;=7;aNeKics,oI;ba,cIf,~,rg,s,*;es;cs1ShéIma;rpI;?;b,.<m,lg,mI;!ed1irpBm0C;aPcNlKmitA?l,r,s%JuIv;g,qil;!p;avJoI;sn07;!~;i8nï0uI#;lé;!lp,]6;cirrLlaKrJusIvé;^p,s9;g5t*;b,cse;ab;a0Be09ipé,nNrJua*,éipG;@;eKialc,oI;fIma0Vv9;!fe,n4;b,mm0p,*;aTeNiLoI;fJip,nI;$,/,o2é1Z;!&,#;),pIr;!é;cil-Mga,mmLrruKuI;lfAqI;és;cn0;)1;suE;if,lNnLtKvJéloI;dn0;a,ed;!s9;if0EnodI;ro;!abI$,é;!$I;tn0;pé;maIp5;lc;fNlLmiKnJpI]1;se;em;rg;!g,&,pI;!$,m4#;fe;ihTmPoNrIutit;eLosKuI;oIt^p;c,t;ba,%;=*,g;g,lg6rI;&,#;aKoI;cIt1;c8~;j6lf;~,*;c~av2Yd1Zgèt~Bi0Volc0Spmo0Pt04ulc02viYèI;a,bWdiVfTgRlQmuPnOpIsAvés^p;$,mLoKseIucB;!s5;#;!);etI;bo;év;né;ot,éc=;!aIg8;*;f9o2r17sIé2;/D;sn0;il;usJvI;!$,r8;!&,ruI;op;!$,nI*;i,);ia00n`,sZtS(f,âi<RèNê,îI;aKoI;lc,rcI;!=,$,#;nIp1<ps9;!$,n0;moJnI;ép;norF;.;=;abMemI;!da,$,m0oJrIs/]1uEé;ep;!rpI;!m0;!a7m0#;!r;it;n1Sp4rH;ap;!rI;!rI;etA);!&,rJéI;!d;of;a0Cc09d03f02l01oZrTuI;!c,dLl,n,rI;b,tI;snI#;i,)1;aDnMorJéI;d,r,s;p1tI;~C;!%;e,i,)1;];!cIf,uE;!sJéI;!d,%;e2nIuE;@t4i,oU;$;b,rcI;!=;!$,é;f8n0;!$MrKuJé2;rp;am;etA;~;!tn0;co,noI;crI;ic;fLlp3rIt;!b,tI;!sI*;id,uE;!$,rLsitKéI;d,puI;ts;as;ap,of;nNrK(I;c,m,sI;!ba,s9%;ep,oJuE;os;m,t;apBeYiNoI;fKpIt;!seI%;rr0;!n0rI;`;aQeLoI;!jIp;!da,$,s9;id;f,g,p1rJtI;ta,é;f6pJtsI;a,$;me;!lp,rI;c,tn0;csed1f3i,pOrKtIv1;&,ta,éI;!d,rp;!pI;!$Im0?,r8;!t6;&;!$,s8#;us;!#;!$;%;!n0;)",
    "Person": "true¦!1:#$%&()*:in,er,an, ro, w,ss,ar;ashton kutchSbRcMdKeIgastNhG#ez,jEkDleCmBnettJoAp8r4s3t2v0;a0irg# maG;lent#o&)i,n go3;h$esa may,ig$(oods,yra b%ks;addam hu)a#,c*lett joh%)Jlobod% milosevic,uB;ay&m%o,eese(ith$spoIo1ush limbau0;gh;d stew*t,nald0;#ho,o;a0ipJ;lmIris hiltD;prah(#frFra;e)iaen,itt&mnEub*ek;bron james,e;%ye(est,ief$ suth$l%d,obe bry%t;aime,eff$s8k&wli0;ng;alle b$0itlBulk hog%;ry;ff0m$il laga)e,zekiel;ie;a0enzel(ash#gt2ick(olf;lt1nte;*1l#t0ruz;on;d#al(ols1son0;! palm2;ey;*ack obama,rock;$",
    "City": "true¦!1:#$%&()*+-./<=>?@[]^_`~:an,en,ng,ra,la,er,ch,on,ha,in,al,ar,ta,es,ur,ba,re,lo,il,de,or,us;a2Yb28c1Yd1Te1Sf1Qg1Kh1Ci1Ajak<=,k11l0Um0Gn0Co0ApZquiYrVsLtCuBv8w3y1z0;ag[b,?i*;#g+,e0oko-ma;kat).1J[v#;<s3e2i0rocl3;ck]w,n0;nipeg,t)th?;lli%t+,xf`d;aw;a1i0;$na,lni~;l$cia,ncouv),rna;l# @t`,t[*t;a6b^isi,e5he4i3o2r+dheim,u0;nVr0;.,ku;kyo,r+Iu]uC;#j.,l15miso2Lr#a; -Jss/+iki;gucig/pa,hr#,l aviv;i0ll.n,mp)e,%i),rtu;*u%,n#,pT;a3e2h1kopje,t0ydney;ockholm,uttg<t;#g-i,$zh$;oul,v00;.t pet)s0Wl3n0pp`o; 0ti1D;jo0s/v2;se;v0z0S;adV;eykjavik,i1o0;me,s<io,t27;ga,o _ j#eiro;to;a8e6h5i4o2r0ueb(,yo%y#g;a0et`ia;gue;rt0zn#; elizabe3o;ls$,&e~;i(_lphia,nom p$h,o$ix;r0=h tikva;th;l)Kr0t&s;is;d>sa,s0t=wa;aka,];a2ew 0;_lV=ip0y`k;ei;goya,nt>,pl>,v#;a6e5i4o1u0;m@i,ni*;nt1sco0;u,w;evi_o,[/;l#,nsk,skolc;_llín,lbo?ne;drid,l5n3r0;ib1se0;^le;`;*>t0d/Xi(;);mo;a5i2o0vBy+;nd0s #gel>;+,r>;ege,ma0nz,sbZv)po1;!ss0;ol; p(=,~#ne;a5-rk4i3(ipeda,o1&k0ua( lump2;ow;be,pavog0sice;?;ev,%8;iv;b3mpa(,ndy,ohsiu%,&0unas;c0j;hi;n*eMst#b0̇zmir;ul;a5e3o0; *i mi1ms,u0;stI;nh;ls.0&kliG;ki;ifa,m0noi,v#a;b?g,^tD;/w4d#3$2h$t,iza,oth$1&z,ua0;da(j0G%zhou;b?g;eUoa,ève;sk;ay;>,r#kfu0;rt;dm+t4.dhovU;a1-ka,o-,u0;blRrb#,sh#be;e0k<,masc~,ugavpiJ;gu,je0;+;a7ebu,h2o0&ioJ?iti@;]0nst#Jp$-gNrk;gFmbo;$n3i1rist*?0;*;#g m1c0t=goL;ago;ai;i0lg<y,pe town,&c4;ro;aHeBirmi%hWogoAr5u0;*<3dap3$os air2r0sZ;g0sa;as;>;>t;a2is@1~se0;ls;ne;s^Ptis(0;va;=;i3lg&_,r0;g1l0n;.;$;ji0rut;%;ku,n3r0sel;ce]1r#qu^0;(;na;g1ja lu0;ka;/o0kok;[;aBb9hmeda@d,l7m4n2qa1sh0th$s,uckl#d;dod,ga@t;@;k0tw)p;a&;m5s0;t)d0;am;ex#dr0maty;ia;idj0u d-bi;#;lbo1rh0;~;rg",
    "Place": "true¦aMbKcIdHeFfEgBhAi9jfk,kul,l7m5new eng4ord,p2s1the 0upJyyz;bronx,hamptons;fo,oho,under2yd;acifMek,h0;l,x;land;a0co,idDuc;libu,nhattK;a0gw,hr;s,x;ax,cn,ndianGst;arlem,kg,nd;ay village,re0;at 0enwich;britain,lak2;co,ra;urope,verglad0;es;en,fw,own1xb;dg,gk,hina0lt;town;cn,e0kk,rooklyn;l air,verly hills;frica,m5ntar1r1sia,tl0;!ant1;ct0;ic0; oce0;an;ericas,s",
    "Currency": "true¦$,aud,bScQdLeurKfJgbp,hkd,inr,jpy,kHlFnis,p8r7s3usd,x2y1z0¢,£,¥,ден,лв,руб,฿,₡,₨,€,₭,﷼;lotySł;en,uanR;af,of;h0t6;e0il6;k0q0;elM;iel,oubleLp,upeeL;e3ound0;! st0s;er0;lingH;n0soG;ceFn0;ies,y;e0i7;i,mpi6;n,r0wanzaByatB;!onaAw;ori7ranc9;!o8;en3i2kk,o0;b0ll2;ra5;me4n0rham4;ar3;ad,e0ny;nt1;aht,itcoin0;!s",
    "Cardinal": "true¦:e4fuen3orez,qBsio9t2x0;i0ued;d,s;gniv,iuh0pes0;! xid;r8tn3z0;ie1n0ro7uod;i7o;rt,s;a1e0;rt;non,ra3t1uq0xios;nic;co,iuh,pes;ta0;uq",
    "Ordinal": "true¦:emèi0;nu,orez,rDsioCt5u8vuen,x3z0;ie1n0roCuod;iCo;rt,s;i0ued;d,s;gniv,i5n0p4;a0e5;non,ra6t1u0xios;qnic;co,i1p0;es;uh;rt;ta0;uq",
    "Unit": "true¦bIceGeEfahrenheitJgChertz,jouleJk9liHm7p4terFy2z1°0µs;c,f,n;b,e1;b,o0;ttB;e1ou0;ceDrcentD;rcent,t8;eg7il0³,è9;eAlili8;elvin9ilo1m0;!/h,s;!b6gr1mètre,s;ig2r0;amme5;b,x0;ab2;lsius,ntimè0;tre1;yte0;!s",
    "MaleNoun": "true¦:!1:#$%:at,ér,vuo;ePfir#,laOrKt2u0xu#,$ged;ae0eil;!rub,s$,tab,vin;iGn0;aru#sEem0;e1ges,om,ucIé0;lé,rga;cAdnBg9iap,l8n4p3rtsigerVs1t0%m;iart,urcA;nec9ruobm9si0;lb#é,orcca,tsevL;iuqé,polevéd;giesQno0re%g,évé;i0rivP;sivorppa,tc0;efFnS;gèr,le%n2rW;agLnahc;nanif,rofn0;er;d$c,forp,ordI;e1i0;a,neva;iss0vih;od;mina,nruoj;capse,iulparMlIriaEtn9uqi6v2é0;di,nn0s7;a,od;it0èlé;aiti1ceps0;rep;ni;s1t0;ilop,sit#s;um;a3e1i0;a2etta;t0v;ne;lp;ffa,icifénéb,las,n0tnemmoc;etr6noit0;cn0seg;of;#égév,b2i0lehcé;bom0f;!otua;#;ap",
    "Organization": "true¦!2;!1:#$%()*+<=>?@[]^_`~:on,er,an,da,st,re,le,te,e ,ar,il,ca,ro,en,al,n ,or,de;0:42;a37b2Oc28d20e1Xf1Tg1Lh1Gi1Dj19k17l13m0Sn0Go0Dp07qu06rZsStFuBv8w3y1;amaha,m@,ou1w@;gov,tube;a3e1`ld trad=`g%izati#;lls f>go,)1;field,inghouse;l1rn$ b[s;-m11g*]s,l )*et journ^,m11;% h^N$iz#,isa,o1;(f#e,l1;kswagLvo;\\c,bs,kip,n2ps,s1;a to(y,ps;esco,i1;+v$,<d nati#s; mobi+,aco bePd bMeAgi fri(9h3im h`t#s,mz,o1witt$;shiba,y1;ota,s r Y;=1i_lizzy;b3c>p]2Z(?y ma?,guess w2holli0[lling )1Ls1w2;mashing pumpkins,up*m0;ho;ea1lack eyed peas,yrds;ch bo1tl0;ys;l2s1;co,la m12;ef#i@,us;a6e4iem]s,np,o2pic=gir5ta1ub>u;rbucks,to?;ny,undg>d1;];>s,x pi)o1;ls;feway,insbu23msung;.e.m.,adiohead,b6e3oy^ 1y%2T;b1dutch she4;%k;/max,ad$s dige),d 1vl#;bu1c1Rhot ch?i pepp$s,lob)$;ll;c,s;%tas,izno's;%5bs,e3fiz$,h?ip m`rBi2r1;emi$23oct$ & gamb+,ud]ti^;nk floyd,zza hut;psico,t[1ugeot;bras,china,nas; 2as#ic,(2C;ld navy,pec,r%g=juli2xf1;am;us;a9b8e5fl,h4i3o1sa,wa;kia,t* (me,v>t1;is;ke,n<ndo,ss%;l,s;c,)+,tflix,w1; 1sweek;kids # th=block,y`k08;a,c;ndos,s2t1;i#^ a@2Bo,we);a,cY(q;aAcd#^d9e5i3lb,o1tv,yspace;b?,ns%to,ody blu0t1;+y crue,`0M;c[soft,t1;as,subisO;di@3rce~s2t^li1;@;!-b]z;id,*;'s,s;c's m?k,t<l,z(;'o*^,a3e1g,itt+ @es>s;novo,x1;is,m>k; p*s5-z-boy,bour p>ty;atv,fc,kk,m1o(k;>t;iffy lube,o3pm`g%1sa;! cha1;se;hns# & johns#,y d1N;bm,hop,n1tv;g,<1;l,rpol; & m,asb[,ew+tt-packaRi3o1sbc,yun(i;m=~p1n(;ot;tac1zbollah;hi;]$^ 6hq,l5mb,o2*] (y,u1;cci,ns _[s0;ldm% sachs,o1;dye1g+;>;axo smith kliX]co*;e+ctric,m1;ot`s;a3bi,(,e~x,i1+etwood mac,oErito-lay;at,n%ci^1*)oT; tim0;cebook,nni=mae;bay,sa,u[sceptics,xx#1; m1m1;ob?;aiml$,e5isney,o3u1;nki_d#uts,p#t,r% dur1;%;j,w j1;#0;a,f +ppa2ll,pech=mo~,r spiegX)iny's chi1;ld;rd;aEbc,hBi9nn,o3r1;aigsli5eed]c=c+>wat$ *viv1ossra?;^;@ c5l4m1`s,)co;@2p1;aq;);dplLga<;ola;a,sco1tig[up;! sy)ems;ev2i1;ck f?-a,na (?y;r#,y;dbury,pit^ o1rl's jr;ne;aFbc,eBf9l5mw,ni,o1p,*xi<eV;ei3mb>diJ)# 1;glo1pizza;be;ng;ack & ~ckFo2u=c1;[W;ckbu)$ vi~o,oming(1;+; g1g1;oodriM;cht3=ge0_& j$2rkshi* hathaw1;ay;ryG;el;n%a *publ3s1xt5y5;f,ki_[bbi1;ns;ic;bWcRdidQ$osmith,ig,lKmEnheus$-busDol,pp+9r6s3t&t,v2y1;$;is,#;hl%d1socia<d F; o1;?;by4g2m1;co;os; compu2bee1;'s;<1;rs;ch;c,d,$ic%3t1;!r1;ak; ex1;p*1;ss; 4@<l2t1;air;!-luce1;nt;jaze$a,qae1;(;as;/dc,a3$,t1;ivisi1;#;~my of sci]c0;es;ba,c",
    "FemaleNoun": "true¦:e0;cnalubma,i0luop,rutifnoc,ttul,ur;goloég,riarbil",
    "SportsTeam": "true¦!2;:!1:#$%&()*+-/<=>?@[]^_`~:na,al,ts,no,et,er,ar,ra,ti,la,ro,ni, o, s, e,ma,c ,it,el,ap,lo;$liv &%a,c1Ud(inu 1Oe1K&i1Go[nyd 1Fr1Ds6t5xos 3y0zzaj hatu;-]0x$ag $;eko%,ffidHre%e0sas#k g=t<ps;ci_,h1M;d) 17(ihw0;!>1H;aehWc`mi /)t&m;$/d cf,buc1Ec^12d0Ye0Jfeihc0Ig=k0Hk08l00m*?06nQoNpac(ihw revuoc#v,r7t2y0;a0obwoc0D;j@ulb7rF;e2~c?i~pGn0oirt`17;aig 0iasV;k1LoG;ggunJj1Jkcor 12m0Rn0; nylkoorb,<h (tol+hc;aEe2o0ups>i&t#0K;ir+w (a% ned~g,tp*0;>t&<t;\\g\\h 10\\j\\e>Abmi9c` 8d7e#ccub6g2ht#p a=~1i/vacNk0lee%0C=+mZppil]5vor nrubkc$b,w)01z$b li*9;$3c` yab ne)g;+c;dod1^E#r 0+h]0B;k+p?neeuq,saxI;! 0;s_eg#?ol; yab `[t;i*0MnuosR;a#id=;t d#lt<p;csic#rf06;eb0Rugaj@lliv&skcaj;c&rb1r%a0;! 0J; revn3;a5ev*00i3o0us xineohp,worb7;c/f Uil0%ip0; -ort0;ed;hp~d0ksd)04l+m0wtQ; i[im;cilep2id=1-t@essenn0x( 0B;(; d#lev_c;?#_< 0R;a2l0;ib>/ffub,ub 0;d)0Mo0C;gnebXn0yorE;id+]0o^anU;aAs0;iuol .0;%;c2wah0; Caes0;@lttaes;abd&[id3i1u0;b@ekuawlim;nkJrevam0;?$/d;! a0;&zi+;>tnem*cBiv3; y-c?as#k;ek#yDiAkauqht+e@soj8l6rd`4t*ip3v0;*b 1~wrebm^0; atoY;atnZ; hgrubst-p;! 0;ogeid2;gae Koi<0; )om^/b; n0;as;kco5l0;lihp0zzirg?ihpmem;! E;! kS;)2ipa1+ziw0; &tg=hsaw;r>d*oN; ^an=c=c;_hta2lec0;! 0;&%ob; d#lkao;ednuht y-]amoh$ko,upstoh [hn(t0;ot;&%uoh;nu 1tu~v)0; d#lgne G;aihpled$i0;hp;k$ t/s /),rif0;>0;gaci0;hc;.c.d,at1dleiffehs,_%ac9[h %ew,re%eh0;c#m;n2o0;senn0;im;$ta;f y-c1igam>d#l<,s w)c?ubmu0;~c; k0;<y 0;wen",
    "Possessive": "true¦leur2m1no0s1t1vo0;s,tre;a,es,on;!s",
    "Pronoun": "true¦c2elle1il1j2moi,n0on,t,v0;ous;!s;!e",
    "Uncountable": "true¦:*secneics,egaZs0xuev9;aWcehcé,dUeEiBlAn5o,prPr3t0;aba,ehcIiurf,nem0ropsnart,âgI;acidém,e0;ngiesnUtêv;ioved,uet0;atce8idua;es,iof,o0;i2r0;ivne,v0;ehc;sivérp,tinum;eicigol,iesnE;algna,locorb,ob,rb7t0;iffarg,tehga0;ps;cEgChBl5r2t1uqèsbo,énnod0;atad,ro9;isarap,teverc,âp;b0iaffa,udro;moc0ènét;éd;aéréc,b3l0;ia0orem1;rén0utciv,çnaif;uf;m0uem;oc;crehc6rra;a0repsa;g6var;nacav,on;iop,r0;anipé,om1;p0rb;er;brag,gg0;ab",
    "Expression": "true¦:aZeTfSgnRhJiIkGlEmCnmRo9p8rrg,s7t5w3y0zW;ay,eh,l0o;lTo0;h,m yloh;eh0oUwe;p,w;i0ssp;hs,mmKnmK;lol,poo;ee,uy;a1ll5o0;b,hay,o;fml,ml;eha,hu,m0;h,m;l0ol;eh;cu0ee,st;f,y;ah,h;a6e5g4h3o1seehs,u0;!d,h 1;! 0'd,o;hu;hs,o,u;ra,u;!m;!b,ey,g,n,rruh;ad;atw,fp,tw;e3pon,sae2yb0;!do0;og;lp;g,h0;!w;ay,hah1l0ohw,retec te,y; a,iov;!ah"
  };

  /* eslint-disable no-empty */
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
    for (; places > 0; places--) {
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

  const symbols$1 = function (t) {
    const reSymbol = /^([0-9A-Z]+):([0-9A-Z]+)$/;
    for (let i = 0; i < t.nodes.length; i++) {
      if (!t.nodes[i].includes(':')) {
        break
      }
      const m = reSymbol.exec(t.nodes[i]);
      if (!m || m[0].length !== t.nodes[i].length || encoding.fromAlphaCode(m[1]) !== i) {
        throw new SyntaxError('Invalid efrt packed data: symbol definition')
      }
      t.syms.push(encoding.fromAlphaCode(m[2]));
    }
    t.symCount = t.syms.length;
    t.nodes = t.nodes.slice(t.symCount);
    if (t.nodes.length === 0 || t.syms.some((index) => !Number.isSafeInteger(index) || index >= t.nodes.length)) {
      throw new SyntaxError('Invalid efrt packed data: symbol target')
    }
  };

  const unescapeLabel = function (text) {
    return text.replace(/\\([\s\S]|$)/g, (match, char) => {
      if (char === '\\') {
        return '\\'
      }
      if (char >= 'a' && char <= 'j') {
        return String(char.charCodeAt(0) - 97)
      }
      throw new SyntaxError('Invalid efrt packed data: label escape')
    })
  };

  const dictionary = function (trie) {
    if (!trie.nodes[0].startsWith('!1:')) {
      return
    }
    const header = trie.nodes.shift().split(':');
    const tokens = Array.from(header[1]);
    const fragments = (header[2] || '').split(',');
    if (header.length !== 3 || tokens.length === 0 || tokens.length !== fragments.length ||
      new Set(tokens).size !== tokens.length || trie.nodes.length === 0 ||
      tokens.some((token) => token.length !== 1 || token.charCodeAt(0) < 33 ||
        token.charCodeAt(0) > 126 || /[A-Za-z0-9,;!:|]/.test(token) ||
        (trie.versioned && token === '\\')) ||
      fragments.some((text) => !text || /[A-Z0-9,;!:|¦]/.test(text))) {
      throw new SyntaxError('Invalid efrt packed data: fragment dictionary')
    }
    trie.dictionary = Object.create(null);
    for (let i = 0; i < tokens.length; i++) {
      trie.dictionary[tokens[i]] = trie.versioned ? unescapeLabel(fragments[i]) : fragments[i];
    }
  };

  // References are either absolute (symbol) or relative (1 - based)
  const indexFromRef = function (trie, ref, index) {
    const dnode = encoding.fromAlphaCode(ref);
    const target = dnode < trie.symCount ? trie.syms[dnode] : index + dnode + 1 - trie.symCount;
    // The encoder emits nodes in topological order. Every edge must point
    // forward, which also rules out cycles before expansion starts.
    if (!Number.isSafeInteger(target) || target <= index || target >= trie.nodes.length) {
      throw new SyntaxError('Invalid efrt packed data: node reference')
    }
    return target
  };

  const parseNodes = function (trie) {
    return trie.nodes.map((node, index) => {
      if (node === '' && trie.nodes.length !== 1) {
        throw new SyntaxError('Invalid efrt packed data: empty node')
      }
      const terminal = node[0] === '!';
      const body = terminal ? node.slice(1) : node;
      const edges = [];
      // Match only at the current offset. Searching later positions would
      // repeatedly rescan a long malformed fragment before rejecting it.
      const token = /([^A-Z0-9,;!:|¦]+)([A-Z0-9]+|,|$)/y;
      for (let offset = 0; offset < body.length; offset = token.lastIndex) {
        const match = token.exec(body);
        if (!match || match.index !== offset || (match[2] === ',' && token.lastIndex === body.length)) {
          throw new SyntaxError('Invalid efrt packed data: node syntax')
        }
        const ref = match[2];
        const label = trie.versioned ? unescapeLabel(match[1]) : match[1];
        const text = trie.dictionary ? Array.from(label,
          (char) => trie.dictionary[char] || char).join('') : label;
        edges.push({
          text,
          target: ref === '' || ref === ',' ? -1 : indexFromRef(trie, ref, index)
        });
      }
      return { terminal, edges }
    })
  };

  const toArray$1 = function (trie) {
    const nodes = parseNodes(trie);
    const all = [];
    const stack = [{ index: 0, pref: '', edge: -1 }];
    for (; stack.length > 0;) {
      const frame = stack[stack.length - 1];
      const node = nodes[frame.index];
      if (frame.edge === -1) {
        if (node.terminal) {
          all.push(frame.pref);
        }
        frame.edge = 0;
      }
      if (frame.edge === node.edges.length) {
        stack.pop();
        continue
      }
      const edge = node.edges[frame.edge++];
      const word = frame.pref + edge.text;
      if (edge.target === -1) {
        all.push(word);
      } else {
        stack.push({ index: edge.target, pref: word, edge: -1 });
      }
    }
    return all
  };

  //PackedTrie - Trie traversal of the Trie packed-string representation.
  const unpack$1 = function (str, versioned = false) {
    const trie = {
      nodes: str.split(';'),
      syms: [],
      symCount: 0,
      versioned
    };
    dictionary(trie);
    //process symbols, if they have them
    if (str.match(':')) {
      symbols$1(trie);
    }
    return toArray$1(trie)
  };

  const unpack = function (str) {
    if (str === '' || str === null || str === undefined) {
      return {}
    }
    if (typeof str !== 'string') {
      throw new TypeError('efrt unpack expects a string')
    }
    //turn the weird string into a key-value object again
    const obj = str.split('|').reduce((h, s) => {
      const arr = s.split('¦');
      if (arr.length !== 2 || Object.prototype.hasOwnProperty.call(h, arr[0])) {
        throw new SyntaxError('Invalid efrt packed data: category separator or duplicate category')
      }
      h[arr[0]] = arr[1];
      return h
    }, Object.create(null));
    const all = {};
    Object.keys(obj).forEach(function (cat) {
      let data = obj[cat];
      const versioned = data.startsWith('!2;');
      if (versioned) {
        data = data.slice(3);
        if (!data || data === ':') {
          throw new SyntaxError('Invalid efrt packed data: missing versioned trie')
        }
      }
      const reversed = data[0] === ':';
      const arr = unpack$1(reversed ? data.slice(1) : data, versioned);
      //special case, for botched-boolean
      if (cat === 'true') {
        cat = true;
      }
      for (let i = 0; i < arr.length; i++) {
        const k = reversed ? Array.from(arr[i]).reverse().join('') : arr[i];
        if (Object.prototype.hasOwnProperty.call(all, k)) {
          if (Array.isArray(all[k]) === false) {
            if (all[k] !== cat) {
              all[k] = [all[k], cat];
            }
          } else if (!all[k].includes(cat)) {
            all[k].push(cat);
          }
        } else {
          Object.defineProperty(all, k, {
            value: cat,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
    });
    return all
  };

  // hand-fixes that win over the packed lexicon (this file is merged last)
  var misc$1 = {
    // ==high-frequency words the packed lists get wrong==
    // ==avoir== - person-tags let compute('root') + verbs() find the infinitive
    // (the tagset keeps Auxiliary and PresentTense exclusive, so no tense-tag here)
    // 'a' = avoir 3rd-sing. (the accented 'à' is the preposition)
    a: ['Auxiliary', 'ThirdPerson'],
    ai: ['Auxiliary', 'FirstPerson'],
    as: ['Auxiliary', 'SecondPerson'],
    avons: ['Auxiliary', 'FirstPersonPlural'],
    avez: ['Auxiliary', 'SecondPersonPlural'],
    ont: ['Auxiliary', 'ThirdPersonPlural'],
    // 'eu' = past participle of avoir (was tagged Organization)
    eu: ['PastParticiple'],
    eus: ['PastParticiple'],
    eue: ['PastParticiple'],
    eues: ['PastParticiple'],
    // subject pronoun (was clobbered by 'taire' participle-adjective)
    tu: ['Pronoun'],
    // 'dit' = dire, present or participle (was MaleAdjective)
    dit: ['Verb', 'ThirdPerson'],
    // adverb (was MaleAdjective)
    plus: ['Adverb'],
    // participles of venir (were MaleAdjective)
    venu: ['PastParticiple'],
    venue: ['PastParticiple'],
    venus: ['PastParticiple'],
    venues: ['PastParticiple'],
    // missing common nouns with misleading endings
    homme: ['MaleNoun', 'Singular'],
    hommes: ['MaleNoun', 'PluralNoun'],
    monde: ['MaleNoun', 'Singular'],
    'idée': ['FemaleNoun', 'Singular'],
    'idées': ['FemaleNoun', 'PluralNoun'],
    // common adverbs
    'là': ['Adverb'],
    'tôt': ['Adverb'],
    ici: ['Adverb'],
    ensemble: ['Adverb'],
    // object clitics are pronouns, not possessives
    me: ['Pronoun'],
    te: ['Pronoun'],
    toi: ['Pronoun'],
    lui: ['Pronoun'],

    // ==être==
    // present
    es: ['Copula', 'PresentTense', 'SecondPerson'],
    est: ['Copula', 'PresentTense', 'ThirdPerson'],
    suis: ['Copula', 'PresentTense', 'FirstPerson'],
    sommes: ['Copula', 'PresentTense', 'FirstPersonPlural'],
    êtes: ['Copula', 'PresentTense', 'SecondPersonPlural'],
    etes: ['Copula', 'PresentTense', 'SecondPersonPlural'],
    sont: ['Copula', 'PresentTense', 'ThirdPersonPlural'],
    // imperfect
    étais: ['Copula', 'Imperfect'],
    etais: ['Copula', 'Imperfect'],
    était: ['Copula', 'Imperfect', 'ThirdPerson'],
    etait: ['Copula', 'Imperfect', 'ThirdPerson'],
    étions: ['Copula', 'Imperfect', 'FirstPersonPlural'],
    etions: ['Copula', 'Imperfect', 'FirstPersonPlural'],
    étiez: ['Copula', 'Imperfect', 'SecondPersonPlural'],
    étaient: ['Copula', 'Imperfect', 'ThirdPersonPlural'],
    etaient: ['Copula', 'Imperfect', 'ThirdPersonPlural'],
    // future
    serai: ['Copula', 'FutureTense', 'FirstPerson'],
    seras: ['Copula', 'FutureTense', 'SecondPerson'],
    sera: ['Copula', 'FutureTense', 'ThirdPerson'],
    serons: ['Copula', 'FutureTense', 'FirstPersonPlural'],
    serez: ['Copula', 'FutureTense', 'SecondPersonPlural'],
    seront: ['Copula', 'FutureTense', 'ThirdPersonPlural'],
    // conditional
    serais: ['Copula', 'ConditionalVerb'],
    serait: ['Copula', 'ConditionalVerb', 'ThirdPerson'],
    serions: ['Copula', 'ConditionalVerb', 'FirstPersonPlural'],
    seriez: ['Copula', 'ConditionalVerb', 'SecondPersonPlural'],
    seraient: ['Copula', 'ConditionalVerb', 'ThirdPersonPlural'],
    // passé simple
    fus: ['Copula', 'PastTense'],
    fut: ['Copula', 'PastTense', 'ThirdPerson'],
    fûmes: ['Copula', 'PastTense', 'FirstPersonPlural'],
    fûtes: ['Copula', 'PastTense', 'SecondPersonPlural'],
    furent: ['Copula', 'PastTense', 'ThirdPersonPlural'],
    // subjunctive
    fusse: ['Copula', 'PastTense'],
    fusses: ['Copula', 'PastTense'],
    fût: ['Copula', 'PastTense', 'ThirdPerson'],
    fussions: ['Copula', 'PastTense', 'FirstPersonPlural'],
    fussiez: ['Copula', 'PastTense', 'SecondPersonPlural'],
    fussent: ['Copula', 'PastTense', 'ThirdPersonPlural'],
    sois: ['Copula', 'PresentTense'],
    soit: ['Copula', 'PresentTense', 'ThirdPerson'],
    soyons: ['Copula', 'PresentTense', 'FirstPersonPlural'],
    soyez: ['Copula', 'PresentTense', 'SecondPersonPlural'],
    soient: ['Copula', 'PresentTense', 'ThirdPersonPlural'],
    // participle + infinitive
    été: ['Copula', 'PastParticiple'],
    ete: ['Copula', 'PastParticiple'],
    être: ['Copula', 'Infinitive'],
    etre: ['Copula', 'Infinitive'],

    // ==numbers==
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
    vingts: ['TextValue', 'Cardinal'],//quatre-vingts
    'zéro': ['TextValue', 'Cardinal'],
    'zéroième': ['TextValue', 'Ordinal'],
    cents: ['Multiple', 'Cardinal'],
    milles: ['Multiple', 'Cardinal'],
    millions: ['Multiple', 'Cardinal'],
    milliards: ['Multiple', 'Cardinal'],
  };

  const tagMap = {
    first: 'FirstPerson',
    second: 'SecondPerson',
    third: 'ThirdPerson',
    firstPlural: 'FirstPersonPlural',
    secondPlural: 'SecondPersonPlural',
    thirdPlural: 'ThirdPersonPlural',
  };

  const words = {};
  Object.keys(lexData).forEach(tag => {
    const wordsObj = unpack(lexData[tag]);
    Object.keys(wordsObj).forEach(w => {
      words[w] = tag;

      // expand
      if (tag === 'MaleAdjective') {
        const res = methods$1.adjective.conjugate(w);
        words[res.female] = words[res.female] || 'FemaleAdjective';
        words[res.plural] = words[res.plural] || 'MaleAdjective';
        words[res.femalePlural] = words[res.femalePlural] || 'FemaleAdjective';
      }
      if (tag === 'Cardinal') {
        words[w] = ['TextValue', 'Cardinal'];
      }
      if (tag === 'Noun' || tag === 'MaleNoun' || tag === 'FemaleNoun') {
        words[w] = [tag, 'Singular'];
        const plur = methods$1.noun.toPlural(w);
        words[plur] = words[plur] || ['Noun', 'PluralNoun'];
      }
      if (tag === 'Ordinal') {
        words[w] = ['TextValue', 'Ordinal'];
        const norm = w.replace(/è/, 'e');
        words[norm] = words[norm] || ['TextValue', 'Ordinal'];
      }
      if (tag === 'MaleNoun') {
        const p = methods$1.noun.toPlural(w);
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
        // do conditional mood
        res = methods$1.verb.toConditional(w);
        Object.keys(res).forEach(k => {
          if (!words[res[k]]) {
            words[res[k]] = [tagMap[k], 'ConditionalVerb'];
          }
        });
        // do imperfect mood
        res = methods$1.verb.toImperfect(w);
        Object.keys(res).forEach(k => {
          if (!words[res[k]]) {
            words[res[k]] = [tagMap[k], 'Imperfect'];
          }
        });
        // past-participle
        const out = methods$1.verb.toPastParticiple(w);
        words[out] = words[out] || 'PastParticiple';
      }
    });
  });

  const lexicon$1 = Object.assign({}, words, misc$1);

  const verbForm$1 = function (term) {
    const want = [
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
        const str = term.implicit || term.normal || term.text;
        // nouns -> singular masculine form
        if (term.tags.has('Noun') && !term.tags.has('Pronoun')) {
          const isPlural = term.tags.has('PluralNoun');
          // let isFemale = term.tags.has('FemaleNoun')
          if (isPlural) {
            term.root = transform.noun.fromPlural(str);
          }
        }
        // adjectives -> singular masculine form
        if (term.tags.has('Adjective')) {
          const isPlural = term.tags.has('PluralAdjective');
          const isFemale = term.tags.has('FemaleAdjective');
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
          const form = verbForm$1(term);
          if (term.tags.has('Infinitive')) ; else if (term.tags.has('ConditionalVerb')) {
            term.root = transform.verb.fromConditional(str);
          } else if (term.tags.has('FutureTense')) {
            term.root = transform.verb.fromFutureTense(str, form);
          } else if (term.tags.has('Imperfect')) {
            term.root = transform.verb.fromImperfectTense(str, form);
          } else if (term.tags.has('Passive')) {
            term.root = transform.verb.fromPassive(str, form);
          } else if (term.tags.has('PastTense')) {
            term.root = transform.verb.fromPastParticiple(str);
          } else if (term.tags.has('PresentTense') || term.tags.has('Auxiliary')) {
            // bare auxiliaries are present-tense forms of avoir/être - 'a' -> 'avoir'
            term.root = transform.verb.fromPresentTense(str, form);
          }
        }
      });
    });
  };

  var lexicon = {
    methods: {
      two: {
        transform: methods$1
      }
    },
    words: lexicon$1,
    compute: {
      root: root
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
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    const { regexText, regexNormal, regexNumbers } = world.model.two;
    const normal = term.machine || term.normal;
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

  const isTitleCase = function (str) {
    return /^[A-Z][a-z'\u00C0-\u00FF]/.test(str) || /^[A-Z]$/.test(str)
  };

  // add a noun to any non-0 index titlecased word, with no existing tag
  const titleCaseNoun = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const term = terms[i];
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
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    if (term.tags.has('NumericValue') && term.tags.has('Cardinal') && term.normal.length === 4) {
      const num = Number(term.normal);
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
    const str = term.text;
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
    const setTag = world.methods.one.setTag;
    const term = terms[i];
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
    const setTag = world.methods.one.setTag;
    if (terms[i - 1]) {
      const lastStr = terms[i - 1].normal;
      if (terms[i].tags.size === 0 && hasBefore.hasOwnProperty(lastStr)) {
        setTag([terms[i]], hasBefore[lastStr], world, false, 'neighbour');
        return true
      }
    }
    return null
  };

  const nounFallback = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    if (term.tags.size === 0) {
      setTag([term], 'Noun', world, false, 'fallback');
      return true
    }
    return null
  };

  //sweep-through all suffixes
  const suffixLoop = function (str = '', suffixes = []) {
    const len = str.length;
    let max = 7;
    if (len <= max) {
      max = len - 1;
    }
    for (let i = max; i > 1; i -= 1) {
      const suffix = str.substr(len - i, len);
      if (suffixes[suffix.length].hasOwnProperty(suffix) === true) {
        // console.log(suffix)
        const tag = suffixes[suffix.length][suffix];
        return tag
      }
    }
    return null
  };

  // decide tag from the ending of the word
  const suffixCheck = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const suffixes = world.model.two.suffixPatterns;
    const term = terms[i];
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

  // guess a gender for each noun
  const nounGender = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const guessGender = world.methods.one.guessGender;
    const { tags } = terms[i];
    if (tags.has('Noun') && !tags.has('MaleNoun') && !tags.has('FemaleNoun')) {
      const term = terms[i];
      // should these have genders?
      if (tags.has('ProperNoun') || tags.has('Pronoun') || tags.has('Possessive')) {
        return null
      }
      // look for 'le', look for suffix
      const found = guessGender(terms, i);
      if (found) {
        return setTag([term], found, world, false, '3-noun-gender')
      }
    }
    return null
  };

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
  // determiners that give-away the noun's number
  const pluralDets = new Set(['les', 'des', 'ces', 'quelques', 'plusieurs', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs']);
  const singularDets = new Set(['le', 'la', 'un', 'une', 'ce', 'cet', 'cette', 'chaque', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'notre', 'votre', 'leur', 'du']);

  // plural nouns almost always end in s/x/z
  const pluralEnd = /[sxz]$/;

  // guess a plural/singular tag each noun
  const nounPlurals = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    const tags = term.tags;
    const str = term.implicit || term.normal || term.text || '';
    if (tags.has('Noun')) {
      if (tags.has('Pronoun') || tags.has('ProperNoun') || tags.has('Uncountable') || tags.has('Date') || tags.has('Possessive')) {
        return null
      }
      // 'les chevaux', 'le prix' - trust the determiner over any suffix-guess
      if (terms[i - 1]) {
        const lastStr = terms[i - 1].implicit || terms[i - 1].normal;
        if (pluralDets.has(lastStr)) {
          return setTag([term], 'PluralNoun', world, false, '3-plural-det')
        }
        if (singularDets.has(lastStr)) {
          return setTag([term], 'Singular', world, false, '3-singular-det')
        }
      }
      if (exceptions.has(str)) {
        return setTag([term], 'Singular', world, false, '3-plural-guess')
      }
      if (str.endsWith('s') && !str.endsWith('is')) {
        return setTag([term], 'PluralNoun', world, false, '3-plural-guess')
      }
      // 'chien', 'maison' - no plural-looking ending
      if (!pluralEnd.test(str)) {
        return setTag([term], 'Singular', world, false, '3-singular-guess')
      }
    }
    return null
  };

  // guess a plural/singular tag each Adjective
  const adjPlurals = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    const tags = term.tags;
    const str = term.implicit || term.normal || term.text || '';
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

  // maître
  // traître

  const guessGender$1 = function (str) {
    // female singular
    if (/[eë]$/.test(str)) {
      return 'f'
    }
    // female plurals
    const suffixes = [
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
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    const tags = term.tags;
    if (tags.has('Adjective') && !tags.has('FemaleAdjective') && !tags.has('#MaleAdjective')) {
      const str = term.implicit || term.normal || term.text || '';
      // i actually think there are no exceptions.
      if (guessGender$1(str) === 'f') {
        return setTag([term], 'FemaleAdjective', world, false, '3-adj-gender')
      } else {
        return setTag([term], 'MaleAdjective', world, false, '3-adj-gender')
      }
    }
    return null
  };

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
    'Imperfect',
    'Modal',
    'Auxiliary',
    'PerfectTense',
    'Pluperfect',
    'ConditionalVerb',
    'FutureTense',
  ];


  const whichTense = [

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

    // passé simple
    ['âmes', 'PastSimple'],
    ['âtes', 'PastSimple'],
    ['èrent', 'PastSimple'],
    ['irent', 'PastSimple'],
    ['urent', 'PastSimple'],

    // imparfait
    // note: no 'ient' here - it matches present-tense 'vient/tient'
    ['aient', 'Imperfect'],
    ['ais', 'Imperfect'],
    ['ait', 'Imperfect'],
    ['ions', 'Imperfect'],
    ['iez', 'Imperfect'],

    // past-participle
    ['ées', 'PastParticiple'],
    ['és', 'PastParticiple'],
    ['ée', 'PastParticiple'],
    ['é', 'Participle'],
    ['u', 'Participle'],//entendu
  ];


  // guess a tense tag each Verb
  const verbTense = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    const tags = term.tags;
    if (tags.has('Verb')) {
      // console.log(term)
      const str = term.implicit || term.normal || term.text || '';
      // if we have no tense
      if (!tenses.find(s => tags.has(s))) {
        const found = whichTense.find(a => str.endsWith(a[0]));
        if (found) {
          setTag([term], found[1], world, false, '3-tense-suffix-' + found[1]);
        } else {
          setTag([term], 'PresentTense', world, false, '3-tense-fallback');
        }
      }
    }
    return null
  };

  const person = ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural'];

  const whichForm = [
    // future
    ['ai', 'FirstPerson'],
    ['âmes', 'FirstPersonPlural'],
    ['âtes', 'SecondPersonPlural'],
    ['èrent', 'ThirdPersonPlural'],
    // imperfect
    ['ait', 'ThirdPerson'],
    // futur
    ['eras', 'SecondPerson'],
    ['eront', 'ThirdPersonPlural'],
    // subjonctif imparfait
    ['asse', 'FirstPerson'],
    ['asses', 'SecondPerson'],
    ['ât', 'ThirdPerson'],
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
    on: 'ThirdPerson',
    nous: 'FirstPersonPlural',
    vous: 'SecondPersonPlural',
    ils: 'ThirdPersonPlural',
    elles: 'ThirdPersonPlural',
  };
  // words that sit between a subject-pronoun and its verb
  // (nous/vous are included - as clitics in 'elle nous invite')
  const skippable = new Set(['le', 'la', 'les', 'lui', 'leur', 'me', 'te', 'se', 'nous', 'vous', 'y', 'en']);
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
    // imperfect être
    'était': 'ThirdPerson',
    'étions': 'FirstPersonPlural',
    'étiez': 'SecondPersonPlural',
    'étaient': 'ThirdPersonPlural',
    fut: 'ThirdPerson',

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
    const setTag = world.methods.one.setTag;
    const term = terms[i];
    const tags = term.tags;
    if (tags.has('Verb') && !tags.has('Infinitive')) {
      // console.log(term)
      const str = term.implicit || term.normal || term.text || '';
      // an adjacent subject beats the lexicon's person-tag
      // (shared surface-forms like 'parle' get tagged first-person by default)
      const existing = person.find(s => tags.has(s));
      if (existing) {
        // walk back over 'ne' and object clitics - 'elle ne le mange pas'
        let at = i - 1;
        while (terms[at] && (terms[at].tags.has('Negative') || skippable.has(terms[at].implicit || terms[at].normal))) {
          at -= 1;
        }
        const prev = terms[at];
        if (prev && prev.tags.has('Pronoun')) {
          const s = prev.implicit || prev.normal;
          if (pronouns.hasOwnProperty(s) && pronouns[s] !== existing) {
            person.forEach(p => term.tags.delete(p));
            setTag([term], pronouns[s], world, false, '3-person-agreement');
          }
        } else if (existing === 'FirstPerson' && prev && prev.tags.has('Noun') && !prev.tags.has('Pronoun')) {
          // 'Marie habite' - a noun subject means third-person
          const want = prev.tags.has('PluralNoun') ? 'ThirdPersonPlural' : 'ThirdPerson';
          person.forEach(p => term.tags.delete(p));
          setTag([term], want, world, false, '3-person-noun-agreement');
        }
        return null
      }
      // if we have no person-tag
      if (!person.find(s => tags.has(s))) {
        // look at the word suffix, for clues
        const found = whichForm.find(a => str.endsWith(a[0]));
        if (found) {
          return setTag([term], found[1], world, false, '3-person-suffix-' + found[1])
        }
        //look backwards for clues
        for (let back = 0; back < 3; back += 1) {
          if (!terms[i - back]) {
            break
          }
          const s = terms[i - back].normal;
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

  // const dateWords = new Set('en', 'entre', 'depuis', 'courant', 'pendant', 'dans', 'lorsque', 'avant', 'après')

  // guess a gender for each noun
  const numberTags = function (terms, i, world) {
    const setTag = world.methods.one.setTag;
    const { tags } = terms[i];
    // tag some values as a year
    if (tags.has('Cardinal') && tags.has('NumericValue')) {
      const term = terms[i];
      const n = Number(term.text);
      if (n && n > 1600 && n < 2090 && n === parseInt(n, 10)) {
        return setTag([term], 'Year', world, false, '3-year')
      }
    }
    return null
  };

  // the match-engine looks at term.machine, so it must agree with our new guess
  const setImplicit = function (term, word) {
    term.implicit = word;
    term.machine = word;
  };

  // better guesses for 'le/la/les' in l'foo
  const fixContractions = function (terms, i) {
    const term = terms[i];
    if (term.implicit === 'le' || term.implicit === 'la') {
      const nextTerm = terms[i + 1];
      if (!nextTerm) {
        return null
      }
      if (nextTerm.tags.has('MaleNoun')) {
        setImplicit(term, 'le');
      } else if (nextTerm.tags.has('FemaleNoun')) {
        setImplicit(term, 'la');
      }
      if (nextTerm.tags.has('PluralNoun')) {
        setImplicit(term, 'les');
      }
    }
    return null
  };

  // these methods don't care about word-neighbours
  const firstPass = function (terms, world) {
    for (let i = 0; i < terms.length; i += 1) {
      //  is it titlecased?
      let found = titleCaseNoun(terms, i, world);
      // try look-like rules
      found = found || checkRegex(terms, i, world);
      // turn '1993' into a year
      tagYear(terms, i, world);
    }
  };
  const secondPass = function (terms, world) {
    for (let i = 0; i < terms.length; i += 1) {
      let found = isAcronym(terms, i, world);
      found = found || suffixCheck(terms, i, world);
      found = found || tagNeighbours(terms, i, world);
      found = found || nounFallback(terms, i, world);
    }
  };
  const thirdPass = function (terms, world) {
    for (let i = 0; i < terms.length; i += 1) {
      nounGender(terms, i, world);
      nounPlurals(terms, i, world);
      adjPlurals(terms, i, world);
      adjGender(terms, i, world);
      verbTense(terms, i, world);
      verbForm(terms, i, world);
      numberTags(terms, i, world);
    }
    // (4th pass)
    for (let i = 0; i < terms.length; i += 1) {
      fixContractions(terms, i);
    }
  };


  const tagger = function (view) {
    const world = view.world;
    view.docs.forEach(terms => {
      firstPass(terms, world);
      secondPass(terms, world);
      thirdPass(terms, world);
    });
    return view
  };

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
      const aKids = kids.length;
      kids = tagSet[b].children || [];
      const bKids = kids.length;
      return aKids - bKids
    });
    return tags
  };

  const tagRank = function (view) {
    const { document, world } = view;
    const tagSet = world.model.one.tagSet;
    document.forEach(terms => {
      terms.forEach(term => {
        const tags = Array.from(term.tags);
        term.tagRank = sortByKids(tags, tagSet);
      });
    });
  };

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

    [/^[012]?[0-9]h$/i, 'Time', '04h'],
    [/^[012]?[0-9]h[0-9]{2}$/i, 'Time', '23h30'],
    [/^'[0-9]{2}$/, 'Year'],
    // times
    [/^[012]?[0-9](:[0-5][0-9])(:[0-5][0-9])$/, 'Time', '3:12:31'],
    [/^[012]?[0-9](:[0-5][0-9])?(:[0-5][0-9])$/, 'Time', '1:12'],

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
    [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?(e|er|re|nde?|i?[eè]me|[eè]re)s?$/, ['Ordinal', 'NumericValue'], '2ème'],
    // .73th
    [/^\.[0-9]+\+?$/, ['Cardinal', 'NumericValue'], '.73th'],
    //percent
    [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?%\+?$/, ['Percent', 'Cardinal', 'NumericValue'], '-4%'],
    [/^\.[0-9]+%$/, ['Percent', 'Cardinal', 'NumericValue'], '.3%'],
    //degrees
    [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?°[cf]?$/i, ['Cardinal', 'NumericValue'], '20°'],
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

  const masc = new Set(['le', 'un', 'du']);
  const femme = new Set(['la', 'une']);

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
    const str = term.normal;
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
      const term = terms[i - n];
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
      const term = terms[i + n];
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
    const { tags } = terms[i];
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

  var methods = { one: { guessGender } };

  var preTagger = {
    compute: {
      preTagger: tagger,
      tagRank
    },
    methods,
    model: {
      two: model
    },
    hooks: ['preTagger']
  };

  const tagNoun = function (m) {
    const world = m.world;
    m.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        nounGender(terms, i, world);
        nounPlurals(terms, i, world);
      });
    });
  };
  const tagAdj = function (m) {
    const world = m.world;
    m.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        adjGender(terms, i, world);
        adjPlurals(terms, i, world);
      });
    });
  };
  const tagVerb = function (m) {
    const world = m.world;
    m.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        verbTense(terms, i, world);
      });
    });
  };

  // verbs that form the passé composé with être, in participle form
  const etreParticiples = [
    'allé', 'arrivé', 'parti', 'venu', 'devenu', 'revenu', 'rentré', 'retourné',
    'resté', 'tombé', 'monté', 'descendu', 'né', 'mort', 'sorti', 'entré', 'passé',
  ].map(w => [w, w + 'e', w + 's', w + 'es']).flat().join('|');

  const etreForms = 'suis|es|est|sommes|êtes|etes|sont|étais|était|étions|étiez|étaient|serai|seras|sera|serons|serez|seront|serais|serait|serions|seriez|seraient';

  const postTagger$1 = function (doc) {
    // ==Nouns==
    // l'inconnu
    doc.match('(le|un) [#Verb]', 0).tag(['MaleNoun', 'Singular'], 'le-verb');
    doc.match('(la|une) [#Verb]', 0).tag(['FemaleNoun', 'Singular'], 'la-verb');
    // ton devoir, son dîner - substantivized infinitive after a possessive
    doc.match('(mon|ton|son|ma|ta|sa|notre|votre|leur) [#Infinitive]', 0).tag(['Noun', 'Singular'], 'possessive-infinitive');
    // des chevaux, les gâteaux - plural-determiner before a mistagged '-aux' adjective
    tagNoun(doc.match('(les|des|ces|mes|tes|ses|nos|vos|leurs) [#Adjective]$', 0).tag('PluralNoun', 'les-adj-end'));
    tagNoun(doc.match('(les|des|ces|mes|tes|ses|nos|vos|leurs) [#Adjective] (#Preposition|#Verb)', 0).tag('PluralNoun', 'les-adj-prep'));
    // substantivized adjectives - 'l'inconnu', 'le rouge'
    tagNoun(doc.match('(le|la|les|un|une) [#Adjective]$', 0).tag('Noun', 'le-adj-end'));
    tagNoun(doc.match('(le|la|les|un|une) [#Adjective] (#Preposition|#Verb)', 0).tag('Noun', 'le-adj-prep'));
    tagNoun(doc.match('(quelques|quelque) [#Verb]', 0).tag('Noun', 'quelque-verb'));
    tagNoun(doc.match('(des|les|mes|ces|tes|ses|nos|vos|leurs) [#Verb]', 0).tag('PluralNoun', 'des-verb'));

    // ==Determiners==
    // ce soir, ce film
    doc.match('[ce] (#Noun && !#Pronoun)', 0).tag('Determiner', 'ce-noun');

    // ==Verbs==
    // il fait beau
    doc.match('(je|tu|il|elle|on|qui|cela|ça|ne) [fait]', 0).tag(['PresentTense', 'ThirdPerson'], 'il-fait');
    // a fait, ont dit - common participles that the lexicon tags as nouns/adjectives
    doc.match('(ai|as|a|avons|avez|ont) #Adverb?+ [(fait|dit|mis|pris|vu|eu|été|cru|su|dû|pu|lu)]', 0).tag(['PastTense', 'PastParticiple'], 'have-participle');
    // est-ce que
    doc.match('est ce (que|qui)').tag('QuestionWord', 'est-ce-que');
    // ne foo pas
    tagVerb(doc.match('ne [.] pas', 0).tag('Verb', 'ne-verb-pas'));
    // il active le
    tagVerb(doc.match('il [.] (le|la|les)', 0).tag('Verb', 'il-verb-le'));
    // reflexive
    tagVerb(doc.match('(se|me|te) [.]', 0).tag('Verb', 'se-noun'));
    // tu finis - an adjective can't directly follow a subject-pronoun
    tagVerb(doc.match('(je|tu|il|elle|on|nous|vous|ils|elles) #Negative? [#Adjective]', 0).tag('Verb', 'pronoun-adj'));
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
    // passé composé with être - 'ils sont arrivés' (after the passive rule, so these don't tag as Passive)
    doc.match(`(${etreForms}) #Adverb?+ [(${etreParticiples})]`, 0).tag(['PastTense', 'PastParticiple'], 'etre-participle');
    // reflexive passé composé - 'ils se sont levés'
    doc.match(`(me|te|se|nous|vous) (${etreForms}) #Adverb?+ [/(ée?|ie?|ue?)s?$/]`, 0).tag(['PastTense', 'PastParticiple'], 'reflexive-past');
    // modal + infinitive - 'je peux le faire'
    doc.match('(peux|peut|pouvez|pouvons|peuvent|veux|veut|voulez|voulons|veulent|dois|doit|devons|devez|doivent|vais|vas|va|allons|allez|vont|faut|sais|sait|savons|savez|savent) (le|la|les|me|te|se|nous|vous|lui|leur|y|en)? [(faire|être|avoir|savoir|pouvoir|devoir|dire|voir|boire|vivre|rire|partir|venir|aller)]', 0).tag('Infinitive', 'modal-infinitive');

    // ==Adjectives==
    // est bien calculée
    tagAdj(doc.match('#Copula (bien|très|pas|plus|tant|presque|seulement)+ [#Verb]', 0).tag('Adjective', 'est-bein-calculee'));

    // ==Numbers==
    // 50 euros, 50 €
    doc.match('[#Value] #Currency', 0).tag('Money', 'value-currency');
    // vingt et une pommes
    doc.match('#Cardinal et (un|une|#Value)').tag('TextValue', 'et-un');
    doc.match('#Value un').tag('TextValue', 'quatre-vingt-un');
    doc.match('moins #Value').tag('TextValue', 'moins-value');
    // le premier jour, premier ministre - but a lone 'premier' stays an adjective
    doc.match('(#Determiner|#Possessive|#Preposition|#Value) [/^premi(er|[eè]re)s?$/]', 0).tag(['TextValue', 'Ordinal'], 'le-premier');
    doc.match('[/^premi(er|[eè]re)s?$/] (#Noun|#Value)', 0).tag(['TextValue', 'Ordinal'], 'premier-noun');
    // a lone 'un chat' is a count - anywhere else, 'un' is an article
    doc.match('^[(un|une)] #Noun$', 0).tag(['TextValue', 'Cardinal'], 'un-noun');
    // trois quarts, deux tiers
    doc.match('#Cardinal [(demi|demis|tiers|quart|quarts)]', 0).tag(['TextValue', 'Fraction'], 'trois-quarts');
    // un quart de, un tiers des - and 'un quart', but 'un tiers' is often a person
    const frac = doc.match('(un|une) (demi|tiers|quart) (de|du|des)').concat(doc.match('(un|une) (demi|quart)$'));
    frac.match('^.').tag(['TextValue', 'Cardinal'], 'un-quart');
    frac.match('^. [.]', 0).tag(['TextValue', 'Fraction'], 'un-quart');
    // un pour cent - 'un' is a count here
    doc.match('[(un|une)] pour cent', 0).tag(['TextValue', 'Cardinal'], 'un-pour-cent');
    // cinquante pour cent - but 'dix pour cent mille'
    const pc = doc.match('#Value [pour cent]', 0).filter(m => !m.lookAhead('^#Value').found);
    pc.unTag('Value').tag('Unit', 'pour-cent');
    // the number of a percentage - '50 %' is like '50%'
    pc.lookBehind('#Value+$').tag('Percent', 'value-pour-cent');
    doc.match('[#Value+] /^(%|pourcents?|percent)$/', 0).tag('Percent', 'value-percent');

    // ==Dates==
    // 'sept' is the number 7, unless it sits in a date
    // le 5 sept
    doc.match('#NumericValue [sept]', 0).tag('Month', 'num-sept');
    doc.match('le #Value [sept]$', 0).tag('Month', 'val-sept');
    doc.match('[sept] #Year', 0).tag('Month', 'sept-year');
    doc.match('[sept] (et|ou) #Month', 0).tag('Month', 'sept-et-month');
    doc.match('#Month (et|ou) [sept]', 0).tag('Month', 'month-et-sept');
    doc.match('[#Value] #Month', 0).tag('Date', 'val-month');
    doc.match('#Month [#Value] #Year', 0).tag('Date', 'mdy');
    doc.match('[#Value] #Month #Year', 0).tag('Date', 'dmy');
    // // sept-et-jun
    // doc.match('#Date [et] #Date', 0).tag('Date', 'date-et-date')
    // // courant juin
    // doc.match('(en|entre|depuis|courant|pendant|dans|lorsque|avant|après) #Date').tag('Date', 'depuis-date')
    // // jusque'en juin
    // doc.match('jusque (en|à) #Date').tag('Date', 'jusque-date')
    // // au cours de juin
    // doc.match('au cours de #Date').tag('Date', 'au-cours-de-date')

    // re-derive tense + person for verbs the rules above created,
    // with their real neighbours visible (the tagVerb slices can't see them)
    const world = doc.world;
    doc.docs.forEach(terms => {
      terms.forEach((_t, i) => {
        verbTense(terms, i, world);
        verbForm(terms, i, world);
      });
    });
  };

  var postTagger = {
    compute: {
      postTagger: postTagger$1
    },
    hooks: ['postTagger']
  };

  const entity = ['Person', 'Place', 'Organization'];

  var nouns$1 = {
    Noun: {
      aliases: [null, 'Nom'],
      not: ['Verb', 'Adjective', 'Adverb', 'Value', 'Determiner'],
    },
    Singular: {
      aliases: [null, 'Singulier'],
      is: 'Noun',
      not: ['PluralNoun'],
    },
    ProperNoun: {
      aliases: [null, 'NomPropre'],
      is: 'Noun',
    },
    Person: {
      aliases: [null, 'Personne'],
      is: 'Singular',
      also: ['ProperNoun'],
      not: ['Place', 'Organization', 'Date'],
    },
    FirstName: {
      aliases: [null, 'Prénom'],
      is: 'Person',
    },
    MaleName: {
      aliases: [null, 'PrénomMasculin'],
      is: 'FirstName',
      not: ['FemaleName', 'LastName'],
    },
    FemaleName: {
      aliases: [null, 'PrénomFéminin'],
      is: 'FirstName',
      not: ['MaleName', 'LastName'],
    },
    LastName: {
      aliases: [null, 'NomDeFamille'],
      is: 'Person',
      not: ['FirstName'],
    },
    Honorific: {
      aliases: [null, 'Titre'],
      is: 'Noun',
      not: ['FirstName', 'LastName', 'Value'],
    },
    Place: {
      aliases: [null, 'Lieu'],
      is: 'Singular',
      not: ['Person', 'Organization'],
    },
    Country: {
      aliases: [null, 'Pays'],
      is: 'Place',
      also: ['ProperNoun'],
      not: ['City'],
    },
    City: {
      aliases: [null, 'Ville'],
      is: 'Place',
      also: ['ProperNoun'],
      not: ['Country'],
    },
    Region: {
      aliases: [null, 'Région'],
      is: 'Place',
      also: ['ProperNoun'],
    },
    Address: {
      aliases: [null, 'Adresse'],
      // is: 'Place',
    },
    Organization: {
      aliases: [null, 'Organisation'],
      is: 'ProperNoun',
      not: ['Person', 'Place'],
    },
    SportsTeam: {
      aliases: [null, 'Équipe'],
      is: 'Organization',
    },
    School: {
      aliases: [null, 'École'],
      is: 'Organization',
    },
    Company: {
      aliases: [null, 'Entreprise'],
      is: 'Organization',
    },
    PluralNoun: {
      aliases: [null, 'Pluriel', 'Plural'],
      is: 'Noun',
      not: ['Singular'],
    },
    Uncountable: {
      aliases: [null, 'Indénombrable'],
      is: 'Noun',
    },
    Pronoun: {
      aliases: [null, 'Pronom'],
      is: 'Noun',
      not: entity,
    },
    Actor: {
      is: 'Noun',
      not: entity,
    },
    Activity: {
      aliases: [null, 'Activité'],
      is: 'Noun',
      not: ['Person', 'Place'],
    },
    Unit: {
      aliases: [null, 'Unité'],
      is: 'Noun',
      not: entity,
    },
    Demonym: {
      aliases: [null, 'Gentilé'],
      is: 'Noun',
      also: ['ProperNoun'],
      not: entity,
    },
    Possessive: {
      aliases: [null, 'Possessif'],
      is: 'Noun',
    },
    // german genders
    MaleNoun: {
      aliases: [null, 'NomMasculin'],
      is: 'Noun',
      not: ['FemaleNoun'],
    },
    FemaleNoun: {
      aliases: [null, 'NomFéminin'],
      is: 'Noun',
      not: ['MaleNoun'],
    },
  };

  var verbs$1 = {
    Verb: {
      aliases: [null, 'Verbe'],
      not: ['Noun', 'Adjective', 'Adverb', 'Value', 'Expression'],
    },
    PresentTense: {
      aliases: [null, 'Présent'],
      is: 'Verb',
      not: ['PastTense'],
    },
    Infinitive: {
      aliases: [null, 'Infinitif'],
      is: 'PresentTense',
      not: ['Gerund'],
    },
    Imperative: {
      aliases: [null, 'Impératif'],
      is: 'Infinitive',
    },
    Gerund: {
      aliases: [null, 'Gérondif'],
      is: 'PresentTense',
      not: ['Copula'],
    },
    PastTense: {
      aliases: [null, 'Passé'],
      is: 'Verb',
      not: ['PresentTense', 'Gerund'],
    },
    Copula: {
      aliases: [null, 'Copule'],
      is: 'Verb',
    },
    Modal: {
      is: 'Verb',
      not: ['Infinitive'],
    },
    PerfectTense: {
      aliases: [null, 'PasséComposé'],
      is: 'Verb',
      not: ['Gerund'],
    },
    Pluperfect: {
      aliases: [null, 'PlusQueParfait'],
      is: 'Verb',
    },
    Participle: {
      aliases: [null, 'Participe'],
      is: 'PastTense',
    },
    PhrasalVerb: {
      is: 'Verb',
    },
    Passive: {
      aliases: [null, 'Passif'],
      is: 'PastTense',
    },
    Particle: {
      is: 'PhrasalVerb',
      not: ['PastTense', 'PresentTense', 'Copula', 'Gerund'],
    },
    Auxiliary: {
      aliases: [null, 'Auxiliaire'],
      is: 'Verb',
      not: ['PastTense', 'PresentTense', 'Gerund', 'Conjunction'],
    },

    // french verb forms
    PresentParticiple: {
      aliases: [null, 'ParticipePrésent'],
      is: 'PresentTense',
      not: ['PastTense', 'FutureTense'],
    },
    PastParticiple: {
      aliases: [null, 'ParticipePassé'],
      is: 'PastTense',
      not: ['PresentTense', 'FutureTense'],
    },
    // [only formal]  parlai, parlâmes
    PastSimple: {
      aliases: [null, 'PasséSimple'],
      is: 'PastTense',
      not: ['PresentTense', 'FutureTense'],
    },
    // imparfait - parlais, parlait
    Imperfect: {
      aliases: [null, 'Imparfait'],
      is: 'PastTense',
      not: ['PresentTense', 'FutureTense'],
    },
    // parlerais, voudrait
    ConditionalVerb: {
      aliases: [null, 'Conditionnel'],
      is: 'Verb',
      not: ['PresentTense', 'PastTense', 'FutureTense'],
    },
    FutureTense: {
      aliases: [null, 'Futur'],
      is: 'Verb',
      not: ['PresentTense', 'PastTense', 'Gerund'],
    },

    // 
    FirstPerson: {
      aliases: [null, 'PremièrePersonne'],
      is: 'Verb',
      not: ['SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    SecondPerson: {
      aliases: [null, 'DeuxièmePersonne'],
      is: 'Verb',
      not: ['FirstPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    ThirdPerson: {
      aliases: [null, 'TroisièmePersonne'],
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'FirstPersonPlural', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    FirstPersonPlural: {
      aliases: [null, 'PremièrePersonnePluriel'],
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'SecondPersonPlural', 'ThirdPersonPlural']
    },
    SecondPersonPlural: {
      aliases: [null, 'DeuxièmePersonnePluriel'],
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'ThirdPersonPlural']
    },
    ThirdPersonPlural: {
      aliases: [null, 'TroisièmePersonnePluriel'],
      is: 'Verb',
      not: ['FirstPerson', 'SecondPerson', 'ThirdPerson', 'FirstPersonPlural', 'SecondPersonPlural']
    },
  };

  var values = {
    Value: {
      aliases: [null, 'Nombre'],
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
      aliases: [null, 'ChiffreRomain'],
      is: 'Cardinal',
      not: ['TextValue'],
    },
    TextValue: {
      aliases: [null, 'Numéral'],
      is: 'Value',
      not: ['NumericValue'],
    },
    NumericValue: {
      aliases: [null, 'Numérique'],
      is: 'Value',
      not: ['TextValue'],
    },
    Money: {
      aliases: [null, 'Argent'],
      is: 'Cardinal',
    },
    Percent: {
      aliases: [null, 'Pourcentage'],
      is: 'Value',
    },
  };

  var dates = {
    Date: {
      not: ['Verb', 'Adverb', 'Adjective'],
    },
    Month: {
      aliases: [null, 'Mois'],
      is: 'Singular',
      also: ['Date'],
      not: ['Year', 'WeekDay', 'Time'],
    },
    WeekDay: {
      aliases: [null, 'JourDeLaSemaine'],
      is: 'Noun',
      also: ['Date'],
    },
    Year: {
      aliases: [null, 'Année'],
      is: 'Date',
      not: ['RomanNumeral'],
    },
    FinancialQuarter: {
      aliases: [null, 'Trimestre'],
      is: 'Date',
      not: 'Fraction',
    },
    // 'easter'
    Holiday: {
      aliases: [null, 'JourFérié'],
      is: 'Date',
      also: ['Noun'],
    },
    // 'summer'
    Season: {
      aliases: [null, 'Saison'],
      is: 'Date',
    },
    Timezone: {
      aliases: [null, 'FuseauHoraire'],
      is: 'Noun',
      also: ['Date'],
      not: ['ProperNoun'],
    },
    Time: {
      aliases: [null, 'Heure'],
      is: 'Date',
      not: ['AtMention'],
    },
    // 'months'
    Duration: {
      aliases: [null, 'Durée'],
      is: 'Noun',
      also: ['Date'],
    },
  };

  const anything = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value', 'QuestionWord'];

  var misc = {
    Adjective: {
      aliases: [null, 'Adjectif'],
      not: ['Noun', 'Verb', 'Adverb', 'Value'],
    },
    Comparable: {
      is: 'Adjective',
    },
    Comparative: {
      aliases: [null, 'Comparatif'],
      is: 'Adjective',
    },
    Superlative: {
      aliases: [null, 'Superlatif'],
      is: 'Adjective',
      not: ['Comparative'],
    },
    MaleAdjective: {
      aliases: [null, 'AdjectifMasculin'],
      is: 'Adjective',
      not: ['FemaleAdjective'],
    },
    FemaleAdjective: {
      aliases: [null, 'AdjectifFéminin'],
      is: 'Adjective',
      not: ['MaleAdjective'],
    },
    PluralAdjective: {
      aliases: [null, 'AdjectifPluriel'],
      is: 'Adjective',
    },
    NumberRange: {
      aliases: [null, 'PlageNumérique'],
    },
    Adverb: {
      aliases: [null, 'Adverbe'],
      not: ['Noun', 'Verb', 'Adjective', 'Value'],
    },

    Determiner: {
      aliases: [null, 'Déterminant', 'Article'],
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord', 'Conjunction', 'Preposition'], //allow 'a' to be a Determiner/Value
    },
    Conjunction: {
      aliases: [null, 'Conjonction'],
      not: anything,
    },
    Preposition: {
      aliases: [null, 'Préposition'],
      not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'QuestionWord'],
    },
    QuestionWord: {
      aliases: [null, 'MotInterrogatif'],
      not: ['Determiner'],
    },
    Currency: {
      aliases: [null, 'Devise'],
      is: 'Noun',
    },
    Expression: {
      aliases: [null, 'Interjection'],
      not: ['Noun', 'Adjective', 'Verb', 'Adverb'],
    },
    Abbreviation: {
      aliases: [null, 'Abréviation'],
    },
    Url: {
      not: ['HashTag', 'PhoneNumber', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
    },
    PhoneNumber: {
      aliases: [null, 'Téléphone'],
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention', 'Email'],
    },
    HashTag: {},
    AtMention: {
      aliases: [null, 'Mention'],
      is: 'Noun',
      not: ['HashTag', 'Email'],
    },
    Emoji: {
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Emoticon: {
      aliases: [null, 'Émoticône'],
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Email: {
      aliases: [null, 'Courriel'],
      not: ['HashTag', 'Verb', 'Adjective', 'Value', 'AtMention'],
    },
    Acronym: {
      aliases: [null, 'Acronyme'],
      not: ['PluralNoun', 'RomanNumeral'],
    },
    Negative: {
      aliases: [null, 'Négation'],
      not: ['Noun', 'Adjective', 'Value'],
    },
    Condition: {
      not: ['Verb', 'Adjective', 'Noun', 'Value'],
    },
  };

  const tags = Object.assign({}, nouns$1, verbs$1, values, dates, misc);

  var tagset = {
    tags
  };

  const findNumbers = function (view) {
    let m = view.match('#Value+');
    // 'premier' is never part of a longer number - 'les deux premiers'
    if (m.has('#Ordinal')) {
      m = m.splitOn('/^premi(er|[eè]re)s?$/');
    }

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

  var data = {

    ones: [
      [0, 'zéro', 'zéroième'],
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
      [17, 'dix-sept', 'dix-septième'],
      [18, 'dix-huit', 'dix-huitième'],
      [19, 'dix-neuf', 'dix-neuvième'],
    ],
    tens: [
      [20, 'vingt', 'vingtième'],
      [30, 'trente', 'trentième'],
      [40, 'quarante', 'quarantième'],
      [50, 'cinquante', 'cinquantième'],
      [60, 'soixante', 'soixantième'],
      [70, 'soixante-dix', 'soixante-dixième'],
      [80, 'quatre-vingt', 'quatre-vingtième'],
      [90, 'quatre-vingt-dix', 'quatre-vingt-dixième'],
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
      const [num, w, ord] = a;
      toCardinal[ord] = w;
      toOrdinal[w] = ord;
      toNumber[w] = num;
      // multi-word forms are hyphenated for display,
      // but the parser scans space-joined tokens
      const spaced = w.replace(/-/g, ' ');
      if (spaced !== w) {
        toNumber[spaced] = num;
        toOrdinal[spaced] = ord;
        toCardinal[ord.replace(/-/g, ' ')] = spaced;
      }
      // add ordinal without accents
      const norm = ord.replace(/è/, 'e');
      toNumber[norm] = num;
    });
  });

  // add some more
  Object.assign(toNumber, {
    cents: 100,
    milles: 1000,
    millions: 1000000,
    milliards: 1000000000,
    'quatre vingts': 80,//with the final s
    zero: 0,//unaccented
    une: 1,
  });
  // 'premier' is the ordinal of 'un' - 'unième' is only used in 'vingt et unième'
  'premier,première,premiere'.split(',').forEach(w => {
    toNumber[w] = 1;
    toNumber[w + 's'] = 1;
  });
  // belgian + swiss forms are parsed, but never written
  const regional = { septant: 70, huitant: 80, octant: 80, nonant: 90 };
  Object.keys(regional).forEach(w => {
    toNumber[w + 'e'] = regional[w];
    toNumber[w + 'ième'] = regional[w];
    toNumber[w + 'ieme'] = regional[w];
  });
  // the bottom-half of a written fraction - 'trois quarts'
  const fractions = { demi: 2, demis: 2, tiers: 3, quart: 4, quarts: 4 };

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
    const words = [];
    for (let index = 0; index < 3; index += 1) {
      if (!terms[i + index]) {
        break
      }
      let w = terms[i + index].normal || '';
      if (toCardinal.hasOwnProperty(w)) {
        w = toCardinal[w];
      }
      words.push(w);
      const str = words.join(' ');
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
    let over = 1;
    const sums = [];
    for (let i = 0; i < terms.length; i += 1) {
      const { tags, normal } = terms[i];
      let w = normal || '';
      if (w === 'moins') {
        minus = true;
        continue
      }
      // ... et-un
      if (w === 'et') {
        continue
      }
      // 'trois quarts'
      if (tags.has('Fraction') && fractions.hasOwnProperty(w)) {
        over = fractions[w];
        continue
      }
      // 'huitieme'
      if (tags.has('Ordinal') && toCardinal.hasOwnProperty(w)) {
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
        const { add, skip } = scanAhead(terms, i);
        if (skip > 0) {
          carry += add;
          i += skip;
          continue
        }
      }

      // 'cent'
      if (tags.has('Multiple')) {
        const mult = toNumber[w] || 1;
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
        const n = Number(w);
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
    return sum / over
  };

  // '1er', '1re', '2e', '2nd', '2nde', '2ème', '2ième', '2es'
  // - but not the end of a unit, like '5litres'
  const ordinal = /^([-+]?[0-9][0-9.,]*)(er|re|nde?|i?[eè]me|[eè]re|e)s?$/;

  const fromNumber = function (m) {
    let str = m.text('normal').toLowerCase();
    // '3/4' is 0.75
    const frac = str.match(/^([0-9]+)\/([0-9]+)/);
    if (frac && m.has('#Fraction')) {
      const num = Number(frac[2]) ? Number(frac[1]) / Number(frac[2]) : null;
      return { hasComma: false, hasDecimalComma: false, prefix: '', num, suffix: '' }
    }
    str = str.replace(ordinal, '$1');
    // the core normalizer strips digit-commas ('3,5'->'35'), so recover a
    // french decimal-comma from the raw text ('7,938' keeps its english
    // thousands-group meaning)
    const raw = m.text().toLowerCase().replace(/[.,;!?]+$/, '').trim();
    const hasDecimalComma = /\d,\d/.test(raw) && /,\d{3}([^0-9]|$)/.test(raw) === false;
    if (hasDecimalComma) {
      str = raw.replace(/ /g, '').replace(',', '.');
    }
    // french thousands-groups use spaces - '1 000 000'
    if (/^[-+]?\d{1,3}( \d{3})+$/.test(str)) {
      str = str.replace(/ /g, '');
    }
    let hasComma = false;
    if (/,/.test(str)) {
      hasComma = true;
      str = str.replace(/,/g, '');
    }
    // get prefix/suffix
    const arr = str.split(/([-0-9.,]*)/);
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
      hasDecimalComma,
      prefix,
      num,
      suffix,
    }
  };

  const parseNumber = function (m) {
    const terms = m.docs[0];
    let num = null;
    let prefix = '';
    let suffix = '';
    let hasComma = false;
    let hasDecimalComma = false;
    const isText = m.has('#TextValue');
    if (isText) {
      num = parseNumbers(terms);
    } else {
      const res = fromNumber(m);
      prefix = res.prefix;
      suffix = res.suffix;
      num = res.num;
      hasComma = res.hasComma;
      hasDecimalComma = res.hasDecimalComma;
    }
    return {
      hasComma,
      hasDecimalComma,
      prefix,
      num,
      suffix,
      isText,
      isOrdinal: m.has('#Ordinal'),
      isFraction: m.has('#Fraction'),
      isMoney: m.has('#Money'),
    }
  };

  const onesWord = {};
  data.ones.forEach(a => {
    onesWord[a[0]] = a[1];
  });
  const tensWord = {};
  data.tens.forEach(a => {
    tensWord[a[0]] = a[1];
  });

  const multiples = [
    [1e12, 'mille milliards'],
    [1e9, 'milliard'],
    [1e6, 'million'],
    [1000, 'mille'],
    [1, 'one'],
  ];

  //turn number into an array of magnitudes, like [[5, million], [2, hundred]]
  const getMagnitudes = function (num) {
    let working = num;
    const have = [];
    multiples.forEach(a => {
      if (num >= a[0]) {
        const howmany = Math.floor(working / a[0]);
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

  // turn 0-99 into french words
  // 'vingt' and 'quatre-vingt' take an s only when nothing follows
  const twoDigit = function (num, hasFollowing) {
    // 0-19 (teens are hyphenated in the table)
    if (num < 20) {
      return [onesWord[num]]
    }
    let base = Math.floor(num / 10) * 10;
    let rest = num - base;
    // 70s and 90s borrow from the teens - 'soixante-douze'
    if (base === 70 || base === 90) {
      base -= 10;
      rest += 10;
    }
    const ten = tensWord[base];
    if (rest === 0) {
      // 'quatre-vingts' / 'quatre-vingt mille'
      if (base === 80 && !hasFollowing) {
        return [ten + 's']
      }
      return [ten]
    }
    // 'vingt et un', 'soixante et onze' - but 'quatre-vingt-un'
    if ((rest === 1 || rest === 11) && base !== 80) {
      return [ten, 'et', onesWord[rest]]
    }
    return [ten + '-' + onesWord[rest]]
  };

  // turn 0-999 into french words
  const threeDigit = function (num, hasFollowing) {
    if (num < 100) {
      return twoDigit(num, hasFollowing)
    }
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    let words = [];
    if (hundreds > 1) {
      words = words.concat(twoDigit(hundreds, true));
    }
    // 'deux cents' - but 'deux cent un' / 'deux cent mille'
    if (hundreds > 1 && rest === 0 && !hasFollowing) {
      words.push('cents');
    } else {
      words.push('cent');
    }
    if (rest) {
      words = words.concat(twoDigit(rest, hasFollowing));
    }
    return words
  };

  // turn a number like 80 into words like 'quatre-vingts'
  const toText$1 = function (num) {
    if (num === 0) {
      return ['zéro']
    }
    let words = [];
    if (num < 0) {
      words.push('moins');
      num = Math.abs(num);
    }
    // handle multiples
    const found = getMagnitudes(num);
    found.forEach(obj => {
      if (obj.unit === 'one') {
        words = words.concat(threeDigit(obj.num, false));
        return
      }
      // 'mille' doesn't take 'un', but 'un million' does
      if (obj.num !== 1) {
        words = words.concat(threeDigit(obj.num, true));
      } else if (obj.unit === 'million' || obj.unit === 'milliard') {
        words.push('un');
      }
      let unit = obj.unit;
      // 'deux millions'
      if ((unit === 'million' || unit === 'milliard') && obj.num > 1) {
        unit += 's';
      }
      words.push(unit);
    });
    return words
  };

  const makeSuffix = function (obj) {
    return {
      prefix: obj.prefix || '',
      suffix: obj.suffix || '',
    }
  };

  // 'quatre-vingt-dix-sept' -> 'quatre-vingt-dix-septième'
  const ordinalWord = function (w) {
    if (toOrdinal[w]) {
      return toOrdinal[w]
    }
    // 'quatre-vingts' -> 'quatre-vingtième'
    const noS = w.replace(/s$/, '');
    if (toOrdinal[noS]) {
      return toOrdinal[noS]
    }
    // convert the last hyphenated part
    const parts = w.split('-');
    if (parts.length > 1) {
      const last = parts.pop();
      const ord = toOrdinal[last] || toOrdinal[last.replace(/s$/, '')];
      if (ord) {
        return parts.join('-') + '-' + ord
      }
    }
    return w
  };

  const formatNumber = function (parsed, fmt) {
    const { prefix, suffix } = makeSuffix(parsed);
    // 'premier', '1er' - or 'première', '1re'
    const fem = parsed.num === 1 && parsed.isFemale;
    if (fmt === 'TextOrdinal') {
      if (parsed.num === 1) {
        return prefix + (fem ? 'première' : 'premier') + suffix
      }
      const words = toText$1(parsed.num);
      // 'un million' -> 'millionième'
      if (words.length > 1 && words[0] === 'un' && /^(million|milliard)/.test(words[1])) {
        words.shift();
      }
      const last = words[words.length - 1];
      words[words.length - 1] = ordinalWord(last);
      const num = words.join(' ');
      return `${prefix}${num}${suffix}`
    }
    if (fmt === 'TextCardinal') {
      const num = fem ? 'une' : toText$1(parsed.num).join(' ');
      return `${prefix}${num}${suffix}`
    }
    // numeric formats
    // '55e'
    if (fmt === 'Ordinal') {
      // '1er' or '1re' - but '21e'
      let end = 'e';
      if (parsed.num === 1) {
        end = fem ? 're' : 'er';
      }
      const num = String(parsed.num) + end;
      return `${prefix}${num}${suffix}`
    }
    if (fmt === 'Cardinal') {
      let num = String(parsed.num);
      // '2,5'
      if (parsed.hasDecimalComma) {
        num = num.replace('.', ',');
      }
      return `${prefix}${num}${suffix}`
    }
    const num = String(parsed.num || '');
    return `${prefix}${num}${suffix}`
  };

  // the words for a symbol that is written on a number - '50%', '5€', '$5', '20°'
  // [singular, plural, tag, isFemale]
  const symbols = {
    '%': ['pour cent', 'pour cent', 'Unit'],
    '€': ['euro', 'euros', 'Currency'],
    $: ['dollar', 'dollars', 'Currency'],
    '£': ['livre', 'livres', 'Currency', true],
    '¥': ['yen', 'yens', 'Currency'],
    '°': ['degré', 'degrés', 'Unit'],
    '°c': ['degré Celsius', 'degrés Celsius', 'Unit'],
    '°f': ['degré Fahrenheit', 'degrés Fahrenheit', 'Unit'],
  };

  // 'euros' -> '€' - to find a unit that is already written out
  const fromWord = {};
  Object.keys(symbols).forEach(k => {
    const [single, plural] = symbols[k];
    if (/ /.test(single) === false) {
      fromWord[single] = k;
      fromWord[plural] = k;
    }
  });

  // a unit that can stand as its own word - 'km', 'kg', 'm²'
  const isWord = /^[a-z\u00e0-\u00ffµ]+[²³]?$/i;

  // 'cinq euros', but 'un euro' and 'zéro euro'
  const unitWords = function (key, num) {
    const [single, plural] = symbols[key];
    return Math.abs(num) < 2 ? single : plural
  };

  // parse a number, and remember the gender of 'première', '1re' or 'une'
  // - so that it can be written back in the same gender
  const isFemale = /^(1[eè]?re|premi[eè]re)s?$|^une$/;
  const hasDash = /[-−–]$/;
  const parse = function (val) {
    const obj = parseNumber(val);
    obj.isFemale = isFemale.test(val.text('normal'));
    // the tokenizer keeps the sign of '-5%' apart from the term, as punctuation
    obj.hasDash = !obj.isText && obj.num < 0 && hasDash.test(val.docs[0][0].pre);
    return obj
  };

  // return the nth elem of a doc
  const getNth$3 = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  // turn a number, or a french number-string ('dix', '10'), into a number
  // - returns null if it can't be understood
  const toNum = function (view, n) {
    if (typeof n === 'number') {
      return isNaN(n) ? null : n
    }
    if (typeof n === 'string') {
      const m = view.fromText(n).numbers();
      if (!m.found) {
        return null
      }
      const num = parseNumber(m.eq(0)).num;
      return typeof num === 'number' && !isNaN(num) ? num : null
    }
    return null
  };

  // tags that describe the form of a number - these are set again for each new number
  const formTags = new Set(['Value', 'TextValue', 'NumericValue', 'Cardinal', 'Ordinal', 'Multiple', 'Determiner', 'Year']);

  // find the symbol or unit of a number, and the terms that it is written in.
  // - it may be attached - '50%', '€5', '5km' - or be the next word - '5 €', 'cinquante pour cent'
  const findUnit = function (val, obj) {
    const [n, start, end] = val.fullPointer[0];
    const terms = val.document[n];
    const last = terms[end - 1];
    const next = terms[end];
    // a sign is not a symbol - '+5%', '10+'
    const lead = /^\+/.test(obj.prefix) ? '+' : '';
    const trail = /\+$/.test(obj.suffix) ? '+' : '';
    const prefix = obj.prefix.slice(lead.length);
    const suffix = obj.suffix.slice(0, obj.suffix.length - trail.length);
    if (!obj.isText && (prefix || suffix)) {
      // '5km' is a contraction of two terms - '5km' and an empty 'km'
      const isSplit = Boolean(next && next.text === '' && next.implicit && last.implicit);
      const unit = { attached: true, isSplit, lead, trail, view: isSplit ? val.update([[n, start, end + 1]]) : val };
      // the symbol, in its original case - '20°C', '5 Kg'
      const before = terms[start].text.slice(lead.length, lead.length + prefix.length);
      const behind = last.text.slice(last.text.length - trail.length - suffix.length, last.text.length - trail.length);
      unit.prefix = lead + (before.toLowerCase() === prefix ? before : prefix);
      unit.suffix = (behind.toLowerCase() === suffix ? behind : suffix) + trail;
      if (prefix && suffix) {
        return unit
      }
      if (symbols.hasOwnProperty(prefix || suffix)) {
        unit.key = prefix || suffix;
      } else if (suffix && isWord.test(suffix)) {
        unit.word = unit.suffix.slice(0, suffix.length);
        unit.tag = isSplit ? Array.from(next.tags) : [];
      }
      return unit
    }
    // look at the next word, unless there is some punctuation in the way
    if (!next || !next.text || /\S/.test(last.post + next.pre)) {
      return null
    }
    const unit = { attached: false, view: val.update([[n, start, end + 1]]) };
    // '5 €'
    if (symbols.hasOwnProperty(next.normal)) {
      unit.key = next.normal;
      return unit
    }
    // 'cinq pour cent'
    const after = terms[end + 1];
    if (next.normal === 'pour' && next.tags.has('Unit') && after && after.normal === 'cent' && after.tags.has('Unit')) {
      unit.key = '%';
      unit.isWord = true;
      unit.view = val.update([[n, start, end + 2]]);
      return unit
    }
    // 'cinq euros', 'cinq degrés'
    if (fromWord.hasOwnProperty(next.normal)) {
      unit.key = fromWord[next.normal];
      if (next.tags.has(symbols[unit.key][2]) || unit.key === '°') {
        unit.isWord = true;
        return unit
      }
    }
    return null
  };

  // choose the new text for a number, and for its symbol or unit.
  // a symbol is never left stuck to a word - '50%' is 'cinquante pour cent', and not 'cinquante%'
  // - returns null if this number can't be written like that
  const getPlan = function (val, obj, fmt, toSymbol) {
    const unit = fmt === 'TextCardinal' || fmt === 'Cardinal' ? findUnit(val, obj) : null;
    const plan = { view: val, str: formatNumber(obj, fmt), unitTerms: 0, unitTag: null, inPlace: false };
    if (!unit) {
      return plan
    }
    const bare = Object.assign({}, obj, { prefix: '', suffix: '' });
    if (fmt === 'Cardinal') {
      if (unit.attached) {
        // '5km' -> '6km' - keep both halves of the contraction
        plan.inPlace = unit.isSplit;
        plan.num = formatNumber(bare, fmt);
        plan.str = unit.prefix + plan.num + unit.suffix;
      } else if (toSymbol && unit.isWord && unit.key === '%') {
        // 'cinquante pour cent' -> '50 %'
        plan.view = unit.view;
        plan.str = formatNumber(bare, fmt) + ' %';
        plan.unitTerms = 1;
        plan.unitTag = 'Unit';
      }
      return plan
    }
    // written-out
    let words = null;
    let num = formatNumber(bare, fmt);
    if (unit.key) {
      words = unitWords(unit.key, obj.num);
      plan.unitTag = symbols[unit.key][2];
      // 'une livre', 'vingt et une livres'
      if (symbols[unit.key][3]) {
        num = num.replace(/un$/, 'une');
      }
    } else if (unit.word) {
      words = unit.word;
      plan.unitTag = unit.tag;
    }
    // '#5' or '10+' have no words
    if (!words) {
      return null
    }
    plan.view = unit.view;
    plan.str = (unit.lead || '') + num + ' ' + words + (unit.trail || '');
    plan.unitTerms = words.split(' ').length;
    return plan
  };

  // swap-in the new form of this number, and tag it as the tagger would have.
  // - the terms made by .replaceWith() only get the lexicon + preTagger, and are tagged
  // without their neighbours - so 'un' is a Determiner, the 'et' in 'vingt et un' is a
  // Conjunction, and '.numbers()' can't find them again.
  // (copying the old tags over by position is no better - 'dix septième' is not two ordinals)
  // returns the new number, without its unit
  const replace = function (val, obj, fmt, toSymbol) {
    const plan = getPlan(val, obj, fmt, toSymbol);
    if (!plan || !plan.str) {
      return val
    }
    const first = val.docs[0][0];
    // the sign is written by the number, now
    if (obj.hasDash) {
      first.pre = first.pre.replace(hasDash, '');
    }
    // re-write the first half of '5km', beside its silent 'km'
    if (plan.inPlace) {
      first.text = plan.str;
      first.normal = plan.str.toLowerCase().replace(/,/g, '');
      first.implicit = plan.num;
      first.machine = plan.num;
      return val
    }
    // remember any tags about the role of the number - #Money, #Date
    const keep = Array.from(first.tags).filter(tag => !formTags.has(tag));
    let m = plan.view;
    m.replaceWith(plan.str);
    // split the number from its unit
    if (plan.unitTerms > 0) {
      const [n, start, end] = m.fullPointer[0];
      const unit = m.update([[n, end - plan.unitTerms, end]]);
      unit.unTag('Value');
      unit.tag(plan.unitTag);
      m = m.update([[n, start, end - plan.unitTerms]]);
    }
    const isText = fmt === 'TextCardinal' || fmt === 'TextOrdinal';
    const isOrdinal = fmt === 'Ordinal' || fmt === 'TextOrdinal';
    m.tag(isText ? 'TextValue' : 'NumericValue');
    // only the last word is an ordinal - 'cent vingt et unième'
    const terms = m.terms();
    terms.forEach((term, i) => {
      if (i === terms.length - 1) {
        term.tag(isOrdinal ? 'Ordinal' : 'Cardinal');
      } else if (term.has('#Ordinal')) {
        term.tag('Cardinal');
      }
    });
    if (keep.length > 0) {
      m.tag(keep);
    }
    return m
  };

  // run a change on each number, and keep this view pointing at the new terms
  // - .replaceWith() only repairs the one-match view that it is called on. Without this,
  // the view that the user holds keeps the ids of the deleted terms, and core 'repairs'
  // each of its matches by stretching it out to the end of the sentence.
  // returns the same view, so that every link of a chain stays in sync
  const mutate = function (view, fn) {
    const res = view.map(val => fn(val) || val);
    view.ptrs = res.fullPointer;
    view.uncache();
    return view
  };

  const api$5 = function (View) {
    /**   */
    class Numbers extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Numbers';
      }
      parse(n) {
        return getNth$3(this, n).map(parseNumber, [])
      }
      get(n) {
        return getNth$3(this, n).map(parseNumber, []).map(o => o.num)
      }
      /** json(n) for the nth number, or json(opts) for all of them */
      json(opts, n) {
        if (typeof opts === 'number') {
          n = opts;
          opts = undefined;
        }
        const doc = getNth$3(this, n);
        return doc.map(p => {
          const json = p.toView().json(opts)[0] || {};
          const parsed = parse(p);
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
        return this.growRight('#Unit+').match('#Unit+$')
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
        return mutate(this, val => {
          // leave 'trois quarts' alone
          if (!val.has('#TextValue') || val.has('#Fraction')) {
            return val
          }
          const obj = parse(val);
          if (obj.num === null) {
            return val
          }
          const fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal';
          // 'cinquante pour cent' becomes '50 %'
          return replace(val, obj, fmt, true)
        })
      }
      /** convert to numeric form like 'eight' or 'eighth' */
      toText() {
        return mutate(this, val => {
          if (val.has('#TextValue')) {
            return val
          }
          const obj = parse(val);
          // there are no words for '1,5' or '1/2'
          if (!Number.isInteger(obj.num)) {
            return val
          }
          const fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal';
          return replace(val, obj, fmt)
        })
      }
      /** convert ordinal to cardinal form, like 'eight', or '8' */
      toCardinal() {
        return mutate(this, val => {
          if (!val.has('#Ordinal')) {
            return val
          }
          const obj = parse(val);
          if (obj.num === null) {
            return val
          }
          const fmt = val.has('#TextValue') ? 'TextCardinal' : 'Cardinal';
          return replace(val, obj, fmt)
        })
      }
      /** convert cardinal to ordinal form, like 'eighth', or '8th' */
      toOrdinal() {
        return mutate(this, val => {
          if (val.has('#Ordinal')) {
            return val
          }
          const obj = parse(val);
          // there is no ordinal for '1,5' or 'trois quarts'
          if (!Number.isInteger(obj.num)) {
            return val
          }
          // ... or for an amount - '50%', '5€', '5km', 'cinq euros'
          if (obj.prefix || obj.suffix || val.has('(#Percent|#Money)')) {
            return val
          }
          const fmt = val.has('#TextValue') ? 'TextOrdinal' : 'Ordinal';
          return replace(val, obj, fmt)
        })
      }

      /** return only numbers that are == n */
      isEqual(n) {
        return this.filter((val) => {
          const num = parse(val).num;
          return num === n
        })
      }
      /** return only numbers that are > n*/
      greaterThan(n) {
        return this.filter((val) => {
          const num = parse(val).num;
          return num > n
        })
      }
      /** return only numbers that are < n*/
      lessThan(n) {
        return this.filter((val) => {
          const num = parse(val).num;
          return num < n
        })
      }
      /** return only numbers > min and < max */
      between(min, max) {
        return this.filter((val) => {
          const num = parse(val).num;
          return num > min && num < max
        })
      }
      /** set these number to n */
      set(n) {
        if (n === undefined) {
          return this // don't bother
        }
        // 'dix' -> 10
        n = toNum(this, n);
        if (n === null) {
          return this // not a number
        }
        return mutate(this, val => {
          const obj = parse(val);
          obj.num = n;
          if (obj.num === null) {
            return val
          }
          let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal';
          if (val.has('#TextValue')) {
            fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal';
          }
          return replace(val, obj, fmt)
        })
      }
      add(n) {
        if (!n) {
          return this // don't bother
        }
        // 'deux' -> 2
        n = toNum(this, n);
        if (!n) {
          return this // not a number
        }
        return mutate(this, val => {
          const obj = parse(val);
          if (obj.num === null) {
            return val
          }
          // avoid float noise - 0.1 + 0.2
          const sum = obj.num + n;
          obj.num = Number.isInteger(sum) ? sum : Number(sum.toFixed(10));
          let fmt = val.has('#Ordinal') ? 'Ordinal' : 'Cardinal';
          if (obj.isText) {
            // there are no words for 'trois quarts' + 1
            if (!Number.isInteger(sum)) {
              return val
            }
            fmt = val.has('#Ordinal') ? 'TextOrdinal' : 'TextCardinal';
          }
          return replace(val, obj, fmt)
        })
      }
      /** decrease each number by n*/
      subtract(n) {
        n = toNum(this, n);
        if (!n) {
          return this // not a number
        }
        return this.add(n * -1)
      }
      /** increase each number by 1 */
      increment() {
        return this.add(1)
      }
      /** decrease each number by 1 */
      decrement() {
        return this.add(-1)
      }
      // overloaded - keep Numbers class
      update(pointer) {
        const m = new Numbers(this.document, pointer);
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
      let m = findNumbers(this);
      m = getNth$3(m, n);
      return new Numbers(this.document, m.pointer)
    };
    // alias
    View.prototype.values = View.prototype.numbers;
  };

  var numbers = {
    api: api$5
  };

  const findPeople = function () {
    const m = this.match('#Honorific+? #Person+');
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

  const api$4 = function (View) {
    View.prototype.people = findPeople;
    View.prototype.organizations = findOrgs;
    View.prototype.places = findPlaces;
  };

  var topics = {
    api: api$4
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
    const toVerbs = m.match('(#PresentTense|#PastTense) #Infinitive');
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

  // split adverbs as before/after the root
  const getAdverbs = function (vb, root) {
    const res = {
      pre: vb.none(),
      post: vb.none(),
    };
    if (!vb.has('#Adverb')) {
      return res
    }
    // pivot on the main verb
    const parts = vb.splitOn(root);
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

  const getAuxiliary = function (vb, root) {
    const parts = vb.splitBefore(root);
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
    const str = view.text('root');
    return str
  };

  const parseVerb = function (view) {
    const vb = view.clone();
    // vb.contractions().expand()
    const root = getRoot$2(vb);
    const res = {
      root: root,
      prefix: vb.match('#Prefix'),
      adverbs: getAdverbs(vb, root),
      auxiliary: getAuxiliary(vb, root),
      negative: getNegative(vb),
      // phrasal: getPhrasal(root),
    };
    return res
  };

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
    const parsed = parseVerb(vb);
    vb.clone().toView();
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

  // import getSubject from './parse/getSubject.js'
  // import getGrammar from './parse/grammar/index.js'
  // import toNegative from './conjugate/toNegative.js'
  // import debug from './debug.js'


  // return the nth elem of a doc
  const getNth$2 = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  const formKey = {
    FirstPerson: 'first',
    SecondPerson: 'second',
    ThirdPerson: 'third',
    FirstPersonPlural: 'firstPlural',
    SecondPersonPlural: 'secondPlural',
    ThirdPersonPlural: 'thirdPlural',
  };
  // which person is this verb conjugated in?
  const getForm = function (vb) {
    const terms = vb.docs[0] || [];
    const term = terms.find(t => t.tags.has('Verb'));
    if (term) {
      const found = Object.keys(formKey).find(k => term.tags.has(k));
      if (found) {
        return formKey[found]
      }
    }
    return 'third'
  };

  // infinitive of the phrase's main verb - 'a mangé' -> 'manger'
  const getMainRoot = function (vb) {
    vb.compute('root');
    let m = vb.match('#Verb').not('(#Auxiliary|#Negative|#Adverb)');
    if (!m.found) {
      m = vb.match('#Verb');
    }
    return m.last().text('root')
  };

  const elidable = { je: `j'`, ne: `n'`, que: `qu'`, se: `s'`, me: `m'`, te: `t'`, le: `l'`, la: `l'`, de: `d'` };
  const startsVowel = /^[aeiouyhâàéèêëîïôöùûü]/;
  // re-apply french elision after a replacement - 'je avais' -> "j'avais"
  const elide = function (view) {
    const ptr = view.fullPointer[0];
    if (!ptr) {
      return view
    }
    const [n, start] = ptr;
    const terms = view.document[n] || [];
    const prev = terms[start - 1];
    const term = terms[start];
    if (!prev || !term || !term.text) {
      return view
    }
    if (elidable.hasOwnProperty(prev.normal) && prev.post === ' ' && startsVowel.test(term.text.toLowerCase())) {
      // keep the un-elided form findable by the match-engine
      prev.implicit = prev.implicit || prev.normal;
      prev.machine = prev.machine || prev.normal;
      prev.text = elidable[prev.normal];
      prev.post = '';
      prev.dirty = true;
    }
    return view
  };

  const api$3 = function (View) {
    class Verbs extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Verbs';
      }
      parse(n) {
        return getNth$2(this, n).map(parseVerb, [])
      }
      json(opts, n) {
        const m = getNth$2(this, n);
        const arr = m.map(vb => {
          const json = vb.toView().json(opts)[0] || {};
          json.verb = toJSON(vb);
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
      toPresentTense(n) {
        const methods = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          const form = getForm(vb);
          const str = getMainRoot(vb);
          const present = methods.toPresentTense(str)[form];
          if (!present) {
            return vb
          }
          return elide(vb.replaceWith(present).tag('PresentTense'))
        })
      }
      // uses the imperfect - always grammatical as a one-word substitution
      // (passé composé would require inserting avoir/être + agreement)
      toPastTense(n) {
        const methods = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          // 'a mangé' is already past - leave it
          if (vb.has('#Auxiliary #Adverb?+ (#PastParticiple|#PastTense)')) {
            return vb
          }
          const form = getForm(vb);
          const str = getMainRoot(vb);
          const past = methods.toImperfect(str)[form];
          if (!past) {
            return vb
          }
          return elide(vb.replaceWith(past).tag('Imperfect'))
        })
      }
      toFutureTense(n) {
        const methods = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          const form = getForm(vb);
          const str = getMainRoot(vb);
          const future = methods.toFutureTense(str)[form];
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
        const { toImperfect, toPresentTense, toFutureTense, toConditional, toPastParticiple } = this.methods.two.transform.verb;
        return getNth$2(this, n).map(vb => {
          const parsed = parseVerb(vb);
          const root = parsed.root || '';
          const imperfect = toImperfect(root);
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
        const m = new Verbs(this.document, pointer);
        m._cache = this._cache; // share this full thing
        return m
      }
    }
    Verbs.prototype.toPast = Verbs.prototype.toPastTense;
    Verbs.prototype.toPresent = Verbs.prototype.toPresentTense;
    Verbs.prototype.toFuture = Verbs.prototype.toFutureTense;

    View.prototype.verbs = function (n) {
      let vb = findVerbs(this);
      vb = getNth$2(vb, n);
      return new Verbs(this.document, vb.pointer)
    };
  };

  var verbs = {
    api: api$3,
  };

  const getNth$1 = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  // get root form of adjective
  const getRoot$1 = function (m) {
    m.compute('root');
    const str = m.text('root');
    return str
  };

  const api$2 = function (View) {
    class Adjectives extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Adjectives';
      }
      conjugate(n) {
        const methods = this.methods.two.transform.adjective;
        return getNth$1(this, n).map(m => {
          const adj = getRoot$1(m);
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

  var adjectives = {
    api: api$2,
  };

  const getNth = (doc, n) => (typeof n === 'number' ? doc.eq(n) : doc);

  // get root form of adjective
  const getRoot = function (m) {
    m.compute('root');
    const str = m.text('root');
    // let isPlural = m.has('#PluralNoun')
    // if (isPlural) {
    //   return transform.adjective.fromPlural(str)
    // }
    return str
  };

  const api$1 = function (View) {
    class Nouns extends View {
      constructor(document, pointer, groups) {
        super(document, pointer, groups);
        this.viewType = 'Nouns';
      }
      conjugate(n) {
        const methods = this.methods.two.transform.noun;
        return getNth(this, n).map(m => {
          const str = m.text();
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
          const str = getRoot(m);
          const plural = methods.toPlural(str);
          return m.replaceWith(plural)
        })
      }
      toSingular(n) {
        const methods = this.methods.two.transform.noun;
        return getNth(this, n).if('#PluralNoun').map(m => {
          const str = getRoot(m);
          const singular = methods.fromPlural(str);
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

  var nouns = {
    api: api$1,
  };

  const titleCase = /^\p{Lu}[\p{Ll}'’]/u; //upercase, then lowercase
  // import contract from './contract.js'

  const toTitleCase = function (str = '') {
    str = str.replace(/^ *[a-z\u00C0-\u00FF]/, x => x.toUpperCase()); //TODO: support unicode
    return str
  };

  // a run of implicit terms may hold several contractions, back-to-back.
  // only the first term of a contraction keeps its written text - the rest are ''
  const splitRuns = function (m) {
    const out = [];
    const docs = m.docs;
    m.fullPointer.forEach((ptr, i) => {
      const [n, start] = ptr;
      let from = 0;
      docs[i].forEach((term, o) => {
        if (o > 0 && term.text !== '') {
          out.push([n, start + from, start + o]);
          from = o;
        }
      });
      out.push([n, start + from, start + docs[i].length]);
    });
    return out
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
          const isTitleCase = titleCase.test(terms[0].text);
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
    View.prototype.contractions = function (n) {
      let m = this.match('@hasContraction+');
      // adjacent contractions - "j'aime l'été" - are each their own match
      m = m.update(splitRuns(m));
      // return the nth contraction
      if (typeof n === 'number') {
        m = m.eq(n);
      }
      return new Contractions(this.document, m.pointer)
    };
    // View.prototype.contract = contract
  };

  var contractions = {
    api
  };

  var version = '0.3.2';

  nlp.plugin(tokenize);
  nlp.plugin(tagset);
  nlp.plugin(lexicon);
  nlp.plugin(preTagger);
  nlp.plugin(postTagger);
  nlp.plugin(numbers);
  nlp.plugin(topics);
  nlp.plugin(verbs);
  nlp.plugin(adjectives);
  nlp.plugin(nouns);
  nlp.plugin(contractions);

  const fr = function (txt, lex) {
    const dok = nlp(txt, lex);
    return dok
  };

  // copy constructor methods over
  Object.keys(nlp).forEach(k => {
    if (nlp.hasOwnProperty(k)) {
      fr[k] = nlp[k];
    }
  });

  // this one is hidden
  Object.defineProperty(fr, '_world', {
    value: nlp._world,
    writable: true,
  });



  /** log the decision-making to console */
  fr.verbose = function (set) {
    const env = typeof process === 'undefined' ? self.env || {} : process.env; //use window, in browser
    env.DEBUG_TAGS = set === 'tagger' || set === true ? true : '';
    env.DEBUG_MATCH = set === 'match' || set === true ? true : '';
    env.DEBUG_CHUNKS = set === 'chunker' || set === true ? true : '';
    return this
  };
  fr.version = version;

  return fr;

}));
