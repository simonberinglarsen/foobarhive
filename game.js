function Game(board) {
    this.board = board;
    this.bots = [];
}
Game.prototype.addBot = function (bot) {
    console.log("Game.prototype.addBot");
    this.bots.push(bot);
}
Game.prototype.restart = function () {
    console.log("Game.prototype.restart");
    this.board.init(7);
}
Game.prototype.runTransaction = function (player, transaction) {
    //manipulate board..
    if (transaction === null)
        return;
    if (transaction.amountToTransfer === 0)
        return;
    var fromField = this.board.getFieldById(transaction.fromId);
    var toField = this.board.getFieldById(transaction.toId);
    // is this block owned by the player?
    if (fromField.player !== player)
        return;
    // attacks not allowed when not neighbours
    var isAttack = toField.player != fromField.player && toField.player > 0;
    if (!this.board.isNeighbours(fromField, toField) && isAttack) {
        return;
    }
    // do we have enough resources for the transfer?
    if (fromField.resources < transaction.amountToTransfer)
        return;
    // all rules are ok - do the transfering
    if (isAttack) {
        fromField.resources -= transaction.amountToTransfer;
        toField.resources -= transaction.amountToTransfer;
        if (toField.resources < 0) {
            // invade the field - player is the new owner
            toField.player = fromField.player;
            toField.resources = -toField.resources;
        }
        else if (toField.resources == 0) {
            // convert to neutral field
            toField.player = 0;
        }
    }
    else {
        fromField.resources -= transaction.amountToTransfer;
        toField.resources += transaction.amountToTransfer;
        toField.player = fromField.player;
    }
}
Game.prototype.processRound = function () {
    console.log("Game.prototype.processRound");
    var playerMoves = [];
    for (var i = 0; i < this.bots.length; i++) {
        var player = i + 1;
        var blocks = this.board.getBlocks(player);
        var transaction = this.bots[i].doMove(blocks);
        this.runTransaction(player, transaction);
    }
    // add extra resources
    for (var i = 0; i < this.board.state.fields.length; i++) {
        var field = this.board.state.fields[i];
        if (field.player > 0)
            field.resources++;
    }
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = Game;