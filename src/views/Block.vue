<template>
  <div class="detail-page">
    <strong>Block Details</strong>

    <el-skeleton v-if="loading" :rows="6" animated />
    <div v-else class="detail card">
      <div class="row">
        <span class="second">Block:</span>
        {{ detail?.number }}

        <el-tooltip content="View previous block" placement="top">
          <div class="btn-icon -left" @click="viewPreBlock">
            <el-icon><ArrowLeft /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="View next block" placement="top">
          <div class="btn-icon" @click="viewNextBlock">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-tooltip>
      </div>

      <div class="row">
        <span class="second">Status:</span>
        <el-tag v-if="finalized" type="success"
          >Finalized <el-icon><CircleCheck /></el-icon>
        </el-tag>
        <el-tag v-else type="info">Not Finalized</el-tag>
      </div>

      <div class="row">
        <span class="second">Timestamp:</span>
        {{ timeStamp }}
      </div>

      <div class="row">
        <span class="second">Transactions:</span>
        <span v-if="detail?.transactions?.length" class="link" @click="gotoTxnBlock()"
          >{{ formatNumber(detail.transactions?.length) }} transactions</span
        >
      </div>

      <div class="row">
        <span class="second">Withdrawals:</span>
        <span v-if="detail?.withdrawals?.length"
          >{{ formatNumber(detail.withdrawals?.length) }} withdrawals</span
        >
      </div>

      <div class="row">
        <span class="second">Fee Recipient:</span>
        <span v-if="detail?.miner" class="link" @click="goToAddress(detail.miner)">{{
          detail.miner
        }}</span>
      </div>

      <div class="row">
        <span class="second">Total Difficulty:</span>
        <span v-if="detail?.totalDifficulty">{{ formatNumber(detail.totalDifficulty) }}</span>
      </div>

      <div class="row">
        <span class="second">Size:</span>
        <span v-if="detail?.size">{{ formatNumber(detail.size) }} bytes</span>
      </div>

      <div class="row">
        <span class="second">Gas Used:</span>
        <span v-if="detail?.gasUsed">{{ formatNumber(detail.gasUsed) }} ({{ percent }})</span>
      </div>

      <div class="row">
        <span class="second"> Gas Limit:</span>
        <span v-if="detail?.gasLimit">{{ formatNumber(detail.gasLimit) }}</span>
      </div>

      <div class="row">
        <span class="second">Base Fee Per Gas:</span>
        <span v-if="detail?.baseFeePerGas"
          >{{ formatNumber(detail.baseFeePerGas) }} wei ({{
            toGwei(detail.baseFeePerGas)
          }}
          Gwei)</span
        >
      </div>

      <div class="row">
        <span class="second"> Parent Hash:</span>
        <span v-if="detail?.parentHash">{{ detail.parentHash }}</span>
      </div>
    </div>
  </div>
</template>
  <script>
import web3 from '@/utils/web3'
import moment from 'moment'

export default {
  name: 'HomePage',
  data() {
    return {
      balance: null,
      page: 1,
      offset: 10000,
      total: 0,
      transactionList: [],
      detail: null,
      status: null,
      pending: true,
      timeStamp: null,
      detail2: null,
      decodeContract: null,
      activeTab: 'originnal',
      loading: true
    }
  },
  computed: {
    to() {
      return this.detail?.to || this.detail2?.contractAddress
    },
    percent() {
      const percent = (this.detail.gasUsed / this.detail.gasLimit) * 100
      return percent.toString().slice(0, 4) + ' %'
    },
    value() {
      const value = this.detail?.value || 0
      return `${this.toETH(value)} ETH`
    },
    fee() {
      const gas = this.detail?.gas || 0
      const gasPrice = this.detail?.gasPrice || 0
      return this.toGwei(gas) * this.toGwei(gasPrice) + ' ETH'
    },
    gas() {
      const gas = this.detail?.gasPrice || 0
      return `${this.toGwei(gas)} Gwei ( ${this.toETH(gas)} ETH )`
    }
  },
  watch: {
    '$route.params.id': {
      handler(id) {
        this.getDetailBlock(id)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    viewNextBlock() {
      const block = this.detail.number + 1
      this.$router.push({ name: 'block', params: { id: block } })
    },
    viewPreBlock() {
      const block = this.detail.number - 1
      this.$router.push({ name: 'block', params: { id: block } })
    },
    formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },
    goToAddress(address) {
      this.$router.push({ name: 'address', params: { id: address } })
    },
    gotoTxnBlock() {
      const { id } = this.$route.params
      this.$router.push({ name: 'transactionFromBlock', params: { id } })
      console.log(id)
    },
    decodeInput(text) {
      return web3.utils.hexToAscii(text)
    },
    toETH(wei = 0) {
      return web3.utils.fromWei(wei.toString(), 'ether')
    },
    toGwei(wei = 0) {
      return web3.utils.fromWei(wei.toString(), 'gwei')
    },
    timeAge(timeStamp) {
      return moment(moment.unix(timeStamp)).fromNow()
    },
    async getDetailBlock(num) {
      try {
        this.loading = true
        const result = await web3.eth.getBlock(num)
        console.log(result)
        const latestFinalizedBlock = await web3.eth.getBlock('finalized')
        this.finalized = num <= latestFinalizedBlock.number
        this.detail = Object.assign({}, result)
        this.timeStamp = `${moment(moment.unix(result.timestamp)).fromNow()} (${moment
          .unix(result.timestamp)
          .format('DD/MM/YYYY HH:mm:ss')})`
        this.loading = false
      } catch (error) {
        console.log(error)
        this.$store.dispatch('setError', ERROR_BLOCK)
      }
    }
  }
}
</script>
  <style lang="scss" scoped>
.detail-page {
  max-width: 1200px;
  margin: auto;
  margin-top: 20px;
}

.link {
  color: #0784c3;
  cursor: pointer;
}

.second {
  color: #6c757d;
  width: 300px;
  display: block;
}

.detail {
  margin-top: 20px;
}

.row {
  display: flex;
  margin-bottom: 15px;
}
.input-data {
  width: calc(100% - 300px);
}

pre {
  margin: 0;
}
table {
  margin-top: 10px;
  width: 100%;
  border: solid 1px #e9ecef;
  border-radius: 15px;
  border-collapse: collapse;
  background-color: #eee;
  overflow: hidden;
}

table th,
td {
  padding: 5px 10px;
}

table tr {
  border-bottom: solid 1px #fff;
}

table th {
  text-align: left;
}

textarea {
  padding: 10px;
  width: calc(100% - 22px);
  border: solid 1px #ccc;
  border-radius: 8px;
}

.el-tabs ::v-deep(.el-tabs__nav-wrap::after) {
  background-color: #fff;
}

.btn-icon {
  width: 18px;
  height: 24px;
  line-height: unset;
  background-color: #e9ecef;
  border-radius: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;

  &.-left {
    margin-left: 10px;
    margin-right: 5px;
  }
}
</style>
  