<div align="center">
  <img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
  <div><b>fr-compromise</b></div>
  <img src="https://user-images.githubusercontent.com/399657/68222691-6597f180-ffb9-11e9-8a32-a7f38aa8bded.png"/>
  <div>linguistique computationnelle modeste </div>
  <div><code>npm install fr-compromise</code></div>
  <div align="center">
    <sub>
     travaux en cours! • work-in-progress!  
    </sub>
  </div>
  <img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
</div>

<div align="center">
  <div>
    <a href="https://npmjs.org/package/fr-compromise">
    <img src="https://img.shields.io/npm/v/fr-compromise.svg?style=flat-square" />
  </a>
  <!-- <a href="https://codecov.io/gh/spencermountain/fr-compromise">
    <img src="https://codecov.io/gh/spencermountain/fr-compromise/branch/master/graph/badge.svg" />
  </a> -->
  <a href="https://bundlephobia.com/result?p=fr-compromise">
    <img src="https://badge-size.herokuapp.com/spencermountain/fr-compromise/master/builds/fr-compromise.min.js" />
  </a>
  </div>
</div>

<!-- spacer -->
<img height="85px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>


`fr-compromise` is a port of [compromise](https://github.com/nlp-compromise/compromise) in french.

The goal of this project is to provide a small, basic, rule-based POS-tagger.

L'objectif de ce projet est de fournir un petit POS-tagger de base basé sur des règles. 


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

```js
import tal from 'fr-compromise'

let doc = tal(`Je m'baladais sur l'avenue le cœur ouvert à l'inconnu`)
doc.match('#Noun').out('array')
// [ 'je', 'avenue', 'cœur', 'inconnu' ]
```

<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

oder im Browser:
```html
<script src="https://unpkg.com/fr-compromise"></script>
<script>
  let txt = `J'avais envie de dire bonjour à n'importe qui`
  let doc = frCompromise(txt) // espace de noms global 
  console.log(doc.sentences(1).json())
  // { text:'J'avais...', terms:[ ... ] }
</script>
```

see [en-compromise/api](https://github.com/spencermountain/compromise#api) for full API documentation.

Veuillez rejoindre pour aider! - please join to help!

<!-- spacer -->
<img height="85px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<!-- <h2 align="center">
  <a href="https://rawgit.com/nlp-compromise/fr-compromise/master/demo/index.html">Demo</a>
</h2> -->


### Contributing
```
git clone https://github.com/nlp-compromise/fr-compromise.git
cd fr-compromise
npm install
npm test
npm watch
```


<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<table>
  <tr align="center">
    <td>
      <a href="https://www.twitter.com/compromisejs">
        <img src="https://cloud.githubusercontent.com/assets/399657/21956672/a30cf206-da53-11e6-8c6c-0995cf2aef62.jpg"/>
        <div>&nbsp; &nbsp; &nbsp; Twitter &nbsp; &nbsp; &nbsp; </div>
      </a>
    </td>
    <td>
      <a href="https://github.com/nlp-compromise/compromise/wiki/Contributing">
        <img src="https://cloud.githubusercontent.com/assets/399657/21956742/5985a89c-da55-11e6-87bc-4f0f1549d202.jpg"/>
        <div>&nbsp; &nbsp; &nbsp; Pull-requests &nbsp; &nbsp; &nbsp; </div>
      </a>
    </td>
  </tr>
</table>



## Voir aussi

- [benob/french-tagger](https://github.com/benob/french-tagger/blob/master/lefff-word-tag.txt)
- [de-compromise](https://github.com/nlp-compromise/de-compromise) - german version


MIT