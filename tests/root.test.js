import test from 'tape'
import nlp from './_lib.js'
let here = '[root-match] '
nlp.verbose(false)

test('root-match:', function (t) {
  let arr = [
    ['Nous jetons les chaussures actuelles dans les maisons', '{jeter} les {chaussure} {actuel}'],
    ['dans les maisons actuels', 'dans les {maison} {actuel}'],
    ['infinitésimal', '{infinitésimal}'],//masc
    ['infinitésimale', '{infinitésimal}'],//fem
    ['infinitésimaux', '{infinitésimal}'],//masc plural
    ['infinitésimales', '{infinitésimal}'],//fem plural
    [`Étouffé par sa propre moustache `, '{étouffer}'],//'étouffer'
    [`Quelle est la chose préférée des pirates à tricoter ?`, '{tricoter}'],//tricoter'
    [`Déballé en 1913`, '{déballer}'],//'déballer'
    [`J'ai regardé ce que j'avais tranché`, '{trancher}'],//trancher
    [`Vous devez apprendre à rendre les choses plus rapides`, '{rapide}'],//'rapide'
    [`Les analystes ont attribué le faible`, '{attribuer}'],//attribuer
    [`La production a cessé en octobre.`, '{cesser}'],//'cesser'
    [` Entre-temps, j'ai institué une recherche privée rigoureuse du cadavre`, '{rigoureux}'],//'rigoureux'
    // [`nous avons déballés`, '{déballer}'],//'déballer'
    // [`Appuyez sur le bouton du département correspondant.`, '{correspond}'],//'correspond'
    // [`vous exécutez qu'il active la version.`, '{activer}'],//activer
    // [`Tu sais, je pensais, et si je déballais ici ?`, '{déballer}'],//'déballer'
    // ['en marchant', '{marcher}'],
    // [`Avant, je cherchais à attirer`, '{chercher}'],
    ['les cheminées', '{cheminée}'],
    ['les habitués', '{habitué}'],
    //raison
    [`J'ai dû le faire pour des raisons.`, '{raison}'],
    [`avancé des raisons différentes.`, '{raison}'],
    // [`pour plusieurs raisons.`, '{raison}'],
    // blanc
    [`la boîte blanche`, '{blanc}'],
    [`Une boule blanche géante`, '{blanc}'],
    // libérer
    [`Le Karnataka ne libérera plus`, '{libérer}'],
    [`Il a été libéré par les Royals`, '{libérer}'],
    [`les mascarades était prodigieuse`, '{prodigieux}'],
    [`puissance musculaire prodigieuse`, '{prodigieux}'],
    // [`Tellement stressé que`, '{stresser}'],
    // [`du département correspondant.`, '{correspond}'],
    [`des vins sont bien calculée`, '{calculé}'],//adj
    [`l'ai filtré par mes reins.`, '{rein}'],
    [`les humains naissent avec quatre reins`, '{rein}'],
    // interdire
    // [`Elle interdit les transactions`, '{interdire}'],
    // [`les promotions sont interdites par l'interdiction`, '{interdire}'],
    //endommager
    // [`Il a été endommagé dans deux énormes incendies`, '{endommager}'],

    ['des réductions moins que soudaines et importantes', '{soudain}'], //adj
    // ['chefs d’État ont été assassinés entre 1881 et 1914', '{assassiner}'], //verb
    // ['ils sont critiqués ici ', '{critiquer}'], //verb

    // ['je m\'endorme ', '{endormir}'], //subjunctif
    // ['Milly sanglotait tout son cœur ', '{sangloter}'], //imparfait

    // [`géante est réveillée `, '{réveiller}'],
    [`Ces capacités sont précieuses `, '{précieux}'],
    // ['Graham, interdit de condamner', '{interdire}'],
    ['Leur acquisition serait aussi avantageuse ', '{avantageux}'],
    ['de camionnage ennuyeuse ', '{ennuyeux}'],
    ['vos collègues s\'endorment ', '{endormir}'],
    ['Je ne m\'endormirai pas ', '{endormir}'],
    ['un lit pour m\'endormir ', '{endormir}'],
    ['un jeune homme courageux ', '{courageux}'],
    ['Monana a été très courageuse ', '{courageux}'],
    ['cette confiserie moelleuse ', '{moelleux}'],
    ['la princesse était douce ', '{doux}'],
    ['la scène serait trop douloureuse ', '{douloureux}'],
    ['sont bien trop honteuses ', '{honteux}'],
    ['Ces capacités sont précieuses ', '{précieux}'],
    ['était tellement délicieuse ', '{délicieux}'],

    // [`les appareils ménagers`, '{ménage}'],
    // [`des tâches ménagères`, '{ménage}'],
    [`ce ne sont que quelques formes`, '{forme}'],
    [`l'expérience en tant qu'étudiant enseignant`, '{étudiant}'],
    [`des pensées sombres `, '{pensée}'],
    [`Identifiez vos pensées négatives`, '{pensée}'],
    [`il avait lu mes pensées `, '{pensée}'],
    [`Attirez l'animal `, '{attirer}'],
    // [`des coûts « démontre que le gouvernement exploite »`, '{démontrer}'],
    [`Respirez normalement.`, '{respirer}'],
    [` qu'on respire l'air .`, '{respirer}'],
    [`vous exécutez qu'il active la version`, '{exécuter}'],

    // `bouillonnant` //{bouillir} //present parti
    // [`géante est réveillée `, '{réveiller}'],
    // `que l'Iraq a dissimulées` //{dissimuler} //past participle
    // `Malédiction évitée` {éviter}
    // 'des chiens qui aboient'// {aboyer}


    // ===verbs===
    [`Avant de m'endormir la nuit`, `{endormir}`],
    [`les violettes ne rôtissent pas`, `{rôtir}`],
    [`Détendez-vous et respirez profondément`, `{détendre}`],
    [`laissez-les se détendre.`, `{détendre}`],
    [`vous détendre un peu`, `{détendre}`],
    // [`gémissant et grimaçant de douleur`, `{gémir}`], //present participle
    // [`gémisse-t-elle`, `{gémir}`], //subjunctive
    // [`m'empêchait de lancer`, `{empêcher}`], //imparfait
    // [`Ils dérivaient devant une brise`, `{dériver}`], //imparfait
    // --passive--
    // [`3 brutes coordonnées`, `{coordonner}`],
    [`La saveur été complètement dominée`, `{dominer}`],
    [`Les personnel sont résumés`, `{résumer}`], //passive 
    [`les doses sont résumées`, `{résumer}`], //passive
    // [`Cela ne l'a pas empêchée de le poursuivre.`, `{empêcher}`], //passive
    [`et a été incinérée`, `{incinérer}`],
    // [`Les victimes de Doda incinérées `, `{incinérer}`], //adjective

    // ===adjectives===
    [`et boissons fraîches`, `{frais}`],
    [`la bolognaise qui en est ressortie fraîche`, `{frais}`],
    [`C'est une danse vigoureuse`, `{vigoureux}`],
    [`Une poignée de main assez raide`, `{raide}`],
    [`Elle est très affirmée`, `{affirmé}`],
    [`mon amie était occupée`, `{occupé}`],
    [`les plaignants n'étaient pas mûres`, `{mûr}`],


    // ===nouns===
    // [`ses propres règles`, `{règle}`]
  ]
  arr.forEach(function (a) {
    let [str, match] = a
    let doc = nlp(str)//.compute('root')
    let tags = doc.json()[0].terms.map(term => term.tags[0])
    let msg = `'${(str + "' ").padEnd(20, ' ')}  - '${tags.join(', ')}'`
    t.equal(doc.has(match), true, here + msg)
  })
  t.end()
})
