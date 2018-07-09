<template>
  <div>
    <search
          v-model="busNum"
          position="relative"
          placeholder="请输入公交线路号"
          auto-scroll-to-top
          top="0"
          @result-click="setBusLine"
          :results="searchResults"
          ref="search">
      <!-- cancel-text="搜索" -->
      <!-- <i slot="left" v-if="!isShowList" @click="hideList" class="fa fa-angle-left" style="font-size: 2.5rem; margin-right: 1rem;" aria-hidden="true"></i> -->
    </search>
    <map-container
      ref="mapContainer"
      :busNum="busNum"
      :fstLine="fstLine"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      :height="30"
      :showMap="showMap"
      :showPathResult="showPathResult"
      @onLoadComplete="loadComplete"
      @onBusLineSearchComplete="onBusLineSearchComplete"
      @onGeolocationComplete="onGeolocationComplete">
    </map-container>
  </div>
</template>

<script>
import { map } from "lodash";
import { Cell, Search } from "vux";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";

export default {
  components: {
    Search,
    Cell,
    MapContainer
  },
  data() {
    return {
      options: {
        type: "BUS_LINE",
        showType: "MAP_RESULT",
        policy: 0
      },
      busNum: "",
      showMap: true,
      showPathResult: false,
      commonPluginOptions,
      searchResults: [],
      fstLine: {}
    };
  },
  methods: {
    onBusLineSearchComplete(event) {
      this.searchResults = map(event["LA"], (line, index) => {
        return {
          title: line.name,
          lineItem: event.getBusListItem(index)
        };
      });
    },
    loadComplete(event) {},
    onGeolocationComplete(event) {},
    setBusLine(val) {
      this.fstLine = val.lineItem;
    }
  }
};
</script>

<style>
.vux-demo {
  text-align: center;
}
.logo {
  width: 100px;
  height: 100px;
}
</style>
