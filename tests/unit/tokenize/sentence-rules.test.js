import test from 'tape'
import nlp from '../../_lib.js'
const here = '[fr-sentence-rules] '

// each line is one text - a '|' marks where one sentence ends, and the next begins
const run = function (t, cases) {
  cases
    .split('\n')
    .map(str => str.trim())
    .filter(str => str)
    .forEach(str => {
      const want = str.split('|').map(s => s.trim())
      const text = want.join(' ')
      t.deepEqual(nlp(text).fullSentences().out('array'), want, here + text)
    })
  t.end()
}

test('abbreviations:', function (t) {
  run(
    t,
    `
    M. Dupont est arrivé. | Mme Martin aussi.
    MM. Dupont et Durand sont là.
    Voir p. ex. le chapitre 3, c.-à-d. la fin.
    En 50 av. J.-C. les Romains sont venus.
    Cf. la page 5, env. 3 km, etc. Ensuite on verra.
    Le Dr. Martin habite boul. St. Michel.
    Né le 3 janv. 1990 à Paris.
    Voir le n° 5. | Puis le t. 2 de l’éd. Gallimard.
    J’ai vu l’av. Foch. | Elle est belle.
    Tél. 01 23 45. | Appelez.
    Art. 5 du code. | Voir § 3.
    Mlle Dubois et Mme. Leroy sont parties.
    Le Pr. Leclerc enseigne à Lyon.
    Mgr. Dupanloup était évêque.
    Ste. Geneviève est la patronne de Paris.
    Voir chap. 4, fig. 2 et réf. 12.
    Il habite 12 bd. Voltaire à Paris.
    La société Durand & Cie. a fermé.
    Paris compte env. 2 millions d’hab. intra-muros.
    PSG vs. OM, c’est ce soir.
    Rome fut fondée en 753 av. J.-C. Elle devint un empire.
    Il est né en 14 apr. J.-C. à Lyon.
    A. Camus est né en Algérie.
    N.B. le magasin est fermé lundi.
    P.S. je t’aime.
    R.S.V.P. avant le 5 mai.
    Le 3 févr. et le 5 avr. sont fériés.
    Du 1er juil. au 15 août, c’est fermé.
    En oct. ou en nov. peut-être.
    En déc. il neige souvent.
    Éd. du Seuil, coll. Points.
    Il mesure 1 m 80 env. et pèse 70 kg.
    Tel. 06 12 34 56 78 ou fax 01 23 45 67 89.
    Réf. 1234, cf. notre courrier.
    Min. de l’Éducation nationale.
    S.A.R.L. Dupont et fils.
    Ex. : le chat dort.
    Op. cit., p. 45.
    Ibid. p. 12.
    Le prof. Tournesol est distrait.
    St. Étienne a gagné hier.
    Il a acheté du pain, du lait, etc. et il est rentré.
    Mmes Durand et Petit sont arrivées. | MM. Roux et Blanc aussi.
  `
  )
})

test('not abbreviations:', function (t) {
  run(
    t,
    `
    Le vin est sec. | Il est bon.
    Il est au lit. | Elle dort.
    Il en a sept. | Elle en a huit.
    C'est un vol. | Appelez la police.
    Il a 3 ans. | Elle en a 5.
    Elle est là. | Il arrive.
    C’est la vie. | On continue.
    Il fait beau. | Allons dehors.
    Je vais à la mer. | Tu viens ?
    Il aime le thé. | Moi, le café.
    Elle a dit oui. | Lui a dit non.
    Rendez-vous à 15 h. Soyez là.
    C’est mon fils. | Il a dix ans.
    Voici le plan. | Suivez-le.
    Il habite au sud. | Elle au nord.
    Tu as tort. | J’ai raison.
    Je ne sais pas. | Demande à Paul.
    Il coûte 3,50 euros. | C’est cher.
    Il est né en 1990. | Elle en 1992.
    Il pèse 70 kg. Elle pèse 60 kg.
    Ça y est. | On part.
    Il y en a. Regarde.
    Elle parle de mars. | Lui d’avril.
    Le lion est fort. | Le rat est malin.
    Visitez www.exemple.fr pour en savoir plus. | Merci.
    Le fichier notes.txt est vide. | Supprimez-le.
    La version 2.0 est sortie. | Elle est rapide.
  `
  )
})

test('questions and exclamations:', function (t) {
  run(
    t,
    `
    Comment ça va ? | Bien ! | Merci.
    Comment ça va\u202F? | Bien\u00A0! | Merci.
    Quoi ?! | Ce n’est pas possible !
    Qu’est-ce que c’est ? | Je ne sais pas.
    Ah bon ? | Vraiment ?
    Oh là là ! | Quelle histoire !
    Tu viens ? | Oui, j’arrive.
    Non ! | Pas question !
    Attends… Je viens.
    Je ne sais pas... Peut-être demain.
    Je ne sais pas... peut-être demain.
    Bref… on verra bien. | Salut !
  `
  )
})

test('quotations and dialogue:', function (t) {
  run(
    t,
    `
    Il dit : « Non. Je refuse. » Puis il part.
    Il dit : « Non. Je refuse. Va-t’en. Adieu. » Puis il part.
    « Viens ! » dit-elle. | Il vint.
    Il a dit: "Je ne sais pas." Puis il est sorti.
    (Je ne sais pas.) Peut-être demain.
    « Où vas-tu ? » demanda-t-elle. | « Nulle part », répondit-il.
    Il a crié « Au secours ! » et il est tombé.
    Elle pensa (un instant) à lui. | Puis elle partit.
    « Bonjour. » Il entra.
    « C’est fini », dit-elle. | Il pleura.
    Elle murmura : « Chut. Il dort. » Nous sommes sortis.
  `
  )
})

test('harder cases:', function (t) {
  run(
    t,
    `
    Il est 15 h 30. | Partons.
    Le P.-D.G. est parti. | Bon.
    Il travaille chez Renault S.A. Il habite Lyon.
    « Oui. » « Non. »
    Il mesure 1,80 m. Elle 1,60 m.
    J’ai lu « Les Misérables ». | C’est long.
    Elle arrive vers 8 h. du matin.
    Voir p. 12. | Voir aussi p. 15.
    1. Ouvrez la porte. | 2. Entrez.
    Qui ? | Moi ?
    « Non ! » cria-t-il. | « Jamais ! »
    Il s’appelle Jean-Paul II. | Il est pape.
    L’O.N.U. siège à New York.
    L’U.R.S.S. a disparu en 1991. | La Russie existe.
    Il pèse 3 kg. de plus.
    Il pèse 3 kg. Elle pèse 2 kg.
    Il a couru 5 km. Puis il a dormi.
    Né en janv. Mort en déc.
    Voir fig. 3. | Voir aussi fig. 4.
    Il a tout pris, etc. Rien ne reste.
    C’est M. Non, c’est Mme.
    Parle au Dr. Il sait.
    Mon tél. est le 06. | Appelle-moi.
    Non. | Oui. | Peut-être.
    « Non », dit-il. | « Si », dis-je.
    Il m’a dit : « Viens ». | J’y suis allé.
    L’enfant cria : « Maman ! ». | Personne ne vint.
    Il habite av. Foch à Paris.
    Elle travaille au Min. de la Santé.
    Rome, 50 av. J.-C. César règne.
    Cf. Dupont 2020. | Voir aussi Martin.
    Éd. Gallimard, Paris.
    Il attend 5 min. devant la porte.
    Il attend 5 min. Puis il part.
    Allons-y ! | Vite ! | Il est tard.
    Oui ? | Non ? | Décide-toi.
    Le n° 5. | Le n° 6.
    Voici l’art. 5. | Lisez-le.
    Il gagne env. 2000. | C’est peu.
  `
  )
})

test('longer texts:', function (t) {
  run(
    t,
    `
    Voir la fig. A et le tabl. B en annexe.
    C’est dans le chap. IV du livre.
    Voir l’art. L. 123-4 du code.
    M. Le Pen était présent.
    L’Univ. de Lyon est grande.
    Le Dr. Martin et Mme Dubois sont arrivés à 17 h à l’hôpital. | Puis ils ont opéré le patient. | Tout s’est bien passé.
    L’entreprise a été fondée en 1950. | Aujourd’hui, elle compte env. 500 salariés. | En 2023, elle a réalisé 80 millions de chiffre d’affaires.
    Il est arrivé à 7 h. Il n’y avait personne. | Alors il a attendu jusqu’à 8 h. Ensuite il est parti.
    Il nous faut de la farine, des œufs, du sucre, etc. Tu as tout ?
    Victor Hugo est né en 1802 à Besançon. | Il est mort à Paris en 1885.
    Il mesure 1,80 m. Elle mesure 1,65 m.
    Le colis pèse 2 kg. L’envoi coûte 5 euros.
    Quelle surprise ! | Quand es-tu arrivé ? | Je ne t’attendais pas avant demain.
    Parlez à M. Il vous aidera.
    Le texte est à la p. 5. | Lisez-le calmement.
    Ouvert du lun. au ven. de 8 h à 17 h. Fermé le dimanche.
  `
  )
})
