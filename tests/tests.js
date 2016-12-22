const chai = require('chai')
const dm = require('../lib/index.js')
const Web3 = require('Web3');

describe('index.js', function() {
  describe('#compileAndDeploy(opts)', function() {
    let web3
    let accts
    let txParams
    let opts
    let testDef
    let testInstance

    this.timeout(5000)
    before(function(done) {
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
        dm.compileAndDeploy(opts).then(function(output) {
          testDef = web3.eth.contract(output.Test.abi);
          testInstance = testDef.at(output.Test.address);
          done()
        })
      })
    })

    it('should deploy the test.sol contract', function(done) {
        chai.assert.equal(testInstance.sender(), accts[0]);
        chai.assert.equal(testInstance.addr(), accts[1]);
        chai.assert.equal(testInstance.number().c[0], 4);
        chai.assert.equal(testInstance.boolean(), true);
        done();
      })
    it('should capture the address of the test.sol contract')
    it('should capture the abi of the test.sol contract')
    it('should capture the txHash of the test.sol contract')
    it('should capture the bytecode of the test.sol contract')
  })
  describe('#compileAndDeployFromConfig(configPath)', function() {
    it('should deploy the test.sol contract')
  })
  describe('#writeOutput(path, output)', function() {

  })
})
