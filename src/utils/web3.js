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
let web3 = null
// const web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${apiKey}`))
if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  try {
    // Request account access if needed
    await window.ethereum.enable();
    // Accounts now exposed
  } catch (error) {
    console.error(error);
  }
}
// Fallback to localhost; use dev console port by default...
else {
  web3 = new Web3(new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${apiKey}`))
  console.log('No web3 instance injected, using Local web3.');
}



// const signer = web3.eth.accounts.privateKeyToAccount(privateKey)
// web3.eth.accounts.wallet.add(signer)
// web3.account = signer.address
export default web3
