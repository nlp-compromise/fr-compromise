// words that end in a period, but don't end a sentence - 'Dr.'
// (these replace the english abbreviations, which collide with real words here)
const toObj = str => Object.fromEntries(str.trim().split(/\s+/).map(w => [w, true]))

export default toObj(`
  mm mme mmes mlle mlles dr drs pr prof mgr st ste
  av apr boul bd cie vs cf éd éds coll min univ
  chap fig tabl art réf ex env tél tel hab etc op cit ibid c.-à-d
  j.-c l'art l’art l'av l’av l'éd l’éd d'hab d’hab l'univ l’univ
  kg km cm mm ml
  lun ven sam dim
  janv févr fév avr juil oct nov déc
`)
