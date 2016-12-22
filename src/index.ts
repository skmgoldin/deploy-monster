import * as fs from 'fs';
import { DeployOpts, Output, Deployed, Source, Target, TxParams, Compiled } from './types.js';
import * as Web3 from 'web3';
import { cwd } from 'process';
import * as eth_utils from './eth-utils.js';
import * as mkdirp from 'mkdirp';

const ROOT = cwd();

/* From args */
export function compileAndDeploy(opts: DeployOpts): Promise<Output> {
  return Promise.resolve().then(() => {
    /* TODO: Handle missing opts */

    const code = fs.readFileSync(ROOT + opts.file, 'utf8'); //TODO: don't assume UTF-8
    const src = {code: code, name: opts.name};

    const output = {};

    return eth_utils.compile(src).then((compiled) => {

      for(var contract in compiled) {
        output[contract] = {
          abi: compiled[contract].abi,
          bytecode: compiled[contract].bytecode
        }
      }

      opts.txParams.data = compiled[opts.name].bytecode; // Add bytecode
      return eth_utils.deploy(compiled, opts.name, opts.args, opts.txParams, opts.web3);

    }).then((deployed) => {

      output[opts.name].address = deployed.address;
      output[opts.name].txHash = deployed.txHash;

      return output;
    });
  });

}

/* From config */
export function compileAndDeployFromConfig(configPath: string): Promise<Output> {
  const conf = fs.readFileSync(ROOT + configPath, 'utf8');
  const confObj = JSON.parse(conf);

  confObj.web3 = new Web3();
  confObj.web3.setProvider(new Web3.providers.HttpProvider(confObj.web3Provider));

  return compileAndDeploy(confObj);
}

export function writeOutput(path: string, output: Output) {
  const properPath = ROOT + path;
  if(!fs.existsSync(properPath)) {
    mkdirp.sync(properPath);
  }

  fs.writeFileSync(properPath + '/contracts.json', JSON.stringify(output, null, '  '));
}
