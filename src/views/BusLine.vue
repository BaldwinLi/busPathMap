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
      :showPathResult="false"
      @onLoadComplete="loadComplete"
      @onBusLineSearchComplete="onBusLineSearchComplete"
      @onGetBusLineComplete="onGetBusLineComplete"
      @onGeolocationComplete="onGeolocationComplete">
    </map-container>
    <card v-show="showPathResult">
      <div slot="header" class="weui-panel__hd card-header">
          <p class="busline-header">{{buslineDetail.name}}</p>
          <p class="busline-header">{{buslineDetail.lineName}}</p>
          <p class="busline-sub">{{buslineDetail.company}}</p>
          <p class="busline-time">
            <span class="start-time">{{buslineDetail.startTime}}</span>
            <span class="end-time">{{buslineDetail.endTime}}</span>
          </p>
      </div>
      <div slot="content" class="card-flex">
        <cell primary="title">
          <div slot="title" style="display: inline-flex; width: 100%">
            <span class="realtime-bus" v-for="(item, index) in realtimeBuses" :key="index">
              <div><i :style="{'background-color': busCrowdConfig[item.crowd]}" class="item-onroute iconfont icon-gongjiao"></i>{{item.stops + '站'}}</div>
              <div>{{item.distance + '公里'}}</div>
            </span>
          </div>
          <div>
            <div class="crowd-desc loose">宽松</div>
            <div class="crowd-desc comfort">舒适</div>
            <div class="crowd-desc crowd">拥挤</div>
          </div>
        </cell>
        <div>
          <busline :color="'#BEBEBE'">
            <busline-item v-for="(item, index) in buslineDetail.stations" :key="index" :stopNum="index + 1" :onTheRoute="busCrowdConfig[item.onTheRoute]"
            @click.native="selectBusPathStation(item, index)">
              <p class="busline-time">{{item.name}}</p>
              <x-button mini type="primary" 
              class="busline-item-button" 
              :plain="item.reminder" 
              v-show="item.selected || item.reminder" 
              @click.native="setReminder(item, index)">
                {{item.reminder ? "已设提醒" : "设置提醒"}}
              </x-button>
			      </busline-item>
          </busline>
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import { forEach, cloneDeep, trim, map } from "lodash";
import { Cell, CellBox, Search, Tab, TabItem, Card, XButton } from "vux";
import { mapMutations, mapGetters } from "vuex";
import MapContainer from "@/components/map-container";
import Busline from "@/components/busline/busline";
import BuslineItem from "@/components/busline/busline-item";
import { loadWeChatSdk } from "@/helper/jssdk-loader";
import { commonPluginOptions } from "@/components/map-config";
import { storeBusLineKeyword } from "@/helper/utils";
import { setTimeout, setInterval, clearInterval } from "timers";
let historyForwardBusline;
let historyReverseBusline;
export default {
  components: {
    Search,
    Cell,
    CellBox,
    MapContainer,
    Tab,
    TabItem,
    Card,
    Busline,
    BuslineItem,
    XButton
  },
  data() {
    return {
      options: {
        type: "BUS_LINE",
        showType: "MAP_RESULT",
        policy: 0
      },
      busCrowdConfig: ["#00ff00", "#FFA500", "#EE2C2C"],
      busNum: "",
      showMap: true,
      showPathResult: false,
      commonPluginOptions,
      searchResults: cloneDeep(historyForwardBusline),
      forwardLineList: cloneDeep(historyForwardBusline),
      reverseLineList: cloneDeep(historyReverseBusline),
      fstLine: {},
      buslineDetail: {},
      realtimeBuses: [
        {
          distance: 2,
          stops: 6,
          crowd: 0
        },
        {
          distance: 3,
          stops: 7,
          crowd: 2
        },
        {
          distance: 3.6,
          stops: 8,
          crowd: 0
        }
      ],
      intervalInstance: null
    };
  },
  computed: {
    ...mapGetters(['appContextPath'])
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
      this.$autoGetCurrentPosition();
    },
    onGeolocationComplete(event) {
      if (this.$route.query["busNum"]) {
        this.busNum = this.$route.query["busNum"];
      }
    },
    onGetBusLineComplete(busline) {
      if (busline) {
        const stations = [];
        for (let i = 0; i < busline.getNumBusStations(); i++) {
          const station = busline.getBusStation(i);
          let onTheRoute;
          if (i === 5) onTheRoute = 0; 
          else if (i === 3) onTheRoute = 2;
          else if (i === 7) onTheRoute = 1;
          stations.push({
            onTheRoute,
            name: station.name,
            position: station.position
          });
        }
        // stations.$set(0, { childMsg: 'Changed!'});
        const _busline = busline.name;
        this.buslineDetail = {
          name: _busline.split("(")[0],
          lineName: _busline.split("(")[1].replace(/\)+$/, ""),
          company: busline.company,
          startTime: busline.startTime,
          endTime: busline.endTime,
          stations
        };
        this.busNum = busline.name;
        const params = $.param({
          v_line_uuid: busline.name.match(/^\d+/)[0],
          v_line_dir: busline.dir,
          // v_line_bdid: ''
        });
        this.intervalInstance = setInterval(() => {
          this.$http.post(`${this.appContextPath}oneBusStation`, params).then(result => {
            const buslist = result.data.responseBody || [];
          });
        }, 3000);
        
      }
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
          // const _regExp = new RegExp('(?<=\\().*?(?=\\))')
          // const lineMatch = this.busNum.match(_regExp);
          // lineText = lineMatch && lineMatch[0];
          const cacheText = trim(this.busNum, ")").split("(");
          lineText = cacheText[1] || "";
          // this.busNum = this.busNum.replace(
          //   _regExp,
          this.busNum = `${cacheText[0]}(${lineText
            .split("-")
            .reverse()
            .join("-")})`;
          // );
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
          scope.searchResults = scope.forwardLineList = historyForwardBusline = storeBusLineKeyword().map(
            v => v.forward
          );
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
    selectBusPathStation(item, index) {
      this.buslineDetail.stations = map(this.buslineDetail.stations, (e, i) => {
        e.selected = index === i;
        return e;
      });
    },
    setReminder(item, index) {
      item.reminder = !item.reminder;
      this.$set(this.buslineDetail.stations, index, item);
    },
    ...mapMutations(["updateTitle"])
  },
  beforeCreate() {},
  mounted() {
    this.updateTitle("公交线路查询");
    window["IMap"] && this.$autoGetCurrentPosition();
    historyForwardBusline = storeBusLineKeyword().map(e => e.forward);
    historyReverseBusline = storeBusLineKeyword().map(e => e.reverse);
    this.searchResults = cloneDeep(historyForwardBusline);
    this.forwardLineList = cloneDeep(historyForwardBusline);
    this.everseLineList = cloneDeep(historyReverseBusline);
  },
  destroyed() {
    this.intervalInstance && clearInterval(this.intervalInstance);
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

.busline-time {
  font-size: 2rem;
  margin-left: 2rem;
}

.busline-item-button {
  position: absolute;
  width: 90px;
  height: 30px;
  top: 1.5rem;
  right: 1rem;
}

.busline-header {
  font-size: 2rem;
  color: #000;
}

.busline-sub {
  font-size: 1rem;
  color: #9999;
}

.busline-time > div {
  float: left;
  margin: 1rem;
}
.start-time:before {
  content: "首";
  background-color: #00CD66;
  color: #fff;
  font-size: 1.5rem;
  margin: 3px;
}

.end-time:before {
  content: "末";
  background-color: #ff6a6a;
  color: #fff;
  font-size: 1.5rem;
  margin: 3px;
}

.realtime-bus {
  float: left;
  text-align: center;
  font-size: 1.5rem;
  flex: 1;
}

.realtime-bus .item-onroute {
  z-index: 99;
  display: inline-block;
  background-color: #00ff00;
  border-radius: 99px;
  left: -9px;
  top: 25px;
  width: 20px;
  height: 18px;
  font-size: 13px;
  text-align: center;
  color: #fff;
}

.crowd-desc.loose:before {
  content: " ";
  display: inline-block;
  height: 8px;
  width: 17px;
  margin-right: 3px;
  background-color: #00ff00;
}
.crowd-desc.comfort:before {
  content: " ";
  display: inline-block;
  height: 8px;
  width: 17px;
  margin-right: 3px;
  background-color: #ffa500;
}
.crowd-desc.crowd:before {
  content: " ";
  display: inline-block;
  height: 8px;
  width: 17px;
  margin-right: 3px;
  background-color: #ee2c2c;
}
</style>
