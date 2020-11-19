var fs = require('fs');

var Eidas = artifacts.require("contracts/libs/Eidas.sol");
var AlastriaIdentityManager = artifacts.require("contracts/identityManager/AlastriaIdentityManager.sol");
var AlastriaIdentityServiceProvider = artifacts.require("contracts/identityManager/AlastriaIdentityServiceProvider.sol");
var AlastriaIdentityIssuer = artifacts.require("contracts/identityManager/AlastriaIdentityIssuer.sol");
var AlastriaPublicKeyRegistry = artifacts.require("contracts/registry/AlastriaPublicKeyRegistry.sol");

const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
const AlastriaIdentityManagerABI = JSON.parse(fs.readFileSync('../build/contracts/AlastriaPublicKeyRegistry.json', 'utf8')).abi
//TODO usare web3 encodeFunctionCall
var functionDef = new SolidityFunction('', _.find(AlastriaIdentityManagerABI, { name: 'addKey' }), '');

const adminAddress = '0x895c36b2a28e975c50dfC4FF24AAb0e266857bdc'
const adminPrivK = 'e7cf944b7c1e2ca68ed9dda0823346f03554c0b881bea0090b2f66ce87de5a1c';

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Eidas);
  await deployer.link(Eidas, AlastriaIdentityIssuer);
  await deployer.link(Eidas, AlastriaIdentityManager);

  let alastriaIdentityServiceProvider = await deployer.deploy(AlastriaIdentityServiceProvider);
  let alastriaIdentityIssuer = await deployer.deploy(AlastriaIdentityIssuer);
  let identityManager = await deployer.deploy(AlastriaIdentityManager, 0);

  fs.writeFileSync('Contracts.md', "Name | Address\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityManager | " + identityManager.address + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityIssuer | " + alastriaIdentityIssuer.address + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityServiceProvider | " + alastriaIdentityServiceProvider.address + "\n");
  let apkr = await identityManager.alastriaPublicKeyRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaPublicKeyRegistry | " + apkr + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaCredentialRegistry | " + await identityManager.alastriaCredentialRegistry.call() + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaPresentationRegistry | " + await identityManager.alastriaPresentationRegistry.call() + "\n");

  let tx1 = await identityManager.prepareAlastriaID(adminAddress)
  let pubK = '0x' + privateKeyToPublicKey(Buffer.from(adminPrivK, 'hex')).toString('hex').substring(2)
  let payloadData = functionDef.toPayload([pubK]).data;
  let tx2 = await identityManager.createAlastriaIdentity(payloadData)
  let proxyAdmin = await identityManager.identityKeys.call(adminAddress)
  let tx3 = await identityManager.addIdentityIssuer(proxyAdmin, 3)
  console.log("HASH TX1: " + tx1.tx)
  console.log("HASH TX2: " + tx2.tx)
  console.log("HASH TX3: " + tx3.tx)

  fs.appendFileSync('Contracts.md', "ProxyAdmin | " + proxyAdmin + "\n");

  //TEST OK
  let pkm = await AlastriaPublicKeyRegistry.at(apkr)
  let testPubKey = await pkm.getCurrentPublicKey(proxyAdmin)
  console.log("Prova del 9: " + pubK == testPubKey)

};
