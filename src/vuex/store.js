import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const proxyedHostNames = [
  'localhost',
  '127.0.0.1',
  '192.168.1.106'
]

export default new Vuex.Store({ // 名字自己定义
  state: {
    isLoading: false,
    title: '首页',
    currentPosition: {
      longitude: 0,
      latitude: 0
    },
    addressInfo: null
  },
  mutations: {
    updateLoadingStatus(state, payload) {
      state.isLoading = payload.isLoading;
    },
    updateTitle(state, payload) {
      state.title = payload;
      const titleEl = document.head.getElementsByTagName('title')[0];
      if (titleEl) titleEl.innerHTML = payload;
    },
    updateCurrentPosition(state, payload) {
      state.currentPosition.longitude = payload.longitude;
      state.currentPosition.latitude = payload.latitude;
    },
    updateAddress(state, payload) {
      state.address = payload;
    }
  },
  getters: {
    rootPath: () => (window.location.origin + window.location.pathname),
    isLocal: () => proxyedHostNames.includes(window.location.hostname),
    appContextPath: () => (proxyedHostNames.includes(window.location.hostname) ?
      `${window.location.origin}/dev_api/` : `${window.location.origin}/busQInterface/v1.0/`),
    agentType: () => {
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        return 'IOS';
      } else if (/(Android)/i.test(navigator.userAgent)) {
        return 'Android';
      }
    }
    // (window.location.origin + (window.location.protocol==='https:' ? '/MzkAppServiceTest/' : '/MzkAppService/'))),
  }
});

// store.registerModule('vux', {
//   state: {
//     isLoading: false
//   },
//   mutations: {
//     updateLoadingStatus(state, payload) {
//       state.isLoading = payload.isLoading;
//     }
//   },
//   getters: {
//     isLocal: () => proxyedHostNames.includes(window.location.hostname),
//     appContextPath: () => proxyedHostNames.includes(window.location.hostname) ? `${window.location.origin}/dev_api/` : (window.location.origin + '/'),
//   }
// });
