import test from 'tape'
import nlp from './_lib.js'
let here = '[fr-dates] '

const arr = [
  [`je suis né le 2 septembre 1982`, ''],
  [`Je travaille jusqu’en juin.`, ''],
  [`Il n’y a pas d’augmentation prévue jusqu’en 2032`, ''],
  [`Je suis en vacances jusqu’au 3 janvier.`, ''],
  [`Je peux t’emprunter ta voiture jusqu’à lundi prochain`, ''],
  ['Nous avons acheté la maison le 15 avril 2013.', ''],
  ['Le 1er mai est un jour férié en France', ''],
  ['Je vais y aller le premier décembre 2014.', ''],
  ['Aujourd’hui, c’est le 8 septembre 2014.', ''],
  ['Nous sommes le 1er février aujourd’hui.', ''],
  ['Nous sommes le vendredi 1er février aujourd’hui', ''],
  ['15/12/2020', ''],// = December 15th, 2020
  ['Le 6 avril', ''],
  ['Mercredi 11 mars', ''],
  ['12/06/2020', ''],// = June 12th, 2020
  ['Halloween est le 31 octobre.', ''],
  ['C’est le quatorze juillet.', ''],
  [`c'est le premier janvier`, ''],
  ['le 5 juin 2012', ''],
  ['5/6/2012 June 5, 2012', ''],
  ['6/5/2012', ''],
  ['le 25 décembre 2012', ''],
  ['25/12/2012 December 25, 2012', ''],
  ['12/15/2012', ''],
  ['le 3 november 2012', ''],
  ['11/03/2012 November 3, 2021', ''],
  ['3/11/21', ''],
  ['entre sept et oct', ''],
  ['demain à 10h', ''], // tomorrow at 10am
  ['lundi 20', ''], // next monday 20th
  ['lundi 20 à 10h', ''], // next monday 20th at 10am
  ['hier soir', ''], // yesterday evening
  ['semaine prochaine', ''], // next week
  ['14h30 demain', ''], // 2:30pm tomorow
  ['demain matin à 9h', ''], // tomorrow morning at 9am
  ['hier après-midi', ''], //yesterday afternoon
]
test('dates:', function (t) {
  arr.forEach(a => {
    let doc = nlp(a[0])
    t.equal(doc.has('#Date'), true, here + `has-date: '${a[0]}'`)
    // let json = doc.dates().json({ terms: false })[0]
    // t.equal(json.dates.start)
  })
  t.end()
})