### unreleased

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
