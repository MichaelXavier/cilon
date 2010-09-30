var testCase = require('nodeunit').testCase;
//FIXME: figure out how to extract this to a helper and auto require
var assert   = require("./helpers/assert-extras"); 
var utils    = require('../utils')
var fs       = require('fs');
var P        = require('path');

process.chdir(__dirname);

//------ validateSet tests
module.exports.test_validateSet = testCase({
  "falses": function(test) {
    test.expect(1);
    
    test.doesNotThrow(function() {
      utils.validateSet({deleteme:false},['deleteme']);
      utils.validateSet({deleteme:null},['deleteme']);
    }, "Doesn't throw on falsy, but set values.");

    test.done();
  },

  "general": function(test) {
    test.expect(2);

    var obj = {first:1,second:2}

    test.throws(function() {
      utils.validateSet({},['first', 'second']);
    }, "Collects missing options and throws them.");

    test.doesNotThrow(function() {
      utils.validateSet(obj,['first', 'second']);
    }, "Does not throw if it finds all options required.")

    test.done();
  }
});

//------ intersperse tests
module.exports.test_intersperse = testCase({
  setUp: function() {this.arr = ['1', '2', '3']},

  "default options": function(test) {
    test.expect(1);

    test.equals(utils.intersperse(this.arr), "123", "Uses an empty string as the default glue.")

    test.done();
  },
  
  "given glue": function(test) {
    test.expect(1);

    test.equals(utils.intersperse(this.arr, ','), "1,2,3", "Only puts the glue between elements.")

    test.done();
  }
});

//------ createUnlessExists tests
module.exports.test_createUnlessExists = testCase({
  tearDown: function() {
    P.exists("temp", function(exists) {
      exists && fs.rmdirSync("temp");
    });
  },

  //FIXME: broken
  "non-existant dir": function(test) {
    test.expect(2);
    //utils.createUnlessExists("temp", 0777);
    utils.createUnlessExists("temp", 0777, function() {
      console.log("CALLBACK!!! HOLLA");//MXDEBUG
      P.exists("temp", function(exists) {
        test.ok(exists, "Creates the directory.");
      });
      fs.stat("temp", function(err, stats) {
        test.equals(stats.mode, 0777, "Sets the proper file permissions.");
      });

    });
    test.done();
  },

  "existing dir": function(test) {
    test.expect(2);
    // Create with different permissions so its obvious who made it
    fs.mkdir("temp", 0777, function() {
      utils.createUnlessExists("temp, 0755", function() {
        P.exists("temp", function(exists) {
          test.ok(exists, "Leaves the directory there");
        });

        fs.stat("temp", function(err, stats) {
          test.equals(stats.mode, 0777, "Does not recreate the directory");
        });
      });
    });
    test.done();
  }
});
