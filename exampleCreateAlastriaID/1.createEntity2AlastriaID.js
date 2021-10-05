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

  //web3
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}
const entity1Identity = new UserIdentity(
  web3,
  `0x${entity1Address}`,
  entity1PrivateKey
)


const mnemonicE2 = configData.mnemonicE2;
let entity2PrivateKey
let entity2PublicKey
let entity2Address
try {
  entity2PrivateKey =  ethers.Wallet.fromMnemonic(mnemonicE2).privateKey.substr(2);
  entity2PrivateKey0x =  ethers.Wallet.fromMnemonic(mnemonicE2).privateKey;
  entity2PublicKey = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicE2).privateKey).substr(2);
  entity2PublicKey0x = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicE2).privateKey);
  entity2Address = ethers.Wallet.fromMnemonic(mnemonicE2).address.substr(2);

  
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const entity2Identity = new UserIdentity(
  web3,
  `0x${entity2Address}`,
  entity2PrivateKey
)

console.log(
  '\n ------ Example of creating an Alastria ID for a Entity2 with Entity1. ------ \n'
)
// (In this example the Entity1 is not added as service provider or issuer, only is the AlastriaIDentity creation)

function preparedAlastriaId() {  
  const preparedId = transactionFactory.identityManager.prepareAlastriaID(
    web3,
    entity2Address
  )
  return preparedId
}

function createAlastriaId() {
  const txCreateAlastriaID = transactionFactory.identityManager.createAlastriaIdentity(
    web3,
    entity2PublicKey  )
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
    entity1PublicKey0x,
    configData.tokenActivationDate,
    configData.jsonTokenId
  )
  const signedAT = tokensFactory.tokens.signJWT(at, entity1PrivateKey)
  console.log('\tsignedAT: \n', signedAT)

  const createResult = await createAlastriaId()
  const signedCreateTransaction = await entity2Identity.getKnownTransaction(
    createResult
  )

  // Then, the entity2, also from the wallet should build an AIC wich contains the signed AT, the signedTx and the entity2 Public Key
  const aic = tokensFactory.tokens.createAIC(
    [],
    [],
    signedCreateTransaction,
    signedAT,
    entity2PrivateKey
  )
  const signedAIC = tokensFactory.tokens.signJWT(aic, entity2PrivateKey)
  console.log('\tsignedAIC: \n', signedAIC)

  // Then, Entity1 receive the AIC. It should decode it and verify the signature with the public key.
  // It can extract from the AIC all the necessary data for the next steps:
  // wallet address (from public key ir signst tx), entity2 public key, the tx which is signed by the entity2 and the signed AT

  // Below, it should build the tx prepareAlastriaId and sign it
  const prepareResult = await preparedAlastriaId()
  const signedPreparedTransaction = await entity1Identity.getKnownTransaction(
    prepareResult
  )

  // At the end, Entity1 should send both tx (prepareAlastriaId and createAlastriaID, in that order) to the blockchain as it follows:
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
                [`0x${entity2Address}`]
              )
            })
            .then((AlastriaIdentity) => {
              console.log(
                `alastriaProxyAddress: 0x${AlastriaIdentity.slice(26)}`
              )
              configData.entity2 = `0x${AlastriaIdentity.slice(26)}`
              fs.writeFileSync(
                '../configuration-b.json',
                JSON.stringify(configData, null, 4)
              )
              const alastriaDID = tokensFactory.tokens.createDID(
                configData.network,
                AlastriaIdentity.slice(26),
                configData.networkId
              )
              configData.didEntity2 = alastriaDID
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
