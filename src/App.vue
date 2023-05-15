<template>
  <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router="true">
    <el-menu-item index="/">Home</el-menu-item>
  </el-menu>
  <RouterView />
</template>
<script>
export default {
  data() {
    return {
      activeIndex:'/'
    }
  }
}
</script>


<style lang="scss" scoped>
.el-menu {
  position: sticky;
  top: 0;
}
</style>
