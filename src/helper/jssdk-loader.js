import Vue from 'vue'
import store from '../vuex/store';
import {
  rejects
} from 'assert';

export const loadWeChatSdk = (jsApiList) => {
  Vue.http.post(`${store.getters.appContextPath}getConfig`, {
    url: window.location.href
  }, data => {
    Vue.wechat.config({
      debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: data.appId, // 必填，公众号的唯一标识
      timestamp: data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.nonceStr, // 必填，生成签名的随机串
      signature: data.signature, // 必填，签名
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone'
      ].concat(jsApiList || []) // 必填，需要使用的JS接口列表
    })
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
    Vue.wechat.getLocation({
      type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
      success: (res) => {
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
    Vue.wechat.stopRecord({
      success: (res) => {
        Vue.wechat.translateVoice({
          localId: res.localId, // 需要识别的音频的本地Id，由录音相关接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: function (res) {
            resolve(res.translateResult); // 语音识别的结果
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
