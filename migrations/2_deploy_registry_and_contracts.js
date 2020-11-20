const fs = require('fs');
const path = require('path')
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

var mnemonic = "abbucchinemammt"
var accountIndex = 0
const seed = bip39.mnemonicToSeed(mnemonic); // mnemonic is the string containing the words
const hdk = hdkey.fromMasterSeed(seed);
const addr_node = hdk.derivePath("m/44'/60'/0'/0/" + accountIndex); //m/44'/60'/0'/0/0 is derivation path for the first account. m/44'/60'/0'/0/1 is the derivation path for the second account and so on
//const addr = addr_node.getWallet().getAddressString(); //check that this is the same with the address that ganache list for the first account to make sure the derivation is correct
const adminPrivK = addr_node.getWallet().getPrivateKey().toString('hex');
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
const AlastriaIdentityManagerABI = JSON.parse(fs.readFileSync('../build/contracts/AlastriaPublicKeyRegistry.json', 'utf8')).abi
//TODO usare web3 encodeFunctionCall
var functionDef = new SolidityFunction('', _.find(AlastriaIdentityManagerABI, { name: 'addKey' }), '');

var Eidas = artifacts.require("contracts/libs/Eidas.sol");
var AlastriaIdentityManager = artifacts.require("contracts/identityManager/AlastriaIdentityManager.sol");
var AlastriaIdentityServiceProvider = artifacts.require("contracts/identityManager/AlastriaIdentityServiceProvider.sol");
var AlastriaIdentityIssuer = artifacts.require("contracts/identityManager/AlastriaIdentityIssuer.sol");
var AlastriaPublicKeyRegistry = artifacts.require("contracts/registry/AlastriaPublicKeyRegistry.sol");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Eidas);
  await deployer.link(Eidas, AlastriaIdentityIssuer);
  await deployer.link(Eidas, AlastriaIdentityManager);

  let alastriaIdentityServiceProvider = await deployer.deploy(AlastriaIdentityServiceProvider);
  let alastriaIdentityIssuer = await deployer.deploy(AlastriaIdentityIssuer);
  let identityManager = await deployer.deploy(AlastriaIdentityManager, 0);

  fs.writeFileSync('Contracts.md', "Name | Address\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityManager | " + identityManager.address + "\n");
  let apkr = await identityManager.alastriaPublicKeyRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaPublicKeyRegistry | " + apkr + "\n");
  let acr = await identityManager.alastriaCredentialRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaCredentialRegistry | " + acr + "\n");
  let apr = await identityManager.alastriaPresentationRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaPresentationRegistry | " + apr + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityIssuer | " + alastriaIdentityIssuer.address + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityServiceProvider | " + alastriaIdentityServiceProvider.address + "\n");

  let tx1 = await identityManager.prepareAlastriaID(accounts[accountIndex])
  let pubK = '0x' + privateKeyToPublicKey(Buffer.from(adminPrivK, 'hex')).toString('hex').substring(2)
  let payloadData = functionDef.toPayload([pubK]).data;
  let tx2 = await identityManager.createAlastriaIdentity(payloadData)
  let proxyAdmin = await identityManager.identityKeys.call(accounts[accountIndex])
  let tx3 = await identityManager.addIdentityIssuer(proxyAdmin, 3)
  console.log("HASH TX1: " + tx1.tx)
  console.log("HASH TX2: " + tx2.tx)
  console.log("HASH TX3: " + tx3.tx)

  fs.appendFileSync('Contracts.md', "ProxyAdmin | " + proxyAdmin + "\n");

  //TEST OK
  let pkm = await AlastriaPublicKeyRegistry.at(apkr)
  let testPubKey = await pkm.getCurrentPublicKey(proxyAdmin)
  console.log("Prova del 9")
  console.log(pubK == testPubKey)

  var getBasicTransaction = function () {
    return {
      to: "0x0000000000000000000000000000000000000000",
      data: "0x0",
      gasLimit: 0,
      gasPrice: 0,
      nonce: "0x0"
    }
  }

  var getContractsAbi = function () {
    var _contractsAbi = {}
    fs.readdirSync(path.join(__dirname, "../build/contracts")).forEach((file) => {
      const abi = {}
      console.log(file)
      const abiFile = JSON.parse(fs.readFileSync(path.join(__dirname, "../build/contracts", file), 'utf8')).abi
      abiFile.forEach((element) => {
        if (element.type === 'constructor') {
          abi.constructor = element
        } else {
          abi[element.name] = element
        }
      })
      _contractsAbi[file.split(".")[0]] = abi
    })
    return _contractsAbi
  }

  if (pubK == testPubKey) {
    let config = {}
    config.alastriaIdentityManager = identityManager.address
    config.alastriaPublicKeyRegistry = apkr
    config.alastriaCredentialRegistry = acr
    config.alastriaPresentationRegistry = apr
    config.basicTransaction = getBasicTransaction()
    config.contractsAbi = getContractsAbi()
    config.zeroValue = "00000000000000000000000000000000000000000000000000000000000000000000"
    fs.writeFileSync('config.json', JSON.stringify(config));
  }


};
