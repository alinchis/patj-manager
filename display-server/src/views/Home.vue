<template>
  <div class="md-layout md-gutter md-alignment-center-center">
    <md-card
      md-with-hover
      @click.native="selectCard(item.code_auto, index)"
      v-for="(item, index) in this.currentProjects"
      :key="item.id"
    >
      <md-card-media>
        <img :src="getImage(index)">
      </md-card-media>
      <md-card-header>
        <div id="title-text" class="md-display-1">{{item.code_auto}}</div>
      </md-card-header>
    </md-card>
  </div>
</template>

<script>
export default {
  computed: {
    currentProjects () {
      return this.$store.state.counties
    }
  },
  methods: {
    selectCard (value, index) {
      console.log(`@home: SELECT County: ${value}, ${index}`)
      // this.$store.dispatch('ACT_SET_CURRENT_COUNTY', index)
      this.$router.push({ name: 'project', params: { id: value }})
    },
    getImage (index) {
      console.log(`@home: GET stema index: ${index}`)
      return this.$store.state.counties[index].logo
    }
  }
}
</script>


<style lang="scss" scoped>

.md-card {
  width: 190px;
  margin: 4px;
  display: inline-block;
  vertical-align: center;
}

.md-layout {
  height: 100%;
}

#title-text {
  text-align: center;
}

</style>
