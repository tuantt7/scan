<template>
  <div class="menu">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router="true">
      <el-menu-item index="/">Home</el-menu-item>
      <div class="type">
        <el-input
          ref="search"
          v-model="search"
          placeholder="Search by Address / Txn Hash / Block"
          class="search"
          @keyup="typing"
          @keyup.enter="onEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="value" class="lang" @change="changeValue">
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
import { getModel } from '@/mainApi.js'
import { isNumeric } from '@/utils/helper'

export default {
  data() {
    return {
      activeIndex: '/',
      value: 'sepolia',
      search: '',
      timeout: 2000,
      focus: false,
      isSearch: false
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
    setPosition(pos) {
      const input = this.$refs.search.input
      if (input.setSelectionRange) {
        input.focus()
        input.setSelectionRange(pos, pos)
      } else if (input.createTextRange) {
        var range = input.createTextRange()
        range.collapse(true)
        range.moveEnd('character', pos)
        range.moveStart('character', pos)
        range.select()
      }
    },
    typing(val) {
      const input = this.$refs.search.input
      if (val.code === 'Space') {
        const index = val.target.selectionStart
        this.search = this.search.slice(0, index) + ' ' + this.search.slice(index + Math.abs(0))
        input.blur()
        this.$nextTick(() => {
          this.setPosition(index + 1)
        })
      }
    },
    isNumeric,
    async onEnter(val) {
      const str = val.target.value.trim()
      if (this.isSearch || !str) return

      this.getSomeThings(str)
    },
    resetSearch(clearSearch = true) {
      this.isSearch = false
      if (!clearSearch) return
      this.search = ''
    },
    async getSomeThings(str) {
      this.isSearch = true
      const isAddress = web3.utils.isAddress(str)
      const isHash = /^0x([A-Fa-f0-9]{64})$/.test(str)
      const isBlock = this.isNumeric(str)
      if (isAddress) {
        this.message('an address')
        try {
          const result = await getModel('account', { address: str })
          if (result.data.type) {
            this.resetSearch()
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
            this.resetSearch()
            this.$router.push({ name: 'transaction', params: { id: str } })
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
            this.resetSearch()
            this.$router.push({ name: 'block', params: { id: str } })
            return
          }
        } catch (error) {
          this.errorMessage(error)
        }
      }
      this.$toast.open({
        message: `I can't find anything.`,
        type: 'info',
        duration: 5000
      })
      this.resetSearch(false)
    },
    errorMessage(error) {
      const { message } = error.response.data
      this.$toast.open({
        message: message,
        type: 'error',
        duration: 5000
      })
      this.resetSearch()
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
  z-index: 999;
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

@media only screen and (max-width: 768px) {
  .lang{
    width: calc(100% - 30px);
    margin: 15px;
  }
  .search {
    width: calc(100% - 30px);
    margin: 15px;
  }
}
</style>
