'use strict';
var parser = require('xml2json');
let fs = require('fs');

let xml = fs.readFileSync(__dirname + '/wolf-1.0b4.xml', 'utf8');
// let xml = fs.readFileSync(__dirname + '/tiny.xml', 'utf8');
// xml to json
// var xml = '<foo>bar</foo>';
var json = JSON.parse(parser.toJson(xml));

let words = [];

let len = json.WN.SYNSET.length;
for (var i = 0; i < len; i++) {
  if (json.WN.SYNSET[i].SYNONYM.LITERAL !== '_EMPTY_') {
    if (json.WN.SYNSET[i].POS !== 'n') {
      continue;
    }
    let str = json.WN.SYNSET[i].SYNONYM.LITERAL['$t'];
    if (str) {
      words.push(str);
    } else {
      json.WN.SYNSET[i].SYNONYM.LITERAL.forEach(function(o) {
        words.push(o['$t']);
      });
    }
  }
}

console.log(JSON.stringify(words, null, 2));
