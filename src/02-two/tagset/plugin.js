import { tagSet } from 'compromise/shared'
import nouns from './tags/nouns.js'
import verbs from './tags/verbs.js'
import values from './tags/values.js'
import dates from './tags/dates.js'
import misc from './tags/misc.js'

const ours = Object.assign({}, nouns, verbs, values, dates, misc)

// english tags that we have no use for
const unused = ['Plural']
// start from the shared tagset, then apply our own tags and changes
const tags = { ...tagSet }
unused.forEach(tag => delete tags[tag])

Object.keys(ours).forEach(tag => {
  const en = tags[tag]
  if (!en) {
    tags[tag] = ours[tag]
    return
  }
  // our aliases lead, so the first one stays the preferred name - then the english ones, like #NN
  const aliases = (ours[tag].aliases || [null]).concat((en.aliases || []).filter(str => str))
  tags[tag] = { ...en, ...ours[tag], aliases }
})

export default {
  tags
}
