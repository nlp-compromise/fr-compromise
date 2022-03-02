import test from 'tape'
import nlp from './_lib.js'
let here = '[fr-match] '
nlp.verbose(false)

test('match:', function (t) {
  let arr = [
    ['la foobar', '#Determiner #FemaleNoun'],
    ['le foobar', '#Determiner #MaleNoun'],
    ['dans le gaboo', 'dans #Determiner #MaleNoun'],
    ['dans la gaboo', 'dans #Determiner #FemaleNoun'],

    ['je suis dans la éthérés rue', '#Pronoun #Copula dans #Determiner #Adjective #Noun'],
    ['évolueront vous achetez', 'évolueront #Pronoun #PresentTense'],
    // ['','']
  ]
  arr.forEach(function (a) {
    let [str, match] = a
    let doc = nlp(str)//.compute('tagRank')
    let tags = doc.json()[0].terms.map(term => term.tags[0])
    let msg = `'${(str + "' ").padEnd(20, ' ')}  - '${tags.join(', ')}'`
    let m = doc.match(match)
    t.equal(m.text(), doc.text(), here + msg)
  })
  t.end()
})
