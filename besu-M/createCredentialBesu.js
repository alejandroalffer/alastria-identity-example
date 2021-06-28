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

  // Recover entity1a mnemonic from configuration-b.json
  const mnemonic = configData.mnemonic;

  // Compute private key, public key and address data from mnemonic
  try {
    entity1aPrivateKey =  ethers.Wallet.fromMnemonic(mnemonic).privateKey.substr(2);
    entity1aPublicKey = ethers.utils.computePublicKey(ethers.Wallet.fromMnemonic(mnemonic).privateKey).substr(2);
    entity1aAddress = ethers.Wallet.fromMnemonic(mnemonic).address.substr(2);
    console.log('Private key: ', entity1aPrivateKey)
    console.log('Public key: ', entity1aPublicKey)
    console.log('Address: ', entity1aAddress)
  
    web3
  } catch (error) {
    console.error('ERROR: ', error)
    process.exit(1)
  }

  const entity1aIdentity = new UserIdentity(
    web3,
    `0x${entity1aAddress}`,
    entity1aPrivateKey
  )