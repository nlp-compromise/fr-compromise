// this is gonna be hard.
const toInfinitive = function (str) {
  str = str.replace(/ons$/, '')
  str = str.replace(/ent$/, '')
  str = str.replace(/ez$/, '')
  str = str.replace(/s$/, '')
  return str
}
module.exports = toInfinitive
