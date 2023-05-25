<template>
  <div class="detail-page">
    <strong>Transaction Details</strong>
    <el-skeleton v-if="!detail" :rows="6" animated />
    <el-tabs v-else v-model="view" class="view-tabs">
      <el-tab-pane label="Overview" name="overview">
        This is a Sepolia Testnet transaction only
        <div class="detail card">
          <div class="row">
            <span class="second">Transaction Hash:</span>
            <span class="phash">{{ detail?.hash }}</span>
          </div>
          <div class="row">
            <span class="second">Status: </span>
            <el-tag v-if="status && detail?.blockNumber" class="ml-2" type="success">
              Success</el-tag
            >
            <el-tag v-else-if="!status && detail?.blockNumber" class="ml-2" type="danger">
              Fail</el-tag
            >
            <span v-else-if="!status && !detail?.blockNumber" v-loading="true">Pending</span>

            <span v-if="executionReverted" class="error-msg ml-10">
              Fail with error: {{ executionReverted }}
              </span>
          </div>
          <div class="row">
            <span class="second">Block:</span>
            <a :href="`/block/${detail.blockNumber}`">{{ detail?.blockNumber }}</a>
          </div>
          <div class="row">
            <span class="second">Timestamp:</span>
            {{ timeStamp }}
          </div>
          <div class="row">
            <span class="second">From:</span>
            <a :href="`/address/${detail.from}`" class="link">{{ detail?.from }}</a>
            <Copy :text="detail?.from" class="ml-10" />
          </div>
          <div class="row">
            <span class="second">To:</span>
            <a :href="`/address/${detail.to || detail2.contractAddress}`" class="link">
              {{ detail?.to || detail2?.contractAddress }}
            </a>
            <span v-if="detail2?.contractAddress" class="ml-10"
              >Contract created <el-icon color="#67c23a"><CircleCheck /></el-icon
            ></span>
            <Copy :text="detail?.to || detail2?.contractAddress" class="ml-10" />
          </div>
          <div v-if="logsLoading !== null" class="row">
            <span class="second">Tokens Transferred:</span>
            <el-skeleton v-if="logsLoading" :rows="2" animated />
            <div v-else class="w-100 transferred">
              <div v-for="item in transferred" :key="item.id" class="wrap">
                <p>
                  From
                  <a :href="`/address/${item.addressLogs[0]}`" class="link">
                    {{ item.addressLogs[0] }}
                  </a>
                </p>

                <p>
                  to
                  <a :href="`/address/${item.addressLogs[1]}`" class="link">
                    {{ item.addressLogs[1] }}
                  </a>
                </p>

                <p v-if="item.data.tokenId">
                  ERC-721 Token ID [{{ item.data.tokenId }}] {{ item.name }} ({{ item.symbol }})
                </p>
                <p v-else>For {{ valueTransfer(item) }}</p>
              </div>
            </div>
          </div>
          <div class="row">
            <span class="second">Value:</span>
            {{ value }}
          </div>
          <div class="row">
            <span class="second">Transaction Fee:</span>
            {{ fee }}
          </div>
          <div class="row">
            <span class="second">Gas Price:</span>
            {{ gas }}
          </div>
        </div>
        <div v-if="detail" class="detail card">
          <div class="row">
            <span class="second">Gas Limit & Usage by Txn :</span>
            {{ formatNumber(detail?.gas) }}
            <span v-if="detail2 && detail2.gasUsed" :style="{ 'margin-left': '5px' }">
              | {{ formatNumber(detail2?.gasUsed) }} ({{ percent }})
            </span>
          </div>
          <div class="row">
            <span class="second">Gas Fee:</span>
            MAX: {{ toGwei(detail?.maxFeePerGas) }} Gwei | Max Priority:
            {{ toGwei(detail?.maxPriorityFeePerGas) }} Gwei
          </div>
          <div class="row">
            <span class="second">Other Attributes:</span>
            <span>
              Nonce: <el-tag type="info" class="ml-5"> {{ detail?.nonce }}</el-tag>
              <pre>&</pre>
              Position In Block:
              <el-tag type="info" class="ml-5"> {{ detail?.transactionIndex }}</el-tag>
            </span>
          </div>
          <div class="row">
            <span class="second">Input Data:</span>
            <div class="input-data">
              <el-tabs v-model="activeTab" class="demo-tabs">
                <el-tab-pane label="Originnal" name="originnal">
                  <textarea
                    v-if="detail && detail.input"
                    v-model="detail.input"
                    disabled
                    rows="5"
                  ></textarea>
                </el-tab-pane>
                <el-tab-pane label="Decode" name="decode">
                  <span v-if="decodeContract && decodeContract.name">
                    Function:
                    <el-tag type="info">{{ decodeContract?.name || '' }}</el-tag>
                  </span>
                  <div
                    v-if="decodeContract && decodeContract.name && decodeContract.params.length"
                    class="table-decode"
                  >
                    <table>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Data</th>
                      </tr>
                      <tr v-for="item in decodeContract.params" :key="item.name">
                        <td>{{ item.name }}</td>
                        <td>{{ item.type }}</td>
                        <td>{{ item.value }}</td>
                      </tr>
                    </table>
                  </div>
                  <textarea
                    v-else-if="detail && detail.input && !decodeContract"
                    :value="decodeInput(detail.input)"
                    disabled
                    rows="5"
                  ></textarea>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="`Logs (${logs.length})`" name="logs">
        Transaction Receipt Event Logs
        <div v-for="(log, index) in logs" :key="log.address + index" class="detail card">
          <div class="row">
            <span class="index">{{ log.logIndex }}</span>
            <span class="title">Address:</span>
            <span class="phash">{{ log.address }}</span>
          </div>
          <div class="row">
            <span class="title">Name:</span>
            <span class="phash">{{ log.event }}</span>
          </div>
          <div class="row">
            <span class="title">Topics:</span>
            <div class="w-100">
              <p class="break">
                <el-tag type="info" class="mr-10">0</el-tag>{{ log.trasnfers.signature }}
              </p>
              <p v-for="(addr, index) in log.addressLogs" :key="addr + index" class="break">
                <el-tag type="info" class="mr-10">
                  {{ index + 1 }}
                </el-tag>
                <el-icon class="mr-10"><Right /></el-icon>
                <a :href="`/address/${addr}`"> {{ addr }}</a>
              </p>
            </div>
          </div>
          <div class="row">
            <span class="title">Data:</span>
            <div class="w-100 log">
              <p v-for="(value, name, indexLog) in log.data" :key="value + indexLog">
                {{ name }}: {{ value }}
              </p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import web3 from '@/utils/web3'
import moment from 'moment'
import { postModel, getModel } from '@/abiApi.js'
import { fromNow } from '@/utils/helper.js'

const network = localStorage.getItem('net')

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
      logs: [],
      view: 'overview',
      logsLoading: null,
      executionReverted: ''
    }
  },
  computed: {
    to() {
      return this.detail?.to || this.detail2?.contractAddress
    },
    percent() {
      const percent = (this.detail2.gasUsed / this.detail.gas) * 100
      return percent.toString().slice(0, 5) + ' %'
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
    },
    transferred() {
      return this.logs.filter((item) => item.event === 'Transfer')
    }
  },
  watch: {
    '$route.params.id': {
      handler(id) {
        this.getDetailTran(id)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async getRevertReason() {
      const hash = this.$route.params.id
      const result = await getModel('revert', { hash })
      this.executionReverted = result.data.message
    },
    isNumeric(str) {
      if (typeof str != 'string') return false
      return !isNaN(str) && !isNaN(parseFloat(str))
    },
    valueTransfer(item) {
      let val = ''
      if (!item.value) {
        for (const property in item.data) {
          if (this.isNumeric(item.data[property]) && !web3.utils.isAddress(item.data[property])) {
            val = `${item.data[property] / Math.pow(10, item.decimals)} ${item.name} (${
              item.symbol
            })`
            break
          }
        }
      }
      return val || `${item.value / Math.pow(10, item.decimals)} ${item.name} (${item.symbol})`
    },
    fromNow,
    formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },
    goToBlock(block) {
      this.$router.push({ name: 'block', params: { id: block } })
    },
    goToAddress(address) {
      this.$router.push({ name: 'address', params: { id: address } })
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
    async getLogs() {
      const result = await getModel('get-log', { hash: this.$route.params.id })
      this.logs = result.data
      if (this.transferred.length) {
        this.logsLoading = false
      } else {
        this.logsLoading = null
      }
    },

    async getDetailTran(hash) {
      try {
        const result = await getModel('transaction', { hash })
        this.status = result.data.receipt.status
        this.detail = result.data.response
        this.detail2 = result.data.receipt
        if (!result.data.receipt.status) this.getRevertReason()
        this.timeStamp = `${this.fromNow(result.data.response.timestamp)} (${moment
          .unix(result.data.response.timestamp)
          .format('DD/MM/YYYY HH:mm:ss')})`

        if (!result.data.response.blockNumber) {
          setTimeout(() => {
            this.getDetailTran(hash)
          }, 1000)
        }

        if (result.data.receipt.logs.length) {
          this.logsLoading = true
          this.getLogs()
        }

        if (result.data.response.isContract) {
          const data = {
            contract: result.data.response.to,
            hx: result.data.response.input,
            net: network
          }
          const res = await postModel('decode', data)
          if (res && res.message !== 'NOTOK') {
            this.decodeContract = res.data.decodedData
          }
        }
      } catch (error) {
        console.log(error)
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
  min-width: 300px;
  display: block;
}

.phash {
  width: calc(100% - 150px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail {
  margin-top: 20px;
}

.row {
  position: relative;
  display: flex;
  padding: 15px 0;
  width: 100%;
  border-bottom: solid 1px #eee;
  .index {
    position: absolute;
    top: -10px;
    left: 0;
    height: 20px;
    padding: 0 3px;
    line-height: 20px;
    background-color: #409eff;
    color: #fff;
    text-align: center;
    border-radius: 5px;
  }
}
.input-data {
  width: calc(100% - 300px);
}

.el-tag {
  --el-tag-font-size: 15px;
}

pre {
  margin: 0;
}
table {
  margin-top: 20px;
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

.log {
  background-color: #eee;
  padding: 10px;
  border-radius: 6px;
  overflow: auto;
}

.break {
  display: flex;
  align-items: center;
  word-wrap: break-word;
  word-break: break-word;
  margin-bottom: 5px;
}

.transferred {
  overflow: auto;
}

.link {
  overflow: auto;
}

.wrap {
  position: relative;
  width: calc(100% - 30px);
  background-color: #eee;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  overflow: auto;
  &::before {
    content: '';
    position: absolute;
    top: 25px;
    left: 5px;
    width: 6px;
    height: 6px;
    background-color: #000000;
    border-radius: 50%;
  }
  &:first-child {
    margin-top: 0;
  }
}

.el-tabs {
  position: relative;
  z-index: 0;
}

.title {
  color: #6c757d;
  width: 300px;
  min-width: 300px;
  display: block;
}

@media only screen and (max-width: 992px) {
  .detail-page {
    font-size: 14px;
  }
  .second {
    max-width: 80px;
    width: 80px;
    min-width: 80px;
  }

  .title {
    width: 60px;
    min-width: 60px;
  }
  .input-data {
    width: calc(100% - 120px);
  }
}

.table-decode {
  overflow: auto;
}

.error-msg {
  color: #f56c6c;
}
</style>
