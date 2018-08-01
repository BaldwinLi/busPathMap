<template>
  <div class="forget_password">
    <group>
      <x-input title="手机号码" placeholder="请输入手机号码" v-model="user_account"></x-input>
      <x-input title="验证码" placeholder="请输入验证码" v-model="checkNum">
        <x-button slot="right" type="primary" @click.native="getCheckNum()">获取</x-button>
      </x-input>
      <x-input title="密码" placeholder="请输入新密码" type="password" v-model="password"></x-input>
      <x-input title="确认密码" placeholder="请再次输入新密码" type="password" v-model="confirm_password"></x-input>
    </group>
    <box gap="10px 10px">
      <x-button type="primary" @click.native="updatePassword()">确认</x-button>
    </box>
  </div>
</template>

<script>
  import {XInput, Group, XButton, Cell, Box, Alert} from 'vux'
  import {mapState, mapGetters, mapMutations} from "vuex";
  import store from '../vuex/store'
  import Vue from 'vue'

  export default {
    components: {
      XInput, Group, XButton, Cell, Box, Alert
    },
    data: () => {
      return {
        user_account: '',
        checkNum: '',
        password: '',
        confirm_password: ''
      }
    },
    computed: {
      ...mapGetters(["appContextPath"])
    },
    methods: {
      updatePassword() {
        console.log(this.user_account, this.password);
        let params = {
          user_account: this.user_account,
          password: this.password,
        };
        Vue.http.post(`${store.getters.appContextPath}updatePassword`, params).then(result => {
          const _data = result.data.responseBody.result;
          this.$vux.alert.show({
            title: '提示',
            content: '密码修改成功。'
          });
        }, error => {
          this.$vux.alert.show({
            title: '提示',
            content: '数据传输失败。'
          });
          console.log(error);
        });
      },
      getCheckNum() {

      }
    }
  }
</script>

<style scoped>
  .forget_password .weui-label {
    min-width: 18rem;
  }
</style>
