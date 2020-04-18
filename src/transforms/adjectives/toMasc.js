const irregulars = {
  beau: 'belle',
  bénin: 'bénigne',
  bêta: 'bêtasse',
  coi: 'coite',
  dû: 'due',
  enchanteur: 'enchanteresse',
  favori: 'favorite',
  fou: 'folle',
  grec: 'grecque',
  malin: 'maligne',
  naïf: 'naïve',
  nègre: 'négresse',
  puceau: 'pucelle',
  pécheur: 'pécheresse',
  rigolo: 'rigolote',
  sec: 'sèche',
  tourangeau: 'tourangelle',
  'tout-puissant': 'toute-puissante',
  vengeur: 'vengeresse',
}
// order matters
const regs = [
  [/resse$/, 're'],
  [/auve$/, 'auf'],
  [/rice$/, 'eur'],
  [/anne$/, 'an'],
  [/otte$/, 'ot'],
  [/ille$/, 'il'],
  [/elle$/, 'el'],
  [/ette$/, 'et'],
  [/esse$/, 're'],
  [/enne$/, 'en'],
  [/onne$/, 'on'],
  [/ique$/, 'ic'],
  [/rque$/, 'rc'],
  [/que$/, 'c'],
  [/euse$/, 'eur'],
  [/euve$/, 'euf'],
  [/ouse$/, 'ou'],
  [/aïve$/, 'aif'],
  [/èche$/, 'èc'],
  [/ive$/, 'if'],
  [/ite$/, 'it'],
  [/ère$/, 'er'],
  [/che$/, 'c'],
  [/gue$/, 'g'],
  [/ète$/, 'et'],
  [/ève$/, 'ef'],
  [/guë$/, 'gu'],
  [/che$/, 'ch'],
]
const toMasc = function (str) {
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
