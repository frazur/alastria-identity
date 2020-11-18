const keythereum    = require('keythereum')

let privateKey = "a2494e03aee80ea9140f9827e50ef9e045af426d25f885cdabdddb3ce1f4b9fd"

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