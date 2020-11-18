var keythereum = require("keythereum");
var md5 = require("nodejs-md5");

try {
    var password = "PassWord";
    var options = {
        kdf: "scrypt",
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: "hmac-sha256"
        }
    };

    var dk = keythereum.create();
    var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
    keythereum.exportToFile(keyObject);
    console.log({ address: "0x" + keyObject.address, prikey: dk.privateKey.toString('hex') });
} catch (e) {
    console.log(e);
}
