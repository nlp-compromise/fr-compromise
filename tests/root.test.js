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
    ['infinitésimales', '{infinitésimal}']//fem plural
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