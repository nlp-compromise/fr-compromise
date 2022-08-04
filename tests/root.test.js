import test from 'tape'
import nlp from './_lib.js'
let here = '[root-match] '
nlp.verbose(false)

test('root-match:', function (t) {
  let arr = [
    ['Nous jetons les chaussures actuelles dans les maisons', '{jeter} les {chaussure} {actuel}'],
    ['dans les maisons actuels', 'dans les {maison} {actuel}'],
    ['infinitésimal', '{infinitésimal}'],//masc
    ['infinitésimale', '{infinitésimal}'],//fem
    ['infinitésimaux', '{infinitésimal}'],//masc plural
    ['infinitésimales', '{infinitésimal}'],//fem plural
    [`Étouffé par sa propre moustache `, '{étouffer}'],//'étouffer'
    [`Quelle est la chose préférée des pirates à tricoter ?`, '{tricoter}'],//tricoter'
    [`Déballé en 1913`, '{déballer}'],//'déballer'
    [`J'ai regardé ce que j'avais tranché`, '{trancher}'],//trancher
    [`Vous devez apprendre à rendre les choses plus rapides`, '{rapide}'],//'rapide'
    [`Les analystes ont attribué le faible`, '{attribuer}'],//attribuer
    [`La production a cessé en octobre.`, '{cesser}'],//'cesser'
    // [` Entre-temps, j'ai institué une recherche privée rigoureuse du cadavre`, '{rigoureux}'],//'rigoureux'
    // [`nous avons déballés`, '{déballer}'],//'déballer'
    // [`Appuyez sur le bouton du département correspondant.`, '{correspond}'],//'correspond'
    // [`Non da si vous exécutez qu'il active la version complète da.`, '{activer}'],//activer
    // [`Tu sais, je pensais, et si je déballais ici ?`, '{déballer}'],//'déballer'
    // ['en marchant', '{marcher}'],
    //chercher
    // [`Avant, je cherchais à attirer`, '{chercher}'],
    //raison
    [`J'ai dû le faire pour des raisons.`, '{raison}'],
    [`avancé des raisons différentes.`, '{raison}'],
    // [`pour plusieurs raisons.`, '{raison}'],
    // blanc
    [`la boîte blanche`, '{blanc}'],
    [`Une boule blanche géante`, '{blanc}'],
    // libérer
    [`Le Karnataka ne libérera plus`, '{liberer}'],
    [`Il a été libéré par les Royals`, '{liberer}'],
    [`les mascarades était prodigieuse`, '{prodigieux}'],
    [`puissance musculaire prodigieuse`, '{prodigieux}'],
    // [`Tellement stressé que`, '{stresser}'],
    // [`du département correspondant.`, '{correspond}'],
    // [`des vins sont bien calculée`, '{calculé}'],//adj
    [`l'ai filtré par mes reins.`, '{rein}'],
    [`les humains naissent avec quatre reins`, '{rein}'],
    // interdire
    // [`Elle interdit les transactions`, '{interdire}'],
    // [`les promotions sont interdites par l'interdiction`, '{interdire}'],
    //endommager
    // [`Il a été endommagé dans deux énormes incendies`, '{endommager}'],
  ]
  arr.forEach(function (a) {
    let [str, match] = a
    let doc = nlp(str).compute('root')
    let tags = doc.json()[0].terms.map(term => term.tags[0])
    let msg = `'${(str + "' ").padEnd(20, ' ')}  - '${tags.join(', ')}'`
    t.equal(doc.has(match), true, here + msg)
  })
  t.end()
})
