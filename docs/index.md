# fr-compromise

`fr-compromise` est une bibliothèque JavaScript pour analyser du texte en français.

Elle découpe le texte en phrases et en mots, et attribue à chaque mot une étiquette grammaticale.
On peut ensuite sélectionner des parties du document, un peu comme avec une expression régulière, ou les transformer.

La bibliothèque est assez petite pour fonctionner dans le navigateur, elle fonctionne hors ligne et n'a aucune dépendance.
Elle repose sur des règles, et elle est configurable. Elle prend des décisions rapides et « suffisamment bonnes », sans modèle neuronal.

C'est une version française de la [bibliothèque anglaise](https://github.com/spencermountain/compromise/) d'origine.

```bash
npm install fr-compromise
```

```js
import nlp from 'fr-compromise'

const doc = nlp('Elle vend des coquillages au bord de la mer.')
doc.match('#Verbe').text() // 'vend'
```

ou dans le navigateur :

```html
<script src="https://unpkg.com/fr-compromise"></script>
```

### Documentation

- [Jeu d'étiquettes](./tagset.md)
- [Syntaxe des motifs](./match.md)
- [API](./api.md)
- [Contribuer](./contributing.md)

### Fonctionnement

Le texte est découpé en une liste de phrases, chacune étant une liste de termes :

```
Sentence [
  Term { text: 'Elle', pre: '', post: ' ', normal: 'elle', tags: ['Noun', 'Pronoun'] },
  Term { text: 'vend', pre: '', post: ' ', normal: 'vend', tags: ['Verb', 'ThirdPerson', 'PresentTense'] },
  ...
]
```

- `text` est le mot tel qu'il a été écrit
- `pre` et `post` sont les espaces et la ponctuation qui l'entourent
- `normal` est une version nettoyée, utilisée pour les recherches
- `tags` sont ses [étiquettes grammaticales](./tagset.md)

On obtient ces données avec `.json()` :

```js
const doc = nlp('Elle vend des coquillages au bord de la mer.')
doc.json()
// [{ terms: [{ text: 'Elle', tags: ['Noun', 'Pronoun'], ... }, ...] }]
```

### Sélectionner

Pour sélectionner des parties du document, utilisez `.match()` :

```js
const doc = nlp('Elle vend des coquillages au bord de la mer.')
const m = doc.match('#Pronom vend des .')
m.text() // 'Elle vend des coquillages'
m.json() // [{ text: 'Elle vend des coquillages', terms: [...] }]

doc.has('#Verbe des #Nom') // true
doc.match('#Nom').out('array') // ['Elle', 'coquillages', 'bord', 'mer.']
```

Voir la [syntaxe des motifs](./match.md) pour tout ce qu'un motif peut faire, et le [jeu d'étiquettes](./tagset.md) pour la liste des étiquettes reconnues.

### Transformer

On peut transformer des parties du document, et le changement s'applique au document d'origine :

```js
const doc = nlp('Elle vend des coquillages au bord de la mer.')
doc.match('coquillages').replaceWith('maillots de bain')
doc.text() // 'Elle vend des maillots de bain au bord de la mer.'
```

Il existe aussi des sélections toutes faites, comme `.verbs()`, `.nouns()` et `.numbers()`, qui ont leurs propres méthodes, comme `.conjugate()` ou `.toFutureTense()` :

```js
const doc = nlp('Elle vend des coquillages au bord de la mer.')
doc.nouns().length // 4 ('Elle', 'coquillages', 'bord', 'mer')
doc.match('coquillages').nouns().conjugate()
// [{ plural: 'coquillages', singular: 'coquillage' }]

doc.verbs().toFutureTense()
doc.text() // 'Elle vendra des coquillages au bord de la mer.'
```

Ces sélections varient d'une langue à l'autre. Voir l'[API](./api.md) pour celles de cette bibliothèque.

### À savoir

**Chaque méthode renvoie une vue.** Une vue est une sélection de termes dans le document. `nlp(texte)` est une vue du document entier, et `.match()` en renvoie une plus petite. La plupart des méthodes renvoient une vue, on peut donc les enchaîner. Utilisez `.all()` pour revenir au document entier.

**Les transformations modifient le document lui-même.** La vue renvoyée par une transformation ne contient que la sélection : lisez donc le résultat depuis le document d'origine.

```js
const doc = nlp('Elle vend des coquillages au bord de la mer.')
doc.match('coquillages').replaceWith('galets').text() // 'galets' (la sélection seulement)
doc.text() // 'Elle vend des galets au bord de la mer.'
```

Pour ne pas toucher à l'original, travaillez sur une copie avec `.clone()` :

```js
const doc = nlp('Elle vend des coquillages au bord de la mer.')
const copie = doc.clone()
copie.match('des coquillages').remove()
copie.text() // 'Elle vend au bord de la mer.'
doc.text() // 'Elle vend des coquillages au bord de la mer.'
```

**Un motif ne traverse pas les phrases.**

```js
nlp("C'est tout. Retour à Winnipeg!").has('tout retour') // false
```

**Une étiquette inconnue ne trouve rien, sans erreur.** Si une recherche revient vide, vérifiez l'étiquette dans le [jeu d'étiquettes](./tagset.md), et utilisez `doc.debug()` pour afficher les étiquettes de chaque mot.

### Configuration

Si un mot est mal étiqueté, ou s'il est absent, vous pouvez le fournir vous-même :

```js
// pour un seul document
nlp('kermit a salué', { kermit: 'Prénom' }).match('#Prénom').text() // 'kermit'

// pour tous les documents
nlp.addWords({ kermit: 'Prénom' })
```

Les étiquettes doivent venir du [jeu d'étiquettes](./tagset.md), ou être ajoutées avec `nlp.addTags()`.

Un plugin peut ajouter à la fois des mots, des étiquettes et de nouvelles méthodes :

```js
nlp.plugin({
  words: { kermit: 'Prénom' },
  tags: { Muppet: { isA: 'Personne' } },
  api: (View) => {
    View.prototype.exclamer = function () {
      return this.post(' !')
    }
  }
})

const doc = nlp('bonjour à tous')
doc.match('tous').exclamer()
doc.text() // 'bonjour à tous !'
```
