import { Deployed, Target, TxParams, Compiled, DeployOpts } from './types.js';
import { Web3 } from 'web3';
import * as solc from 'solc';

// Need to handle write "above" this function
export function compile(src: string): Promise<Compiled> {
  return new Promise((resolve, reject) => {
    const solcOut = solc.compile(src, 0); // No optimizer

    const compiled = {};
    for(var contract in solcOut.contracts) {
      compiled[contract] = {
        bytecode: solcOut.contracts[contract].bytecode,
        abi: JSON.parse(solcOut.contracts[contract].interface)
      }
    }

    resolve(compiled);
    // TODO: handle error
  });
}

export function deploy(compiled: Compiled, name: string, args: string[], txParams: TxParams,
                       web3: Web3): Promise<Deployed> {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts(function(err, accts) {
      if (err) return reject(err)
      const contract = web3.eth.contract(compiled[name].abi);

      let deployed = {
        address: undefined,
        txHash: undefined
      };

      contract.new(...args, txParams, function(err, deployedContract) {
        if(err) return reject(err)
        if (deployedContract.address) {
          deployed.address = deployedContract.address;
          resolve(deployed);
        } else {
          deployed.txHash = deployedContract.transactionHash;
        }
      });
    });
  });
}

export function sanitizeDeployOpts(opts: DeployOpts) {
  const defaultGas = 1000000
  const defaultGasPrice = 1
  const defaultWeb3Provider = 'http://localhost:8545'

  /* Check opts */
  if(typeof(opts.file) !== 'string') { throw 'no file provided' }
  if(typeof(opts.name) !== 'string') { throw 'no contract name provided' }
  if(!Array.isArray(opts.args)) {
    opts.args = [] 
  }
  if(typeof(opts.txParams) !== 'object') { throw 'no txParams provided' }
  if(typeof(opts.signingKey) !== 'string') { throw 'no signing key provided' }
  if(typeof(opts.web3Provider) !== 'string') {
    opts.web3Provider = defaultWeb3Provider
  }
  
  /* Check opts.txParams */
  if(typeof(opts.txParams.value) !== 'number') {
    opts.txParams.value = 0 
  }
  if(typeof(opts.txParams.gas) !== 'number') {
    opts.txParams.gas = defaultGas
  }
  if(typeof(opts.txParams.gasPrice) !== 'number') {
    opts.txParams.gasPrice = defaultGasPrice 
  }
  //if(typeof(opts.txParams.data) === 'undefined') { throw }
  if(typeof(opts.txParams.nonce) !== 'number') { throw 'no nonce provided' }
  /* ^ this is recoverable, but throw for now. */

  return opts
}
