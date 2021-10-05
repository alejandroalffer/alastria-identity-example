const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const ethers = require('ethers');


const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)

const presentationHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const presentationHash = JSON.parse(presentationHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const updateSubjectPresentation =
  transactionFactory.presentationRegistry.updateSubjectPresentation(
    web3,
    presentationHash.psmhash,
    configData.updateSubject1PresentationTo
  )

  const mnemonicS1 = configData.mnemonicS1;

  let subject1PrivateKey
  let subject1PublicKey
  let subject1Address
  try {
    subject1PrivateKey =  ethers.Wallet.fromMnemonic(mnemonicS1).privateKey.substr(2);
    subject1PrivateKey0x =  ethers.Wallet.fromMnemonic(mnemonicS1).privateKey;
    subject1PublicKey = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicS1).privateKey).substr(2);
    subject1PublicKey0x = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonicS1).privateKey);
    subject1Address = ethers.Wallet.fromMnemonic(mnemonicS1).address.substr(2);
    
} catch (error) {
  console.error('ERROR: ', error)
  process.exit(1)
}

const subject1Identity = new UserIdentity(
  web3,
  `0x${subject1Address}`,
  subject1PrivateKey
)

if (configData.didSubject1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

async function main() {
  const updateSubjP = await subject1Identity.getKnownTransaction(
    updateSubjectPresentation
  )
  console.log(
    '(updateSubjectPresentation)The transaction bytes data is: ',
    updateSubjP
  )
  web3.eth.sendSignedTransaction(updateSubjP).then(() => {
    const presentationStatus =
      transactionFactory.presentationRegistry.getSubjectPresentationStatus(
        web3,
        configData.didSubject1,
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
        'presentationStatus of the subject1 ------>',
        presentationStatus
      )
    })
  })
}

main()
