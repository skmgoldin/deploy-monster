import { Deployed, Target, TxParams, Compiled, DeployOpts } from './types.js'
import * as Web3 from 'web3'
import * as solc from 'solc'
const keythereum = require('keythereum')
const Transaction = require('ethereumjs-tx')

export function compile(src: string): Promise<Compiled> {
  return new Promise((resolve, reject) => {
    const solcOut = solc.compile(src, 0) // No optimizer

    const compiled = {}
    for(var contract in solcOut.contracts) {
      compiled[contract] = {
        bytecode: solcOut.contracts[contract].bytecode,
        abi: JSON.parse(solcOut.contracts[contract].interface)
      }
    }

    resolve(compiled)
    // TODO: handle error
  })
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
    tx.data = contract.new.getData(...opts.args, { data: opts.txParams.data} )

    const signingKey = new Buffer(opts.signingKey, 'hex')
    tx.sign(signingKey)
    const rawTx = tx.serialize()
    opts.web3.eth.sendRawTransaction(rawTx, function(err, txHash) {
      if(err) { return reject(err) }
      deployed.txHash = txHash
      getTxReceipt(deployed.txHash, function(err, res) {
        deployed.address = res.contractAddress
        resolve(deployed)
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

export function sanitizeDeployOpts(opts: DeployOpts): Promise<DeployOpts> {
  return new Promise(function(resolve, reject) {
    //TODO: do the iteration recursively, or in some more functional style
    const totalContracts = Object.keys(opts).length
    let contractsProcessed = 0

    const defaultGas = 1000000
    const defaultGasPrice = 1
    const defaultWeb3Provider = 'http://localhost:8545'

    for(let contract in opts) {
      contractsProcessed = contractsProcessed + 1

      /* Check opts */
      if(typeof(opts[contract].file) !== 'string') { throw 'no file provided' }
      if(!Array.isArray(opts[contract].args)) {
        opts[contract].args = [] 
      }
      if(typeof(opts[contract].txParams) !== 'object') { throw 'no txParams provided' }
      if(typeof(opts[contract].signingKey) !== 'string') { throw 'no signing key provided' }
      if(typeof(opts[contract].web3Provider) !== 'string') {
        opts[contract].web3Provider = defaultWeb3Provider
      }

      if(typeof(opts[contract].web3) === 'undefined') {
        opts[contract].web3 = new Web3()
        opts[contract].web3.setProvider(new Web3.providers.HttpProvider(opts.web3Provider))
      }
      
      /* Check opts.txParams */
      if(typeof(opts[contract].txParams.value) !== 'number') {
        opts[contract].txParams.value = 0 
      }
      if(typeof(opts[contract].txParams.gas) !== 'number') {
        opts[contract].txParams.gas = defaultGas
      }
      if(typeof(opts[contract].txParams.gasPrice) !== 'number') {
        opts[contract].txParams.gasPrice = defaultGasPrice 
      }
      if(typeof(opts[contract].txParams.nonce) !== 'number') {
        const pubKey = keythereum.privateKeyToAddress(opts[contract].signingKey)
        opts[contract].web3.eth.getTransactionCount(pubKey, function(err, res) {
          opts[contract].txParams.nonce = res
          if(contractsProcessed === totalContracts) {
            resolve(opts)
          }
        })
      } else {
        if(contractsProcessed === totalContracts) {
          resolve(opts)
        }
      }
    }
  })
}

export function orderDeployment(opts: DeployOpts): Array<DeployOpts> {
  const workingList = []

  for(let contract in opts) {
    opts[contract].name = contract
    workingList.push(opts[contract])
  }

  workingList.sort(function(a, b) {
    if(a.txParams.nonce < b.txParams.nonce) { return -1 }
    return 1
  })

  return workingList
}
