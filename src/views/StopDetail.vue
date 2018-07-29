<template>
  <div>
    <card class="item-card" style="margin: 1rem;">
          <div slot="header" class="weui-panel__hd card-header">
            站点详情
          </div>
          <div slot="content" class="card-flex">
              <p>注册编码：{{msg.hctxh}}</p>
              <p>建设单位：{{msg.dwmc}}</p>
              <p>所属站牌：{{msg.zpmc}}</p>
              <p>路线名称：{{msg.xlmc}}</p>
          </div>
    </card>
  </div>
</template>

<script>
import { Card } from "vux";
import { mapMutations } from "vuex";

export default {
  components: {
    Card
  },
  data() {
    return {
      msg: {
        hctxh: "注册编码",
        dwmc: "建设单位",
        zpmc: "所属站牌",
        xlmc: "线路名称"
      }
    };
  },
  methods: {
      ...mapMutations(["updateTitle", "updateLoadingStatus"])
  },
  mounted() {
    this.updateTitle({title: '站点详情'})
    this.$route.query && (this.msg = this.$route.query);
  },
  methods: {}
};
</script>

<style scoped>
.item-card {
  margin: 1rem;
  border: 1px solid #9999;
  border-radius: 10px;
}
.item-card .card-header {
  color: #000;
  font-size: 2rem;
}
.item-card .card-flex {
  color: #9999;
  font-size: 1.5rem;
  padding: 14px 15px 10px;
}
</style>