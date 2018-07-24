import Vue from 'vue'
import store from '../vuex/store';
import {
  rejects
} from 'assert';

const $Timeout = (reject) => {
  let overtime = 0;
  const timeout = setInterval(() => {
    if (overtime === 1) {
      clearInterval(timeout);
      reject('timeout');
    } else overtime++;
  }, 1000);
};

export const loadWeChatSdk = (jsApiList) => {
  // const form = new FormData();
  // form.append('url', window.location.href);

  return new Promise((resolve, reject) => {
    const params = `url=${window.location.origin + window.location.pathname}`
    Vue.http.post(`${store.getters.appContextPath}h5/getConfig`, params).then(result => {
      const _data = result.data.responseBody.result;
      Vue.wechat.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: _data.appId, // 必填，公众号的唯一标识
        timestamp: _data.timestamp, // 必填，生成签名的时间戳
        nonceStr: _data.nonceStr, // 必填，生成签名的随机串
        signature: _data.signature, // 必填，签名
        jsApiList: [
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'onMenuShareQZone',
          "startRecord",
          "stopRecord",
          "translateVoice",
          "getLocation"
        ].concat(jsApiList || []) // 必填，需要使用的JS接口列表
      })
    }, error => {
      reject(error)
    });

    $Timeout(reject);
    Vue.wechat.ready(() => {
      resolve('SUCCESS')
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    });
    Vue.wechat.error((res) => {
      reject(res)
      // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    });
    // Vue.wechat.complete((res) => {
    //   debugger
    // });
  });
};



export const scanWxQRCode = () => {
  Vue.wechat.scanQRCode({
    needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
    scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
  });
}

export const getWxLocation = () => {
  return new Promise((resolve, reject) => {
    $Timeout(reject);
    Vue.wechat.getLocation({
      type: 'wgs84', //'gcj02/wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
      success: (res) => {
        res.type = 'wgs84';
        resolve(res);
      },
      fail: (err) => {
        reject(err)
      }
    });
  });
}

export const wxStopRecordAndTranslate = () => {
  return new Promise((resolve, reject) => {
    $Timeout(reject);
    Vue.wechat.stopRecord({
      success: (res) => {
        Vue.wechat.translateVoice({
          localId: res.localId, // 需要识别的音频的本地Id，由录音相关接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: function (res) {
            resolve(res.translateResult); // 语音识别的结果
            Vue.wechat['jssdkIsReady'] = true;
          },
          fail: (err) => {
            reject(err);
          }
        });
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

Vue.prototype.$autoGetCurrentPosition = function () {
  const scope = this;
  scope.$refs["mapContainer"].updateLoadingStatus({
    isLoading: true
  });
  initMapContainer(true);
  Vue.wechat['jssdkIsReady'] ? scope.$refs["mapContainer"].getCurrentPosition() : (loadWeChatSdk().then(
    success => {
      success === "SUCCESS" &&
        scope.$refs["mapContainer"].getCurrentPosition();
    },
    error => {
      scope.$refs["mapContainer"].getCurrentPosition();
    }
  ));
}
