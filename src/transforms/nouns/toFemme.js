const irregulars = {
  auvergnat: 'auvergnate',
  avocat: 'avocate',
  candidat: 'candidate',
  ingrat: 'ingrate',

  copain: 'copine',
  courtisan: 'courtisane',
  démon: 'démone',
  persan: 'persane',

  cadet: 'cadette',
  minet: 'minette',
  dévot: 'dévote',

  speaker: 'speakerine',
  écuyer: 'écuyère',

  ambassadeur: 'ambassadrice',
  chanteur: 'chanteuse',
  enquêteur: 'enquêteuse',
  menteur: 'menteuse',
  inférieur: 'inférieure',
  meilleur: 'meilleure',
  supérieur: 'supérieure',
  mineur: 'mineure',
  pécheur: 'pécheresse',
  sauteur: 'sauteuse',
  visiteur: 'visiteuse',

  abbé: 'abbesse',
  cane: 'canard',
  chameau: 'chamelle',
  chou: 'choute',
  conseiller: 'conseillère',
  fou: 'folle',
  prince: 'princesse',
  rideau: 'ridelle',
  suisse: 'suissesse',

  bigot: 'bigote',
  idiot: 'idiote',
  manchot: 'manchote',
  parigot: 'parigote',
  poivrot: 'poivrote',
}
// order matters
const regs = [
  [/tteur$/, 'tteuse'],
  [/pteur$/, 'pteuse'],
  [/eteur$/, 'eteuse'],
  [/lleur$/, 'lleuse'],
  [/rteur$/, 'rteuse'],
  [/reau$/, 'relle'],
  [/ceau$/, 'celle'],
  [/veau$/, 'velle'],
  [/neur$/, 'neuse'],
  [/teur$/, 'trice'],
  [/tien$/, 'tienne'],
  [/cien$/, 'cienne'],
  [/cher$/, 'chère'],
  [/jeur$/, 'jeure'],
  [/être$/, 'êtresse'],
  [/gre$/, 'gresse'],
  [/mte$/, 'mtesse'],
  [/ger$/, 'gère'],
  [/éen$/, 'éenne'],
  [/eur$/, 'euse'],
  [/ier$/, 'ière'],
  [/ien$/, 'ienne'],
  [/san$/, 'sanne'],
  [/vot$/, 'vot'],
  [/eil$/, 'eille'],
  [/euf$/, 'euve'],
  [/oup$/, 'ouve'],
  [/ète$/, 'étesse'],
  [/dou$/, 'doue'],
  [/if$/, 'ive'],
  [/ot$/, 'otte'],
  [/at$/, 'atte'],
  [/on$/, 'onne'],
  [/ou$/, 'ouse'],
  [/ec$/, 'ecque'],
  [/uc$/, 'uchesse'],
  [/el$/, 'elle'],
  [/en$/, 'enne'],
  [/rc$/, 'rque'],
  [/bé$/, 'bésse'],
]
const toFemme = function (str) {
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
  str += 'e'
  return str
}
module.exports = toFemme
