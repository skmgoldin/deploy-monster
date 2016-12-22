import { Deployed, Target, TxParams, Compiled } from './types.js';
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
      if(err) { reject(err) }
      const contract = web3.eth.contract(compiled[name].abi);

      let deployed = {
        address: undefined,
        txHash: undefined
      };

      contract.new(...args, txParams, function(err, deployedContract) {
        if(err) { reject(err); }
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

