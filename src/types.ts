import { Web3 } from 'web3';

export interface Source {
  code: string,
  name: string
}

export interface Target {
  protocol: string,
  host: string,
  port: string
}

export interface TxParams {
  from: string,
  data: string,
  gas: number
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
  web3: Web3
}
