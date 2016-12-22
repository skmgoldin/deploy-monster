"use strict";
var fs = require("fs");
var Web3 = require("web3");
var eth_utils = require("./eth-utils.js");
var mkdirp = require("mkdirp");
var path = require("path");
/* From args */
function compileAndDeploy(opts) {
    return Promise.resolve().then(function () {
        /* TODO: Handle missing opts */
        var src = fs.readFileSync(path.resolve(opts.file), 'utf8'); //TODO: don't assume UTF-8
        var output = {};
        return eth_utils.compile(src).then(function (compiled) {
            for (var contract in compiled) {
                output[contract] = {
                    abi: compiled[contract].abi,
                    bytecode: compiled[contract].bytecode
                };
            }
            opts.txParams.data = compiled[opts.name].bytecode; // Add bytecode
            return eth_utils.deploy(compiled, opts.name, opts.args, opts.txParams, opts.web3);
        }).then(function (deployed) {
            output[opts.name].address = deployed.address;
            output[opts.name].txHash = deployed.txHash;
            return output;
        });
    });
}
exports.compileAndDeploy = compileAndDeploy;
/* From config */
function compileAndDeployFromConfig(configPath) {
    var conf = fs.readFileSync(path.resolve(configPath), 'utf8');
    var confObj = JSON.parse(conf);
    confObj.web3 = new Web3();
    confObj.web3.setProvider(new Web3.providers.HttpProvider(confObj.web3Provider));
    return compileAndDeploy(confObj);
}
exports.compileAndDeployFromConfig = compileAndDeployFromConfig;
function writeOutput(dirname, output) {
    mkdirp.sync(path.resolve(dirname));
    fs.writeFileSync(path.resolve(dirname, '/contracts.json'), JSON.stringify(output, null, '  '));
}
exports.writeOutput = writeOutput;
