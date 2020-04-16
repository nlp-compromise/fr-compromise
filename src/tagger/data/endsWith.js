//regex suffix patterns and their most common parts of speech,
//built using wordnet, by spencer kelly.
//this mapping shrinks-down the uglified build
const Adj = 'Adjective'
const Inf = 'Infinitive'
const Pres = 'PresentTense'
const Sing = 'Singular'
const Past = 'PastTense'
const Adverb = 'Adverb'
const Exp = 'Expression'
const Actor = 'Actor'
const Verb = 'Verb'
const Noun = 'Noun'
const Last = 'LastName'
//the order here matters.

//regexes indexed by mandated last-character
module.exports = {
  a: [
    [/.[oau][wvl]ska$/, Last], //polish (female)
    [/.[^aeiou]ica$/, Sing],
    [/^([hyj]a)+$/, Exp], //hahah
  ],
  c: [],
  d: [],
  e: [
    [/.[lnr]ize$/, Inf],
    [/.[^aeiou]ise$/, Inf],
    [/.[aeiou]te$/, Inf],
    [/.[^aeiou][ai]ble$/, Adj],
    [/.[^aeiou]eable$/, Adj],
    [/.[ts]ive$/, Adj],
  ],
  h: [
    [/.v[iy]ch$/, Last], //east-europe
    [/^ug?h+$/, Exp], //uhh
    [/^uh[ -]?oh$/, Exp], //uhoh
  ],
  i: [
    [/.[oau][wvl]ski$/, Last], //polish (male)
  ],
  k: [
    [/^(k){2}$/, Exp], //kkkk
  ],
  l: [
    [/.[gl]ial$/, Adj],
    [/.[^aeiou]ful$/, Adj],
    [/.[nrtumcd]al$/, Adj],
    [/.[^aeiou][ei]al$/, Adj],
  ],
  m: [
    [/.[^aeiou]ium$/, Sing],
    [/^h*u*m+$/, Exp], //mmmmmmm / ummmm / huuuuuummmmmm
    [/^\d+ ?[ap]m$/, 'Date'],
  ],
  n: [
    [/.[lsrnpb]ian$/, Adj],
    [/[^aeiou]ician$/, Actor],
    [/[aeiou][ktrp]in$/, 'Gerund'], // 'cookin', 'hootin'
  ],
  o: [
    [/^no+$/, Exp], //noooo
    [/^(yo)+$/, Exp], //yoyo
    [/^woo+[pt]?$/, Exp], //woo
  ],
  r: [],
  t: [],
  s: [
    [/^yes+$/, Exp], //yessss
  ],
  v: [
    [/.[^aeiou][ai][kln]ov$/, Last], //east-europe
  ],
  y: [],
}
