// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import $ from 'jquery'
import 'font-awesome/css/font-awesome.min.css'
import '@/assets/iconfont/iconfont.css'
import '@/assets/custom.css'
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
// import Home from './views/HelloFromVux'
import router from '@/router'
import {
  AjaxPlugin,
  AlertPlugin,
  ConfirmPlugin
  // AlertModule
} from 'vux'
import { WechatPlugin } from 'vux'
Vue.use(WechatPlugin)
// import { initKeyList } from './initKeyList';

// cordova(App);
Vue.use(AjaxPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)

FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
