const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
console.log(privateKeyToPublicKey(Buffer.from('50c1e2076a6b85073a8958540bfe908995cd59bcf35d3dde5ff4e0d8cc3184bb', 'hex')).toString('hex'))
