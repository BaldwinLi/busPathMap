<template>
  <div class="home-content">
    <box gap="10px 10px">
      <router-link to="/route_solution">
        <x-button plain :gradients="['#1D62F0', '#19D5FD']" type="primary" class="x-button-style">换乘方案</x-button>
      </router-link>
      <router-link to="/bus_line">
        <x-button plain :gradients="['#A644FF', '#FC5BC4']" type="primary" class="x-button-style">公交线路</x-button>
      </router-link>
      <router-link to="/bus_station">
        <x-button plain :gradients="['#EEC900', '#EE799F']" type="primary" class="x-button-style">公交站点</x-button>
      </router-link>
    </box>
  </div>
</template>

<script>
import { XButton, Box } from "vux";

export default {
  components: {
    XButton,
    Box
  },
  data() {
    return {};
  }
};
</script>

<style scoped>
.home-content {
  /* display: inline; */
  text-align: center;
  margin-top: 35%;
  height: inherit;
  width: inherit;
}
.x-button-style {
  border-radius: 10rem !important;
  margin: 2rem 2rem 0 0;
}
</style>