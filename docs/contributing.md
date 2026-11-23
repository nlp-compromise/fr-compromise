# Contribuer

Cette bibliothèque est en cours de développement, et dépend de l'aide de développeurs comme de francophones.

Il n'est pas nécessaire de savoir programmer pour aider. Nous signaler un mot mal étiqueté, dans un [ticket](https://github.com/nlp-compromise/fr-compromise/issues), est une contribution utile. Vous pouvez l'écrire en français ou en anglais.

Toutes les pull-requests sont les bienvenues, et sont examinées rapidement. Cette bibliothèque est open-source, sous licence MIT.

### Installation

Créez un fork personnel du dépôt sur GitHub, puis :

```bash
git clone git@github.com:{VOTRE_NOM}/fr-compromise.git
cd fr-compromise
pnpm install
pnpm test
```

Ce projet utilise [pnpm](https://pnpm.io/). `npm install` et `npm test` fonctionnent aussi.

### Faire une modification

- `./src` contient le code. Il est divisé en `01-one` (découpage en mots), `02-two` (étiquetage) et `03-three` (les sélections comme `.verbs()`).
- `./data` contient les listes de mots et les modèles. Ils sont compressés : lancez `pnpm run pack` après les avoir modifiés pour voir le résultat.
- `./tests` contient les tests. Merci d'ajouter un test pour votre modification.
- `./scratch.js` est un fichier pour faire des essais. `pnpm run watch` le relance à chaque enregistrement.

Pour voir comment une phrase a été étiquetée, utilisez `.debug()` :

```js
nlp('Elle vend des coquillages au bord de la mer.').debug()
```

### Envoyer une pull-request

Merci de travailler à partir de la branche `dev`, et d'y envoyer votre pull-request.

Si votre modification est importante, merci de créer d'abord un ticket, pour que nous puissions en discuter.
