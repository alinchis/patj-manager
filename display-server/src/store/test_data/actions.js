
export default {

/// HOME PAGE / set the current county
ACT_SET_CURRENT_COUNTY: function ({ commit }, table_id) {
  console.log('@store: ACT_SET_CURRENT_COUNTY = ', table_id)
  commit('MUT_SET_CURRENT_COUNTY', table_id)
},
// clear current county
ACT_CLEAR_CURRENT_COUNTY: function ({ commit }) {
  console.log('@store: ACT_CLEAR_CURRENT_COUNTY')
  commit('MUT_CLEAR_CURRENT_COUNTY')
},

/// PROJECT PAGE / set the current UAT
ACT_SET_CURRENT_UAT: function ({ commit }, uat_siruta) {
  console.log('@store: ACT_SET_CURRENT_UAT = ', uat_siruta)
  commit('MUT_SET_CURRENT_UAT', uat_siruta)
},
// clear current uat
ACT_CLEAR_CURRENT_UAT: function ({ commit }) {
  console.log('@store: ACT_CLEAR_CURRENT_UAT')
  commit('MUT_CLEAR_CURRENT_UAT')
},

// PROJECT PAGE / clear current selection County & UAT
ACT_CLEAR_CURRENT_SELECTION: function ({ commit }) {
  console.log('@store: ACT_CLEAR_CURRENT_SELECTION')
  commit('MUT_CLEAR_CURRENT_UAT')
  commit('MUT_CLEAR_CURRENT_COUNTY')
},

}
