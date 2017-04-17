const ENCODING = 'utf-16le';
const WebSocket = require('ws');
const Client = require('./client.js');
const path = require('path');
const express = require('express');
const Datastore = require('nedb');
const bodyParser = require("body-parser");
// init database
var db = {};
db.codefiles = new Datastore({ filename: 'datastore_codefiles.db', autoload: true });

// webserver
var app = express();
var http = require('http').Server(app);
app.use(bodyParser.json());

// socket
var WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({
    port: 8080
});

// connected clients
var clientno = 0;
var clients=[];

// rest api
// CONTACTS API ROUTES BELOW
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/api/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/api/codefiles", function(req, res) {
  db.codefiles.find({}, function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get codefiles.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/api/codefiles", function(req, res) {
  var newContact = req.body;

  if (!req.body.filename) {
    handleError(res, "Invalid codefile input", "Must provide a filename.", 400);
  }

  db.codefiles.insert(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new codefile.");
    } else {
      res.status(201).json(doc);
    }
  });
});
/*  "/api/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/api/contacts/:id", function(req, res) {
});

app.put("/api/contacts/:id", function(req, res) {
});

app.delete("/api/contacts/:id", function(req, res) {
});



// setup webserver static hosting
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/test.html');
});

// socket events
wss.on('connection', function connection(ws) {
    clientno++;
    var client = new Client('client'+clientno, ws);
    clients.push(client);
    client.setupEvents();
});

// start http server
http.listen(3000, function () {
    console.log('listening on *:3000');
});


