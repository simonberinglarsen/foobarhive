var Transaction = require('./transaction.js');

function DemoBot1() {

}
DemoBot1.prototype.doMove = function (myBlocks) {
    /*
    var randomBlockIndex = Math.floor(Math.random() * myBlocks.length);
    var source = myBlocks[randomBlockIndex];
    randomBlockIndex = Math.floor(Math.random() * source.neighbours.length);
    var dest = source.neighbours[randomBlockIndex];
    var randomResources = Math.floor(Math.random() * source.resources);
    randomResources = source.resources;
    return new Transaction(source.id, dest.id, randomResources);
    */
    return null;
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = DemoBot1;