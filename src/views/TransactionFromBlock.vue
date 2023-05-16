<template>
  <div class="home-page">
    <el-skeleton v-if="loading" :rows="6" animated />
    <div v-else class="list">
      <div class="transaction-list">
        <span>{{ transactions.length }} transactions from block {{ $route.params.id }}</span>
        <div class="transaction">
          <strong class="hash">Txn Hash</strong>
          <strong class="hash">Block</strong>
          <strong class="hash">Age</strong>
          <strong class="hash">From</strong>
          <strong class="hash">To</strong>
          <strong class="hash">Value</strong>
          <!-- <strong class="hash">Txn Fee</strong> -->
        </div>
        <div class="transaction" v-for="tran in transactionsDetail" :key="tran.hash">
          <span class="hash link" @click="goToTransaction(tran.hash)">{{ tran.hash }}</span>
          <span class="hash"
            ><span class="link" @click="goToBlock(tran.blockNumber)">{{
              tran.blockNumber
            }}</span></span
          >
          <span class="hash">
            <el-tooltip :content="timeFrom(block.timestamp)" placement="top">
              <span>{{ timeAge(block.timestamp) }}</span>
            </el-tooltip>
          </span>
          <span class="hash">{{ tran.from }}</span>
          <span class="hash">{{ tran.to }}</span>
          <span class="hash">{{ value(tran.value) }}</span>
        </div>
        <el-pagination
          :current-page="page"
          @current-change="(val) => (page = val)"
          background
          layout="prev, pager, next"
          :total="transactions.length"
          :page-size="10"
          class="my-10"
        />
      </div>
    </div>
  </div>
</template>
  <script>
import web3 from '@/utils/web3'
import moment from 'moment'
import { useAddressStore } from '../stores/address.js'
import { getModel } from '../api.js'
const sepoliaKey = import.meta.env.VITE_SEPOLIA_KEY
export default {
  name: 'HomePage',
  data() {
    return {
      balance: null,
      page: 1,
      total: 0,
      startblock: 0,
      endblock: 99999999,
      loading: true,
      transactions: [],
      transactionsDetail: [],
      block: {}
    }
  },
  computed: {
    totalPage() {
      return Math.ceil(this.transactions?.length / 10)
    }
  },
  watch: {
    '$route.params.id': {
      handler(id) {
        this.getTransactions(id)
      },
      deep: true,
      immediate: true
    },
    page() {
      this.loading = true
      this.transactionsList()
    }
  },
  methods: {
    async getTransactions(id) {
      const result = await web3.eth.getBlock(id)
      console.log(result)
      this.block = result
      this.transactions = result.transactions
      await this.transactionsList()
    },
    async transactionsList() {
      this.transactionsDetail = []
      const trans = this.transactions
        .reverse()
        .filter((item, index) => index >= this.page * 10 - 10 && index <= this.page * 10 - 1)
      trans.forEach(async (item) => {
        const detail = await web3.eth.getTransaction(item)
        this.transactionsDetail.push(detail)
      })
      console.log(this.transactionsDetail)
      this.loading = false
    },
    timeFrom(time) {
      return moment.unix(time).format('DD/MM/YYYY HH:mm:ss')
    },
    goToBlock(block) {
      this.$router.push({ name: 'block', params: { id: block } })
    },
    changePage(page) {
      this.setPage(page)
    },
    goToTransaction(hash) {
      this.$router.push({ name: 'transaction', params: { id: hash } })
    },
    decode(data) {
      return web3.utils.stringToHex(data)
    },
    value(value) {
      return web3.utils.fromWei(value, 'ether').toString().slice(0, 10) + ' ETH'
    },
    TxnFree(gas = 1, gasPrice = 1) {
      const price = web3.utils.fromWei(gas, 'gwei') * web3.utils.fromWei(gasPrice, 'gwei')
      return price.toString().slice(0, 10)
    },
    timeAge(timeStamp) {
      return moment(moment.unix(timeStamp)).fromNow()
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
  width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.small {
  display: block;
}

.flex {
  display: flex;
  align-items: center;
}

.transaction-list {
  margin-top: 20px;
  min-width: 1000px;
}

.list {
  overflow: auto;
  padding: 15px;
}
</style>
  