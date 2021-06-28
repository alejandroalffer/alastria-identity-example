const { tokensFactory } = require('alastria-identity-lib')
const fs = require('fs')
const keythereum = require('keythereum')
const ethers = require('ethers');

const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)


const mnemonicE1 = configData.mnemonicE1;
// Init your blockchain provider


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

console.log('\n ------ Example of Authentication ------ \n')

const alastriaToken = tokensFactory.tokens.createAlastriaToken(
  configData.didEntity1,
  configData.providerURL,
  configData.callbackURL,
  configData.networkId,
  configData.tokenExpTime,
  configData.kidCredential,
  configData.entity1Pubk,
  configData.tokenActivationDate,
  configData.jsonTokenId
)
console.log('\tThe Alastria token is: \n', alastriaToken)

// Signing the AlastriaToken
const signedAT = tokensFactory.tokens.signJWT(alastriaToken, entity1PrivateKey0x)
// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyAT = tokensFactory.tokens.verifyJWT(
  signedAT,
  entity1PublicKey
)
console.log('\tIs the signedJWT verified?', verifyAT)

const alastriaSession = tokensFactory.tokens.createAlastriaSession(
  configData.context,
  configData.didSubject1,
  subject1PublicKey0x,
  signedAT,
  configData.tokenExpTime,
  configData.tokenActivationDate,
  configData.jsonTokenId
)
console.log('\tThe Alastria session is:\n', alastriaSession)

const signedAS = tokensFactory.tokens.signJWT(
  alastriaSession,
  subject1PrivateKey
)
console.log('\tThe signedAS is:\n', signedAS)

// '04' means uncompressed key (more info at https://github.com/indutny/elliptic/issues/138)
const verifyAS = tokensFactory.tokens.verifyJWT(
  signedAS,
  subject1PublicKey
)
console.log('\tIs the signedJWT verified?', verifyAS)
