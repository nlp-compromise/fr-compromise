const hasDash = /^\p{Letter}+-\p{Letter}+$/u
// 'machine' is a normalized form that looses human-readability
const doMachine = function (term) {
  let str = term.implicit || term.normal || term.text
  // remove apostrophes
  str = str.replace(/['’]s$/, '')
  str = str.replace(/s['’]$/, 's')
  //lookin'->looking (make it easier for conjugation)
  str = str.replace(/([aeiou][ktrp])in'$/, '$1ing')
  //turn re-enactment to reenactment
  if (hasDash.test(str)) {
    str = str.replace(/-/g, '')
  }
  // remove accented chars
  // str = str.replace(/è/g, 'e')
  //#tags, @mentions
  str = str.replace(/^[#@]/, '')
  if (str !== term.normal) {
    term.machine = str
  }
}
export default doMachine
