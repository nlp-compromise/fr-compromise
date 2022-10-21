import test from 'tape'
import nlp from '../_lib.js'
let here = '[number-misc] '


test('num equals', function (t) {
  let arr = [
    ['un cent', 'cent'],
    ['trois cents', 'trois cent'],
    ['un million', 'million'],
    ['3 cent', 'trois cent'],
    ['cinquante', 'cinquantième'],
    ['sept', 'septième'],
    ['dix huit', 'dix huitième'],
    ['moins dix huitième', '-18e'],
    ['moins dix huit', '-18'],
    ['moins deux centième', '-200'],
    ['quatorze cent', 'quatorze centième']
  ]
  arr.forEach(a => {
    let [left, right] = a
    left = nlp(left).numbers().get()[0]
    right = nlp(right).numbers().get()[0]
    t.equal(left, right, here + a.join(' == '))
  })
  t.end()
})

test('prefix/suffix:', function (t) {
  let doc = nlp('$7,938').numbers().add(1)
  t.equal(doc.text(), '$7939', here + 'add money')

  doc = nlp('7,938kg').numbers().minus(1)
  t.equal(doc.text(), '7937kg', here + 'minus w/ unit')

  doc = nlp('938.4cm').numbers().minus(1)
  t.equal(doc.text(), '937.4cm', here + 'minus w/ decimal')

  doc = nlp('33e').numbers().add(1)
  t.equal(doc.text(), '34e', here + 'add ordinal')
  t.end()
})

// test('units-basic:', function (t) {
//   let arr = [
//     // ['33km', 'km'],
//     ['33 km', 'km'],
//     ['40,000 mètres', 'mètres'],
//     ['1 pouce', 'pouce'],
//     ['2 pouces', 'pouces'],
//     ['seven hundred litres', 'litres'],
//     ['one litre', 'litre'],
//     ['0.4 mètre', 'meter'],
//     // ['3 km2', 'km2'],
//     ['3 km²', 'km²'],
//     // ['44 °c', '°c'],
//   ]
//   arr.forEach(a => {
//     let m = nlp(a[0]).numbers().units()
//     t.equal(m.out('normal'), a[1], here + a[0])
//   })
//   t.end()
// })


test('plus:', function (t) {
  let doc = nlp(`j'ai quatre vingt deux pommes`)
  doc.numbers().add(2)
  t.equal(doc.text(), `j'ai quatre vingt quatre pommes`, here + 'plus-2')

  doc = nlp(`j'ai moins quarante pommes`)
  doc.numbers().add(50)
  t.equal(doc.text(), `j'ai dix pommes`, here + 'plus-50')
  t.end()
})

test('minus:', function (t) {
  let doc = nlp(`j'ai quarante pommes`)
  doc.numbers().minus(50)
  t.equal(doc.text(), `j'ai moins dix pommes`, here + 'minus-50')

  doc = nlp(`j'ai moins quarante pommes`)
  doc.numbers().minus(50)
  t.equal(doc.text(), `j'ai moins quatre vingt dix pommes`, here + 'minus-50')
  t.end()
})