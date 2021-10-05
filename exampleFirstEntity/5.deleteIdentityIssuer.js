const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')
const ethers = require('ethers');
const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)


// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))
const mnemonicfirstID = configData.mnemonicFirstID;
let firstIDPrivateKey
let firstIDPublicKey
let firstIDAddress
try {
  firstIDPrivateKey =  ethers.Wallet.fromMnemonic(mnemonicfirstID).privateKey.substr(2);
  firstIDPrivateKey0x =  ethers.Wallet.fromMnemonic(mnemonicfirstID).privateKey;
  firstIDPublicKey = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicfirstID).privateKey).substr(2);
  firstIDPublicKey0x = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicfirstID).privateKey);
  firstIDAddress = ethers.Wallet.fromMnemonic(mnemonicfirstID).address.substr(2);

} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const firstIdentityIdentity = new UserIdentity(web3, `0x${firstIDAddress}`, firstIDPrivateKey)


// Im not sure if this is needed
async function unlockAccount() {
  const unlockedAccount = await web3.eth.personal.unlockAccount(
    firstIDAddress,
    configData.addressPassword,
    500
  )
  console.log('Account unlocked:', unlockedAccount)
  return unlockedAccount
}

async function mainDel() {
  unlockAccount()
  console.log('\n ------ Example of deleting the entity1 like Issuer ------ \n')
  const transactionD = await transactionFactory.identityManager.deleteIdentityIssuer(
    web3,
    configData.didEntity1
  )
  console.log('transaction', transactionD)
  const getKnownTxD = await firstIdentityIdentity.getKnownTransaction(transactionD)
  console.log('The transaction bytes data is: ', getKnownTxD)
  web3.eth
    .sendSignedTransaction(getKnownTxD)
    .on('transactionHash', function (hashD) {
      console.log('HASH: ', hashD)
    })
    .on('receipt', function (receiptD) {
      console.log('RECEIPT: ', receiptD)
    })
    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    })
}
mainDel()
