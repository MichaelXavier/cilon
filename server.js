var http    = require("http");
var fs      = require("fs");
var url     = require("url");
var sys = require('sys');
var argv    = require('optimist').argv;
var Project = require('./project')

var projects = Project.reload();
var port = argv.p || 3000;

// HUP signal triggers a reload
process.on("SIGHUP", function() {
  sys.log("Caught HUP. Reloading...");
  projects = Project.reload();
  sys.log("Reload completed.");
});

process.on("exit", function() {
  sys.log("Caught EXIT. Killing child processes...");
  Project.teardown(projects);
});

http.createServer(function(req, res) {
  var u = url.parse(req.url);

  try {
    if (u.pathname == '/') {
      if (req.method == 'GET') { //Summarize
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify(Project.summarize(projects)), 'utf8');
      } else if (req.method == 'POST') { // Reload
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.end();
        sys.log("Got reload request.");
        projects = Project.reload();
        sys.log("Reload completed.");
      }
    } else { // format of /:project/setup or /:project/build
      var parts = u.pathname.match(/^\/(\w+)\/(\w+)/);
      var project_name = parts[1], action = parts[2];
      if (!action) action = 'build';
      if (projects[project_name]) {
        switch(action) {
          case "build":
            sys.log("Build requested for project " + project_name);
            projects[project_name].build();
            break;
          case "setup":
            sys.log("Setup requested for project " + project_name);
            projects[project_name].setup();
            break;
        }
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.end();
      } else {
        res.writeHead(404, {'Content-Type':'text/plain'});
        res.end('Could not find project with name ' + project_name, 'utf8');
      }
    }
  } catch(err) {
    //FIXME: I don't think the request is even waiting around this long
    res.writeHead(500, {'Content-Type':'text/plain'});
    res.end("Internal Error: " + err.message, 'utf8');
    sys.log("Internal Error: " + err.message, 'utf8');
  }
}).listen(port, "localhost");

console.log("Server running on port " + port + " with pid " + process.pid + ". That means on your feet, nuggets!");
