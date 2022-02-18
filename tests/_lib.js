/* eslint-disable no-console */
import build from '../builds/fr-compromise.mjs'
import src from '../src/index.js'
let nlp = src
if (process.env.TESTENV === 'prod') {
  console.warn('== production build test 🚀 ==')
  nlp = build
}
export default nlp
