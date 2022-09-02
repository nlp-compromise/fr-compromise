const rb = 'Adverb'
const nn = 'Noun'
const vb = 'Verb'
const jj = 'Adjective'
const inf = 'Infinitive'
const pres = 'PresentTense'


export default [
  null,
  null,
  {
    //2-letter
    ce: nn,//connaissance
    ge: nn,
    ie: nn,

    er: inf,
    ir: inf,
    ée: vb,
    és: pres,
    sé: vb,
    ré: vb,
    çu: vb,//conçu
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

    sent: vb,//produisent

    sion: nn,//commission
    eurs: nn,//directeurs
    tion: nn,//amélioration
    ance: nn,//croissance
    euse: jj//rigoureuse
  },
  {
    //5-letter
    tions: nn,//améliorations
    ments: nn,//aliments
    sions: nn,//commissions

    aient: vb,//auraient
    arant: vb,//préparant
    irant: vb,//inspirant
    orant: vb,//élaborant
    urant: vb,//assurant
    trant: vb,//montrant
    llant: vb,//détaillant

    elles: jj,
    iques: jj,
    aires: jj,
    euses: jj
  },
  {
    //6-letter
  },
  {
    //7-letter
  },
]