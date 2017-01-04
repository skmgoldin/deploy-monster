import * as fs from 'fs';
import { DeployOpts, Output, Deployed, Target, TxParams, Compiled } from './types.js';
import * as Web3 from 'web3';
import * as eth_utils from './eth-utils.js';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

/* From args */
export function compileAndDeploy(_opts: DeployOpts): Promise<Output> {
  return Promise.resolve().then(() => {

    const opts = eth_utils.sanitizeDeployOpts(_opts)

    const src = fs.readFileSync(path.resolve(opts.file), 'utf8'); //TODO: don't assume UTF-8

    const output = {};

    return eth_utils.compile(src).then((compiled) => {

      for(var contract in compiled) {
        output[contract] = {
          abi: compiled[contract].abi,
          bytecode: compiled[contract].bytecode
        }
      }

      opts.txParams.data = '0x' + output[opts.name].bytecode

      return eth_utils.deploy(opts, compiled);

    }).then((deployed) => {

      output[opts.name].address = deployed.address;
      output[opts.name].txHash = deployed.txHash;

      return output;
    });
  });

}

/* From config */
export function compileAndDeployFromConfig(configPath: string): Promise<Output> {
  const conf = fs.readFileSync(path.resolve(configPath), 'utf8');
  const confObj = JSON.parse(conf);

  const opts = eth_utils.sanitizeDeployOpts(confObj)

  return compileAndDeploy(opts);
}

export function writeOutput(dirname: string, output: Output) {
  mkdirp.sync(path.resolve(dirname));

  fs.writeFileSync(path.resolve(dirname, '/contracts.json'), JSON.stringify(output, null, '  '));
}
