import { Deployed, Source, Target, TxParams, Compiled } from './types.js';
import { Web3 } from 'web3';
import * as solc from 'solc';

// Need to handle write "above" this function
export function compile(src: Source): Promise<Compiled> {
  return new Promise((resolve, reject) => {
    const solcOut = solc.compile(src.code, 0); // No optimizer
    const compiled = {
      bytecode: solcOut.contracts[src.name].bytecode,
      abi: JSON.parse(solcOut.contracts[src.name].interface)
    };
    resolve(compiled);
    // TODO: handle error
  });
}

export function deploy(compiled: Compiled, args: string[], txParams: TxParams,
                       web3: Web3): Promise<Deployed> {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts(function(err, accts) {
      const contract = web3.eth.contract(compiled.abi);

      let deployed = {
        address: undefined,
        txHash: undefined
      };

      contract.new(args, txParams, function(err, deployedContract) {
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

