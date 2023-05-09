const normalize = function (m) {
  m = m.clone()
  // remove redundant day-names like 'Wed march 2nd'
  if (m.has('#WeekDay') && m.has('#Month') && m.has('#NumericValue')) {
    m.remove('#WeekDay')
  }
  // jusqu'à le quatorze juillet
  m.remove('(le|la)')
  // quatorze -> 14
  m.numbers().toCardinal().toNumber()
  // m.compute('index')
  return m
}
export default normalize