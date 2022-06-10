import test from 'tape'
import nlp from './_lib.js'
let here = '[root-match] '
nlp.verbose(false)

test('root-match:', function (t) {
  let arr = [
    ['Nous jetons les chaussures actuelles dans les maisons', '{jeter} les {chaussure} {actuel}'],
    ['dans les maisons actuels', 'dans les {maison} {actuel}'],
    //   "infinitésimal": ["infinitésimale", "infinitésimaux", "infinitésimales"],
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
    [`nous les avons tous déballés`, '{déballer}'],//'déballer'
    // [`Appuyez sur le bouton du département correspondant.`, '{correspond}'],//'correspond'
    // [`Non da si vous exécutez qu'il active la version complète da.`, '{activer}'],//activer
    // [`Tu sais, je pensais, et si je déballais ici ?`, '{déballer}'],//'déballer'
    ['en marchant', '{marcher}']
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
