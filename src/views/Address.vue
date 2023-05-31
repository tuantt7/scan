<template>
  <div class="home-page">
    <el-skeleton v-if="!addressType" :rows="2" animated />
    <div class="card -head" v-else>
      <div class="card-body address-info">
        <strong>{{ addressType }}</strong>
        <span class="ml-10 address">{{ $route.params.id }}</span>
        <Copy :text="$route.params.id" class="ml-10" />
        <el-tag v-if="verified && isContract" class="ml-10 verify" type="success" size="large">
          Verified
          <el-icon><CircleCheck /></el-icon>
        </el-tag>
        <el-tag v-else-if="isContract" class="ml-10 verify" type="info">Not Verify</el-tag>
      </div>
    </div>
    <el-skeleton v-if="!balance" :rows="4" animated />
    <div v-else class="over-view">
      <div class="balance card">
        <strong>Overview</strong>
        <p>ETH Balance</p>
        <el-tooltip :show-after="50" :hide-after="0" :content="balance + ' ETH'" placement="top">
          <small class="ml-10">{{ ETHbalance }}</small>
        </el-tooltip>
      </div>
      <div v-if="firstTransaction" class="info card">
        <strong>More Info</strong>
        <p>First transaction sent:</p>
        <div class="txn">
          <a v-if="firstTransaction" :href="`/transaction/${firstTransaction.hash}`" class="link">
            {{ firstTransaction.hash }}
          </a>
          <p v-if="firstTransaction">
            {{ timeFrom(firstTransaction.timeStamp) }}
          </p>
        </div>
        <p v-if="transactions.length">Last transaction sent:</p>
        <div class="txn">
          <a v-if="transactions.length" :href="`/transaction/${transactions[0].hash}`" class="link">
            {{ transactions[0].hash }}
          </a>
          <p v-if="transactions.length">
            {{ timeFrom(transactions[0].timeStamp) }}
          </p>
        </div>
      </div>
    </div>
    <el-skeleton v-if="loading" :rows="6" animated />
    <el-tabs v-else v-model="view" class="view-tabs">
      <el-tab-pane label="Transactions" name="transaction">
        <div class="list">
          <div class="transaction-list card">
            Last {{ transactions.length }} transactions
            <div class="transaction">
              <strong class="hash">Txn Hash</strong>
              <strong class="hash">Method</strong>
              <strong class="hashS">Block</strong>
              <strong class="hashA">Age</strong>
              <strong class="hashF">From</strong>
              <strong class="hashL">To</strong>
              <strong class="hash">Value</strong>
              <!-- <strong class="hash">Txn Fee</strong> -->
            </div>
            <template v-if="transactionsList.length">
              <div class="transaction" v-for="tran in transactionsList" :key="tran.timeStamp">
                <div class="hash">
                  <el-icon v-if="tran.isError == '1'" class="warning"><Warning /></el-icon>
                  <a :href="`/transaction/${tran.hash}`">{{ tran?.hash }}</a>
                </div>
                <!-- <span class="hash link" @click="goToTransaction(tran.hash)">{{ tran.hash }}</span> -->
                <span class="hash">{{ txnMethod(tran.methodId, tran.functionName) }}</span>

                <span class="hashS">
                  <!-- <span class="link" @click="goToBlock(tran.blockNumber)">
              {{ tran.blockNumber }}
            </span> -->
                  <a :href="`/block/${tran.blockNumber}`" class="hash">{{ tran?.blockNumber }}</a>
                </span>

                <span class="hashA">
                  <el-tooltip
                    :show-after="50"
                    :hide-after="0"
                    :content="timeFrom(tran.timeStamp)"
                    placement="top"
                  >
                    <p>{{ fromNow(tran.timeStamp) }}</p>
                  </el-tooltip>
                </span>

                <div v-if="isAddress(tran.from)" class="hashF">
                  <el-tooltip :show-after="50" :hide-after="0" :content="tran.from" placement="top">
                    <span>{{ address(tran.from) }}</span>
                  </el-tooltip>
                  <Copy class="copy" :text="tran.from" />
                  <el-tag v-if="isAddress(tran.to)" type="success">In</el-tag>
                  <el-tag v-else type="warning">Out</el-tag>
                </div>
                <div v-else class="hashF">
                  <el-tooltip :show-after="50" :hide-after="0" :content="tran.from" placement="top">
                    <a :href="`/address/${tran.from}`" class="text">{{ address(tran.from) }}</a>
                  </el-tooltip>
                  <Copy class="copy" :text="tran.from" />
                  <el-tag v-if="isAddress(tran.to)" type="success">In</el-tag>
                  <el-tag v-else type="warning">Out</el-tag>
                </div>

                <div v-if="isAddress(tran.to) && tran.to" class="hashL">
                  <el-tooltip :show-after="50" :hide-after="0" :content="tran.to" placement="top">
                    <span>{{ address(tran.to) }}</span>
                  </el-tooltip>
                  <Copy class="copy" :text="tran.to" />
                </div>
                <div v-else class="hashL">
                  <el-tooltip
                    :show-after="50"
                    :hide-after="0"
                    v-if="tran.to"
                    :content="tran.to"
                    placement="top"
                  >
                    <a :href="`/address/${tran.to}`" class="text">{{ address(tran.to) }}</a>
                  </el-tooltip>
                  <Copy v-if="tran.to" :text="tran.to" />

                  <el-tooltip
                    :show-after="50"
                    :hide-after="0"
                    v-if="tran.contractAddress"
                    placement="top"
                  >
                    <template #content> New contract<br />{{ tran.contractAddress }} </template>
                    <a :href="`/address/${tran.contractAddress}`" class="text">Contract Creation</a>
                  </el-tooltip>
                  <Copy v-if="tran.contractAddress" :text="tran.contractAddress" />
                </div>

                <span class="hash">
                  <el-tooltip
                    :show-after="50"
                    :hide-after="100"
                    v-if="tran.value"
                    :content="toETH(tran.value) + ' ETH'"
                    placement="top"
                  >
                    {{ value(tran.value) }}
                  </el-tooltip>
                </span>
                <!-- <span class="hash">{{ TxnFree(tran.gasUsed, tran.gasPrice) }}</span> -->
              </div>
            </template>
            <template v-else>
              <span class="no-data">no data</span>
            </template>
            <el-pagination
              v-if="transactionsList.length"
              :current-page="dataPage"
              @current-change="changePage"
              background
              layout="total, prev, pager, next, jumper"
              :total="transactions.length"
              :page-size="50"
              class="my-10"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Produced Blocks" name="produced">
        <div v-if="blocks.length" class="list">
          <div v-loading="loadingBlock" class="transaction-list card">
            {{ blocks.length }} blocks of {{ totalblocks }}
            <div class="transaction">
              <strong class="hashF">Block</strong>
              <strong class="hashF">Reward</strong>
              <strong class="hashF">Age</strong>
              <!-- <strong class="hash">Txn Fee</strong> -->
            </div>
            <div class="transaction" v-for="item in blocks" :key="item.timeStamp">
              <span class="hashF">
                <a :href="`/block/${item.blockNumber}`">{{ item?.blockNumber }}</a>
              </span>

              <span class="hashF"> {{ toETH(item.blockReward) }} ETH </span>

              <!-- <span class="hashF">
                {{ fromNow(item.timeStamp) }}
              </span> -->
              <el-tooltip
                class="hashF"
                :show-after="50"
                :hide-after="0"
                :content="timeFrom(item.timeStamp)"
                placement="top"
              >
                <p>{{ fromNow(item.timeStamp) }}</p>
              </el-tooltip>

              <!-- <span class="hash">{{ TxnFree(tran.gasUsed, tran.gasPrice) }}</span> -->
            </div>
            <el-pagination
              :current-page="blockPage"
              @current-change="getMoreMined"
              background
              layout="total, prev, pager, next, jumper"
              :total="totalblocks"
              :page-size="50"
              class="my-10"
            />
          </div>
        </div>
        <span v-else class="no-data">no data</span>
      </el-tab-pane>
    </el-tabs>
    <el-backtop :visibility-height="800" />
  </div>
</template>
<script>
import web3 from '@/utils/web3'
import { fromNow } from '@/utils/helper.js'
import moment from 'moment'
import { mapState, mapActions } from 'pinia'
import { useAddressStore } from '@/stores/address.js'
import { getModel } from '@/mainApi.js'
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
      addressType: null,
      firstTransaction: null,
      view: 'transaction',
      blocks: [],
      blockPage: 1,
      totalblocks: 0,
      loadingBlock: true,
      verified: true
    }
  },
  computed: {
    ...mapState(useAddressStore, ['dataPage', 'transactions', 'tranLength', 'offset', 'time']),
    transactionsList() {
      const transactions = [...this.transactions]
      return transactions.filter(
        (item, index) => index >= this.dataPage * 50 - 50 && index <= this.dataPage * 50 - 1
      )
    },
    ETHbalance() {
      return this.balance.toString().slice(0, 15) + ' ETH'
    },
    isContract() {
      return this.addressType === 'Contract'
    }
  },
  watch: {
    '$route.params.id': {
      handler(address) {
        this.blockPage = 1
        this.setTransactions([])
        this.endblock = 99999999
        this.getAccount(address)
        this.getTransactions(address)
        this.getMined(address)
        this.getTotalMinedBlocks(address)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    getMoreMined(value) {
      this.blockPage = value
      this.getMined(this.$route.params.id)
    },
    async getTotalMinedBlocks(address) {
      const result = await getModel('total-mined', { address })
      this.totalblocks = result.data.total
    },
    async getMined(address) {
      try {
        this.loadingBlock = true
        const result = await getModel('mined', { address, page: this.blockPage })
        this.blocks = result.data
      } catch (error) {
        this.errorMessage(error)
      } finally {
        this.loadingBlock = false
      }
    },
    errorMessage(error) {
      const { message } = error.response.data
      this.$toast.open({
        message: message,
        type: 'error',
        duration: 5000
      })
    },
    async getAccount(address) {
      const result = await getModel('account', { address })
      this.balance = result.data.balance
      this.firstTransaction = result.data.firstTransaction
      this.addressType = result.data.type
      this.verified = result.data.verified
    },
    async getTransactions(address) {
      const params = {
        address,
        endblock: this.endblock
      }
      const result = await getModel('transactions', { ...params })
      this.loading = false
      if (result.data.length > 1 && this.transactions.length < 100000) {
        this.endblock = result.data[result.data.length - 1].blockNumber
        const ids = new Set(this.transactions.map(({ hash }) => hash))
        const newData = result.data.filter(({ hash }) => !ids.has(hash))
        this.pushTransactions(newData)
        this.getTransactions(address)
      }
    },
    fromNow,
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
    toETH(wei = 0) {
      return web3.utils.fromWei(wei.toString(), 'ether')
    },
    TxnFree(gas = 1, gasPrice = 1) {
      const price = web3.utils.fromWei(gas, 'gwei') * web3.utils.fromWei(gasPrice, 'gwei')
      return price.toString().slice(0, 10)
    },
    txnMethod(id, functionName) {
      if (id === '0x') return 'Transfer'
      const index = functionName.indexOf('(')
      return index > -1 ? functionName.slice(0, index) : id
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
  padding: 0 15px;
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
  min-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
.hashS {
  width: 80px;
  min-width: 80px;
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
  margin: 0 10px;
}

.hashF {
  width: 220px;
  min-width: 220px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 30px;
}

.hashA {
  width: 180px;
  min-width: 180px;
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
  min-width: 1168px;
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

.txn {
  width: 100%;
  a,
  p {
    margin-left: 10px;
  }
}

.link {
  display: block;
  max-width: 100%;
  overflow: hidden;
  width: unset;
  text-overflow: ellipsis;
}

.address {
  display: block;
  max-width: calc(100% - 100px);
  overflow: hidden;
  width: unset;
  text-overflow: ellipsis;
}

.warning {
  color: red;
  margin-right: 3px;
}

.el-tabs {
  margin-top: 20px;
  z-index: 1;
}

.el-tabs ::v-deep(.el-tabs__nav-wrap::after) {
  background-color: #fff;
}

.el-tabs ::v-deep(.el-tabs__item.is-active) {
  background-color: #409eff;
  color: #ffffff;
}

.el-tabs ::v-deep(.el-tabs__item.is-top:last-child),
.el-tabs ::v-deep(.el-tabs__item.is-top:nth-child(2)) {
  text-align: center;
  padding: 0 20px;
  border-radius: 4px;
}

.el-tag ::v-deep(.el-tag__content) {
  display: flex;
  align-items: center;
}

.el-tag ::v-deep(.el-icon) {
  margin-left: 5px;
  font-size: 15px;
}

.verify {
  width: unset;
  font-size: 15px;
}

@media only screen and (max-width: 992px) {
  .txn {
    a,
    p {
      margin-left: 0;
    }
  }
}
</style>
