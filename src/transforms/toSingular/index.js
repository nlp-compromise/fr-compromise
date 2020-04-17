const toSingular = function (str) {
  str = str.replace(/s$/, '')
  return str
}
module.exports = toSingular
