import * as fs from 'fs';
import { DeployOpts, Output, Deployed, Target, TxParams, Compiled } from './types.js';
import * as Web3 from 'web3';
import * as eth_utils from './eth-utils.js';
import * as path from 'path';

/* From args */
export function compileAndDeploy(_opts: DeployOpts): Promise<Output> {
  return new Promise((resolve, reject) => {
    eth_utils.sanitizeDeployOpts(_opts)
    .then(function(opts) {
      const orderedOpts = eth_utils.orderDeployment(opts)
      const output = {}

      let numDeployed = 0
      orderedOpts.forEach(function(contract) {
        const src = fs.readFileSync(path.resolve(contract.file), 'utf8')
        eth_utils.compile(src).then((compiled) => {

          for(let contract in compiled) {
            output[contract] = {
              abi: compiled[contract].abi,
              bytecode: compiled[contract].bytecode
            }
          }

          contract.txParams.data = '0x' + output[contract.name].bytecode

          eth_utils.deploy(contract, compiled)
          .then((deployed) => {
            output[contract.name].address = deployed.address
            output[contract.name].txHash = deployed.txHash
            numDeployed = numDeployed + 1
            if(numDeployed === orderedOpts.length) {
              resolve(output)
            }
          })
          .catch((err) => {
            reject(err)
          })
        })
      })     
    })
    .catch((err) => {
      reject(err)
    })
  })
}

/* From config */
export function compileAndDeployFromConfig(configPath: string): Promise<Output> {
  const conf = fs.readFileSync(path.resolve(configPath), 'utf8')
  const opts = JSON.parse(conf)

  return compileAndDeploy(opts)
}

