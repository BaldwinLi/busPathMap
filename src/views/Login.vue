<template>
  <div>
    <group>
      <x-input placeholder="用户名/邮箱/手机号码" v-model="user_account"></x-input>
      <x-input placeholder="密码" type="password" v-model="password"></x-input>
    </group>
    <box gap="10px 10px">
      <div class="button-panel">
        <router-link to="/signin">
          <span>手机注册</span>
        </router-link>
        <router-link to="/forget_password">
          <span>忘记密码</span>
        </router-link>
      </div>
    </box>
    <box gap="10px 10px">
      <x-button type="primary" @click.native="login()">登 录</x-button>
    </box>
  </div>
</template>

<script>
  import {XInput, Group, XButton, Cell, Box} from 'vux'
  import {mapState, mapGetters, mapMutations} from "vuex";
  import store from '../vuex/store'
  import Vue from 'vue'

  export default {
    components: {
      XInput, Group, XButton, Cell, Box
    },
    data: () => {
      return {
        user_account: '',
        password: ''
      }
    },
    computed: {
      ...mapGetters(["appContextPath"])
    },
    methods: {
      login() {
        console.log(this.user_account, this.password);
        let params = {
          user_account: this.user_account,
          password: this.password,
          user_type: 1
        };
        Vue.http.post(`${store.getters.appContextPath}loginUser`, params).then(result => {
          const _data = result.data.responseBody.result;
          this.$vux.alert.show({
            title: '提示',
            content: '注册成功。'
          });
        }, error => {
          this.$vux.alert.show({
            title: '提示',
            content: '数据传输失败。'
          });
          console.log(error);
        });
      }
    }
  }
</script>

<style scoped>
  .button-panel a{
    display: block;
    margin: 0;
    font-size: 15px;
    color: #999;
    padding-bottom: 30px;
  }
  .button-panel a:first-child{
    float: left;
  }
  .button-panel a:last-child{
    float: right;
  }
</style>
