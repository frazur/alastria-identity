var AlastriaPublicKeyRegistry = artifacts.require('contracts/registry/AlastriaPublicKeyRegistry.sol');
var AlastriaCredentialRegistry = artifacts.require('contracts/registry/AlastriaCredentialRegistry.sol');
var AlastriaPresentationRegistry = artifacts.require('contracts/registry/AlastriaPresentationRegistry.sol');
var Eidas = artifacts.require("contracts/libs/Eidas.sol");
var AlastriaIdentityManager = artifacts.require("contracts/identityManager/AlastriaIdentityManager.sol");
var AlastriaIdentityServiceProvider = artifacts.require("contracts/identityManager/AlastriaIdentityServiceProvider.sol");
var AlastriaIdentityIssuer = artifacts.require("contracts/identityManager/AlastriaIdentityIssuer.sol");
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
var AlastriaIdentityManagerABI = JSON.parse('[{"constant":true,"inputs":[{"name":"subject","type":"address"},{"name":"publicKey","type":"bytes32"}],"name":"getPublicKeyStatus","outputs":[{"name":"exists","type":"bool"},{"name":"status","type":"uint8"},{"name":"startDate","type":"uint256"},{"name":"endDate","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"subject","type":"address"}],"name":"getCurrentPublicKey","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"publicKey","type":"string"}],"name":"deletePublicKey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"publicKey","type":"string"}],"name":"addKey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"previousPublishedVersion","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"publicKeyList","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"publicKey","type":"string"}],"name":"revokePublicKey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_previousPublishedVersion","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"publicKey","type":"string"}],"name":"PublicKeyDeleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"publicKey","type":"string"}],"name":"PublicKeyRevoked","type":"event"}]');
var functionDef = new SolidityFunction('', _.find(AlastriaIdentityManagerABI, { name: 'addKey' }), '');

const adminAddress = '0x895c36b2a28e975c50dfC4FF24AAb0e266857bdc'
const adminPrivK = 'e7cf944b7c1e2ca68ed9dda0823346f03554c0b881bea0090b2f66ce87de5a1c';

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Eidas);

  let alastriaPresentationRegistry = await deployer.deploy(AlastriaPresentationRegistry, accounts[0]);
  let alastriaPublicKeyRegistry = await deployer.deploy(AlastriaPublicKeyRegistry, accounts[0]);
  let alastriaCredentialRegistry = await deployer.deploy(AlastriaCredentialRegistry, accounts[0]);

  await deployer.link(Eidas, AlastriaIdentityIssuer);
  await deployer.link(Eidas, AlastriaIdentityManager);

  let alastriaIdentityServiceProvider = await deployer.deploy(AlastriaIdentityServiceProvider);
  let alastriaIdentityIssuer = await deployer.deploy(AlastriaIdentityIssuer);
  let identityManager = await deployer.deploy(AlastriaIdentityManager, 0);

  console.log("AlastriaPublicKeyRegistry: " + alastriaPublicKeyRegistry.address)
  console.log("AlastriaCredentialRegistry: " + alastriaCredentialRegistry.address)
  console.log("AlastriaPresentationRegistry: " + alastriaPresentationRegistry.address)
  console.log("AlastriaIdentityManager: " + identityManager.address)
  console.log("AlastriaIdentityIssuer: " + alastriaIdentityIssuer.address)
  console.log("AlastriaIdentityServiceProvider: " + alastriaIdentityServiceProvider.address)

  let tx1 = await identityManager.prepareAlastriaID(adminAddress)
  let pubK = '0x' + privateKeyToPublicKey(Buffer.from(adminPrivK, 'hex')).toString('hex').substring(2)
  console.log(pubK)
  let payloadData = functionDef.toPayload([pubK]).data;
  console.log(payloadData)
  let tx2 = await identityManager.createAlastriaIdentity(payloadData)
  let proxyAdmin = await identityManager.identityKeys.call(adminAddress)
  let tx3 = await identityManager.addIdentityIssuer(proxyAdmin, 3)
  console.log("HASH TX1: " + tx1.tx)
  console.log("HASH TX2: " + tx2.tx)
  console.log("PROXY ADMIN: " + proxyAdmin)
  console.log("HASH TX3: " + tx3.tx)

};
