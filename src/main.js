// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import $ from 'jquery'
import '@/assets/custom.css'
import 'font-awesome/css/font-awesome.min.css'
import '@/assets/iconfont/iconfont.css'
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
// import Home from './views/HelloFromVux'
import router from '@/router'
import {
  AjaxPlugin,
  AlertPlugin,
  ConfirmPlugin,
  ToastPlugin
  // AlertModule
} from 'vux'
import Vuex from 'vuex'
import store from './vuex/store';
import {
  WechatPlugin
} from 'vux'
import vueTouch from 'vue-plugin-touch';
Vue.use(ToastPlugin)
Vue.use(vueTouch);
Vue.use(WechatPlugin);
Vue.wechat['jssdkIsReady'] = false;
// import { initKeyList } from './initKeyList';

// cordova(App);
Vue.use(Vuex)
Vue.use(AjaxPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)
// Vue.http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// Vue.prototype.$http.interceptors.request.use(
//   config => {
//     config.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
//     config.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
//     return config;
//   },
//   err => Promise.reject(err)
// );
// .headers.common[appConsts['HTTP_HEADER_X_AUTH_VALUE']] = user.token;
router.beforeEach(function (to, from, next) {
  store.commit('updateLoadingStatus', {
    isLoading: true
  })
  next();
});

router.afterEach(function (to) {
  store.commit('updateLoadingStatus', {
    isLoading: false
  });
});

FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app-box')
