import test from 'tape'
import nlp from '../../_lib.js'
const here = '[fr-european-numbers] '

// digits are read by the europeanNumbers plugin, from compromise/shared
test('decimal-comma numbers', function (t) {
  const arr = [
    ['3,50', 3.5],
    ['1.000', 1000],
    ['1.234,56', 1234.56],
    ['1.234.567', 1234567],
    ['1 234,56', 1234.56],
    ['1 000', 1000],
    ['1 234 567,89', 1234567.89],
    ["1'000 CHF", 1000],
    // a period that can't be grouping thousands
    ['3.5', 3.5],
    // an english-style comma is still thousands
    ['7,938', 7938],
    ['-5', -5],
    ['−5', -5],
    ['-3,5 %', -3.5],
    ['3,5%', 3.5],
    ['5,30€', 5.3],
    ['5,30 €', 5.3],
    ['1/2', 0.5],
    ['2,5 millions', 2500000],
    ['3ème', 3],
  ]
  arr.forEach(a => {
    t.deepEqual(nlp(a[0]).numbers().get(), [a[1]], here + a[0])
  })
  t.deepEqual(nlp('Ça coûte 1.000.').numbers().get(), [1000], here + 'sentence-final period')
  t.deepEqual(nlp('Prix : 3,50, puis 4,20.').numbers().get(), [3.5, 4.2], here + 'trailing commas')
  t.end()
})

test('decimal-comma tags', function (t) {
  t.ok(nlp('1.234.567').has('#Cardinal'), here + 'period-grouped is a number')
  t.ok(nlp('3ème').has('#Ordinal'), here + 'ordinal')
  t.ok(nlp('12.05.2020').has('#Date'), here + 'dates are left alone')
  t.ok(nlp('15h30').has('#Time'), here + 'times are left alone')
  t.end()
})

test('decimal-comma output', function (t) {
  const arr = [
    // [text, add, result]
    ['3,50', 1, '4,5'],
    ['1 234,5', 1, '1 235,5'],
    ['1 234 567,89', 1, '1 234 568,89'],
    ['1.234,5', 1, '1.235,5'],
    ['1 000', 1, '1 001'],
    ['999', 1, '1000'],
    ['5,30 €', 1, '6,3 €'],
    ['+5%', 1, '+6%'],
    ['−5', 1, '-4'],
    ['-3,5 %', 1, '-2,5 %'],
  ]
  arr.forEach(a => {
    const doc = nlp(a[0])
    doc.numbers().add(a[1])
    t.equal(doc.text(), a[2], here + `${a[0]} + ${a[1]}`)
  })
  t.end()
})

// the number takes its tag from the word beside it
test('spaced money and percent', function (t) {
  const money = ["5,30 €", "1 000 euros", "12,50 EUR", "5 000 $", "cent euros"]
  const percent = ["3,5 %", "50 pour cent", "cinquante pour cent"]
  const values = [["50 pour cent", 50]]
  const neither = ["cinq chats"]
  money.forEach(str => {
    const doc = nlp(str)
    t.ok(doc.has('#Money'), here + 'money: ' + str)
    t.ok(doc.has('#Currency'), here + 'currency: ' + str)
    t.equal(doc.numbers().length, 1, here + 'one number: ' + str)
  })
  percent.forEach(str => {
    const doc = nlp(str)
    t.ok(doc.has('#Percent'), here + 'percent: ' + str)
    t.equal(doc.numbers().length, 1, here + 'one number: ' + str)
  })
  values.forEach(a => {
    t.deepEqual(nlp(a[0]).numbers().get(), [a[1]], here + 'value: ' + a[0])
  })
  neither.forEach(str => {
    t.equal(nlp(str).has('(#Money|#Percent)'), false, here + 'neither: ' + str)
  })
  t.end()
})
