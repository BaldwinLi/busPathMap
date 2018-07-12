<template>
  <div>
    <tab>
      <tab-item :selected="showMap" @on-item-click="onItemClick">公交路线图</tab-item>
      <tab-item :selected="showPathResult" @on-item-click="onItemClick">公交站点列表</tab-item>
    </tab>
    <cell primary="content" style="background-color: #fff;">
      <div slot="title" class="input-header">
      <search
          v-model="busNum"
          position="relative"
          placeholder="请输入公交线路号"
          auto-scroll-to-top
          top="0"
          @on-submit="setBusLine(0)"
          @on-focus="onFocus()"
          @result-click="setBusLine"
          :results="searchResults"
          ref="search">
      <!-- cancel-text="搜索" -->
      <!-- <i slot="left" v-if="!isShowList" @click="hideList" class="fa fa-angle-left" style="font-size: 2.5rem; margin-right: 1rem;" aria-hidden="true"></i> -->
      </search>
      </div>
      <div slot class="input-body">
        <i class="fa fa-exchange reverse-position" aria-hidden="true" @click="reversePosition"></i>
      </div>
    </cell>
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
      @onGetBusLineComplete="onGetBusLineComplete"
      @onGeolocationComplete="onGeolocationComplete">
    </map-container>
  </div>
</template>

<script>
import { forEach, cloneDeep } from "lodash";
import { Cell, Search, Tab, TabItem } from "vux";
import { mapMutations } from "vuex";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";
import { storeBusLineKeyword } from "@/helper/utils";
import { setTimeout } from "timers";
let historyForwardBusline;
let historyReverseBusline;
export default {
  components: {
    Search,
    Cell,
    MapContainer,
    Tab,
    TabItem
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
      searchResults: cloneDeep(historyForwardBusline),
      forwardLineList: cloneDeep(historyForwardBusline),
      reverseLineList: cloneDeep(historyReverseBusline),
      fstLine: {}
    };
  },
  methods: {
    onBusLineSearchComplete(event) {
      this.reverseLineList.length = 0;
      this.forwardLineList.length = 0;
      forEach(event["LA"], (line, index) => {
        const lineObj = {
          title: line.name,
          lineItem: event.getBusListItem(index),
          index: Math.floor(index / 2),
          isForward: !(index % 2)
        };
        index % 2
          ? this.reverseLineList.push(lineObj)
          : this.forwardLineList.push(lineObj);
      });
      this.forwardLineList = this.forwardLineList.concat(historyForwardBusline);
      this.reverseLineList = this.reverseLineList.concat(historyReverseBusline);
      this.searchResults = this.forwardLineList;
    },
    loadComplete(event) {},
    onGeolocationComplete(event) {},
    onGetBusLineComplete (busline) {
      this.busNum = busline.name;
    },
    setBusLine(val) {
      val = val || this.searchResults[0];
      if (val.lineItem) {
        this.fstLine = val;
        storeBusLineKeyword({
          forward: { title: val.title },
          reverse: { title: this.reverseLineList[val.index].title }
        });
      }
      this.busNum = val.title;
      document.activeElement.blur();
      this.cancelSearch();
    },
    reversePosition() {
      if (this.fstLine.lineItem) {
        this.fstLine = this.fstLine.isForward
          ? this.reverseLineList[this.fstLine.index]
          : this.forwardLineList[this.fstLine.index];
        this.busNum = this.fstLine.title;
      } else {
        let index;
        const isForward = historyForwardBusline.some((e, i) => {
          if (e.title === this.busNum) {
            index = i;
            return true;
          }
        });
        !isForward &&
          historyReverseBusline.some((e, i) => {
            if (e.title === this.busNum) {
              index = i;
              return true;
            }
          });
        this.busNum = (isForward
          ? historyReverseBusline[index]
          : historyForwardBusline[index]
        ).title;
      }
    },
    onFocus() {
      !this.busNum && setTimeout(() => {
        this.searchResults = historyForwardBusline = storeBusLineKeyword().map(
          v => v.forward
        );
        this.forwardLineList = storeBusLineKeyword().map(v => v.forward);
        this.reverseLineList = historyReverseBusline = storeBusLineKeyword().map(
          v => v.reverse
        );
      });
    },
    onItemClick(index) {
      this.showMap = index === 0;
      this.showPathResult = index === 1;
    },
    cancelSearch() {
      setTimeout(() => {
        this.$refs.search.isCancel = true;
        this.$refs.search.emitEvent();
        this.$refs.search.isFixed = false;
        // ref.$emit("on-cancel");
        this.searchResults.length > 0 && (this.searchResults = []);
      });
    },
    ...mapMutations(["updateTitle"])
  },
  mounted() {
    this.updateTitle("公交线路查询");
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
</style>
