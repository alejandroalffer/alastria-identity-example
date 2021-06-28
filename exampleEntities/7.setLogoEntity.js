const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')
const ethers = require('ethers');

const rawdata = fs.readFileSync('../configuration-b.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

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

// ------------------------------------------------------------------------------
console.log('\n ------ Setting entity Logo ------ \n')

	if(configData.subject1 === undefined) {
		console.error('You must create an Alastria ID')
		process.exit(1)
    }

    async function mainSetLogoEntity(){
        console.log('\n ------ Example of setting Logo of entity1 like a Entity ------ \n')
        const transactionEntityLogo = await transactionFactory.identityManager.setUrlLogo(
            web3, 
            configData.didEntity1, 
            "www.NombreEntidad.com/logo"
        )
        const getKnownTxEntityLogo = await firstIdentityIdentity.getKnownTransaction(
            transactionEntityLogo
        )
        web3.eth
            .sendSignedTransaction(getKnownTxEntityLogo)
            .on('transactionHash', function (hashSetLogoEntity) {
                console.log("HASH: ", hashSetLogoEntity)
            })
            .on('receipt', function (receiptSetLogoEntity) {
                console.log("RECEIPT: ", receiptSetLogoEntity)
            })
            .on('error', function (error) {
                console.error(error)
                process.exit(1);
            });// If this is a revert, probably this Subject (address) is already a SP
    }
    
    mainSetLogoEntity()

