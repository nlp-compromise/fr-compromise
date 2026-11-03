import nlp = require('fr-compromise')

const text: string = nlp('hello').text()
const version: string = nlp.version
const tokens: string = nlp.tokenize('hello').text()
// @ts-expect-error input must be a string
nlp(42)
// @ts-expect-error document text is a string
const bad: number = nlp('hello').text()
export { text, version, tokens, bad }

const plugin: nlp.TypedPlugin<{}> = { methods: {} }
export { plugin }
