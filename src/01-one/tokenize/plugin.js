import unicode from './unicode.js'
import contractions from './contractions.js'
import compute from './compute/index.js'


export default {
  mutate: (world) => {
    world.model.one.unicode = unicode

    world.model.one.contractions = contractions
  },
  compute
}