import { Deployed, Target, TxParams, Compiled, DeployOpts } from './types.js';
import * as Web3 from 'web3';
import * as solc from 'solc';
const Transaction = require('ethereumjs-tx')

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

export function deploy(opts: DeployOpts, compiled: Compiled): Promise<Deployed> {
  return new Promise((resolve, reject) => {

    const deployed = {
      address: undefined,
      txHash: undefined
    }

    const tx = new Transaction(null)
    tx.nonce = opts.txParams.nonce
    tx.gasPrice = opts.txParams.gasPrice
    tx.gasLimit = opts.txParams.gas
    tx.value = opts.txParams.value

    const contract = opts.web3.eth.contract(compiled[opts.name].abi)
    opts.txParams.data = contract.new.getData(...opts.args, { data: opts.txParams.data} )
    tx.data = opts.txParams.data

    const signingKey = new Buffer(opts.signingKey, 'hex')
    tx.sign(signingKey)
    const rawTx = tx.serialize()
    opts.web3.eth.sendRawTransaction(rawTx, function(err, txHash) {
      if(err) return reject(err)
      deployed.txHash = txHash
      getTxReceipt(deployed.txHash, function(err, res) {
        deployed.address = res.contractAddress
        resolve(deployed);
      })
    })
  })

  function getTxReceipt(txHash: string, cb) {
    opts.web3.eth.getTransactionReceipt(txHash, function(err, txReceipt) {
      if(err) { throw 'couldn\'t get Tx receipt' }
      if(txReceipt !== null) {
        cb(null, txReceipt)
      } else { 
        getTxReceipt(txHash, cb)
      }
    })
  }
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

  if(typeof(opts.web3) === 'undefined') {
    opts.web3 = new Web3();
    opts.web3.setProvider(new Web3.providers.HttpProvider(opts.web3Provider));
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
  if(typeof(opts.txParams.nonce) !== 'number') { throw 'no nonce provided' }
  /* ^ this is recoverable, but throw for now. */

  return opts
}
