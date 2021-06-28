const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const ethers = require('ethers');

const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)

const presentationHashData = fs.readFileSync(`./PSMHashEntity2.json`)
const presentationHash = JSON.parse(presentationHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))


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
}

const entity2Identity = new UserIdentity(
  web3,
  `0x${entity2Address}`,
  entity2PrivateKey
)

const updateEntity2Presentation =
  transactionFactory.presentationRegistry.updateReceiverPresentation(
    web3,
    presentationHash.psmhash,
    configData.updateEntity2PresentationTo
  )

if (configData.didEntity2 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

async function main() {
  const updateReceivP = await entity2Identity.getKnownTransaction(
    updateEntity2Presentation
  )
  console.log(
    '(updateEntity2Presentation)The transaction bytes data is: ',
    updateReceivP
  )
  web3.eth.sendSignedTransaction(updateReceivP).then(() => {
    const presentationStatus =
      transactionFactory.presentationRegistry.getReceiverPresentationStatus(
        web3,
        configData.didEntity2,
        presentationHash.psmhash
      )

    web3.eth.call(presentationStatus).then((result) => {
      const resultStatus = web3.eth.abi.decodeParameters(
        ['bool', 'uint8'],
        result
      )
      const presentationStatus = {
        exist: resultStatus[0],
        status: resultStatus[1]
      }
      console.log(
        'presentationStatus of the entity2------>',
        presentationStatus
      )
    })
  })
}

main()
