function Utils() {
  return {
    validateSet: function(opts, ks) {
      ks.forEach(function(k) {
        if (!(k in opts)) throw "Missing option: " + k;
      });
    },

    intersperse: function(list, glue) {
      list.reduce(function(acc,v,i,l) {
        return i == l - 1 ? acc : acc + glue;
      }, "");
    }
  }
}

module.exports = Utils();
