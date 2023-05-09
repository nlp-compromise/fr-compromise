const normalize = function (m) {
  m = m.clone()
  // remove redundant day-names like 'Wed march 2nd'
  if (m.has('#WeekDay') && m.has('#Month') && m.has('#NumericValue')) {
    m.remove('#WeekDay')
  }
  // quatorze -> 14
  m.numbers().toCardinal().toNumber()
  // m.compute('index')
  // m.debug()
  return m
}
export default normalize