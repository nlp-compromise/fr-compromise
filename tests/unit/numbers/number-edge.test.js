import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-edge] '
nlp.verbose(false)

test('number parse edge-cases:', function (t) {
  const arr = [
    ['zéro', 0],
    ['0', 0],
    ['-5', -5],
    ['moins cinq', -5],
    ['0,5', 0.5],
    ['1.5', 1.5],
    // 'et' forms
    ['vingt et un', 21],
    ['vingt-et-un', 21],
    ['soixante et onze', 71],
    // base-twenty forms
    ['soixante-dix', 70],
    ['soixante quinze', 75],
    ['quatre-vingts', 80],
    ['quatre vingt', 80],
    ['quatre-vingt-dix-neuf', 99],
    // cent/mille
    ['cent un', 101],
    ['deux cents', 200],
    ['deux cent un', 201],
    ['dix mille', 10000],
    ['cent mille', 100000],
    ['mille neuf cent quatre-vingt-dix-neuf', 1999],
    ['un million', 1000000],
    ['deux millions trois cent mille', 2300000],
    ['un milliard', 1000000000],
    // ordinals
    ['deuxième', 2],
    ['vingt et unième', 21],
    ['centième', 100],
    ['millième', 1000],
    ['1er', 1],
    ['1re', 1],
    ['21e', 21],
    // symbols
    ['50%', 50],
    ['€12', 12],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    t.deepEqual(nlp(str).numbers().get(), [want], here + str)
  })
  t.end()
})

test('number filters:', function (t) {
  const doc = nlp('il a 3 chats, 10 chiens et cent oiseaux')
  const arr = m => m.out('array')
  t.deepEqual(doc.numbers().get(), [3, 10, 100], here + 'get')
  t.deepEqual(arr(doc.numbers().greaterThan(5)), ['10', 'cent'], here + 'greaterThan')
  t.deepEqual(arr(doc.numbers().greaterThan(100)), [], here + 'greaterThan is exclusive')
  t.deepEqual(arr(doc.numbers().lessThan(10)), ['3'], here + 'lessThan is exclusive')
  t.deepEqual(arr(doc.numbers().between(3, 100)), ['10'], here + 'between is exclusive')
  t.deepEqual(arr(doc.numbers().isBetween(2, 50)), ['3', '10'], here + 'isBetween')
  t.deepEqual(arr(doc.numbers().isEqual(100)), ['cent'], here + 'isEqual')
  t.deepEqual(arr(doc.numbers().equals(10)), ['10'], here + 'equals')
  t.deepEqual(arr(doc.numbers().isEqual(4)), [], here + 'isEqual none')
  t.deepEqual(arr(doc.numbers().isCardinal()), ['3', '10', 'cent'], here + 'isCardinal')
  t.deepEqual(arr(doc.numbers().isOrdinal()), [], here + 'isOrdinal')
  // filters can be chained, and keep their methods
  t.deepEqual(doc.numbers().greaterThan(5).lessThan(50).get(), [10], here + 'chained filters')
  t.equal(doc.numbers().greaterThan(5).viewType, 'Numbers', here + 'still a Numbers view')
  t.end()
})

test('number nth + alias:', function (t) {
  const doc = nlp(`j'ai deux chats et trois chiens`)
  t.deepEqual(doc.numbers().out('array'), ['deux', 'trois'], here + 'numbers()')
  t.deepEqual(doc.values().out('array'), ['deux', 'trois'], here + 'values()')
  t.equal(doc.numbers(0).text(), 'deux', here + 'numbers(0)')
  t.equal(doc.numbers(1).text(), 'trois', here + 'numbers(1)')
  t.equal(doc.values(1).text(), 'trois', here + 'values(1)')
  t.equal(doc.numbers(9).found, false, here + 'numbers(9)')
  doc.numbers(1).toNumber()
  t.equal(doc.text(), `j'ai deux chats et 3 chiens`, here + 'numbers(1).toNumber()')
  t.equal(nlp('').numbers().found, false, here + 'empty document')
  t.end()
})

test('number toText spelling rules:', function (t) {
  const arr = [
    ['0', 'zéro'],
    ['-5', 'moins cinq'],
    ['21', 'vingt et un'],
    ['71', 'soixante et onze'],
    // 'quatre-vingts' loses its -s before another number
    ['80', 'quatre-vingts'],
    ['81', 'quatre-vingt-un'],
    ['91', 'quatre-vingt-onze'],
    // so does 'cents'
    ['100', 'cent'],
    ['200', 'deux cents'],
    ['201', 'deux cent un'],
    // 'mille' is invariable
    ['1000', 'mille'],
    ['2000', 'deux mille'],
    ['1000000', 'un million'],
    ['3e', 'troisième'],
    // already text
    ['cinq', 'cinq'],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    const doc = nlp(str)
    doc.numbers().toText()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('number toNumber:', function (t) {
  const arr = [
    [`j'ai deux chats et trois chiens`, `j'ai 2 chats et 3 chiens`],
    ['vingt et un', '21'],
    ['quatre-vingt-dix-neuf ballons', '99 ballons'],
    ['mille neuf cent', '1900'],
    ['le troisième jour', 'le 3e jour'],
    ['moins cinq', '-5'],
    // already a number
    ['5 chats', '5 chats'],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    const doc = nlp(str)
    doc.numbers().toNumber()
    t.equal(doc.text(), want, here + str)
  })
  t.end()
})

test('number math edge-cases:', function (t) {
  const run = function (str, fn) {
    const doc = nlp(str)
    fn(doc.numbers())
    return doc.text()
  }
  t.equal(run('neuf', m => m.increment()), 'dix', here + 'increment')
  t.equal(run('dix', m => m.decrement()), 'neuf', here + 'decrement')
  t.equal(run('zéro', m => m.decrement()), 'moins un', here + 'decrement below zero')
  t.equal(run('cinq', m => m.subtract(5)), 'zéro', here + 'subtract to zero')
  t.equal(run('99', m => m.increment()), '100', here + 'increment 99')
  t.equal(run('quatre-vingt-dix-neuf', m => m.increment()), 'cent', here + 'increment text 99')
  t.equal(run('cinq chats et 6 chiens', m => m.set(7)), 'sept chats et 7 chiens', here + 'set keeps each format')
  t.equal(run('cinq', m => m.set(0)), 'zéro', here + 'set text to zero')
  t.equal(run('5', m => m.set(0)), '0', here + 'set number to zero')
  t.equal(run('troisième', m => m.set(5)), 'cinquième', here + 'set keeps ordinal')
  // invalid input does nothing
  t.equal(run('cinq', m => m.add(0)), 'cinq', here + 'add zero')
  t.equal(run('cinq', m => m.add('foo')), 'cinq', here + 'add non-number')
  t.equal(run('cinq', m => m.add(NaN)), 'cinq', here + 'add NaN')
  t.equal(run('cinq', m => m.subtract('foo')), 'cinq', here + 'subtract non-number')
  t.equal(run('cinq', m => m.set('foo')), 'cinq', here + 'set non-number')
  t.equal(run('cinq', m => m.set()), 'cinq', here + 'set undefined')
  // nothing to change
  t.equal(run('le chat dort', m => m.add(2).toText().toOrdinal()), 'le chat dort', here + 'no numbers')
  t.end()
})

test('number chaining:', function (t) {
  const doc = nlp('3 chats')
  const m = doc.numbers().toText()
  t.equal(doc.text(), 'trois chats', here + 'toText')
  m.toOrdinal()
  t.equal(doc.text(), 'troisième chats', here + 'toOrdinal')
  doc.numbers().toCardinal().toNumber()
  t.equal(doc.text(), '3 chats', here + 'and back')
  t.equal(nlp('cinq').numbers().add(2).viewType, 'Numbers', here + 'add returns Numbers')
  t.equal(nlp('cinq').numbers().toOrdinal().viewType, 'Numbers', here + 'toOrdinal returns Numbers')
  t.end()
})

test('number units:', function (t) {
  t.deepEqual(nlp('trois kilos de pommes').numbers().units().out('array'), ['kilos'], here + 'kilos')
  t.deepEqual(nlp('il court 5 km').numbers().units().out('array'), ['km'], here + 'km')
  t.equal(nlp('cinq chats').numbers().units().found, false, here + 'no unit')
  t.end()
})
