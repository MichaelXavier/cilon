CIlon
=====

CIlon is my first node.js project. It's a CI server.

1. It uses git.
2. You signal it via HTTP.
3. It delivers summaries in JSON.
4. The name is a BSG reference. A project isn't a real project unless the name is a pun.

This project is more for educational purposes than anything. There are a lot of
great, full-featured build servers out there. This is not one of them. I built
this app because my dev machine at work is pretty slow and our test suite is
pretty large. Rather than pushing to the communal master branch and letting our
build server deal with it, I'd much rather just force an update on my personal
branch and let CIlon run the tests while I work on something else.

Dependencies
------------
* optimist
* coffee-script (for tests)
* nodeunit >= 0.1.2 (for tests)

Configuration
-------------
Look at the sample json config file. Rename it to projects.json

Usage
-----
Be sure to check out a side project I made,
   [cilon-client]{github.com/MichaelXavier/cilon-client} to monitor a cilon
   server from the command line.

### Starting the server
    node server.js

### Reloading the config
Send a HUP signal or POST to `/` to reload the config.

### Requesting a build
Send a request to `/project_name` or `/project_name/build`

Note that only one build is allowed at a time per project. This is by design.
If you request a build on a project, the current build for that project is
killed first.

### Setting up a project
Send a request to `/project_name/setup`. This will flip the status of the
project to building. If the project hasn't been cloned, it will be cloned. No
matter what, if you provide a "setup" option in that project's configuration,
that will be called for each setup request.

### Getting a summary
Send a GET request to `/`. The result will be a JSON string like: 

    {"project1":{"long_name":"Project 1","output":".....F..","error":"Explosions","last_built":"Sun Sep 19 2010 13:15:14 GMT-0700 (PDT)","status":"failed"}}

* The object key is the short name of the project. It must be unique.
* long_name is the long name given in the projects configuration. It does not have to be unique.
* output and error are the outputs from stdout and stderr, respectively.
* last_built will either be a datetime string or "N/A"
* Status may be 1 of 4 values:
  * succeeded
  * building
  * failed
  * new

TODO
----
* Write unit tests for everything. Some of the utils are tested but I don't have a firm grasp on stubbing the filesystem or child process spawning.
* Streaming summary or something so a client can just keep a connection that gets updated when a build finishes, rather than polling at some interval.
* Refactor: the source is pretty verbose and pretty ugly in places.
* Use more semantic request handling and response codes.
* Version number.
