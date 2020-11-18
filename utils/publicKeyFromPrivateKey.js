const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
const fs = require('fs');
const keythereum = require('keythereum');
const password = 'Passw0rd';
const adminPath = '../dev-tools/deployContracts/mocked-identity-keys/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11';

let pk = keythereum.recover(password, JSON.parse(fs.readFileSync(adminPath, 'utf8')))
console.log("PrivK " + pk.toString('hex'))
console.log("PubK "+privateKeyToPublicKey(Buffer.from(pk, 'hex')).toString('hex'))
