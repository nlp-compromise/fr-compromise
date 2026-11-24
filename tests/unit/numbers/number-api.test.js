import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-api] '

test('set with a string:', function (t) {
  const arr = [
    ['dix', `j'ai 10 euros`],
    ['10', `j'ai 10 euros`],
    ['vingt-cinq', `j'ai 25 euros`],
    ['zéro', `j'ai 0 euros`],
    // not a number - no change
    ['chat', `j'ai 4 euros`],
    ['', `j'ai 4 euros`],
  ]
  arr.forEach(a => {
    const [str, want] = a
    const doc = nlp(`j'ai 4 euros`)
    doc.numbers().set(str)
    t.equal(doc.text(), want, here + `set('${str}')`)
  })
  let doc = nlp(`j'ai quatre euros`)
  doc.numbers().set('dix')
  t.equal(doc.text(), `j'ai dix euros`, here + 'set text-value')

  doc = nlp(`j'ai 4 euros`)
  doc.numbers().set(10)
  t.equal(doc.text(), `j'ai 10 euros`, here + 'set number')
  t.end()
})

test('add/subtract with a string:', function (t) {
  const arr = [
    ['add', 'deux', `j'ai 6 euros`],
    ['add', '2', `j'ai 6 euros`],
    ['plus', 'cent', `j'ai 104 euros`],
    ['subtract', 'deux', `j'ai 2 euros`],
    ['minus', '1', `j'ai 3 euros`],
    // not a number - no change
    ['add', 'chat', `j'ai 4 euros`],
    ['subtract', 'chat', `j'ai 4 euros`],
  ]
  arr.forEach(a => {
    const [fn, str, want] = a
    const doc = nlp(`j'ai 4 euros`)
    doc.numbers()[fn](str)
    t.equal(doc.text(), want, here + `${fn}('${str}')`)
  })
  let doc = nlp(`j'ai 4 euros`)
  doc.numbers().subtract(1)
  t.equal(doc.text(), `j'ai 3 euros`, here + 'subtract number')
  doc.numbers().increment()
  t.equal(doc.text(), `j'ai 4 euros`, here + 'increment')
  doc.numbers().decrement()
  t.equal(doc.text(), `j'ai 3 euros`, here + 'decrement')
  doc = nlp(`j'ai quatre euros`)
  doc.numbers().add('deux')
  t.equal(doc.text(), `j'ai six euros`, here + 'add to text-value')
  t.end()
})

test('numbers json:', function (t) {
  const str = `j'ai 4 euros et 5 chats`
  let json = nlp(str).numbers().json()
  t.equal(json.length, 2, here + 'json() all')
  t.equal(json[0].number.num, 4, here + 'json() first')
  t.equal(json[1].number.num, 5, here + 'json() second')

  json = nlp(str).numbers().json(0)
  t.equal(json.length, 1, here + 'json(0) length')
  t.equal(json[0].number.num, 4, here + 'json(0) num')
  t.ok(json[0].terms, here + 'json(0) default options')

  json = nlp(str).numbers().json(1)
  t.equal(json.length, 1, here + 'json(1) length')
  t.equal(json[0].number.num, 5, here + 'json(1) num')

  json = nlp(str).numbers().json(9)
  t.deepEqual(json, [], here + 'json(9) empty')

  json = nlp(str).numbers().json({ terms: false })
  t.equal(json.length, 2, here + 'json(opts) length')
  t.equal(json[0].terms, undefined, here + 'json(opts) passes options')
  t.equal(json[1].number.num, 5, here + 'json(opts) num')
  t.end()
})

test('numbers empty results:', function (t) {
  const doc = nlp('bonjour tout le monde')
  t.deepEqual(doc.numbers().get(), [], here + 'get() empty')
  t.deepEqual(doc.numbers().parse(), [], here + 'parse() empty')
  t.deepEqual(doc.numbers().json(), [], here + 'json() empty')
  t.ok(Array.isArray(doc.numbers().get(0)), here + 'get(0) is array')

  const nums = nlp(`j'ai 4 euros et 5 chats`).numbers()
  t.deepEqual(nums.get(), [4, 5], here + 'get()')
  t.deepEqual(nums.get(1), [5], here + 'get(1)')
  t.deepEqual(nums.get(7), [], here + 'get(7)')
  t.equal(nums.parse().length, 2, here + 'parse()')
  t.equal(nums.parse(1)[0].num, 5, here + 'parse(1)')
  t.end()
})
