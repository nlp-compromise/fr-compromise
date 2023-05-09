import test from 'tape'
import nlp from '../_lib.js'
let here = '[number ordinal] '


let arr = [
  [0, 'zero', 'zeroième'],
  // [1, 'un', 'unième'],
  [2, 'deux', 'deuxième'],
  [3, 'trois', 'troisième'],
  [4, 'quatre', 'quatrième'],
  [5, 'cinq', 'cinquième'],
  [6, 'six', 'sixième'],
  [7, 'sept', 'septième'],
  [8, 'huit', 'huitième'],
  [9, 'neuf', 'neuvième'],

  [10, 'dix', 'dixième'],
  [11, 'onze', 'onzième'],
  [12, 'douze', 'douzième'],
  [13, 'treize', 'treizième'],
  [14, 'quatorze', 'quatorzième'],
  [15, 'quinze', 'quinzième'],
  [16, 'seize', 'seizième'],
  [17, 'dix sept', 'dix septième'],
  [18, 'dix huit', 'dix huitième'],
  [19, 'dix neuf', 'dix neuvième'],

  [20, 'vingt', 'vingtième'],
  [30, 'trente', 'trentième'],
  [40, 'quarante', 'quarantième'],
  [50, 'cinquante', 'cinquantième'],
  [60, 'soixante', 'soixantième'],
  [70, 'soixante dix', 'soixante dixième'],
  [80, 'quatre vingt', 'quatre vingtième'],
  [90, 'quatre vingt dix huit', 'quatre vingt dix huitième'],

  [100, 'cent', 'centième'],
  [1000, 'mille', 'millième'],
  [1000000, 'million', 'millionième'],//million 1000,000
  [1000000000, 'milliard', 'milliardième'],//billion 1000,000,000
  // [1000000000000, 'mille milliards', 'mille milliardième'],//trillion 1000,000,000

]
test('cardinal to ordinal:', function (t) {
  arr.forEach(function (a) {
    let [_, card, ord] = a
    let doc = nlp(card).numbers().toOrdinal()
    t.equal(doc.text(), ord, here + ' [toOrdinal] ' + card)
  })
  t.end()
})
test('ordinal -> cardinal:', function (t) {
  arr.forEach(function (a) {
    let [, card, ord] = a
    let doc = nlp(ord).numbers().toCardinal()
    t.equal(doc.text(), card, here + ' [toCardinal] ' + card)
  })
  t.end()
})


test('ordinal fmt:', function (t) {
  let list = [
    // [1, 'première', '1er'],//'first'
    [2, 'deuxième', '2e'],//'second'
    [3, 'troisième', '3e'],//'third'
    [4, 'quatrième', '4e'],//'fourth'
    [5, 'cinquième', '5e'],//'fifth'
    [6, 'sixième', '6e'],//'sixth'
    [7, 'septième', '7e'],//'seventh'
    [8, 'huitième', '8e'],//'eighth'
    [9, 'neuvième', '9e'],//'ninth'
    [10, 'dixième', '10e'],//'tenth'
  ]
  list.forEach(function (a) {
    let [_, str, want] = a
    let m = nlp(str).numbers().toNumber()
    t.equal(m.text(), want, here + str)
  })
  t.end()
})
