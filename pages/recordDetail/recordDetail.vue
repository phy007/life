<template>
  <view class="r-box">
    <view class="r-personBox">
      <image
        :src="
          userImage ? `${baseUrl}${userImage}` : '/static/img/defaultuser.png'
        "
        mode="widthFix"
      ></image>
      <view>
        <text @click="jumpToProfilePage(record.userId)">{{ userName }}</text>
        <text>{{ record.time | formatTime }}</text>
      </view>
    </view>

    <view class="r-main">
      <swiper
        v-if="record.recordImage"
        class="swiper"
        indicator-dots="true"
        autoplay="true"
        interval="4000"
        duration="1000"
      >
        <swiper-item v-for="(img, i) in record.recordImage.split('&')" :key="i">
          <view>
            <image :src="`${baseUrl}${img}`"></image>
          </view>
        </swiper-item>
      </swiper>

      <view class="r-textBox">
        <text>{{ record.recordText }}</text>
      </view>

      <view v-if="billList.length" class="m-billItem billItem">
        <image
          mode="widthFix"
          :src="`../../static/img/icon/${billList[0].iconUrl}`"
        ></image>
        <view class="bITitle">
          <template v-if="billList[0].remark !== ''">
            <text>{{ billList[0].title }}</text>
            <text class="b-mITsubtilte">{{ billList[0].remark }}</text>
          </template>
          <text v-else>{{ billList[0].title }}</text>
        </view>
        <text class="bIMoney">{{
          billList[0].type === 0 ? billList[0].money : billList[0].money
        }}</text>
      </view>
    </view>

    <view class="r-iconBox">
      <template v-if="type === 'own'">
        <view>
          <uni-icons
            :type="favoriteCount ? 'hand-up-filled' : 'hand-up'"
            size="24"
            color="#999"
          ></uni-icons>
          <text>{{ favoriteCount }}</text>
        </view>
        <view>
          <uni-icons
            :type="collectCount ? 'star-filled' : 'star'"
            size="24"
            color="#999"
          ></uni-icons>
          <text>{{ collectCount }}</text>
        </view>
        <view @click="addComment">
          <uni-icons type="chatbubble" size="24" color="#999"></uni-icons>
          <text>评论</text>
        </view>
      </template>

      <template v-else>
        <view @click="selectLike(record, 1)">
          <uni-icons
            :type="record.favorite === '1' ? 'hand-up-filled' : 'hand-up'"
            size="24"
            color="#999"
          ></uni-icons>
          <text>点赞</text>
        </view>
        <view @click="selectLike(record, 2)">
          <uni-icons
            :type="record.collect === '1' ? 'star-filled' : 'star'"
            size="24"
            color="#999"
          ></uni-icons>
          <text>收藏</text>
        </view>
        <view @click="addComment">
          <uni-icons type="chatbubble" size="24" color="#999"></uni-icons>
          <text>评论</text>
        </view>
      </template>

      <!-- #ifdef MP-WEIXIN -->
      <view>
        <button open-type="share">
          <uni-icons type="paperplane" size="24" color="#999"></uni-icons>
          <text>分享</text>
        </button>
      </view>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <view @click="share">
        <uni-icons type="paperplane" size="24" color="#999"></uni-icons>
        <text>分享</text>
      </view>
      <!-- #endif -->
    </view>

    <view v-if="commentList.length" class="r-commentBox">
      <view class="r-comItem" v-for="(c, cindex) in commentList" :key="cindex">
        <view class="com-commentItem">
          <view class="r-userName">
            <image
              mode="widthFix"
              :src="
                c.userImage
                  ? `${baseUrl}${c.userImage}`
                  : '/static/img/defaultuser.png'
              "
            ></image>
            <text class="r-comName" @click="jumpToProfilePage(c.commentUserId)"
              >{{ c.username }}：</text
            >
          </view>
          <text>{{ c.content }}</text>
          <uni-icons
            :type="c.username === ownUserName ? 'close' : 'chatbubble'"
            size="20"
            color="#999"
            @click="handleReply(c, c.commentId)"
          ></uni-icons>
        </view>
        <template v-if="replyList[cindex].length">
          <view
            v-for="(r, rindex) in replyList[cindex]"
            :key="rindex"
            class="com-commentItem r-replyMain"
          >
            <view class="r-userName">
              <image
                mode="widthFix"
                :src="
                  r.image
                    ? `${baseUrl}${r.image}`
                    : '/static/img/defaultuser.png'
                "
              ></image>
              <text class="r-comName" @click="jumpToProfilePage(r.userId)"
                >{{ r.userName }}：</text
              >
            </view>
            <text>{{ r.replyContent }}</text>
            <uni-icons
              :type="r.userName === ownUserName ? 'close' : 'chatbubble'"
              size="20"
              color="#999"
              @click="handleReply(r, c.commentId)"
            ></uni-icons>
          </view>
        </template>
      </view>
    </view>

    <!-- 回复pop组件化 -->
    <!-- 弹出层 -->
    <view class="bt-pop" v-if="showPop">
      <view class="b-popMain">
        <text class="b-popTitle">{{ ownUserName }}</text>
        <text class="b-popTitle" style="font-size: 16px">{{
          showPopChannel ? '评论' : '回复'
        }}</text>
        <view class="b-popArea">
          <textarea
            v-model="showPopText"
            auto-focus
            maxlength="50"
            @input="textareaInput($event, 50)"
          >
          </textarea>
          <text
            class="b-popRight"
            :class="inputTextLength === 50 ? 'errorNum' : ''"
            >{{ inputTextLength }}/50</text
          >
        </view>
        <button class="com-button com-btn-red" @click="sureInput">确定</button>
        <button class="com-button com-btn-green" @click="cancelInput">
          取消
        </button>
      </view>
    </view>
    <!-- handleReply函数 -->
  </view>
</template>

<script>
import { request, BASE_URL } from '../../utils/request'
import { get_userName } from '../../utils/storage'
import { commonWays } from '../../utils/common'
export default {
  data() {
    return {
      userImage: '',
      userName: '',
      commentList: [],
      replyList: [],
      billList: [],
      ownUserName: '',
      baseUrl: `${BASE_URL}/static/`,
      type: '',
      record: {},
      reply: {},
      collectCount: 0,
      favoriteCount: 0,
      showPop: false,
      showPopText: '',
      inputTextLength: 0,
      showPopChannel: true,
      userId: getApp().globalData.$userId || get_userId(),
    }
  },
  onLoad(e) {
    this.recordId = e.id
    this.type = e.type
    this.ownUserName = get_userName() || ''
    this.getRecord(e.id)
    this.getCommentData(e.id)
  },
  onShow() {
    // #ifdef MP-WEIXI
    //这是设置右上角的三个点点击后是否可以分享给微信好友，或朋友圈
    wx.showShareMenu({
      withShareTicket: true,
      //设置下方的Menus菜单，才能够让发送给朋友与分享到朋友圈两个按钮可以点击
      menus: ['shareAppMessage'],
    })
    // #endif
  },

  methods: {
    getRecord(id) {
      const _this = this
      request({
        url: '/getRecord',
        data: {
          recordId: id,
          type: _this.type,
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.record = v.data.recordInfo
          _this.userName = v.data.userName
          _this.userImage = v.data.userImage
          _this.billList = v.data.bill
          if (_this.type === 'own') {
            _this.getColAndFavCount(v.data.recordId)
          }
          console.log(v.data)
        }
      })
    },
    getCommentData(id) {
      const _this = this
      request({
        url: '/getComAndRep',
        data: {
          recordId: id,
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.commentList = v.data.comments
          _this.replyList = v.data.replys
          console.log(v.data)
        }
      })
    },
    getColAndFavCount(id) {
      const _this = this
      request({
        url: '/getColAndFarCount',
        data: {
          recordId: id,
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.collectCount = v.data.collect
          _this.favoriteCount = v.data.favorite
        }
      })
    },
    // 分享好友
    onShareAppMessage(options) {
      const _this = this
      let shareObj = {
        title: 'RecordDaily',
        path: `/pages/recordDetail/recordDetail?id=${_this.recordId}&type=own`,
        success: (res) => {
          if (res.errMsg == 'shareAppMessage:ok') {
            commonWays.toast('分享成功')
          }
        },
        fail: (res) => {
          if (res.errMsg == 'shareAppMessage:fail cancel') {
            commonWays.toast('取消分享')
          } else if (res.errMsg == 'shareAppMessage:fail') {
            console.log(res)
            commonWays.toast('分享失败')
          }
        },
      }
      if (options.from === 'button') {
        console.log('button触发转发给朋友')
      }
      return shareObj
    },
    share() {
      const _this = this
      uni.setClipboardData({
        data: `http://localhost:8080/#/pages/recordDetail/recordDetail?id=${_this.record.recordId}&type=${_this.type}`,
        success: (res) => {
          console.log(res)
          commonWays.toast('分享链接复制到剪切板了，快去分享吧！')
        },
        fail: () => {
          commonWays.toast('复制失败，请重新操作')
        },
      })
    },
    jumpToProfilePage(id) {
      commonWays.jumpToProfilePage(id)
    },
    addComment() {
      this.showPop = true
      this.inputTextLength = 0
      this.showPopChannel = true
    },
    cancelInput() {
      let message = this.showPopChannel ? '取消评论' : '取消回复'
      commonWays.toast(message)
      this.showPop = false
      this.showPopText = ''
    },
    sureInput() {
      const _this = this
      const text = _this.showPopText
      if (this.showPopChannel) {
        request({
          url: '/addComment',
          method: 'POST',
          data: {
            date: commonWays.currentDate(),
            content: _this.showPopText,
            recordId: _this.record.recordId,
            commentUserId: _this.userId,
          },
        }).then((v) => {
          if (v.statusCode === 200) {
            _this.addNotice(v.data.id, 0, text)
            commonWays.toast('评论成功')
          }
        })
      } else {
        request({
          url: '/addReply',
          method: 'POST',
          data: {
            recordId: _this.record.recordId,
            commentId: _this.reply.replyCommentId,
            replyContent: _this.showPopText,
            replyDate: commonWays.currentDate(),
            userId: _this.userId,
            repliedUserId: _this.reply.repliedUserId,
          },
        }).then((v) => {
          if (v.statusCode === 200) {
            _this.addNotice(0, v.data.id, text)
            commonWays.toast('回复成功')
          }
        })
      }
      _this.showPop = false
      _this.showPopText = ''
      _this.getCommentData(_this.recordId)
    },
    handleReply(obj, cId) {
      const _this = this
      if (obj.username && obj.username === this.ownUserName) {
        // 删除comment 以及相关评论的所有回复
        request({
          url: '/delComAndRep',
          data: {
            commentId: cId,
          },
        }).then((v) => {
          if (v.statusCode === 200) {
            commonWays.toast('删除评论')
            _this.getCommentData(_this.recordId)
          }
        })
      } else if (obj.userName && obj.userName === this.ownUserName) {
        request({
          url: '/delReply',
          data: {
            replyId: obj.replyId,
          },
        }).then((v) => {
          if (v.statusCode === 200) {
            commonWays.toast('删除回复')
            _this.getCommentData(_this.recordId)
          }
        })
      } else {
        // 添加回复，根据评论id
        _this.showPop = true
        _this.showPopChannel = false
        _this.reply = {
          replyCommentId: cId,
          repliedUserName: obj.userName || obj.username,
          repliedUserId: obj.commentUserId,
        }
        console.log(obj)
      }
    },
    addNotice(commentId, replyId, text) {
      const _this = this
      /* 自己给自己评论回复不通知 */
      if (this.record.userId !== this.userId) {
        request({
          url: '/addNotice',
          method: 'POST',
          data: {
            type: '2',
            useredId: _this.record.userId,
            recordId: _this.record.recordId,
            dateTime: commonWays.currentDate(),
            noticeCotent: _this.showPopChannel
              ? `评论：${text}`
              : `回复：${text}`,
            commentId,
            replyId,
            userId: _this.userId,
          },
        })
      }
    },
    selectLike(f, t) {
      const _this = this
      let value, time
      let fchange = false
      let cchange = false
      let data = {}
      if (t === 1) {
        value = f.favorite === '0' ? '1' : '0'
        fchange = true
      } else {
        value = f.collect === '0' ? '1' : '0'
        cchange = true
      }
      time = commonWays.currentDate()
      if (f.likeId !== 0) {
        request({
          url: '/updateFaOrCol',
          method: 'POST',
          data: {
            id: f.likeId,
            favorite: fchange ? value : f.favorite,
            collect: cchange ? value : f.collect,
            collectTime: cchange && value === '1' ? time : f.collectTime,
            favoriteTime: fchange && value === '1' ? time : f.favoriteTime,
          },
        }).then((v) => {
          this.comFunction(v, value, fchange, cchange)
          if (fchange && value === '0') {
            data = {
              userId: _this.userId,
              useredId: f.userId,
              recordId: f.recordId,
              favorite: '1',
            }
            request({
              url: '/delNotice',
              data,
              method: 'POST',
            })
          } else if (cchange && value === '0') {
            data = {
              userId: _this.userId,
              useredId: f.userId,
              recordId: f.recordId,
              collect: '1',
            }
            request({
              url: '/delNotice',
              data,
              method: 'POST',
            })
          } else if (fchange && value === '1') {
            data = {
              type: '3',
              useredId: f.userId,
              dateTime: commonWays.currentDate(),
              noticeCotent: '点赞',
              favorite: '1',
              recordId: f.recordId,
              userId: _this.userId,
            }
            request({
              url: '/addNotice',
              method: 'POST',
              data,
            })
          } else if (cchange && value === '1') {
            data = {
              type: '4',
              useredId: f.userId,
              dateTime: commonWays.currentDate(),
              noticeCotent: '收藏',
              collect: '1',
              recordId: f.recordId,
              userId: _this.userId,
            }
            request({
              url: '/addNotice',
              method: 'POST',
              data,
            })
          }
        })
      } else {
        request({
          url: '/addLike',
          method: 'POST',
          data: {
            favorite: fchange ? value : f.favorite,
            collect: cchange ? value : f.collect,
            collectTime:
              cchange && value === '1' ? time : '0000-00-00 00:00:00',
            favoriteTime:
              fchange && value === '1' ? time : '0000-00-00 00:00:00',
            recordId: f.recordId,
            userId: _this.userId,
          },
        }).then((v) => {
          this.comFunction(v, value, fchange, cchange)
          if (fchange && value === '1') {
            data = {
              type: '3',
              useredId: f.userId,
              dateTime: commonWays.currentDate(),
              noticeCotent: '点赞',
              favorite: '1',
              recordId: f.recordId,
              userId: _this.userId,
            }
          } else if (cchange && value === '1') {
            data = {
              type: '4',
              useredId: f.userId,
              dateTime: commonWays.currentDate(),
              noticeCotent: '收藏',
              collect: '1',
              recordId: f.recordId,
              userId: _this.userId,
            }
          }
          request({
            url: '/addNotice',
            method: 'POST',
            data,
          })
        })
      }
    },
    comFunction(v, value, fchange, cchange) {
      if (v.statusCode === 200) {
        if (fchange) {
          commonWays.toast(value === '0' ? '取消点赞' : '点赞成功')
        } else if (cchange) {
          commonWays.toast(value === '0' ? '取消收藏' : '收藏成功')
        }
        this.getRecord()
      } else {
        commonWays.toast('操作失败')
      }
    },
    textareaInput(e, count) {
      // 去除换行和空格
      e.detail.value = e.detail.value.replace(/[\r\n]/g, '')
      this.showPopText = e.detail.value
      if (e.detail.value.length > count) {
        e.detail.value.length = count
      }
      this.inputTextLength = e.detail.value.length
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';
// #ifdef MP-WEIXIN
button::after {
  border: none;
}
button {
  background-color: #fff;
  height: 30px;
  line-height: 30px;
  padding: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
}
// #endif
.r-box {
  padding-bottom: 20px;
  .r-personBox {
    margin: 20px;
    display: flex;
    align-items: center;
    image {
      width: 60px;
      height: 60px;
      margin-right: 10px;
    }
    view {
      text {
        display: block;
      }
      text:nth-child(1) {
        font-size: 20px;
        letter-spacing: 1px;
        color: black;
        height: 30px;
        font-weight: bold;
      }
    }
  }
  .r-main {
    box-sizing: border-box;
    margin: 10px 20px;
    height: auto;
    padding: 10px;
    box-shadow: 0 0 2px 2px #e8e8e8;
    .swiper {
      height: 180px;
      view {
        width: 100%;
        display: flex;
        justify-content: center;
        image {
          width: 150px;
          height: 150px;
        }
      }
    }
    .r-textBox {
      margin-top: 5px;
      font-size: 20px;
      text {
        line-height: 30px;
      }
    }
  }
  .r-iconBox {
    display: flex;
    justify-content: flex-end;
    margin-right: 20px;
    font-size: 18px;
    view {
      margin-left: 10px;
      display: flex;
      align-items: center;
    }
  }
  .r-commentBox {
    margin: 10px 20px;
    padding: 8px;
    box-shadow: 0 0 2px 2px #e8e8e8;
    .r-comItem {
      border-bottom: 1px dashed #e8e;
      padding: 6px 0 8px 0;
      font-size: 18px;
      line-height: 28px;
      .uni-icons {
        margin-left: 5px;
      }
      .r-comName {
        color: #d5067c;
        font-weight: bold;
      }
      .r-userName {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        min-width: 80px;
        image {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
      }
      .r-replyMain {
        margin-left: 20px;
      }
    }
  }
  .bt-pop {
    .b-popMain {
      padding: 15px;
      box-sizing: border-box;
      height: auto;
      button {
        width: 70px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        letter-spacing: 4px;
        color: white;
        margin: 0 15px;
      }
    }
  }
}
</style>
