<template>
  <view>
    <view v-if="showMessage" class="m-top" @click="handleNotNotice"
      >{{ notHandlelength ? '清理所有未读消息' : '清理所有已读消息' }}
    </view>
    <uni-collapse ref="collapse" v-model="value">
      <uni-collapse-item
        v-for="(t, i) in title"
        :key="i"
        :title="noticeList[i] ? `${t} ${noticeList[i].length}` : `${t} 0`"
      >
        <template v-if="noticeList[i]">
          <!-- :class="currentIndex === n.noticeId ? 'm-item' : 'm-none'" -->
          <view
            @longpress="longtap(n.noticeId)"
            v-for="(n, ii) in noticeList[i]"
            :key="ii"
          >
            <uni-list-chat
              :title="n.userName"
              :avatar="
                n.image ? `${baseUrl}${n.image}` : '/static/img/defaultuser.png'
              "
              :note="n.noticeCotent"
              badge-positon="left"
              :badge-text="n.handleNotice === '0' ? 'dot' : ''"
              :to="
                n.type !== '1'
                  ? `/pages/recordDetail/recordDetail?id=${n.recordId}`
                  : ''
              "
              clickable
              @click="onClick(n)"
            >
              <view v-if="n.type === '1'" class="chat-custom-right">
                <button @click="handleApply(n)">
                  {{ n.handleApply === '1' ? '已添加' : '同意' }}
                </button>
              </view>

              <view v-else class="chat-custom-right">
                <text class="chat-custom-text">{{
                  n.dateTime | formatTime
                }}</text>
                <!-- 需要使用 uni-icons 请自行引入 -->
                <uni-icons :type="icons[i]" color="#999" size="18"></uni-icons>
              </view>
            </uni-list-chat>
            <!-- <view class="tapBtn">删除</view> -->
          </view>
        </template>
      </uni-collapse-item>
    </uni-collapse>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request, BASE_URL } from '../../utils/request'
export default {
  data() {
    return {
      baseUrl: `${BASE_URL}/static/`,
      title: ['好友申请', '评论', '点赞', '收藏'],
      icons: ['', 'chatboxes-filled', 'hand-up-filled', 'star-filled'],
      accordionVal: '1',
      notHandlelength: 0,
      value: [],
      noticeList: [],
      showMessage: true,
      // currentIndex: 0,
    }
  },
  onLoad() {
    this.getNoticeData()
  },
  methods: {
    getNoticeData() {
      const _this = this
      /* 进入页面，请求路径，获取所有未读的通知，tabbar角标提示，fab角标提示，消息角标提示，消息页面对应的角标提示 */
      request({
        url: '/getNotice',
        data: {
          useredId: getApp().globalData.$userId || get_userId(),
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.noticeList = v.data.arr
          _this.notHandlelength = v.data.length
          let arr = v.data.arr,
            str = '',
            count = 0
          for (let i = 0; i < 4; i++) {
            if (arr[i].length) {
              str += i + '&'
              count += arr[i].length
            }
          }
          if (!count) {
            _this.showMessage = false
          }
          _this.value = str.split('&')
        }
      })
    },
    onClick(n) {
      const _this = this
      if (n.handleNotice === '0') {
        request({
          url: '/updateNotice',
          data: {
            noticeId: n.noticeId,
          },
        }).then((v) => {
          if (v.statusCode === 200) _this.getNoticeData()
        })
      }
    },
    longtap(id) {
      // this.currentIndex = id
      const _this = this
      uni.showModal({
        title: '提示',
        content: `是否删除该消息？`,
        success: function (res) {
          if (res.confirm) {
            request({
              url: '/delNotice',
              data: {
                noticeId: id,
              },
            }).then((v) => {
              if (v.statusCode === 200) {
                _this.getNoticeData()
                commonWays.toast('删除成功')
              }
            })
          } else if (res.cancel) {
            commonWays.toast('cancel operation')
          }
        },
      })
    },
    handleApply(n) {
      const _this = this
      if (n.handleApply === '0') {
        uni.showModal({
          title: '提示',
          content: `是否添加好友：${n.userName}？`,
          success: function (res) {
            if (res.confirm) {
              request({
                url: '/addRelation',
                data: {
                  friendId: n.friendId,
                  ownId: getApp().globalData.$userId || get_userId(),
                },
              }).then((v) => {
                if (v.statusCode === 200) commonWays.toast('添加成功')
              })
              request({
                url: '/hadleApply',
                data: {
                  noticeId: n.noticeId,
                },
              }).then((v) => {
                if (v.statusCode === 200) _this.getNoticeData()
              })
            } else if (res.cancel) {
              commonWays.toast('cancel operation')
            }
          },
        })
      }
    },
    handleNotNotice() {
      const _this = this
      if (this.notHandlelength) {
        request({
          url: '/handleNotNotice',
          data: {
            id: getApp().globalData.$userId || get_userId(),
          },
        }).then((v) => {
          if (v.statusCode === 200) _this.getNoticeData()
        })
      } else {
        request({
          url: '/delhandleNotice',
          data: {
            id: getApp().globalData.$userId || get_userId(),
          },
        }).then((v) => {
          if (v.statusCode === 200) _this.getNoticeData()
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.m-top {
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: right;
  padding: 0 8px;
  box-sizing: border-box;
  color: #e84fe0;
}
.text {
  font-size: 14px;
  color: #666;
  line-height: 20px;
}
.chat-custom-right {
  flex: 1;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  button {
    font-size: 12px;
  }
}

.chat-custom-text {
  font-size: 12px;
  color: #999;
}
// 为找到一个合适的方式，点击其他地方，修改currentIndex的值，隐藏删除字样
/* .m-none {
  .tapBtn {
    display: none;
  }
}
.m-item {
  position: relative;
  .tapBtn {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba($color: #ea3ae1, $alpha: 0.7);
    width: 100%;
    height: 100%;
    line-height: 69px;
    font-size: 20px;
    color: #fff;
    text-align: center;
    display: block;
  }
} */
</style>
