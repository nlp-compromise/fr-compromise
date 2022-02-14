const irregs = require('./data/toFemme')
// order matters
const regs = [
  // résiduele ➔ résiduelle
  [/el$/, 'elle'],
  // pareil ➔ pareille
  [/eil$/, 'eille'],

  // veuf ➔ veuve
  [/f$/, 've'],
  // sauf ➔ sauve
  [/auf$/, 'auve'],
  // évasif ➔ évasive
  [/if$/, 'ive'],
  // mitoyen ➔ mitoyenne

  [/yen$/, 'yenne'],
  // victorien ➔ victorienne
  [/ien$/, 'ienne'],
  // saxone ➔ saxonne
  [/on$/, 'onne'],
  //herculéen ➔ herculéenne
  [/éen$/, 'éenne'],

  // secret ➔ secrète
  [/ret$/, 'rète'],
  // violet ➔ violette
  [/et$/, 'ette'],
  [/ot$/, 'otte'],

  // aigu ➔ aiguë
  [/gu$/, 'guë'],
  // puceau ➔ pucelle
  [/eau$/, 'elle'],
  // andalou ➔ andalouse
  [/ou$/, 'ouse'],

  // grec ➔ grecque
  [/rec$/, 'recque'],
  // sec ➔ seche
  [/ec$/, 'èche'],
  // public ➔ publique
  [/ic$/, 'ique'],

  // prometteur ➔ prometteuse
  [/tteur$/, 'tteuse'],
  // prometteur ➔ prometteuse
  [/lleur$/, 'lleuse'],
  // batailleur ➔ batailleuse
  [/teur$/, 'trice'],
  // inférieur ➔ inférieure
  [/ieur$/, 'ieure'],
  // rêveur ➔ rêveuse
  [/eur$/, 'euse'],
  // pétrolier ➔ pétrolière
  [/lier$/, 'lière'],
  // printanier ➔ printanière
  [/ier$/, 'ière'],
  // mensonger ➔ mensongère
  [/er$/, 'ère'],

  // traître ➔ traîtress
  [/re$/, 'resse'],

  // oblong ➔ oblongue
  [/ong$/, 'ongue'],
  // rigolo ➔ rigote
  [/olo$/, 'ote'],
]

const toFemme = function (str) {
  // check irregular forms
  if (irregs.hasOwnProperty(str)) {
    return irregs[str]
  }
  // try each replacement
  for (let i = 0; i < regs.length; i += 1) {
    let reg = regs[i][0]
    if (str.match(reg)) {
      return str.replace(reg, regs[i][1])
    }
  }
  // otherwise...
  return str + 'e'
}
module.exports = toFemme
