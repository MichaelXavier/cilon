var testCase = require('nodeunit').testCase;
//FIXME: figure out how to extract this to a helper and auto require
var assert = require("./helpers/assert-extras"); 
var Project = require('../project')

function defaultOpts() {
  return {
    name:"testProject",
    long_name:"Test Project",
    cmd:"rake",
    repo:"git://example.com/project1/project1.git"
  };
}

function defaultProject() { return Project.newProject(defaultOpts()); }

// I will re-enable these tests when I figure out how to stub the filesystem and child processes

//------ loadProjects tests
/*
module.exports.test_loadProjects = testCase({
});

//------ reload tests
module.exports.test_reload = testCase({
});
*/

//------ summarize tests
module.exports.test_summarize = testCase({
  setUp: function() {
    var opt2       = defaultOpts();
    opt2.name      = "testProject2";
    opt2.long_name = "Test Project 2";
    this.proj1     = defaultProject(); 
    this.proj2     = Project.newProject(opt2);
    this.projects  = {testProject1:this.proj1,testProject2:this.proj2};
  },

  "existing projects": function(test) {
    test.expect(1);
    var s = Project.summarize(this.projects);
    var expected = {testProject1:this.proj1.summarize(),testProject2:this.proj2.summarize()};
    test.same(s, expected, 'maps the test project summariez to the object.');
    test.done();
  },
  "no projects":       function(test) {
  },
});

//------ teardown tests
/*
module.exports.test_teardown = testCase({
});

//------ newProject tests
module.exports.test_newProject = testCase({
});

//------ newProject#build tests
module.exports.test_newProject_build = testCase({
});

//------ newProject#setup tests
module.exports.test_newProject_setup = testCase({
});
*/

//------ newProject#summarize tests
module.exports.test_newProject_summarize = testCase({
  setUp: function() {this.proj = defaultProject();},

  "general": function(test) {
    test.expect(4);

    this.proj.last_built = null;
    this.proj.output     = "Test Output";
    this.proj.error      = "Test Error";

    var s = this.proj.summarize();
    test.equals(s.long_name, "Test Project",
      "sets the long_name attribute.");
    test.equals(s.output, "Test Output",
      "sets the output attribute.");
    test.equals(s.error, "Test Error",
      "sets the error attribute.");

    test.equals(s.last_built, "N/A",
      "sets the last_built date to 'N/A' when not set.");

    test.done();
  },
  
  "ok status": function(test) {
    test.expect(2);

    this.proj.ok      = true;
    this.proj.process = {};

    test.equals(this.proj.summarize().status, 
      "building", "has building status if a process is present.");

    this.proj.process = null;
    test.equals(this.proj.summarize().status, "succeeded", 
      "has succeeded status if a process is absent.");

    test.done();
  },

  "not ok status": function(test) {
    test.expect(2);

    this.proj.ok = false;
    this.proj.last_built = new Date();
    test.equals(this.proj.summarize().status, "failed", 
      "has failed status if a last built is present.");
    this.proj.last_built = null;
    test.equals(this.proj.summarize().status, "new", 
      "has new status if a last built is present.");
    test.done();
  },
});
