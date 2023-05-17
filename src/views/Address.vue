<template>
  <div class="home-page">
    <el-skeleton v-if="!addressType" :rows="1" animated />
    <div class="card -head" v-else>
      <div class="card-body address-info">
        <strong>{{ addressType }}</strong>
        <span class="ml-10">{{ $route.params.id }}</span>
        <Copy :text="$route.params.id" class="ml-10" />
      </div>
    </div>
    <el-skeleton v-if="!balance" :rows="2" animated />
    <div v-else class="over-view">
      <div class="balance card">
        <strong>Overview</strong>
        <p>ETH BALANCE</p>
        <small>{{ balance }} ETH</small>
      </div>
      <div class="info card">
        <strong>More Info</strong>
        <p>LAST TXN SENT</p>
        <div class="flex">
          <small v-if="transactions.length" class="hash link small">
            {{ transactions[transactions.length - 1].hash }}
          </small>
          <span v-if="transactions.length">
            {{ timeFrom(transactions[transactions.length - 1].timeStamp) }}
          </span>
        </div>
      </div>
    </div>
    <el-skeleton v-if="loading" :rows="6" animated />
    <div v-else class="list">
      <div class="transaction-list card">
        Last {{ transactions.length }} transactions
        <div class="transaction">
          <strong class="hash">Txn Hash</strong>
          <strong class="hash">Method</strong>
          <strong class="hash">Block</strong>
          <strong class="hash">Age</strong>
          <strong class="hashF">From</strong>
          <strong class="hashL">To</strong>
          <strong class="hash">Value</strong>
          <!-- <strong class="hash">Txn Fee</strong> -->
        </div>
        <div class="transaction" v-for="tran in transactionsList" :key="tran.timeStamp">
          <a :href="`/transaction/${tran.hash}`" class="hash">{{ tran?.hash }}</a>
          <!-- <span class="hash link" @click="goToTransaction(tran.hash)">{{ tran.hash }}</span> -->
          <span class="hash">{{ tran.methodId }}</span>

          <span class="hash">
            <!-- <span class="link" @click="goToBlock(tran.blockNumber)">
              {{ tran.blockNumber }}
            </span> -->
            <a :href="`/block/${tran.blockNumber}`" class="hash">{{ tran?.blockNumber }}</a>
          </span>

          <span class="hash">
            <el-tooltip :content="timeFrom(tran.timeStamp)" placement="top">
              <!-- <span>{{ timeAge(tran.timeStamp) }} </span> -->
              <p>{{ customTime(tran.timeStamp) }}</p>
            </el-tooltip>
          </span>

          <div v-if="isAddress(tran.from)" class="hashF">
            <el-tooltip :content="tran.from" placement="top">
              <span>{{ address(tran.from) }}</span>
            </el-tooltip>
            <Copy class="copy" :text="tran.from" />
            <el-tag v-if="tran.methodId === '0x' && isAddress(tran.to)" type="success">In</el-tag>
            <el-tag v-else type="warning">Out</el-tag>
          </div>
          <div v-else class="hashF">
            <el-tooltip :content="tran.from" placement="top">
              <a :href="`/address/${tran.from}`" class="text">{{ address(tran.from) }}</a>
            </el-tooltip>
            <Copy class="copy" :text="tran.from" />
            <el-tag v-if="tran.methodId === '0x' && isAddress(tran.to)" type="success">In</el-tag>
            <el-tag v-else type="warning">Out</el-tag>
          </div>

          <div v-if="isAddress(tran.to) && tran.to" class="hashL">
            <el-tooltip :content="tran.to" placement="top">
              <span>{{ address(tran.to) }}</span>
            </el-tooltip>
            <Copy class="copy" :text="tran.to" />
          </div>
          <div v-else class="hashL">
            <el-tooltip v-if="tran.to" :content="tran.to" placement="top">
              <a :href="`/address/${tran.to}`" class="text">{{ address(tran.to) }}</a>
            </el-tooltip>
            <Copy v-if="tran.to" :text="tran.to" />

            <el-tooltip v-if="tran.contractAddress" placement="top">
              <template #content> New contract<br />{{ tran.contractAddress }} </template>
              <a :href="`/address/${tran.contractAddress}`" class="text">Contract Creation</a>
            </el-tooltip>
            <Copy v-if="tran.contractAddress" :text="tran.contractAddress" />
          </div>

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
  </div>
</template>
<script>
import web3 from '@/utils/web3'
import moment from 'moment'
import { mapState, mapActions } from 'pinia'
import { useAddressStore } from '@/stores/address.js'
import { getModel } from '@/api.js'
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
      addressType: null
    }
  },
  computed: {
    ...mapState(useAddressStore, ['dataPage', 'transactions', 'tranLength', 'offset', 'time']),
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
    customTime(time) {
      const exp = moment(moment.unix(time))
      const now = moment(new Date())

      const seconds = now.diff(exp, 'seconds')
      if (seconds < 59) return now.diff(exp, 'seconds') + ' seconds ago '

      var diffMs = now - exp
      var diffDays = Math.floor(diffMs / 86400000)
      var diffHrs = Math.floor((diffMs % 86400000) / 3600000)
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)

      if (diffDays > 0) {
        if (diffHrs > 0) {
          return `${diffDays} ${diffDays > 1 ? 'days' : 'day'} ${diffHrs} ${
            diffHrs > 1 ? 'hrs ago' : 'hr ago'
          }`
        }

        if (diffHrs === 0) {
          return `${diffDays} ${diffDays > 1 ? 'days' : 'day'} ${diffMins} ${
            diffMins > 1 ? 'mins ago' : 'min ago'
          }`
        }

        return diffDays + ' day ' + diffHrs + ' hrs ago'
      }
      if (diffHrs > 0) {
        if (diffMins > 0) {
          return `${diffHrs} ${diffHrs > 1 ? 'hrs' : 'hr'} ${diffMins} ${
            diffMins > 1 ? 'mins ago' : 'min ago'
          }`
        }

        if (diffMins === 0) {
          return `${diffHrs} ${diffHrs > 1 ? 'hrs' : 'hr'}`
        }

        return diffHrs + ' hour ' + diffMins + ' mins ago'
      }
      if (diffMins > 0) {
        if (diffMins > 1) return diffMins + ' mins ago'

        return diffMins + ' min ago'
      }

      return this.timeAge(time)
    },
    isAddress(address) {
      return address.toLowerCase() === this.$route.params.id.toLowerCase()
    },
    address(address) {
      if (!address) return ''
      const text = `${address.slice(0, 8)}...${address.substr(address.length - 8)}`
      return text
    },
    timeFrom(time) {
      return moment.unix(time).format('DD/MM/YYYY HH:mm:ss')
    },
    goToBlock(block) {
      this.$router.push({ name: 'block', params: { id: block } })
    },
    ...mapActions(useAddressStore, ['setPage', 'setTransactions', 'pushTransactions', 'setTime']),
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
    },
    async getAccountInformation(address) {
      const addressCode = await web3.eth.getCode(this.$route.params.id)
      this.addressType = addressCode === '0x' ? 'Address ' : 'Contract '
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
      this.loading = false

      if (result1.data.result.length > 1 && this.transactions.length < 100000) {
        setTimeout(() => {
          this.endblock = result1.data.result[result1.data.result.length - 1].blockNumber
          const ids = new Set(this.transactions.map(({ hash }) => hash))
          const newData = result1.data.result.filter(({ hash }) => !ids.has(hash))
          this.pushTransactions(newData)
          this.getTotalTransactions(address)
          this.setTime()
        }, 250)
      } else {
        // const ids = new Set(this.transactions.map(({ hash }) => hash))
        // const selectedRows = result1.data.result.filter(({ hash }) => !ids.has(hash))
        // console.log(selectedRows)
        // // this.setTransactions(transactionList)
        // this.pushTransactions(result1.data.result)
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
  overflow: hidden;
}

.over-view {
  margin-top: 20px;
  display: grid;
  grid-template-columns: calc(50% - 10px) calc(50% - 10px);
  gap: 20px;
}

.transaction {
  display: flex;
  align-items: center;
  border-bottom: solid 1px #f0f0f0;
  padding: 10px 0;
  width: 100%;
}

.hash {
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.hashL {
  width: 170px;
  min-width: 170px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hashF {
  width: 220px;
  min-width: 220px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
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
}

.text {
  width: 135px;
}

.el-tag {
  width: 40px;
}

.address-info {
  display: flex;
  align-items: center;
}
</style>
