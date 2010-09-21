var cp = require('child_process');
var P = require('path');
var fs = require('fs');
var utils = require('./utils');
var gr = require('./git_repo');

function Project() {
  return {
    loadProjects: function(json) {
      return JSON.parse(json).reduce(function(acc,o) {
        var proj = Project().newProject(o);
        acc[proj.options.name] = proj;
        return acc;
      }, {});
    },

    reload: function() {
      return this.loadProjects(fs.readFileSync('projects.json', 'utf8'));
    },

    summarize: function(projects) {
      var ret = {};
      for (var p in projects) {
        ret[p] = projects[p].summarize();
      }
      return ret;
    },

    teardown: function(projects) {
      projects.forEach(function(p) {
        if (p.process) p.process.kill();
      });
    },

    newProject: function(opt) {
      //--- Setup
      utils.validateSet(opt, ['name', 'cmd', 'repo']);

      //---- Public interface
      return {
        //--- Accessors
        process:null,
        ok:false,
        output:"",
        error:"",
        options:opt,
        last_built:null,
        project_path:P.join(gr.base_path, opt.name),

        //--- Public methods
        build: function() {
          var self = this;

          gr.pull(self.options.name, function() {
            // Kill the current worker if its still running, clear out the state
            if (self.process) self.process.kill();

            self.process = cp.exec(self.options.cmd, {cwd:self.project_path}, function(err, sout, serr) {
              self.process = null;
              self.ok = !err;
              self.output = sout;
              self.error = serr;
              self.last_built = new Date();
              //TODO: feels like there should be listeners or something here
            });
          });
        },

        setup: function() {
          var self = this;
          if (self.ok || self.last_build || self.process) return;

          console.log("Setting up project " + self.options.name + ".");
          gr.clone(self.options.name, self.options.repo, function() {
            console.log("Done setting up project " + self.options.name + ".");
          });
        },

        summarize: function() {
          var self = this;
          var ret = {long_name:self.options.long_name,output:self.output,error:self.error,last_built:self.last_built ? self.last_built.toString() : "N/A"};
          ret.status = self.ok ? (self.process ? "building" : "succeeded") : self.last_built ? "failed" : "new";
          return ret;
        }
      };
    }
  };
}

module.exports = Project();
