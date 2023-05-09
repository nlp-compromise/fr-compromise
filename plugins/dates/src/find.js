const findDates = function (doc) {
  let m = doc.match('#Date+')
  // 7 jun 2018
  m = m.growLeft('#Value+$')
  m = m.growRight('^#Value+')
  // pendant juin
  m = m.growLeft('(le|la)$')// jusqu'a le
  m = m.growLeft('(en|entre|depuis|courant|pendant|dans|lorsque|avant|après|à|a|au)$')
  m = m.growLeft('au cours de$')
  m = m.growLeft('jusque$')// jusqu'en jusqu'à 
  // sept-et-jun
  m = m.growRight('^et (le|la)? #Date+')

  // remove overlaps
  m = m.settle()
  // m.debug()
  return m
}
export default findDates