const irregulars = {
  belle: 'beau',
  bénigne: 'bénin',
  bêtasse: 'bêta',
  coite: 'coi',
  due: 'dû',
  enchanteresse: 'enchanteur',
  favorite: 'favori',
  folle: 'fou',
  grecque: 'grec',
  maligne: 'malin',
  naïve: 'naïf',
  négresse: 'nègre',
  pucelle: 'puceau',
  pécheresse: 'pécheur',
  rigolote: 'rigolo',
  sèche: 'sec',
  tourangelle: 'tourangeau',
  vengeresse: 'vengeur',
  'toute-puissante': 'tout-puissant',
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
  // don't change these
  [/tre$/, 'tre'],
]

const toMasc = function (str) {
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
