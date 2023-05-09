import test from 'tape'
import nlp from './_lib.js'
let here = '[fr-match] '
nlp.verbose(false)

test('match:', function (t) {
  let arr = [
    ['la foobar', '#Determiner #FemaleNoun'],
    ['le foobar', '#Determiner #MaleNoun'],
    ['dans le gaboo', 'dans #Determiner #MaleNoun'],
    ['dans la gaboo', 'dans #Determiner #FemaleNoun'],

    ['je suis dans la rue éthérés', '#Pronoun #Copula dans #Determiner #Noun #Adjective'],
    [`le homme éthéré`, '#Determiner #MaleNoun #MaleAdjective'],
    [`la femme éthérée`, '#Determiner #FemaleNoun #FemaleAdjective'],
    ['évolueront vous achetez', 'évolueront #Pronoun #PresentTense'],

    ['janvier', '#Month'],
    ['lundi', '#WeekDay'],
    ['234', '#Value'],
    ['chicago', '#City'],
    ['Jamaica', '#Country'],
    ['colorado', '#Place'],
    ['suis', '#Copula'],
    ['es', '#Copula'],
    ['est', '#Copula'],
    ['sommes', '#Copula'],
    ['êtes', '#Copula'],
    ['sont', '#Copula'],
    ['étions', '#Copula'],
    ['serez', '#Copula'],
    ['seront', '#Copula'],
    ['été', '#Copula'],
    ['fus', '#Copula'],
    ['fut', '#Copula'],
    ['fûmes', '#Copula'],
    ['fûtes', '#Copula'],
    ['furent', '#Copula'],
    ['fusse', '#Copula'],
    ['fusses', '#Copula'],
    ['fût', '#Copula'],
    ['fussions', '#Copula'],
    ['fussiez', '#Copula'],
    ['fussent', '#Copula'],
    ['serais', '#Copula'],
    ['serais', '#Copula'],
    ['serait', '#Copula'],
    ['serions', '#Copula'],
    ['seriez', '#Copula'],
    ['seraient', '#Copula'],
    ['sois', '#Copula'],
    ['soyons', '#Copula'],
    ['soyez', '#Copula'],
    ['être', '#Copula'],

    [`Pour une fille d'Ottawa`, '#Preposition #Determiner #Noun . #Place'],
    // [`Grandie à Ste-Foy`, '#Verb a #Place+'],
    [`D'un père militaire`, 'de un #Noun #Adjective'],
    [`Et d'une belle fille qui fut sa mère`, '#Conjunction . une #Adjective #Noun #Preposition #Copula #Possessive #Noun'],
    [`Entre deux caisses de bière`, `#Preposition #Value #PluralNoun #Preposition #FemaleNoun`],
    [`Rejoindre la grand-mère`, `#Verb la #Adjective #Noun+`],

    ['acier', '#Noun'],//steel
    ['actualité', '#Adjective'],//timely
    ['adversaire', '#Noun'],//adversary
    ['aile', '#Noun'],//wing
    ['aimé', '#Adjective'],//beloved
    ['aime', '#Adjective'],//fond
    ['aléatoire', '#Adjective'],//random
    ['allié', '#Noun'],//ally
    ['amendement', '#Noun'],//amendment
    ['ami', '#Noun'],//friend
    ['anarchiste', '#Adjective'],//anarchist
    ['anniversaire', '#Noun'],//birthday
    ['aperçu', '#Noun'],//overview
    ['apprendre', '#Verb'],//learn
    ['arme', '#Noun'],//weapon
    ['aspire', '#Adjective'],//aspiring
    ['assemblée', '#Noun'],//assembly
    ['atelier', '#Noun'],//workshop
    ['atroce', '#Adjective'],//atrocious
    ['attachant', '#Adjective'],//endearing
    ['atteindre', '#Verb'],//reach
    ['attendre', '#Verb'],//wait
    ['autorité', '#Adjective'],//authoritative
    ['avertissement', '#Noun'],//warning
    ['aveugle', '#Adjective'],//blind
    ['bâclé', '#Adjective'],//sloppy
    ['bidon', '#Adjective'],//phony
    ['bientôt', '#Adjective'],//soon
    ['biscuit', '#Noun'],//biscuit
    ['bizarre', '#Adjective'],//weird
    ['blague', '#Noun'],//joke
    ['botte', '#Noun'],//boot
    ['bouche', '#Noun'],//mouth
    ['bovin', '#Noun'],//cattle
    ['branche', '#Noun'],//branch
    ['brique', '#Noun'],//brick
    ['bruit', '#Noun'],//noise
    ['cable', '#Noun'],//cable
    ['calculé', '#Adjective'],//calculated
    ['célèbre', '#Adjective'],//famous
    ['chauve', '#Adjective'],//bald
    ['chercheur', '#Noun'],//researcher
    ['chevalier', '#Noun'],//knight
    ['chic', '#Adjective'],//swanky
    ['classe', '#Adjective'],//classy
    ['cœur', '#Noun'],//heart
    ['colocataire', '#Noun'],//roommate
    ['commerçant', '#Noun'],//tradesman
    ['comportement', '#Noun'],//behavior
    ['comprendre', '#Verb'],//understand
    ['connu', '#Adjective'],//known
    ['contraignant', '#Adjective'],//binding
    ['contrefaits', '#Adjective'],//counterfeit
    ['contribuable', '#Noun'],//taxpayer
    ['courrier', '#Noun'],//mail
    ['crocodile', '#Noun'],//crocodile
    ['danger', '#Noun'],//hazard
    ['daté', '#Adjective'],//dated
    ['découverte', '#Noun'],//breakthrough
    ['déduire', '#Verb'],//infer
    ['défaire', '#Verb'],//undo
    ['défaut', '#Noun'],//flaw
    ['dehors', '#Adjective'],//outdoor
    ['déjeuner', '#Noun'],//lunch
    // ['demain', '#Noun'],//tomorrow
    ['département', '#Noun'],//department
    ['déplaire', '#Verb'],//displease
    ['désespéré', '#Adjective'],//desperate
    ['dessert', '#Noun'],//dessert
    ['détendre', '#Verb'],//unwind
    ['détenu', '#Noun'],//inmate
    ['digne', '#Adjective'],//worthy
    ['dingue', '#Adjective'],//kooky
    ['directeur', '#Noun'],//manager
    ['discours', '#Noun'],//speech
    ['disparaître', '#Verb'],//vanish
    ['doux', '#Adjective'],//sweet
    ['drôle', '#Adjective'],//funny
    ['durée', '#Noun'],//duration
    ['écolo', '#Adjective'],//environmental
    ['écrire', '#Verb'],//write
    ['efficace', '#Adjective'],//workable
    ['égoïste', '#Adjective'],//selfish
    ['employé', '#Noun'],//employee
    ['empreinte', '#Noun'],//footprint
    ['endormi', '#Adjective'],//asleep
    ['endurant', '#Adjective'],//enduring
    ['enfreindre', '#Verb'],//infringe
    ['ennemi', '#Noun'],//enemy
    ['énorme', '#Adjective'],//enormous
    ['ensemble', '#Adjective'],//together
    ['entendre', '#Verb'],//hear
    ['enthousiaste', '#Adjective'],//enthusiastic
    ['épée', '#Noun'],//sword
    ['équipe', '#Noun'],//team
    ['étoile', '#Noun'],//star
    ['exonéré', '#Adjective'],//exempt
    ['exploit', '#Noun'],//feat
    ['fâché', '#Adjective'],//angry
    ['facture', '#Noun'],//invoice
    ['fade', '#Adjective'],//bland
    ['faim', '#Adjective'],//hungry
    ['fait', '#Noun'],//fact
    ['fatigué', '#Adjective'],//weary
    ['faux', '#Adjective'],//fake
    ['fée', '#Noun'],//fairy
    ['fermé', '#Adjective'],//closed
    ['fichier', '#Noun'],//file
    ['fidèle', '#Adjective'],//trusty
    ['fin', '#Noun'],//end
    ['flippant', '#Adjective'],//spooky
    ['flotte', '#Noun'],//fleet
    ['force', '#Noun'],//force
    ['forme', '#Noun'],//shape
    ['fort', '#Adjective'],//strong
    ['fou', '#Adjective'],//insane
    ['gabarit', '#Noun'],//template
    ['gauche', '#Adjective'],//left
    ['glacial', '#Adjective'],//frosty
    ['gras', '#Adjective'],//oily
    ['gris', '#Adjective'],//gray
    ['gros', '#Adjective'],//fat
    ['groupe', '#Noun'],//group
    ['hâte', '#Adjective'],//eager
    ['hier', '#Date'],//yesterday
    ['honnête', '#Adjective'],//honest
    ['hybride', '#Adjective'],//hybrid
    ['ici', '#Noun'],//here
    ['immature', '#Adjective'],//immature
    ['inconstitutionnel', '#Adjective'],//unconstitutional
    ['infâme', '#Adjective'],//infamous
    ['insipide', '#Adjective'],//tasteless
    ['insoumis', '#Adjective'],//insubordinate
    ['interdire', '#Verb'],//forbid
    ['invité', '#Noun'],//guest
    ['isolement', '#Noun'],//isolation
    ['jaloux', '#Adjective'],//jealous
    ['jaune', '#Adjective'],//yellow
    ['jeune', '#Adjective'],//young
    ['jeûne', '#Noun'],//fast
    ['joue', '#Noun'],//cheek
    ['lait', '#Noun'],//milk
    ['large', '#Adjective'],//broad
    ['lit', '#Noun'],//bed
    ['livre', '#Noun'],//book
    ['louche', '#Adjective'],//shady
    ['mal', '#Noun'],//harm
    ['malade', '#Adjective'],//sick
    ['manque', '#Noun'],//lack
    ['marché', '#Noun'],//market
    ['marche', '#Noun'],//step
    ['mariée', '#Noun'],//bride
    ['mathématicien', '#Adjective'],//mathematical
    ['maximum', '#Adjective'],//maximum
    ['médicament', '#Noun'],//medication
    ['mélange', '#Noun'],//mixture
    ['même', '#Adjective'],//same
    ['meuble', '#Noun'],//furniture
    ['minuscule', '#Adjective'],//tiny
    ['miroir', '#Noun'],//mirror
    ['moche', '#Adjective'],//cheesy
    ['moins', '#Adjective'],//least
    ['moteur', '#Noun'],//engine
    ['motif', '#Noun'],//pattern
    ['négligent', '#Adjective'],//careless
    ['nez', '#Noun'],//nose
    ['notoire', '#Adjective'],//notorious
    ['nouveau', '#Adjective'],//new
    ['nouveau', '#Adjective'],//novel
    ['nuit', '#Noun'],//night
    ['nul', '#Adjective'],//blank
    ['objectif', '#Noun'],//purpose
    ['obligatoire', '#Adjective'],//mandatory
    ['œuf', '#Noun'],//egg
    ['officier', '#Noun'],//officer
    ['or', '#Noun'],//gold
    ['ordonné', '#Adjective'],//orderly
    ['parcelle', '#Noun'],//plot
    ['parent', '#Noun'],//parent
    ['parfait', '#Adjective'],//perfect
    ['passager', '#Noun'],//passenger
    ['pensée', '#Noun'],//thought
    ['perdre', '#Verb'],//lose
    ['peu', '#Noun'],//bit
    ['philosophe', '#Adjective'],//philosophical
    ['pitié', '#Adjective'],//pitiful
    ['pittoresque', '#Adjective'],//quaint
    ['plat', '#Noun'],//dish
    ['plus', '#Adjective'],//more
    ['point', '#Noun'],//stitch
    ['porte', '#Noun'],//door
    ['porte', '#Noun'],//gate
    ['portrait', '#Noun'],//portrait
    ['pourri', '#Adjective'],//rotten
    ['poursuivre', '#Verb'],//prosecute
    ['pratique', '#Adjective'],//convenient
    ['pratique', '#Adjective'],//practical
    ['prédateur', '#Adjective'],//predatory
    ['pressé', '#Adjective'],//pushy
    ['proche', '#Adjective'],//near
    ['propice', '#Adjective'],//conducive
    ['quartier', '#Noun'],//district
    ['quartier', '#Noun'],//neighborhood
    ['raciste', '#Adjective'],//racist
    ['rangé', '#Adjective'],//tidy
    ['rare', '#Adjective'],//scarce
    ['rayonnement', '#Noun'],//radiation
    ['recherche', '#Noun'],//research
    ['récompense', '#Noun'],//award
    ['réfugié', '#Noun'],//refugee
    ['remise', '#Noun'],//rebate
    ['répandu', '#Adjective'],//widespread
    ['répondre', '#Verb'],//respond
    ['rêve', '#Noun'],//dream
    ['réveillé', '#Adjective'],//awake
    ['revenu', '#Noun'],//revenue
    ['riche', '#Adjective'],//wealthy
    ['rien', '#Noun'],//nothing
    ['risqué', '#Adjective'],//risky
    ['risque', '#Noun'],//risk
    ['roman', '#Noun'],//novel
    ['rose', '#Adjective'],//pink
    ['rouge', '#Adjective'],//red
    ['rubrique', '#Noun'],//heading
    ['sable', '#Noun'],//sand
    ['sage', '#Adjective'],//wise
    ['scientifique', '#Noun'],//scientist
    ['serre', '#Noun'],//greenhouse
    ['sévère', '#Adjective'],//stern
    ['simple', '#Adjective'],//simple
    ['sœur', '#Noun'],//sister
    ['sombre', '#Adjective'],//gloomy
    ['soupir', '#Noun'],//sigh
    ['souple', '#Adjective'],//flexible
    ['sourire', '#Verb'],//smile
    ['stressé', '#Adjective'],//stressful
    ['sujet', '#Noun'],//topic
    ['survivre', '#Verb'],//survive
    ['sympa', '#Adjective'],//pleasant
    ['tâche', '#Noun'],//task
    ['taille', '#Noun'],//size
    ['tante', '#Noun'],//aunt
    ['tapis', '#Noun'],//carpet
    ['technique', '#Adjective'],//technical
    ['téléphone', '#Noun'],//phone
    ['tendre', '#Adjective'],//tender
    ['terre', '#Noun'],//earth
    ['timide', '#Adjective'],//shy
    ['tissu', '#Noun'],//fabric
    ['tondre', '#Verb'],//mow
    ['torche', '#Noun'],//torch
    ['tout', '#Noun'],//everything
    ['trait', '#Noun'],//trait
    ['traité', '#Noun'],//treaty
    ['tranquille', '#Adjective'],//peaceful
    ['triste', '#Adjective'],//sorrowful
    ['vie', '#Noun'],//life
    ['voisin', '#Noun'],//neighbour
    ['vol', '#Noun'],//flight
    ['vote', '#Noun'],//voting
    ['voyage', '#Noun'],//voyage
    ['vue', '#Noun'],//sight
    ['ho chi minh', '#City+'],
  ]
  arr.forEach(function (a) {
    let [str, match] = a
    let doc = nlp(str)//.compute('tagRank')
    let tags = doc.json()[0].terms.map(term => term.tags[0])
    let m = doc.match(match)
    let msg = `'${(str + "' ").padEnd(20, ' ')}  - '${tags.join(', ')}'`
    t.equal(m.text(), doc.text(), here + msg)
  })
  t.end()
})
