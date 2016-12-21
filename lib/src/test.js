"use strict";
var dm = require("./index.js");
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));
var opts = {
    file: '/contracts/USCC.sol',
    name: 'USCC',
    args: ['0x0d7e7d1d070bf0a1f97bb2d9a7e5b481127471a8'],
    txParams: {
        from: web3.eth.accounts[0],
        data: undefined,
        gas: 500000
    },
    web3: web3
};
dm.compileAndDeploy(opts).then(function (output) {
    dm.writeOutput('/output', output);
});
