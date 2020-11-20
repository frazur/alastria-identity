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
  let apkr = await identityManager.alastriaPublicKeyRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaPublicKeyRegistry | " + apkr + "\n");
  let acr = await identityManager.alastriaCredentialRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaCredentialRegistry | " + acr + "\n");
  let apr = await identityManager.alastriaPresentationRegistry.call()
  fs.appendFileSync('Contracts.md', "AlastriaPresentationRegistry | " + apr + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityIssuer | " + alastriaIdentityIssuer.address + "\n");
  fs.appendFileSync('Contracts.md', "AlastriaIdentityServiceProvider | " + alastriaIdentityServiceProvider.address + "\n");

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
    return {

      "AlastriaIdentityEntity": {
        "setUrlLogo": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_url_logo",
            "type": "string"
          }
          ],
          "name": "setUrlLogo",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "setCifEntity": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_cif",
            "type": "string"
          }
          ],
          "name": "setCifEntity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "setUrlCreateAID": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_url_createAID",
            "type": "string"
          }
          ],
          "name": "setUrlCreateAID",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "entitiesList": {
          "constant": true,
          "inputs": [],
          "name": "entitiesList",
          "outputs": [{
            "name": "",
            "type": "address[]"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getEntity": {
          "constant": true,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }
          ],
          "name": "getEntity",
          "outputs": [{
            "name": "_name",
            "type": "string"
          }, {
            "name": "_cif",
            "type": "string"
          }, {
            "name": "_url_logo",
            "type": "string"
          }, {
            "name": "_url_createAID",
            "type": "string"
          }, {
            "name": "_url_AOA",
            "type": "string"
          }, {
            "name": "_active",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "setUrlAOA": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_url_AOA",
            "type": "string"
          }
          ],
          "name": "setUrlAOA",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "addEntity": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_name",
            "type": "string"
          }, {
            "name": "_cif",
            "type": "string"
          }, {
            "name": "_url_logo",
            "type": "string"
          }, {
            "name": "_url_createAID",
            "type": "string"
          }, {
            "name": "_url_AOA",
            "type": "string"
          }, {
            "name": "_active",
            "type": "bool"
          }
          ],
          "name": "addEntity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "setNameEntity": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_name",
            "type": "string"
          }
          ],
          "name": "setNameEntity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "constructor": {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      },
      "AlastriaIdentityIssuer": {
        "getEidasLevel": {
          "constant": true,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }
          ],
          "name": "getEidasLevel",
          "outputs": [{
            "name": "",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "updateIdentityIssuerEidasLevel": {
          "constant": false,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }, {
            "name": "_level",
            "type": "uint8"
          }
          ],
          "name": "updateIdentityIssuerEidasLevel",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "isIdentityIssuer": {
          "constant": true,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }
          ],
          "name": "isIdentityIssuer",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "addIdentityIssuer": {
          "constant": false,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }, {
            "name": "_level",
            "type": "uint8"
          }
          ],
          "name": "addIdentityIssuer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "deleteIdentityIssuer": {
          "constant": false,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }
          ],
          "name": "deleteIdentityIssuer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "constructor": {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      },
      "AlastriaIdentityManager": {
        "identityKeys": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "name": "identityKeys",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getEidasLevel": {
          "constant": true,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }
          ],
          "name": "getEidasLevel",
          "outputs": [{
            "name": "",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "addIdentityServiceProvider": {
          "constant": false,
          "inputs": [{
            "name": "_identityServiceProvider",
            "type": "address"
          }
          ],
          "name": "addIdentityServiceProvider",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "setUrlLogo": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_url_logo",
            "type": "string"
          }
          ],
          "name": "setUrlLogo",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "transfer": {
          "constant": false,
          "inputs": [{
            "name": "newOwner",
            "type": "address"
          }
          ],
          "name": "transfer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "setCifEntity": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_cif",
            "type": "string"
          }
          ],
          "name": "setCifEntity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "pendingIDs": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "name": "pendingIDs",
          "outputs": [{
            "name": "",
            "type": "uint256"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "isOwner": {
          "constant": true,
          "inputs": [{
            "name": "addr",
            "type": "address"
          }
          ],
          "name": "isOwner",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "deleteIdentityServiceProvider": {
          "constant": false,
          "inputs": [{
            "name": "_identityServiceProvider",
            "type": "address"
          }
          ],
          "name": "deleteIdentityServiceProvider",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "alastriaPresentationRegistry": {
          "constant": true,
          "inputs": [],
          "name": "alastriaPresentationRegistry",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "updateIdentityIssuerEidasLevel": {
          "constant": false,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }, {
            "name": "_level",
            "type": "uint8"
          }
          ],
          "name": "updateIdentityIssuerEidasLevel",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "prepareAlastriaID": {
          "constant": false,
          "inputs": [{
            "name": "_signAddress",
            "type": "address"
          }
          ],
          "name": "prepareAlastriaID",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "setUrlCreateAID": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_url_createAID",
            "type": "string"
          }
          ],
          "name": "setUrlCreateAID",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "version": {
          "constant": true,
          "inputs": [],
          "name": "version",
          "outputs": [{
            "name": "",
            "type": "uint256"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "delegateCall": {
          "constant": false,
          "inputs": [{
            "name": "_destination",
            "type": "address"
          }, {
            "name": "_value",
            "type": "uint256"
          }, {
            "name": "_data",
            "type": "bytes"
          }
          ],
          "name": "delegateCall",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "isIdentityIssuer": {
          "constant": true,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }
          ],
          "name": "isIdentityIssuer",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "createAlastriaIdentity": {
          "constant": false,
          "inputs": [{
            "name": "addPublicKeyCallData",
            "type": "bytes"
          }
          ],
          "name": "createAlastriaIdentity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "entitiesList": {
          "constant": true,
          "inputs": [],
          "name": "entitiesList",
          "outputs": [{
            "name": "",
            "type": "address[]"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getEntity": {
          "constant": true,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }
          ],
          "name": "getEntity",
          "outputs": [{
            "name": "_name",
            "type": "string"
          }, {
            "name": "_cif",
            "type": "string"
          }, {
            "name": "_url_logo",
            "type": "string"
          }, {
            "name": "_url_createAID",
            "type": "string"
          }, {
            "name": "_url_AOA",
            "type": "string"
          }, {
            "name": "_active",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "addIdentityIssuer": {
          "constant": false,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }, {
            "name": "_level",
            "type": "uint8"
          }
          ],
          "name": "addIdentityIssuer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "owner": {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "setUrlAOA": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_url_AOA",
            "type": "string"
          }
          ],
          "name": "setUrlAOA",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "addEntity": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_name",
            "type": "string"
          }, {
            "name": "_cif",
            "type": "string"
          }, {
            "name": "_url_logo",
            "type": "string"
          }, {
            "name": "_url_createAID",
            "type": "string"
          }, {
            "name": "_url_AOA",
            "type": "string"
          }, {
            "name": "_active",
            "type": "bool"
          }
          ],
          "name": "addEntity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "recoverAccount": {
          "constant": false,
          "inputs": [{
            "name": "accountLost",
            "type": "address"
          }, {
            "name": "newAccount",
            "type": "address"
          }
          ],
          "name": "recoverAccount",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "deleteIdentityIssuer": {
          "constant": false,
          "inputs": [{
            "name": "_identityIssuer",
            "type": "address"
          }
          ],
          "name": "deleteIdentityIssuer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "isIdentityServiceProvider": {
          "constant": true,
          "inputs": [{
            "name": "_identityServiceProvider",
            "type": "address"
          }
          ],
          "name": "isIdentityServiceProvider",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "alastriaCredentialRegistry": {
          "constant": true,
          "inputs": [],
          "name": "alastriaCredentialRegistry",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "setNameEntity": {
          "constant": false,
          "inputs": [{
            "name": "_addressEntity",
            "type": "address"
          }, {
            "name": "_name",
            "type": "string"
          }
          ],
          "name": "setNameEntity",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "alastriaPublicKeyRegistry": {
          "constant": true,
          "inputs": [],
          "name": "alastriaPublicKeyRegistry",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "constructor": {
          "inputs": [{
            "name": "_version",
            "type": "uint256"
          }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        "PreparedAlastriaID": {
          "anonymous": false,
          "inputs": [{
            "indexed": true,
            "name": "signAddress",
            "type": "address"
          }
          ],
          "name": "PreparedAlastriaID",
          "type": "event"
        },
        "OperationWasNotSupported": {
          "anonymous": false,
          "inputs": [{
            "indexed": true,
            "name": "method",
            "type": "string"
          }
          ],
          "name": "OperationWasNotSupported",
          "type": "event"
        },
        "IdentityCreated": {
          "anonymous": false,
          "inputs": [{
            "indexed": true,
            "name": "identity",
            "type": "address"
          }, {
            "indexed": true,
            "name": "creator",
            "type": "address"
          }, {
            "indexed": false,
            "name": "owner",
            "type": "address"
          }
          ],
          "name": "IdentityCreated",
          "type": "event"
        },
        "IdentityRecovered": {
          "anonymous": false,
          "inputs": [{
            "indexed": true,
            "name": "oldAccount",
            "type": "address"
          }, {
            "indexed": false,
            "name": "newAccount",
            "type": "address"
          }, {
            "indexed": true,
            "name": "serviceProvider",
            "type": "address"
          }
          ],
          "name": "IdentityRecovered",
          "type": "event"
        }
      },
      "AlastriaIdentityServiceProvider": {
        "addIdentityServiceProvider": {
          "constant": false,
          "inputs": [{
            "name": "_identityServiceProvider",
            "type": "address"
          }
          ],
          "name": "addIdentityServiceProvider",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "deleteIdentityServiceProvider": {
          "constant": false,
          "inputs": [{
            "name": "_identityServiceProvider",
            "type": "address"
          }
          ],
          "name": "deleteIdentityServiceProvider",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "isIdentityServiceProvider": {
          "constant": true,
          "inputs": [{
            "name": "_identityServiceProvider",
            "type": "address"
          }
          ],
          "name": "isIdentityServiceProvider",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "constructor": {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      },
      "AlastriaProxy": {
        "transfer": {
          "constant": false,
          "inputs": [{
            "name": "newOwner",
            "type": "address"
          }
          ],
          "name": "transfer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "isOwner": {
          "constant": true,
          "inputs": [{
            "name": "addr",
            "type": "address"
          }
          ],
          "name": "isOwner",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "owner": {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "forward": {
          "constant": false,
          "inputs": [{
            "name": "destination",
            "type": "address"
          }, {
            "name": "value",
            "type": "uint256"
          }, {
            "name": "data",
            "type": "bytes"
          }
          ],
          "name": "forward",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "constructor": {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        "undefined": {
          "payable": true,
          "stateMutability": "payable",
          "type": "fallback"
        },
        "Forwarded": {
          "anonymous": false,
          "inputs": [{
            "indexed": true,
            "name": "destination",
            "type": "address"
          }, {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }, {
            "indexed": false,
            "name": "data",
            "type": "bytes"
          }
          ],
          "name": "Forwarded",
          "type": "event"
        }
      },
      "Eidas": {
        "atLeastLow": {
          "constant": true,
          "inputs": [{
            "name": "_eidasLevel",
            "type": "Eidas.EidasLevel"
          }
          ],
          "name": "atLeastLow",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "pure",
          "type": "function"
        },
        "atLeast": {
          "constant": true,
          "inputs": [{
            "name": "_eidasLevel",
            "type": "Eidas.EidasLevel"
          }, {
            "name": "_level",
            "type": "Eidas.EidasLevel"
          }
          ],
          "name": "atLeast",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "pure",
          "type": "function"
        }
      },
      "Owned": {
        "transfer": {
          "constant": false,
          "inputs": [{
            "name": "newOwner",
            "type": "address"
          }
          ],
          "name": "transfer",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "isOwner": {
          "constant": true,
          "inputs": [{
            "name": "addr",
            "type": "address"
          }
          ],
          "name": "isOwner",
          "outputs": [{
            "name": "",
            "type": "bool"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "owner": {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "constructor": {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      },
      "AlastriaCredentialRegistry": {
        "issuerCredentialList": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }, {
            "name": "",
            "type": "uint256"
          }
          ],
          "name": "issuerCredentialList",
          "outputs": [{
            "name": "",
            "type": "bytes32"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getSubjectCredentialList": {
          "constant": true,
          "inputs": [{
            "name": "subject",
            "type": "address"
          }
          ],
          "name": "getSubjectCredentialList",
          "outputs": [{
            "name": "",
            "type": "uint256"
          }, {
            "name": "",
            "type": "bytes32[]"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "version": {
          "constant": true,
          "inputs": [],
          "name": "version",
          "outputs": [{
            "name": "",
            "type": "int256"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getSubjectCredentialStatus": {
          "constant": true,
          "inputs": [{
            "name": "subject",
            "type": "address"
          }, {
            "name": "subjectCredentialHash",
            "type": "bytes32"
          }
          ],
          "name": "getSubjectCredentialStatus",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getCredentialStatus": {
          "constant": true,
          "inputs": [{
            "name": "subjectStatus",
            "type": "uint8"
          }, {
            "name": "issuerStatus",
            "type": "uint8"
          }
          ],
          "name": "getCredentialStatus",
          "outputs": [{
            "name": "",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "pure",
          "type": "function"
        },
        "previousPublishedVersion": {
          "constant": true,
          "inputs": [],
          "name": "previousPublishedVersion",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "subjectCredentialRegistry": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }, {
            "name": "",
            "type": "bytes32"
          }
          ],
          "name": "subjectCredentialRegistry",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }, {
            "name": "URI",
            "type": "string"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getIssuerCredentialStatus": {
          "constant": true,
          "inputs": [{
            "name": "issuer",
            "type": "address"
          }, {
            "name": "issuerCredentialHash",
            "type": "bytes32"
          }
          ],
          "name": "getIssuerCredentialStatus",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "subjectCredentialList": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }, {
            "name": "",
            "type": "uint256"
          }
          ],
          "name": "subjectCredentialList",
          "outputs": [{
            "name": "",
            "type": "bytes32"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "addIssuerCredential": {
          "constant": false,
          "inputs": [{
            "name": "issuerCredentialHash",
            "type": "bytes32"
          }
          ],
          "name": "addIssuerCredential",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "updateCredentialStatus": {
          "constant": false,
          "inputs": [{
            "name": "issuerCredentialHash",
            "type": "bytes32"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "name": "updateCredentialStatus",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "deleteSubjectCredential": {
          "constant": false,
          "inputs": [{
            "name": "subjectCredentialHash",
            "type": "bytes32"
          }
          ],
          "name": "deleteSubjectCredential",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "addSubjectCredential": {
          "constant": false,
          "inputs": [{
            "name": "subjectCredentialHash",
            "type": "bytes32"
          }, {
            "name": "URI",
            "type": "string"
          }
          ],
          "name": "addSubjectCredential",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "constructor": {
          "inputs": [{
            "name": "_previousPublishedVersion",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        "SubjectCredentialDeleted": {
          "anonymous": false,
          "inputs": [{
            "indexed": false,
            "name": "subjectCredentialHash",
            "type": "bytes32"
          }
          ],
          "name": "SubjectCredentialDeleted",
          "type": "event"
        },
        "IssuerCredentialRevoked": {
          "anonymous": false,
          "inputs": [{
            "indexed": false,
            "name": "issuerCredentialHash",
            "type": "bytes32"
          }, {
            "indexed": false,
            "name": "status",
            "type": "uint8"
          }
          ],
          "name": "IssuerCredentialRevoked",
          "type": "event"
        }
      },
      "AlastriaPresentationRegistry": {
        "getPresentationStatus": {
          "constant": true,
          "inputs": [{
            "name": "subjectStatus",
            "type": "uint8"
          }, {
            "name": "receiverStatus",
            "type": "uint8"
          }
          ],
          "name": "getPresentationStatus",
          "outputs": [{
            "name": "",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "pure",
          "type": "function"
        },
        "subjectPresentationRegistry": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }, {
            "name": "",
            "type": "bytes32"
          }
          ],
          "name": "subjectPresentationRegistry",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }, {
            "name": "URI",
            "type": "string"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "updateReceiverPresentation": {
          "constant": false,
          "inputs": [{
            "name": "receiverPresentationHash",
            "type": "bytes32"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "name": "updateReceiverPresentation",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "addSubjectPresentation": {
          "constant": false,
          "inputs": [{
            "name": "subjectPresentationHash",
            "type": "bytes32"
          }, {
            "name": "URI",
            "type": "string"
          }
          ],
          "name": "addSubjectPresentation",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "getSubjectPresentationStatus": {
          "constant": true,
          "inputs": [{
            "name": "subject",
            "type": "address"
          }, {
            "name": "subjectPresentationHash",
            "type": "bytes32"
          }
          ],
          "name": "getSubjectPresentationStatus",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "version": {
          "constant": true,
          "inputs": [],
          "name": "version",
          "outputs": [{
            "name": "",
            "type": "int256"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "previousPublishedVersion": {
          "constant": true,
          "inputs": [],
          "name": "previousPublishedVersion",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getReceiverPresentationStatus": {
          "constant": true,
          "inputs": [{
            "name": "receiver",
            "type": "address"
          }, {
            "name": "receiverPresentationHash",
            "type": "bytes32"
          }
          ],
          "name": "getReceiverPresentationStatus",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getSubjectPresentationList": {
          "constant": true,
          "inputs": [{
            "name": "subject",
            "type": "address"
          }
          ],
          "name": "getSubjectPresentationList",
          "outputs": [{
            "name": "",
            "type": "uint256"
          }, {
            "name": "",
            "type": "bytes32[]"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "subjectPresentationListRegistry": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }, {
            "name": "",
            "type": "uint256"
          }
          ],
          "name": "subjectPresentationListRegistry",
          "outputs": [{
            "name": "",
            "type": "bytes32"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "updateSubjectPresentation": {
          "constant": false,
          "inputs": [{
            "name": "subjectPresentationHash",
            "type": "bytes32"
          }, {
            "name": "status",
            "type": "uint8"
          }
          ],
          "name": "updateSubjectPresentation",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "constructor": {
          "inputs": [{
            "name": "_previousPublishedVersion",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        "PresentationUpdated": {
          "anonymous": false,
          "inputs": [{
            "indexed": false,
            "name": "hash",
            "type": "bytes32"
          }, {
            "indexed": false,
            "name": "status",
            "type": "uint8"
          }
          ],
          "name": "PresentationUpdated",
          "type": "event"
        }
      },
      "AlastriaPublicKeyRegistry": {
        "getPublicKeyStatus": {
          "constant": true,
          "inputs": [{
            "name": "subject",
            "type": "address"
          }, {
            "name": "publicKey",
            "type": "bytes32"
          }
          ],
          "name": "getPublicKeyStatus",
          "outputs": [{
            "name": "exists",
            "type": "bool"
          }, {
            "name": "status",
            "type": "uint8"
          }, {
            "name": "startDate",
            "type": "uint256"
          }, {
            "name": "endDate",
            "type": "uint256"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "getCurrentPublicKey": {
          "constant": true,
          "inputs": [{
            "name": "subject",
            "type": "address"
          }
          ],
          "name": "getCurrentPublicKey",
          "outputs": [{
            "name": "",
            "type": "string"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "deletePublicKey": {
          "constant": false,
          "inputs": [{
            "name": "publicKey",
            "type": "string"
          }
          ],
          "name": "deletePublicKey",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "addKey": {
          "constant": false,
          "inputs": [{
            "name": "publicKey",
            "type": "string"
          }
          ],
          "name": "addKey",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "version": {
          "constant": true,
          "inputs": [],
          "name": "version",
          "outputs": [{
            "name": "",
            "type": "int256"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "previousPublishedVersion": {
          "constant": true,
          "inputs": [],
          "name": "previousPublishedVersion",
          "outputs": [{
            "name": "",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "publicKeyList": {
          "constant": true,
          "inputs": [{
            "name": "",
            "type": "address"
          }, {
            "name": "",
            "type": "uint256"
          }
          ],
          "name": "publicKeyList",
          "outputs": [{
            "name": "",
            "type": "string"
          }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        "revokePublicKey": {
          "constant": false,
          "inputs": [{
            "name": "publicKey",
            "type": "string"
          }
          ],
          "name": "revokePublicKey",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        "constructor": {
          "inputs": [{
            "name": "_previousPublishedVersion",
            "type": "address"
          }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        "PublicKeyDeleted": {
          "anonymous": false,
          "inputs": [{
            "indexed": false,
            "name": "publicKey",
            "type": "string"
          }
          ],
          "name": "PublicKeyDeleted",
          "type": "event"
        },
        "PublicKeyRevoked": {
          "anonymous": false,
          "inputs": [{
            "indexed": false,
            "name": "publicKey",
            "type": "string"
          }
          ],
          "name": "PublicKeyRevoked",
          "type": "event"
        }
      }

    }
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
