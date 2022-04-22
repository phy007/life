<template>
  <view>
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
          @change="switchChange"
          :checked="isChecked"
        />
      </view>
    </view>
    <view class="s-box">
      <view class="sb-item" @click="loginout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/request'
import { get_userId } from '../../utils/storage'
export default {
  data() {
    return {
      power: '',
      isChecked: false,
      userId: getApp().globalData.$userId || get_userId(),
    }
  },
  onLoad(e) {
    if (e.p === '1') {
      this.isChecked = true
    } else {
      this.isChecked = false
    }
    this.power = e.p
  },
  methods: {
    switchChange(e) {
      const _this = this
      if (this.isChecked !== e.detail.value) {
        request({
          url: '/updatePower',
          data: {
            power: e.detail.value ? '1' : '0',
            userId: _this.userId,
          },
        })
        this.isChecked = e.detail.value
      }
    },
    jumpNextPage() {
      const _this = this
      uni.navigateTo({
        url: '/pages/accountDetail/accountDetail?id=' + _this.userId,
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
