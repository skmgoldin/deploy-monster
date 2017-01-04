"use strict";
var Web3 = require("web3");
var solc = require("solc");
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
        opts.txParams.data = (_a = contract["new"]).getData.apply(_a, opts.args.concat([{ data: opts.txParams.data }]));
        tx.data = opts.txParams.data;
        var signingKey = new Buffer(opts.signingKey, 'hex');
        tx.sign(signingKey);
        var rawTx = tx.serialize();
        opts.web3.eth.sendRawTransaction(rawTx, function (err, txHash) {
            if (err)
                return reject(err);
            deployed.txHash = txHash;
            getTxReceipt(deployed.txHash, function (err, res) {
                deployed.address = res.contractAddress;
                resolve(deployed);
            });
        });
        var _a;
    });
    function getTxReceipt(txHash, cb) {
        opts.web3.eth.getTransactionReceipt(txHash, function (err, txReceipt) {
            if (err) {
                throw 'couldn\'t get Tx receipt';
            }
            if (txReceipt !== null) {
                cb(null, txReceipt);
            }
            else {
                getTxReceipt(txHash, cb);
            }
        });
    }
}
exports.deploy = deploy;
function sanitizeDeployOpts(opts) {
    var defaultGas = 1000000;
    var defaultGasPrice = 1;
    var defaultWeb3Provider = 'http://localhost:8545';
    /* Check opts */
    if (typeof (opts.file) !== 'string') {
        throw 'no file provided';
    }
    if (typeof (opts.name) !== 'string') {
        throw 'no contract name provided';
    }
    if (!Array.isArray(opts.args)) {
        opts.args = [];
    }
    if (typeof (opts.txParams) !== 'object') {
        throw 'no txParams provided';
    }
    if (typeof (opts.signingKey) !== 'string') {
        throw 'no signing key provided';
    }
    if (typeof (opts.web3Provider) !== 'string') {
        opts.web3Provider = defaultWeb3Provider;
    }
    if (typeof (opts.web3) === 'undefined') {
        opts.web3 = new Web3();
        opts.web3.setProvider(new Web3.providers.HttpProvider(opts.web3Provider));
    }
    /* Check opts.txParams */
    if (typeof (opts.txParams.value) !== 'number') {
        opts.txParams.value = 0;
    }
    if (typeof (opts.txParams.gas) !== 'number') {
        opts.txParams.gas = defaultGas;
    }
    if (typeof (opts.txParams.gasPrice) !== 'number') {
        opts.txParams.gasPrice = defaultGasPrice;
    }
    if (typeof (opts.txParams.nonce) !== 'number') {
        throw 'no nonce provided';
    }
    /* ^ this is recoverable, but throw for now. */
    return opts;
}
exports.sanitizeDeployOpts = sanitizeDeployOpts;
