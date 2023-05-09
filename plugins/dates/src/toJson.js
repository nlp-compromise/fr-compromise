
const toJson = function (arr) {
  return arr.map(o => {
    let res = {
      start: o.start.start().iso()
    }
    // either explicit or implicit end date
    if (o.end) {
      res.end = o.end.end().iso()
    } else {
      res.end = o.start.end().iso()
    }
    return res
  })
}
export default toJson