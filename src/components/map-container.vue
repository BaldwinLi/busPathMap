<template>
  <div class="home-content">
    <div ref="mapContainer" v-show="showMap" id="map-container"></div>
    <div ref="pathResult" v-show="showPathResult && hasDetailHtml" id="path-result">
    </div>
    <divider v-show="!hasDetailHtml" style="color: #999; font-size: 1.4rem;">
        暂无路线详情
      </divider>
  </div>
</template>

<script>
// import { TRANSIT_POLICY } from './map-config.js'
import { forEach, debounce, startsWith } from "lodash";
import { getWxLocation } from "@/helper/jssdk-loader";
import { mapMutations, mapGetters } from "vuex";
import {
  coordinatesOffsetList,
  getCurrentPositionComplete,
  refreshMap,
  initRoute,
  initBusline,
  initLocation,
  judgeHasDetail
} from "./map-config";
import { Divider } from "vux";
import { setTimeout } from "timers";

export default {
  name: "map-container",
  data() {
    return {
      isCityPosition: false,
      currentPoint: {},
      busline: Object,
      transit: Object,
      geoc: Object,
      location: Object,
      busPoi: Object,
      plugins: [],
      poiList: [],
      directSetBusLine: false,
      viaStopsStr: "",
      hasDetailHtml: true
    };
  },
  components: {
    Divider
  },
  props: {
    height: Number,
    width: Number,
    zoom: {
      type: Number,
      default: 14
    },
    options: {
      type: Object,
      default() {
        return {
          type: "BUS_LINE",
          // showType: "MAP_RESULT",
          policy: 0
        };
      }
    },
    pluginOptions: {
      type: Array,
      default() {
        return [
          {
            plugin: "Scale",
            option: {
              anchor: "BOTTOM_LEFT",
              offset: undefined
            }
          }
        ];
      }
    },
    busNum: String,
    fstLine: Object,
    startText: {
      type: String,
      default: ""
    },
    endText: {
      type: String,
      default: ""
    },
    start: {
      type: Object,
      default() {
        return {
          title: ""
        };
      }
    },
    end: {
      type: Object,
      default() {
        return {
          title: ""
        };
      }
    },
    showPathResult: {
      type: Boolean,
      default: true
    },
    showMap: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapGetters(["isLocal"])
  },
  watch: {
    height(height) {
      $("#map-container").height($(window).height() + parseInt(height || 0));
    },
    width(width) {
      $("#map-container").width($(window).width() + parseInt(width || 0));
    },
    busNum(val) {
      let numberMatch;
      if (val && Number(val)) {
        $scope.busline.getBusList(val);
      } else if (val && (numberMatch = val.match(/\d+/))) {
        this.directSetBusLine = true;
        $scope.busline.getBusList(numberMatch && numberMatch[0]);
      }
    },
    fstLine(val) {
      // const fstLine = result.getBusListItem(val); //获取第一个公交列表显示到map上
      this.busline.getBusLine(val);
    },
    startText(val, old) {
      // $scope.busline.getBusList(3);
      // $scope.transit.search(val, $scope.end);
      if (val && $scope.location.search) {
        this.updateLoadingStatus({ isLoading: true });
        $scope.poiList.length = 0;
        $scope.location.search(val);
      }
    },
    endText(val, old) {
      // $scope.transit.search($scope.start, val);
      if (val && $scope.location.search) {
        this.updateLoadingStatus({ isLoading: true });
        $scope.poiList.length = 0;
        $scope.location.search(val);
      }
    },
    start(val) {
      if (val.point && window["BMap"]) {
        this.updateLoadingStatus({ isLoading: true });
        const _start = new BMap.Point(val.point.lng, val.point.lat);
        const _end =
          $scope.end.point &&
          new BMap.Point($scope.end.point.lng, $scope.end.point.lat);
        switch (this.options.type) {
          case "TRANSIT_SOLUTION":
            $scope.transit.search(_start, _end);
            break;
          case "BUS_STATION":
            // var marker = new BMap.Marker(_start); // 创建标注
            this.location.searchNearby(
              $scope.start.title && $scope.start.title.split("-")[0] || '公交',
              _start
            );
            // window["IMap"].addOverlay(marker);
            break;
        }
      }
    },
    end(val) {
      if ($scope.start.point && val.point && window["BMap"]) {
        this.updateLoadingStatus({ isLoading: true });
        const _start = new BMap.Point(
          $scope.start.point.lng,
          $scope.start.point.lat
        );
        const _end = new BMap.Point(val.point.lng, val.point.lat);
        $scope.transit.search(_start, _end);
      }
    },
    showMap(val) {
      if (val) {
        this.refreshMap();
      }
    },
    showPathResult(val) {
      if (val) {
        this.refreshMap();
      }
    },
    options(option) {
      initMapContainer(true);
      this.refreshMap();
    }
  },
  methods: {
    onLocalSearchComplete(result) {
      this.judgeHasDetail();
      if (result) {
        this.poiList.length = 0;
        for (let i = 0; i < result.getCurrentNumPois(); i++) {
          const poi = result.getPoi(i);
          const toFilter =
            this.options.type === "BUS_STATION"
              ? poi.type === BMAP_POI_TYPE_BUSSTOP
              : true;
          if (toFilter) {
            this.poiList.push(
              toFilter
                ? poi
                : {
                    title: poi.title,
                    point: new BMap.Point(poi.point.lng, poi.point.lat)
                  }
            );
          }
        }
        // forEach(result.zr, (poi, i) => {

        // });
        this.$emit("onPoiChange", this.poiList);
      }
      this.updateLoadingStatus({ isLoading: false });
    },
    onBusLineSearchComplete(result) {
      this.judgeHasDetail();
      // debugger;
      if (result) {
        if (this.directSetBusLine) {
          let item;
          for (let i = 0; i < result.getNumBusList(); i++) {
            const _busline = result.getBusListItem(i);
            if (_busline.name === this.busNum) {
              item = _busline;
              this.busline.getBusLine(item);
            }
          }
        } else {
          this.$emit("onBusLineSearchComplete", result);
        }
        this.directSetBusLine = false;
      }
    },
    onRouteSearchComplete(results) {
      this.judgeHasDetail();
      // debugger;
      if (results && !$.isEmptyObject(results)) {
        const routeResults = [];
        for (let i = 0; i < results.getNumPlans(); i++) {
          routeResults.push(results.getPlan(i));
        }
        this.$emit("onRouteSearchComplete", routeResults);
      }
      this.updateLoadingStatus({ isLoading: false });
    },
    onResultsHtmlSet(html) {
      // debugger;
      switch (this.options.type) {
        case "BUS_LINE":
          forEach(html.children, elem => {
            if (
              elem.localName === "dl" &&
              elem.innerText.indexOf(this.busNum) === -1
            )
              $(elem).hide();
          });
          break;
        case "BUS_STATION":
          forEach($(html).find("li"), elem => {
            if (elem.innerText.indexOf("公交车站") === -1) $(elem).hide();
          });
          break;
        case "TRANSIT_SOLUTION":
          forEach($(html).find("tr.tranroute-plan-list"), (elem, i) => {
            if (this.viaStopsStr) {
              !startsWith(elem.innerText, this.viaStopsStr)
                ? $(elem).hide()
                : setTimeout(() => {
                    $(elem).addClass("expand");
                    $(elem)
                      .find("div.trans_plan_desc")
                      .show();
                  });
            }
            //  else {
            //   i === 0
            //     ? setTimeout(() => {
            //         $(elem).addClass("expand");
            //         $(elem)
            //           .find("div.trans_plan_desc")
            //           .show();
            //       })
            //     : $(elem).hide();
            // }
          });
          break;
      }
    },
    getCurrentPosition() {
      const geolocation = new BMap.Geolocation();
      this.updateLoadingStatus({ isLoading: true });
      getWxLocation().then(
        result => {
          $scope.getCurrentPositionComplete(result);
        },
        error => {
          geolocation.getCurrentPosition(
            //这里不能用ES6的箭头写法
            function(result) {
              // debugger;
              if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                $scope.getCurrentPositionComplete(result);
              } else {
                $scope.isCityPosition = true;
                const localCity = new BMap.LocalCity();
                localCity.get($scope.getCurrentPositionComplete);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 4000,
              maximumAge: 3000
              // SDKLocation: true
            }
          );
        }
      );
      // const localCity = new BMap.LocalCity();
      // localCity.get($scope.getCurrentPositionComplete);
    },
    getCurrentPositionComplete,
    installPlugin() {
      forEach(this.pluginOptions, pluginOption => {
        const plugin = new BMap[pluginOption.plugin + "Control"](
          (pluginOption.option && {
            anchor: window["BMAP_ANCHOR_" + (pluginOption.option.anchor || "")],
            offset: new BMap.Size(...(pluginOption.option.offset || [0, 0])),
            type: window["BMAP_" + pluginOption.option.type],
            enableGeolocation: pluginOption.option.enableGeolocation
          }) ||
            {}
        );
        window["IMap"].addControl(plugin);
        this.plugins.push(plugin);
      });
    },
    uninstallPlugin() {
      forEach(this.plugins, (plugin, index) => {
        window["IMap"].removeControl(plugin);
        delete this.plugins[index];
      });
    },
    onGetBusLineComplete(busLine) {
      this.judgeHasDetail();
      this.$emit("onGetBusLineComplete", busLine);
      this.updateLoadingStatus({ isLoading: false });
    },
    onMarkersSet(markers) {
      switch (this.options.type) {
        case "BUS_STATION":
          forEach(markers, marker => {
            if (marker.type !== BMAP_POI_TYPE_BUSSTOP) {
              marker.marker && marker.marker.hide();
            }
          });
        case "BUS_LINE":
          forEach(markers, (marker, index) => {
            if (marker.V && marker.Bc) {
              marker.V.innerHTML = index + 1;
              marker.V.style["text-align"] = "center";
              marker.V.style["color"] = "#4169E1";
              const markerText = $(marker.V);
              markerText.height(17);
              markerText.width(17);
              const markerPoint = $(marker.Bc).children("div");
              markerPoint.height(17);
              markerPoint.width(17);
              markerPoint.children("img").height(17);
              markerPoint.children("img").width(17);
              // $(marker.Bc).children('div').append('<i>' + index + 1 + '</i>')
            }
          });
          break;
      }
      this.updateLoadingStatus({ isLoading: false });
    },
    refreshMap,
    initRoute,
    initBusline,
    initLocation,
    quertRoute(solution) {
      this.initRoute(solution);
      this.viaStopsStr = solution.viaStopsList.join(" → ");
      this.transit.search(this.start.point, this.end.point);
    },
    judgeHasDetail,
    ...mapMutations(["updateLoadingStatus"])
  },
  beforeCreate() {},
  updated() {},
  mounted() {
    window.$scope = this;
    if (!window["BMap"]) {
      const bmapKey = this.isLocal
        ? "7sOe1hVYh0n2yFCVYkkSLoXY0oQGNbgq"
        : "7sOe1hVYh0n2yFCVYkkSLoXY0oQGNbgq";
      const scriptEl = document.createElement("script");
      scriptEl.setAttribute("type", "text/javascript");
      scriptEl.setAttribute(
        "src",
        `http://api.map.baidu.com/api?v=3.0&ak=${bmapKey}&callback=initMapContainer`
      );
      document.getElementsByTagName("head")[0].appendChild(scriptEl);
    } else {
      initMapContainer(true);
    }
    $("#map-container").height($(window).height() + parseInt(this.height || 0));
    $("#map-container").width($(window).width() + parseInt(this.width || 0));
  },
  destroyed() {
    // delete window["BMap"];
  }
};
</script>

<style>
#map-container {
  overflow: hidden;
  position: relative;
  z-index: 0;
  background-color: rgb(243, 241, 236);
  color: rgb(0, 0, 0);
  text-align: left;
  /* height: 450px; */
}

.tranroute-plan-list.expand .trans-title {
  border-bottom: 1px solid #e4e6e7;
  background-color: #ebf1fb;
}

.tranroute-plan-list.expand .trans-title > p {
  font: 25px arial, sans-serif !important;
}

.trans-plan-content {
  font: 18px arial, sans-serif;
}

.trans_plan_desc > div > div {
  font: 18px arial, sans-serif;
}
/* .trans_plan_desc > div > div > div {
  border-bottom: 1px solid #bebebe;
} */

.navtrans-bus-desc {
  line-height: 30px !important;
  margin-left: 20px;
  /* border-bottom: 1px solid #bebebe; */
}

/* .trans_plan_desc::before {
  position: absolute;
  content: "";
  height: 100%;
  width: 2px;
  left: 15px;
  top: 0;
  background-color: #BEBEBE;
} */
</style>

//启用数据库  
// webSettings.setDatabaseEnabled(true);    
// String dir = this.getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath(); 
//启用地理定位  
// webSettings.setGeolocationEnabled(true);  
//设置定位的数据库路径  
// webSettings.setGeolocationDatabasePath(dir);   
//最重要的方法，一定要设置，这就是出不来的主要原因
// webSettings.setDomStorageEnabled(true);
//配置权限（同样在WebChromeClient中实现）  