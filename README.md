
:boom: C'est [nlp-compromise](https://github.com/nlp-compromise/nlp_compromise) en francais! :boom:

##Traitement automatique du langage naturel en client font

Salut: Ce projet a commencer par (spencermountain)[https://twitter.com/spencermountain], un debutant francais. Donx, on a besoin beacoup d'aide francais, sinon programmatique.

Nous avons committer de fait un projet TALN responsable, avec un API francais.

Il y a beacoup des problems pour resoudre, et des differences grammatique entre les versions anglais et francais.

##Donc,
il est fabrique avec la wordnet fracais, (WOLF)[http://alpage.inria.fr/~sagot/wolf-en.html]:
* 10k adjectifs
* 12k verbes
* 2k adverbes
* 70k noms

###Des suffixes
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
