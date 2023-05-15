<template>
  <div class="home-page">
    <div class="over-view">
      <div class="balance card">
        <strong>Overview</strong>
        <p>ETH BALANCE</p>
        <small>{{ balance }} ETH</small>
      </div>
      <div class="info card">
        <strong>More Info</strong>
        <p>LAST TXN SENT</p>
        <div class="flex">
          <small v-if="transactions.length" class="hash link small">{{
            transactions[transactions.length - 1].hash
          }}</small>
          <span v-if="transactions.length">{{
            timeFrom(transactions[transactions.length - 1].timeStamp)
          }}</span>
        </div>
        <p>FIRST TXN SENT</p>
        <div class="flex">
          <small v-if="transactions.length" class="hash link small">{{
            transactions[0].hash
          }}</small>
          <span v-if="transactions.length">{{ timeFrom(transactions[0].timeStamp) }}</span>
        </div>
      </div>
      Total {{ transactions.length }} transactions
    </div>
    <div class="transaction-list">
      <div class="transaction">
        <strong class="hash">Txn Hash</strong>
        <strong class="hash">Method</strong>
        <strong class="hash">Block</strong>
        <strong class="hash">Age</strong>
        <strong class="hash">From</strong>
        <strong class="hash">To</strong>
        <strong class="hash">Value</strong>
        <!-- <strong class="hash">Txn Fee</strong> -->
      </div>
      <div class="transaction" v-for="tran in transactionsList" :key="tran.timeStamp">
        <span class="hash link" @click="detailTran(tran.hash)">{{ tran.hash }}</span>
        <span class="hash">{{ tran.methodId }}</span>
        <span class="hash"
          ><span class="link" @click="goToBlock(tran.blockNumber)">{{
            tran.blockNumber
          }}</span></span
        >
        <span class="hash">
          <el-tooltip :content="timeFrom(tran.timeStamp)" placement="top">
            <span>{{ timeAge(tran.timeStamp) }}</span>
          </el-tooltip>
        </span>
        <span class="hash">{{ tran.from }}</span>
        <span class="hash">{{ tran.to }}</span>
        <span class="hash">{{ value(tran.value) }}</span>
        <!-- <span class="hash">{{ TxnFree(tran.gasUsed, tran.gasPrice) }}</span> -->
      </div>
      <el-pagination
        :current-page="dataPage"
        @current-change="changePage"
        background
        layout="prev, pager, next"
        :total="transactions.length"
        :page-size="50"
        class="my-10"
      />
    </div>
  </div>
</template>
<script>
import web3 from '@/utils/web3'
import moment from 'moment'
import { mapState, mapActions } from 'pinia'
import { useAddressStore } from '../stores/address.js'
import { getModel } from '../api.js'
const sepoliaKey = import.meta.env.VITE_SEPOLIA_KEY
export default {
  name: 'HomePage',
  data() {
    return {
      balance: null,
      page: 1,
      offset: 10000,
      total: 0,
      startblock: 0,
      endblock: 99999999
    }
  },
  computed: {
    ...mapState(useAddressStore, ['dataPage', 'transactions']),
    transactionsList() {
      const reverse = [...this.transactions]
      return reverse.filter(
        (item, index) => index >= this.dataPage * 50 - 50 && index <= this.dataPage * 50 - 1
      )
    },
    totalPage() {
      return Math.ceil(this.transactions?.length / 50)
    }
  },
  watch: {
    '$route.params.id': {
      handler(id) {
        this.getAccountInformation(id)
        this.getTotalTransactions(id)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    timeFrom(time) {
      return moment.unix(time).format('DD/MM/YYYY HH:mm:ss')
    },
    goToBlock(block) {
      this.$router.push({ name: 'block', params: { id: block } })
    },
    ...mapActions(useAddressStore, ['setPage', 'setTransactions', 'pushTransactions']),
    changePage(page) {
      this.setPage(page)
    },
    detailTran(hash) {
      this.$router.push({ name: 'transaction', params: { id: hash } })
    },
    decode(data) {
      return web3.utils.stringToHex(data)
    },
    value(value) {
      return web3.utils.fromWei(value, 'ether') + ' ETH'
    },
    TxnFree(gas = 1, gasPrice = 1) {
      const price = web3.utils.fromWei(gas, 'gwei') * web3.utils.fromWei(gasPrice, 'gwei')
      return price.toString().slice(0, 10)
    },
    timeAge(timeStamp) {
      return moment(moment.unix(timeStamp)).fromNow()
    },
    async getAccountInformation(address) {
      const result = await web3.eth.getBalance(address)
      this.balance = web3.utils.fromWei(result, 'ether')
    },
    async getTotalTransactions(address) {
      const params = {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: this.endblock,
        page: this.page,
        offset: this.offset,
        sort: 'desc',
        apikey: sepoliaKey
      }
      const result1 = await getModel('api', params)
      this.pushTransactions(result1.data.result)
      result1.data.result.forEach((element) => {
        delete element.confirmations
        delete element.contractAddress
        delete element.functionName
        delete element.input
        delete element.isError
        delete element.transactionIndex
        delete element.nonce
        delete element.txreceipt_status
        delete element.blockHash
        delete element.cumulativeGasUsed
      })

      if (result1.data.result.length > 1) {
        setTimeout(() => {
          this.endblock = result1.data.result[result1.data.result.length - 1].blockNumber
          this.getTotalTransactions(address)
        }, 300)
      } else {
        const transactionList = this.transactions.filter(
          (obj, index) => this.transactions.findIndex((item) => item.hash === obj.hash) === index
        )
        this.setTransactions(transactionList)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.home-page {
  max-width: 1200px;
  margin: auto;
  margin-top: 20px;
}

.over-view {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 20px;
}

.transaction {
  display: flex;
  align-items: center;
  border-bottom: solid 1px #f0f0f0;
  padding: 10px 0;
}

.hash {
  width: 14%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.small {
  display: block;
}

.flex {
  display: flex;
  align-items: center;
}
</style>
