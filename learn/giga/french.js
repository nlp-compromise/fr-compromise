import { streamXml } from './_giga.js'
const gigaFr = '/Users/spencer/data/opus/fr/giga-fren/xml/fr/giga-fren.release2.fixed.'

// kick them off
const parseXml = function (id, doBoth) {
  const parseFR = function (item) {
    try {
      doBoth({ fr: item.w || [] })
      return true
    } catch (e) {
      console.log(e)
    }
  }
  return new Promise((resolve, reject) => {

    const doneMaybe = function () {
      console.log('--done-- ')
      resolve()
    }

    try {
      streamXml(gigaFr + `${id}.xml`, parseFR, doneMaybe)
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

export default parseXml