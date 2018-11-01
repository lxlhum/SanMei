'use strict'

const initBlock = {
    index: 0,
    previousHash: '0',
    timestamp: 1538669227813,
    data: 'Welcome to iblockchain!',
    hash: '00000aa1fbf27775ab79612bcb8171b3a9e02efe32fa628450ba6e729cf03996',
    nonce: 979911
}

class Blockchain {
    constructor() {
        this.blockchain = [
            initBlock
        ]
    }
}