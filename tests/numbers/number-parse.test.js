import test from 'tape'
import nlp from '../_lib.js'
let here = '[number parse] '

let arr = [
  // ['un', 1],
  ['onze', 11],
  ['vingt et un', 21],
  ['trente et un', 31],
  ['quarante et un', 41],
  ['cinquante et un', 51],
  ['soixante et un', 61],
  ['soixante onze', 71],
  ['quatre vingt et un', 81],
  ['quatre vingt onze', 91],
  ['deux', 2],
  ['douze', 12],
  ['vingt deux', 22],
  ['trente deux', 32],
  ['quarante deux', 42],
  ['cinquante deux', 52],
  ['soixante deux', 62],
  ['soixante douze', 72],
  ['quatre vingt et deux', 82],
  ['quatre vingt douze', 92],
  ['trois', 3],
  ['treize', 13],
  ['vingt trois', 23],
  ['trente trois', 33],
  ['quarante trois', 43],
  ['cinquante trois', 53],
  ['soixante trois', 63],
  ['soixante treize', 73],
  ['quatre vingt et trois', 83],
  ['quatre vingt treize', 93],
  ['quatre', 4],
  ['quatorze', 14],
  ['vingt quatre', 24],
  ['trente quatre', 34],
  ['quarante quatre', 44],
  ['cinquante quatre', 54],
  ['soixante quatre', 64],
  ['soixante quatorze', 74],
  ['quatre vingt et quatre', 84],
  ['quatre vingt quatorze', 94],
  ['cinq', 5],
  ['quinze', 15],
  ['vingt cinq', 25],
  ['trente cinq', 35],
  ['quarante cinq', 45],
  ['cinquante cinq', 55],
  ['soixante cinq', 65],
  ['soixante quinze', 75],
  ['quatre vingt et cinq', 85],
  ['quatre vingt quinze', 95],
  ['six', 6],
  ['seize', 16],
  ['vingt six', 26],
  ['trente six', 36],
  ['quarante six', 46],
  ['cinquante six', 56],
  ['soixante six', 66],
  ['soixante seize', 76],
  ['quatre vingt et six', 86],
  ['quatre vingt seize', 96],
  ['sept', 7],
  ['dix sept', 17],
  ['vingt sept', 27],
  ['trente sept', 37],
  ['quarante sept', 47],
  ['cinquante sept', 57],
  ['soixante sept', 67],
  ['soixante dix sept', 77],
  ['quatre vingt et sept', 87],
  ['quatre vingt sept', 87],
  ['quatre vingt dix sept', 97],
  ['huit', 8],
  ['dix huit', 18],
  ['vingt huit', 28],
  ['trente huit', 38],
  ['quarante huit', 48],
  ['cinquante huit', 58],
  ['soixante huit', 68],
  ['soixante dix huit', 78],
  ['quatre vingt et huit', 88],
  ['quatre vingt dix huit', 98],
  ['neuf', 9],
  ['dix neuf', 19],
  ['vingt neuf', 29],
  ['trente neuf', 39],
  ['quarante neuf', 49],
  ['cinquante neuf', 59],
  ['soixante neuf', 69],
  ['soixante dix neuf', 79],
  ['quatre vingt et neuf', 89],
  ['quatre vingt dix neuf', 99],
  ['dix', 10],
  ['vingt', 20],
  ['trente', 30],
  ['quarante', 40],
  ['cinquante', 50],
  ['soixante', 60],
  ['soixante dix', 70],
  ['quatre vingt', 80],
  ['quatre vingt dix', 90],
  ['cent', 100],

  ['cent cinq', 105],
  ['cent quarante neuf', 149],
  ['cent quatre vingt un', 181],
  ['deux cents', 200],
  ['trois cents', 300],
  ['quatre cents', 400],
  ['cinq cents', 500],
  ['six cents', 600],
  ['sept cents', 700],
  ['huit cents', 800],
  ['neuf cents', 900],
  ['cinq cent un', 501],
  ['cinq cent huit', 508],
  ['cinq cent trente', 530],
  ['cinq cent trente et un', 531],
  ['cinq cent soixante cinq', 565],
  ['cinq cent quatre vingt dix huit', 598],

  ['quatre cent quinze', 415],
  ['quatre cent quinze mille', 415000],

  ['mille', 1000],
  ['mille et un', 1001],
  ['mille cinq cents', 1500],
  ['sept cent soixante six', 766],
  ['deux mille un', 2001],
  ['quarante mille', 40000],
  ['soixante quatorze mille', 74000],
  ['cent mille', 100000],
  ['quatre cent quinze mille deux cent quatre vingt dix sept', 415297],
  ['un million', 1000000],
  ['trois millions', 3000000],
  ['six millions quatre cent quatre vingt douze mille', 6492000],
  ['huit millions huit cent quarante et un mille neuf cent trente deux', 8841932]
]

test('cardinal parse:', function (t) {
  arr.forEach(function (a) {
    let [str, n] = a
    let m = nlp(str).numbers()
    t.equal(m.get()[0], n, here + '[toNumber] ' + str)
  })
  t.end()
})

// test('cardinal toNumber:', function (t) {
//   arr.forEach(function (a) {
//     let [str, n] = a
//     let doc = nlp(String(n))
//     doc.numbers().toText()
//     t.equal(doc.text(), str, here + '[toText] ' + str)
//   })
//   t.end()
// })



test('misc:', function (t) {
  let doc = nlp('342').numbers().toOrdinal()
  t.equal(doc.text(), '342e', here + 'num-ord')

  doc = nlp('trois cent soixante-dixième').numbers().toNumber().toOrdinal()
  t.equal(doc.text(), '370e', here + 'num-word-ord')
  t.end()
})

