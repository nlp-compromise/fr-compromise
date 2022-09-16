// import wtf from 'wtf_wikipedia'
import rp from 'request-promise';
import $ from 'cheerio';
import list from './list.js'


const doit = async function (word) {
  const url = `https://fr.wiktionary.org/wiki/${encodeURIComponent(word)}`;
  return rp(url)
    .then(function (html) {
      //success!
      let all = []
      let r = $('.flextable-fr-mfsp :first a ', html)
      r.each(function (i, o) {
        let str = $(this).text()
        if (!str.match(/^\\/)) {
          all.push(str)
        }
      })
      return all
    })
    .catch(function (err) {
      console.log('error')
    });

}

  ; (async () => {
    let all = {}

    let keys = Object.keys(list)
    for (let i = 0; i < keys.length; i += 1) {

      let w = keys[i]
      all[w] = await doit(w)
    }
    console.log(JSON.stringify(all, null, 2))

  })()