// import wtf from 'wtf_wikipedia'
import rp from 'request-promise';
import $ from 'cheerio';
import list from './list.js'


const doit = async function (word) {
  const url = `https://fr.wiktionary.org/wiki/${encodeURIComponent(word)}`;
  return rp(url)
    .then(function (html) {
      //success!
      const all = []
      const r = $('.flextable-fr-mfsp :first a ', html)
      r.each(function (i, o) {
        const str = $(this).text()
        if (!/^\\/.test(str)) {
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
    const all = {}

    const keys = Object.keys(list)
    for (let i = 0; i < keys.length; i += 1) {

      const w = keys[i]
      all[w] = await doit(w)
    }
    console.log(JSON.stringify(all, null, 2))

  })()