"use strict";
var Web3 = require("web3");
var solc = require("solc");
var keythereum = require('keythereum');
var Transaction = require('ethereumjs-tx');
function compile(src) {
    return new Promise(function (resolve, reject) {
        var solcOut = solc.compile(src, 0); // No optimizer
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
function deploy(opts, compiled) {
    return new Promise(function (resolve, reject) {
        var deployed = {
            address: undefined,
            txHash: undefined
        };
        var tx = new Transaction(null);
        tx.nonce = opts.txParams.nonce;
        tx.gasPrice = opts.txParams.gasPrice;
        tx.gasLimit = opts.txParams.gas;
        tx.value = opts.txParams.value;
        var contract = opts.web3.eth.contract(compiled[opts.name].abi);
        tx.data = (_a = contract["new"]).getData.apply(_a, opts.args.concat([{ data: opts.txParams.data }]));
        var signingKey = new Buffer(opts.signingKey, 'hex');
        tx.sign(signingKey);
        var rawTx = tx.serialize().toString('hex');
        opts.web3.eth.sendRawTransaction(rawTx, function (err, txHash) {
            if (err) {
                reject(err);
            }
            deployed.txHash = txHash;
            getTxReceipt(deployed.txHash)
                .then(function (txReceipt) {
                deployed.address = txReceipt.contractAddress;
                resolve(deployed);
            })["catch"](function (err) {
                reject(err);
            });
        });
        var _a;
    });
    function getTxReceipt(txHash) {
        return new Promise(function (resolve, reject) {
            opts.web3.eth.getTransactionReceipt(txHash, function (err, txReceipt) {
                if (err) {
                    reject(new Error('couldn\'t get Tx receipt'));
                }
                if (txReceipt !== null) {
                    resolve(txReceipt);
                }
                else {
                    resolve(getTxReceipt(txHash));
                }
            });
        });
    }
}
exports.deploy = deploy;
function sanitizeDeployOpts(opts) {
    return new Promise(function (resolve, reject) {
        //TODO: do the iteration recursively, or in some more functional style
        var totalContracts = Object.keys(opts).length;
        var contractsProcessed = 0;
        var defaultGas = 1000000;
        var defaultGasPrice = 1;
        var defaultWeb3Provider = 'http://localhost:8545';
        var _loop_1 = function (contract) {
            contractsProcessed = contractsProcessed + 1;
            /* Check opts */
            if (typeof (opts[contract].file) !== 'string') {
                reject(new Error('no file provided'));
            }
            if (!Array.isArray(opts[contract].args)) {
                opts[contract].args = [];
            }
            if (typeof (opts[contract].txParams) !== 'object') {
                reject(new Error('no txParams provided'));
            }
            if (typeof (opts[contract].signingKey) !== 'string') {
                reject(new Error('no signing key provided'));
            }
            if (typeof (opts[contract].web3Provider) !== 'string') {
                opts[contract].web3Provider = defaultWeb3Provider;
            }
            if (typeof (opts[contract].web3) === 'undefined') {
                opts[contract].web3 = new Web3();
                opts[contract].web3.setProvider(new Web3.providers.HttpProvider(opts[contract].web3Provider));
            }
            /* Check opts.txParams */
            if (typeof (opts[contract].txParams.value) !== 'number') {
                opts[contract].txParams.value = 0;
            }
            if (typeof (opts[contract].txParams.gas) !== 'number') {
                opts[contract].txParams.gas = defaultGas;
            }
            if (typeof (opts[contract].txParams.gasPrice) !== 'number') {
                opts[contract].txParams.gasPrice = defaultGasPrice;
            }
            if (typeof (opts[contract].txParams.nonce) !== 'number') {
                var pubKey = keythereum.privateKeyToAddress(opts[contract].signingKey);
                opts[contract].web3.eth.getTransactionCount(pubKey, function (err, res) {
                    if (err) {
                        reject(new Error('Couldn\'t get a nonce for provided signing key'));
                    }
                    opts[contract].txParams.nonce = res;
                    if (contractsProcessed === totalContracts) {
                        resolve(opts);
                    }
                });
            }
            else {
                if (contractsProcessed === totalContracts) {
                    resolve(opts);
                }
            }
        };
        for (var contract in opts) {
            _loop_1(contract);
        }
    });
}
exports.sanitizeDeployOpts = sanitizeDeployOpts;
function orderDeployment(opts) {
    var workingList = [];
    for (var contract in opts) {
        opts[contract].name = contract;
        workingList.push(opts[contract]);
    }
    workingList.sort(function (a, b) {
        if (a.txParams.nonce < b.txParams.nonce) {
            return -1;
        }
        return 1;
    });
    return workingList;
}
exports.orderDeployment = orderDeployment;
