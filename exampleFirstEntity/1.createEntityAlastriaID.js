const {
  transactionFactory,
  UserIdentity,
  config,
  tokensFactory
} = require('alastria-identity-lib')
const fs = require('fs')
const Web3 = require('web3')
const keythereum = require('keythereum')
const ethers = require('ethers');


const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)


// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

console.log(
  '\n ------ Example of prepare Alastria ID, addKey and createAlastrisID necessary to have an Alastria ID ------ \n'
)
// Data

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
// End data

function preparedAlastriaId() {
  const preparedId = transactionFactory.identityManager.prepareAlastriaID(
    web3,
    `0x${entity1Address}`
  )
  return preparedId
}

function createAlastriaId() {
  const txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(
    web3,
    entity1PublicKey
  )
  return txCreateAlastriaID
}

console.log(
  '\n ------ A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n'
)
async function main() {
  const prepareResult = await preparedAlastriaId()
  const createResult = await createAlastriaId()

  const signedPreparedTransaction = await firstIdentityIdentity.getKnownTransaction(
    prepareResult
  )
  const signedCreateTransaction = await entity1Identity.getKnownTransaction(
    createResult
  )
  web3.eth
    .sendSignedTransaction(signedPreparedTransaction)
    .on('transactionHash', function (hash) {
      console.log('HASH: ', hash)
    })
    .on('receipt', function (receipt) {
      console.log('RECEIPT: ', receipt)
      web3.eth
        .sendSignedTransaction(signedCreateTransaction)
        .on('transactionHash', function (hash) {
          console.log('HASH: ', hash)
        })
        .on('receipt', function (receipt) {
          console.log('RECEIPT: ', receipt)
          web3.eth
            .call({
              //Error here ???
              to: config.alastriaIdentityManager,
              data: web3.eth.abi.encodeFunctionCall(
                config.contractsAbi.AlastriaIdentityManager.identityKeys,
                [`0x${entity1Address}`]
              )
            })
            .then((AlastriaIdentity) => {
              console.log(
                `alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`
              )
              configData.entity1 = `0x${AlastriaIdentity.slice(26)}`
              fs.writeFileSync(
                '../configuration-b.json',
                JSON.stringify(configData)
              )
              const alastriaDID = tokensFactory.tokens.createDID(
                configData.network,
                AlastriaIdentity.slice(26),
                configData.networkId
              )
              configData.didEntity1 = alastriaDID
              fs.writeFileSync(
                '../configuration-b.json',
                JSON.stringify(configData)
              )
              console.log('the alastria DID is:', alastriaDID)
            })
        })

        .on('error', function (error) {
          console.error(error)
          process.exit(1)
        }) // If a out of gas error, the second parameter is the receipt.
    })

    .on('error', function (error) {
      console.error(error)
      process.exit(1)
    }) // If a out of gas error, the second parameter is the receipt.
}

main()
