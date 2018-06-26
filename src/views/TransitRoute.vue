<template>
  <div class="trans-main">
    <!-- speech x-webkit-speech -->
    <cell primary="content">
      <div slot="title" class="input-header">
        <x-input type="text" placeholder="请输入起点" v-model="startPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label start"></i>
        </x-input>
        <x-input type="text" placeholder="请输入终点" v-model="endPosition">
          <i slot="label" class="iconfont icon-pointerbig position-label end"></i>
        </x-input>
      </div>
      <div slot class="input-body">
        <i class="fa fa-exchange reverse-position" aria-hidden="true"></i>
      </div>
    </cell>
    <map-container :options="options" :pluginOptions="commonPluginOptions" :height="-250" @onLoadComplete="loadComplete"></map-container>
  </div>
</template>

<script>
import { isObject } from "lodash";
import { XInput, Cell } from "vux";
import MapContainer from "@/components/map-container";
import { commonPluginOptions } from "@/components/map-config";

export default {
  name: "transit-route",
  data() {
    return {
      startPosition: "",
      endPosition: "",
      options: {
        type: "TRANSIT_SOLUTION",
        showType: "MAP_RESULT",
        policy: 0
      },
      commonPluginOptions
    };
  },
  components: {
    MapContainer,
    XInput,
    Cell
  },
  methods: {
    onSpeechChange(value) {
      alert(value);
    },
    loadComplete(event) {
      // event.busline.getBusList(3);
      // if (event) {
      //   for (var i = 0; i < event.getCurrentNumPois(); i++) {
      //     const poi = event.getPoi(i);
      //     if (poi.type == BMAP_POI_TYPE_BUSSTOP) {
      //       busPoi = poi;
      //     }
      //   }
      // }
    }
  },
  mounted() {
    // mapLoader({type: 'BUS_LINE'}, (res) => {
    //   setTimeout(() => {
    //     busline.getBusList(3);
    //     // location.search('高新园区');
    //   });
    // });
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
