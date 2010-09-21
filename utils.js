var fs = require('fs');

function Utils() {
  return {
    validateSet: function(opts, ks) {
      var missing = [];
      ks.forEach(function(k) {
        k in opts || missing.push(k);
      });
      if (missing.length > 0) throw "Missing options: " + this.intersperse(missing,', ');
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
    createUnlessExists: function(path, mode) {
      P.exists(base_path, function(exists) {
        if (!exists) fs.mkdirSync(path, mode || 0755);
      });
    }
  }
}

module.exports = Utils();
