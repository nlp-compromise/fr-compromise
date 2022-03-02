import nouns from './tags/nouns.js'
import verbs from './tags/verbs.js'
import values from './tags/values.js'
import dates from './tags/dates.js'
import misc from './tags/misc.js'

let tags = Object.assign({}, nouns, verbs, values, dates, misc)

export default {
  tags
}
