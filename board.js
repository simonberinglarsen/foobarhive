function Board() {
    //setup board state
    this.state = {}

}
Board.prototype.init = function (size) {
    var state = {
        config: {
            sizeX: size * 2 + 1,
            sizeY: size * 2 + 1,
        },
        fields: []
    };
    state.fields = [];
    // random id'setField
    var randomIds = []
    for (var i = 0; i < state.config.sizeX * state.config.sizeY; i++) {
        randomIds.splice(Math.floor(Math.random() * (randomIds.length + 1)), 0, i);
    }
    // setup board
    var startposition = [];
    for (var i = 0; i < state.config.sizeX * state.config.sizeY; i++) {
        var coordX = i % state.config.sizeX;
        var coordY = Math.floor(i / state.config.sizeX);
        // define player  area and border
        var player = 0;
        var ax = coordX / 2;
        var ay = coordY;
        if (coordX % 2 == 1)
            ay += 0.5;
        ax = Math.abs(ax - (state.config.sizeX - 1) / 4);
        ay = Math.abs(ay - ((state.config.sizeY - 0.5) / 2));
        var isPlayerArena = (ax + ay) <= state.config.sizeX / 2 - 1;
        var isBorder = (coordX === 0 || coordX >= state.config.sizeX - 1 || coordY === 0 || coordY >= state.config.sizeY - 1);
        if (!isPlayerArena || isBorder)
            player = -1;
        else
            player = 0;
        ax = coordX - (state.config.sizeX - 1) / 2;
        ay = coordY - (state.config.sizeY - 1) / 2;
        ay = ay * 2;
        var q = 0;
        if (isPlayerArena && !isBorder) {
            if ((state.config.sizeX - 1) / 2 % 2 !== 0)
                q = ay - Math.abs(ax) % 2;
            else
                q = ay + Math.abs(ax) % 2;
        }
        if (ax % 3 == 0 && Math.abs(q) % 3 === 0 && isPlayerArena && !isBorder) {
            startposition.push({ x: coordX, y: coordY });
        }
        state.fields.push({ resources: 0, player: player, id: randomIds[i] });
    }
    this.state = state;

    for (var j = 0; j < startposition.length; j++) {
        this.setField(startposition[j].x, startposition[j].y, 10, j + 1);
    }

}
Board.prototype.getFieldById = function (id) {
    for (var i = 0; i < this.state.fields.length; i++) {
        if (this.state.fields[i].id === id)
            return this.state.fields[i];
    }
}
Board.prototype.isNeighbours = function (fromField, toField) {
    var block = this.getBlockByField(fromField.player, fromField);
    var toFieldIsNeighbour = false;
    for (var i = 0; i < block.neighbours.length; i++) {
        if (block.neighbours[i].id == toField.id) {
            toFieldIsNeighbour = true;
            return true;
        }
    }
    return false;
}
Board.prototype.getBlockByField = function (player, field) {
    var block = {};
    if (field.player !== player) return null;
    block.resources = field.resources;
    block.id = field.id;
    block.neighbours = [];

    var fieldIndex = this.state.fields.indexOf(field);
    var x = fieldIndex % this.state.config.sizeX;
    var y = Math.floor(fieldIndex / this.state.config.sizeX);
    var evenColumn = x % 2 == 0;
    var y2 = evenColumn ? -1 : 1;
    var neightbourOffsets = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: y2 },
        { x: 1, y: y2 }];
    for (var i = 0; i < neightbourOffsets.length; i++) {
        var point = neightbourOffsets[i];
        var neighbourField = this.getField(x + point.x, y + point.y);
        if (neighbourField !== null && neighbourField.player >= 0) {
            var neighbour = {
                owner: neighbourField.player == player ? 0 : neighbourField.player > 0 ? 1 : 2,
                resources: neighbourField.resources,
                id: neighbourField.id
            };
            block.neighbours.push(neighbour);
        }
    }
    return block;
}
Board.prototype.getBlocks = function (player) {
    var blocks = [];
    for (var i = 0; i < this.state.fields.length; i++) {
        var field = this.state.fields[i];
        var block = this.getBlockByField(player, field);
        if (block !== null) {
            blocks.push(block);
        }
    }
    return blocks;
}

Board.prototype.setField = function (x, y, resources, player) {
    var field = this.getField(x, y);
    field.resources = resources;
    field.player = player;
}

Board.prototype.getField = function (x, y) {
    if (x < 0 || x >= this.state.config.sizeX
        || y < 0 || y >= this.state.config.sizeY)
        return null;
    return this.state.fields[x + y * this.state.config.sizeX];
}

Board.prototype.getState = function () {
    return this.state;
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = Board;