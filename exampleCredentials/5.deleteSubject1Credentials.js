const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration-b.json')
const ethers = require('ethers');

const configData = JSON.parse(rawdata)

const subjectHashData = fs.readFileSync(`./PSMHashSubject1.json`)
const credentialHash = JSON.parse(subjectHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const deleteCredentialStatus =
  transactionFactory.credentialRegistry.deleteSubjectCredential(
    web3,
    credentialHash.psmhash
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
  const deleteCredStat = await subject1Identity.getKnownTransaction(
    deleteCredentialStatus
  )
  console.log(
    '(deleteCredentialStatus)The transaction bytes data is: ',
    deleteCredStat
  )
  web3.eth.sendSignedTransaction(deleteCredStat).then(() => {
    const subjectCredentialTransaction =
      transactionFactory.credentialRegistry.getSubjectCredentialStatus(
        web3,
        configData.didSubject1,
        credentialHash.psmhash
      )
    web3.eth
      .call(subjectCredentialTransaction)
      .then((SubjectCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          SubjectCredentialStatus
        )
        const credentialStatus = {
          exists: result[0],
          status: result[1]
        }
        console.log('(SubjectCredentialStatus) -----> ', credentialStatus)
      })
  })
}

main()
