<template>
  <div class="home-page">
    <h3 v-if="!isMainnet">Sepolia Testnet Explorer</h3>
    <div class="over-view">
      <el-skeleton v-if="loading" :rows="6" animated />
      <div v-else class="card -head">
        <h4 class="title">Latest Blocks</h4>
        <div class="card-body">
          <div v-for="block in blocks" :key="block.number" class="detail">
            <div class="num">
              <div class="icon-block">
                <el-icon size="24" color="rgba(84, 84, 84, 0.65)"><Box /></el-icon>
              </div>
              <div class="time">
                <!-- <span class="link" @click="goToBlock(block.number)">{{ block.number }}</span> -->
                <a :href="`/block/${block.number}`">{{ block.number }}</a>
                <p>{{ fromNow(block.timestamp) }}</p>
              </div>
            </div>
            <div class="fee">
              <span
                >Fee Recipient
                <!-- <span class="link address" @click="goToAddress(block.miner)">
                  {{ block.miner }}</span
                > -->
                <a :href="`/address/${block.miner}`" class="link address">{{ block.miner }}</a>
              </span>
            </div>
            <div class="fee">{{ block.transactions.length }} transactions</div>
          </div>
        </div>
      </div>
      <el-skeleton v-if="loading" :rows="6" animated />
      <div v-else class="card -head">
        <h4 class="title">Latest Transactions</h4>
        <div class="card-body">
          <div v-for="tran in transactions" :key="tran" class="detail">
            <div class="icon-block">
              <el-icon size="24" color="rgba(84, 84, 84, 0.65)"><Tickets /></el-icon>
            </div>
            <div class="time">
              <!-- <span class="link -hash" @click="goToTransaction(tran)">{{ tran }}</span> -->
              <a :href="`/transaction/${tran}`" class="link -hash">{{ tran }}</a>
              <p>{{ fromNow(blocks[0].timestamp) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import web3 from '@/utils/web3'
import { fromNow } from '@/utils/helper.js'
import moment from 'moment'
import { mapState, mapActions } from 'pinia'
import { useAddressStore } from '../stores/address.js'
const mainnet = import.meta.env.VITE_MAINNET_NETWORK
export default {
  name: 'HomePage',
  data() {
    return {
      latest: 0,
      blocks: [],
      loading: true
    }
  },
  computed: {
    ...mapState(useAddressStore, ['dataPage', 'tranLength', 'offset', 'time']),
    transactions() {
      return this.blocks[0]?.transactions.slice(0, 5)
    },
    isMainnet() {
      return localStorage.getItem('net') === mainnet
    }
  },
  mounted() {
    this.getLatestBlock()
  },
  methods: {
    fromNow,
    async getLatestBlock() {
      const latest = await web3.eth.getBlock('latest')
      this.latest = latest.number
      this.getLastFiveBlocks()
    },
    async getLastFiveBlocks() {
      this.loading = true
      for (let index = 0; index < 5; index++) {
        const temp = this.latest - index
        const block = await web3.eth.getBlock(temp)
        this.blocks.push({ ...block })
      }
      console.log(this.blocks[0])
      this.loading = false
    },
    timeFrom(time) {
      return moment.unix(time).format('DD/MM/YYYY HH:mm:ss')
    },
    goToAddress(address) {
      this.$router.push({ name: 'address', params: { id: address } })
    },
    goToBlock(block) {
      this.$router.push({ name: 'block', params: { id: block } })
    },
    goToTransaction(hash) {
      this.$router.push({ name: 'transaction', params: { id: hash } })
    },
    ...mapActions(useAddressStore, ['setPage', 'setTransactions', 'pushTransactions', 'setTime']),
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
  grid-template-columns: calc(50% - 10px) calc(50% - 10px);
  gap: 20px;
}

.detail,
.num {
  display: flex;
  align-items: center;
}

.num {
  width: 200px;
}

.detail {
  padding: 15px;
  border-bottom: solid 1px #f0f0f0;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.icon-block {
  display: flex;
  align-items: center;
  min-width: 48px;
  height: 48px;
  border: solid 1px #f0f0f0;
  border-radius: 4px;
  background-color: #f0f0f0;
  .el-icon {
    margin: auto;
  }
}

.time {
  margin-left: 20px;
  max-width: calc(100% - 62px);
}

.address {
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.link {
  &.-hash {
    min-width: 200px;
    max-width: 380px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
}

@media only screen and (max-width: 992px) {
  .home-page {
    font-size: 14px;
  }
  .over-view {
    display: block;
  }
  .detail {
    padding: 15px 0;
  }
  .icon-block {
    min-width: 40px;
    height: 40px;
  }
}
</style>
