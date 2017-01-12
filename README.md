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

A nested object keyed by the names (as in the Solidity `contract <Name> {` shared by the contracts' constructor functions) where the inner objects have the following properties:

- `file` [string] - An absolute or relative path from the process current working directory to the contract to be compiled.
- `signingKey` [string]
- `txParams` [[`TxParams`](#TxParams)]
- `args` [Array] - (*optional*, default `[]`)
- `web3Provider` [string] - (*optional*, default `http://localhost:8545`)
- `web3` [object] - (*optional*, default derived from `web3Provider`)

See the [exampleConf](https://github.com/skmgoldin/deploy-monster/blob/master/exampleConf.json), for instance.

#### `Output`

An object with the following properties:

- `name` [string] - The name of the contract.
- `abi` [string] - The contract's ABI.
- `address` [string] - The address at which the contract was deployed.
- `txHash` [string] - The transaction hash of the contract deployment.
- `bytecode` [string] - The contract's bytecode.

#### `TxParams`

A nested object keyed by the names (as in the Solidity `contract <Name> {` shared by the contracts' constructor functions) where the inner objects have the following properties:

- `nonce` [number] - (*optional*, default derived using [`web3.eth.getTransactionCount`](#https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactioncount) on the address of the `signingKey` specified in the [`DeployOpts`](#DeployOpts)) The nonce with which to send the deployment transaction.
- `gas` [number] - (*optional*, default `1000000`)
- `gasPrice` [number] - (*optional*, default `1`)
- `value` [number] - (*optional*, default `0`)

## CLI

Usage:

```bash
$ deploy-monster --help
  ____             _
 |  _ \  ___ _ __ | | ___  _   _
 | | | |/ _ \ '_ \| |/ _ \| | | |
 | |_| |  __/ |_) | | (_) | |_| |
 |____/_\___| .__/|_|\___/ \__, |
 |  \/  | __|_|_ __  ___| ||___/ _ __
 | |\/| |/ _ \| '_ \/ __| __/ _ \ '__|
 | |  | | (_) | | | \__ \ ||  __/ |
 |_|  |_|\___/|_| |_|___/\__\___|_|


  Usage: cli [options] [arguments]

  A tool for deploying Ethereum smart contracts.

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -n, --name [name]               Smart contract name. Default: uses filename if not passed.
    -f, --file [file]               Solidity smart contract file.
    -sk, --signing-key [key]        Signing key.
    -p, --web3-provider [provider]  Web3 provider. Default: http://localhost:8545
    -c, --config [file]             Config file.
    -n, --nonce [number]            Nonce value. Default: derived using web3.eth.getTransactionCount
    -g, --gas [amount]              Gas amount. Default: 1000000
    -gp, --gas-price [amount]       Gas Price. Default: 1
    -v, --value [amount]            Amount to send. Default: 0
    -o, --output [filepath]         Filepath to save response.
```

#### CLI Examples

Basic example:

`Token.sol`

```solidity
pragma solidity ^0.4.6;

contract Token {
    mapping (address => uint256) public balanceOf;
    string public name = '';

    function Token( uint256 initialSupply, string _name) {
        balanceOf[msg.sender] = initialSupply;
        name = _name;
    }

    function transfer(address _to, uint256 _value) {
        if (balanceOf[msg.sender] < _value) throw;
        if (balanceOf[_to] + _value < balanceOf[_to]) throw;
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
    }
}
```

```bash
$ deploy-monster --file=./contracts/Token.sol --signing-key=3a183dbf44f6a6a5112e6dff1e1283238e9b9703938d94f5aa53cf8581ab2c26 --web3-provider="http://localhost:8545" --output=./output.json 1000 "My Token"
```

Using config file:

`config.json`

```json
{
  "Token": {
    "file": "./contracts/Token.sol",
    "signingKey": "3a183dbf44f6a6a5112e6dff1e1283238e9b9703938d94f5aa53cf8581ab2c26",
    "txParams": {},
    "args": [1000, "My Token"],
    "web3Provider": "http://localhost:8545"
  }
}
```

```bash
$ deploy-monster --config=config.json
```
