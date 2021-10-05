const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)
const ethers = require('ethers');

const issuerHashData = fs.readFileSync(`./PSMHashEntity1.json`)
const credentialHash = JSON.parse(issuerHashData)

const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const updateCredentialStatus = transactionFactory.credentialRegistry.updateCredentialStatus(
  web3,
  credentialHash.psmhash,
  configData.updateIssuerCredentialTo
)
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
}

const entity1Identity = new UserIdentity(
  web3,
  `0x${entity1Address}`,
  entity1PrivateKey
)

if (configData.didEntity1 === undefined) {
  console.error('You must create an Alastria ID')
  process.exit(1)
}

async function main() {
  const updateCredStat = await entity1Identity.getKnownTransaction(
    updateCredentialStatus
  )
  console.log(
    '(updateCredentialStatus)The transaction bytes data is: ',
    updateCredStat
  )
  web3.eth.sendSignedTransaction(updateCredStat).then(() => {
    const issuerCredentialTransaction = transactionFactory.credentialRegistry.getIssuerCredentialStatus(
      web3,
      configData.didEntity1,
      credentialHash.psmhash
    )
    web3.eth
      .call(issuerCredentialTransaction)
      .then((IssuerCredentialStatus) => {
        const result = web3.eth.abi.decodeParameters(
          ['bool', 'uint8'],
          IssuerCredentialStatus
        )
        const credentialStatus = {
          exists: result[0],
          status: result[1]
        }
        console.log('(IssuerCredentialStatus) -----> ', credentialStatus)
      })
  })
}

main()
