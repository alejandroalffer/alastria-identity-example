const {
    transactionFactory,
    UserIdentity,
    tokensFactory
} = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const ethers = require('ethers');


const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)

const presentationRawData = fs.readFileSync('./mockPresentation.json')
const presentationData = JSON.parse(presentationRawData)


const Web3 = require('web3')
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const uri = configData.uri

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

const createPresentation = tokensFactory.tokens.createPresentation(
    presentationData.credentials[0].payload.iss,
    presentationData.credentials[0].payload.aud,
    presentationData.credentials[0].payload.vp['@context'],
    presentationData.credentials[0].payload.vp.verifiableCredential,
    presentationData.credentials[0].payload.vp.procUrl,
    presentationData.credentials[0].payload.vp.procHash,
    presentationData.credentials[0].payload.vp.type,
    presentationData.credentials[0].header.kid,
    presentationData.credentials[0].header.jwk,
    presentationData.credentials[0].payload.exp,
    presentationData.credentials[0].payload.nbf,
    presentationData.credentials[0].payload.jti
)
console.log('createPresentation ---------->', createPresentation)

const signedJWTPresentation = tokensFactory.tokens.signJWT(
    createPresentation,
    subject1PrivateKey
)
console.log('signedJWTPresentation ------------->', signedJWTPresentation)

const subjectPresentationHash = tokensFactory.tokens.PSMHash(
    web3,
    signedJWTPresentation,
    configData.didSubject1
)
console.log('The PSMHashSubject1 is:', subjectPresentationHash)
fs.writeFileSync(
    `./PSMHashSubject1.json`,
    JSON.stringify({
        psmhash: subjectPresentationHash,
        jwt: signedJWTPresentation
    })
)

const receiverPresentationHash = tokensFactory.tokens.PSMHash(
    web3,
    signedJWTPresentation,
    configData.didEntity2
)
console.log('The PSMHashEntity2 is:', receiverPresentationHash)
fs.writeFileSync(
    `./PSMHashEntity2.json`,
    JSON.stringify({
        psmhash: receiverPresentationHash,
        jwt: signedJWTPresentation
    })
)

const addPresentationTransaction = transactionFactory.presentationRegistry.addSubjectPresentation(
    web3,
    subjectPresentationHash,
    uri
)

async function main() {
    const subject1PresentationSigned = await subject1Identity.getKnownTransaction(
        addPresentationTransaction
    )
    console.log(
        '(subject1PresentationSigned)The transaction bytes data is: ',
        subject1PresentationSigned
    )
    web3.eth
        .sendSignedTransaction(subject1PresentationSigned)
        .on('hash', (txHash) => {
            console.log('txHash ---------->', txHash)
        })
        .on('receipt', (receipt) => {
            console.log('Receipt --------->', receipt)
        })
        .on('error', (error) => {
            console.error('ERROR ---------->', error)
            process.exit(1)
        })
}

main()
