import Vue from 'vue'
import Router from 'vue-router'
import ZoomTarget from '@/components/ZoomTarget'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ZoomTarget',
      component: ZoomTarget
    }
  ]
})
