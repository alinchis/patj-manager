<template>
  <div class="page-container">
    <md-app>

      <!-- Navigation panel -->
      <md-app-drawer md-permanent="full">

        <!-- Navigation -->
        <div id="navigation_box" class="md-layout md-elevation-3">
          <md-button @click.native="gotoHome">
            <md-icon>home</md-icon>
          </md-button>
          <md-button @click.native="clearSelection">{{currentSelection.county_name_ro}}</md-button>
        </div>

        <!-- Search field -->
        <div id="search_box" class="md-layout">
          <md-field md-clearable class="md-layout">
            <label>Căutare</label>
            <md-input v-model="search_field"></md-input>
          </md-field>
        </div>

        <!-- UAT list -->
        <md-table
          v-model="filteredUATlist"
          @md-selected="itemSelect"
          :md-selected-value.sync="selected"
          class="md-layout md-elevation-3"
        >
          <md-table-row
            slot="md-table-row"
            slot-scope="{ item }"
            md-selectable="single"
          >
            <md-table-cell
              :md-label="headers[0].text"
            >
              {{ item.code_siruta }}
            </md-table-cell>
            <md-table-cell
              :md-label="headers[1].text"
              md-sort-by="name_ro"
              md-sort-order="asc"
            >
              {{ item.name_ro }}
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-app-drawer>

      <!-- Content area -->
      <md-app-content>
        <object
          v-if="this.currentUatSiruta"
          id="pdf_object"
          :data="this.currentPdf"
          type="application/pdf"
        >
          alt : <a href="">test.pdf</a>
        </object>
      </md-app-content>
    </md-app>
  </div>

</template>

<script>
export default {
  data: () => ({
    search_field: '',
    selected: {},
    headers: [
      { text: 'SIRUTA', value: 'siruta', align: 'left', sortable: false },
      { text: 'UAT', value: 'name', align: 'left', sortable: false }
    ]
  }),

  props: {

  },

  computed: {
    currentSelection () {
      return this.$store.state.current_selection
    },
    currentCountyName () {
      return this.currentSelection.county_name_ro
    },
    currentUatSiruta () {
      return this.currentSelection.uat_siruta
    },
    currentPdf () {
      let path = this.currentSelection.uat_pdf_path
      // console.log('@project/table: pdf file path: ', path)
      return path
    },
    currentUATlist () {
      return this.$store.state.counties[this.currentSelection.county_index].uat
    },
    filteredUATlist () {
      let list = this.$store.state.counties[this.currentSelection.county_index].uat
      let filtered_list = list.filter((item) => (item.name_ro.toLowerCase().includes(this.search_field.toLowerCase()) || item.name_en.toLowerCase().includes(this.search_field.toLowerCase()) || item.code_siruta.includes(this.search_field)))
      return filtered_list
    }
  },

  methods: {
    itemSelect (item) {
      console.log('@project/table/itemSelect: ', item)
      // this.selected is handled by MD and itemSelect is called every time there is a change
      if(!item) {
        console.log('@project/table/itemSelect >> null item')
        // clear current UAT from current_selection
        this.$store.dispatch('ACT_CLEAR_CURRENT_UAT')
      } else if(item.code_siruta) {
        console.log('@project/table/itemSelect/if: siruta: ', item.code_siruta)
        // clear current UAT from current_selection
        this.$store.dispatch('ACT_CLEAR_CURRENT_UAT')
        // notify selected item to the store
        this.$store.dispatch('ACT_SET_CURRENT_UAT', item.code_siruta)
      }
    },
    clearSearch () {
      console.log('@project/uat_list: clear search')
      // this.model = null
    },
    clearSelection () {
      // clear current UAT selection
      console.log('@project/navigation: clearSelection')
      this.$store.dispatch('ACT_CLEAR_CURRENT_UAT')
      // clear Table selection
      this.selected = {}
    },
    gotoHome () {
      // goto Home Page
      this.$router.push({ name: 'home'})
      // clear current selection County & UAT
      this.$store.dispatch('ACT_CLEAR_CURRENT_SELECTION')
      // clear table selection
      this.selected = {}
    }
  },

  mounted() {
    // hide space before search field
  }
}

</script>

<style lang="scss" scoped>

#county_button {
  cursor: pointer;
  padding-left: 10px;
}

div#pdf_container {
  height: 100%;
  margin: 0;
  padding: 0;
}

#home_button {
  cursor: pointer;
}

.md-app {
  height: 100%;
  border: 1px solid rgba(#000, .12);
}

.md-app-content {
  margin: 0;
  padding: 0;
}

.md-drawer {
  width: 280px;
  max-width: calc(100vw - 125px);
}

.md-field {
  margin-left: 10px;
  margin-right: 10px;
  width: 100%;
}

#navigation_box {
  padding-bottom: 6px;
  padding-top: 6px;
}

object#pdf_object {
  height: 100%;
  width: 100%;
  margin: 0;
}

.page-container {
  height: 100%;
}

</style>
