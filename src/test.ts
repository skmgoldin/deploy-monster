import * as dm from './index.js';
import * as Web3 from 'web3';

const web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));

const opts = {
  file: '/contracts/USCC.sol',
  name: 'USCC',
  args: ['0x0d7e7d1d070bf0a1f97bb2d9a7e5b481127471a8'],
  txParams: {
    from: web3.eth.accounts[0],
    data: undefined,
    gas: 500000
  },
  web3: web3
}

/*
dm.compileAndDeploy(opts).then((output) => {
  dm.writeOutput('/output', output);
});
*/

dm.compileAndDeployFromConfig('/conf.json');


