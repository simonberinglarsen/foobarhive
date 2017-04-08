const ENCODING = 'utf-16le';
const WebSocket = require('ws');
const Client = require('./client.js');
const path = require('path');
const express = require('express');

var app = express();
var http = require('http').Server(app);

var WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({
    port: 8080
});

var clientno = 0;
var clients=[];

// setup webserver
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


