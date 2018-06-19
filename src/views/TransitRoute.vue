<template>
  <div class="hello">
    <input type="text" speech x-webkit-speech/>
    <map-container></map-container>
  </div>
</template>

<script>
import { isObject } from "lodash";
import MapContainer from "@/components/map-container";
import mapLoader from "@/helper/map-loader.js";
import { busline, location } from "@/helper/map-loader.js";

export default {
  name: "transit-route",
  components: {
    MapContainer
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App"
    };
  },
  methods: {
    onSpeechChange(value) {
      alert(value);
    }
  },
  mounted() {
    mapLoader({type: 'BUS_LINE'}, (res) => {
      setTimeout(() => {
        busline.getBusList(3);
        // location.search('高新园区');
      });
    });
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
