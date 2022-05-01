<template>
  <v-row class="account-page pa-4">
    <v-col cols="3" class="my-10">
      <div class="box">
        <div class="text-center">
          <h3>{{ userinfo.name }}</h3>
          <div>
            {{ userinfo.email }}
          </div>
        </div>
        <div class="text-caption">
          hello,这是你使用 PAGENOTE 的第n天。
          当前设备里你对有与12个页面进行了标记
        </div>
      </div>
    </v-col>
    <v-col cols="3">
      <div class="box">
        <h3>邀请好友</h3>
        <div>
          <div class="text-body-2">
            {{ userinfo.inviteInfo.inviteBierf }}
          </div>
        </div>
      </div>
      <div class="box">
        <h3>设备信息</h3>
        <div class="text-body-2">
          <div>PAGENOTE 版本： {{ userinfo.deviceInfo.version }}</div>
          <div>设备ID： {{ userinfo.deviceInfo.did }}</div>
        </div>
      </div>
    </v-col>
    <v-col cols="3">
      <div class="box mt-4">
        <h3>赞助信息</h3>
        <div>
          <v-btn href="https://pagenote.cn/pro-plan" small> 立即赞助 </v-btn>
        </div>
      </div>
      <div class="box">
        <h3>账号绑定</h3>
      </div>
    </v-col>
    <v-col cols="3">
      <div class="box">
        <h3>问题反馈</h3>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AccountPage',
  data(): {
    userinfo: {
      name: string
      email: string
      inviteInfo: {
        inviteCode: string
        inviteBierf: string
      }
      deviceInfo: {
        did: string
        installAt: string
        version: string
      }
    }
  } {
    return {
      userinfo: {
        name: 'yiyushushenng',
        email: 'sfa@qq.com',
        inviteInfo: {
          inviteCode: 'sfdf',
          inviteBierf: 'saf',
        },
        deviceInfo: {
          did: 'asffasfadf',
          installAt: '2020-11-12',
          version: '0.20.11',
        },
      },
    }
  },
  head() {
    return {
      title: '我与PAGENOTE',
    }
  },
})
</script>

<style scoped lang="scss">
.account-page {
  background: linear-gradient(180deg, #fefbfb 0%, #fceeea 100%);
  border-radius: 58px;
}

.box {
  width: 210px;
  padding: 24px;
  margin: 24px 0;
  background: #fff;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 25%);
  border-radius: 20px;
  h3 {
    color: #e45863;
    font-size: 18px;
  }
}
</style>
