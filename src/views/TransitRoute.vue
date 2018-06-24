<template>
  <div class="hello">
    <!-- <input type="text" speech x-webkit-speech/> -->
    <map-container :options="options" @onLoadComplete="loadComplete"></map-container>
  </div>
</template>

<script>
import { isObject } from "lodash";
import { XInput } from 'vux'
import MapContainer from "@/components/map-container";

export default {
  name: "transit-route",
  data() {
    return {
      options: {
        type: "BUS_LINE",
        showType: "MAP_RESULT"
      }
    };
  },
  components: {
    MapContainer,
    XInput
  },
  methods: {
    onSpeechChange(value) {
      alert(value);
    },
    loadComplete(event) {
      // event.busline.getBusList(3);
      if (event) {
        for (var i = 0; i < event.getCurrentNumPois(); i++) {
          const poi = event.getPoi(i);
          if (poi.type == BMAP_POI_TYPE_BUSSTOP) {
            busPoi = poi;
          }
        }
      }
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
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
