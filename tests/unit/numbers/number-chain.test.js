import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-chain] '
nlp.verbose(false)

// moved from tests/_hmm/numbers.hmm.js
test('get after add:', function (t) {
  t.deepEqual(nlp('cinq').numbers().add(2).get(), [7], here + 'text')
  t.deepEqual(nlp('5').numbers().add(2).get(), [7], here + 'digits')
  t.deepEqual(nlp('cinq').numbers().set(7).get(), [7], here + 'set')
  t.end()
})

// 'sept' is a number first, and an abbreviated month only in a date
test('sept is seven:', function (t) {
  const arr = [
    ['sept', [7]],
    ['sept chats', [7]],
    ["j'ai sept chats", [7]],
    ['les sept nains', [7]],
    ['il y a sept ans', [7]],
    ['sept ou huit', [7, 8]],
    ['vingt et sept', [27]],
    ['sept cent', [700]],
    // dates
    ['le 5 sept', [5]],
    ['le 12 sept. 2020', [12, 2020]],
    ['sept 2020', [2020]],
    ['sept et oct', []],
    ['oct et sept', []],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    t.deepEqual(nlp(str).numbers().get(), want, here + str)
  })
  t.equal(nlp('sept chats').has('#Month'), false, here + 'sept chats is no month')
  t.equal(nlp('le 5 sept').has('#Month'), true, here + '5 sept is a month')
  t.equal(nlp('sept 2020').has('#Month'), true, here + 'sept 2020 is a month')
  t.end()
})

test('chained number changes:', function (t) {
  let doc = nlp('cinq chats')
  t.deepEqual(doc.numbers().add(2).get(), [7], here + 'add get')
  t.equal(doc.text(), 'sept chats', here + 'add text')

  doc = nlp('cinq chats')
  t.deepEqual(doc.numbers().add(2).add(1).get(), [8], here + 'add add')
  t.equal(doc.text(), 'huit chats', here + 'add add text')

  doc = nlp('cinq chats')
  t.deepEqual(doc.numbers().set(10).get(), [10], here + 'set get')
  t.deepEqual(doc.numbers().increment().get(), [11], here + 'increment get')
  t.deepEqual(doc.numbers().decrement().subtract(3).get(), [7], here + 'decrement subtract')
  t.equal(doc.text(), 'sept chats', here + 'set text')

  doc = nlp('cinq chats')
  t.deepEqual(doc.numbers().toNumber().toText().get(), [5], here + 'toNumber toText')
  t.equal(doc.text(), 'cinq chats', here + 'toNumber toText text')
  t.deepEqual(doc.numbers().toText().toNumber().get(), [5], here + 'toText toNumber')
  t.equal(doc.text(), '5 chats', here + 'toText toNumber text')

  doc = nlp('dix-sept chats')
  t.deepEqual(doc.numbers().toOrdinal().get(), [17], here + 'toOrdinal get')
  t.equal(doc.text(), 'dix-septième chats', here + 'toOrdinal text')
  t.deepEqual(doc.numbers().toCardinal().get(), [17], here + 'toCardinal get')
  t.equal(doc.text(), 'dix-sept chats', here + 'toCardinal text')
  t.end()
})

// a change in the length of a number must not move the view off of it
test('number view follows its changes:', function (t) {
  let doc = nlp('cinq chats')
  let m = doc.numbers()
  m.set(21)
  t.equal(doc.text(), 'vingt et un chats', here + 'longer')
  t.deepEqual(m.get(), [21], here + 'longer get')
  t.equal(m.text(), 'vingt et un', here + 'longer view')
  m.add(79)
  t.equal(doc.text(), 'cent chats', here + 'shorter')
  t.deepEqual(m.get(), [100], here + 'shorter get')
  m.toNumber()
  t.equal(doc.text(), '100 chats', here + 'numeric')
  m.increment()
  t.equal(doc.text(), '101 chats', here + 'numeric increment')
  m.toText()
  t.equal(doc.text(), 'cent un chats', here + 'text again')
  t.deepEqual(m.get(), [101], here + 'text again get')

  // two numbers in one sentence
  doc = nlp('quatre-vingt-dix-neuf ballons et trois chats')
  m = doc.numbers()
  t.deepEqual(m.add(1).get(), [100, 4], here + 'two add')
  t.deepEqual(m.get(), [100, 4], here + 'two original view')
  t.equal(doc.text(), 'cent ballons et quatre chats', here + 'two text')
  t.deepEqual(m.add(21).get(), [121, 25], here + 'two add again')
  t.equal(doc.text(), 'cent vingt et un ballons et vingt-cinq chats', here + 'two text again')
  t.deepEqual(m.toNumber().get(), [121, 25], here + 'two toNumber')
  t.equal(doc.text(), '121 ballons et 25 chats', here + 'two numeric text')
  t.equal(m.length, 2, here + 'still two numbers')
  t.end()
})

// the new words are found as a number again
test('changed number is re-tagged:', function (t) {
  for (let n = 0; n <= 130; n += 1) {
    const doc = nlp('cinq chats')
    doc.numbers().set(n)
    t.deepEqual(doc.numbers().get(), [n], here + `set ${n} - '${doc.text()}'`)
  }
  const doc = nlp('cinq chats')
  doc.numbers().set(21)
  t.equal(doc.match('#Value+').text(), 'vingt et un', here + 'et un is a value')
  doc.numbers().toOrdinal()
  t.equal(doc.text(), 'vingt et unième chats', here + 'ordinal text')
  t.equal(doc.match('#Ordinal').text(), 'unième', here + 'only the last word is ordinal')
  t.deepEqual(doc.numbers().get(), [21], here + 'ordinal get')
  // other tags are kept
  const money = nlp('cinq euros')
  money.numbers().add(2)
  t.equal(money.text(), 'sept euros', here + 'money text')
  t.equal(money.has('#Money'), true, here + 'money tag is kept')
  t.end()
})
