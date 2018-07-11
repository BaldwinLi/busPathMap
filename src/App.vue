<template>
  <div id="app">
    <loading v-model="isLoading" text="加载中"></loading>
    <router-view></router-view>
  </div>
</template>

<script>
import { Loading } from "vux";
import { mapState, mapGetters, mapMutations } from "vuex";

export default {
  name: "app",
  components: {
    Loading
  },
  data() {
    return {};
  },
  methods: {
    ...mapMutations(["updateLoadingStatus"]),
    resetDocumentSize(height) {
      setTimeout(() => {
        $(document).height(height || window.screen.height);
      });
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.isLoading,
      title: state => state.title
    }),
    ...mapGetters(["appContextPath", "agentType"])
  },
  mounted() {
    // document.activeElement.addEventListener('blur', () => {
    //   setTimeout(() => {
    //     document.documentElement.style.height = window.innerHeight + 'px';
    //   });
    //   // $(document).height($(window).height()+'px');
    // })
    const scope = this;
    if (this.agentType === "Android") {
      // var winHeight = window.clientheight; //获取当前页面高度
      $(window).resize(() => {
        // var thisHeight = $(this).height();
        // if (winHeight - thisHeight <= 140) {
        // this.resetDocumentSize(winHeight);
        scope.resetDocumentSize();
        // }
      });
      $('body').height($('body')[0].clientHeight);
    }
    //  else if (this.agentType === "IOS") {
    //   $(document).on("focusout", function() {
    //     //软键盘收起的事件处理
    //   });
    // }
  }
};
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';

body {
  background-color: #fbf9fe;
}
</style>
