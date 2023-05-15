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
        <small>{{ balance }} ETH</small>
        <p>FIRST TXN SENT</p>
        <small>{{ balance }} ETH</small>
      </div>
      Total {{ total }} transactions
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
        <strong class="hash">Txn Fee</strong>
      </div>
      <div class="transaction" v-for="tran in transactions" :key="tran.timeStamp">
        <span class="hash link" @click="detailTran(tran.hash)">{{ tran.hash }}</span>
        <span class="hash">{{ tran.methodId }}</span>
        <span class="hash"><span class="link" @click="goToBlock(tran.blockNumber)">{{ tran.blockNumber }}</span></span>
        <span class="hash">{{ timeAge(tran.timeStamp) }}</span>
        <span class="hash">{{ tran.from }}</span>
        <span class="hash">{{ tran.to }}</span>
        <span class="hash">{{ value(tran.value) }}</span>
        <span class="hash">{{ TxnFree(tran.gasUsed, tran.gasPrice) }}</span>
      </div>
      <el-pagination
        v-model:current-page="dataPage"
        @current-change="changePage"
        background
        layout="prev, pager, next"
        :total="transactionList.length"
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
import { usePageStore } from '../stores/page'
// import axios from 'axios'
import { getModel } from '../../src/api.js'
export default {
  name: 'HomePage',
  data() {
    return {
      balance: null,
      page: 1,
      offset: 10000,
      total: 0,
      transactionList: []
    }
  },
  mounted() {
    // web3.eth.getBalance('0x00fDe51cC2EE327F2cB7f85EF13947f4d6E4574F').then(console.log)
    // console.log(web3.eth.accounts.wallet)
    // web3.eth.getAccounts().then(console.log)
    this.getAccountInformation()
    this.getTotalTransactions()
  },
  computed: {
    ...mapState(usePageStore, ['dataPage']),
    transactions() {
      const reverse = [...this.transactionList].reverse()
      return reverse.filter(
        (item, index) => index >= this.dataPage * 50 - 50 && index <= this.dataPage * 50 - 1
      )
    },
    totalPage() {
      console.log(Math.ceil(this.transactionList?.length / 50))
      return Math.ceil(this.transactionList?.length / 50)
    }
  },
  methods: {
    goToBlock(block) {
      this.$router.push({ path: '/block', query: { d: block } })
    },
    ...mapActions(usePageStore, ['setPage']),
    changePage(page) {
      this.setPage(page)
    },
    detailTran(hash) {
      this.$router.push({ path: '/detail', query: { hash: hash } })
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
    async getAccountInformation() {
      const result = await web3.eth.getBalance(web3.account)
      this.balance = web3.utils.fromWei(result, 'ether')
    },
    async getTotalTransactions() {
      const params = {
        module: 'account',
        action: 'txlist',
        address: '0x00fDe51cC2EE327F2cB7f85EF13947f4d6E4574F',
        startblock: 0,
        endblock: 99999999,
        page: this.page,
        offset: this.offset,
        sort: 'asc',
        apikey: '5QY5RIU768SJNJIGU2ZHX4GBFJVD5ER1AK'
      }
      const result1 = await getModel('api', params)
      if (result1.data.result.length >= this.offset) {
        setTimeout(() => {
          this.page += 1
          this.getTotalTransactions()
        }, 100)
      } else {
        if (this.page === 1) {
          this.total = result1.data.result.length
          this.getFirstAndLastTXN()
        } else {
          this.total = result1.data.result.length + this.offset * (this.page - 1)
          this.getFirstAndLastTXN()
        }
      }
    },
    async getFirstAndLastTXN() {
      // const page = Math.ceil(this.total / 100)
      const params = {
        module: 'account',
        action: 'txlist',
        address: '0x00fDe51cC2EE327F2cB7f85EF13947f4d6E4574F',
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10000,
        sort: 'asc',
        apikey: '5QY5RIU768SJNJIGU2ZHX4GBFJVD5ER1AK'
      }
      const result1 = await getModel('api', params)
      this.transactionList = JSON.parse(JSON.stringify(result1.data.result))
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
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
