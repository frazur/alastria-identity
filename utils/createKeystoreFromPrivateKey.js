const keythereum    = require('keythereum')

let privateKey = "c14a74fb8c96a057727168ad98f30b8c90884131489fda2b66a47834f4dfc569"

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