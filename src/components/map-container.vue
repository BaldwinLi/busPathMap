<template>
  <div class="home-content">
    <div ref="mapContainer" id="map-container"></div>
    <div id="bus-path-result"></div>
  </div>
</template>

<script>
export default {
  name: "map-container",
  props: {
    height: String,
    width: String
  },
  data() {
    return {};
  },
  mounted() {
    this.$refs["mapContainer"].style.height = this.height;
    this.$refs["mapContainer"].style.width = this.width;
  }
};
</script>

<style scoped>
#map-container {
  overflow: hidden;
  position: relative;
  z-index: 0;
  background-color: rgb(243, 241, 236);
  color: rgb(0, 0, 0);
  text-align: left;
  height: 600px;
}
</style>