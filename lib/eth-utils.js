"use strict";
var solc = require("solc");
// Need to handle write "above" this function
function compile(src) {
    return new Promise(function (resolve, reject) {
        var solcOut = solc.compile(src.code, 0); // No optimizer
        var compiled = {};
        for (var contract in solcOut.contracts) {
            compiled[contract] = {
                bytecode: solcOut.contracts[contract].bytecode,
                abi: JSON.parse(solcOut.contracts[contract].interface)
            };
        }
        resolve(compiled);
        // TODO: handle error
    });
}
exports.compile = compile;
function deploy(compiled, name, args, txParams, web3) {
    return new Promise(function (resolve, reject) {
        web3.eth.getAccounts(function (err, accts) {
            console.log(accts);
            var contract = web3.eth.contract(compiled[name].abi);
            var deployed = {
                address: undefined,
                txHash: undefined
            };
            console.log('CHECKPOINT 0');
            contract["new"](args, txParams, function (err, deployedContract) {
                console.log('CHECKPOINT 1');
                if (err) {
                    reject(err);
                }
                console.log('CHECKPOINT 2');
                if (deployedContract.address) {
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
exports.deploy = deploy;
