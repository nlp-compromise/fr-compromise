const irregulars = {
  abbesse: 'abbé',
  'belle-soeur': 'beau-frère',
  'call-girl': 'call girl',
  canard: 'cane',
  chamelle: 'chameau',
  copine: 'copain',
  'demi-heure': 'heur',
  duchesse: 'duc',
  folle: 'fou',
  'grande-duchesse': 'grand-duc',
  négresse: 'nègre',
  poétesse: 'poète',
  pécheresse: 'pécheur',
  'sex-shop': 'sex shop',
  speakerine: 'speaker',
  suissesse: 'suisse',
}
// order matters
const regs = [
  [/trice$/, 'teur'],
  [/drice$/, 'deur'],
  [/resse$/, 're'],
  [/cesse$/, 'ce'],
  [/tesse$/, 'te'],
  [/delle$/, 'deau'],
  [/relle$/, 'reau'],
  [/celle$/, 'ceau'],
  [/velle$/, 'veau'],
  [/elle$/, 'el'],
  [/euse$/, 'eur'],
  [/ouse$/, 'ou'],
  [/ière$/, 'ier'],
  [/cque$/, 'c'],
  [/oute$/, 'ou'],
  [/ouve$/, 'oup'],
  [/euve$/, 'euf'],
  [/tte$/, 't'],
  [/anne$/, 'an'],
  [/enne$/, 'en'],
  [/onne$/, 'on'],
  [/oire$/, 'oir'],
  [/ille$/, 'il'],
  [/rque$/, 'rc'],
  [/ère$/, 'er'],
  [/ice$/, 'eur'],
  [/ive$/, 'if'],
  // leave these alone
  [/re$/, 're'],
  [/ce$/, 'ce'],
  [/mte$/, 'mte'],
  [/sse$/, 'sse'],
]
const toMasc = function (str) {
  // check irregular forms
  if (irregulars.hasOwnProperty(str)) {
    return irregulars[str]
  }
  // try each replacement
  for (let i = 0; i < regs.length; i += 1) {
    let reg = regs[i][0]
    if (str.match(reg)) {
      return str.replace(reg, regs[i][1])
    }
  }
  // otherwise...
  return str.replace(/e$/, '')
}
module.exports = toMasc
