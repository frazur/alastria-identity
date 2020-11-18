
const Web3 = require('web3')
const fs = require('fs')
const solc = require('solc')

let rawdata = fs.readFileSync('./config.json')
let config = JSON.parse(rawdata)

let web3
let nodeUrl = config.nodeURLAlastria  // you can change the URL node in config.

web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl))

let solidityEidas = fs.readFileSync(config.contractEidas, 'utf8')
let solidityManager = fs.readFileSync(config.contractManager, 'utf8')
let address = web3.eth.accounts[config.addressPosition]  // you can change the address in config
console.log("Address[2] " +address)
let password = config.addressPwdAlastria  // you can change the password address in config

function unlockAccount() {
  web3.personal.unlockAccount(address, password)
}

function lockAcount() {
  web3.personal.lockAccount(address)
}

function compileContract(solidity) {
  console.log('Compiling Contract ...')
  return new Promise((resolve, reject) => {
    let output = solc.compile(solidity, 1);
    let results = {};
    if (!output.contracts) {
      console.log(`Error compiling solidity -> ${output.errors.toString()}`);
      reject(output.errors.toString());
    } else {
      var promises = [];
      for(var contractName in output.contracts){
        var result = {
          name: contractName.substr(1, contractName.length).split(':').pop(),
          hexBytecode: output.contracts[contractName].bytecode,
          abi: JSON.parse(output.contracts[contractName].interface)
        };
        var parseContractName = contractName.split(':'); //Este split es porque el solc añade : al nombre del contrato
        if(parseContractName.length > 1){
          results[parseContractName[1]] = result;
        }
        else{
          results[parseContractName[0]] = result;
        }
        promises.push(result)
      }
      resolve(promises)
    }
  })
}

function deployEidas(address, compiled) {
  console.log('Deploying Eidas Contract ...')
  return new Promise((resolve, reject) => {
    let contractObject
    compiled.map(item => {
      if(item['name'] === 'Eidas') {
        contractObject = item
      }
    })
    let hexByteCode = `0x${contractObject.hexBytecode}`
    let abi = contractObject.abi
    let contractFactory = web3.eth.contract(abi);
    contractFactory.new({
      from: address,
      data: hexByteCode,
      gas: 200000
    }, function(e, contract) {
      if(typeof contract.address !== 'undefined') {
        resolve(contract.address)
      }
    })
  })
}

function deployManager(address, compiled, contractEidas) {
  console.log('Deploying Manager Contract ...')
  return new Promise((resolve, reject) => {
    let symbol = config.symbolEidas
    let eidasAddress = contractEidas.substr(2)
    let hexByteCode, abi, contractObject
    compiled.map(item => {
      if(item['name'] === 'AlastriaIdentityManager') {
        contractObject = item
      }
    })
    hexByteCode = `0x${contractObject.hexBytecode.split(symbol).join(eidasAddress)}`
    abi = contractObject.abi
    let contractFactory = web3.eth.contract(abi);
    contractFactory.new({
      from: address,
      data: hexByteCode,
      gas: 6721975
    }, function(e, contract) {
      if(typeof contract.address !== 'undefined') {
        let body = {
          from: address,
          to: contract.address
        }
        let addresses = {
          credentialRegistry: contract.alastriaCredentialRegistry.call(body),
          presentationRegistry: contract.alastriaPresentationRegistry.call(body),
          publicKeyRegistry: contract.alastriaPublicKeyRegistry.call(body),
          identityManager: contract.address
        }
        resolve(addresses)
      }
    })
  })
}

function saveABIs(data) {
  let contractAbiName, type
  let contractName = data.name
  let contractABI = JSON.stringify(data.abi)
  if (contractName == 'Eidas' || contractName == 'Owned') {
    type = 'libs'
  } else if (contractName === 'AlastriaCredentialRegistry' || contractName === 'AlastriaPresentationRegistry' || contractName === 'AlastriaPublicKeyRegistry') {
    type = 'registry'
  } else {
    type = 'identityManager'
  }
  contractAbiName = `__contracts_${type}_${contractName}_sol_${contractName}.abi`
  fs.writeFile(`${config.abisPath}${contractAbiName}`, contractABI, error => {
    if(error) throw error;
  })
  contractAbiName = `__contracts_${type}_${contractName}_sol_${contractName}.abi`
  fs.writeFile(`${config.abisPath}${contractAbiName}`, contractABI, error => {
    if(error) throw error;
  })

}

function saveAddresesInfo(address, contracsName) {
  let contracInfo, contractInfoHeaders
  let urlABI = config.urlABI
  let contractName = contracsName
  contractInfoHeaders = `| Contract Name | Address | ABI |\n| :------------ | :-------| :--- |\n`
  if (contractName == 'Eidas' || contractName == 'Owned') {
    type = 'libs'
  } else if (contractName === 'AlastriaCredentialRegistry' || contractName === 'AlastriaPresentationRegistry' || contractName === 'AlastriaPublicKeyRegistry') {
    type = 'registry'
  } else {
    type = 'identityManager'
  }
  contractAbiName = `__contracts_${type}_${contractName}_sol_${contractName}.abi`
  contracInfo = `| ${contractName} | ${address} | ${urlABI}${contractAbiName} |\n`
  if (contractName == 'Eidas') {
    fs.writeFile(config.contractInfoPath, contractInfoHeaders, function(err) {
      if(err) throw err;
    })
    console.log("EIDAS contractInfo "+contracInfo)
    fs.appendFile(config.contractInfoPath, contracInfo, function(err) {
      if(err) throw err;
      console.log(`${contractName} address info saved!`)
    })
  } else {
    fs.appendFile(config.contractInfoPath, contracInfo, function(err) {
      if(err) throw err;
      console.log(`${contractName} address info saved!`)
    })
  }
}

async function init() {
  console.log('Starting compiling contracs')
  compileContract(solidityEidas)
  .then(compiledEidas => {
    compiledEidas.map(item => {
      if(item['name'] === 'Eidas') {
        eidasData = item
      }
    })
    console.log('Contract Eidas compiled successfuly')
    unlockAccount()
    deployEidas(address, compiledEidas)
    .then(eidas => {
      console.log('Contract Eidas deployed successfuly. Address: ', eidas)
      contractEidas = eidas
      saveABIs(eidasData)
      console.log(`Eidas ABI saved!`)
      saveAddresesInfo(contractEidas, config.eidas)
      compileContract(solidityManager)
      .then(compiledManager => {
        compiledManager.map(item => {
          saveABIs(item)
          console.log(`${item['name']} ABI saved!`)
        })
        console.log('Contract Manager compiled successfuly')
        deployManager(address, compiledManager, contractEidas)
        .then(addresses => {
          lockAcount()
          saveAddresesInfo(addresses.identityManager, config.manager)
          saveAddresesInfo(addresses.credentialRegistry, config.credential)
          saveAddresesInfo(addresses.presentationRegistry, config.presentation)
          saveAddresesInfo(addresses.publicKeyRegistry, config.publicKey)
          console.log('Contract AlastriaIdentityManager deployed successfuly. Address: ', addresses.identityManager)
          console.log('Contract AlastriaCredentialRegistry deployed successfuly. Address: ', addresses.credentialRegistry)
          console.log('Contract AlastriaPresentationRegistry deployed successfuly. Address: ', addresses.presentationRegistry)
          console.log('Contract AlastriaPublicKeyManager deployed successfuly. Address: ', addresses.publicKeyRegistry)
        })
        .catch(error => {
          lockAcount()
          console.log('ERROR ------> ', error)
        })
      })
      .catch(error => {
        console.log('ERROR ------> ', error)
      })
    })
    .catch(error => {
      console.log('ERROR ------> ', error)
    })
  })
  .catch(error => {
    console.log('ERROR ------> ', error)
  })
}

init()
