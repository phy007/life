<template>
  <view>
    <user-protocol v-if="forwardType === 1"></user-protocol>
    <privacy-policy v-else-if="forwardType === 2"></privacy-policy>
    <feedback v-else-if="forwardType === 3"></feedback>
    <template v-else>
      <view class="s-box">
        <view class="sb-item">
          <text>账号资料</text>
          <uni-icons type="right" size="24" @click="jumpNextPage"></uni-icons>
        </view>
      </view>
      <view class="s-box">
        <view class="sb-item">
          <text>个人可见</text>
          <switch
            style="transform: scale(0.7)"
            @change="switchChange1"
            checked
          />
        </view>
        <view class="sb-item">
          <text>好友可见</text>
          <switch style="transform: scale(0.7)" @change="switchChange2" />
        </view>
      </view>
      <view class="s-box">
        <view class="sb-item">
          <text>用户协议</text>
          <uni-icons type="right" size="24" @click="showNext(1)"></uni-icons>
        </view>
        <view class="sb-item">
          <text>隐私政策</text>
          <uni-icons type="right" size="24" @click="showNext(2)"></uni-icons>
        </view>
        <view class="sb-item">
          <text>我要反馈</text>
          <uni-icons type="right" size="24" @click="showNext(3)"></uni-icons>
        </view>
      </view>
      <view class="s-box">
        <view class="sb-item" @click="loginout">
          <text>退出登录</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import Feedback from '../../component/profile/Feedback.vue'
import PrivacyPolicy from '../../component/profile/PrivacyPolicy.vue'
import UserProtocol from '../../component/profile/UserProtocol.vue'
import { get_userId } from '../../utils/storage'
export default {
  components: { UserProtocol, PrivacyPolicy, Feedback },
  data() {
    return {
      forwardType: -1,
    }
  },
  methods: {
    switchChange1(e) {
      console.log(e.detail.value)
    },
    switchChange2(e) {
      console.log(e.detail.value)
    },
    jumpNextPage() {
      uni.navigateTo({
        url:
          '/pages/accountDetail/accountDetail?userId=' +
          getApp().globalData.$userId || get_userId(),
      })
    },
    showNext(t) {
      this.forwardType = t
    },
    loginout() {
      uni.removeStorage({ key: 'userId' })
      uni.removeStorage({
        key: 'token',
        success: function () {
          uni.navigateTo({ url: '/pages/login/login' })
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.s-box {
  width: 100%;
  border-bottom: 7px solid #e5e5e5;
  .sb-item {
    font-size: 18px;
    letter-spacing: 1px;
    padding: 10px 5px;
    border-bottom: 1px dashed #e5e5e5;
    display: flex;
    align-content: center;
    text {
      flex: 1;
    }
    .uni-icons {
      text-align: right;
    }
  }
}
</style>
