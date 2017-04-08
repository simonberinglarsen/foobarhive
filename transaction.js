function Transaction(fromId, toId, amountToTransfer) {
    //setup board state
    this.fromId = fromId;
    this.toId = toId;
    this.amountToTransfer = amountToTransfer;
}


//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = Transaction;