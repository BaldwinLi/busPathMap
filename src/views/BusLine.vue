<template>
  <div>
    <search
          v-model="busNum"
          position="relative"
          placeholder="请输入公交线路号"
          auto-scroll-to-top
          top="0"
          @result-click="setBusLine"
          :results="forwardLineList"
          ref="search">
      <!-- cancel-text="搜索" -->
      <!-- <i slot="left" v-if="!isShowList" @click="hideList" class="fa fa-angle-left" style="font-size: 2.5rem; margin-right: 1rem;" aria-hidden="true"></i> -->
    </search>
    <map-container
      ref="mapContainer"
      :busNum="busNum"
      :fstLine="fstLine.lineItem"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      :height="130"
      :showMap="showMap"
      :showPathResult="showPathResult"
      @onLoadComplete="loadComplete"
      @onBusLineSearchComplete="onBusLineSearchComplete"
      @onGeolocationComplete="onGeolocationComplete">
    </map-container>
  </div>
</template>

<script>
import { forEach } from "lodash";
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
      forwardLineList: [],
      reverseLineList: [],
      fstLine: {}
    };
  },
  methods: {
    onBusLineSearchComplete(event) {
      forEach(event["LA"], (line, index) => {
        const lineObj = {
          title: line.name,
          lineItem: event.getBusListItem(index),
          index
        };
        index%2 ? this.reverseLineList.push(lineObj) : this.forwardLineList.push(lineObj);
      });
    },
    loadComplete(event) {},
    onGeolocationComplete(event) {},
    setBusLine(val) {
      this.fstLine = val;
      document.activeElement.blur();
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
