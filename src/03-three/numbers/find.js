const findNumbers = function (view) {
  let m = view.match('#Value+')

  //seventh fifth
  if (m.match('#Ordinal #Ordinal').match('#TextValue').found && !m.has('#Multiple')) {
    m = m.splitAfter('#Ordinal')
  }

  //fifth five
  m = m.splitBefore('#Ordinal [#Cardinal]', 0)
  //5-8
  m = m.splitAfter('#NumberRange')
  // june 5th 1999
  m = m.splitBefore('#Year')
  return m
}
export default findNumbers