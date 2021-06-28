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

const mnemonicE1 = configData.mnemonicE1;
let entity1PrivateKey
let entity1PublicKey
let entity1Address
try {
  entity1PrivateKey =  ethers.Wallet.fromMnemonic(mnemonicE1).privateKey.substr(2);
  entity1PrivateKey0x =  ethers.Wallet.fromMnemonic(mnemonicE1).privateKey;
  entity1PublicKey = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicE1).privateKey).substr(2);
  entity1PublicKey0x = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicE1).privateKey);
  entity1Address = ethers.Wallet.fromMnemonic(mnemonicE1).address.substr(2);

} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const entity1Identity = new UserIdentity(
  web3,
  `0x${entity1Address}`,
  entity1PrivateKey
)

// Im not sure if this is needed
async function unlockAccount() {
  const unlockedAccount = await web3.eth.personal.unlockAccount(
    entity1Address,
    configData.addressPassword,
    500
  )
  console.log('Account unlocked:', unlockedAccount)
  return unlockedAccount
}

async function mainAddEntity() {
  unlockAccount()
  console.log('\n ------ Example of adding the entity1 like a Entity ------ \n')
  const transactionAddEntity = await transactionFactory.identityManager.addEntity(
    web3,
    configData.didEntity2,
    configData.entityData2.name,
    configData.entityData2.cif,
    configData.entityData2.urlLogo,
    configData.entityData2.urlCreateAID,
    configData.entityData2.urlAOA
  )
  const getKnownTxAddEntity = await entity1Identity.getKnownTransaction(
    transactionAddEntity
  )
  console.log('The transaction bytes data is: ', getKnownTxAddEntity)
  web3.eth
    .sendSignedTransaction(getKnownTxAddEntity)
    .on('transactionHash', function (hashAddEntity) {
      console.log('HASH: ', hashAddEntity)
    })
    .on('receipt', function (receiptAddEntity) {
      console.log('RECEIPT: ', receiptAddEntity)
    })

    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    }) // If this is a revert, probably this Subject (address) is already a SP
}

mainAddEntity()
