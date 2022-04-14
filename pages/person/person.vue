<template>
  <view>
    <view class="p-info">
      <image v-if="userInfo.image" :src="`${baseUrl}${userInfo.image}`"></image>
      <image v-else src="/static/img/defaultuser.png"></image>
      <view>
        <text>{{ userInfo.phone }}</text>
        <text class="p-alias">昵称：{{ userInfo.userName || '未定义' }}</text>
      </view>
      <uni-icons
        type="gear-filled"
        size="30"
        color="#7950ea"
        @click="jumpNextPage(1)"
      ></uni-icons>
    </view>
    <view class="p-concat">
      <view>
        <text>动态</text>
        <text>0</text>
      </view>
      <view>
        <text>好友</text>
        <text>0</text>
      </view>
    </view>
    <!-- 点赞区 -->
    <view class="p-mainBox">
      <view class="p-mBTop">
        <uni-icons type="heart-filled" size="30" color="#7950ea"></uni-icons>
        <text>我的喜欢</text>
        <text class="p-mBMore" @click="jumpNextPage(2)">查看更多</text>
      </view>
      <view class="p-like">
        <view class="pLItem">
          <text>点赞内容1</text>
          <text>点赞时间</text>
        </view>
        <view class="pLItem">
          <text>点赞内容2</text>
          <text>点赞时间</text>
        </view>
        <view class="pLItem">
          <text>点赞内容3</text>
          <text>点赞时间</text>
        </view>
        <view class="pLItem">
          <text>点赞内容4</text>
          <text>点赞时间</text>
        </view>
      </view>
    </view>
    <!-- 收藏区 -->
    <view class="p-mainBox">
      <view class="p-mBTop">
        <uni-icons type="star-filled" size="30" color="#7950ea"></uni-icons>
        <text>我的收藏</text>
        <text class="p-mBMore" @click="jumpNextPage(3)">查看更多</text>
      </view>
      <view class="p-collect">
        <view>
          <text>收藏内容</text>
          <text>收藏时间</text>
        </view>
      </view>
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
    }
  },
  onLoad() {
    console.log('object');
    this.getUser()
  },
  methods: {
    jumpNextPage(t) {
      if (t === 1) {
        uni.navigateTo({
          url: '/pages/setPage/setPage',
        })
      } else if (t === 2) {
        uni.navigateTo({
          url: '/pages/favorites/favorites?type=like',
        })
      } else if (t === 3) {
        uni.navigateTo({
          url: '/pages/favorites/favorites?type=collect',
        })
      }
    },
    getUser() {
      request({
        url: '/getUser',
        data: { userId: getApp().globalData.$userId || get_userId() },
      }).then((v) => {
        const { statusCode } = v
        const { code, data } = v.data
        if (statusCode === 200) {
          if (code === 1 && data.length) {
            this.userInfo = data[0]
          }
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.p-info {
  width: 100%;
  display: flex;
  align-items: center;
  // #ifdef MP-WEIXIN
  box-sizing: border-box;
  padding-right: 36px;
  // #endif
  .uni-icons {
    width: 30px;
    margin-right: 20px;
  }
  image {
    width: 80px;
    height: 80px;
    margin: 15px 16px;
  }
  view {
    flex: 1;
    text {
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .p-alias {
      display: block;
      font-size: 18px;
      color: #cfcaca;
      margin-top: 5px;
    }
  }
}
.p-concat {
  width: 100%;
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 17px;
  color: #c290be;
  view {
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
.p-mainBox {
  margin-top: 15px;
  .p-mBTop {
    width: 100%;
    padding-left: 5px;
    display: flex;
    align-items: center;
    text {
      font-size: 20px;
      font-weight: bold;
      color: #7950ea;
      margin-left: 4px;
      letter-spacing: 1px;
    }
    .p-mBMore {
      flex: 1;
      font-weight: bold;
      font-size: 16px;
      text-align: right;
      margin-right: 20px;
      text-decoration: underline;
    }
  }
  .p-like,
  .p-collect {
    width: auto;
    height: 120px;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 10px;
    view {
      min-width: 130px;
      margin: 0 6px;
      text {
        display: block;
      }
      text:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        height: 80px;
        outline: 1px solid #7950ea;
        border-radius: 5px;
        padding: 5px;
      }
      text:nth-child(2) {
        margin: 4px;
        color: #cfcaca;
        letter-spacing: 1px;
      }
    }
  }
  .p-like::-webkit-scrollbar,
  .p-collect::-webkit-scrollbar {
    display: none;
  }
}
</style>
