import test from 'tape'
import nlp from '../_lib.js'
let here = '[number-ordinal] '


test('cardinal-ordinal:', function (t) {
  let arr = [
    [0, 'zero', 'zeroieme'],
    [1, 'un', 'unieme'],
    [2, 'deux', 'deuxieme'],
    [3, 'trois', 'troisieme'],
    [4, 'quatre', 'quatrieme'],
    [5, 'cinq', 'cinquieme'],
    [6, 'six', 'sixieme'],
    [7, 'sept', 'septieme'],
    [8, 'huit', 'huitieme'],
    [9, 'neuf', 'neuvieme'],

    [10, 'dix', 'dixieme'],
    [11, 'onze', 'onzieme'],
    [12, 'douze', 'douzieme'],
    [13, 'treize', 'treizieme'],
    [14, 'quatorze', 'quatorzieme'],
    [15, 'quinze', 'quinzieme']
    [16, 'seize', 'seizieme'],
    [17, 'dix sept', 'dix septiem'],
    [18, 'dix huit', 'dix huitiem'],
    [19, 'dix neuf', 'dix neuviem'],

    [20, 'vingt', 'vingtieme'],
    [30, 'trente', 'trentieme'],
    [40, 'quarante', 'quarantieme'],
    [50, 'cinquante', 'cinquantieme'],
    [60, 'soixante', 'soixantieme'],
    [70, 'soixante-dix', 'soixante-dixième'],
    [80, 'quatre vingt', 'quatre-vingtième'],
    [90, 'quatre vingt dix huit', 'quatre-vingt-dixième'],

    [100, 'cent', 'centieme'],
    [1000, 'mille', 'millieme'],
    [1000000, 'million', 'millionieme'],//million 1000,000
    [1000000000, 'milliard', 'milliardieme'],//billion 1000,000,000
    [1000000000000, 'mille milliards', 'mille milliardieme'],//trillion 1000,000,000

  ]

  arr.forEach(function (a) {
    let [num, str, want] = a
    let m = nlp(str).numbers()
    t.equal(m.get()[0], want, here + str + ' parse')
  })
  t.end()
})




test('ordinal-fmt:', function (t) {
  let arr = [
    [1, 'première', '1er'],//'first'
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
  arr.forEach(function (a) {
    let [num, str, want] = a
    let m = nlp(str).numbers().toNumber()
    t.equal(m, want, here + str)
  })
  t.end()
})
