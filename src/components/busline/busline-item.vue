<template>
	<li class="vux-busline-item">
		<div :class="['vux-busline-item-color', {'vux-busline-item-head': !isSelect,'vux-busline-item-head-first': isSelect }]" :style="headStyle">
			<icon v-show="isSelect && $parent.isShowIcon" type="success_no_circle" class="vux-busline-item-checked"></icon>
		</div>
		<div class="vux-busline-item-tail" :style="tailStyle"></div>
		<div class="vux-busline-item-content">
			<slot></slot>
		</div>
	</li>
</template>

<script>
import { Icon } from "vux";

export default {
  name: "busline-item",
  data() {
    return {
      isLast: true,
      isFirst: true,
      headStyle: { backgroundColor: this.$parent.color }
    };
  },
  props: {
    color: String,
    isSelect: false
  },
  mounted() {
    this.$parent.setChildProps();
  },
  beforeDestroy() {
    // this will be null
    const $parent = this.$parent;
    this.$nextTick(() => {
      $parent.setChildProps();
    });
  },
  components: {
    Icon
  },
  computed: {
    tailStyle() {
      return this.isLast
        ? { display: "none", backgroundColor: this.$parent.color }
        : { display: "block", backgroundColor: this.$parent.color };
    }
  }
};
</script>

