<template>
  <div class="menu">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router="true">
      <el-menu-item index="/">Home</el-menu-item>
      <div class="type">
        <el-input
          v-model="search"
          placeholder="Search by Address / Txn Hash / Block"
          class="search"
          @keyup.enter="onEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="value" @change="changeValue">
          <el-option label="Sepolia" value="sepolia" />
          <el-option label="Mainnet" value="mainnet" />
        </el-select>
      </div>
    </el-menu>
  </div>
  <RouterView />
</template>
<script>
import web3 from '@/utils/web3'
import { getModel } from '@/abiApi.js'
import { isNumeric } from '@/utils/helper'

export default {
  data() {
    return {
      activeIndex: '/',
      value: 'sepolia',
      search: '',
      timeout: 2000
    }
  },
  mounted() {
    const net = localStorage.getItem('net')
    if (!net) {
      localStorage.setItem('net', 'sepolia')
      this.value = 'sepolia'
    } else {
      this.value = net
    }
  },
  methods: {
    isNumeric,
    async onEnter(val) {
      const str = val.target.value.trim()

      if (this.timeout) clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.getSomeThings(str)
      }, 1000)
    },
    async getSomeThings(str) {
      const isAddress = web3.utils.isAddress(str)
      const isHash = /^0x([A-Fa-f0-9]{64})$/.test(str)
      const isBlock = this.isNumeric(str)
      if (isAddress) {
        this.message('an address')
        try {
          const result = await getModel('account', { address: str })
          if (result.data.type) {
            this.search = ''
            this.$router.push({ name: 'address', params: { id: str } })
            return
          }
        } catch (error) {
          this.errorMessage(error)
        }
      }
      if (isHash) {
        this.message('a transaction')
        try {
          const result = await getModel('transaction', { hash: str })
          if (result.data.response && result.data.receipt) {
            this.$router.push({ name: 'transaction', params: { id: str } })
            this.search = ''
            return
          }
        } catch (error) {
          this.errorMessage(error)
        }
      }
      if (isBlock) {
        this.message('a block')
        try {
          const result = await getModel('block', { number: str })
          if (result.data.number && result.data.timestamp) {
            this.$router.push({ name: 'block', params: { id: str } })
            this.search = ''
            return
          }
        } catch (error) {
          this.errorMessage(error)
        }
      }
      this.$toast.open({
        message: `I can't find anything`,
        type: 'info',
        duration: 5000
      })
    },
    errorMessage(error) {
      const { message } = error.response.data
      this.$toast.open({
        message: message,
        type: 'error',
        duration: 5000
      })
    },
    message(message) {
      this.$toast.open({
        message: `Maybe it is ${message}. Please wait!`,
        type: 'info',
        duration: 3000
      })
    },
    changeValue(val) {
      localStorage.setItem('net', val)
      if (this.$route.name === 'home') {
        window.location.reload()
      } else {
        window.location.href = '/'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-menu {
  display: flex;
  justify-content: space-between;
}
.menu {
  position: sticky;
  top: 0;
  max-width: 1200px;
  width: 100%;
  margin: auto;
  z-index: 1;
  background-color: #fff;
}
.type {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.search {
  margin-right: 15px;
}
</style>
