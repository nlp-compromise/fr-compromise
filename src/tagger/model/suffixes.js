const rb = 'Adverb'
const nn = 'Noun'
const vb = 'Verb'


export default [
  null,
  null,
  {
    //2-letter
    'ce': nn,
    'ur': nn,
    'ge': nn,
    'ie': nn,
    'er': vb,
    'ée': vb,
    'és': vb,
  },
  {
    //3-letter
    'ité': nn,
    'ées': vb,
    ile: jj, //civile
    ale: jj, //nationale
    ble: jj, //capable
  },
  {
    //4-letter
    ment: rb,
    elle: jj,
    bles: jj,
    ales: jj,
    ique: jj,
    aire: jj,
  },
  {
    //5-letter
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