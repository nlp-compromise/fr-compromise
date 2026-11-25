// abbreviations, and the other language-specific parts of the sentence-parser
// (these replace the english abbreviations, which collide with real words here)
const toObj = str => Object.fromEntries(str.trim().split(/\s+/).map(w => [w, true]))

export default {
  // these go before a name, a number or a letter ('Dr. X', 'fig. A'), and never end a sentence
  titles: toObj(`
    mm mme mmes mlle mlles dr drs pr prof mgr st ste
    av apr boul bd cie vs cf éd éds coll min univ
    p t c.-à-d
    chap fig tabl art réf
  `),
  // these end a sentence, when a capital comes next
  abbreviations: toObj(`
    ex env tél tel hab etc op cit ibid
    lun ven sam dim
    janv févr fév avr juil oct nov déc
  `),
  // 'sept' is a real word - 'il en a sept.'
  conditional: /\d sept\. *$/i,
  // longer ones, that end a sentence when a capital comes next
  enders: ['J\\.-C', 'S\\.\\s?A'],
  // '5 kg.'
  units: ['kg', 'km', 'cm', 'mm', 'ml', 'g', 'm', 'l', 'h', 'min'],
  // words that begin a new sentence, and are never a name - 'Habla con el Dr. Él sabe.'
  starters: `Il Elle Ils Elles Je Tu Nous Vous On Puis Ensuite Alors Mais Non Oui Et
    Ce Cette Ces Ça Son Sa Ses Mon Ma Mes Rien Personne Tout Tous
    Hier Demain Maintenant Ici Aussi Quand Si Comme Que Qui Où Pour`.split(/\s+/),
  quotes: [['«', '»'], ['“', '”'], ['"', '"'], ['(', ')']],
  ellipsis: true,
}
