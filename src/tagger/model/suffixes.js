const rb = 'Adverb'
const nn = 'Noun'
const vb = 'Verb'
const jj = 'Adjective'


export default [
  null,
  null,
  {
    //2-letter
    ce: nn,//connaissance
    ge: nn,
    ie: nn,

    er: vb,
    ir: vb,
    ée: vb,
    és: vb,
    sé: vb,
    ré: vb,
    ra: vb,//faudra
    it: vb,//fournit
    ez: vb,//consultez

    if: jj,//descriptif
  },
  {
    //3-letter
    ité: nn, //qualité
    eur: nn,//directeur
    ces: nn,//connaissances

    ées: vb,//énoncées
    ait: vb,//devrait
    era: vb,//aidera
    ser: vb,//utiliser
    ter: vb,//adopter

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

    sion: vb,//commission
    sent: vb,//produisent

    eurs: nn,//directeurs
    tion: nn,//amélioration
    ance: nn,//croissance
  },
  {
    //5-letter
    tions: nn,//améliorations
    ments: nn,//aliments
    sions: vb,//commissions

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