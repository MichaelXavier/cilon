var testCase = require('nodeunit').testCase;
//FIXME: figure out how to extract this to a helper and auto require
var assert = require("./helpers/assert-extras"); 
var utils = require('../utils')

//------ validateSet tests
module.exports.test_validateSet = testCase({
  "falses": function(test) {
    assert.doesNotThrow(function() {
      utils.validateSet({deleteme:false},['deleteme']);
      utils.validateSet({deleteme:null},['deleteme']);
    }, "Doesn't throw on falsy, but set values.");
    test.done();
  },

  "general": function(test) {
    var obj = {first:1,second:2}
    assert.throws(function() {
      utils.validateSet({},['first', 'second']);
    }, "Collects missing options and throws them.");

    assert.doesNotThrow(function() {
      utils.validateSet(obj,['first', 'second']);
    }, "Does not throw if it finds all options required.")
    test.done();
  }
});

//------ intersperse tests
module.exports.test_intersperse = testCase({
  setUp: function() {this.arr = ['1', '2', '3']},

  "default options": function(test) {
    test.equals(utils.intersperse(this.arr), "123", "Uses an empty string as the default glue.")
    test.done();
  },
  
  "given glue": function(test) {
    test.equals(utils.intersperse(this.arr, ','), "1,2,3", "Only puts the glue between elements.")
    test.done();
  }
});
