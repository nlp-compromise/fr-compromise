### Unreleased

- **[breaking]** - `nlp.TypedPlugin` type is removed
- **[change]** - typescript types rewritten from the real api - core `View` types now come from `compromise`, and the document type is `FrView`
- **[new]** - types for `nlp.fromSpec()`, `nlp.testSpec()` and `nlp.compile()`
- **[change]** - remove `nlp.lazy()` from types and docs - it lives in a plugin now
- **[fix]** - `.numbers().set()`, `.add()` and `.subtract()` accept a written number - `.add('deux')` - and ignore a string that isn't one
- **[fix]** - `.numbers().json(n)` returns the nth number, instead of throwing
- **[fix]** - `.numbers().get()` and `.parse()` return `[]` when there are no numbers
- **[fix]** - `.numbers().add()`, `.set()`, `.toText()` and friends can be chained - `.add(2).get()` - the view follows the number it re-wrote, and the new words are tagged as a number
- **[fix]** - 'sept' is the number 7 - 'sept chats' - and only a Month inside a date - 'le 5 sept', 'sept 2020'
- **[fix]** - `.verbs().parse()` returns `[]` when there are no verbs
- **[fix]** - `.contractions()` returns each contraction as its own match - "j'aime l'été" is two - and `.contractions(n)` returns the nth
- **[change]** - minimum node version is 18
- **[update]** - tests moved to `tests/unit`, `tests/types`, `tests/_hmm` and `tests/_backlog`
- **[update]** - suffix-thumb 6.1.0

### 0.3.2 [Nov 2026]

- **[update]** - smaller suffix-thumb format
- **[new]** - support localized tag names
- **[update]** - dependencies

### 0.3.1 [Sep 2026]

- **[change]** - add typescript types

### 0.3.0 [Sep 2026]

- **[fix]** - lexicon: 'a' is avoir (was Preposition), 'eu' is a participle (was Organization), 'tu' is a pronoun, 'dit'/'plus'/'venu' fixes
- **[fix]** - copula tenses - étions/serez/serais were all PresentTense
- **[new]** - conditional mood throughout - lexicon, conjugate(), '{inf}' match syntax, ConditionalVerb tagging
- **[new]** - Imperfect tag - imparfait forms are now distinguished from participles
- **[fix]** - root/infinitive extraction of imperfect forms ('marchait' gave 'marchaire')
- **[fix]** - verbs().toPastTense() now conjugates the imperfect ('je mangeais', not 'je mangé')
- **[new]** - verbs().toPresentTense() and toFutureTense(), with person agreement
- **[fix]** - contractions: n'y expanded to 'ne a', c'est/m'a/l' gender, d' is always 'de'
- **[fix]** - subject-verb person agreement - 'elle parle' was FirstPerson
- **[fix]** - passé composé with être - 'ils sont arrivés', reflexive 'se sont levés'
- **[fix]** - numbers toText: hyphens, 'soixante et onze', 'quatre-vingts', 'deux cents', 'un million'
- **[fix]** - messieurs, vieille, pu/plu participles
- **[new]** - tagger rules: 'il fait', 'a fait/ont dit', modal + infinitive ('peux le faire'), 'ce' + noun as Determiner, 'est-ce que', substantivized adjectives (l'inconnu)
- **[fix]** - object clitics me/te/toi/lui are pronouns, not possessives
- **[new]** - lexicon-pack script now warns on word collisions between categories

### 0.2.8 [Aug 2023]

- **[fix]** - conjugtion issues
- **[update]** - dependences

### 0.2.7 [May 2023]

- **[fix]** - tagging
- **[new]** - `fr-compromise-dates`

### 0.2.6 [Feb 2023]

- **[fix]** - support multi-lexicon
- **[fix]** - try new suffix thumb
- **[fix]** - conjugation fixes

### 0.2.0 [Sept 2022]

- **[fix]** - inflections+conjugations
- **[new]** - start of verb, noun, and adjective methods

### 0.1.2 [August 2022]

- **[fix]** - inflections+conjugations

### 0.1.1 [July 2022]

- **[fix]** - import format
- **[new]** - typescript types

### 0.1.0 [June 2022]

- **[new]** - `.compute('root')`
- **[new]** - number-parsing

### 0.0.2 [June 2022]

- **[new]** - support root matches
- **[new]** - `.compute('root')`
- **[new]** - FirstPerson, SecondPerson tags etc.
