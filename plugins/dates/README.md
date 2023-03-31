  
  <div align="center">
    <sub>
       travaux en cours! • work-in-progress!  
    </sub>
  </div>

```js
import nlp from 'fr-compromise'
import frDatePlugin from 'fr-compromise-dates'
nlp.plugin(frDatePlugin)

let doc = nlp('entre sept et oct')
doc.dates().json()[0]
/*
 { text: 'entre sept et oct',
   date: [{
      start: { month: 9, year: 2023 },
      end: { month: 10, year: 2023 }
  }]
 }*/
```

MIT