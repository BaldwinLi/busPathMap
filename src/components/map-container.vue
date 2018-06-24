<template>
  <div class="home-content">
    <div ref="mapContainer" v-if="options.showType === 'MAP_RESULT'" id="map-container"></div>
    <div ref="pathResult" v-if="options.showType === 'PATH_RESULT'" id="bus-path-result"></div>
  </div>
</template>

<script>
// import { TRANSIT_POLICY } from './map-config.js'
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
        policy: this.options.policy,
        onSearchComplete: $scope.onTranitRouteSearchComplete
      });
      break;
  }
  $scope.$emit("onLoadComplete", $scope);
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
      busPoi: Object
    };
  },
  props: {
    height: String,
    width: String,
    options: {
      type: Object,
      default() {
        return {
          type: "BUS_LINE",
          showType: "MAP_RESULT",
          policy: 0
        };
      }
    }
  },
  computed: {
    ...mapGetters(["isLocal"])
  },
  watch: {
    height(height) {
      this.$refs["mapContainer"] &&
        (this.$refs["mapContainer"].style.height = height);
    },
    width(width) {
      this.$refs["mapContainer"] &&
        (this.$refs["mapContainer"].style.width = width);
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
      window["IMap"].centerAndZoom(new BMap.Point(center.lng, center.lat), 12);
      this.$emit("onGeolocationComplete", result);
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