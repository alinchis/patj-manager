<template>
  <div id="container">
    <p>{{this.latexString}}</p>
  </div>
</template>

<script>
import katex from 'katex'

export default {
  name: 'katex-component',
  computed: {
    latexString () {
      katex.render(String.raw`c = \pm\sqrt{a^2 + b^2}`, element, {
        throwOnError: false
      })
    }
  }
}

</script>


<style lang="scss" scoped>

</style>
