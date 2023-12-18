<template>
  <div class="mt-3 text-center">
    <el-input v-model="amount" class="!w-48"></el-input>
    <el-button @click="send()">Send</el-button>
  </div>
</template>
<script>
import web3 from '@/utils/web3'

const network = localStorage.getItem('net')
export default {
  name: 'SendPage',
  data() {
    return {
      amount: null
    }
  },
  methods: {
    async send() {
      
      if (this.amount > 2) return
      const accounts = await web3.eth.getAccounts()
      const tx = {
        from: accounts[0],
        to: '0xda954dF4280DF0afA7cE62C1683bcC085557CA7b',
        value: web3.utils.toWei(this.amount)
      }
      tx.gas = await web3.eth.estimateGas(tx)
      const receipt = await web3.eth.sendTransaction(tx).once('transactionHash', (txhash) => {
        console.log(txhash)
        console.log(`Mining transaction ...`)
        console.log(`https://${network}.etherscan.io/tx/${txhash}`)
        
      })
      // The transaction is now on chain!

      console.log(receipt);
      console.log(`Mined in block ${receipt.blockNumber}`)
      console.log(`${window.location.origin}/transaction/${receipt.transactionHash}`)
      console.log(`${window.location.origin}/block/${receipt.blockNumber}`)
    }
  }
}
</script>
