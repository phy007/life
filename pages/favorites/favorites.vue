<template>
  <view>
    <uni-search-bar @confirm="search" :focus="true" maxlength="20">
    </uni-search-bar>
    <!-- 搜索框过滤数据展示 -->
    <template v-if="filterlikeList.length">
      <uni-card v-for="(l, lindex) in filterlikeList" :key="lindex">
        <view class="f-item">
          <view v-if="l.recordImage" class="f-imgBox">
            <image
              v-for="(img, i) in l.recordImage.split('&')"
              :key="i"
              :src="`${baseUrl}${img}`"
              mode="widthFix"
            ></image>
          </view>
          <view class="f-main">
            <text @click="jumpNextPage(l, 'other')" class="f-mainText">{{
              l.recordText
            }}</text>
            <text class="f-mainTitle">{{ l.userName }}</text>
            <text class="f-mainTime">{{ l.likeTime | formatTime }}</text>
            <uni-icons
              @click="jumpNextPage(l, 'other')"
              class="f-mainIcon"
              type="more"
              size="20"
            ></uni-icons>
          </view>
        </view>
      </uni-card>
    </template>
    <!-- 加载全部数据 -->
    <template v-else>
      <uni-card v-for="(l, lindex) in likeList" :key="lindex">
        <view class="f-item">
          <view v-if="l.recordImage" class="f-imgBox">
            <image
              v-for="(img, i) in l.recordImage.split('&')"
              :key="i"
              :src="`${baseUrl}${img}`"
              mode="widthFix"
            ></image>
          </view>
          <view class="f-main">
            <text @click="jumpNextPage(l, 'other')" class="f-mainText">{{
              l.recordText
            }}</text>
            <text class="f-mainTitle">{{ l.userName }}</text>
            <text class="f-mainTime">{{ l.likeTime | formatTime }}</text>
            <uni-icons
              @click="jumpNextPage(l, 'other')"
              class="f-mainIcon"
              type="more"
              size="20"
            ></uni-icons>
          </view>
        </view>
      </uni-card>
    </template>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request, BASE_URL } from '../../utils/request'
export default {
  data() {
    return {
      baseUrl: `${BASE_URL}/static/`,
      likeList: [],
      filterlikeList: [],
    }
  },
  onLoad(e) {
    let title
    if (e.type === 'like') {
      title = 'Favorite'
      this.getLikeData({
        userId: getApp().globalData.$userId || get_userId(),
        favorite: '1',
      })
    } else {
      title = 'Collect'
      this.getLikeData({
        userId: getApp().globalData.$userId || get_userId(),
        collect: '1',
      })
    }
    uni.setNavigationBarTitle({
      title,
    })
    console.log(this.likeList)
  },
  methods: {
    getLikeData(data) {
      const _this = this
      request({
        url: '/getLikeData',
        data,
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.likeList = v.data
        }
      })
    },
    search(res) {
      if (res.value) {
        this.filterlikeList = this.likeList.filter(
          (v) =>
            v.recordText.indexOf(res.value) !== -1 ||
            v.userName.indexOf(res.value) !== -1 ||
            this.$options.filters['formatTime'](v.likeTime).indexOf(
              res.value
            ) !== -1
        )
      } else {
        this.filterlikeList = []
      }
    },
    jumpNextPage(record, type) {
      commonWays.jumpToRecordDetail(record, type)
    },
  },
}
</script>

<style lang="scss" scoped>
.f-item {
  width: 100%;
  display: flex;
  align-items: center;
  .f-imgBox {
    width: 36%;
    background-color: aqua;
    box-sizing: border-box;
    margin-right: 4%;
    image {
      height: auto;
      flex: 1;
    }
  }
  .f-main {
    flex: 1;
    box-sizing: border-box;
    position: relative;
    text {
      display: block;
    }
    .f-mainText {
      width: 100%;
      height: 90px;
      position: relative;
      overflow: hidden;
      font-size: 14px;
    }
    .f-mainTitle {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .f-mainTime {
      color: #e8e;
    }
    .f-mainIcon {
      position: absolute;
      bottom: 7px;
      right: 7px;
    }
  }
}
</style>
