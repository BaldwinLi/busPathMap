<template>
  <div>
    <tab>
      <tab-item :selected="showStops" @on-item-click="onItemClick">
          <i class="iconfont icon-gongjiao header-icon-size"></i>公交站
      </tab-item>
      <tab-item :selected="showFoods" @on-item-click="onItemClick">
          <i class="iconfont icon-meishi header-icon-size"></i>美食
      </tab-item>
      <tab-item :selected="showScenics" @on-item-click="onItemClick">
          <i class="iconfont icon-jingdian header-icon-size"></i>景点
      </tab-item>
    </tab>
    <flexbox orient="vertical" :gutter="8" style="position: absolute; top: 50px;">
      <flexbox-item v-for="(item, index) in poiList" :key="index">
        <card @click.native="selectSpots(item)" class="item-card">
          <div slot="header" class="weui-panel__hd card-header">
            {{item.title}} <div class="right-side"><i class="iconfont icon-dingwei"></i>{{item.distance + 'm'}}</div>
          </div>
          <div slot="content" class="card-flex">
            <i class="iconfont header-icon-size" :class="{
                'icon-gongjiao': showStops,
                'icon-meishi': showFoods,
                'icon-jingdian': showScenics
                }"></i>{{item.address}}
          </div>
        </card>
        <!-- <cell primary="title" class="search-field" style="background-color: #fff;" :title="item.title" is-link @click.native="selectStops(item)">
          <div>{{item.address}}</div>
        </cell> -->
      </flexbox-item>
    </flexbox>
    <map-container
      v-show="false"
      ref="mapContainer"
      @onLoadComplete="loadComplete"
      @onGeolocationComplete="onGeolocationComplete"
      @onPoiChange="onPoiChange">
    </map-container>
  </div>
</template>

<script>
import { Card, Tab, TabItem, Flexbox, FlexboxItem } from "vux";
import MapContainer from "@/components/map-container";
import { mapMutations, mapGetters } from "vuex";

export default {
  components: {
    Card,
    MapContainer,
    Tab,
    TabItem,
    Flexbox,
    FlexboxItem
  },
  data() {
    return {
      type: 0,
      showStops: true,
      showFoods: false,
      showScenics: false,
      typeOptions: ["公交站", "美食", "景点"],
      poiList: []
    };
  },
  computed: {
    ...mapGetters(["appContextPath"])
  },
  methods: {
    loadComplete() {
      this.$autoGetCurrentPosition();
    },
    onGeolocationComplete(val) {
      this.$refs["mapContainer"].location.searchNearby(
        this.typeOptions[0],
        this.$refs["mapContainer"].currentPoint
      );
    },
    onPoiChange(result) {
      this.poiList = result;
      this.updateLoadingStatus({ isLoading: false });
    },
    onItemClick(index) {
      this.updateLoadingStatus({ isLoading: true });
      this.showStops = index === 0;
      this.showFoods = index === 1;
      this.showScenics = index === 2;
      this.$refs["mapContainer"].location.searchNearby(
        this.typeOptions[index],
        this.$refs["mapContainer"].currentPoint
      );
    },
    selectSpots(val) {
      if (this.showStops) {
        this.$router.push({
          path: "/bus_station",
          query: {
            searchWord: val.title,
            lng: val.point.lng,
            lat: val.point.lat
          }
        });
      } else {
        this.$router.push({
          path: "/surround_detail",
          query: {
            title: val.title,
            lng: val.point.lng,
            lat: val.point.lat,
            address: val.address,
            phoneNumber: val.phoneNumber,
            postcode: val.postcode,
            distance: val.distance
          }
        });
      }
    },
    ...mapMutations(["updateTitle", "updateLoadingStatus"])
  },
  mounted() {
    this.updateTitle("周边");
     window["IMap"] && this.$autoGetCurrentPosition();
  }
};
</script>

<style scoped>
.item-card {
  margin: 1rem;
  border: 1px solid #9999;
  border-radius: 10px;
}
.item-card .card-header {
  color: #000;
  font-size: 2rem;
}

.item-card .right-side {
  float: right;
  font-size: 1.5rem;
}
.item-card .right-side > i {
  font-size: 2rem;
}

.item-card .card-header .header-icon-size {
  color: #04be02;
  font-size: 2rem;
  margin-right: 0.5rem;
}

.item-card .card-flex {
  color: #9999;
  font-size: 1.5rem;
  padding: 14px 15px 10px;
}
.item-card .card-flex .header-icon-size {
  color: #04be02;
  font-size: 1.5rem;
  margin-right: 0.5rem;
}
</style>