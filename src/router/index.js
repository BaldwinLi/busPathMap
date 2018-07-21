import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import RouteSolution from '@/views/RouteSolution'
import BusLine from '@/views/BusLine'
import BusStation from '@/views/BusStation'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/route_solution',
      name: 'RouteSolution',
      component: RouteSolution
    },
    {
      path: '/bus_line',
      name: 'BusLine',
      component: BusLine
    },
    {
      path: '/bus_station',
      name: 'BusStation',
      component: BusStation
    }
  ]
})
