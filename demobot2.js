var Transaction = require('./transaction.js');

function DemoBot2() {

}

DemoBot2.prototype.doMove = function (myBlocks) {
    if (!myBlocks || myBlocks.length === 0)
        return null;
    var randomBlockIndex = Math.floor(Math.random() * myBlocks.length);
    var source = myBlocks[randomBlockIndex];
    randomBlockIndex = Math.floor(Math.random() * source.neighbours.length);
    var dest = source.neighbours[randomBlockIndex];
    var randomResources = Math.floor(Math.random() * source.resources);
    randomResources = source.resources;
    return new Transaction(source.id, dest.id, randomResources-1);
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = DemoBot2;