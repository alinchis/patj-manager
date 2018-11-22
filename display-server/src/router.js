import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Project from './views/Project.vue'
import store from './store/store.js'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/project/:id',
      name: 'project',
      component: Project,
      // Test if :id is valid
      beforeEnter: (to, from, next) => {
        let to_index = store.getters.get_auto_codes.indexOf(to.params.id)
        if ( to_index > -1) {
            //In the array!, change the current county and load the new page
            console.log(`@router: SELECT County: ${to_index}`)
            store.dispatch('ACT_SET_CURRENT_COUNTY', to_index)
            next()
        } else {
            //Not in the array, redirect to home '/'
            next('/')
        }
      }
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
