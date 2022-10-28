import test from 'tape'
import nlp from './_lib.js'
let here = '[fr-buildNet] '
nlp.verbose(false)

test('buildNet:', function (t) {
  let matches = [
    { match: '{crier/Verb}', val: 'yell-verb-01' },
    { match: '{jaune/Adjective}', val: 'yellow-adjective-01' },
    { match: '{fil/Noun}', val: 'wire-noun-01' }
  ]
  let net = nlp.buildNet(matches)
  t.ok(net.hooks.criaient, 'criaient')
  t.ok(net.hooks.criaient, 'criaient')
  t.ok(net.hooks.jaune, 'jaune')
  t.ok(net.hooks.jaunes, 'jaunes')
  t.end()
})