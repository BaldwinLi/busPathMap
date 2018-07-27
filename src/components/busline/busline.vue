<template>
	<div class="vux-busline">
		<ul>
			<slot></slot>
		</ul>
	</div>
</template>

<script>
export default {
  name: "busline",
  props: {
    color: String,
    isShowIcon: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    setChildProps() {
      if (!this.$children) return;
      const len = this.$children.length;
      this.$children.forEach((child, index) => {
        child.isLast = index === len - 1;
        child.isFirst = index === 0;
      });
    }
  }
};
</script>

<style lang="less">
@import "~vux/src/styles/variable.less";

.vux-busline {
  padding: 1rem;
}

.vux-busline > ul > li {
  list-style: none;
}

@vux-busline: ~"vux-busline";
@busline-item-bg-color: #04be02;
.@{vux-busline} {
  &-item {
    position: relative;
  }

  &-item:hover {
    background-color: #D3D3D3;
  }

  &-item-content {
    padding: 1.5rem 0 1.5rem;
    border-bottom: 0.5px solid #9999;
    margin-left: 3rem;
  }

  &-item-head,
  &-item-head-first {
    position: absolute;
    content: "";
    z-index: 99;
    border-radius: 99px;
  }

  &-item-head {
    width: 20px;
    height: 20px;
    left: -1px;
    top: 25px;
  }

  &-item-head-first {
    width: 20px;
    height: 20px;
    left: -4px;
    top: 5px;
  }

  &-item-tail {
    position: absolute;
    content: "";
    height: 100%;
    width: 2px;
    left: 8px;
    top: 30px;
    background-color: @busline-item-bg-color;
  }

  &-item-checked {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    width: 20px;
    height: 20px;

    &.weui-icon-success-no-circle::before {
      font-size: 14px;
      position: absolute;
      left: 3px;
      top: 3px;
      margin: 0 !important;
      color: #fff;
    }
  }

  &-item-text {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 20px;
    height: 20px;
    font-size: 13px;
    text-align: center;
    color: #fff;
  }

  &-item-onroute {
    z-index: 99;
    background-color: #00FF00;
    border-radius: 99px;
    left: -9px;
    top: 25px;
    position: absolute;
    width: 20px;
    height: 20px;
    font-size: 13px;
    text-align: center;
    color: #fff;
  }
}

.vux-busline-item-color {
  background-color: @busline-item-bg-color;
}
</style>
