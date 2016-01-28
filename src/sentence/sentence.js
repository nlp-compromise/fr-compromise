'use strict';
const fns = require('../fns.js');
const Term = require('../term/term.js');

//a sentence is an array of Term objects, along with their various methods
class Sentence {

  constructor(str) {
    const the = this;
    this.str = str || '';
    const terms = str.split(' ');
    //build-up term-objects
    this.terms = terms.map(function(s) {
      return new Term(s);
    });

  }

  //the ending punctuation
  terminator() {
    const allowed = ['.', '?', '!'];
    const punct = this.str.slice(-1) || '';
    if (allowed.indexOf(punct) !== -1) {
      return punct;
    }
    return '.';
  }

  //is it a question/statement
  sentence_type() {
    const char = this.terminator();
    const types = {
      '?': 'interrogative',
      '!': 'exclamative',
      '.': 'declarative',
    };
    return types[char] || 'declarative';
  }

  //map over Term methods
  text() {
    return this.terms.reduce(function(s, t) {
      //implicit contractions shouldn't be included
      if (t.text) {
        if (s === '') {
          s = t.text;
        } else {
          s += ' ' + t.text;
        }
      }
      return s;
    }, '');
  }
  //like text but for cleaner text
  normalized() {
    return this.terms.reduce(function(s, t) {
      if (t.text) {
        s += ' ' + t.normal;
      }
      return s;
    }, '');
  }
}

Sentence.fn = Sentence.prototype;

module.exports = Sentence;
