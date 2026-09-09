// Compile-time consumer test. This file is never executed.
import nlp from 'fr-compromise'

const doc = nlp('vingt-cinq livres')
const text: string = doc.text()
const value: number | number[] = doc.numbers().get()
doc.numbers().add(1).toText()
doc.contractions().expand()

const tokens = nlp.tokenize('un texte court')
const version: string = nlp.version

// @ts-expect-error input text must be a string
nlp(25)

export { text, tokens, value, version }
