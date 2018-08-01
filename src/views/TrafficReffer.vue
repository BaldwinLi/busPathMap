<template>
  <div>
    <tab>
      <tab-item @on-item-click="trigger" selected>交通新闻</tab-item>
      <tab-item @on-item-click="trigger" >公共交通</tab-item>
      <tab-item @on-item-click="trigger">城际出行</tab-item>
    </tab>
    <div v-for="(item, index) in list" :key="index" class="box" >
      <h1>{{item.time}}</h1>
      <ul>
        <li v-for="(i, index) in item.data" :key="index" @click="detail(i.id)">
          <img :src="i.img" />
          <div>{{i.title}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { XButton, Box, Sticky, Tab, TabItem } from "vux";
import { mapMutations, mapGetters } from "vuex";

export default {
  components: {
    XButton,
    Box,
    Sticky,
    Tab,
    TabItem
  },
  data() {
    return {
      list: [
        {
          time: "2018/05/8",
          data: [
            {
              id: "0",
              img: "static/th.jpg",
              title: "哈尔滨至牡丹江市客运专场即将建成 运行时间只需1个多小时"
            },
            {
              id: "1",
              img: "static/th_1.jpg",
              title: "哈尔滨至牡丹江市七座商务班车"
            }
          ]
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['appContextPath'])
  },
  methods: {
    trigger(results) {},

    detail(id) {
      this.$router.push({
        path: "/traffic_detail",
        query: {
          id: id
        }
      });
    },
    ...mapMutations(["updateTitle"])
  },
  mounted() {
    this.updateTitle("交通资讯");
  }
};
</script>

<style scoped>
.box {
  padding-left: 2rem;
}

.box h1 {
  font-weight:normal;
  font-size:1.5rem;
  line-height:4rem;
  color: #ddd;
   border-bottom: 1px solid #ddd;
}

/* .box ul {
} */

.box ul li {
  list-style: none;
  border-bottom: 1px solid #ddd;
  overflow: hidden;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.box ul img {
  width: 5rem;
  height: 5rem;
  border: 1px solid #ddd;
  float: left;
}

.box ul li div {
  float: left;
  width: calc(100%  - 7rem);
  font-size: 1.5rem;
  padding-left: 1rem;
}
</style>