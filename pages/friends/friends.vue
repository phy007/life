<template>
  <view>
    <uni-search-bar
      @confirm="search"
      maxlength="20"
      placeholder="搜索"
      cancelButton="none"
    >
    </uni-search-bar>
    <view class="f-friItem">
      <image src=""></image>
      <text>添加朋友</text>
    </view>
    <text class="f-box">all</text>
    <view class="f-friItem" v-for="(f, i) in friendsList" :key="i">
      <image
        :src="f.image ? `${baseUrl}${f.image}` : '/static/img/defaultuser.png'"
      ></image>
      <view class="f-friMain">
        <text>{{ f.userName }}</text>
        <text v-if="f.remark" class="f-remark">{{ f.remark }}</text>
      </view>
      <text class="f-addremark">备注</text>
    </view>
  </view>
</template>

<script>
import { request, BASE_URL } from '../../utils/request'
export default {
  data() {
    return {
      friendsList: [],
      baseUrl: `${BASE_URL}/static/`,
    }
  },
  methods: {
    onLoad() {
      this.getFriendsList()
    },
    getFriendsList() {
      const _this = this
      request({
        url: '/getFriends',
        data: {
          userId: getApp().globalData.$userId || get_userId(),
        },
      }).then((v) => {
        if (v.statusCode) {
          _this.friendsList = v.data
          console.log(v.data)
        }
      })
    },
    search(res) {
      console.log(res.value)
    },
    bindClick(e) {
      console.log('点击item，返回数据' + JSON.stringify(e))
    },
  },
}
</script>

<style lang="scss" scoped>
.f-friItem {
  margin-top: 5px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebebeb;
  image {
    width: 36px;
    height: 36px;
    margin-right: 7px;
  }
  .f-friMain {
    flex: 1;
  }
  .f-remark {
    color: #b4b3b3;
    font-size: 14px;
    display: block;
  }
  .f-addremark {
    font-size: 14px;
    width: 30px;
    display: block;
    text-align: right;
    color: #b4b3b3;
  }
}
.f-box {
  width: 100%;
  display: block;
  font-size: 12px;
  padding: 2px 8px;
  background-color: #ebebeb;
  color: #535050;
}
</style>
