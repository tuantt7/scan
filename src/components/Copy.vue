<template>
  <el-icon @click="copy()" size="18"><CopyDocument /></el-icon>
</template>
<script>
export default {
  props: {
    text: {
      type: [String, Number],
      default: ''
    }
  },
  methods: {
    copy() {
      try {
        navigator.clipboard.writeText(this.text)
        this.$toast.open({
          message: 'Copied!',
          type: 'success'
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.el-icon {
  cursor: pointer;
  color: #808080;
}
</style>
