const rb = 'Adverb'
const nn = 'Noun'
const vb = 'Verb'


export default [
  null,
  null,
  {
    //2-letter
    ce: nn,
    ur: nn,
    ge: nn,
    ie: nn,
    er: vb,
    ée: vb,
    és: vb,
    if: jj,//descriptif
  },
  {
    //3-letter
    ité: nn,
    ées: vb,
    ait: vb,//devrait
    ive: jj, //
    ifs: jj, //relatifs
    ile: jj, //civile
    ale: jj, //nationale
    ble: jj, //capable
    aux: jj, //nationaux
    eux: jj, //précieux
    nte: jj, //différente
  },
  {
    //4-letter
    ment: rb,
    elle: jj,
    bles: jj,
    ales: jj,
    ique: jj,
    aire: jj,
    ives: jj,
    ntes: jj, //différentes
    sent: vn,//produisent
  },
  {
    //5-letter
    aient: vb,//auraient
    elles: jj,
    iques: jj,
    aires: jj,
  },
  {
    //6-letter
  },
  {
    //7-letter
  },
]