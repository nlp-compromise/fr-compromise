import test from 'tape'
import nlp from './_lib.js'
let here = '[fr-dates] '

//yep,
let jan = '01'
let feb = '02'
let mar = '03'
let apr = '04'
let may = '05'
let june = '06'
let july = '07'
let august = '08'
let sept = '09'
let oct = '10'
let nov = '11'
let dec = '12'
const today = [1998, 2, 2]
const opts = { timezone: 'UTC', today }

const arr = [
  [`je suis né le 2 septembre 1982`, [1982, sept, 2]],
  [`Je travaille jusqu'en juin.`, [1998, 3, 2], [1998, june, 1]],
  [`Il n'y a pas d'augmentation prévue jusqu'en 2032`, [2032, jan, 1]],
  [`Je suis en vacances jusqu'au 3 janvier.`, [2020, jan, 3]],
  [`Je peux t'emprunter ta voiture jusqu'à lundi prochain`, [2020, feb, 17]],
  ['Nous avons acheté la maison le 15 avril 2013.', [2013, apr, 15]],
  ['Le 1er mai est un jour férié en France', [2020, may, 1]],
  ['Je vais y aller le premier décembre 2014.', [2014, dec, 1]],
  [`Aujourd'hui, c'est le 8 septembre 2014.`, [2024, sept, 8]],
  [`Nous sommes le 1er février aujourd'hui.`, [2020, feb, 1]],
  [`Nous sommes le vendredi 1er février aujourd'hui`, [2020, feb, 1]],
  ['15/12/2020', [2020, dec, 15]],
  ['Le 6 avril', [2020, apr, 6]],
  ['Mercredi 11 mars', [2020, mar, 11]],
  ['12/06/2020', [2020, june, 12]],
  ['Halloween est le 31 octobre.', [2020, oct, 31]],
  [`C'est le quatorze juillet.`, [2020, july, 14]],
  [`c'est le premier janvier`, [2021, jan, 1]],
  ['le 5 juin 2012', [2012, june, 5]],
  ['5/6/2012 June 5, 2012', [2012, june, 5]],
  ['6/5/2012', [2012, may, 6]],
  ['le 25 décembre 2012', [2012, dec, 25]],
  ['25/12/2012 December 25, 2012', [2012, dec, 25]],
  ['12/15/2012', [2012, dec, 15]],
  ['le 3 novembre 2012', [2012, nov, 3]],
  ['11/03/2012 Novembre 3, 2021', [2012, nov, 3]],  // have 2 years in slug
  ['3/11/21', [2021, nov, 3]],
  ['entre sept et oct', [2020, sept, 1], [2020, oct, 1]],
  ['demain à 10h', [2020, feb, 14]], // tomorrow at 10am
  ['lundi 20', [2020, apr, 20]], // next monday 20th
  ['lundi 20 à 10h', [2020, apr, 20]], // next monday 20th at 10am
  ['hier soir', [2020, feb, 12]], // yesterday evening
  ['semaine prochaine', [2020, feb, 17]], // next week
  ['14h30 demain', [2020, feb, 14]], // 2:30pm tomorow
  ['demain matin à 9h', [2020, feb, 14]], // tomorrow morning at 9am
  ['hier après-midi', [2020, feb, 12]], //yesterday afternoon
]

const padZero = num => String(num).padStart(2, '0')

test('dates:', function (t) {
  arr.forEach(a => {
    let [str, start, end] = a
    // make them ISOs
    start = start.map(padZero).join('-')
    end = end || []
    end = end.map(padZero).join('-')

    let doc = nlp(str)
    // t.equal(doc.has('#Date'), true, here + `has-date: '${str}'`)

    let json = doc.dates(opts).json({ terms: false })[0] || { date: [] }
    let dates = json.dates[0] || { start: '', end: '' }

    // test the start date is the ISO
    let iso = dates.start.replace(/T00:00:00\.000Z$/, '', '')
    t.equal(iso, start, `[start]: ${str}`)
    // test the end date is the ISO
    if (end) {
      iso = dates.end.replace(/T.*$/, '', '')
      t.equal(iso, end, `[end]: ${str}`)
    }
  })
  t.end()
})