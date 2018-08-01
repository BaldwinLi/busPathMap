<template>
  <div>
   <card class="item-card" style="margin-top: 1rem;">
          <div slot="header" class="weui-panel__hd card-header">
            {{msg.title}} <div class="right-side"><i class="iconfont icon-dingwei"></i>{{msg.distance && (msg.distance + 'm')}}</div>
          </div>
          <div slot="content" class="card-flex">
            <div v-if="msg.phoneNumber">
              <label style="float: left; width: 30%;">联系电话：</label>
              <div style="float: left; width: 70%;">
                <p v-for="(num, index) in (msg.phoneNumber && msg.phoneNumber.split(',') || [])" :key="index">
                  <a :href="'tel:'+num">
                    <i class="iconfont icon-weibiaoti-" style="color: #04be02;"></i>{{num}}
                  </a>
                </p>
              </div>
            </div>
            <p v-if="msg.address">地址：{{msg.address}}</p>
            <p v-if="msg.postcode">邮编：{{msg.postcode}}</p>
          </div>
    </card>
    <map-container
      ref="mapContainer"
      :options="options"
      :showMap="true"
      :showPathResult="false"
      :pluginOptions="commonPluginOptions"
      :start="start"
      :end="end"
      @onLoadComplete="loadComplete"
      @onGeolocationComplete="onGeolocationComplete">
    </map-container>
  </div>
</template>

<script>
import { Card } from "vux";
import { mapMutations, mapGetters } from "vuex";
import { commonPluginOptions } from "@/components/map-config";
import MapContainer from "@/components/map-container";

export default {
  components: {
    Card,
    MapContainer
  },
  data() {
    return {
      msg: {},
      commonPluginOptions,
      start: {},
      end: {},
      options: {
        type: "WALKING_SOLUTION",
        showType: "MAP_RESULT",
        policy: 0
      }
    };
  },
  methods: {
    loadComplete() {
      this.$autoGetCurrentPosition();
    },
    // loadComplete() {},
    onGeolocationComplete() {
      // this.$refs["mapContainer"].location.search(
      //   new BMap.Point(this.msg.lng, this.msg.lat)
      // );
      this.start = {
        point: this.$refs["mapContainer"].currentPoint
      };
      this.end = {
        title: this.msg.title,
        point: {
          lng: this.msg.lng,
          lat: this.msg.lat
        }
      };
    },
    ...mapMutations(["updateTitle", "updateLoadingStatus"])
  },
  mounted() {
    this.$route.query && (this.msg = this.$route.query);
    this.updateTitle(this.msg.title);
    window["IMap"] && this.$autoGetCurrentPosition();
  }
};
</script>

<style scoped>
.item-card {
  width: 94%;
  margin: 1rem;
  border: 1px solid #9999;
  border-radius: 10px;
  position: absolute;
  z-index: 9999;
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