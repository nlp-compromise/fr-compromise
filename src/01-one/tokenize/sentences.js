// sentence-splitting rules that the english parser doesn't have.
// - isSentence() replaces the english one, and only sees the end of a chunk
// - wrap() runs after the english splitter, so it can see the next sentence too
// all of the language-specific parts are in ./abbreviations.js
const MAX_QUOTE = 500
const MAX_MERGE = 6

const hasLetter = /\p{L}/u
const hasUpper = /\p{Lu}/u
const hasPeriod = /\. *$/
const hasEllipse = /(?:\u2026|\.{2,}) *$/
// an uppercase initial - 'A. S. Pushkin', or a dotted letter - 'F.B.I.', 'u.a.'
const isInitial = /(?:(?:^|[\s([«»„“"'-])\p{Lu}|\.\p{L})\. *$/u
// one lowercase letter - 'z. B.', 'i. d. R.'
const isLetter = /(?:^|[\s([«»„“"'])\p{Ll}\. *$/u
// '3.' or '102.', and 'VIII.'
const isOrdinal = /(?:\d|(?<!\p{L})[IVX]{2,})\. *$/u
const trailing = /[.!?\u203D\u2E18\u203C\u2047\u2048\u2049]+ *$/
const leading = /^[([{«»„“”"'‚‘¿¡—–-]+/
const elision = /^\p{L}+['’]/u // l'avv.
const endsNewline = /\n\s*$/
// 'Who's there? — he asked.'
const endsAsk = /[?!\u2026]["»“”«]*[ \t\u00A0\u202F]*$/
const startsLower = /^\p{Ll}/u
const startsDash = /^[—–]\s*\p{Ll}/u
const isRoman = /^[IVX]+$/
const isNumeral = /^[ivxlcdm]+$/
const isName = /^\p{Lu}\p{L}+s$/u // 'Beethovens'

const escape = str => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
const count = (str, char) => str.split(char).length - 1
const toSet = arr => new Set((arr || []).map(str => str.toLowerCase()))

// the last word of a chunk - 'dr', 'pág', 'avv'
const lastWord = function (str) {
  let w = str.replace(trailing, '').split(/\s/).pop() || ''
  w = w.replace(leading, '').replace(elision, '')
  return w.toLowerCase()
}

// 'p.ej.' and 'Dipl.-Ing.'
const has = function (obj, w) {
  return Object.hasOwn(obj, w) || Object.hasOwn(obj, w.split(/[.-]/).pop())
}

const build = function (config) {
  const { quotes = [], enders = [], starters = [], units = [] } = config
  // abbreviations that go before a name, and never end a sentence - 'Dr.'
  const titles = config.titles || {}
  // abbreviations that end a sentence, when a capital letter comes next - 'etc.'
  const abbreviations = config.abbreviations || {}
  const months = toSet(config.months)
  const ordinalAfter = toSet(config.ordinalAfter)
  const isStarter = toSet(starters)
  // '5 kg.'
  const isUnit = units.length > 0 ? new RegExp(`\\d\\s?(?:${units.join('|')})\\. *$`, 'iu') : null
  // 'a. C.' or 'и т. д.'
  const isEnder = enders.length > 0 ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${enders.join('|')})\\. *$`, 'iu') : null

  /** does this look like the end of a sentence? */
  const isSentence = function (str, abbrevs, foundLetter = hasLetter.test(str)) {
    // must have a letter
    if (foundLetter === false) {
      return false
    }
    // 'F.B.I.' or 'A. S. Pushkin'
    if (isInitial.test(str)) {
      return false
    }
    if (config.singleLetters && isLetter.test(str)) {
      return false
    }
    // 'am 3. Mai'
    if (config.ordinals && isOrdinal.test(str)) {
      return false
    }
    // '...' - may get split again, below
    if (hasEllipse.test(str)) {
      return false
    }
    if (hasPeriod.test(str)) {
      // 'Dr.' but not 'Dr?'
      const w = lastWord(str)
      if (has(abbrevs, w)) {
        return false
      }
      // 'Hauptstr.'
      if (config.suffix && config.suffix.test(w)) {
        return false
      }
      // words that are only sometimes abbreviations - 'em set.'
      if (config.conditional && config.conditional.test(str)) {
        return false
      }
      if (config.titleIf && config.titleIf.test(str)) {
        return false
      }
      if (isUnit !== null && isUnit.test(str)) {
        return false
      }
    }
    return true
  }

  // are we inside a quotation, or some brackets?
  const isOpen = function (str) {
    return quotes.some(([open, close]) => {
      if (open === close) {
        return count(str, open) % 2 === 1
      }
      return count(str, open) > count(str, close)
    })
  }

  // put a quotation back together, when it has many sentences in it
  const quoteMerge = function (arr) {
    const out = []
    for (let i = 0; i < arr.length; i += 1) {
      let str = arr[i]
      if (isOpen(str)) {
        let merged = str
        for (let n = i + 1; n < arr.length && n - i < MAX_MERGE; n += 1) {
          if (endsNewline.test(merged)) {
            break
          }
          merged += arr[n]
          if (merged.length > MAX_QUOTE) {
            break
          }
          if (!isOpen(merged)) {
            // the quotation closes here
            str = merged
            i = n
            break
          }
        }
      }
      out.push(str)
    }
    return out
  }

  // places where a sentence may end, that are only clear from the word after it
  const opens = escape(quotes.map(a => a[0]).join(''))
  const closes = escape(quotes.map(a => a[1]).join(''))
  const upper = `(?=(?:[—–-]\\s?)?[${opens}¿¡]*[ \u00A0\u202F]?(?<next>\\p{Lu}\\p{L}*))`
  const rules = [
    // 'he said "no." Then he left'
    `(?<quote>[.!?\u2026][ \u00A0\u202F]?[${closes || '"'}]+)\\s+`,
    // 'I don't know... Maybe tomorrow'
    `(?<dots>\u2026|\\.{2,})\\s+`,
    // 'Ich habe 5. Du hast 3.'
    `(?<![\\p{L}\\p{N}.,])(?<num>\\d[\\d.,]*|[IVX]{2,})\\.\\s+`,
    // 'bread, milk, etc. Then he left'
    `(?<![\\p{L}\\p{N}])(?<word>[\\p{L}\\p{N}](?:[\\p{L}\\p{N}.-]*[\\p{L}\\p{N}])?)\\.\\s+`,
  ]
  const boundary = new RegExp(`(?:${rules.join('|')})${upper}`, 'gu')

  // is this number an ordinal, like 'der 3. Mann'?
  const isNth = function (before, num, next) {
    if (months.has(next)) {
      return true
    }
    if (isStarter.has(next)) {
      return false
    }
    if (isRoman.test(num)) {
      return true
    }
    // '3,5' is not an ordinal, and neither is the year in '12.03.2024'
    if (/[.,]/.test(num)) {
      return !num.includes(',') && num.split('.').pop().length < 3
    }
    // the word before the number
    const w = (before.slice(0, before.length - num.length - 1).match(/(\S+)\s+$/) || [])[1]
    if (w === undefined) {
      return true
    }
    return ordinalAfter.has(w.toLowerCase()) || isName.test(w)
  }

  // does a sentence end here?
  const isBoundary = function (m, before) {
    const { quote, dots, num, word } = m.groups
    const next = m.groups.next.toLowerCase()
    if (quote !== undefined) {
      return closes.length > 0
    }
    if (dots !== undefined) {
      return config.ellipsis === true
    }
    if (num !== undefined) {
      return config.ordinals === true && !isNth(before, num, next)
    }
    // an abbreviation, that the english parser did not split on
    // a word that begins sentences, and is never a name - 'Ask the Dr. He knows'
    if (isStarter.has(next)) {
      return true
    }
    if (isEnder !== null && isEnder.test(before)) {
      return true
    }
    // when nouns are capitalised, a capital letter is not enough
    if (config.nounCaps === true) {
      return false
    }
    if (isUnit !== null && isUnit.test(before)) {
      return true
    }
    // 'vol. II'
    if (isNumeral.test(next)) {
      return false
    }
    const w = word.toLowerCase()
    if (has(titles, w)) {
      return false
    }
    if (config.conditional && config.conditional.test(before)) {
      return true
    }
    return has(abbreviations, w)
  }

  const resplit = function (str) {
    const out = []
    let start = 0
    for (const m of str.matchAll(boundary)) {
      const end = m.index + m[0].length
      const piece = str.slice(start, end)
      // don't split inside a quotation, or leave a piece with no words in it
      if (!hasLetter.test(piece) || isOpen(piece)) {
        continue
      }
      if (isBoundary(m, piece.trimEnd())) {
        out.push(piece)
        start = end
      }
    }
    out.push(str.slice(start))
    return out
  }

  // '— Come here! — she said.' is one sentence
  const dialogueMerge = function (arr) {
    const out = []
    arr.forEach(str => {
      const last = out[out.length - 1]
      if (last !== undefined && endsAsk.test(last)) {
        // lowercase text gives us no clues, so only trust it after a capital
        if (startsDash.test(str) || (startsLower.test(str) && hasUpper.test(last))) {
          out[out.length - 1] += str
          return
        }
      }
      out.push(str)
    })
    return out
  }

  /** add our own passes to the end of the english sentence-splitter */
  const wrap = function (splitSentences) {
    return function (text, world) {
      let arr = splitSentences(text, world)
      arr = quoteMerge(arr)
      arr = arr.flatMap(resplit)
      arr = dialogueMerge(arr)
      return arr
    }
  }

  return { isSentence, wrap, abbreviations: { ...titles, ...abbreviations } }
}

export default build
