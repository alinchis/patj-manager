
import Axios from 'axios'

export default {

/// HOME PAGE / load UAT lists from DB
ACT_LOAD_UATS: function ({ commit, state }) {
  console.log('@store: ACT_LOAD_UATS')
  let counties = state.counties
  counties.forEach( (county, index) => {
    console.log('@store: county_siruta', county.code_siruta)
    Axios.get('/api/' + county.code_siruta + '/uat')
    .then( (response) => { commit('MUT_LOAD_UATS', { list: response.data, index: index})})
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('ERR data', error.response.data)
        console.log('ERR status', error.response.status)
        console.log('ERR header', error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('ERR request', error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message)
      }
      console.log(error.config)
    })
  })
},

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
