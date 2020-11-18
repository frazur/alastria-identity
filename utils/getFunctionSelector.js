const Web3 = require('web3');
var functSelect = Web3.utils.sha3("prepareAlastriaID(address)");
console.log(functSelect.substring(0,10))

