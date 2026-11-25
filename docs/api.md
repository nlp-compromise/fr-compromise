# API

`fr-compromise` est construit sur la bibliothèque anglaise [compromise](https://github.com/spencermountain/compromise/), et partage ses méthodes de base. Elles fonctionnent de la même façon dans toutes les langues.

La plupart des méthodes renvoient une nouvelle **vue** (une sélection du document), on peut donc les enchaîner :

```js
nlp(texte).match('#Nom').first().text()
```

Les méthodes qui prennent un `match` utilisent la [syntaxe des motifs](./match.md).

## Méthodes de base

_(disponibles sur toutes les vues)_

### Utilitaires

- **`.found`** _[getter]_ — cette vue contient-elle quelque chose ?
- **`.docs`** _[getter]_ — la liste des objets terme de cette vue
- **`.document`** _[getter]_ — le texte analysé en entier
- **`.pointer`** _[getter]_ — les index de la vue courante
- **`.fullPointer`** _[getter]_ — les index explicites de la vue courante
- **`.methods`** _[getter]_ — accès aux méthodes internes de la bibliothèque
- **`.model`** _[getter]_ — accès aux données internes de la bibliothèque
- **`.hooks`** _[getter]_ — les méthodes compute lancées par défaut
- **`.isView`** _[getter]_ — permet de reconnaître un objet compromise
- **`.length`** _[getter]_ — le nombre de résultats dans la vue
- **`.update(pointer)`** — crée une nouvelle vue, à partir de ce document
- **`.toView(pointer)`** — transforme une vue Verb ou Noun en vue normale
- **`.fromText(text)`** — crée un nouveau document
- **`.termList()`** — alias de .docs
- **`.compute(method)`** — lance une opération nommée sur le document
- **`.clone(shallow?)`** — copie le document en profondeur, sans garder aucune référence

### Boucles

- **`.forEach(fn)`** — lance une fonction sur chaque résultat, comme un document à part
- **`.map(fn, emptyResult?)`** — passe chaque résultat dans une fonction, et crée un nouveau document
- **`.filter(fn)`** — ne garde que les résultats qui renvoient true
- **`.find(fn)`** — renvoie un document avec seulement le premier résultat qui convient
- **`.some(fn)`** — renvoie true si au moins un résultat convient
- **`.random(n?)`** — tire au hasard une partie des résultats

### Accesseurs

- **`.terms(n?)`** — découpe les résultats en termes individuels
- **`.groups(name?)`** — récupère un groupe de capture nommé
- **`.eq(n)`** — ne garde que le n-ième résultat
- **`.first(n?)`** — ne garde que le ou les premiers résultats
- **`.last(n?)`** — ne garde que le ou les derniers résultats
- **`.firstTerms()`** — le premier mot de chaque résultat
- **`.lastTerms()`** — le dernier mot de chaque résultat
- **`.slice(start, end?)`** — prend une partie des résultats
- **`.all()`** — renvoie le document d'origine en entier (« zoom arrière »)
- **`.fullSentences()`** — renvoie la phrase d'origine complète de chaque résultat
- **`.none()`** — renvoie une vue vide
- **`.isDoc(view?)`** — ces deux vues sont-elles celles du même document ?
- **`.wordCount()`** — compte le nombre de termes

### Recherche

- **`.match(match, group?, options?)`** — renvoie les parties du document qui correspondent au motif
- **`.matchOne(match, group?, options?)`** — renvoie seulement le premier résultat
- **`.has(match, group?, options?)`** — renvoie un booléen : ce motif existe-t-il ?
- **`.if(match, group?, options?)`** — ne garde que les résultats qui contiennent ce motif
- **`.ifNo(match, group?, options?)`** — écarte les résultats qui contiennent ce motif
- **`.before(match, group?, options?)`** — renvoie les termes qui précèdent chaque résultat
- **`.after(match, group?, options?)`** — renvoie les termes qui suivent chaque résultat
- **`.lookBehind(match, group?, options?)`** — alias de .before()
- **`.lookBefore(match, group?, options?)`** — alias de .before()
- **`.lookAhead(match, group?, options?)`** — alias de .after()
- **`.lookAfter(match, group?, options?)`** — alias de .after()
- **`.growLeft(match, group?, options?)`** — ajoute à la vue les termes correspondants situés juste avant
- **`.growRight(match, group?, options?)`** — ajoute à la vue les termes correspondants situés juste après
- **`.grow(match, group?, options?)`** — étend la vue avec les termes correspondants, à gauche ou à droite
- **`.sweep(match, opts?)`** — applique une série de motifs compilés au document
- **`.splitOn(match?, group?)`** — sépare le résultat en trois : avant, le motif, et après
- **`.splitBefore(match?, group?)`** — coupe juste avant chaque motif trouvé
- **`.splitAfter(match?, group?)`** — coupe juste après chaque motif trouvé
- **`.split(match?, group?)`** — alias de .splitAfter()

### Casse

- **`.toLowerCase()`** — met toutes les lettres en minuscules
- **`.toUpperCase()`** — met toutes les lettres en majuscules
- **`.toTitleCase()`** — met en majuscule la première lettre de chaque terme
- **`.toCamelCase()`** — supprime les espaces et met une majuscule à chaque terme

### Insertion

- **`.concat(input)`** — ajoute ces éléments à la fin
- **`.insertBefore(input)`** — ajoute ces mots avant chaque résultat
- **`.prepend(input)`** — alias de .insertBefore()
- **`.insertAfter(text)`** — ajoute ces mots après chaque résultat
- **`.append(text)`** — alias de .insertAfter()
- **`.insert(text)`** — alias de .insertAfter()
- **`.remove(match)`** — supprime complètement ces termes du document
- **`.delete(match)`** — alias de .remove()
- **`.replace(from, to?, keep?)`** — cherche un motif et le remplace par un nouveau contenu
- **`.replaceWith(to, keep?)`** — remplace la sélection par un nouveau contenu
- **`.unique()`** — supprime les résultats en double
- **`.reverse()`** — inverse l'ordre des résultats, mais pas celui des mots
- **`.sort(method?)`** — réordonne les résultats (sur place)
<!-- - **`.normalize(options?)`** — nettoie divers aspects des mots -->

### Espaces et ponctuation

- **`.pre(str?, concat?)`** — ajoute cette ponctuation ou cet espace avant chaque résultat
- **`.post(str?, concat?)`** — ajoute cette ponctuation ou cet espace après chaque résultat
- **`.trim()`** — supprime les espaces au début et à la fin
- **`.hyphenate()`** — relie les mots par un trait d'union, et supprime les espaces
- **`.dehyphenate()`** — supprime les traits d'union entre les mots, et remet des espaces
- **`.deHyphenate()`** — alias de .dehyphenate()
- **`.toQuotations(start?, end?)`** — met les sélections entre guillemets
- **`.toQuotation(start?, end?)`** — alias de .toQuotations()
- **`.toParentheses(start?, end?)`** — met les sélections entre parenthèses

### Sortie

- **`.text(options?)`** — renvoie le document sous forme de texte
- **`.json(options?)`** — renvoie les métadonnées voulues du document
- **`.debug()`** — affiche joliment le document courant et ses étiquettes
- **`.out(format?)`** — quelques formats de sortie nommés
- **`.html(toHighlight)`** — produit une chaîne html, avec des balises autour des motifs trouvés
- **`.wrap(matches)`** — produit une sortie personnalisée autour des motifs trouvés

### Pointeurs

- **`.union(match)`** — renvoie tous les résultats, sans doublons
- **`.and(match)`** — alias de .union()
- **`.intersection(match)`** — ne renvoie que les résultats communs
- **`.not(match, options?)`** — renvoie tous les résultats sauf celui-ci
- **`.difference(match, options?)`** — alias de .not()
- **`.complement(match)`** — renvoie tout ce qui n'est pas dans les résultats
- **`.settle(match)`** — supprime les chevauchements entre résultats

### Étiquettes

- **`.tag(tag, reason?)`** — donne cette étiquette à tous les termes
- **`.tagSafe(tag, reason?)`** — n'applique l'étiquette que si elle est compatible avec les étiquettes actuelles
- **`.unTag(tag, reason?)`** — retire cette étiquette des termes
- **`.canBe(tag)`** — ne renvoie que les termes qui peuvent porter cette étiquette

### Cache

- **`.cache(options?)`** — fige l'état courant du document, pour gagner en vitesse
- **`.uncache(options?)`** — libère l'état du document, pour qu'il puisse être transformé
- **`.freeze()`** — empêche les étiquettes actuelles d'être retirées
- **`.unfreeze()`** — permet de modifier les étiquettes actuelles [par défaut]

### Recherche dans une liste

- **`.lookup(trie, opts?)`** — recherche rapide d'une liste de mots
- **`.autoFill()`** — complète les débuts de mots, d'après le dictionnaire de saisie semi-automatique

<!--
## Méthodes de l'étiqueteur

- **`.confidence()`** — mesure moyenne de la confiance dans les étiquettes
- **`.swap(fromLemma, toLemma, guardTag?)`** — remplace intelligemment les formes d'une racine
-->

## Sélections

Les sélections sont des recherches toutes faites, comme `.verbs()` ou `.numbers()`, qui renvoient une vue dotée de méthodes supplémentaires.
Elles sont écrites pour chaque langue : celles qui sont disponibles ici ne sont pas les mêmes qu'en anglais.

### `.nouns()`

- **`.nouns()`** — renvoie les noms du document
- **`.nouns().conjugate()`** — donne le singulier et le pluriel de chaque nom
- **`.nouns().isPlural()`** — ne renvoie que les noms au pluriel
- **`.nouns().toPlural()`** — met les noms au pluriel
- **`.nouns().toSingular()`** — met les noms au singulier

### `.verbs()`

- **`.verbs()`** — renvoie les verbes du document
- **`.verbs().conjugate()`** — donne toutes les conjugaisons de chaque verbe
- **`.verbs().toPresentTense()`** — met les verbes au présent
- **`.verbs().toPastTense()`** — met les verbes à l'imparfait
- **`.verbs().toFutureTense()`** — met les verbes au futur
- **`.verbs().toPresent()`**, **`.toPast()`**, **`.toFuture()`** — alias des trois méthodes précédentes

### `.adjectives()`

- **`.adjectives()`** — renvoie les adjectifs du document
- **`.adjectives().conjugate()`** — donne le masculin, le féminin et les pluriels de chaque adjectif

### `.numbers()`

- **`.numbers()`** — renvoie les nombres, écrits en chiffres ou en lettres (y compris `premier`, `2ème`, `septante` ou `nonante`)
- **`.values()`** — alias de .numbers()
- **`.numbers().get()`** — renvoie la valeur numérique de chaque nombre (`trois quarts` et `3/4` valent 0,75)
- **`.numbers().parse()`** — renvoie le détail de chaque nombre (valeur, préfixe, suffixe, virgule décimale)
- **`.numbers().json(n?)`** — renvoie les métadonnées de chaque nombre, ou seulement du n-ième ; accepte aussi les options de `.json()`
- **`.numbers().units()`** — renvoie l'unité qui suit chaque nombre (`kilos`, `%`, `pour cent`)
- **`.numbers().toNumber()`** — écrit les nombres en chiffres (`40`) ; `cinquante pour cent` devient `50 %`, et les autres unités écrites en lettres sont conservées (`cinq euros` devient `5 euros`)
- **`.numbers().toText()`** — écrit les nombres en lettres (`quarante`, et `1er` devient `premier`) ; un symbole collé au nombre est écrit en toutes lettres (`50%` devient `cinquante pour cent`, `5€` ou `€5` devient `cinq euros`, `20°` devient `vingt degrés`), et une unité sans forme longue est séparée par une espace (`5km` devient `cinq km`)
- **`.numbers().toCardinal()`** — transforme en nombre cardinal (`quarante`)
- **`.numbers().toOrdinal()`** — transforme en nombre ordinal (`quarantième`) ; un pourcentage, un montant ou un nombre collé à son unité (`50%`, `5€`, `5km`) reste tel quel
- **`.numbers().isCardinal()`** — ne renvoie que les nombres cardinaux
- **`.numbers().isOrdinal()`** — ne renvoie que les nombres ordinaux
- **`.numbers().isEqual(n)`** — ne renvoie que les nombres égaux à n
- **`.numbers().greaterThan(n)`** — ne renvoie que les nombres supérieurs à n
- **`.numbers().lessThan(n)`** — ne renvoie que les nombres inférieurs à n
- **`.numbers().between(min, max)`** — ne renvoie que les nombres compris entre min et max
- **`.numbers().set(n)`** — remplace chaque nombre par n (un nombre, ou une chaîne comme `'dix'` ou `'10'`)
- **`.numbers().add(n)`** — ajoute n à chaque nombre (nombre ou chaîne, comme `'deux'`) ; la virgule décimale est conservée (`1,5` devient `2,5`), tout comme le symbole ou l'unité (`50%` devient `51%`, `€5` devient `€6`)
- **`.numbers().subtract(n)`** — soustrait n de chaque nombre (nombre ou chaîne)
- **`.numbers().increment()`** — ajoute 1 à chaque nombre
- **`.numbers().decrement()`** — soustrait 1 de chaque nombre

### `.contractions()`

- **`.contractions(n?)`** — renvoie les formes contractées ou élidées, comme « j'aime » ou « l'été » (ou seulement la n-ième) ; chaque forme est un résultat distinct, même quand elles se suivent
- **`.contractions().expand()`** — les développe (« j'aime » devient « je aime »)

### Noms propres

- **`.people()`** — renvoie les noms de personnes
- **`.places()`** — renvoie les noms de lieux
- **`.organizations()`** — renvoie les noms d'organisations

## Méthodes du constructeur

_(appelées sur l'objet `nlp` importé, et non sur une vue)_

- **`nlp.tokenize(text, lexicon?)`** — analyse le texte sans lancer l'étiqueteur
- **`nlp.plugin(plugin)`** — ajoute un plugin compromise
- **`nlp.extend(plugin)`** — alias de nlp.plugin()
- **`nlp.addWords(words, isFrozen?)`** — ajoute de nouveaux mots au lexique interne
- **`nlp.addTags(tags)`** — ajoute de nouvelles étiquettes au jeu d'étiquettes
- **`nlp.parseMatch(match, opts?)`** — transforme un motif en json
- **`nlp.buildNet(matches)`** — compile un ensemble de motifs sous une forme plus rapide, pour .sweep()
- **`nlp.buildTrie(words)`** — compile une liste de mots sous une forme plus rapide, pour .lookup()
- **`nlp.typeahead(words)`** — ajoute des mots au dictionnaire de saisie semi-automatique
- **`nlp.world()`** — accès aux données internes de la bibliothèque
- **`nlp.model()`** — accès aux données linguistiques de la bibliothèque
- **`nlp.methods()`** — accès aux méthodes internes de la bibliothèque
- **`nlp.hooks()`** — les fonctions compute lancées automatiquement
- **`nlp.verbose(toLog?)`** — affiche les décisions de l'étiqueteur, pour le débogage
- **`nlp.version`** — la version semver de la bibliothèque
