# Syntaxe des motifs

C'est le langage de motifs que compromise utilise pour sélectionner des parties d'un document.
Il ressemble à une expression régulière, mais il porte sur des mots entiers (des termes), et non sur des caractères.
Il est utilisé par `.match()`, `.has()`, `.if()`, `.not()`, `.before()`, `.replace()`, et d'autres méthodes semblables.

```js
nlp('le chat dort').match('#Déterminant #Nom').text()
// 'le chat'
```

## Aide-mémoire

| Motif         | Signification                              | Exemple               | Trouve                                |
| ------------- | ------------------------------------------ | --------------------- | ------------------------------------- |
| `mot`         | ce mot exact (sans tenir compte de la casse) | `dort`              | « dort »                              |
| `#Étiquette`      | tout terme portant cette [étiquette](./tagset.md) | `#Nom`        | « chat »                              |
| `.`           | un terme quelconque                        | `le . dort`           | « le chat dort »                      |
| `*`           | zéro, un ou plusieurs termes quelconques   | `le * dort`           | « le chat noir dort »                 |
| `(a\|b)`      | l'un ou l'autre                            | `(rouge\|bleu)`       | « rouge » ou « bleu »                 |
| `(a && b)`    | un terme qui est les deux à la fois        | `(ferme && #Verbe)`    | « ferme », seulement comme verbe      |
| `mot?`        | facultatif                                 | `la petite? voiture`  | « la voiture » et « la petite voiture » |
| `mot+`        | un ou plusieurs                            | `#Adjectif+`         | « joli petit »                        |
| `mot{m,n}`    | entre m et n                               | `.{2,3}`              | deux ou trois termes                  |
| `!mot`        | tout sauf ceci                             | `le !#Verbe`           | « le chat »                           |
| `^`           | début de la phrase                         | `^le`                 | un « le » en tête de phrase           |
| `$`           | fin de la phrase                           | `dort$`               | un « dort » en fin de phrase          |
| `[mot]`       | groupe de capture                          | `prix du [.]`         | « lait »                              |
| `[<nom>mot]`  | groupe de capture nommé                    | `prix du [<chose>.]`  | « lait », sous le nom `chose`         |
| `{racine}`    | toutes les formes de ce mot                | `{marcher}`           | « marche », « marchons », « marché »  |
| `~mot~`       | recherche approximative, pour les graphies proches | `~adresse~`   | « addresse »                          |
| `/regex/`     | une expression régulière, testée sur un seul terme | `/cl[ée]f?/`  | « clé », « clef »                     |
| `@méthode`    | un test sur le terme                       | `@isTitleCase`        | « Bonjour »                           |

On peut les combiner : `#Nom+?` est une suite facultative de noms, et `^[<premier>.]` capture le premier terme.

## Mots

Un mot simple ne trouve que ce mot, sans tenir compte de la casse. Il ne trouve pas les autres formes du mot :

```js
nlp('nous marchons vers la gare').has('marchons') // true
nlp('nous marchons vers la gare').has('marcher') // false
```

Utilisez `{marcher}` pour trouver toutes les formes. Voir les [racines](#racines) plus bas.

## Étiquettes

Une `#Étiquette` trouve tout terme portant cette étiquette. Les étiquettes valides sont dans le [jeu d'étiquettes](./tagset.md).

Les étiquettes forment une hiérarchie : un `#Prénom` est aussi une `#Personne` et un `#Nom`.

```js
nlp('le chat dort').match('#Nom').text() // 'chat'
```

Une étiquette inconnue ne trouve rien, et ne lève pas d'erreur :

```js
nlp('le chat dort').match('#Noms').found // false
```

On peut utiliser indifféremment les noms d'étiquettes français ou anglais. On peut aussi utiliser des formes de type Penn, comme `#RB`.

```js
nlp('le chat dort').match('#Déterminant #Nom').text() // 'le chat'
nlp('le chat dort').match('#Determiner #Noun').text() // 'le chat'
```

## Jokers

`.` est exactement un terme. `*` est un nombre quelconque de termes, y compris aucun, et il en prend autant que possible.

```js
nlp('le chat dort').match('le . dort').text() // 'le chat dort'
nlp('le chat noir dort').match('le * dort').text() // 'le chat noir dort'
```

## Choix

`(a|b)` trouve l'une des options. `(a && b)` exige que le terme les satisfasse toutes, ce qui est utile pour un mot qui peut avoir deux natures grammaticales.

```js
nlp("j'aime le rouge et le bleu").match('(rouge|bleu)').out('array') // ['rouge', 'bleu']
nlp('il ferme la porte de la ferme').match('(ferme && #Verbe)').out('array') // ['ferme']
```

Les groupes ne peuvent pas être imbriqués. `(grande (rouge|bleue))` n'est pas pris en charge : utilisez deux appels à `.match()`.

## Termes facultatifs et répétés

```js
nlp('la voiture').match('la petite? voiture').text() // 'la voiture'
nlp('la petite voiture').match('la petite? voiture').text() // 'la petite voiture'

nlp('un joli petit chat').match('#Adjectif+').text() // 'joli petit'
nlp('a b c d').match('.{2,3}').text() // 'a b c'
```

`{n}` signifie exactement n, `{m,n}` de m à n, `{m,}` m ou plus, et `{,n}` jusqu'à n.

## Négation

```js
nlp('le chat dort').match('le !#Verbe').text() // 'le chat'
```

## Début et fin

`^` et `$` sont le début et la fin d'une phrase, et non du document.

```js
nlp('le chat dort').match('^le').text() // 'le'
nlp('le chat dort').match('dort$').text() // 'dort'
```

## Groupes de capture

Les crochets marquent la partie du résultat que vous voulez garder. Récupérez-la avec `.groups()`, ou en passant le groupe en deuxième argument :

```js
const doc = nlp('le prix du lait est élevé')
doc.match('prix du [<chose>.]').groups('chose').text() // 'lait'
doc.match('prix du [.]', 0).text() // 'lait'
```

Sans nom, les groupes sont numérotés à partir de 0. Un groupe peut contenir plusieurs termes.

## Racines

`{racine}` trouve toutes les formes fléchies d'un mot, à partir de sa forme du dictionnaire :

```js
nlp('nous marchons vers la gare').match('{marcher}').text() // 'marchons'
nlp('il a marché').match('{marcher}').text() // 'marché'
```

<!-- Les racines ne sont pas calculées par défaut. Lancez `doc.compute('root')` d'abord si cette recherche ne renvoie rien. -->

## Recherche approximative

`~mot~` trouve les graphies proches, selon une distance entre chaînes. Le seuil par défaut est de 0,85, et se règle dans les [options](#options-de-recherche).

```js
nlp('une addresse').match('~adresse~').text() // 'addresse'
```

## Expressions régulières

Une `/regex/` est testée sur un terme à la fois, elle ne peut donc pas couvrir deux mots.

```js
nlp('clé clef').match('/cl[ée]f?/').out('array') // ['clé', 'clef']
```

## Tests sur les termes

`@méthode` applique un test intégré à chaque terme. Les plus courants sont `@isTitleCase`, `@isUpperCase`, `@hasComma`, `@hasHyphen`, `@hasContraction` et `@hasQuote`.

```js
nlp('Bonjour Marie et merci').match('@isTitleCase').out('array') // ['Bonjour', 'Marie']
```

## Options de recherche

`.match()`, `.matchOne()`, `.has()`, `.if()`, `.ifNo()`, `.before()` et `.after()` acceptent un objet d'options en troisième argument, après le groupe de capture.

| Option          | Par défaut | Effet                                                                  |
| --------------- | ---------- | ---------------------------------------------------------------------- |
| `fuzzy`         | `0.85`     | la ressemblance exigée par un `~mot~`, de 0 à 1                        |
| `caseSensitive` | `false`    | compare avec le texte d'origine, et non avec la forme normalisée       |
| `noRegex`       | `false`    | traite `/regex/` comme un mot simple, pour qu'elle ne soit jamais exécutée |

```js
nlp('Bonjour bonjour').match('Bonjour', null, { caseSensitive: true }).out('array') // ['Bonjour']
```

Utilisez `{ noRegex: true }` quand le motif a été écrit par un utilisateur, pour qu'une regex lente ou invalide ne puisse pas s'exécuter.

## Chercher une liste de mots

Pour une longue liste de mots simples, `.lookup()` est bien plus rapide que de nombreux appels à `.match()`. Cette méthode n'utilise pas la syntaxe des motifs : elle est donc sûre aussi pour des mots saisis par un utilisateur.

```js
nlp("j'ai vu marie et jean").lookup(['marie', 'jean']).out('array') // ['marie', 'jean']
```

## Réutiliser un motif

`nlp.parseMatch(str)` analyse un motif une seule fois, pour qu'il puisse servir plusieurs fois. `nlp.buildNet([...])` compile plusieurs motifs en un seul, à exécuter ensemble avec `.sweep()`. Servez-vous-en quand les mêmes motifs s'appliquent à beaucoup de texte.

## Ce qui n'est pas pris en charge

- **Les groupes imbriqués.** Utilisez plusieurs appels à `.match()`.
- **Les motifs qui traversent les phrases.** Chaque résultat reste dans une seule phrase.
- **Une regex sur plusieurs mots.** Une `/regex/` est testée sur un terme à la fois.

## Quand une recherche ne trouve rien

1. Vérifiez que l'étiquette est dans le [jeu d'étiquettes](./tagset.md).
2. Utilisez `doc.debug()` pour voir les étiquettes de chaque mot.
3. Rappelez-vous qu'un mot simple est une recherche exacte. Utilisez `{racine}` pour toutes ses formes.
4. Rappelez-vous qu'un motif ne traverse pas les phrases.
