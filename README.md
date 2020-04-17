## Tasks

for lexicon:

- french country/city names

### Transformations

#### Adjectives

masc - femme - plurMasc - plurFemme

`présidentiel` - `présidentielle` - `présidentiels` - `présidentielles`

`républicain` - `républicaine` - `républicain` - `républicaines`

#### Verbs

- conjugate je/tu/il/nous/vous/ils
  `parle` - `parles` - `parle` - `parlons` - `parlez` - `parlent`

- conjugate tenses
  imparfait/future/simple/compose/anterieur [oh dear](https://conjugator.reverso.net/conjugation-french-verb-parler.html)
  `parle` - `parlais` - `parlerai` - `parlas` - `parlé`

#### Nouns

- inflect nouns (from singular)

`cheval` →‎ `chevaux`

- tag noun as either Masc or Femme

for tagger:

- build a lexicon
- suffix/regex lookups
- noun fallback
- grammar-based corrections

gender:

- tag male/female nouns
- tag male/female adjectives
- tag male/female verbs?

### Notes

- currently using english tag names, and API.
- en-compromise normalizes accented characters like `è` to `e`
-

---

:boom: This repository is the french version of [nlp-compromise](https://github.com/nlp-compromise/nlp_compromise)! :boom:

# NLP tool adapted to French

Hi! This project was started by [spencermountain](https://twitter.com/spencermountain), a beginner in French. We therefore need some help about french or development.

Grammar differences between the English and the French version are quite huge, which leads to great challenges.

## What material is being used?

The project is built upon the French WordNet ([WOLF](http://alpage.inria.fr/~sagot/wolf-en.html)), which contains:

- 10k adjectives
- 12k verbs
- 2k adverbs
- 70k nouns

### A few suffixes

- que\$ -> k (banque -> bank, casque -> cask, disque -> disk)
- aire\$ -> ary (tertiaire -> tertiairy)
- eur\$ -> or (chercheur -> chearchor)
- ie\$ -> y (cajolerie -> cajolery)
- té\$ -> ty (extremité -> extremity)
- re\$ -> er (ordre -> order, tigre -> tiger)
- ais$ -> ese, ois$ -> ese (libanais -> lebanese, chinois -> chinese)
- ant\$ -> ing (changeant -> changeing)
- er\$ -> "" (documenter -> document)
- osis\$ -> ose (osmose -> osmose)
- ment\$ -> ly (confortablement -> confortably)

We're gonna learn the rules. BADDA BING BADA BOOM!

## External Resources

- [nicolashernandez/free-french-treebank](https://raw.githubusercontent.com/nicolashernandez/free-french-treebank/master/130612/frwikinews/txt-tok-pos/frwikinews-20130110-pages-articles.txt.tok.stanford-pos)

- [benob/french-tagger](https://github.com/benob/french-tagger/blob/master/lefff-word-tag.txt)

- [sequoia tagset](https://raw.githubusercontent.com/turbopape/postagga/master/resources/postagga-sequoia-fr.edn#)

- [fvcr verb conjugation dataset](https://sourceforge.net/projects/fvcr/?source=typ_redirect)

---

# French version

:boom: Ce dépôt est la version française de [nlp-compromise](https://github.com/nlp-compromise/nlp_compromise) ! :boom:

# Outil de Natural Language Processing en français

Bonjour ! Ce projet a été démarré par [spencermountain](https://twitter.com/spencermountain), un débutant en français. Nous avons donc besoin de toute aide disponible, que ce soit en français ou en développement.

Vous êtes invités à rejoindre [le groupe Slack](slack.compromise.cool) pour discuter des détails.
Vous trouverez ici un projet de traitement du langage naturel adapté à la langue française.

Les différences grammaticales entre la version anglaise et la version française ne sont pas négligeables, ce qui pose de grands défis.

## Quel est le matériel utilisé ?

Le projet est réalisé grâce au WordNet français (>WOLF](http://alpage.inria.fr/~sagot/wolf-en.html)), qui contient :

- 10 000 adjectifs
- 12 000 verbes
- 2 000 adverbes
- 70 000 noms

### Quelques suffixes

- que\$ -> k (banque -> bank, casque -> cask, disque -> disk)
- aire\$ -> ary (tertiaire -> tertiairy)
- eur\$ -> or (chercheur -> chearchor)
- ie\$ -> y (cajolerie -> cajolery)
- té\$ -> ty (extremité -> extremity)
- re\$ -> er (ordre -> order, tigre -> tiger)
- ais$ -> ese, ois$ -> ese (libanais -> lebanese, chinois -> chinese)
- ant\$ -> ing (changeant -> changeing)
- er\$ -> "" (documenter -> document)
- osis\$ -> ose (osmose -> osmose)
- ment\$ -> ly (confortablement -> confortably)

On va apprendre les regles. BADDA BING BADA BOOM!

## Ressources externes

- [nicolashernandez/free-french-treebank](https://raw.githubusercontent.com/nicolashernandez/free-french-treebank/master/130612/frwikinews/txt-tok-pos/frwikinews-20130110-pages-articles.txt.tok.stanford-pos)

- [benob/french-tagger](https://github.com/benob/french-tagger/blob/master/lefff-word-tag.txt)

- [sequoia tagset](https://raw.githubusercontent.com/turbopape/postagga/master/resources/postagga-sequoia-fr.edn#)

- [fvcr verb conjugation dataset](https://sourceforge.net/projects/fvcr/?source=typ_redirect)
