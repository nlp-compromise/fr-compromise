import test from 'tape'
import nlp from '../../_lib.js'
const here = '[contractions-nth] '

test('contractions nth:', function (t) {
  const str = `j'aime le chat qu'il voit`
  const all = nlp(str).contractions()
  t.equal(all.length, 2, here + 'two contractions')
  t.equal(nlp(str).contractions(0).text(), all.eq(0).text(), here + 'first')
  t.equal(nlp(str).contractions(1).text(), all.eq(1).text(), here + 'second')
  t.equal(nlp(str).contractions(1).length, 1, here + 'only one')
  t.equal(nlp(str).contractions(5).found, false, here + 'missing nth')

  const doc = nlp(str)
  doc.contractions(1).expand()
  t.equal(doc.text(), `j'aime le chat que il voit`, here + 'expand nth only')
  t.end()
})

test('adjacent contractions are separate:', function (t) {
  const arr = [
    [`j'aime l'été`, [`j'aime`, `l'été`]],
    [`j’aime l’été`, [`j’aime`, `l’été`]],
    [`c'était l'heure d'y aller`, [`c'était`, `l'heure`, `d'y`]],
    [`il n'a qu'un chat`, [`n'a`, `qu'un`]],
    [`je vais au marché et aux halles`, ['au', 'aux']],
    [`il pense à l'ami auquel j'écris`, [`l'ami`, 'auquel', `j'écris`]],
    // not contractions
    [`aujourd'hui le chat dort`, []],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    const m = nlp(str).contractions()
    t.deepEqual(m.out('array'), want, here + str)
    t.equal(m.length, want.length, here + 'length: ' + str)
  })
  t.end()
})

test('adjacent contractions nth:', function (t) {
  const str = `j'aime l'été`
  t.equal(nlp(str).contractions().length, 2, here + 'two results')
  t.equal(nlp(str).contractions(0).text(), `j'aime`, here + 'nth 0')
  t.equal(nlp(str).contractions(1).text(), `l'été`, here + 'nth 1')
  t.equal(nlp(str).contractions(1).text('implicit'), `le été`, here + 'nth 1 implicit')
  t.equal(nlp(str).contractions(2).found, false, here + 'nth 2')
  // both implicit terms stay in the one match
  const json = nlp(str).contractions().json()
  t.deepEqual(json.map(o => o.terms.length), [2, 2], here + 'two terms each')
  t.deepEqual(json[1].terms.map(o => o.implicit), ['le', 'été'], here + 'implicit terms')
  // across sentences
  const doc = nlp(`j'aime l'été. Il va au cinéma qu'elle aime`)
  t.equal(doc.contractions().length, 4, here + 'two sentences')
  t.equal(doc.contractions(2).text(), 'au', here + 'nth in second sentence')
  t.end()
})

test('adjacent contractions expand:', function (t) {
  let doc = nlp(`j'aime l'été`)
  doc.contractions().expand()
  t.equal(doc.text(), `je aime le été`, here + 'expand all')
  t.equal(doc.contractions().found, false, here + 'none left')

  doc = nlp(`j'aime l'été`)
  doc.contractions(1).expand()
  t.equal(doc.text(), `j'aime le été`, here + 'expand second only')
  t.equal(doc.contractions().length, 1, here + 'one left')

  doc = nlp(`j'aime l'été`)
  doc.contractions(0).expand()
  t.equal(doc.text(), `je aime l'été`, here + 'expand first only')

  doc = nlp(`L'été, j'aime l'eau.`)
  doc.contractions().expand()
  t.equal(doc.text(), `Le été, je aime le eau.`, here + 'keeps punctuation + title-case')

  doc = nlp(`j'aime l'été. Il va au cinéma qu'elle aime`)
  doc.contractions().expand()
  t.equal(doc.text(), `je aime le été. Il va à le cinéma que elle aime`, here + 'expand in two sentences')
  t.end()
})
