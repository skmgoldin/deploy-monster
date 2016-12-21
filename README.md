# SYNOPSIS

A module for deploying Ethereum smart contracts.

## INSTALL
`npm install deploy-monster`

## API

### Types

- [`Output`](#Output)
- [`TxParams`](#TxParams)

#### `Output`

An object with the following properties:

- `name` - string
- `abi` - string
- `address` - string
- `txHash` - string
- `bytecode` - string

#### `TxParams`

- `from` - string
- `data` - string
- `gas` - number

### Functions

- [`compileAndDeploy`](#compileAndDeploy)
- [`compileAndDeployFromConfig`](#compileAndDeployFromConfig)
- [`writeOutput`](#writeOutput)

#### `compileAndDeploy(opts)`
Compile and deploy a contract from the values specified in `opts`.

#####Options:

- `file` - (mandatory) the path to the contract file from the process working directory.
- `name` - (mandatory) the name of the contract.
- `args` - (mandatory) an array of arguments to be provided to the contract's constructor.
- `txParams` - (optional) a web3.js-style object specifying transaction parameters.
- `web3` - (optional) an instantiated web3 object with a specified provider. If undefined, `http://localhost:8545` will be used.

#####Returns:

An `Output` object.

#### `compileAndDeployFromConfig(configPath)`
Compile and deploy a contract from the values specified in a JSON config file.

- `configPath` - a string indicating a path to the config from the process current working directory.

#####Returns:

An `Output` object.

#### `writeOutput(path, output)`
Write a JSON-encoded output file with the deployed contract's address, abi, bytecode and the transaction hash of its deployment.

- `path` - a string indicating a path to the file to be written from the process current working directory.
- `output` - an `Output` object.
