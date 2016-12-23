const chai = require('chai')
const dm = require('../lib/index.js')
const Web3 = require('web3');

describe('index.js', function() {
  describe('using a single contract with no dependencies...', function() {
    let web3
    let accts
    let txParams
    let opts
    let testDef
    let testInstance
    let output

    this.timeout(5000)

    function setup(cb) {
      web3 = new Web3()
      web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))
      web3.eth.getAccounts(function(err, _accts) {
        accts = _accts
        txParams = {
          from: accts[0],
          gas: 500000
        }
        opts = {
          file: '/tests/test.sol',
          name: 'Test',
          args: [accts[1], 4, true],
          txParams: txParams,
          web3: web3
        }
        dm.compileAndDeploy(opts).then(function(_output) {
          output = _output
          testDef = web3.eth.contract(output.Test.abi)
          testInstance = testDef.at(output.Test.address)
          cb()
        })
      })
    }


    describe('#compileAndDeploy(opts)', function() {

      before(function(done) {
        setup(done)
      })

      it('should deploy the test.sol contract', function() {
        chai.assert.equal(testInstance.sender(), accts[0])
        chai.assert.equal(testInstance.addr(), accts[1])
        chai.assert.equal(testInstance.number().c[0], 4)
        chai.assert.equal(testInstance.boolean(), true)
      })
      it('should capture the address, abi, txHash and bytecode of the test.sol contract',
          function() {
        chai.assert.typeOf(output.Test.address, 'string')
        chai.assert.typeOf(output.Test.abi, 'array')
        chai.assert.typeOf(output.Test.txHash, 'string')
        chai.assert.typeOf(output.Test.bytecode, 'string')
      })
    })
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the test.sol contract')
      it('should capture the address, abi, txHash and bytecode of the test.sol contract')
    })
    describe('#writeOutput(path, output)', function() {
      it('should write the address, abi, txHash and bytecode of the test.sol contract')
      it('should do so when the path already exists')
      it('should do so when the path does not exist')
    })
  })

  describe('using a single contract with dependencies', function() {
    describe('#compileAndDeploy(opts)', function() {
      it('should deploy the testDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the testDeps.sol contract')
    })
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the testDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the testDeps.sol contract')
    })
    describe('#writeOutput(path, output)', function() {
      it('should write the address, abi, txHash and bytecode of the testDeps.sol contract')
      it('should do so when the path already exists')
      it('should do so when the path does not exist')
    })
  })
  describe('using multiple contracts without dependencies', function() {
    describe('#compileAndDeploy(opts)', function() {
      it('should deploy the multiTest.sol contract')
      it('should capture the address, abi, txHash and bytecode of the multiTest.sol contract')
    })
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the multiTest.sol contract')
      it('should capture the address, abi, txHash and bytecode of the multiTest.sol contract')
    })
    describe('#writeOutput(path, output)', function() {
      it('should write the address, abi, txHash and bytecode of the multiTest.sol contract')
      it('should do so when the path already exists')
      it('should do so when the path does not exist')
    })
  })
  describe('using multiple contracts with dependencies', function() {
    describe('#compileAndDeploy(opts)', function() {
      it('should deploy the multiTestDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the multiTestDeps.sol contract')
    })
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the multiTestDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the est.sol contract')
    })
    describe('#writeOutput(path, output)', function() {
      it('should write the address, abi, txHash and bytecode of the multiTestDeps.sol contract')
      it('should do so when the path already exists')
      it('should do so when the path does not exist')
    })
  })
})
