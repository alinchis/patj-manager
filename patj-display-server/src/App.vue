<template>
  <div id="app-container">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted: function () {
    this.$store.dispatch('ACT_LOAD_UATS')
  }
}
</script>

<style lang="scss">
html {
  height: 100%;
}

body {
  height: 100%;
}

#app-container {
  height: 100%;
}

</style>
