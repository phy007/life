<template>
  <view>
    <view class="p-info">
      <image v-if="userInfo.image" :src="`${baseUrl}${userInfo.image}`"></image>
      <image v-else src="/static/img/defaultuser.png"></image>
      <view class="p-info-title">
        <text>{{ userInfo.phone }}</text>
        <text class="p-alias">昵称：{{ userInfo.userName || '未定义' }}</text>
      </view>
      <view v-if="ownId == userId" class="p-info-right">
        <navigator :url="`/pages/accountDetail/accountDetail?id=${userId}`"
          >编辑</navigator
        >
      </view>
    </view>

    <view class="p-mainBox">
      <view class="p-mBTop">
        <uni-icons type="spinner-cycle" size="30" color="#7950ea"></uni-icons>
        <text>动态 {{ mCount }}</text>
      </view>
    </view>
    <view class="p-mainBox">
      <view class="p-mBTop">
        <uni-icons type="staff-filled" size="30" color="#7950ea"></uni-icons>
        <text>好友 {{ fCount }}</text>
      </view>
    </view>
    <!-- 点赞区 -->
    <view class="p-mainBox">
      <view class="p-mBTop">
        <uni-icons type="heart-filled" size="30" color="#7950ea"></uni-icons>
        <text>我的点赞 {{ favorites.length ? favorites.length : 0 }}</text>
        <text class="p-mBMore" @click="jumpNextPage(2)">查看更多</text>
      </view>
      <view v-if="favorites.length" class="p-like">
        <view
          v-for="(f, i) in favorites"
          :key="i"
          class="pLItem"
          @click="jumpNextRDPage(f.recordId)"
        >
          <text>{{ f.recordText }}</text>
          <text>{{ f.favoriteTime | formatTime }}</text>
        </view>
      </view>
    </view>
    <!-- 收藏区 -->
    <view class="p-mainBox">
      <view class="p-mBTop">
        <uni-icons type="star-filled" size="30" color="#7950ea"></uni-icons>
        <text>我的收藏 {{ collects.length ? collects.length : 0 }}</text>
        <text class="p-mBMore" @click="jumpNextPage(3)">查看更多</text>
      </view>
      <view v-if="collects.length" class="p-collect">
        <view
          v-for="(c, i) in collects"
          :key="i"
          class="pLItem"
          @click="jumpNextRDPage(c.recordId)"
        >
          <text>{{ c.recordText }}</text>
          <text>{{ c.collectTime | formatTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request, BASE_URL } from '../../utils/request'
import { get_userId } from '../../utils/storage'
export default {
  data() {
    return {
      userInfo: {},
      userId: 0,
      mCount: 0,
      fCount: 0,
      baseUrl: `${BASE_URL}/static/`,
      ownId: getApp().globalData.$userId || get_userId(),
      collects: [],
      favorites: [],
    }
  },
  onLoad(e) {
    this.userId = e.id
    this.getProfile()
    this.getLikeData()
  },
  methods: {
    getProfile() {
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
    getLikeData() {
      const _this = this
      request({
        url: '/getColAndFav',
        data: {
          userId: _this.userId,
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.collects = v.data.collects
          _this.favorites = v.data.favorites
        }
      })
    },
    jumpNextPage(t) {
      if (t === 1) {
        uni.navigateTo({
          url: '/pages/setPage/setPage',
        })
      } else if (t === 2) {
        uni.navigateTo({
          url: `/pages/favorites/favorites?type=like&id=${this.userId}`,
        })
      } else if (t === 3) {
        uni.navigateTo({
          url: `/pages/favorites/favorites?type=collect&id=${this.userId}`,
        })
      }
    },
    jumpNextRDPage(id) {
      commonWays.jumpToRecordDetail(id)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';

.p-mainBox {
  padding: 10px 0;
  border-bottom: 1px solid #cfcaca;
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
    // margin-top: 10px;
    width: auto;
    height: 120px;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 15px 10px;
    // border-top: 1px solid #cfcaca;
    .pLItem {
      width: 130px;
      margin: 0 6px;
      text {
        display: block;
      }
      text:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        overflow-y: scroll;
        height: 82px;
        outline: 1px solid #7950ea;
        border-radius: 5px;
        padding: 5px;
      }
      text:nth-child(2) {
        color: #e8e;
        text-align: center;
      }
    }
  }
  .p-like::-webkit-scrollbar,
  .p-collect::-webkit-scrollbar {
    display: none;
  }
}
</style>
