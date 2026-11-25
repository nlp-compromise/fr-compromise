import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-symbols] '
nlp.verbose(false)

const run = function (str, fn) {
  const doc = nlp(str)
  fn(doc.numbers())
  return doc.text()
}

// a symbol is never left stuck to a word - 'cinquante%'
test('percent toText:', function (t) {
  const doc = nlp('50%')
  doc.numbers().toText()
  t.equal(doc.text(), 'cinquante pour cent', here + '50% toText')
  t.deepEqual(doc.numbers().get(), [50], here + 'value')
  t.equal(doc.has('#Percent'), true, here + 'percent')
  t.deepEqual(doc.numbers().units().out('array'), ['pour cent'], here + 'unit')
  // and back - with a space before the symbol
  doc.numbers().toNumber()
  t.equal(doc.text(), '50 %', here + 'toNumber')
  t.deepEqual(doc.numbers().get(), [50], here + 'value, again')
  t.equal(doc.has('#Percent'), true, here + 'percent, again')
  t.deepEqual(doc.numbers().units().out('array'), ['%'], here + 'unit, again')
  doc.numbers().toText()
  t.equal(doc.text(), 'cinquante pour cent', here + '50 % toText')
  t.end()
})

test('symbol toText:', function (t) {
  const arr = [
    ['50%', 'cinquante pour cent', 50],
    ['50 %', 'cinquante pour cent', 50],
    ['1%', 'un pour cent', 1],
    ['il a 50% de chance', 'il a cinquante pour cent de chance', 50],
    ['il a -5% ici', 'il a moins cinq pour cent ici', -5],
    ['+5%', '+cinq pour cent', 5],
    // money
    ['5€', 'cinq euros', 5],
    ['€5', 'cinq euros', 5],
    ['5 €', 'cinq euros', 5],
    ['1€', 'un euro', 1],
    ['€1', 'un euro', 1],
    ['0€', 'zéro euro', 0],
    ['21€', 'vingt et un euros', 21],
    ['1 000 €', 'mille euros', 1000],
    ['$5', 'cinq dollars', 5],
    ['5$', 'cinq dollars', 5],
    ['$1', 'un dollar', 1],
    ['£5', 'cinq livres', 5],
    ['£1', 'une livre', 1],
    ['£21', 'vingt et une livres', 21],
    ['il a payé 5€ hier.', 'il a payé cinq euros hier.', 5],
    ['(5€)', '(cinq euros)', 5],
    // degrees
    ['20°', 'vingt degrés', 20],
    ['1°', 'un degré', 1],
    ['20°C', 'vingt degrés Celsius', 20],
    // a unit with no words gets a space
    ['5km', 'cinq km', 5],
    ['5kg', 'cinq kg', 5],
    ['5Kg', 'cinq Kg', 5],
    ['5litres', 'cinq litres', 5],
    ['il court 5km vite', 'il court cinq km vite', 5],
    ['5 km', 'cinq km', 5],
    // no words for these
    ['#5', '#5', 5],
    ['$400usd', '$400usd', 400],
    ['5,50€', '5,50€', 5.5],
    ['3,5km', '3,5km', 3.5],
    // unchanged
    ['+5', '+cinq', 5],
  ]
  arr.forEach(function (a) {
    const [str, want, num] = a
    const doc = nlp(str)
    const m = doc.numbers().toText()
    t.equal(doc.text(), want, here + str)
    // the same view still has the number
    t.deepEqual(m.get(), [num], here + str + ' chained value')
    // the new text is still a number
    t.deepEqual(doc.numbers().get(), [num], here + str + ' value')
    t.deepEqual(nlp(want).numbers().get(), [num], here + want + ' parses')
  })
  t.equal(run('1er', m => m.toText()), 'premier', here + '1er')
  t.end()
})

test('symbol round-trip:', function (t) {
  const arr = [
    ['50%', '50 %', 50],
    ['50 %', '50 %', 50],
    ['cinquante pour cent', '50 %', 50],
    ['5€', '5 euros', 5],
    ['€5', '5 euros', 5],
    ['5 €', '5 euros', 5],
    ['1€', '1 euro', 1],
    ['$5', '5 dollars', 5],
    ['20°', '20 degrés', 20],
    ['5km', '5 km', 5],
    ['5kg', '5 kg', 5],
    ['1er', '1er', 1],
  ]
  arr.forEach(function (a) {
    const [str, want, num] = a
    const doc = nlp(str)
    const m = doc.numbers().toText().toNumber()
    t.equal(doc.text(), want, here + str)
    t.deepEqual(m.get(), [num], here + str + ' chained value')
    t.deepEqual(doc.numbers().get(), [num], here + str + ' value')
  })
  // the role of the number is kept
  let doc = nlp('50%')
  doc.numbers().toText().toNumber()
  t.equal(doc.has('#Percent'), true, here + 'percent')
  doc = nlp('€5')
  doc.numbers().toText()
  t.equal(doc.has('#Money'), true, here + 'money')
  doc.numbers().toNumber()
  t.equal(doc.has('#Money'), true, here + 'money, again')
  // units
  doc = nlp('5km')
  t.deepEqual(doc.numbers().toText().units().out('array'), ['km'], here + 'km unit')
  doc = nlp('20°')
  t.deepEqual(doc.numbers().toText().units().out('array'), ['degrés'], here + 'degrés unit')
  // a number that is already written is left alone
  t.equal(run('5 euros', m => m.toNumber()), '5 euros', here + '5 euros')
  t.equal(run('cinq euros', m => m.toNumber()), '5 euros', here + 'cinq euros')
  t.equal(run('cinq euros', m => m.toText()), 'cinq euros', here + 'cinq euros toText')
  t.equal(run('5%', m => m.toNumber()), '5%', here + '5% toNumber')
  t.end()
})

test('symbol math:', function (t) {
  const arr = [
    // [str, add(1), set(7), subtract(2)]
    ['50%', '51%', '7%', '48%'],
    ['50 %', '51 %', '7 %', '48 %'],
    ['5€', '6€', '7€', '3€'],
    ['€5', '€6', '€7', '€3'],
    ['5 €', '6 €', '7 €', '3 €'],
    ['$5', '$6', '$7', '$3'],
    ['20°', '21°', '7°', '18°'],
    ['20°C', '21°C', '7°C', '18°C'],
    ['5km', '6km', '7km', '3km'],
    ['5kg', '6kg', '7kg', '3kg'],
    ['5Kg', '6Kg', '7Kg', '3Kg'],
    ['5litres', '6litres', '7litres', '3litres'],
    ['3,5km', '4,5km', '7km', '1,5km'],
    ['il a -5% ici', 'il a -4% ici', 'il a 7% ici', 'il a -7% ici'],
    ['+5%', '+6%', '+7%', '+3%'],
    ['cinquante pour cent', 'cinquante et un pour cent', 'sept pour cent', 'quarante-huit pour cent'],
    ['cinq euros', 'six euros', 'sept euros', 'trois euros'],
    ['un euro', 'deux euros', 'sept euros', 'moins un euro'],
    ['deux euros', 'trois euros', 'sept euros', 'zéro euro'],
  ]
  arr.forEach(function (a) {
    const [str, add, set, minus] = a
    t.equal(run(str, m => m.add(1)), add, here + str + ' add')
    t.equal(run(str, m => m.increment()), add, here + str + ' increment')
    t.equal(run(str, m => m.set(7)), set, here + str + ' set')
    t.equal(run(str, m => m.subtract(2)), minus, here + str + ' subtract')
    // the value follows
    const before = nlp(str).numbers().get()[0]
    const doc = nlp(str)
    t.deepEqual(doc.numbers().add(1).get(), [before + 1], here + str + ' chained value')
    t.deepEqual(doc.numbers().get(), [before + 1], here + str + ' value')
  })
  // the unit agrees
  t.equal(run('5€', m => m.toText().set(1)), 'un euro', here + 'singular')
  t.equal(run('1€', m => m.toText().add(1)), 'deux euros', here + 'plural')
  // a negative number past zero
  t.equal(run('il a -5% ici', m => m.add(10)), 'il a 5% ici', here + '-5% + 10')
  t.equal(run('il a 5% ici', m => m.subtract(10)), 'il a -5% ici', here + '5% - 10')
  // tags are kept
  let doc = nlp('50%')
  doc.numbers().add(1)
  t.equal(doc.has('#Percent'), true, here + 'percent')
  doc = nlp('5km')
  doc.numbers().add(1)
  t.equal(doc.has('#Unit'), true, here + '6km unit')
  t.equal(doc.terms().length, 2, here + '6km is still split')
  t.end()
})

test('symbol ordinals:', function (t) {
  // an amount has no ordinal
  const arr = ['50%', '50 %', 'cinquante pour cent', '5€', '€5', '5 €', '1€', '$5', 'cinq euros', '5km', '5kg', '20°']
  arr.forEach(function (str) {
    t.equal(run(str, m => m.toOrdinal()), str, here + str + ' toOrdinal')
    t.equal(run(str, m => m.toCardinal()), str, here + str + ' toCardinal')
    t.equal(run(str, m => m.toOrdinal().toCardinal()), str, here + str + ' both')
  })
  // but a number beside a unit does
  t.equal(run('5 km', m => m.toOrdinal()), '5e km', here + '5 km')
  t.equal(run('5e km', m => m.toCardinal()), '5 km', here + '5e km')
  t.equal(run('1er', m => m.toCardinal()), '1', here + '1er')
  t.end()
})

test('symbols in a sentence:', function (t) {
  const str = 'il paie 5€ pour 50% de 3km, soit $7 à 20°.'
  const doc = nlp(str)
  const m = doc.numbers()
  t.deepEqual(m.toText().get(), [5, 50, 3, 7, 20], here + 'toText values')
  t.equal(doc.text(), 'il paie cinq euros pour cinquante pour cent de trois km, soit sept dollars à vingt degrés.', here + 'toText')
  t.deepEqual(m.out('array'), ['cinq', 'cinquante', 'trois', 'sept', 'vingt'], here + 'the view is the numbers')
  t.deepEqual(m.toNumber().get(), [5, 50, 3, 7, 20], here + 'toNumber values')
  t.equal(doc.text(), 'il paie 5 euros pour 50 % de 3 km, soit 7 dollars à 20 degrés.', here + 'toNumber')
  t.equal(run(str, n => n.add(1)), 'il paie 6€ pour 51% de 4km, soit $8 à 21°.', here + 'add')
  t.equal(run(str, n => n.toOrdinal()), str, here + 'toOrdinal')
  t.end()
})

test('symbol parse:', function (t) {
  t.deepEqual(nlp('20°').numbers().get(), [20], here + '20°')
  t.deepEqual(nlp('il fait 20°C').numbers().get(), [20], here + '20°C')
  t.deepEqual(nlp('-3°').numbers().get(), [-3], here + '-3°')
  // the end of a unit is not an ordinal
  t.equal(nlp('5litres').numbers().parse()[0].suffix, 'litres', here + 'litres')
  t.equal(nlp('5tonnes').numbers().parse()[0].suffix, 'tonnes', here + 'tonnes')
  t.equal(nlp('5km').numbers().parse()[0].suffix, 'km', here + 'km')
  t.equal(nlp('50%').numbers().parse()[0].suffix, '%', here + '%')
  t.equal(nlp('€5').numbers().parse()[0].prefix, '€', here + '€')
  t.equal(nlp('2e').numbers().parse()[0].suffix, '', here + '2e')
  t.equal(nlp('1re').numbers().parse()[0].suffix, '', here + '1re')
  t.end()
})
