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
    let [str, want] = a
    let n = nlp(str).numbers().get()[0] || {}
    t.equal(n, want, here + str)
  })
  t.end()
})


