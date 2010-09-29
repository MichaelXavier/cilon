var http    = require("http");
var fs      = require("fs");
var url     = require("url");
var sys = require('sys');
var argv    = require('optimist').argv;
var Project = require('./project')

var projects = Project.reload();
var port = argv.p || 3000;

var interrupted = false;
function ok(response, body) {
  response.writeHead(200, {'Content-Type':'application/json'});
  response.end(body, 'utf8');
}

function not_found(response, body) {
  response.writeHead(404, {'Content-Type':'text/plain'});
  response.end(body, 'utf8');
}

function internal_error(response, body) {
  response.writeHead(500, {'Content-Type':'text/plain'});
  response.end(body, 'utf8');
}


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

process.on("uncaughtException", function(err) {
  sys.log("Internal Error: " + err.message, 'utf8');
});

http.createServer(function(req, res) {
  var u = url.parse(req.url);
  var req_parts, project_name;

  try {
    if (u.pathname == '/') {
      //TODO: use an event to avoid stringifying every time?
      if (req.method == 'GET') { //Summarize
        ok(res, JSON.stringify(Project.summarize(projects)));
      } else if (req.method == 'POST') {
        ok(res);
        sys.log("Got reload request.");
        projects = Project.reload();
        sys.log("Reload completed.");
      }
    } else if (req_parts = u.pathname.match(/^\/(\w+)\/(\w+)/)) {
      project_name = req_parts[1], action = req_parts[2];
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
        ok(res);
      } else {
        not_found(res, 'Could not find project with name ' + project_name, 'utf8');
      }
    }
  } catch(err) {
    internal_error(res, "Internal Error: " + err.message, 'utf8');
  }
}).listen(port, "localhost");

console.log("Server running on port " + port + " with pid " + process.pid + ". That means on your feet, nuggets!");
