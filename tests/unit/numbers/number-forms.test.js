import test from 'tape'
import nlp from '../../_lib.js'
const here = '[number-forms] '
nlp.verbose(false)

const get = str => nlp(str).numbers().get()
const run = function (str, fn) {
  const doc = nlp(str)
  fn(doc.numbers())
  return doc.text()
}

// belgian + swiss number-words
test('regional numbers:', function (t) {
  const arr = [
    ['septante', 70],
    ['huitante', 80],
    ['octante', 80],
    ['nonante', 90],
    ['nonante-neuf', 99],
    ['septante et un', 71],
    ['huitante-huit', 88],
    ['nonantième', 90],
    ['septante-deuxième', 72],
    ['deux cent nonante', 290],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    t.deepEqual(get(str), [want], here + str)
  })
  // they are written in standard french
  t.equal(run('septante', m => m.toNumber()), '70', here + 'septante toNumber')
  t.equal(run('nonante-neuf', m => m.add(1)), 'cent', here + 'nonante-neuf add')
  t.equal(run('septante', m => m.toOrdinal()), 'soixante-dixième', here + 'septante toOrdinal')
  t.end()
})

test('premier:', function (t) {
  t.deepEqual(get('le premier jour'), [1], here + 'premier')
  t.deepEqual(get('la première fois'), [1], here + 'première')
  t.deepEqual(get('premier ministre'), [1], here + 'premier noun')
  t.equal(nlp('le premier jour').numbers().isOrdinal().found, true, here + 'premier is ordinal')
  // 'premier' does not join another number
  t.deepEqual(get('les deux premiers jours'), [2, 1], here + 'deux premiers')
  // a lone 'premier' is still an adjective
  t.equal(nlp('premier').has('#Adjective'), true, here + 'lone premier')
  t.equal(nlp('le premier décembre').has('#Month'), true, here + 'premier décembre')

  t.equal(run('1er', m => m.toText()), 'premier', here + '1er toText')
  t.equal(run('1re', m => m.toText()), 'première', here + '1re toText')
  t.equal(run('la 1ère fois', m => m.toText()), 'la première fois', here + '1ère toText')
  t.equal(run('le premier jour', m => m.toNumber()), 'le 1er jour', here + 'premier toNumber')
  t.equal(run('la première fois', m => m.toNumber()), 'la 1re fois', here + 'première toNumber')
  t.equal(run('le premier jour', m => m.toCardinal()), 'le un jour', here + 'premier toCardinal')
  t.equal(run('1 chat', m => m.toOrdinal()), '1er chat', here + '1 toOrdinal')
  t.equal(run('1 chat', m => m.toText().toOrdinal()), 'premier chat', here + '1 toText toOrdinal')
  // only 1 is '1er'
  t.equal(run('21 chats', m => m.toOrdinal()), '21e chats', here + '21 toOrdinal')
  t.equal(run('11 chats', m => m.toOrdinal()), '11e chats', here + '11 toOrdinal')
  t.equal(run('21e', m => m.toText()), 'vingt et unième', here + '21e toText')
  // the new word is found again
  const doc = nlp('1er')
  t.deepEqual(doc.numbers().toText().get(), [1], here + 'chained get')
  t.deepEqual(doc.numbers().get(), [1], here + 'premier is found again')
  t.end()
})

// 'un' is an article - but a lone 'un chat' is a count
test('un:', function (t) {
  t.equal(run('un chat', m => m.toOrdinal()), 'premier chat', here + 'un toOrdinal')
  t.equal(run('une pomme', m => m.toOrdinal()), 'première pomme', here + 'une toOrdinal')
  t.equal(run('un chat', m => m.toNumber()), '1 chat', here + 'un toNumber')
  t.deepEqual(get(`j'ai un chat`), [], here + 'article')
  t.deepEqual(get('un petit chat dort'), [], here + 'article in a sentence')
  t.deepEqual(get('vingt et une pommes'), [21], here + 'vingt et une')
  t.end()
})

test('numeric ordinal suffixes:', function (t) {
  const arr = [
    ['2ème', 2],
    ['2eme', 2],
    ['2ième', 2],
    ['2e', 2],
    ['2es', 2],
    ['2nd', 2],
    ['2nde', 2],
    ['3ème', 3],
    ['21ème', 21],
    ['1er', 1],
    ['1ers', 1],
    ['1re', 1],
    ['1ère', 1],
    ['1ere', 1],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    const m = nlp(str).numbers()
    t.deepEqual(m.get(), [want], here + str)
    t.equal(m.isOrdinal().found, true, here + str + ' is ordinal')
    t.equal(nlp(str).terms().length, 1, here + str + ' is one term')
  })
  t.equal(run('le 3ème étage', m => m.toText()), 'le troisième étage', here + '3ème toText')
  t.equal(run('2nde', m => m.toCardinal()), '2', here + '2nde toCardinal')
  t.equal(run('2ème', m => m.add(1)), '3e', here + '2ème add')
  // units are still split
  t.equal(nlp('5km').has('#Unit'), true, here + '5km')
  t.end()
})

test('pour cent:', function (t) {
  const arr = [
    ['cinquante pour cent', 50, 'pour cent'],
    ['vingt-cinq pour cent des gens', 25, 'pour cent'],
    ['cent pour cent', 100, 'pour cent'],
    ['50 pour cent', 50, 'pour cent'],
    ['50 %', 50, '%'],
    ['12,5 %', 12.5, '%'],
  ]
  arr.forEach(function (a) {
    const [str, want, unit] = a
    const m = nlp(str).numbers()
    t.equal(m.length, 1, here + 'one number: ' + str)
    t.equal(m.get()[0], want, here + 'value: ' + str)
    t.equal(m.has('#Percent'), true, here + 'percent: ' + str)
    t.deepEqual(m.units().out('array'), [unit], here + 'unit: ' + str)
  })
  t.deepEqual(get('50%'), [50], here + '50%')
  t.equal(nlp('50%').has('#Percent'), true, here + '50% percent')
  // written with the symbol, and a space before it
  t.equal(run('cinquante pour cent', m => m.toNumber()), '50 %', here + 'toNumber')
  t.equal(run('cinquante pour cent', m => m.add(1)), 'cinquante et un pour cent', here + 'add')
  // a rate - 'per hundred-thousand'
  t.deepEqual(get('cinq pour cent mille habitants'), [5, 100000], here + 'pour cent mille')
  t.end()
})

test('fractions:', function (t) {
  const arr = [
    ['1/2', 0.5],
    ['3/4', 0.75],
    ['1/2 litre', 0.5],
    ['trois quarts', 0.75],
    ['les trois quarts des gens', 0.75],
    ['deux tiers', 2 / 3],
    ['un quart', 0.25],
    ['un demi', 0.5],
    ['un tiers', 1 / 3],
    [`un quart d'heure`, 0.25],
    ['un tiers des voix', 1 / 3],
  ]
  arr.forEach(function (a) {
    const [str, want] = a
    t.deepEqual(get(str), [want], here + str)
  })
  // not fractions
  t.deepEqual(get('le quart'), [], here + 'le quart')
  t.deepEqual(get('payé par un tiers'), [], here + 'un tiers is a person')
  // nothing sensible to write
  t.equal(run('trois quarts', m => m.toNumber()), 'trois quarts', here + 'toNumber')
  t.equal(run('trois quarts', m => m.toOrdinal()), 'trois quarts', here + 'toOrdinal')
  t.equal(run('trois quarts', m => m.add(1)), 'trois quarts', here + 'add')
  t.equal(run('1/2', m => m.toText()), '1/2', here + 'toText')
  t.equal(run('trois quarts', m => m.set(5)), 'cinq', here + 'set')
  t.end()
})

test('decimal-comma is kept:', function (t) {
  t.equal(run('1,5 litre', m => m.add(1)), '2,5 litre', here + 'add')
  t.equal(run('2,5', m => m.subtract(1)), '1,5', here + 'subtract')
  t.equal(run('1,5', m => m.set(3.25)), '3,25', here + 'set')
  t.equal(run('1,5', m => m.add(0.5)), '2', here + 'add to a whole number')
  t.equal(run('0,1', m => m.add(0.2)), '0,3', here + 'no float noise')
  t.equal(run('1.5', m => m.add(1)), '2.5', here + 'decimal-point is kept too')
  t.equal(run('1,5 litre', m => m.toText()), '1,5 litre', here + 'toText')
  const doc = nlp('1,5 litre')
  t.deepEqual(doc.numbers().add(1).get(), [2.5], here + 'chained get')
  t.equal(doc.numbers().parse()[0].hasDecimalComma, true, here + 'hasDecimalComma')
  t.equal(nlp('1.5').numbers().parse()[0].hasDecimalComma, false, here + 'no decimal-comma')
  t.end()
})
