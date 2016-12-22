"use strict";
var fs = require("fs");
var Web3 = require("web3");
var process_1 = require("process");
var eth_utils = require("./eth-utils.js");
var mkdirp = require("mkdirp");
var ROOT = process_1.cwd();
/* From args */
function compileAndDeploy(opts) {
    return new Promise(function (resolve, reject) {
        /* TODO: Handle missing opts */
        var src = fs.readFileSync(ROOT + opts.file, 'utf8'); //TODO: don't assume UTF-8
        var output = {};
        eth_utils.compile(src).then(function (compiled) {
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
            resolve(output);
        })["catch"](function (err) {
            console.log(err); //TODO: Handle error better
        });
    });
}
exports.compileAndDeploy = compileAndDeploy;
/* From config */
function compileAndDeployFromConfig(configPath) {
    var conf = fs.readFileSync(ROOT + configPath, 'utf8');
    var confObj = JSON.parse(conf);
    confObj.web3 = new Web3();
    confObj.web3.setProvider(new Web3.providers.HttpProvider(confObj.web3Provider));
    return compileAndDeploy(confObj);
}
exports.compileAndDeployFromConfig = compileAndDeployFromConfig;
function writeOutput(path, output) {
    var properPath = ROOT + path;
    if (!fs.existsSync(properPath)) {
        mkdirp.sync(properPath);
    }
    fs.writeFileSync(properPath + '/contracts.json', JSON.stringify(output, null, '  '));
}
exports.writeOutput = writeOutput;
