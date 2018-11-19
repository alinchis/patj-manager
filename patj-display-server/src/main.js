import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store/store'

// import Vue Material component library
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
// import dark theme
import 'vue-material/dist/theme/default-dark.css'

Vue.use(VueMaterial)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
