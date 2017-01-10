"use strict";
var fs = require("fs");
var eth_utils = require("./eth-utils.js");
var path = require("path");
/* From args */
function compileAndDeploy(_opts) {
    return new Promise(function (resolve, reject) {
        eth_utils.sanitizeDeployOpts(_opts)
            .then(function (opts) {
            var orderedOpts = eth_utils.orderDeployment(opts);
            var output = {};
            var numDeployed = 0;
            orderedOpts.forEach(function (contract) {
                var src = fs.readFileSync(path.resolve(contract.file), 'utf8');
                eth_utils.compile(src).then(function (compiled) {
                    for (var contract_1 in compiled) {
                        output[contract_1] = {
                            abi: compiled[contract_1].abi,
                            bytecode: compiled[contract_1].bytecode
                        };
                    }
                    contract.txParams.data = '0x' + output[contract.name].bytecode;
                    eth_utils.deploy(contract, compiled)
                        .then(function (deployed) {
                        output[contract.name].address = deployed.address;
                        output[contract.name].txHash = deployed.txHash;
                        numDeployed = numDeployed + 1;
                        if (numDeployed === orderedOpts.length) {
                            resolve(output);
                        }
                    })["catch"](function (err) {
                        reject(err);
                    });
                });
            });
        })["catch"](function (err) {
            reject(err);
        });
    });
}
exports.compileAndDeploy = compileAndDeploy;
/* From config */
function compileAndDeployFromConfig(configPath) {
    var conf = fs.readFileSync(path.resolve(configPath), 'utf8');
    var opts = JSON.parse(conf);
    return compileAndDeploy(opts);
}
exports.compileAndDeployFromConfig = compileAndDeployFromConfig;
