const WebSocket = require('ws');
const Board = require('./board.js');
const Game = require('./game.js');
const DemoBot1 = require('./demobot1.js');
const DemoBot2 = require('./demobot2.js');
const CustomBot = require('./customBot.js');

function Client(name, ws) {
    this.name = name;
    this.ws = ws;
    this.board = new Board();
    this.game = new Game(this.board);

    this.game.addBot(new CustomBot());
    for(var i=0; i<9; i++)
        this.game.addBot(new DemoBot1());
    this.game.restart();
    this.messageId = 0;
}

Client.prototype.setupEvents = function () {
    var _self = this;
    _self.ws.on('message', function incoming(clientdata) {
        //dispatch command
        var json = JSON.parse(clientdata);
        var message = { command: json.command, data:json.data, id: 0 };
        console.log("command received: " + message.command);
        if (message.command == 'step') {
            _self.game.processRound();
            _self.sendGameState('step');
        }
        else if (message.command == 'refresh') {
            _self.sendGameState('refresh');
        } 
        else if (message.command == 'restart') {
            _self.game.restart();
            _self.sendGameState('restart');
        }
        else if (message.command == 'submit') {
            _self.game.submitCode(message.data);
            _self.sendGameState('refresh');
        }
    });
}


Client.prototype.sendGameState = function (command) {
    if (this.ws.readyState !== WebSocket.OPEN)
        return;
    console.log("sending data to client(" + this.name + ")");
    // broadcast the new state
    var state = this.board.getState();
    var message = {
        state: this.game.board.state,
        command: command
    };
    var data = JSON.stringify(message);
    this.ws.send(data);

}


//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = Client;