import spacetime from 'spacetime'

const toJson = function (arr) {
  return arr.map(o => {
    let res = {
      start: spacetime(o.start).iso()
    }
    if (o.end && o.end.year) {
      res.end = spacetime(o.end).iso()
    }
    return res
  })
}
export default toJson