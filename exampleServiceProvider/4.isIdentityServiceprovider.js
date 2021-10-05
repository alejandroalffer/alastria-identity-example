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

async function main() {
  unlockAccount()
  console.log(
    '\n ------ Example of asking for isIdentityServiceProvider ------ \n'
  )
  const isServiceProvider =
    await transactionFactory.identityManager.isIdentityServiceProvider(
      web3,
      configData.didEntity2
    )
  console.log('isServiceProviderTransaction', isServiceProvider)
  web3.eth.call(isServiceProvider).then((isServiceProviderStatus) => {
    const result = web3.eth.abi.decodeParameter('bool', isServiceProviderStatus)
    console.log('isServiceProvider? ----->', result)
  })
}

main()
