<template>
  <div class="detail-page">
    <strong>Transaction Details</strong>
    <el-skeleton v-if="!detail" :rows="6" animated />
    <div v-else class="detail card">
      <div class="row">
        <span class="second">Transaction Hash:</span>
        <span class="phash">{{ detail?.hash }}</span>
      </div>
      <div class="row">
        <span class="second">Status: </span>
        <el-tag v-if="status && detail?.blockNumber" class="ml-2" type="success"> Success</el-tag>
        <el-tag v-else-if="!status && detail?.blockNumber" class="ml-2" type="danger"> Fail</el-tag>
        <span v-else-if="!status && !detail?.blockNumber" v-loading="true">Pending</span>
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
      </div>
      <div class="row">
        <span class="second">To:</span>
        <a :href="`/address/${detail.to || detail2.contractAddress}`" class="link">
          {{ detail?.to || detail2?.contractAddress }}
        </a>
        <span v-if="detail2?.contractAddress" class="ml-10"
          >Contract created <el-icon color="#67c23a"><CircleCheck /></el-icon
        ></span>
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
              <div v-if="decodeContract && decodeContract.name" class="table-decode">
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
      activeTab: 'originnal'
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
    async getDetailTran(hash) {
      try {
        const result = await getModel('transaction', { id: hash })
        this.status = result.data.receipt.status
        this.detail = result.data.response
        this.detail2 = result.data.receipt
        this.timeStamp = `${this.fromNow(result.data.response.timestamp)} (${moment
          .unix(result.data.response.timestamp)
          .format('DD/MM/YYYY HH:mm:ss')})`

        if (!result.data.response.blockNumber) {
          setTimeout(() => {
            this.getDetailTran(hash)
          }, 1000)
        }

        if (result.data.response.isContract) {
          const data = {
            contract: result.data.response.to,
            hx: result.data.response.input,
            net: network
          }
          const res = await postModel('abi', data)
          if (res && res.data.decodedData.status == 1) {
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
  display: flex;
  margin-bottom: 15px;
  width: 100%;
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

@media only screen and (max-width: 992px) {
  .detail-page {
    font-size: 14px;
  }
  .second {
    max-width: 120px;
    width: 120px;
    min-width: 120px;
  }
  .input-data {
    width: calc(100% - 120px);
  }
  .link {
    max-width: calc(100% - 150px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.table-decode {
  overflow: auto;
}
</style>
