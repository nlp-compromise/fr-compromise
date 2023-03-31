const findDate = function (doc) {
  let m = doc.match('#Date+')
  m = m.growLeft('(en|entre|depuis|avant|après')
  m = m.growLeft('jusque (en|à)')// jusqu'en jusqu'à 
  m = m.growLeft('#Value+')
  m = m.growRight('#Value+')
  return m
}
export default findDate