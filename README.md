
:boom: C'est [nlp-compromise](https://github.com/nlp-compromise/nlp_compromise) en francais! :boom:

##Traitement automatique du langage naturel en client font

Salut: Ce projet a été commencé par (spencermountain)[https://twitter.com/spencermountain], un debutant en français.
Donc, nous avons besoin de beaucoup d'aide en francais ou en développement.


Veuillez rejoindre [le groupe Slack](slack.compromise.cool) pour discuter des détails.


Nous avons committé de fait un projet NLP (traitement du langage), avec une API française.

Il y a beacoup de problèmes / de differences grammaticales entre la version anglaise et la version française.

## Donc,
il est fabrique avec la wordnet fracais, (WOLF)[http://alpage.inria.fr/~sagot/wolf-en.html]:
* 10k adjectifs
* 12k verbes
* 2k adverbes
* 70k noms

### Des suffixes
* que$ -> k (banque -> bank, casque -> cask, disque -> disk)
* aire$ -> ary (tertiaire -> tertiairy)
* eur$ -> or (chercheur -> chearchor)
* ie$ -> y (cajolerie -> cajolery)
* té$ -> ty (extremité -> extremity)
* re$ -> er (ordre -> order, tigre -> tiger)
* ais$ -> ese, ois$ -> ese (libanais -> lebanese, chinois -> chinese)
* ant$ -> ing (changeant -> changeing)
* er$ -> "" (documenter -> document)
* osis$ -> ose (osmose -> osmose)
* ment$ -> ly (confortablement -> confortably)

On va apprendre les regles. BADDA BING BADA BOOM!

## Des sources
* [nicolashernandez/free-french-treebank](https://raw.githubusercontent.com/nicolashernandez/free-french-treebank/master/130612/frwikinews/txt-tok-pos/frwikinews-20130110-pages-articles.txt.tok.stanford-pos)

* [benob/french-tagger](https://github.com/benob/french-tagger/blob/master/lefff-word-tag.txt)

* [sequoia tagset](https://raw.githubusercontent.com/turbopape/postagga/master/resources/postagga-sequoia-fr.edn#)

* [fvcr verb conjugation dataset](https://sourceforge.net/projects/fvcr/?source=typ_redirect)
