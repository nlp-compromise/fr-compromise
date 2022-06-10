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

    ['je suis dans la rue éthérés', '#Pronoun #Copula dans #Determiner #Noun #Adjective'],
    [`le homme éthéré`, '#Determiner #MaleNoun #MaleAdjective'],
    [`la femme éthérée`, '#Determiner #FemaleNoun #FemaleAdjective'],
    ['évolueront vous achetez', 'évolueront #Pronoun #PresentTense'],

    ['janvier', '#Month'],
    ['lundi', '#WeekDay'],
    ['234', '#Value'],
    ['chicago', '#City'],
    ['Jamaica', '#Country'],
    ['colorado', '#Place'],
    ['suis', '#Copula'],
    ['es', '#Copula'],
    ['est', '#Copula'],
    ['sommes', '#Copula'],
    ['êtes', '#Copula'],
    ['sont', '#Copula'],
    ['étions', '#Copula'],
    ['serez', '#Copula'],
    ['seront', '#Copula'],
    ['été', '#Copula'],
    ['fus', '#Copula'],
    ['fut', '#Copula'],
    ['fûmes', '#Copula'],
    ['fûtes', '#Copula'],
    ['furent', '#Copula'],
    ['fusse', '#Copula'],
    ['fusses', '#Copula'],
    ['fût', '#Copula'],
    ['fussions', '#Copula'],
    ['fussiez', '#Copula'],
    ['fussent', '#Copula'],
    ['serais', '#Copula'],
    ['serais', '#Copula'],
    ['serait', '#Copula'],
    ['serions', '#Copula'],
    ['seriez', '#Copula'],
    ['seraient', '#Copula'],
    ['sois', '#Copula'],
    ['soyons', '#Copula'],
    ['soyez', '#Copula'],
    ['être', '#Copula'],

    [`Pour une fille d'Ottawa`, '#Preposition #Determiner #Noun . #Place'],
    // [`Grandie à Ste-Foy`, '#Verb a #Place+'],
    [`D'un père militaire`, 'de un #Noun #Adjective'],
    [`Et d'une belle fille qui fut sa mère`, '#Conjunction . une #Adjective #Noun #Preposition #Copula #Possessive #Noun'],
    [`Entre deux caisses de bière`, `#Preposition #Value #PluralNoun #Preposition #FemaleNoun`],
    [`Rejoindre la grand-mère`, `#Verb la #Adjective #Noun+`]
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
