<template>
  <div class="home">
    <el-button @click="logout" type="info">退出</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
