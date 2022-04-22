<template>
  <view>
    <view class="p-info">
      <image v-if="userInfo.image" :src="`${baseUrl}${userInfo.image}`"></image>
      <image v-else src="/static/img/defaultuser.png"></image>
      <view class="p-info-title">
        <text>{{ userInfo.phone }}</text>
        <text class="p-alias">昵称：{{ userInfo.userName || '未定义' }}</text>
      </view>
      <view class="p-info-forward">
        <navigator :url="`/pages/profile/profile?id=${userId}`">
          <uni-icons type="forward" size="20"></uni-icons>
        </navigator>
      </view>
    </view>
    <view class="p-concat">
      <view class="p-conMain" @click="jumpMomentPage">
        <text>动态</text>
        <text>{{ mCount }}</text>
      </view>
      <navigator class="p-conMain" :url="`/pages/friends/friends?id=${userId}`">
        <text>好友</text>
        <text>{{ fCount }}</text>
      </navigator>
    </view>
    <view class="p-tag"> 欢迎来到我的世界！！！ </view>
    <view class="p-likeBox">
      <view>
        <navigator :url="`/pages/favorites/favorites?id=${userId}&type=like`">
          <uni-icons type="star" size="30" color="#7950EA"></uni-icons>
          <text>收藏</text>
        </navigator>
      </view>
      <view>
        <navigator
          :url="`/pages/favorites/favorites?id=${userId}&type=collect`"
        >
          <uni-icons type="hand-up" size="30" color="#7950EA"></uni-icons>
          <text>点赞</text>
        </navigator>
      </view>
      <view>
        <navigator :url="`/pages/setPage/setPage?p=${userInfo.power}`">
          <uni-icons type="gear" size="30" color="#7950EA"></uni-icons>
          <text>设置</text>
        </navigator>
      </view>
    </view>
    <view class="p-moreBox">
      <view class="p-moreBTitle">更多服务</view>
      <uni-list>
        <!-- clickable 才能触发事件 -->
        <uni-list-item title="用户协议" showArrow></uni-list-item>
        <uni-list-item title="隐私政策" showArrow></uni-list-item>
        <uni-list-item title="我要反馈" showArrow></uni-list-item>
      </uni-list>
    </view>
  </view>
</template>

<script>
import { request, BASE_URL } from '../../utils/request'
import { get_userId } from '../../utils/storage'

export default {
  data() {
    this.baseUrl = `${BASE_URL}/static/`
    return {
      userInfo: {},
      userId: getApp().globalData.$userId || get_userId(),
      mCount: 0,
      fCount: 0,
      showType: 0,
    }
  },
  onLoad() {
    this.getUser()
  },
  onShow() {
    this.getUser()
  },
  methods: {
    getUser() {
      const _this = this
      request({
        url: '/getProfile',
        data: { userId: _this.userId },
      }).then((v) => {
        const { user, momentCount, friendCount } = v.data
        if (v.statusCode === 200) {
          _this.userInfo = user
          _this.mCount = momentCount
          _this.fCount = friendCount
        }
      })
    },
    jumpMomentPage() {
      uni.switchTab({
        url: '/pages/moment/moment',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';

.p-concat {
  width: 100%;
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 17px;
  color: #c290be;
  margin-bottom: 5px;
  .p-conMain {
    width: 50%;
    text {
      display: block;
      margin-bottom: 5px;
    }
  }
  view:first-child {
    border-right: 1px solid #e5e5e5;
  }
  view:nth-child(2) {
    border-left: 1px solid #e5e5e5;
  }
}
.p-tag {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background: linear-gradient(
    to bottom left,
    #e815d6,
    rgb(135, 135, 235),
    pink
  );
  opacity: 0.7;
  letter-spacing: 1px;
  width: 96%;
  color: rgb(65, 63, 63);
  margin: 0 auto;
  border-radius: 15px;
}
.p-likeBox {
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  view {
    width: 25%;
    text {
      display: block;
      margin-top: 5px;
      text-align: center;
    }
  }
}
.p-moreBox {
  .p-moreBTitle {
    margin: 0 0 6px 10px;
    font-size: 18px;
    font-weight: bold;
    color: #7950ea;
  }
}
</style>
