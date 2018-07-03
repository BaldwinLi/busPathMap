<template>
  <div class="trans-main">
    <!-- speech x-webkit-speech -->
    <divider>请输入起点和终点的关键字进行查询</divider>
    <cell primary="content">
      <div slot="title" class="input-header">
        <!-- <x-input type="text" placeholder="请输入起点" v-model="startPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label start"></i>
        </x-input> -->
        <search
        placeholder="请输入起点"
        v-model="startPosition"
        @result-click="startResultClick"
        :results="searchResults"
        position="inherit"
        @on-focus="onFocus('start')"
        ref="startSearch">
          <i slot="left" class="iconfont icon-pointerbig position-label start"></i>
        </search>
        <!-- <x-input type="text" placeholder="请输入终点" v-model="endPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label end"></i>
        </x-input> -->
        <search
        placeholder="请输入终点"
        v-model="endPosition"
        @result-click="endResultClick"
        :results="searchResults"
        position="inherit"
        @on-focus="onFocus('end')"
        ref="endSearch">
          <i slot="left" class="iconfont icon-pointerbig position-label end"></i>
        </search>
      </div>
      <div slot class="input-body">
        <i class="fa fa-exchange reverse-position" aria-hidden="true"></i>
      </div>
    </cell>
    <map-container
      v-show="showMap"
      :startText="startPosition" 
      :endText="endPosition"
      :start="start"
      :end="end"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      :height="-15"
      @onLoadComplete="loadComplete"
      @onPoiChange="onPoiChange"
      @onTranitRouteSearchComplete="TranitRouteSearchComplete">
    </map-container>
  </div>
</template>

<script>
import { isObject, debounce } from "lodash";
import { Search, Cell, Divider } from "vux";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";
import { setTimeout } from "timers";
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
      isNeedToClear: false,
      startCache: "",
      endCache: ""
    };
  },
  components: {
    MapContainer,
    Search,
    Cell,
    Divider
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
    },
    endResultClick(value) {
      this.end = value;
      if (value.title !== this.endPosition) {
        this.endPosition = value.title;
        this.isNeedToClear = true;
      }
      this.cancelSearch(this.$refs.endSearch);
    },
    TranitRouteSearchComplete(event) {
      // this.searchResults = [];
    },
    onFocus(key) {
      switch (key) {
        case "start":
          this.cancelSearch(this.$refs.endSearch);
          break;
        case "end":
          this.cancelSearch(this.$refs.startSearch);
          break;
      }
    },
    cancelSearch(ref) {
      // setTimeout(() => {
      ref.isCancel = true;
      ref.emitEvent();
      ref.isFixed = false;
      ref.$emit("on-cancel");
      this.searchResults.length > 0 && (this.searchResults = []);
      // });
    }
  },
  mounted() {
    // mapLoader({type: 'BUS_LINE'}, (res) => {
    //   setTimeout(() => {
    //     busline.getBusList(3);
    //     // location.search('高新园区');
    //   });
    // });
    // $scope = this;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.trans-main {
  font-size: 1.5rem;
}
.input-header {
  width: 22rem;
}
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
</style>
