<template>
  <div class="home-content">
    <div ref="mapContainer" v-show="showMap" id="map-container"></div>
    <div ref="pathResult" v-show="showPathResult" id="bus-path-result"></div>
  </div>
</template>

<script>
// import { TRANSIT_POLICY } from './map-config.js'
import { forEach, debounce } from "lodash";
import { getWxLocation } from "@/helper/jssdk-loader";
import { mapMutations } from "vuex";
import { coordinatesOffsetList } from "./map-config";
let $scope;
window["initMapContainer"] = () => {
  window["IMap"] = new BMap.Map("map-container");
  $scope.geoc = new BMap.Geocoder();
  // window["IMap"].centerAndZoom(new BMap.Point(121.45, 39.02), 11);
  window["IMap"].addEventListener("click", e => {
    const point = new BMap.Point(e.point.lng, e.point.lat);
    // transit.search(point, point);
    $scope.geoc.getLocation(point, rs => {
      // const stationName = rs.business && rs.business.split(",")[0];

      if (rs.surroundingPois.length > 0) {
        $scope.$vux.confirm.show({
          title: rs.surroundingPois[0].title,
          content: rs.surroundingPois[0].address,
          onConfirm() {
            $scope.$emit("onGetClickPoi", {
              title: rs.surroundingPois[0].title,
              point: rs.surroundingPois[0].point
            });
          }
        });
      }
    });
  });
  $scope.location = new BMap.LocalSearch(IMap, {
    renderOptions:
      ($scope.options.type === "BUS_STATION" && {
        map: IMap
        // panel: "bus-path-result"
      }) ||
      {},
    pageCapacity: $scope.options.type === "BUS_STATION" ? 100 : 10,
    onMarkersSet: $scope.onMarkersSet,
    onResultsHtmlSet: $scope.onResultsHtmlSet,
    onSearchComplete: $scope.onLocalSearchComplete
  });
  // switch ($scope.options.type) {
  // case "LOCAL_SEARCH":

  //   break;
  // case "BUS_LINE":
  $scope.busline = new BMap.BusLineSearch(IMap, {
    renderOptions: {
      map: IMap,
      panel: "bus-path-result",
      autoViewport: true
    },
    onGetBusListComplete: $scope.onBusLineSearchComplete,
    onGetBusLineComplete: $scope.onGetBusLineComplete,
    onBusListHtmlSet: $scope.onResultsHtmlSet,
    onMarkersSet: $scope.onMarkersSet
  });
  // break;
  // case "TRANSIT_SOLUTION":
  $scope.transit = new BMap.TransitRoute(IMap, {
    renderOptions: {
      map: IMap,
      panel: "bus-path-result"
    },
    policy: BMAP_TRANSIT_POLICY_RECOMMEND,
    onSearchComplete: $scope.onTranitRouteSearchComplete,
    onResultsHtmlSet: $scope.onResultsHtmlSet
  });
  // const point1 = new BMap.Point(121.639142, 38.928159);
  // const point2 = new BMap.Point(121.600622, 38.901096);
  // $scope.transit.search(point1, point2);
  // break;
  // }
  $scope.installPlugin();
  $scope.$emit("onLoadComplete", $scope);
  $($scope.$refs.mapContainer).height(
    $("body").height() + parseInt($scope.height || 0)
  );
  $($scope.$refs.mapContainer).width(
    $("body").width() + parseInt($scope.width || 0)
  );
};

import { mapGetters } from "vuex";
import { setTimeout } from "timers";

export default {
  name: "map-container",
  data() {
    return {
      busline: Object,
      transit: Object,
      geoc: Object,
      location: Object,
      busPoi: Object,
      plugins: [],
      poiList: [],
      directSetBusLine: false
    };
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
      // this.$refs["mapContainer"] &&
      //   (this.$refs["mapContainer"].style.height = height);
      $("#map-container").height($(document).height() + parseInt(height || 0));
    },
    width(width) {
      // this.$refs["mapContainer"] &&
      //   (this.$refs["mapContainer"].style.width = width);
      $("#map-container").width($(document).width() + parseInt(width || 0));
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
              $scope.start.title.split("-")[0],
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
        this.updateLoadingStatus({ isLoading: true });
        switch ($scope.options.type) {
          case "TRANSIT_SOLUTION":
            const _start = new BMap.Point(
              $scope.start.point && $scope.start.point.lng,
              $scope.start.point && $scope.start.point.lat
            );
            const _end = new BMap.Point(
              $scope.end.point && $scope.end.point.lng,
              $scope.end.point && $scope.end.point.lat
            );
            $scope.transit.search(_start, _end);
            break;
          case "BUS_LINE":
            this.directSetBusLine = true;
            const numberMatch = this.busNum.match(/\d+/);
            if (numberMatch) $scope.busline.getBusList(numberMatch[0]);
            else this.updateLoadingStatus({ isLoading: false });
            break;
          case "BUS_STATION":
            if ($scope.start.point) {
              const _start = new BMap.Point(
                $scope.start.point.lng,
                $scope.start.point.lat
              );
              this.location.searchNearby(
                ($scope.start.title && $scope.start.title.split("-")[0]) || "",
                _start
              );
            } else this.updateLoadingStatus({ isLoading: false });
            break;
        }
      }
    },
    showPathResult(val) {
      // if (val) {
      //   this.updateLoadingStatus({ isLoading: true });
      //   switch ($scope.options.type) {
      //     case "TRANSIT_SOLUTION":
      //       const _start = new BMap.Point(
      //         $scope.start.point.lng,
      //         $scope.start.point.lat
      //       );
      //       const _end = new BMap.Point(
      //         $scope.end.point.lng,
      //         $scope.end.point.lat
      //       );
      //       $scope.transit.search(_start, _end);
      //       break;
      //   }
      // }
    }
  },
  methods: {
    onLocalSearchComplete(result) {
      // debugger;
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
    onTranitRouteSearchComplete(results) {
      // debugger;
      if (results) {
        this.$emit("onTranitRouteSearchComplete", results);
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
    getCurrentPositionComplete(result) {
      // debugger;
      let center;
      if (result.type === "wgs84") {
        center = result.point = result.center = new BMap.Point(
          result.longitude,
          result.latitude
        );
        result.name = "";
        window["IMap"].centerAndZoom(center, this.zoom);
        window["IMap"].addControl(new BMap.NavigationControl());
      } else {
        center = result.point || result.center;
        if (result.level === 1) {
          center = result.point = result.center = new BMap.Point(
            121.618726,
            38.919333
          );
          result.name = "哈尔滨";
        } else result.point = result.center = center;
      }
      //坐标转换完之后的回调函数
      const translateCallback = data => {
        if (data.status === 0) {
          const icon = new BMap.Icon(
            "http://api0.map.bdimg.com/images/stop_icon.png",
            new BMap.Size(15, 15),
            {
              offset: new BMap.Size(10, 25),
              imageOffset: new BMap.Size(0, 0)
            }
          );
          icon.imageSize = new BMap.Size(15, 15);
          const marker = new BMap.Marker(data.points[0], {
            icon
          }); // 创建标注
          const finalCallback = res => {
            res && (result.name = res.getPoi(0) && res.getPoi(0).title);
            switch (this.options.type) {
              case "BUS_STATION":
                this.start.point = center;
                this.location.searchNearby(result.name, this.start.point);
            }
            this.$emit("onGeolocationComplete", result);
            this.updateLoadingStatus({ isLoading: false });
          };
          if (!result.name) {
            new BMap.LocalSearch(data.points[0], {
              onSearchComplete: finalCallback
            }).searchNearby(
              "公交站",
              new BMap.Point(
                // 121.618726,
                // 38.919333
                data.points[0].lng,
                data.points[0].lat
              ),
              1000
            );
          } else {
            finalCallback();
          }
          // this.location.searchNearby("", this.start.point);
          window["IMap"].centerAndZoom(data.points[0], this.zoom);
          window["IMap"].addOverlay(marker);
          window["IMap"].addOverlay(new BMap.Circle(data.points[0], 1000, {
            fillColor: "#0099ff",
            strokeWeight: 1,
            fillOpacity: 0.3,
            strokeOpacity: 0.3
          }));
          window["IMap"].panTo(data.points[0]);
          window["IMap"].enableScrollWheelZoom();
        }
      };
      if (["gcj02", "wgs84"].includes(result.type)) {
        setTimeout(() => {
          const convertor = new BMap.Convertor();
          convertor.translate(
            [center],
            coordinatesOffsetList[result.type].x,
            coordinatesOffsetList[result.type].y,
            translateCallback
          );
        });
      } else {
        translateCallback({ status: 0, points: [center] });
      }
    },
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
    ...mapMutations(["updateLoadingStatus"])
  },
  beforeCreate() {},
  updated() {},
  mounted() {
    $scope = this;
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
      initMapContainer();
    }
    $("#map-container").height(
      $(document).height() + parseInt(this.height || 0)
    );
    $("#map-container").width($(document).width() + parseInt(this.width || 0));
  },
  destroyed() {
    delete window["BMap"];
  }
};
</script>

<style scoped>
#map-container {
  overflow: hidden;
  position: relative;
  z-index: 0;
  background-color: rgb(243, 241, 236);
  color: rgb(0, 0, 0);
  text-align: left;
  /* height: 450px; */
}
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