"use strict";
var solc = require("solc");
// Need to handle write "above" this function
function compile(src) {
    return new Promise(function (resolve, reject) {
        var solcOut = solc.compile(src.code, 0); // No optimizer
        var compiled = {
            bytecode: solcOut.contracts[src.name].bytecode,
            abi: JSON.parse(solcOut.contracts[src.name].interface)
        };
        resolve(compiled);
        // TODO: handle error
    });
}
function deploy(compiled, args, txParams, web3) {
    return new Promise(function (resolve, reject) {
        web3.eth.getAccounts(function (err, accts) {
            var contract = web3.eth.contract(compiled.abi);
            var deployed = {
                address: undefined,
                txHash: undefined
            };
            contract["new"](args, txParams, function (err, deployedContract) {
                if (err) {
                    reject(err);
                }
                if (deployed.address) {
                    deployed.address = deployedContract.address;
                    resolve(deployed);
                }
                else {
                    deployed.txHash = deployedContract.transactionHash;
                }
            });
        });
    });
}
