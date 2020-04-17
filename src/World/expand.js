// conjugate and inflect words, to grow our lexicon out
const expandLex = function (lex, world) {
  let keys = Object.keys(lex)
  for (let i = 0; i < keys.length; i += 1) {
    let w = keys[i]
    let tag = lex[keys[i]]

    // conjugate verbs
    if (tag === 'Infinitive') {
      const conj = world.transforms.conjugate(w)
      let add = {}
      add[conj.je] = 'Verb'
      add[conj.tu] = 'Verb'
      add[conj.on] = 'Verb'
      add[conj.nous] = 'Verb'
      add[conj.vous] = 'Verb'
      add[conj.ils] = 'Verb'
      Object.assign(lex, add)
    }

    // masc/fem countries
    if (tag === 'Country') {
      // all countries ending with -e are feminine
      if (/e$/.test(w) === true) {
        lex[w] = ['Country', 'FemmeNoun']
      } else {
        lex[w] = ['Country', 'MascNoun']
      }
    }
  }
  return lex
}
module.exports = expandLex
