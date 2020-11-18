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
    // prepareAlastriaID with EoA admin address
    const tx1 = await imInstance.prepareAlastriaID(adminAccount.address);
    console.log("tx1", tx1);
    // createAlastriaIdentity with the admin public key (ABI encoded)
    const tx2 = await imInstance.createAlastriaIdentity("0x50382c1a0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008230786132363733653633623932303732653562316337313537316532323433396532393462613361333635313666656530633736356363376132643338613163363662346331613762313434396239313336383636613635346538346134326666383134633666646161313630313666303035326461396530646462613330656165000000000000000000000000000000000000000000000000000000000000");
    console.log("tx2", tx2);
    // addIdentityIssuer with the admin proxy address and eidas level
    //const tx3 = await imInstance.addIdentityIssuer(proxyAddress, 3);
    //console.log("tx3", tx3);
  } catch (error) {
    console.log(error);
  }
}
