const keythereum    = require('keythereum')

let privateKey = "50c1e2076a6b85073a8958540bfe908995cd59bcf35d3dde5ff4e0d8cc3184bb"

var password = "Passw0rd";
var options = {
    kdf: "scrypt",
    cipher: "aes-128-ctr",
    kdfparams: {
        c: 262144,
        dklen: 32,
        prf: "hmac-sha256"
    }
};


var dk = keythereum.create() // creates a sample key

dk.privateKey = privateKey

let keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options)
keythereum.exportToFile(keyObject);

console.log(keyObject)