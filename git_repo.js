var cp = require('child_process');
var P = require('path');
var sys = require('sys');
var fs = require('fs');
var utils = require('./utils')

function newGitRepo() {
  var base_path = './Projects';

  function createProjects() {
    var self = this;

    P.exists(base_path, function(exists) {
      if (!exists) fs.mkdirSync(base_path, 0755);
    });
  }

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
    throw sub + " error(" + c + ") " + o + "\nSTDERR:\n" + e;
  }

  return {
    clone: function(name, origin, cb) {
      var self = this;
      createProjects();

      var project_path = P.join(base_path, name);
      // Bail out if the the project already exists
      P.exists(project_path, function(exists) {
        if (exists) return;
        gitCmd(base_path, 'clone', [origin, name], 
          function(c, o, e) { gitErr('clone', c, o, e) },
          function(c, o, e) {
            console.log("Finished cloning " + origin);
          }
        );
      });
    },

    pull: function(name, cb) {
      var self = this;
      var project_path = P.join(base_path, name);
      gitCmd(project_path, 'fetch', ['origin'], 
        function(c, o, e) { gitErr('clone', c, o, e) },
        function(c, o, e) {
          gitCmd(project_path, 'reset', ['--hard', 'origin/master'], 
            function(c, o, e) { gitErr('fetch', c, o, e) }
          );
        }
      );
      cb();
    }
  };
}

module.exports = newGitRepo();
