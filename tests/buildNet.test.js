import test from 'tape'
import nlp from './_lib.js'
const here = '[fr-buildNet] '

test('buildNet:', function (t) {
  const matches = [
    { match: '{crier/Verb}' },
    { match: '{jaune/Adjective}' },
    { match: '{troupe/Noun}' }
  ]
  const net = nlp.buildNet(matches)
  t.ok(net.hooks.crier, here + 'crier')
  t.ok(net.hooks.criaient, here + 'criaient')
  t.ok(net.hooks.criaient, here + 'criaient')
  t.ok(net.hooks.jaune, here + 'jaune')
  t.ok(net.hooks.jaunes, here + 'jaunes')
  t.ok(net.hooks.troupe, here + 'troupe')
  t.ok(net.hooks.troupes, here + 'troupes')
  t.end()
})