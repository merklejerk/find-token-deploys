'use strict'
const FlexContract = require('flex-contract');
const CHECKER_ARTIFACT = require('../build/Checker.output.json');
const process = require('process');
const Web3 = require('web3');
const crypto = require('crypto');

const PERIOD = 24 * 60 * 60;
const CHECKER_ADDRESS = '0x'+crypto.randomBytes(20).toString('hex');

(async () => {
    const checker = new FlexContract(CHECKER_ARTIFACT.abi, { providerURI: process.env.NODE_RPC })
    const web3 = new Web3(checker.eth.provider);
    const maxBlock = await web3.eth.getBlock('latest');
    const tokensFound = [];
    for (let i = maxBlock.number; true; --i) {
        const block = await web3.eth.getBlock(i, true);
        if (maxBlock.timestamp - block.timestamp > PERIOD) {
            break;
        }
        const receipts = await Promise.all(block.transactions.map(tx => web3.eth.getTransactionReceipt(tx.hash)));
        const deployments = receipts.filter(r => r.contractAddress).map(r => r.contractAddress);
        await Promise.all(deployments.map(async d => {
            try {
                const isToken = await checker.isTokenAt(d).call({
                    to: CHECKER_ADDRESS,
                    block: block.number,
                    overrides: {
                        [CHECKER_ADDRESS]: {
                            code: CHECKER_ARTIFACT.deployedBytecode,
                        },
                    },
                });
                if (isToken) {
                    console.log(`${d} @ ${block.number}`);
                    tokensFound.push({address: d, block: block.number});
                }
            } catch (err) {}
        }));
    }
    console.log(`found ${tokensFound.length} tokens`);
    console.log(JSON.stringify(tokensFound, null, '  '));
})();
