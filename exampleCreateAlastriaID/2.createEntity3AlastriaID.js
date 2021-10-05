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

const mnemonicE3 = configData.mnemonicE3;
let entity3PrivateKey
let entity3PublicKey
let entity3Address
try {
  entity3PrivateKey =  ethers.Wallet.fromMnemonic(mnemonicE3).privateKey.substr(2);
  entity3PrivateKey0x =  ethers.Wallet.fromMnemonic(mnemonicE3).privateKey;
  entity3PublicKey = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicE3).privateKey).substr(2);
  entity3PublicKey0x = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicE3).privateKey);
  entity3Address = ethers.Wallet.fromMnemonic(mnemonicE3).address.substr(2);

} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const entity3Identity = new UserIdentity(
  web3,
  `0x${entity3Address}`,
  entity3PrivateKey
)

console.log(
  '\n ------ Example of creating an Alastria ID for a Entity3 with Entity1. ------ \n'
)
// (In this example the Entity1 is not added as service provider or issuer, only is the AlastriaIDentity creation)

function preparedAlastriaId() {
  const preparedId = transactionFactory.identityManager.prepareAlastriaID(
    web3,
    `0x${entity3Address}`
  )
  return preparedId
}

function createAlastriaId() {
  const txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(
    web3,
    entity3PublicKey
  )
  return txCreateAlastriaID
}

console.log(
  '\n ------ A promise all where prepareAlastriaID and createAlsatriaID transactions are signed and sent ------ \n'
)
async function main() {
  // At the beggining, the Entity1 should create an AT, sign it and send it to the wallet
  const at = tokensFactory.tokens.createAlastriaToken(
    configData.didEntity1,
    configData.providerURL,
    configData.callbackURL,
    configData.networkId,
    configData.tokenExpTime,
    configData.kidCredential,
    entity3PublicKey0x,
    configData.tokenActivationDate,
    configData.jsonTokenId
  )
  const signedAT = tokensFactory.tokens.signJWT(at, entity1PrivateKey)
  console.log('\tsignedAT: \n', signedAT)

  const createResult = await createAlastriaId()
  const signedCreateTransaction = await entity3Identity.getKnownTransaction(
    createResult
  )

  // Then, the entity3, also from the wallet should build an AIC wich contains the signed AT, the signedTx and the entity3 Public Key
  const aic = tokensFactory.tokens.createAIC(
    [],
    [],
    signedCreateTransaction,
    signedAT,
    entity3PublicKey0x
  )
  const signedAIC = tokensFactory.tokens.signJWT(aic, entity3PrivateKey)
  console.log('\tsignedAIC: \n', signedAIC)

  // Then, Entity1 receive the AIC. It should decode it and verify the signature with the public key.
  // It can extract from the AIC all the necessary data for the next steps:
  // wallet address (from public key ir signst tx), entity3 public key, the tx which is signed by the entity3 and the signed AT

  // Below, it should build the tx prepareAlastriaId and sign it
  const prepareResult = await preparedAlastriaId()
  const signedPreparedTransaction = await entity1Identity.getKnownTransaction(
    prepareResult
  )

  // At the end, Entity1 should send both tx (prepareAlastriaId and createAlastriaID, in that order) to the blockchain as it follows:
  console.log('---->signedCreateTransaction<----', signedCreateTransaction)
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
              to: config.alastriaIdentityManager,
              data: web3.eth.abi.encodeFunctionCall(
                config.contractsAbi.AlastriaIdentityManager.identityKeys,
                [`0x${entity3Address}`]
              )
            })
            .then((AlastriaIdentity) => {
              console.log(
                `alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`
              )
              configData.entity3 = `0x${AlastriaIdentity.slice(26)}`
              fs.writeFileSync(
                '../configuration-b.json',
                JSON.stringify(configData, null, 4)
              )
              const alastriaDID = tokensFactory.tokens.createDID(
                configData.network,
                AlastriaIdentity.slice(26),
                configData.networkId
              )
              configData.didEntity3 = alastriaDID
              fs.writeFileSync(
                '../configuration-b.json',
                JSON.stringify(configData, null, 4)
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
