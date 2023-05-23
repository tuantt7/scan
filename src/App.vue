<template>
  <div class="menu">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router="true">
      <el-menu-item index="/">Home</el-menu-item>
      <div class="type">
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
export default {
  data() {
    return {
      activeIndex: '/',
      value: 'sepolia'
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
</style>
