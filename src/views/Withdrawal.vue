<template>
  <div class="detail-page">
    <strong>Processed Withdrawals</strong>
    <p>
      For Block <a :href="`/block/${detail.number}`" class="hash">{{ detail.number }}</a>
    </p>
    <el-skeleton v-if="!detail" :rows="6" animated />
    <div v-else class="list">
      A total of {{ withdrawals.length }} withdrawals found
      <div class="transaction-list card">
        <div class="transaction">
          <strong class="hash">Index</strong>
          <strong class="hash">Block</strong>
          <strong class="hash">Age</strong>
          <strong class="hash">Validator Index</strong>
          <strong class="hashL">Recipient</strong>
          <strong class="hash">Value</strong>
        </div>
        <div class="transaction" v-for="item in withdrawals" :key="item.index">
          <span class="hash">{{ number(item.index) }}</span>
          <span class="hash">
            <a :href="`/block/${detail.number}`" class="hash">{{ detail.number }}</a>
          </span>

          <span class="hash">
            <el-tooltip :content="timeFrom(detail.timestamp)" placement="top">
              <p>{{ fromNow(detail.timestamp) }}</p>
            </el-tooltip>
          </span>

          <span class="hash">{{ number(item.validatorIndex) }}</span>

          <div class="hashL">
            <a :href="`/address/${item.address}`">{{ address(item.address) }}</a>
            <Copy class="ml-10" :text="item.address" />
          </div>

          <span class="hash">{{ toETH(number(item.amount)) }} ETH</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import web3 from '@/utils/web3'
import moment from 'moment'
import { getModel } from '@/mainApi.js'
import { fromNow } from '@/utils/helper.js'

export default {
  name: 'WithdrawalPage',
  data() {
    return {
      detail: null,
      timeStamp: null,
      loading: true
    }
  },
  computed: {
    withdrawals() {
      return this.detail.withdrawals.reverse()
    }
  },
  watch: {
    '$route.params.id': {
      handler(id) {
        this.getDetail(id)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    number(hex) {
      return web3.utils.hexToNumber(hex)
    },
    fromNow,
    toETH(wei = 0) {
      return web3.utils.fromWei(wei.toString(), 'Gwei')
    },
    timeFrom(time) {
      return moment.unix(time).format('DD/MM/YYYY HH:mm:ss')
    },
    address(address) {
      if (!address) return ''
      const text = `${address.slice(0, 10)}...${address.substr(address.length - 10)}`
      return text
    },
    async getDetail(num) {
      try {
        const result = await getModel('block', { number: num })
        this.detail = Object.assign({}, result.data)
        this.timeStamp = `${this.fromNow(this.detail.timestamp)} (${moment
          .unix(this.detail.timestamp)
          .format('DD/MM/YYYY HH:mm:ss')})`
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
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

.transaction-list {
  margin-top: 20px;
  min-width: 1000px;
}

.transaction {
  display: flex;
  align-items: center;
  border-bottom: solid 1px #f0f0f0;
  padding: 10px 0;
  width: 100%;
}

.hash {
  width: 16%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hashL {
  width: 20%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list {
  overflow: auto;
}
</style>
