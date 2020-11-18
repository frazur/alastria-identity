const keythereum    = require('keythereum')

let privateKey = "7298966f01ab1970b85fa3a40d03a2d9900a84b2d42c1b5d78d0f3ede7df375f"

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