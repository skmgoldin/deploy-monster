[ ![Codeship Status for skmgoldin/deploy-monster](https://app.codeship.com/projects/fda3aca0-aaa0-0134-e233-6aed319023da/status?branch=master)](https://app.codeship.com/projects/191974)
# SYNOPSIS

A module for deploying Ethereum smart contracts.

## INSTALL
`npm install deploy-monster`

## API

### Functions

- [`compileAndDeploy`](#compileAndDeploy)
- [`compileAndDeployFromConfig`](#compileAndDeployFromConfig)

#### `compileAndDeploy(opts: DeployOpts)`
Compile and deploy a contract from the values specified in `opts`.

- `opts` - A [`DeployOpts`](#DeployOpts) object.

#####Returns:

An [`Output`](#Output) object.

#### `compileAndDeployFromConfig(configPath: string)`
Compile and deploy a contract from the values specified in a JSON config file.

- `configPath` - An absolute or relative path from the process current working directory to a JSON config file which can be parsed as a [`DeployOpts`](#DeployOpts) object.

#####Returns:

An [`Output`](#Output) object.

### Types

- [`DeployOpts`](#DeployOpts)
- [`Output`](#Output)
- [`TxParams`](#TxParams)

#### `DeployOpts`

- `file` [string] - An absolute or relative path from the process current working directory to the contract to be compiled.
- `name` [string] - The name of the contract to be compiled, as in the Solidity `contract <Name> {` shared by the contract's constructor function.
- `signingKey` [string]
- `txParams` [[`TxParams`](#TxParams)]
- `args` [number] - (*optional*, default `[]`)
- `web3Provider` [string] - (*optional*, default `http://localhost:8545`)
- `web3` [object] - (*optional*, default derived from `web3Provider`)

#### `Output`

An object with the following properties:

- `name` [string] - The name of the contract.
- `abi` [string] - The contract's ABI.
- `address` [string] - The address at which the contract was deployed.
- `txHash` [string] - The transaction hash of the contract deployment.
- `bytecode` [string] - The contract's bytecode.

#### `TxParams`

- `nonce` [number] - The nonce with which to send the transaction. Derivable using [`web3.eth.getTransactionCount`](#https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactioncount) on the address of the `signingKey` specified in the [`DeployOpts`](#DeployOpts).
- `gas` [number] - (*optional*, default `1000000`)
- `gasPrice` [number] - (*optional*, default `1`)
- `value` [number] - (*optional*, default `0`)
