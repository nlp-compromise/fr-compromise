const fixGender = require('./fixGender')
const fixPeople = require('./fixPeople')

const corrections = function (doc) {
  fixGender(doc)
  fixPeople(doc)
}
module.exports = corrections
