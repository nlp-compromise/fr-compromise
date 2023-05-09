import api from './api.js'

let lexicon = {
  heir: 'Date',
  soir: 'Date',
  nuit: 'Date',
  'soirée': 'Date',
  matin: 'Date',
  'après midi': 'Date',
  semaine: 'Duration',
}

export default {
  words: lexicon,
  api,
}