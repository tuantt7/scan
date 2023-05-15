<template>
  <div class="detail-page">
    <strong>Transaction Details</strong>
    <div class="detail card">
      <div class="row">
        <span class="second">Transaction Hash:</span>
        {{ detail?.hash }}
      </div>
      <div class="row">
        <span class="second">Status: </span>
        <el-tag v-if="status && detail?.blockNumber" class="ml-2" type="success"> Success</el-tag>
        <el-tag v-else-if="!status && detail?.blockNumber" class="ml-2" type="danger"> Fail</el-tag>
        <span v-else-if="!status && !detail?.blockNumber" v-loading="true">Pending</span>
      </div>
      <div class="row">
        <span class="second">Block:</span> <span class="link">{{ detail?.blockNumber }}</span>
      </div>
      <div class="row">
        <span class="second">Timestamp:</span>
        {{ timeStamp }}
      </div>
      <div class="row">
        <span class="second">From:</span>
        <span class="link">{{ detail?.from }}</span>
      </div>
      <div class="row">
        <span class="second">To:</span>
        <span class="link">{{ detail?.to || detail2?.contractAddress }} </span>
        <span v-if="detail2?.contractAddress" class="ml-10">Contract created</span>
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
    <div class="detail card">
      <div class="row">
        <span class="second">Gas Limit & Usage by Txn :</span>
        {{ detail?.gas }}
        <span v-if="detail2 && detail2.gasUsed" :style="{ 'margin-left': '5px' }"
          >| {{ detail2?.gasUsed }} ({{ percent }})</span
        >
      </div>
      <div class="row">
        <span class="second">Gas Fee:</span>
        MAX: {{ toGwei(detail?.maxFeePerGas) }} Gwei | Max Priority:
        {{ toGwei(detail?.maxPriorityFeePerGas) }} Gwei
      </div>
      <div class="row">
        <span class="second">Other Attributes:</span>
        Nonce: <el-tag type="info" class="ml-5"> {{ detail?.nonce }}</el-tag>
        <pre> & </pre>
        Position In Block: <el-tag type="info" class="ml-5"> {{ detail?.transactionIndex }}</el-tag>
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
              <span v-if="decodeContract && decodeContract.name"
                >Function: <el-tag type="info">{{ decodeContract?.name || '' }}</el-tag></span
              >
              <table v-if="decodeContract && decodeContract.name">
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
              <textarea
                v-else-if="detail && detail.input"
                :value="decodeInput(detail.input)"
                disabled
                rows="5"
              ></textarea>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>
  <script>
import web3 from '@/utils/web3'
import moment from 'moment'
import { getModel } from '../../src/abiApi.js'
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
      activeTab: 'originnal'
    }
  },
  async mounted() {
    const { hash } = this.$route.query

    if (hash) this.getDetailTran(hash)
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
    }
  },
  methods: {
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
    async getDetailTran(hash) {
      try {
        const result = await web3.eth.getTransaction(hash)
        console.log(result)
        const result2 = await web3.eth.getTransactionReceipt(hash)
        const block = await web3.eth.getBlock(result.blockNumber)
        this.timeStamp = `${moment(moment.unix(block.timestamp)).fromNow()} (${moment
          .unix(block.timestamp)
          .format('DD/MM/YYYY HH:mm:ss')})`
        this.status = result2.status
        this.detail = result
        this.detail2 = result2
        if (!result.blockNumber) {
          setTimeout(() => {
            this.getDetailTran(hash)
          }, 1000)
        }
        if (result.to) {
          const addressCode = await web3.eth.getCode(result.to)
          if (addressCode !== '0x') {
            const params = {
              contract: result.to,
              hx: result.input
            }
            const res = await getModel('abi', params)
            if (res && res.data.status == 1) {
              this.decodeContract = res.data
            }
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

::v-deep .el-tabs__nav-wrap::after {
  background-color: #fff;
}
</style>
  