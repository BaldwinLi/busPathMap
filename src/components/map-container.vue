<template>
  <div class="home-content">
    <div ref="mapContainer" v-show="showMap" id="map-container"></div>
    <div ref="pathResult" v-show="showPathResult" id="bus-path-result"></div>
  </div>
</template>

<script>
// import { TRANSIT_POLICY } from './map-config.js'
import { forEach, debounce } from "lodash";
import { mapMutations } from "vuex";
let $scope;
window["initMapContainer"] = () => {
  window["IMap"] = new BMap.Map("map-container");
  $scope.getCurrentPosition();
  $scope.geoc = new BMap.Geocoder();
  // window["IMap"].centerAndZoom(new BMap.Point(121.45, 39.02), 11);
  window["IMap"].addEventListener("click", function(e) {
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
  $scope.location = new BMap.LocalSearch("大连", {
    renderOptions:
      ($scope.options.type === "BUS_STATION" && {
        map: IMap,
        panel: "bus-path-result"
      }) ||
      {},
    pageCapacity: $scope.options.type === "BUS_STATION" ? 100 : 10,
    onMarkersSet: $scope.onMarkersSet,
    onResultsHtmlSet: $scope.onResultsHtmlSet,
    onSearchComplete: $scope.onLocalSearchComplete
  });
  switch ($scope.options.type) {
    // case "LOCAL_SEARCH":

    //   break;
    case "BUS_LINE":
      $scope.busline = new BMap.BusLineSearch("大连", {
        renderOptions: {
          map: IMap,
          panel: "bus-path-result"
        },
        onGetBusListComplete: $scope.onBusLineSearchComplete,
        onGetBusLineComplete: $scope.onGetBusLineComplete,
        onBusListHtmlSet: $scope.onResultsHtmlSet,
        onMarkersSet: $scope.onMarkersSet
      });
      break;
    case "TRANSIT_SOLUTION":
      $scope.transit = new BMap.TransitRoute("大连", {
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
      break;
  }
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
      $("#map-container").height($("body").height() + parseInt(height || 0));
    },
    width(width) {
      // this.$refs["mapContainer"] &&
      //   (this.$refs["mapContainer"].style.width = width);
      $("#map-container").width($("body").width() + parseInt(width || 0));
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
      if (val) {
        this.updateLoadingStatus({ isLoading: true });
        $scope.poiList.length = 0;
        $scope.location.search(val);
      }
    },
    endText(val, old) {
      // $scope.transit.search($scope.start, val);
      if (val) {
        this.updateLoadingStatus({ isLoading: true });
        $scope.poiList.length = 0;
        $scope.location.search(val);
      }
    },
    start(val) {
      if (val.point) {
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
      if ($scope.start.point && val.point) {
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
            if ($scope.start.point && $scope.end.point) {
              const _start = new BMap.Point(
                $scope.start.point.lng,
                $scope.start.point.lat
              );
              const _end = new BMap.Point(
                $scope.end.point.lng,
                $scope.end.point.lat
              );
              $scope.transit.search(_start, _end);
            }
            break;
          case "BUS_LINE":
            this.directSetBusLine = true;
            const numberMatch = this.busNum.match(/\d+/);
            $scope.busline.getBusList(numberMatch && numberMatch[0]);
            break;
          case "BUS_STATION":
            if ($scope.start.point) {
              const _start = new BMap.Point(
                $scope.start.point.lng,
                $scope.start.point.lat
              );
              this.location.searchNearby(
                $scope.start.title.split("-")[0],
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
      if (result) {
        this.poiList.length = 0;
        forEach(result.tr, (poi, i) => {
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
        });
        this.$emit("onPoiChange", this.poiList);
        this.updateLoadingStatus({ isLoading: false });
      }
    },
    onBusLineSearchComplete(result) {
      if (result) {
        if (this.directSetBusLine) {
          const item = result.LA.find(e => e.name === this.busNum);
          this.busline.getBusLine(item);
        } else {
          this.$emit("onBusLineSearchComplete", result);
        }
        this.directSetBusLine = false;
      }
    },
    onTranitRouteSearchComplete(results) {
      if (results) {
        this.$emit("onTranitRouteSearchComplete", results);
        this.updateLoadingStatus({ isLoading: false });
      }
    },
    onResultsHtmlSet(html) {
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
      geolocation.getCurrentPosition(
        function(result) {
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
    },
    getCurrentPositionComplete(result) {
      let center = result.point || result.center;
      let centerPoint;
      if (result.level > 1) {
        window["IMap"].centerAndZoom(
          new BMap.Point(center.lng, center.lat),
          this.zoom
        );
      } else {
        center = result.point = result.center = new BMap.Point(
          121.618726,
          38.919333
        );
        result.name = "大连";
        window["IMap"].centerAndZoom(
          new BMap.Point(center.lng, center.lat),
          this.zoom
        );
      }
      const icon = new BMap.Icon(
        "http://api0.map.bdimg.com/images/stop_icon.png",
        new BMap.Size(23, 25),
        {
          offset: new BMap.Size(10, 25),
          imageOffset: new BMap.Size(0, 0)
        }
      );
      icon.imageSize = new BMap.Size(15, 15);
      var marker = new BMap.Marker(center, {
        icon
      }); // 创建标注
      window["IMap"].addOverlay(marker);
      window["IMap"].panTo(center);
      window["IMap"].enableScrollWheelZoom();
      switch (this.options.type) {
        case "BUS_STATION":
          this.start.point = center;
          this.location.searchNearby(result.name, this.start.point);
      }
      this.$emit("onGeolocationComplete", result);
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
              marker.marker.hide();
            }
          });
          break;
        case "BUS_LINE":
          forEach(markers, (marker, index) => {
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
  height: 450px;
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