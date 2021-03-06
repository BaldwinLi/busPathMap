import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import RouteSolution from '@/views/RouteSolution'
import BusLine from '@/views/BusLine'
import BusStation from '@/views/BusStation'
import TrafficReffer from '@/views/TrafficReffer'
import TrafficDetail from '@/views/TrafficDetail'
import StopDetail from '@/views/StopDetail'
import SurroundSearch from '@/views/SurroundSearch'
import Login from '@/views/Login'
import Signin from '@/views/Signin'
import ForgetPassword from '@/views/ForgetPassword'
import SurroundDetail from '@/views/SurroundDetail'

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
    },
    {
      path: '/traffic_reffer',
      name: 'TrafficReffer',
      component: TrafficReffer
    },
    {
      path: '/traffic_detail',
      name: 'TrafficDetail',
      component: TrafficDetail
    },
    {
      path: '/stop_detail',
      name: 'StopDetail',
      component: StopDetail
    },
    {
      path: '/surround_search',
      name: 'surround_search',
      component: SurroundSearch
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/forget_password',
      name: 'ForgetPassword',
      component: ForgetPassword
    },
    {
      path: '/surround_detail',
      name: 'surround_detail',
      component: SurroundDetail
    }
  ]
})
