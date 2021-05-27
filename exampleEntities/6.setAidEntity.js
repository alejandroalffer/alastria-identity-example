const {transactionFactory, UserIdentity} = require('alastria-identity-lib')
const Web3 = require('web3')
const fs = require('fs')
const keythereum = require('keythereum')

const rawdata = fs.readFileSync('../configuration.json')
const configData = JSON.parse(rawdata)

// Init your blockchain provider
const myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

const keyDataFirstIdentity = fs.readFileSync('../keystores/firstIdentity-643266eb3105f4bf8b4f4fec50886e453f0da9ad.json')
const keystoreDataFirstIdentity = JSON.parse(keyDataFirstIdentity)

const firstIdentityKeyStore = keystoreDataFirstIdentity

let firstIdentityPrivateKey
try {
  firstIdentityPrivateKey = keythereum.recover(
    configData.addressPassword,
    firstIdentityKeyStore
  )
} catch (error) {
  console.log('ERROR: ', error)
  process.exit(1)
}

const firstIdentityIdentity = new UserIdentity(web3, `0x${firstIdentityKeyStore.address}`, firstIdentityPrivateKey)

// ------------------------------------------------------------------------------
console.log('\n ------ Setting entity Aid ------ \n')

	if(configData.subject1 === undefined) {
		console.log('You must create an Alastria ID')
		process.exit()
    }
    
    async function mainSetAidEntity(){
        console.log('\n ------ Example of setting AID of entity1 like a Entity ------ \n')
        const transactionEntityAid = await transactionFactory.alastriaNameService.setUrlCreateAID(
            web3, 
            configData.didEntity1, 
            "www.NombreEntidad.com/AID"
        )
        const getKnownTxEntityAid = await firstIdentityIdentity.getKnownTransaction(
            transactionEntityAid
        )
        web3.eth
            .sendSignedTransaction(getKnownTxEntityAid)
            .on('transactionHash', function (hashSetAidEntity) {
                console.log("HASH: ", hashSetAidEntity)
            })
            .on('receipt', function (receiptSetAidEntity) {
                console.log("RECEIPT: ", receiptSetAidEntity)
            })
            .on('error', function (error) {
                console.error(error)
                process.exit(1);
            });// If this is a revert, probably this Subject (address) is already a SP
    }
    
    mainSetAidEntity()
