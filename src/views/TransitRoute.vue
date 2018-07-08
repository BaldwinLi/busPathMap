<template>
  <div class="trans-main">
    <!-- speech x-webkit-speech -->
    <tab>
      <tab-item :selected="showMap" @on-item-click="onItemClick">换乘路线图</tab-item>
      <tab-item :selected="showPathResult" @on-item-click="onItemClick">换乘方案列表</tab-item>
    </tab>
    <cell primary="content">
      <div slot="title" class="input-header">
        <!-- <x-input type="text" placeholder="请输入起点" v-model="startPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label start"></i>
        </x-input> -->
        <search
        style="position: relative; z-index: 9;"
        placeholder="请输入起点"
        v-model="startPosition"
        @result-click="startResultClick"
        :results="searchResults"
        position="relative"
        @on-focus="onFocus('start')"
        cancel-text=" "
        @on-cancel="onCancel"
        ref="startSearch">
          <i slot="left" class="iconfont icon-pointerbig position-label start"></i>
          <a slot="right" class="iconfont icon-global_geo geo-setter" @click="setCurrentGeo"></a>
        </search>
        
        <!-- @on-cancel="onCancel" -->
        <!-- <x-input type="text" placeholder="请输入终点" v-model="endPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label end"></i>
        </x-input> -->
        <search
        style="position: relative"
        placeholder="请输入终点"
        v-model="endPosition"
        @result-click="endResultClick"
        :results="searchResults"
        position="relative"
        @on-focus="onFocus('end')"
        cancel-text=" "
        @on-cancel="onCancel"
        ref="endSearch">
          <i slot="left" class="iconfont icon-pointerbig position-label end"></i>
        </search>
      </div>
      <div slot class="input-body">
        <i class="fa fa-exchange reverse-position" aria-hidden="true" @click="reversePosition"></i>
      </div>
    </cell>
    <map-container
      ref="mapContainer"
      :startText="startPosition" 
      :endText="endPosition"
      :start="start"
      :end="end"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      :height="-135"
      :showMap="showMap"
      :showPathResult="showPathResult"
      @onLoadComplete="loadComplete"
      @onPoiChange="onPoiChange"
      @onGetClickPoi="onGetClickPoi"
      @onTranitRouteSearchComplete="TranitRouteSearchComplete"
      @onGeolocationComplete="onGeolocationComplete">
    </map-container>
  </div>
</template>

<script>
import { isObject, debounce } from "lodash";
import { Search, Cell, Divider, Tab, TabItem } from "vux";
import { mapMutations } from "vuex";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";
import { setTimeout } from "timers";
import { storePositionKeyword } from "@/helper/utils";
// let $scope;
export default {
  name: "transit-route",
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
      showMap: true,
      showPathResult: false,
      isNeedToClear: false,
      startCache: "",
      endCache: "",
      postionsHistory: storePositionKeyword()
    };
  },
  components: {
    MapContainer,
    Search,
    Cell,
    Divider,
    Tab,
    TabItem
  },
  methods: {
    onSpeechChange(value) {
      alert(value);
    },
    loadComplete(event) {},
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
        this.searchResults = result;
      }
    },
    startResultClick(value) {
      this.start = value;
      if (value.title !== this.startPosition) {
        this.startPosition = value.title;
        this.isNeedToClear = true;
      }
      this.cancelSearch(this.$refs.startSearch);
      this.cancelSearch(this.$refs.endSearch);
      this.postionsHistory = storePositionKeyword(value);
    },
    endResultClick(value) {
      this.end = value;
      if (value.title !== this.endPosition) {
        this.endPosition = value.title;
        this.isNeedToClear = true;
      }
      this.cancelSearch(this.$refs.endSearch);
      this.cancelSearch(this.$refs.startSearch);
      this.postionsHistory = storePositionKeyword(value);
    },
    TranitRouteSearchComplete(event) {
      // this.searchResults = [];
      // this.showMap = false;
      // this.showPathResult = true;
    },
    onFocus(key) {
      switch (key) {
        case "start":
          this.cancelSearch(this.$refs.endSearch);
          if (!this.startPosition) {
            setTimeout(() => {
              this.searchResults = this.postionsHistory;
            });
          }
          break;
        case "end":
          this.cancelSearch(this.$refs.startSearch);
          if (!this.endPosition) {
            setTimeout(() => {
              this.searchResults = this.postionsHistory;
            });
          }
          break;
      }
    },
    onCancel() {},
    cancelSearch(ref) {
      setTimeout(() => {
        ref.isCancel = true;
        ref.emitEvent();
        ref.isFixed = false;
        // ref.$emit("on-cancel");
        this.searchResults.length > 0 && (this.searchResults = []);
      });
    },
    reversePosition() {
      const _startPostion = this.startPosition;
      const _start = this.start;
      this.startPosition = this.endPosition;
      this.endPosition = _startPostion;
      this.start = this.end;
      this.end = _start;
      this.isNeedToClear = true;
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
    onItemClick(index) {
      this.showMap = index === 0;
      this.showPathResult = index === 1;
    },
    setCurrentGeo() {
      this.$refs["mapContainer"].getCurrentPosition();
    },
    onGeolocationComplete(result) {
      this.start = {
        title: result.name,
        point: result.center
      };
      this.startPosition = result.name;
      this.cancelSearch(this.$refs.startSearch);
      this.postionsHistory = storePositionKeyword(this.start);
      this.isNeedToClear = true;
    },
    ...mapMutations(["updateTitle"])
  },
  mounted() {
    this.updateTitle("换乘方案查询");
    $('.input-header').width($(window).width() * 0.7);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.trans-main {
  font-size: 1.5rem;
}
/* .input-header {
  width: 22rem;
} */
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
  right: 5rem;
  margin: 0.5rem;
  position: absolute;
  z-index: 10;
  cursor: pointer;
}
</style>
