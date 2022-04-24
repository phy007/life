<template>
  <view>
    <view class="searchBox">
      <uni-search-bar
        @confirm="search"
        maxlength="20"
        placeholder="搜索"
        cancelButton="auto"
        @cancel="cancel"
        @clear="clear"
      >
      </uni-search-bar>
      <template v-if="showFilterBox">
        <view v-if="filterList.length" class="filterBox">
          <text
            class="filterText"
            v-for="(f, fi) in filterList"
            :key="fi"
            @click="jumpToProfilePage(f.friendId)"
            >{{ f.userName }} {{ f.remark }}</text
          >
        </view>
        <view class="filterBox" v-else>
          <text class="filternottext">没有相关好友</text>
        </view>
      </template>
    </view>

    <view @click="addFriend" class="f-friItem">
      <uni-icons type="personadd-filled" size="30"></uni-icons>
      <text>添加朋友</text>
    </view>
    <text class="f-box">all</text>
    <template v-if="friendsList.length">
      <view
        class="f-friItem"
        v-for="(f, i) in friendsList"
        :key="i"
        @longpress="longtap(f.id)"
      >
        <view class="f-friLeft" @click="jumpToProfilePage(f.friendId)">
          <image
            :src="
              f.image ? `${baseUrl}${f.image}` : '/static/img/defaultuser.png'
            "
          ></image>
          <view class="f-friLMain">
            <text>{{ f.userName }}</text>
            <text v-if="f.remark" class="f-remark">{{ f.remark }}</text>
          </view>
        </view>
        <text @click="remark(f)" class="f-addremark">备注</text>
      </view>
    </template>
    <view class="com-notFound" v-else>你还未有好友，快去添加吧！</view>

    <view class="bt-pop" v-if="showPop">
      <view class="b-popMain">
        <template v-if="showPopChannel === 'add'">
          <text class="b-popTitle">添加好友</text>
          <input
            type="phone"
            placeholder="输入手机号码"
            v-model="inputPhone"
            @blur="verifyPhone"
          />
          <text v-if="errorText" class="pop-errtext">{{ errorText }}</text>
        </template>
        <template v-else>
          <text class="b-popTitle">{{ userName }}</text>
          <text class="b-popTitle" style="font-size: 16px">备注</text>
          <input
            type="text"
            placeholder="输入备注"
            v-model="inputText"
            auto-focus
          />
        </template>
        <button class="com-button com-btn-red" @click="sureInput">确定</button>
        <button class="com-button com-btn-green" @click="cancelInput">
          取消
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request, BASE_URL } from '../../utils/request'
export default {
  data() {
    this.userId = getApp().globalData.$userId || get_userId()
    return {
      friendsList: [],
      filterList: [],
      baseUrl: `${BASE_URL}/static/`,
      showPop: false,
      showFilterBox: false,
      inputPhone: '',
      inputText: '',
      errorText: '',
      userName: '',
      isErrorInput: false,
      checkVerify: false,
      showPopChannel: '',
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
          ownId: getApp().globalData.$userId || get_userId(),
        },
      }).then((v) => {
        if (v.statusCode) {
          _this.friendsList = v.data.friends
          _this.phonesList = v.data.phones
        }
      })
    },
    jumpToProfilePage(id) {
      commonWays.jumpToProfilePage(id)
    },
    search(res) {
      this.filterList = this.friendsList.filter(
        (v) =>
          v.userName.indexOf(res.value) !== -1 ||
          v.remark.indexOf(res.value) !== -1
      )
      this.showFilterBox = true
    },
    cancel() {
      this.filterList = []
      this.showFilterBox = false
    },
    clear() {
      this.showFilterBox = false
    },
    addFriend() {
      this.showPop = true
      this.showPopChannel = 'add'
    },
    remark(r) {
      this.inputText = r.remark
      this.friendInfo = r
      this.userName = r.userName
      this.showPopChannel = 'remark'
      this.showPop = true
    },
    verifyPhone() {
      let phone = this.inputPhone
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/
      this.checkVerify = true
      const _this = this
      if (phone === '') {
        this.errorText = '不能为空'
        this.isErrorInput = true
      } else if (!reg.test(phone)) {
        this.errorText = '输入不合法'
        this.isErrorInput = true
      } else if (this.phonesList.indexOf(phone) !== -1) {
        this.errorText = '已添加该好友'
        this.isErrorInput = true
      } else {
        // 查询user表中合法的phone是否存在，存在发送请求成功，不存在报错，重新输入
        request({
          url: '/getExistUser',
          data: {
            phone,
          },
        }).then((v) => {
          if (v.statusCode === 200) {
            if (v.data.userId == _this.userId) {
              this.errorText = '不能添加自己'
              this.isErrorInput = true
            } else if (v.data.userId != _this.userId && v.data) {
              _this.errorText = ''
              _this.isErrorInput = false
              _this.friendId = v.data.userId
            } else {
              _this.errorText = '号码不存在'
              _this.isErrorInput = true
            }
          }
        })
      }
    },
    sureInput() {
      const _this = this
      if (this.showPopChannel === 'add') {
        if (this.checkVerify) {
          if (this.isErrorInput) {
            commonWays.toast(`${this.errorText}，请重新输入`)
          } else {
            request({
              url: '/addNotice',
              data: {
                type: '1',
                useredId: _this.friendId,
                dateTime: commonWays.currentDate(),
                friendId: _this.friendId,
                userId: _this.userId,
                noticeCotent: '好友申请',
              },
              method: 'POST',
            }).then((v) => {
              if (v.statusCode === 200) {
                commonWays.toast('好友申请发送成功')
                _this.showPop = false
                _this.inputPhone = ''
              } else {
                commonWays.toast('发送申请失败，请重新添加')
              }
            })
          }
        } else {
          this.verifyPhone()
        }
      } else {
        if (this.friendInfo.remark !== this.inputText) {
          request({
            url: '/updateRemark',
            data: {
              ownId: _this.userId,
              friendId: _this.friendInfo.friendId,
              remark: _this.inputText,
            },
            method: 'POST',
          }).then((v) => {
            if (v.statusCode === 200) {
              _this.showPop = false
              _this.getFriendsList()
              commonWays.toast(v.data)
            }
          })
        } else {
          this.showPop = false
        }
      }
    },
    cancelInput() {
      this.inputPhone = ''
      this.showPop = false
      this.isErrorInput = false
      this.errorText = ''
      this.inputText = ''
      commonWays.toast('cancel operation')
    },
    longtap(id) {
      const _this = this
      uni.showModal({
        title: '提示',
        content: `是否删除该好友？`,
        success: function (res) {
          if (res.confirm) {
            request({
              url: '/delFriends',
              data: {
                id,
              },
            }).then((v) => {
              if (v.statusCode === 200) {
                _this.getFriendsList()
                commonWays.toast('删除成功')
              }
            })
          } else if (res.cancel) {
            commonWays.toast('cancel operation')
          }
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';
.searchBox {
  position: relative;
  width: 100%;
  .filterBox {
    background: #fff;
    position: absolute;
    z-index: 2;
    width: 332px;
    left: 10px;
    text {
      display: block;
      margin: 6px 0;
    }
    .filterText:hover {
      background: #ebebeb;
    }
    .filternottext {
      text-align: center;
      color: #e8e;
    }
  }
}

.f-friItem {
  margin-top: 5px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebebeb;
  .f-friLeft {
    flex: 1;
    display: flex;
    align-items: center;
    image {
      width: 36px;
      height: 36px;
      margin-right: 7px;
    }
    .f-friLMain {
      display: inline-block;
      .f-remark {
        color: #b4b3b3;
        font-size: 14px;
        display: block;
      }
    }
  }
  .uni-icons {
    margin-right: 5px;
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
  background-color: #e8e;
  color: #fff;
}

.pop-errtext {
  display: block;
  font-size: 16px !important;
  font-weight: normal !important;
  color: red;
  margin-top: -22px;
}
</style>
