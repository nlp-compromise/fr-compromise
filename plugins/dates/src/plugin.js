import api from './api.js'

const lexicon = {
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