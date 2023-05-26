import Web3 from 'web3'

const sepoliaNetwork = import.meta.env.VITE_SEPOLIA_NETWORK
const mainnetNetwork = import.meta.env.VITE_MAINNET_NETWORK
const apiKey = import.meta.env.VITE_INFURA_API_KEY
// const privateKey = import.meta.env.VITE_SIGNER_PRIVATE_KEY

if (!localStorage.getItem('net')) {
  localStorage.setItem('net', 'mainnet')
}
const net = localStorage.getItem('net')
const network = net === sepoliaNetwork ? sepoliaNetwork : mainnetNetwork

const web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${apiKey}`))

// const signer = web3.eth.accounts.privateKeyToAccount(privateKey)
// web3.eth.accounts.wallet.add(signer)
// web3.account = signer.address
export default web3
