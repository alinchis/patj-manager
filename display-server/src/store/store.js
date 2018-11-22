import Vue from 'vue'
import Vuex from 'vuex'

// test data loading
// import state from './test_data/state.js'
// import mutations from './test_data/mutations.js'
// import actions from './test_data/actions.js'
// import getters from './test_data/getters.js'

// remote data loading
import state from './remote_data/state.js'
import mutations from './remote_data/mutations.js'
import actions from './remote_data/actions.js'
import getters from './test_data/getters.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
