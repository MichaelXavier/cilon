var http    = require("http");
var fs      = require("fs");
var url     = require("url");
var Project = require('./project')

var projects = Project.reload();

// HUP signal triggers a reload
process.on("SIGHUP", function() {
  console.log("Caught HUP. Reloading...");
  projects = Project.reload();
  console.log("Done.");
});

process.on("exit", function() {
  console.log("Caught EXIT. Killing child processes...");
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
        projects = Project.reload();
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.end();
      }
    } else { // format of /:project/setup or /:project/build
      var parts = u.pathname.match(/^\/(\w+)\/(\w+)/);
      var project_name = parts[1], action = parts[2];
      if (!action) action = 'build';
      if (projects[project_name]) {
        switch(action) {
          case "build":
            projects[project_name].build();
            break;
          case "setup":
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
    res.writeHead(500, {'Content-Type':'text/plain'});
    res.end("Internal Error: " + err, 'utf8');
  }
}).listen(3000, "localhost");

console.log("Server running on port 3000. That means on your feet, nuggets!");
