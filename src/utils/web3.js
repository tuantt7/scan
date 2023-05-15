import Web3 from 'web3'

const network = import.meta.env.VITE_ETHEREUM_NETWORK
const apiKey = import.meta.env.VITE_INFURA_API_KEY
const privateKey = import.meta.env.VITE_SIGNER_PRIVATE_KEY

const web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${apiKey}`))

const signer = web3.eth.accounts.privateKeyToAccount(privateKey)
web3.eth.accounts.wallet.add(signer)
web3.account = signer.address
export default web3
