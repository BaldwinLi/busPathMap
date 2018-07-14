<template>
  <div>
    <!-- <tab>
      <tab-item :selected="showMap" @on-item-click="onItemClick">地图</tab-item>
      <tab-item :selected="showPathResult" @on-item-click="onItemClick">公交站点列表</tab-item>
    </tab> -->

     <search
          style="position: fixed;width: 90%;left:5%"
          class="search-field"
          v-model="searchWord"
          position="fixed"
          placeholder="请输入公交站点名称"
          top="0"
          @on-focus="onFocus()"
          @on-cancel="isCanceled = true"
          @result-click="setBusPoi"
          :results="searchResults"
          @on-submit="setBusPoi(0)"
          ref="search">
          <a slot="right" v-show="isCanceled" class="iconfont icon-global_geo geo-setter" @click="setCurrentGeo"></a>
      <!-- cancel-text="搜索" -->
      <!-- <i slot="left" v-if="!isShowList" @click="hideList" class="fa fa-angle-left" style="font-size: 2.5rem; margin-right: 1rem;" aria-hidden="true"></i> -->
        </search>
    <map-container
      ref="mapContainer"
      :startText="searchWord"
      :start="start"
      :options="options" 
      :pluginOptions="commonPluginOptions"
      v-show="showMap"
      @onPoiChange="onPoiChange"
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
import { storeBusStationKeyword } from "@/helper/utils";
import { setTimeout } from "timers";

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
        type: "BUS_STATION",
        showType: "MAP_RESULT",
        policy: 0
      },
      isNeedToClear: false,
      searchWord: "",
      start: {},
      showMap: true,
      showPathResult: false,
      commonPluginOptions,
      searchResults: [],
      fstLine: {},
      isCanceled: true
    };
  },
  methods: {
    onPoiChange(result) {
      if (this.isNeedToClear) {
        this.cancelSearch();
        this.isNeedToClear = false;
      } else {
        this.searchResults = result.map(v => ({
          ...v,
          title: v.title + "-" + v.address
        }));
      }
    },
    onGeolocationComplete(event) {
      this.searchWord = event.name;
      this.isCanceled = false;
    },
    setBusPoi(val) {
      val = val || this.searchResults[0];
      this.start = val;
      this.searchWord = val.title;
      document.activeElement.blur();
      this.cancelSearch();
      storeBusStationKeyword(val);
      this.cancelSearch();
    },
    onFocus() {
      this.isCanceled = false;
      !this.searchWord &&
        setTimeout(() => {
          this.searchResults = storeBusStationKeyword();
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
    setCurrentGeo() {
      this.$refs["mapContainer"].getCurrentPosition();
    },
    ...mapMutations(["updateTitle"])
  },
  mounted() {
    this.updateTitle("公交站点查询");
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
.geo-setter {
  right: 1rem;
  margin: auto;
  position: absolute;
  z-index: 10;
  cursor: pointer;
}

.search-field {
  background-color: rgb(255, 255, 255);
  position: fixed;
  z-index: 7;
  margin: 1rem auto;
}
</style>
