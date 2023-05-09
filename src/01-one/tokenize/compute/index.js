import machine from './machine.js'

// cheat-method for a quick loop
const termLoop = function (view, fn) {
  let docs = view.docs
  for (let i = 0; i < docs.length; i += 1) {
    for (let t = 0; t < docs[i].length; t += 1) {
      fn(docs[i][t], view.world)
    }
  }
}
export default {
  machine: (view) => termLoop(view, machine),
}