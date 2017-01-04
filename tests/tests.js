const chai = require('chai')
const dm = require('../lib/index.js')
const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const keythereum = require("keythereum")
const fs = require('fs')
const path = require('path')

describe('index.js', function() {
  describe('using a single contract with no dependencies...', function() {
    describe('#compileAndDeployFromConfig(\'configPath\')', function() {
      let web3
      let accts
      let txParams
      let opts
      let testDef
      let testInstance
      let output
      let signingKey
      let argAddr

      this.timeout(5000)

      before(function(done) {


        const params = { keyBytes: 32, ivBytes: 16 }
        signingKey = keythereum.create(params).privateKey
        argAddr = keythereum.privateKeyToAddress(keythereum.create(params).privateKey)

        var server = TestRPC.server({accounts: [{secretKey: signingKey, balance: 1000000000}]});
        server.listen(8545, function(err, blockchain) {})

        web3 = new Web3()
        web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))

        web3.eth.getTransactionCount(keythereum.privateKeyToAddress(signingKey),
                                     function(err, res) {
          txParams = {
            nonce: res 
          }

          opts = {
            file: 'tests/test.sol',
            name: 'Test',
            args: [argAddr, 4, true],
            signingKey: signingKey.toString('hex'),
            txParams: txParams,
            web3Provider: 'http://localhost:8545'
          }

          fs.writeFileSync(path.resolve('tests/testConf.json'), JSON.stringify(opts))

          dm.compileAndDeployFromConfig(path.resolve('tests/testConf.json')).then(function(_output) {
            output = _output
            testDef = web3.eth.contract(output.Test.abi)
            testInstance = testDef.at(output.Test.address)
            done()
          })                               

        })
      })

      it('should deploy the test.sol contract', function() {
        testInstance.sender(function(err, res) {
          chai.assert.equal(res, keythereum.privateKeyToAddress(signingKey))
          testInstance.addr(function(err, res) {
            chai.assert.equal(res, argAddr)
            testInstance.number(function(err, res) {
              chai.assert.equal(res, 4)
              testInstance.boolean(function(err, res) {
                chai.assert.equal(res, true)
                done()
              })
            })
          })
        })
      })
      it('should capture the address, abi, txHash and bytecode of the test.sol contract',
          function() {
        chai.assert.typeOf(output.Test.address, 'string')
        chai.assert.typeOf(output.Test.abi, 'array')
        chai.assert.typeOf(output.Test.txHash, 'string')
        chai.assert.typeOf(output.Test.bytecode, 'string')
      })
    })
  })
  describe('using a single contract with dependencies', function() {
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the testDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the testDeps.sol contract')
    })
  })
  describe('using multiple contracts without dependencies', function() {
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the multiTest.sol contract')
      it('should capture the address, abi, txHash and bytecode of the multiTest.sol contract')
    })
  })
  describe('using multiple contracts with dependencies', function() {
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the multiTestDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the est.sol contract')
    })
  })
})
