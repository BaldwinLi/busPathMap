<template>
	<li class="vux-busline-item">
		<div :class="['vux-busline-item-color', {'vux-busline-item-head': !isSelect,'vux-busline-item-head-first': isSelect }]" :style="headStyle">
			<icon v-show="isSelect && $parent.isShowIcon" type="success_no_circle" class="vux-busline-item-checked"></icon>
            <i v-show="!isSelect" class="vux-busline-item-text">{{stopNum}}</i>
        </div>
		<div class="vux-busline-item-tail" :style="tailStyle">
            <i v-show="!!onTheRoute" class="vux-busline-item-onroute iconfont icon-gongjiao" :style="{backgroundColor: onTheRoute}"></i>
        </div>
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
    isSelect: Boolean,
    iconType: {
        type: String,
        default: 'success_no_circle'
    },
    stopNum: Number,
    onTheRoute: String
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
        ? { display: "none", backgroundColor: this.onTheRoute || this.$parent.color }
        : { display: "block", backgroundColor: this.onTheRoute || this.$parent.color };
    }
  }
};
</script>

