
const toJson = function (arr) {
  return arr.map(o => {
    let res = {
      start: o.start.start().iso()
    }
    if (o.end && o.end.year) {
      res.end = o.end.end().iso()
    } else {
      res.end = o.start.end().iso()
    }
    return res
  })
}
export default toJson