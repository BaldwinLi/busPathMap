<template>
  <div>
    <h1>{{title}}</h1>
    <p>{{content}}</p>
  </div>
</template>

<script>
import { XButton, Box, Sticky, Tab, TabItem } from "vux";

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
      id: '',
      img:'',
      title:'哈尔滨至牡丹江市客运专场即将建成 运行时间只需1个多小时',
      content:'央广网哈尔滨4月25日消息（记者郭淼）据中国之声《央广新闻》报道，备受关注的哈牡客专即将建成，记者从中国中铁了解到，目前工程已进入信号、通信信息、电力、牵引供电接触网系统的施工阶段，之后将迎来整个线路的联调联试。那么哈牡客专的建成通车将为旅客的出行带来怎样的便捷，又将如何改变东北地区的经济？哈牡客专，东起哈尔滨，西至牡丹江市，全长292.995公里，设计时速250公里/小时，是黑龙江哈尔滨市到牡丹江市的铁路客运专线，是建国以来黑龙江省单体投资最大的项目之一，沿途共设11座车站。建成后，哈尔滨到牡丹江的运行时间将由原来的4个多小时缩短至1个多小时。根据中铁一局集团哈牡客专四电集成项目部常务副经理郑向城的介绍，目前整个工程已进入到施工的最后阶段——也就是四电系统的施工阶段。高铁四电素有“铁路中枢神经”之称，可见它在整个线路中起着非常重要的作用。'
    };
  },
  mounted() {
    console.log(this.$route)
    this.id = this.$route.query.id
  },
  methods: {}
};
</script>

<style scoped>
div{
  padding:1rem;
}
h1{
  font-weight: normal;
}
p{
  padding-top: 2rem;
  font-size:1.2rem;
}
</style>