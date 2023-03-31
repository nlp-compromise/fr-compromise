const findDate = function (doc) {
  let m = doc.match('#Date+')
  m = m.growLeft('#Value+')
  m = m.growRight('#Value+')
  return m
}
export default findDate