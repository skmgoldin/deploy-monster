import { Web3 } from 'web3';

export interface Target {
  protocol: string,
  host: string,
  port: string
}

export interface TxParams {
  value: number,
  gas: number,
  gasPrice: number,
  data: string,
  nonce: number
}

export interface Deployed {
  address: string, 
  txHash: string
}

export interface Compiled {
  bytecode: string,
  abi: string
}

export interface Output {
  name: string,
  abi: string,
  address: string,
  txHash: string,
  bytecode: string
}

export interface DeployOpts {
  file: string,
  name: string,
  args: string[],
  txParams: TxParams,
  signingKey: string,
  web3: Web3
}
