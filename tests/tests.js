const chai = require('chai')
const dm = require('../lib/index.js')
const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const keythereum = require("keythereum")
const fs = require('fs')
const path = require('path')

describe('index.js', function() {
  let web3
  let accts
  let txParams
  let opts
  let testDef0
  let testDef1
  let testInstance0
  let testInstance1
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
    done()
  })

  describe('using a single contract with no dependencies...', function() {
    describe('#compileAndDeployFromConfig(\'configPath\')', function() {

      before(function(done) {
        opts = {
          Test0: {
            file: 'tests/test0.sol',
            args: [argAddr, 4, true],
            signingKey: signingKey.toString('hex'),
            txParams: {},
            web3Provider: 'http://localhost:8545'
          }
        }

        fs.writeFileSync(path.resolve('tests/testConf.json'), JSON.stringify(opts))

        dm.compileAndDeployFromConfig(path.resolve('tests/testConf.json'))
        .then(function(_output) {
          output = _output
          testDef0 = web3.eth.contract(output.Test0.abi)
          testInstance0 = testDef0.at(output.Test0.address)
          done()
        })                               
      })

      it('should deploy the test0.sol contract', function(done) {
        testInstance0.sender(function(err, res) {
          chai.assert.equal(res, keythereum.privateKeyToAddress(signingKey))
          testInstance0.addr(function(err, res) {
            chai.assert.equal(res, argAddr)
            testInstance0.number(function(err, res) {
              chai.assert.equal(res, 4)
              testInstance0.boolean(function(err, res) {
                chai.assert.equal(res, true)
                done()
              })
            })
          })
        })
      })
      it('should capture the address, abi, txHash and bytecode of the test0.sol contract',
          function() {
        chai.assert.typeOf(output.Test0.address, 'string')
        chai.assert.typeOf(output.Test0.abi, 'array')
        chai.assert.typeOf(output.Test0.txHash, 'string')
        chai.assert.typeOf(output.Test0.bytecode, 'string')
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
      before(function(done) {
        web3.eth.getTransactionCount(keythereum.privateKeyToAddress(signingKey),
                                     function(err, res) {
          opts = {
            Test0: {
              file: 'tests/test0.sol',
              args: [argAddr, 5, true],
              signingKey: signingKey.toString('hex'),
              txParams: {nonce: res},
              web3Provider: 'http://localhost:8545'
            },
            Test1: {
              file: 'tests/test1.sol',
              args: [argAddr, 6, true],
              signingKey: signingKey.toString('hex'),
              txParams: {nonce: res + 1},
              web3Provider: 'http://localhost:8545'
            }
          }

          fs.writeFileSync(path.resolve('tests/testConf.json'), JSON.stringify(opts))

          dm.compileAndDeployFromConfig(path.resolve('tests/testConf.json')).then(function(_output) {
            output = _output
            testDef0 = web3.eth.contract(output.Test0.abi)
            testDef1 = web3.eth.contract(output.Test1.abi)
            testInstance0 = testDef0.at(output.Test0.address)
            testInstance1 = testDef1.at(output.Test1.address)
            done()
          })                               
        })
      })
      it('should deploy the test0.sol contract', function(done) {
        testInstance0.sender(function(err, res) {
          chai.assert.equal(res, keythereum.privateKeyToAddress(signingKey))
          testInstance0.addr(function(err, res) {
            chai.assert.equal(res, argAddr)
            testInstance0.number(function(err, res) {
              chai.assert.equal(res, 5)
              testInstance0.boolean(function(err, res) {
                chai.assert.equal(res, true)
                done()
              })
            })
          })
        })
      })
      it('should capture the address, abi, txHash and bytecode of the test0.sol contract',
          function() {
        chai.assert.typeOf(output.Test0.address, 'string')
        chai.assert.typeOf(output.Test0.abi, 'array')
        chai.assert.typeOf(output.Test0.txHash, 'string')
        chai.assert.typeOf(output.Test0.bytecode, 'string')
      })
      it('should deploy the test1.sol contract', function(done) {
        testInstance1.sender(function(err, res) {
          chai.assert.equal(res, keythereum.privateKeyToAddress(signingKey))
          testInstance1.addr(function(err, res) {
            chai.assert.equal(res, argAddr)
            testInstance1.number(function(err, res) {
              chai.assert.equal(res, 6)
              testInstance1.boolean(function(err, res) {
                chai.assert.equal(res, true)
                done()
              })
            })
          })
        })
      })
      it('should capture the address, abi, txHash and bytecode of the test1.sol contract',
          function() {
        chai.assert.typeOf(output.Test1.address, 'string')
        chai.assert.typeOf(output.Test1.abi, 'array')
        chai.assert.typeOf(output.Test1.txHash, 'string')
        chai.assert.typeOf(output.Test1.bytecode, 'string')
      })

    })
  })
  describe('using multiple contracts with dependencies', function() {
    describe('#compileAndDeployFromConfig(configPath)', function() {
      it('should deploy the multiTestDeps.sol contract')
      it('should capture the address, abi, txHash and bytecode of the est.sol contract')
    })
  })
})
