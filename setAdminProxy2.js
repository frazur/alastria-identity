const IdentityManager = artifacts.require("AlastriaIdentityManager");

const fs = require("fs");
const path = require("path");
const ethers = require("ethers");
// Admin keystore
const adminPath = path.resolve('./utils/keystore/account2.json');
// Identity Manager Address
const imAddress = "0x7678f4289e2a6ce4295a1040b415784624a6cb60";

module.exports = async function () {
  try {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    let adminKeystore = fs.readFileSync(adminPath, 'utf-8');
    let adminAccount = await ethers.Wallet.fromEncryptedJson(adminKeystore, "Passw0rd",(progress)=>{
      //console.log(progress);
    });
    const wallet = adminAccount.connect(provider);
    let imInstance = new ethers.Contract(imAddress, IdentityManager.abi, wallet);

    // addIdentityIssuer with the admin proxy address and eidas level
    const tx3 = await imInstance.addIdentityIssuer("0xE8f89B73b4f8B598c429a5d0Dd17dc055dBbe02b", 3);
    console.log("tx3", tx3);
  } catch (error) {
    console.log(error);
  }
}
