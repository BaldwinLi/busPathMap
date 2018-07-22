<template>
  <div>
    <tab>
      <tab-item :selected="showMap" @on-item-click="onItemClick">公交路线图</tab-item>
      <tab-item :selected="showPathResult" @on-item-click="onItemClick">公交站点列表</tab-item>
    </tab>
    <cell primary="content" class="search-field" v-show="showMap" style="background-color: #fff;">
      <div slot="title" class="input-header">
      <!-- style="position: relative;" -->
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
      <div slot class="input-body" @click="reversePosition">
        <i class="fa fa-exchange reverse-position" aria-hidden="true" ></i>
      </div>
    </cell>
    <map-container
      ref="mapContainer"
      :busNum="busNum"
      :fstLine="fstLine.lineItem"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      :height="-43"
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
import { loadWeChatSdk } from "@/helper/jssdk-loader";
import { commonPluginOptions } from "@/components/map-config";
import { storeBusLineKeyword } from "@/helper/utils";
import { setTimeout } from "timers";
let historyForwardBusline = [];
let historyReverseBusline = [];
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
      for (let i = 0; i < event.getNumBusList(); i++) {
        const line = event.getBusListItem(i);
        const lineObj = {
          title: line.name,
          lineItem: event.getBusListItem(i),
          index: Math.floor(i / 2),
          isForward: !(i % 2)
        };
        i % 2
          ? this.reverseLineList.push(lineObj)
          : this.forwardLineList.push(lineObj);
      }
      // forEach(event["XA"], (line, index) => {});
      this.forwardLineList = this.forwardLineList.concat(historyForwardBusline);
      this.reverseLineList = this.reverseLineList.concat(historyReverseBusline);
      this.searchResults = this.forwardLineList;
    },
    loadComplete(event) {
      loadWeChatSdk([
        "startRecord",
        "stopRecord",
        "translateVoice",
        "getLocation"
      ]).then(
        success => {
          success === "SUCCESS" &&
            this.$refs["mapContainer"].getCurrentPosition();
        },
        error => {
          this.$refs["mapContainer"].getCurrentPosition();
        }
      );
    },
    onGeolocationComplete(event) {
      if (this.$route.query["busNum"]) {
        this.busNum = this.$route.query["busNum"];
      }
    },
    onGetBusLineComplete(busline) {
      this.busNum = busline.name;
    },
    setBusLine(val) {
      val = val || this.searchResults[0];
      if (val && val.lineItem) {
        this.fstLine = val;
        storeBusLineKeyword({
          forward: { title: val.title },
          reverse: { title: this.reverseLineList[val.index].title }
        });
      }
      val && val.title && (this.busNum = val.title);
      document.activeElement.blur();
      this.cancelSearch();
      this.relocate();
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
        let lineText;
        if (
          historyReverseBusline.length === 0 ||
          historyForwardBusline.length === 0
        ) {
          const _regExp = new RegExp('(?<=\\().*?(?=\\))')
          const lineMatch = this.busNum.match(_regExp);
          lineText = lineMatch && lineMatch[0];
          this.busNum = this.busNum.replace(_regExp, lineText.split('-').reverse().join('-'));
        } else {
          this.busNum = (isForward
            ? historyReverseBusline[index]
            : historyForwardBusline[index]
          ).title;
        }
      }
      this.relocate();
    },
    onFocus() {
      const scope = this;
      !this.busNum &&
        setTimeout(() => {
          scope.searchResults = historyForwardBusline = storeBusLineKeyword().map(
            v => v.forward
          );
          scope.forwardLineList = storeBusLineKeyword().map(v => v.forward);
          scope.reverseLineList = historyReverseBusline = storeBusLineKeyword().map(
            v => v.reverse
          );
        });
    },
    onItemClick(index) {
      this.showMap = index === 0;
      this.showPathResult = index === 1;
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
    relocate() {
      window.location.href = `${window.location.origin +
        window.location.pathname}#${this.$route.path}?busNum=${this.busNum}`;
    },
    ...mapMutations(["updateTitle"])
  },
  beforeCreate() {},
  mounted() {
    this.updateTitle("公交线路查询");
  }
};
</script>

<style scoped>
.input-body {
  width: 8rem;
  text-align: center;
}
.reverse-position {
  font-size: 3rem;
}

.search-field {
  background-color: rgb(255, 255, 255);
  position: fixed;
  z-index: 7;
  left: 7%;
  margin: 1rem auto;
}
</style>
