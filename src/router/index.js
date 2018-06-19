import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import TransitRoute from '@/views/TransitRoute'
import BusLine from '@/views/BusLine'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/transit_route',
      name: 'TransitRoute',
      component: TransitRoute
    },
    {
      path: '/bus_line',
      name: 'BusLine',
      component: BusLine
    }
  ]
})
