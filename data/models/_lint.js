import model from './verb/present-tense.js'

Object.keys(model).forEach(k => {
  let s = new Set()
  model[k].slice(1).forEach(str => {
    if (s.has(str)) {
      console.log(k, str)
    }
    s.add(str)
  })
})