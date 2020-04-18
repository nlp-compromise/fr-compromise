const data = require('./data')
// const suffixes = require('/Users/spencer/mountain/fr-compromise/src/tagger/data/suffixMap.js')

const toFem = function (str) {
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

    // secret ➔ secrète
    [/ret$/, 'rète'],
    // violet ➔ violette
    [/et$/, 'ette'],
    [/ot$/, 'otte'],

    // aigu ➔ aiguë
    [/gu$/, 'guë'],
    // puceau ➔ pucelle
    [/eau$/, 'elle'],

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

    //  ➔
    // [],
    //  ➔
    // [],
  ]
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
// const toPlural = function (str) {
//   return str + 's'
// }

// console.log('total: ', data.length)
let count = 0
data.forEach((a) => {
  let fem = toFem(a[0])
  if (a[1] === fem) {
    count += 1
  } else {
    // if (a[0].endsWith('t')) {
    console.log(a[0] + '   - ' + fem, a[1])
    // }
  }
})
console.log(count)
console.log(count / data.length)

// console.log(toFem('virtuele'))
