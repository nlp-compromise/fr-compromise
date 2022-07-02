// a smoke-test for our typescipt typings
import frCompromise from '../'
import tape from 'tape'
console.log('\n 🥗  - running types-test..\n')

tape('misc functions', function (t) {
  let doc = frCompromise('John and Joe walked to the store')
  let m = doc.filter(s => s.found)
  let b = doc.map(s => s)
  doc.forEach((s) => s)
  let o = doc.find(s => s.found)
  m = doc.some(s => s.found)
  m = doc.random()
  m = doc.all()
  m = doc.eq(0)
  m = doc.first()
  m = doc.firstTerms()
  m = doc.fullSentences()
  m = doc.last()
  m = doc.lastTerms()
  m = doc.none()
  m = doc.slice(0, 1)
  m = doc.terms()
  m = doc.update([])
  m = doc.toView([])
  m = doc.fromText('')
  m = doc.clone()
  let obj = doc.groups()
  let arr = doc.termList()
  let c = doc.wordCount()
  doc.fullPointer
  doc.docs
  doc.pointer
  doc.methods
  doc.model
  doc.hooks
  doc.isView
  doc.found
  doc.length

  // One
  doc.compute('id')
  // change
  m = doc.toLowerCase()
  m = doc.toUpperCase()
  m = doc.toTitleCase()
  m = doc.toCamelCase()
  m = doc.insertAfter('asdf')
  m = doc.insertBefore('boo')
  m = doc.append('foo')
  m = doc.prepend('foo')
  m = doc.insert('bar')
  m = doc.match('flood').replaceWith('asf')
  m = doc.replace('m', 'woo')
  m = doc.remove('foo')
  m = doc.delete('bar')
  m = doc.pre(' ')
  m = doc.post(' ')
  m = doc.trim()
  m = doc.hyphenate()
  m = doc.dehyphenate()
  m = doc.toQuotations()
  m = doc.toParentheses()
  m = doc.deHyphenate()
  m = doc.toQuotation()
  m = doc.unique()
  m = doc.reverse()
  m = doc.sort()
  m = doc.concat(doc.none())
  // doc.fork()

  doc.compute('contractions')
  doc.compute('lexicon')
  doc.lookup(['blue jays', 'farmer'])

  // match
  m = doc.matchOne('#Foo')
  m = doc.match('#Foo')
  let bool = doc.has('#Foo')
  m = doc.if('#Foo')
  m = doc.ifNo('#Foo')
  m = doc.before('#Foo')
  m = doc.after('#Foo')
  m = doc.growLeft('#Foo')
  m = doc.growRight('#Foo')
  m = doc.grow('#Foo')
  m = doc.splitOn('#Foo')
  m = doc.splitBefore('#Foo')
  m = doc.splitAfter('#Foo')
  m = doc.split('#Foo')

  // output
  let res = doc.out()
  let txt = doc.text()
  txt = doc.text('normal')
  txt = doc.text('machine')
  txt = doc.text('root')
  txt = doc.text('implicit')
  txt = doc.json()

  // sets
  m = doc.union('blah')
  m = doc.and('blah')
  m = doc.intersection('blah')
  m = doc.difference('blah')
  m = doc.not('blah')
  m = doc.complement('blah')
  m = doc.settle('blah')

  m = doc.tag('Foo')
  m = doc.tagSafe('Foo')
  m = doc.unTag('Foo')
  m = doc.canBe('Foo')

  doc.compute('alias')
  doc.compute('normal')
  doc.compute('machine')
  doc.compute('freq')
  doc.compute('offset')
  doc.compute('index')
  doc.compute('wordCount')

  doc.compute('typeahead')
  doc.autoFill()

  // sweep
  let matches = [
    { match: '2nd quarter of? 2022', tag: 'TimePeriod' },
    { match: '(from|by|before) now', tag: 'FooBar' },
  ]
  let net = frCompromise.buildNet(matches)
  doc = frCompromise(`so good by now. woo hoo before now. in the 2nd quarter 2022`)
  let sr = doc.sweep(net)

  // lazy
  doc = frCompromise.lazy('hello', 'foo')

  t.ok(true)
  t.end()
})



