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
console.log('\n ------ Setting entity name ------ \n')

	if(configData.subject1 === undefined) {
		console.log('You must create an Alastria ID')
		process.exit(1)
	}
    async function mainSetNameEntity(){
        console.log('\n ------ Example of setting name of entity1 like a Entity ------ \n')
        const transactionEntityName = await transactionFactory.identityManager.setNameEntity(
            web3, 
            configData.didEntity1, 
            "NombreEntidad"
        )
        const getKnownTxEntityName = await firstIdentityIdentity.getKnownTransaction(
            transactionEntityName
        )
        web3.eth
            .sendSignedTransaction(getKnownTxEntityName)
            .on('transactionHash', function (hashSetNameEntity) {
                console.log("HASH: ", hashSetNameEntity)
            })
            .on('receipt', function (receiptSetNameEntity) {
                console.log("RECEIPT: ", receiptSetNameEntity)
            })
            .on('error', function (error) {
                console.error(error)
                process.exit(1);
            });// If this is a revert, probably this Subject (address) is already a SP
    }

    mainSetNameEntity()
    