const fs = require(`fs`);
const path = require(`path`);
const cmd = require(`commander`);
const colors = require(`colors`);
const Spinner = require(`cli-spinner`).Spinner;

const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../package.json`)));

cmd
  .version(package.version)
  .usage(`[options] [arguments]`)
  .description(`A tool for deploying Ethereum smart contracts.`)
  .option(`-n, --name [name]`, `Smart contract name. Default: uses filename if not passed.`)
  .option(`-f, --file [file]`, `Solidity smart contract file.`)
  .option(`-sk, --signing-key [key]`, `Signing key.`)
  .option(`-p, --web3-provider [provider]`, `Web3 provider. Default: http://localhost:8545`)
  .option(`-c, --config [file]`, `Config file.`)
  .option(`-n, --nonce [number]`, `Nonce value. Default: derived using web3.eth.getTransactionCount`)
  .option(`-g, --gas [amount]`, `Gas amount. Default: 1000000`)
  .option(`-gp, --gas-price [amount]`, `Gas Price. Default: 1`)
  .option(`-v, --value [amount]`, `Amount to send. Default: 0`)
  .option(`-o, --output [filepath]`, `Filepath to save response.`)
  .parse(process.argv);

const config = cmd.config;
const file = cmd.file;
const name = (typeof cmd.name === `string` ? cmd.name : pathFilename(file));
const signingKey = cmd.signingKey;
const web3Provider = cmd.web3Provider || `http://localhost:8545`;
const args = cmd.args;
const nonce = cmd.nonce;
const gas = cmd.gas;
const gasPrice = cmd.gasPrice;
const value = cmd.value;
const outputPath = cmd.output;

if (!(file || config)) {
  cmd.help();
  return false;
}

const txParams = {
  nonce,
  gas,
  gasPrice,
  value
};

let promise = null;

console.log(colors.yellow(`Initializing..`));
const dm = require(`./index`);

const spinner = new Spinner(colors.yellow(`Attempting deploy.. %s`));
spinner.setSpinnerString(`|/-\\`);
spinner.start();

if (config) {
  promise = dm.compileAndDeployFromConfig(path.resolve(config));
} else {
  promise = dm.compileAndDeploy({
      [name]: {
        file,
        signingKey,
        txParams,
        args,
        web3Provider
      }
    });
}

promise
.then(onResponse)
.catch(onFail)
.then(onFinish);

function onResponse(response) {
  const json = JSON.stringify(response, null, 2);

  console.log(colors.green(`\n\nResponse:\n\n`), json);

  if (outputPath) {
    fs.writeFileSync(path.resolve(outputPath), json);
  }
}

function onFail(error) {
  console.error(colors.red(`\nError, see below:\n`), error);
}

function onFinish() {
  console.log(colors.yellow(`\nFinished.`));
  spinner.stop();
}

function pathFilename(path) {
  return `${path || ``}`.split(`/`).pop().replace(/\.sol$/gi, ``)
}
