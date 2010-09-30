var P = require('path');
var fs = require('fs');

function Utils() {
  return {
    validateSet: function(opts, ks) {
      var missing = [];
      ks.forEach(function(k) {
        k in opts || missing.push(k);
      });
      if (missing.length > 0) throw new Error("Missing options: " + this.intersperse(missing,', '));
    },

    intersperse: function(list, glue) {
      glue || (glue = "");
      return list.reduce(function(acc,v,i,l) {
        acc += v;
        if (i != l.length - 1) acc += glue;
        return acc;
      }, "");
    },

    //TODO: specme when stubbing the filesystem makes sense
    //createUnlessExists: function(path, mode) {//MXDEBUG
    createUnlessExists: function(path, mode, cb) {
      P.exists(path, function(exists) {
        console.log("CHECK PATH " + path + " exists: " + exists);//MXDEBUG
        //if (!exists) fs.mkdirSync(path, mode || 0755);//MXDEBUG
        if (exists) { 
          console.log("exists, callback");//MXDEBUG
          cb();
        } else {
          console.log("doesn't exist. mkdir");//MXDEBUG
          //fs.mkdirSync(path, mode || 0755);//MXDEBUG
          fs.mkdir(path, mode || 0755, cb);
          //cb();
        }
      });
    },

    throwErr: function(code, output, err, msg) {
      throw new Error(msg + " error(" + code + ") " + output + "\nSTDERR:\n" + err);
    }
  }
}

module.exports = Utils();
