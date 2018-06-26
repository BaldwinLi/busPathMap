<template>
  <div class="home-content">
    <div ref="mapContainer" v-if="options.showType === 'MAP_RESULT'" id="map-container"></div>
    <div ref="pathResult" v-if="options.showType === 'PATH_RESULT'" id="bus-path-result"></div>
  </div>
</template>

<script>
// import { TRANSIT_POLICY } from './map-config.js'
import { forEach } from "lodash";
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
      const stationName = rs.business && rs.business.split(",")[0];
      $scope.$vux.alert.show({
        content: stationName
      });
    });
  });
  switch ($scope.options.type) {
    case "LOCAL_SEARCH":
      $scope.location = new BMap.LocalSearch(IMap, {
        renderOptions: {
          map: IMap
        },
        onSearchComplete: $scope.onLocalSearchComplete
      });
      break;
    case "BUS_LINE":
      $scope.busline = new BMap.BusLineSearch(IMap, {
        renderOptions: {
          map: IMap,
          panel: "bus-path-result"
        },
        onGetBusListComplete: $scope.onBusLineSearchComplete
      });
      break;
    case "TRANSIT_SOLUTION":
      $scope.transit = new BMap.TransitRoute(IMap, {
        renderOptions: {
          map: IMap
        },
        policy: $scope.options.policy,
        onSearchComplete: $scope.onTranitRouteSearchComplete
      });
      break;
  }
  $scope.installPlugin();
  $scope.$emit("onLoadComplete", $scope);
  $($scope.$refs.mapContainer).height($('body').height() + parseInt($scope.height || 0));
  $($scope.$refs.mapContainer).width($('body').width() + parseInt($scope.width || 0));
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
      plugins: []
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
          showType: "MAP_RESULT",
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
    }
  },
  computed: {
    ...mapGetters(["isLocal"])
  },
  watch: {
    height(height) {
      // this.$refs["mapContainer"] &&
      //   (this.$refs["mapContainer"].style.height = height);
      $('#map-container').height($('body').height() + parseInt(height || 0));
    },
    width(width) {
      // this.$refs["mapContainer"] &&
      //   (this.$refs["mapContainer"].style.width = width);
      $('#map-container').width($('body').width() + parseInt(width || 0));
    }
  },
  methods: {
    onLocalSearchComplete(result) {
      if (result) {
        for (var i = 0; i < result.getCurrentNumPois(); i++) {
          const poi = result.getPoi(i);
          if (poi.type == BMAP_POI_TYPE_BUSSTOP) {
            busPoi = poi;
          }
        }
      }
    },
    onBusLineSearchComplete(result) {
      if (result) {
        const fstLine = result.getBusListItem(0); //获取第一个公交列表显示到map上
        this.busline.getBusLine(fstLine);
      }
    },
    onTranitRouteSearchComplete(result) {
      if (result) {
        // alert(result)
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
          maximumAge: 3000,
          SDKLocation: true
        }
      );
    },
    getCurrentPositionComplete(result) {
      const center = result.point || result.center;
      window["IMap"].centerAndZoom(
        new BMap.Point(center.lng, center.lat),
        this.zoom
      );
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
    }
  },
  beforeCreate() {
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
  },
  updated() {},
  mounted() {}
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
  height: 600px;
}
</style>