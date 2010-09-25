var cp = require('child_process');
var P = require('path');
var sys = require('sys');
var fs = require('fs');
var utils = require('./utils')

function newGitRepo() {
  function gitCmd(dir, sub, args, errcb, okcb) {
    args.unshift(sub);
    cp.exec("git " + utils.intersperse(args, ' '), {cwd: dir}, function(err, sout, serr) {
      if (err && errcb) {
        errcb(err.code, sout, serr);
      } else if(okcb) {
        okcb(0, sout, serr);
      }
    });
  }

  function gitErr(sub, c, o, e) {
    utils.throwErr(c, o, e, "Git error on " + sub)
  }

  return {
    base_path: './Projects',

    clone: function(name, origin, cb) {
      var self = this;
      utils.createUnlessExists(self.base_path, 0755)

      var project_path = P.join(self.base_path, name);
      // Bail out if the the project already exists
      P.exists(project_path, function(exists) {
        if (exists) {
          cb();
          return;
        }
        gitCmd(self.base_path, 'clone', [origin, name], 
          function(c, o, e) { gitErr('clone', c, o, e); },
          function() { 
            sys.log("Finished cloning " + origin);
            cb(); 
          }
        );
      });
    },

    pull: function(name, cb) {
      var self = this;
      var project_path = P.join(self.base_path, name);
      gitCmd(project_path, 'fetch', ['origin'], 
        function(c, o, e) { gitErr('fetch', c, o, e) },
        function() {
          gitCmd(project_path, 'reset', ['--hard', 'origin/master'], 
            function(c, o, e) { gitErr('reset', c, o, e) },
            function() { cb(); }
          );
        }
      );
    }
  };
}

module.exports = newGitRepo();
