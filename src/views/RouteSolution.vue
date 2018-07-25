<template>
  <div class="trans-main">
    <!-- speech x-webkit-speech -->
     <tab>
      <tab-item :selected="routeType.transit" @on-item-click="onRouteTypeClick">
        <i class="iconfont icon-gongjiao header-icon-size"></i>
      </tab-item>
      <tab-item :selected="routeType.driving" @on-item-click="onRouteTypeClick">
        <i class="iconfont icon-zijia header-icon-size"></i>
      </tab-item>
      <tab-item :selected="routeType.walking" @on-item-click="onRouteTypeClick">
        <i class="iconfont icon-buxing header-icon-size"></i>
      </tab-item>
    </tab>
    <cell primary="content" class="search-field" v-show="showMap">
      <div slot="title" class="input-header">
        <!-- <x-input type="text" placeholder="请输入起点" v-model="startPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label start"></i>
        </x-input> -->
        <search
        style="z-index: 9"
        placeholder="请输入起点"
        v-model="startPosition"
        @result-click="startResultClick"
        :results="searchResults"
        position="fixed"
        @on-focus="onFocus('start')"
        cancel-text=" "
        @on-submit="startResultClick(0)"
        @on-cancel="onCancel"
        ref="startSearch">
          <i slot="left" class="iconfont icon-pointerbig position-label start"></i>
          <a slot="right" class="iconfont icon-global_geo geo-setter"
             style="right: -3rem;" @click="setCurrentGeo"></a>
          <a slot="right" v-show="showStartYulin" class="iconfont icon-yuyin geo-setter start-search" style="font-size: 2.5rem; margin: 0;"
             v-touch:touchstart="startRecord" v-touch:touchend="stopRecord"></a>
        </search>
        
        
        <!-- @on-cancel="onCancel" -->
        <!-- <x-input type="text" placeholder="请输入终点" v-model="endPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label end"></i>
        </x-input> -->
        <search
        style="z-index: 9"
        placeholder="请输入终点"
        v-model="endPosition"
        @result-click="endResultClick"
        :results="searchResults"
        position="fixed"
        @on-focus="onFocus('end')"
        cancel-text=" "
        @on-submit="endResultClick(0)"
        @on-cancel="onCancel"
        ref="endSearch">
          <i slot="left" class="iconfont icon-pointerbig position-label end"></i>
          <a slot="right" class="iconfont icon-yuyin geo-setter end-search"
             style="font-size: 2.5rem; margin: 0;"
             v-show="showEndYulin"
             v-touch:touchstart="startRecord" v-touch:touchend="stopRecord"></a>
        </search>
      </div>
      <div slot class="input-body">
        <i class="fa fa-exchange reverse-position" aria-hidden="true" @click="reversePosition"></i>
      </div>
    </cell>
    <div id="map-container-wrapper">
      <div v-show="showSolutionList">
        <card v-for="(item, index) in routeResults" :key="index" @click.native="selectSolution(item)">
          <div slot="header" class="weui-panel__hd card-header">
            <span>
               <div v-for="(item1, index1) in item.viaStopsList" :key="index1" style="float:left; color: #000;">
                  <i v-if="index1 != 0" class="fa fa-long-arrow-right" aria-hidden="true"></i> {{item1 + ' '}}&nbsp;
               </div>
               <div style="float: right; color: #00EE76;">{{item.viaStopsNum||''}} {{item.firstWalkLineDistance?('始发站需步行' + item.firstWalkLineDistance + '米'):''}}</div>
            </span>
            <br>
            <span>
              <div v-for="(item1, index1) in item.advantages" :class="{
                'badge-card': true,
                success: ['时间短', '避免拥堵'].includes(item1.text),
                warn: item1.text === '步行少',
                error: item1.text === '换乘少'
              }" style="margin-right: 1rem" :key="index1">{{item1.text}}
              </div>
            </span>
          </div>
          <div slot="content" class="card-flex">
            <div class="vux-1px-r">{{item.duration | secondsFormat}}</div>
            <div class="vux-1px-r" v-if="item.viaStopsNum">{{item.viaStopsNum}}</div>
            <div v-if="item.sumWalkLineDistance">步行{{item.sumWalkLineDistance}}米</div>
          </div>
        </card>
      </div>
      <map-container
      ref="mapContainer"
      :startText="startPosition" 
      :endText="endPosition"
      :start="start"
      :end="end"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      :height="-88"
      :showMap="showMap"
      :showPathResult="showPathResult"
      @onLoadComplete="loadComplete"
      @onPoiChange="onPoiChange"
      @onGetClickPoi="onGetClickPoi"
      @onRouteSearchComplete="routeSearchComplete"
      @onGeolocationComplete="onGeolocationComplete">
      </map-container>
    </div>
    <tab bar-position="top">
        <tab-item :selected="showSolutionList" @on-item-click="onItemClick">方案</tab-item>
        <tab-item :selected="showMap" @on-item-click="onItemClick">地图</tab-item>
        <tab-item :selected="showPathResult" @on-item-click="onItemClick">详情</tab-item>
    </tab>
  </div>
</template>

<script>
import { isObject, debounce, forEach } from "lodash";
import { Search, Cell, Divider, Tab, TabItem, Card } from "vux";
import { mapMutations } from "vuex";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";
import { setTimeout } from "timers";
import { loadWeChatSdk, wxStopRecordAndTranslate } from "@/helper/jssdk-loader";
import { storePositionKeyword } from "@/helper/utils";
// let $scope;
export default {
  name: "route-solution",
  data() {
    return {
      startPosition: "",
      endPosition: "",
      start: {},
      end: {},
      searchResults: [],
      options: {
        type: "TRANSIT_SOLUTION",
        showType: "MAP_RESULT",
        policy: 0
      },
      commonPluginOptions,
      showSolutionList: false,
      showMap: true,
      showPathResult: false,
      isNeedToClear: false,
      startCache: "",
      endCache: "",
      postionsHistory: storePositionKeyword(),
      _query: undefined,
      routeType: {
        transit: true,
        driving: false,
        walking: false
      },
      showStartYulin: false,
      showEndYulin: false,
      routeResults: []
    };
  },
  filters: {
    milesFormat: function(value) {
      // value
      // const kilo = value/1000;
      // return "¥ " + numberComma(count);
    },
    secondsFormat: function(value) {
      const hours = (value / 3600).toFixed(0);
      const minus = ((value % 3600) / 60).toFixed(0);
      return hours + "小时" + minus + "分钟";
    }
  },
  components: {
    MapContainer,
    Search,
    Cell,
    Divider,
    Tab,
    TabItem,
    Card
  },
  methods: {
    onSpeechChange(value) {
      alert(value);
    },
    loadComplete(event) {
      this.$autoGetCurrentPosition();
    },
    onPoiChange(result) {
      if (this.isNeedToClear) {
        // const startText = this.startPosition;
        // const endText = this.endPosition;
        this.cancelSearch(this.$refs.startSearch);
        this.cancelSearch(this.$refs.endSearch);
        // setTimeout(() => {
        //   this.startPosition = startText;
        //   this.endPosition = endText;
        // });
        this.isNeedToClear = false;
      } else {
        this.searchResults = result.concat(this.postionsHistory);
      }
    },
    startResultClick(value) {
      value = value || this.searchResults[0] || this.start;
      document.activeElement.blur();
      this.start = value;
      if (value.title !== this.startPosition) {
        this.startPosition = value.title;
        this.isNeedToClear = true;
      }
      this.cancelSearch(this.$refs.startSearch);
      this.cancelSearch(this.$refs.endSearch);
      this.postionsHistory = storePositionKeyword(value);
      this.relocate();
    },
    endResultClick(value) {
      value = value || this.searchResults[0] || this.start;
      document.activeElement.blur();
      this.end = value;
      if (value.title !== this.endPosition) {
        this.endPosition = value.title;
        this.isNeedToClear = true;
      }

      this.cancelSearch(this.$refs.endSearch);
      this.cancelSearch(this.$refs.startSearch);
      this.postionsHistory = storePositionKeyword(value);
      this.relocate();
    },
    routeSearchComplete(event) {
      this.routeResults.length = 0;
      const routesNums = [];
      const durations = [];
      const distances = [];
      const sumWalkLineDistances = [];
      forEach(event, (item, index) => {
        let sumViaStops = 0,
          firstWalkLineDistance = 0,
          sumWalkLineDistance = 0,
          routesNum;
        const viaStopsList = [];
        let title = "";
        if (typeof item.getLine !== "undefined") {
          routesNum = item.getNumLines();
          for (let i = 0; i < routesNum; i++) {
            const line = item.getLine(i);
            i === 0 &&
              (firstWalkLineDistance += item.getRoute(i).getDistance(false));
            sumWalkLineDistance += item.getRoute(i).getDistance(false);
            sumViaStops += line.getNumViaStops();
            sumViaStops += line.getNumViaStops();
            viaStopsList.push(line.title);
            // title = title ? (title + ( ' -> ' + line.title)): line.title;
            // for (let j = 0; j < line.getNumViaStops())
          }
        } else {
          switch (this.options.type) {
            case "DRIVING_SOLUTION":
              viaStopsList.push("驾车方案" + (index + 1));
              break;
            case "WALKING_SOLUTION":
              viaStopsList.push("步行方案" + (index + 1));
              break;
          }
        }
        const distance = item.getDistance();
        const duration = item.getDuration(false);
        sumWalkLineDistances.push(sumWalkLineDistance);
        routesNum && routesNums.push(routesNum);
        durations.push(duration);
        distances.push(distance);
        this.routeResults.push({
          viaStopsNum: sumViaStops && sumViaStops + "站",
          distance,
          duration,
          // title,
          viaStopsList,
          firstWalkLineDistance,
          sumWalkLineDistance,
          routesNum,
          advantages: []
        });
      });
      this.routeResults.forEach(e => {
        e.sumWalkLineDistance === Math.min.apply(Math, sumWalkLineDistances) &&
          e.advantages.push({
            text: "步行少",
            policy: BMAP_TRANSIT_POLICY_LEAST_WALKING
          });
        e.routesNum &&
          e.routesNum === Math.min.apply(Math, routesNums) &&
          e.advantages.push({
            text: "换乘少",
            policy: BMAP_TRANSIT_POLICY_LEAST_TRANSFER
          });
        e.duration === Math.min.apply(Math, durations) &&
          e.advantages.push({
            text:
              this.options.type === "TRANSIT_SOLUTION" ? "时间短" : "避免拥堵",
            policy:
              this.options.type === "TRANSIT_SOLUTION"
                ? BMAP_TRANSIT_POLICY_LEAST_TIME
                : BMAP_DRIVING_POLICY_AVOID_CONGESTION
          });
        // this.options.type === "DRIVING_SOLUTION" &&
        //   e.distance === Math.min.apply(Math, distances) &&
        //   e.advantages.push({
        //     text: "距离短",
        //     policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE
        //   });
      });
      // this.searchResults = [];
      // this.showMap = false;
      // this.showPathResult = true;
    },
    onFocus(key) {
      const scope = this;
      switch (key) {
        case "start":
          this.cancelSearch(this.$refs.endSearch);
          if (!this.startPosition) {
            setTimeout(() => {
              scope.postionsHistory.length > 0 &&
                (scope.searchResults = scope.postionsHistory);
            });
          }
          this.showStartYulin = true;
          break;
        case "end":
          this.cancelSearch(this.$refs.startSearch);
          if (!this.endPosition) {
            setTimeout(() => {
              scope.postionsHistory.length > 0 &&
                (scope.searchResults = scope.postionsHistory);
            });
          }
          this.showEndYulin = true;
          break;
      }
    },
    onCancel() {
      // this.showRecord = false;
    },
    cancelSearch(ref) {
      const scope = this;
      setTimeout(() => {
        ref.isCancel = true;
        ref.emitEvent();
        ref.isFixed = false;
        // ref.$emit("on-cancel");
        scope.searchResults.length > 0 && (scope.searchResults = []);
      });
      scope.showStartYulin = false;
      scope.showEndYulin = false;
    },
    reversePosition() {
      const _startPostion = this.startPosition;
      const _start = this.start;
      this.startPosition = this.endPosition;
      this.endPosition = _startPostion;
      this.start = this.end;
      this.end = _start;
      this.isNeedToClear = true;
      this.relocate();
    },
    onGetClickPoi(result) {
      if (!this.$refs.startSearch.isCancel) {
        this.startPosition = result.title;
        this.start = result;
      } else if (!this.$refs.endSearch.isCancel) {
        this.endPosition = result.title;
        this.end = result;
      }
      this.isNeedToClear = true;
    },
    onRouteTypeClick(index) {
      switch (index) {
        case 0:
          this.options = {
            type: "TRANSIT_SOLUTION",
            showType: "MAP_RESULT",
            policy: 0
          };
          break;
        case 1:
          this.options = {
            type: "DRIVING_SOLUTION",
            showType: "MAP_RESULT",
            policy: 0
          };
          break;
        case 2:
          this.options = {
            type: "WALKING_SOLUTION",
            showType: "MAP_RESULT",
            policy: 0
          };
          break;
      }
      this.routeType.transit = index === 0;
      this.routeType.driving = index === 1;
      this.routeType.walking = index === 2;
    },
    onItemClick(index) {
      this.showSolutionList = index === 0;
      this.showMap = index === 1;
      this.showPathResult = index === 2;
    },
    setCurrentGeo() {
      this.$refs["mapContainer"].getCurrentPosition();
    },
    onGeolocationComplete(result) {
      // debugger
      if (!this._query) {
        this.start = {
          title: result.name,
          point: result.center
        };
        this.startPosition = result.name;
        this.cancelSearch(this.$refs.startSearch);
        this.postionsHistory = storePositionKeyword(this.start);
        // this.isNeedToClear = true;
      } else {
        // setTimeout(() => {
        this.startPosition = this._query.startPosition;
        this.endPosition = this._query.endPosition;
        this.start = {
          title: this._query.startPosition,
          point: {
            lng: this._query.startLng,
            lat: this._query.startLat
          }
        };
        this.endPosition = this._query.endPosition;
        this.end = {
          title: this._query.endPosition,
          point: {
            lng: this._query.endLng,
            lat: this._query.endLat
          }
        };
        delete this._query;
        // });
      }
    },
    startRecord(event) {
      event.target.style.color = "#4F94CD";
      this.$vux.toast.show({
        text: "按住开始说话"
      });
      this.$wechat.startRecord();
    },
    stopRecord(event) {
      this.$vux.toast.hide();
      event.target.style.color = "";
      wxStopRecordAndTranslate().then(res => {
        if (event.target.classList.contains("start-search"))
          this.startPosition = res;
        else if (event.target.classList.contains("end-search"))
          this.endPosition = res;
      });
    },
    selectSolution(solution) {
      this.$refs["mapContainer"].quertRoute(solution);
      this.showMap = false;
      this.showSolutionList = false;
      this.showPathResult = true;
    },
    relocate() {
      if (this.start.point && this.end.point) {
        const params = $.param({
          startPosition: this.startPosition,
          startLng: this.start.point.lng,
          startLat: this.start.point.lat,
          endPosition: this.endPosition,
          endLng: this.end.point.lng,
          endLat: this.end.point.lat
        });
        window.location.href = `${window.location.origin +
          window.location.pathname}#${this.$route.path}?${params}`;
      }
    },
    ...mapMutations(["updateTitle"])
  },
  beforeCreate() {},
  mounted() {
    if (!$.isEmptyObject(this.$route.query)) {
      this._query = this.$route.query;
    }
    this.updateTitle("换乘方案查询");
    $(".input-header").width($(window).width() * 0.7);
    $("#map-container-wrapper").height($(window).height() - 88);
    window["IMap"] && this.$autoGetCurrentPosition();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header-icon-size {
  font-size: 3rem;
}

.trans-main {
  font-size: 1.5rem;
}
/* .input-header {
  width: 22rem;
} */

/* search. */
.input-body {
  text-align: center;
}
.position-label {
  margin: 1rem;
  font-size: 1rem;
}
.position-label.start {
  color: #00ff7f;
}
.position-label.end {
  color: #ff3030;
}
.reverse-position {
  font-size: 3rem;
}
.geo-setter {
  right: 0;
  margin: 0.5rem;
  position: absolute;
  z-index: 7;
  cursor: pointer;
}

.search-field {
  background-color: rgb(255, 255, 255);
  position: fixed;
  z-index: 7;
  left: 7%;
  margin: 1rem auto;
}

.vux-1px-r {
  position: relative;
}

.vux-1px-r:after {
  content: " ";
  position: absolute;
  right: 0;
  top: 0;
  width: 1px;
  bottom: 0;
  border-right: 1px solid #c7c7c7;
  color: #c7c7c7;
  -webkit-transform-origin: 100% 0;
  transform-origin: 100% 0;
  -webkit-transform: scaleX(0.5);
  transform: scaleX(0.5);
}

.card-flex {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  color: #bebebe;
}

.card-flex > div {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  flex: 1;
  text-align: center;
  font-size: 12px;
  padding: 10px 0;
}

.card-header {
  height: 4rem;
}

.badge-card {
  float: left;
  padding: 2px;
  border-radius: 5px;
}

.badge-card.success {
  background: #00ee76;
  color: #fff;
}

.badge-card.warn {
  background: #ffc125;
  color: #fff;
}

.badge-card.error {
  background: #cd5555;
  color: #fff;
}

#map-container-wrapper {
  overflow-y: scroll;
}
</style>
