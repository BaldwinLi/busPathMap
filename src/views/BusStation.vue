<template>
  <div>
    <tab>
      <tab-item :selected="showMap" @on-item-click="onItemClick">地图</tab-item>
      <tab-item :selected="showPathResult || showBusLine" @on-item-click="onItemClick">周边站点</tab-item>
    </tab>

     <search
          style="position: fixed;width: 90%;left:5%"
          class="search-field"
          v-model="searchText"
          position="fixed"
          placeholder="请输入公交站点名称"
          top="0"
          v-show="showMap"
          @on-focus="onFocus()"
          @on-cancel="isCanceled = true"
          @result-click="setBusPoi"
          :results="searchResults"
          @on-submit="onSubmit"
          ref="search">
          <a slot="left" style="width: 10rem; font-size: 1.3rem; line-height: 2.7rem;" @click="scanQRCode">站点扫一扫 <i style="font-size: 1.4rem;" class="iconfont icon-scan"></i></a>
          <a slot="right" v-show="isCanceled" class="iconfont icon-msnui-foresight geo-setter" @click="setCurrentGeo"></a>
      <!-- cancel-text="搜索" -->
      <!-- <i slot="left" v-if="!isShowList" @click="hideList" class="fa fa-angle-left" style="font-size: 2.5rem; margin-right: 1rem;" aria-hidden="true"></i> -->
        </search>
    <map-container
      ref="mapContainer"
      :startText="searchWord"
      :start="start"
      :options="options" 
      :height="-43"
      :pluginOptions="commonPluginOptions"
      :showMap="showMap"
      :showPathResult="false"
      @onLoadComplete="loadComplete"
      @onPoiChange="onPoiChange"
      @onGeolocationComplete="onGeolocationComplete"
      @onBusLineSearchComplete="onBusLineSearchComplete">
    </map-container>
    <flexbox orient="vertical" v-show="showPathResult" :gutter="8" style="position: absolute; top: 50px;">
      <flexbox-item v-for="(item, index) in busStopsList" :key="index">
        <card @click.native="selectStops(item)" class="item-card">
          <div slot="header" class="weui-panel__hd card-header">
            {{item.title}} <div class="right-side"><i class="iconfont icon-dingwei"></i>{{item.distance + 'm'}}</div>
          </div>
          <div slot="content" class="card-flex">
            <i class="iconfont icon-gongjiao header-icon-size"></i>{{item.address}}
          </div>
        </card>
        <!-- <cell primary="title" class="search-field" style="background-color: #fff;" :title="item.title" is-link @click.native="selectStops(item)">
          <div>{{item.address}}</div>
        </cell> -->
      </flexbox-item>
    </flexbox>
    <flexbox orient="vertical" v-show="showBusLine" :gutter="0" style="position: absolute; top: 50px;">
      <flexbox-item v-for="(item, index) in busList" :key="index">
        <card @click.native="selectBusline(item)" class="item-card">
          <div slot="header" class="weui-panel__hd card-header">
            <i class="iconfont icon-gongjiao header-icon-size"></i>{{item.title}}
          </div>
          <div slot="content" class="card-flex">
            <div style="float: left;padding-bottom: 10px;">
              <p>{{item.forward.split("(")[1].replace(/\)+$/, "")}}</p>
              <p>{{item.reverse.split("(")[1].replace(/\)+$/, "")}}</p>
            </div>
            <div class="right-side"><i style="font-size: 3rem; color:#000;" class="iconfont icon-dingwei"></i></div>
          </div>
        </card>
        <!-- <cell primary="title" class="search-field" style="background-color: #fff;" :title="item" is-link @click.native="selectBusline(item)"></cell> -->
      </flexbox-item>
    </flexbox>
  </div>
</template>

<script>
import { forEach, cloneDeep } from "lodash";
import { Card, Search, Tab, TabItem, Flexbox, FlexboxItem } from "vux";
import { mapMutations, mapGetters } from "vuex";
import { loadWeChatSdk, scanWxQRCode } from "@/helper/jssdk-loader";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";
import { storeBusStationKeyword, storeBusLineKeyword } from "@/helper/utils";
import { setTimeout } from "timers";

export default {
  components: {
    Search,
    Card,
    MapContainer,
    Tab,
    TabItem,
    Flexbox,
    FlexboxItem
  },
  data() {
    return {
      options: {
        type: "BUS_STATION",
        showType: "MAP_RESULT",
        policy: 0
      },
      isNeedToClear: false,
      searchText: "",
      searchWord: "",
      start: {},
      showMap: true,
      showPathResult: false,
      showBusLine: false,
      commonPluginOptions,
      searchResults: [],
      fstLine: {},
      busList: [],
      isCanceled: true,
      busLineNum: 0,
      isHref: false,
      busStopsList: []
    };
  },
  computed: {
    ...mapGetters(["appContextPath"])
  },
  methods: {
    onPoiChange(result) {
      result &&
        (this.busStopsList = result.map(v => {
          v.distance = window["IMap"]
            .getDistance(this.$refs["mapContainer"].currentPoint, v.point)
            .toFixed(0);
          return v;
        }));
      this.searchText = result[0].title;
      if (
        result[0].point.lng !== this.start.point.lng ||
        result[0].point.lat !== this.start.point.lat
      ) {
        this.start = {
          point: result[0].point
        };
        this.relocate();
      }

      this.isCanceled = false;
      // this.isHref && this.selectBusline(this.busLineNum, true);
      this.isHref = false;
      // if (this.isNeedToClear) {
      //   this.cancelSearch();
      //   this.isNeedToClear = false;
      // } else {
      //   this.searchResults = result.map(v => {
      //     return {
      //       ...v,
      //       title: v.title + "-" + v.address
      //     };
      //   });
      // }
    },
    onGeolocationComplete(val) {
      if (!$.isEmptyObject(this.$route.query)) {
        const _query = this.$route.query;
        // this.searchWord = _query.searchWord;
        this.searchText = _query.searchWord;
        this.start = {
          title: _query.searchWord,
          point: {
            lat: _query.lat,
            lng: _query.lng
          }
        };
        // this.isHref = true;
      }
      this.isCanceled = false;
      // this.isHref && this.selectBusline(this.busLineNum, true);
      this.isHref = false;
    },
    onSubmit() {
      this.searchWord = this.searchText;
      storeBusStationKeyword({ title: this.searchText });
    },
    setBusPoi(val) {
      // val = val || this.searchResults[0];
      // this.start = val;
      this.searchText = this.searchWord = val.title;
      // const _busList = val.address.split("; ");
      // this.busList = this.busList.concat(_busList);
      // document.activeElement.blur();
      // this.cancelSearch();
      // storeBusStationKeyword(val);
      // this.cancelSearch();
    },
    onFocus() {
      const scope = this;
      this.isCanceled = false;
      !this.searchText &&
        setTimeout(() => {
          scope.searchResults = storeBusStationKeyword();
        });
    },
    onItemClick(index) {
      this.showMap = index === 0;
      this.showPathResult = index === 1;
      this.showBusLine = false;
    },
    cancelSearch() {
      const scope = this;
      setTimeout(() => {
        scope.$refs.search.isCancel = true;
        scope.$refs.search.emitEvent();
        scope.$refs.search.isFixed = false;
        // ref.$emit("on-cancel");
        scope.searchResults.length > 0 && (scope.searchResults = []);
      });
    },
    setCurrentGeo() {
      this.$refs["mapContainer"].getCurrentPosition();
    },
    selectStops(item) {
      this.busList = [];
      this.upd;
      const busNumList = [];
      item.address
        .split("; ")
        .filter(e => /^\d/.test(e))
        .map(v => parseInt(v.replace(/\D/g, "")))
        .forEach(e => {
          busNumList.indexOf(e) === -1 && busNumList.push(e);
        });
      forEach(busNumList, e => {
        const _buslineCallBack = item => {
          if (item.getBusListItem(0) && item.getBusListItem(1)) {
            this.busList.push({
              title: item.getBusListItem(0).name.split("(")[0],
              forward: item.getBusListItem(0).name,
              reverse: item.getBusListItem(1).name
            });
          }
          this.updateLoadingStatus({ isLoading: false });
        };
        const busline = new BMap.BusLineSearch(
          this.$refs["mapContainer"].currentPoint,
          {
            onGetBusListComplete: _buslineCallBack
          }
        );
        this.updateLoadingStatus({ isLoading: true });
        busline.getBusList(e);
      });
      this.showPathResult = false;
      this.showBusLine = true;
    },
    selectBusline(item, noRelocate) {
      // this.busLineNum = parseInt(item.replace(/\D/g, ""));
      // this.$refs.mapContainer.busline.getBusList(this.busLineNum);
      // this.busList = [];
      storeBusLineKeyword({
        forward: {
          title: item.forward
        },
        reverse: {
          title: item.reverse
        }
      });
      this.$router.push({
        path: "bus_line",
        query: { busNum: item.forward }
      });
      // !noRelocate && this.relocate();
    },
    onBusLineSearchComplete(result) {
      //  this.$route.push('/?busNum=' + item.)
      // debugger
      // this.$refs.mapContainer.busline.getBusLine(result.getBusListItem(0));
    },
    scanQRCode() {
      scanWxQRCode({
        needResult: 1
      }).then(res => {
        this.$http.post(`${this.appContextPath}getHct`, `md5=${res}`, data => {
          this.$router.push({
            path: "stop_detail",
            query: data
          });
        });
      });
    },
    relocate() {
      const params = $.param({
        searchWord: this.searchText,
        lat: this.start.point.lat,
        lng: this.start.point.lng
      });
      window.location.href = `${window.location.origin +
        window.location.pathname}#${this.$route.path}?${params}`;
    },
    loadComplete() {
      this.$autoGetCurrentPosition();
    },
    ...mapMutations(["updateTitle", "updateLoadingStatus"])
  },
  beforeCreate() {},
  mounted() {
    this.updateTitle("公交站点查询");
    window["IMap"] && this.$autoGetCurrentPosition();
  }
};
</script>

<style>
.input-body {
  text-align: center;
}
.reverse-position {
  font-size: 3rem;
}
.geo-setter {
  right: 1rem;
  margin: auto;
  position: absolute;
  z-index: 10;
  cursor: pointer;
}

.search-field {
  background-color: rgb(255, 255, 255);
  /* position: fixed; */
  z-index: 7;
  /* margin: 1rem auto; */
}

.item-card {
  margin: 1rem;
  border: 1px solid #9999;
  border-radius: 10px;
}
.item-card .card-header {
  color: #000;
  font-size: 2rem;
}
.item-card .right-side {
  float: right;
  font-size: 1.5rem;
}
.item-card .right-side > i {
  font-size: 2rem;
}

.item-card .card-header .header-icon-size {
  color: #04be02;
  font-size: 2rem;
  margin-right: 0.5rem;
}

.item-card .card-flex {
  color: #9999;
  font-size: 1.5rem;
  padding: 14px 15px 10px;
}
.item-card .card-flex .header-icon-size {
  color: #04be02;
  font-size: 1.5rem;
  margin-right: 0.5rem;
}
</style>
