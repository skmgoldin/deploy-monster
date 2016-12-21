"use strict";
var fs = require("fs");
var process_1 = require("process");
var utils = require("./utils.js");
var ROOT = process_1.cwd();
/* From args */
function compileAndDeploy(opts) {
    return new Promise(function (resolve, reject) {
        /* Handle missing opts */
        var code = fs.readFileSync(ROOT + opts.file, 'utf8'); // Maybe don't assume UTF-8
        var src = { code: code, name: opts.name };
        var output = {
            name: opts.name,
            abi: undefined,
            address: undefined,
            txHash: undefined,
            bytecode: undefined
        };
        utils.compile(src).then(function (compiled) {
            output.abi = compiled.abi;
            output.bytecode = compiled.bytecode;
            opts.txParams.data = compiled.bytecode; // Add bytecode
            return utils.deploy(compiled, opts.args, opts.txParams, opts.web3);
        }).then(function (deployed) {
            output.address = deployed.address;
            output.txHash = deployed.txHash;
            resolve(output);
        })["catch"](function (err) {
            console.log(err); // Handle error better
        });
    });
}
exports.compileAndDeploy = compileAndDeploy;
/* From config */
function compileAndDeployFromConfig(configPath) { }
exports.compileAndDeployFromConfig = compileAndDeployFromConfig;
function writeOutput(path, output) {
    // check if outputs folder exists
    //
    var writeObj = {};
    writeObj[output.name] = {
        abi: output.abi,
        address: output.address,
        txHash: output.txHash,
        bytecode: output.bytecode
    };
    fs.writeFileSync(ROOT + path + '/contracts.json', JSON.stringify(writeObj, null, '  '));
}
exports.writeOutput = writeOutput;
