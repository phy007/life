<template>
  <view class="m-box">
    <view v-if="noticeSum" class="m-topMessage">
      <navigator url="/pages/message/message">你有消息未读，点击跳转</navigator>
    </view>
    <uni-segmented-control
      :current="current"
      :values="items"
      @clickItem="onClickItem"
      styleType="text"
      activeColor="#7950EA"
      class="m-top"
    ></uni-segmented-control>
    <view class="content">
      <view v-show="current === 0">
        <template v-if="!showEditBox">
          <uni-card v-for="(o, oi) in ownList" :key="oi">
            <template v-slot:title>
              <uni-list>
                <uni-list-item
                  :to="`/pages/profile/profile?id=${o.userId}`"
                  :title="ownUserName"
                />
                <text class="m-time">{{ o.time | formatTime }}</text>
              </uni-list>
            </template>
            <view v-if="o.recordImage" class="m-imgBox">
              <image
                v-for="(img, index) in o.recordImage.split('&')"
                :key="index"
                :src="`${baseUrl}${img}`"
                mode="widthFix"
              ></image>
            </view>
            <text @click="jumpNextPage(o, 'own')" class="uni-body">{{
              o.recordText
            }}</text>
            <!-- bill区域 -->
            <view v-if="o.bill.length" class="m-billItem billItem">
              <image
                mode="widthFix"
                :src="`../../static/img/icon/${o.bill[0].iconUrl}`"
              ></image>
              <view class="bITitle">
                <template v-if="o.bill[0].remark !== ''">
                  <text>{{ o.bill[0].title }}</text>
                  <text class="b-mITsubtilte">{{ o.bill[0].remark }}</text>
                </template>
                <text v-else>{{ o.bill[0].title }}</text>
              </view>
              <text class="bIMoney">{{
                o.bill[0].type === 0 ? -o.bill[0].money : o.bill[0].money
              }}</text>
            </view>
            <view slot="actions" class="card-actions">
              <!-- #ifdef MP-WEIXIN -->
              <view class="card-actions-item">
                <button open-type="share" @click="shareRecord(o.recordId)">
                  <uni-icons
                    type="paperplane"
                    size="24"
                    color="#999"
                  ></uni-icons>
                  <text class="card-actions-item-text">分享</text>
                </button>
              </view>
              <!-- #endif -->
              <!-- #ifdef H5 -->
              <view class="card-actions-item" @click="share(o.recordId)">
                <uni-icons type="paperplane" size="24" color="#999"></uni-icons>
                <text class="card-actions-item-text">分享</text>
              </view>
              <!-- #endif -->
              <view class="card-actions-item" @click="editRecord(o)">
                <uni-icons type="compose" size="20" color="#999"></uni-icons>
                <text class="card-actions-item-text">编辑</text>
              </view>
              <view class="card-actions-item" @click="delRecord(o)">
                <uni-icons type="trash" size="20" color="#999"></uni-icons>
                <text class="card-actions-item-text">删除</text>
              </view>
            </view>
          </uni-card>
        </template>

        <!-- 编辑区 -->
        <view v-else class="showEdit">
          <text class="showEditTitle">{{ showEditTitle }}</text>
          <view class="inputBox">
            <textarea
              v-model="inputText"
              @input="textareaInput($event, 140)"
              auto-focus
            ></textarea>
            <text :class="inputTextLength === 140 ? 'errorNum' : ''"
              >{{ inputTextLength }}/140</text
            >
          </view>
          <view class="imageBox">
            <view
              class="imageItem"
              v-for="(existimg, existi) in existImgArr"
              :key="existi"
            >
              <image mode="widthFix" :src="`${baseUrl}${existimg}`"> </image>
              <uni-icons
                type="closeempty"
                size="30"
                color="red"
                @click="delImg(existi, 'e')"
              ></uni-icons>
            </view>
            <view
              class="imageItem"
              v-for="(tempimg, tempi) in tempImgArr"
              :key="tempi"
            >
              <image mode="widthFix" :src="tempimg"> </image>
              <uni-icons
                type="closeempty"
                size="30"
                color="red"
                @click="delImg(tempi, 't')"
              ></uni-icons>
            </view>
            <view class="imageItem">
              <image
                v-if="imgLength < 4"
                mode="widthFix"
                @click="uploadImg"
                src="/static/img/uploadimg.png"
              ></image>
            </view>
          </view>
          <view class="billBox">
            <view class="bBdateText">选择需要记录的账单：</view>
            <uni-datetime-picker
              type="date"
              :clear-icon="false"
              v-model="single"
              @change="changeDate"
            />
            <template v-if="billDataList.length">
              <radio-group @change="radioChange">
                <label
                  class="billItem"
                  v-for="(b, bi) in billDataList"
                  :key="bi"
                >
                  <radio :value="`${b.billId}`" />
                  <image
                    mode="widthFix"
                    :src="`../../static/img/icon/${b.iconUrl}`"
                  ></image>
                  <view class="bITitle">
                    <template v-if="b.remark !== ''">
                      <text>{{ b.title }}</text>
                      <text>{{ b.remark }}</text>
                    </template>
                    <text v-else>{{ b.title }}</text>
                  </view>
                  <text class="bIMoney">{{
                    b.type === 0 ? -b.money : b.money
                  }}</text>
                </label>
              </radio-group>
            </template>
            <view
              class="bINotFound"
              v-else-if="single !== '' && !billDataList.length"
            >
              <text>{{ single }}没有账单，先去添加账单吧！</text>
            </view>
          </view>
          <view class="btnBox">
            <button class="com-button com-btn-red" @click="submitEdit">
              确认
            </button>
            <button class="com-button com-btn-green" @click="cancelEdit">
              取消
            </button>
          </view>
        </view>

        <uni-fab
          ref="fab"
          :pattern="pattern"
          :content="content"
          horizontal="left"
          vertical="bottom"
          direction="horizontal"
          @trigger="triggerFab"
        />
      </view>
      <view v-show="current === 1">
        <uni-card v-for="(f, i) in friList" :key="i">
          <template v-slot:title>
            <uni-list>
              <uni-list-item
                :to="`/pages/profile/profile?id=${f.userId}`"
                :title="f.userName"
              />
              <text class="m-time">{{ f.time | formatTime }}</text>
            </uni-list>
          </template>
          <view v-if="f.recordImage" class="m-imgBox">
            <image
              v-for="(img, index) in f.recordImage.split('&')"
              :key="index"
              :src="`${baseUrl}${img}`"
              mode="widthFix"
            ></image>
          </view>
          <text @click="jumpNextPage(f, 'other')" class="uni-body">{{
            f.recordText
          }}</text>
          <view v-if="f.bill.length" class="m-billItem billItem">
            <image
              mode="widthFix"
              :src="`../../static/img/icon/${f.bill[0].iconUrl}`"
            ></image>
            <view class="bITitle">
              <template v-if="f.bill[0].remark !== ''">
                <text>{{ f.bill[0].title }}</text>
                <text class="b-mITsubtilte">{{ f.bill[0].remark }}</text>
              </template>
              <text v-else>{{ f.bill[0].title }}</text>
            </view>
            <text class="bIMoney">{{
              f.bill[0].type === 0 ? -f.bill[0].money : f.bill[0].money
            }}</text>
          </view>
          <view slot="actions" class="card-actions">
            <view class="card-actions-item" @click="addComment(f)">
              <uni-icons type="chatbubble" size="20" color="#999"></uni-icons>
              <text class="card-actions-item-text">评论</text>
            </view>
            <view class="card-actions-item" @click="selectLike(f, 1)">
              <uni-icons
                :type="f.favorite === '1' ? 'hand-up-filled' : 'hand-up'"
                size="20"
                color="#999"
              ></uni-icons>
              <text class="card-actions-item-text">点赞</text>
            </view>
            <view class="card-actions-item" @click="selectLike(f, 2)">
              <uni-icons
                :type="f.collect === '1' ? 'star-filled' : 'star'"
                size="20"
                color="#999"
              ></uni-icons>
              <text class="card-actions-item-text">收藏</text>
            </view>
          </view>

          <!-- 评论区 -->
          <view v-if="commentandreplyList[i].length" class="m-commentBox">
            <view
              class="m-comItem"
              v-for="(c, cindex) in commentandreplyList[i]"
              :key="cindex"
            >
              <view class="com-commentItem">
                <text
                  @click="jumpToProfilePage(c.commentUserId)"
                  class="m-comName"
                  >{{ c.username }}：</text
                >
                <text class="m-comMain">{{ c.content }}</text>
                <uni-icons
                  :type="c.username === ownUserName ? 'close' : 'chatbubble'"
                  size="15"
                  color="#999"
                  @click="handleReply(c, c.commentId)"
                ></uni-icons>
              </view>
              <template v-if="c.replys">
                <view
                  v-for="(r, rindex) in c.replys"
                  :key="rindex"
                  class="com-commentItem"
                >
                  <view class="m-comName"
                    ><text @click="jumpToProfilePage(r.userId)">{{
                      r.userName
                    }}</text
                    >回复<text @click="jumpToProfilePage(r.repliedUserId)">{{
                      r.repliedUserName
                    }}</text
                    >：</view
                  >
                  <text class="m-comMain">{{ r.replyContent }}</text>
                  <uni-icons
                    :type="r.userName === ownUserName ? 'close' : 'chatbubble'"
                    size="15"
                    color="#999"
                    @click="handleReply(r, c.commentId)"
                  ></uni-icons>
                </view>
              </template>
            </view>
          </view>
        </uni-card>
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
            <button class="com-button com-btn-red" @click="sureInput">
              确定
            </button>
            <button class="com-button com-btn-green" @click="cancelInput">
              取消
            </button>
          </view>
        </view>

        <uni-fab
          ref="fab"
          :pattern="pattern"
          :content="content1"
          horizontal="left"
          vertical="bottom"
          direction="horizontal"
          @trigger="triggerFab"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request, BASE_URL } from '../../utils/request'
export default {
  data() {
    return {
      baseUrl: `${BASE_URL}/static/`,
      items: ['我的', '好友'],
      userId: getApp().globalData.$userId || get_userId(),
      current: 0,
      ownUserName: '',
      ownList: [],
      friList: [],
      friIdArr: [],
      commentandreplyList: [],
      billDataList: [],
      billId: 0,
      noticeSum: 0,
      single: '',
      showEditBox: false,
      showEditInfo: {},
      showEditTitle: '',
      inputText: '',
      inputTextLength: 0,
      existImgArr: [],
      delImgArr: [],
      tempImgArr: [],
      imgLength: 0,
      showPop: false,
      showPopText: '',
      showPopChannel: false,
      recordInfo: {},
      pattern: {
        color: '#7A7E83',
        backgroundColor: '#fff',
        selectedColor: '#7950EA',
        buttonColor: '#7950EA',
        iconColor: '#fff',
      },
      content1: [
        {
          iconPath: '/static/img/like.png',
          selectedIconPath: '/static/img/like.png',
          text: '点赞',
        },
        {
          iconPath: '/static/img/collect.png',
          selectedIconPath: '/static/img/collect.png',
          text: '收藏',
        },
      ],
      content: [
        {
          iconPath: '/static/img/friends.png',
          text: '好友',
        },
        {
          iconPath: '/static/img/message.png',
          text: '消息',
        },
        {
          iconPath: '/static/img/record.png',
          text: '记录',
        },
      ],
    }
  },
  onLoad() {
    this.getOwnData()
    this.getFirendsData()
    this.getNoticeData()
  },
  onShow() {
    this.getNoticeData()
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
    getOwnData() {
      const _this = this
      request({
        url: '/getOwnRecords',
        data: { userId: _this.userId },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.ownUserName = v.data.userName
          _this.ownList = v.data.ownRecord
        }
      })
    },
    getFirendsData() {
      const _this = this
      request({
        url: '/getFriRecords',
        data: { userId: _this.userId },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.friList = v.data.friRecord
          _this.friIdArr = v.data.friIdArr
          _this.commentandreplyList = v.data.commentsAndReplys
          console.log(v.data)
        }
      })
    },
    getNoticeData() {
      const _this = this
      /* 进入页面，请求路径，获取所有未读的通知，tabbar角标提示，fab角标提示，消息角标提示，消息页面对应的角标提示 */
      request({
        url: '/getNotice',
        data: {
          useredId: _this.userId,
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.noticeSum = v.data.length
          if (v.data.length) {
            uni.setTabBarBadge({
              index: 0,
              text: `${v.data.length}`,
            })
          } else {
            uni.removeTabBarBadge({
              index: 0,
            })
          }
        }
      })
    },
    // 分享好友
    onShareAppMessage(options) {
      const _this = this
      let shareObj = {
        title: 'RecordDaily',
        path: `/pages/recordDetail/recordDetail?id=${_this.sharerecordId}`,
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
    share(id) {
      uni.setClipboardData({
        data: `http://localhost:8080/#/pages/recordDetail/recordDetail?id=${id}&type=own`,
        success: (res) => {
          console.log(res)
          commonWays.toast('分享链接复制到剪切板了，快去分享吧！')
        },
        fail: () => {
          commonWays.toast('复制失败，请重新操作')
        },
      })
    },
    changeDate(e) {
      this.single = e
      const _this = this
      request({
        url: '/getBillBydate',
        data: {
          userId: _this.userId,
          date: e,
        },
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.billDataList = v.data
        }
      })
    },
    radioChange(e) {
      this.billId = parseInt(e.detail.value)
    },
    jumpToProfilePage(id) {
      commonWays.jumpToProfilePage(id)
    },
    delRecord(r) {
      const _this = this
      uni.showModal({
        title: '删除',
        content: '确认删除该记录吗？',
        success: function (res) {
          if (res.confirm) {
            if (r.recordImage !== '' && r.recordImage !== null) {
              r.recordImage.split('&').forEach((e) => {
                request({
                  url: '/delImg',
                  data: {
                    filename: e,
                  },
                })
              })
            }
            request({
              url: '/delRecord',
              data: {
                recordId: r.recordId,
              },
            }).then((v) => {
              commonWays.toast(v.data)
              _this.getOwnData()
            })
            request({
              url: '/delNoticeType5',
              method: 'POST',
              data: {
                recordId: r.recordId,
                userId: _this.userId,
                type: '5',
              },
            })
          } else if (res.cancel) {
            commonWays.toast('取消删除')
          }
        },
      })
    },
    editRecord(record) {
      this.showEditBox = true
      this.showEditTitle = '编辑'
      this.showEditInfo = record
      if (this.showEditInfo.recordImage)
        this.existImgArr = this.showEditInfo.recordImage.split('&')
      this.imgLength = this.existImgArr.length
      this.inputText = this.showEditInfo.recordText
      this.inputTextLength = record.recordText.length
      this.tempImgArr = []
      if (record.bill.length) {
        this.billDataList = record.bill
        this.billId = record.bill[0].billId
      }
    },
    uploadImg() {
      let _this = this
      let count = 4 - _this.imgLength
      uni.chooseImage({
        count,
        sizeType: ['copressed'],
        sourceType: ['album', 'camera'], //album 从相册选图,camera 使用相机
        success(res) {
          _this.tempImgArr = [..._this.tempImgArr, ...res.tempFilePaths]
          _this.imgLength += res.tempFiles.length
        },
      })
    },
    delImg(i, type) {
      if (type === 'e') {
        this.delImgArr.push(this.existImgArr.splice(i, 1))
      } else {
        this.tempImgArr.splice(i, 1)
      }
      this.imgLength--
    },
    textareaInput(e, count) {
      // 去除换行和空格
      e.detail.value = e.detail.value.replace(/[\r\n]/g, '')
      if (count === 140) {
        this.inputText = e.detail.value
      } else if (count === 50) {
        this.showPopText = e.detail.value
      }
      if (e.detail.value.length > count) {
        e.detail.value.length = count
      }
      this.inputTextLength = e.detail.value.length
    },
    cancelEdit() {
      this.showEditBox = false
      commonWays.toast(`取消${this.showEditTitle}`)
    },
    async submitEdit() {
      const _this = this
      uni.showLoading({
        title: '加载中',
      })
      let l = _this.tempImgArr.length
      let imgArr = []
      let errImage = false
      let imgStr = ''
      if (l) {
        for (let i = 0; i < l; i++) {
          let p = await new Promise((resolve, reject) => {
            uni.uploadFile({
              // #ifdef H5
              url: '/api/upload',
              // #endif
              // #ifdef MP-WEIXIN
              url: '/upload',
              // #endif
              filePath: _this.tempImgArr[i], //图片链接
              name: 'file', //默认是file
              success: (res) => {
                let { statusCode, data } = res
                if (statusCode === 200) {
                  let { code, message } = JSON.parse(data)
                  if (code == -1) {
                    commonWays.toast(message)
                    reject('fail')
                  } else if (code == -2) {
                    commonWays.toast(message)
                    reject('fail')
                  } else {
                    resolve(message)
                  }
                }
              },
            })
          })
          if (p !== 'fail') {
            imgArr.push(p)
          } else {
            errImage = true
          }
        }
      }
      if (_this.showEditTitle === '编辑') {
        if (_this.existImgArr.length) {
          imgStr = _this.existImgArr.join('&')
          imgStr += '&'
        }
        imgStr += imgArr.join('&')
        imgStr = imgStr.replace(/&$/, '')
        if (_this.delImgArr.length) {
          _this.delImgArr.forEach((v) => {
            request({
              url: '/delImg',
              data: {
                filename: v,
              },
            })
          })
        }
        if (!errImage) {
          request({
            url: '/updateRecord',
            data: {
              recordId: _this.showEditInfo.recordId,
              params: {
                recordText: _this.inputText,
                recordImage: imgStr,
                billId: _this.billId,
              },
            },
            method: 'POST',
          }).then((v) => {
            if (v.statusCode === 200) {
              _this.showEditBox = false
              _this.getOwnData()
            }
            uni.hideLoading()
          })
        }
      } else {
        imgStr += imgArr.join('&')
        if (!errImage && this.inputText) {
          request({
            url: '/addRecord',
            method: 'POST',
            data: {
              userId: _this.userId,
              recordText: _this.inputText,
              recordImage: imgStr,
              time: commonWays.currentDate(),
              billId: _this.billId,
            },
          }).then((v) => {
            if (v.statusCode === 200) {
              commonWays.toast('记录成功')
              _this.getOwnData()
              _this.showEditBox = false
              request({
                url: '/addNoticeType5',
                method: 'POST',
                data: {
                  friIdArr: _this.friIdArr,
                  noticeInfo: {
                    type: '5',
                    recordId: v.data[0],
                    dateTime: commonWays.currentDate(),
                    noticeCotent: '更新一条记录',
                    userId: _this.userId,
                  },
                },
              })
            } else {
              commonWays.toast('记录失败，重新编辑')
            }
            uni.hideLoading()
          })
        } else {
          commonWays.toast('请编辑内容')
        }
      }
    },
    addComment(f) {
      this.showPop = true
      this.inputTextLength = 0
      this.showPopChannel = true
      this.recordId = f.recordId
      this.recordInfo = f
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
            recordId: _this.recordInfo.recordId,
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
            commentId: _this.replyCommentId,
            replyContent: _this.showPopText,
            replyDate: commonWays.currentDate(),
            userId: _this.userId,
            recordId: _this.recordInfo.recordId,
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
      _this.getFirendsData()
    },
    addNotice(commentId, replyId, text) {
      const _this = this
      request({
        url: '/addNotice',
        method: 'POST',
        data: {
          type: '2',
          useredId: _this.recordInfo.userId,
          recordId: _this.recordInfo.recordId,
          dateTime: commonWays.currentDate(),
          noticeCotent: _this.showPopChannel
            ? `评论：${text}`
            : `回复：${text}`,
          commentId,
          replyId,
          userId: _this.userId,
        },
      })
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
            _this.delNotice({ commentId: cId })
            _this.getFirendsData()
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
            _this.delNotice({ replyId: obj.replyId })
            _this.getFirendsData()
          }
        })
      } else {
        // 添加回复，根据评论id
        _this.showPop = true
        _this.showPopChannel = false
        _this.replyCommentId = cId
        _this.recordInfo = obj
      }
    },
    delNotice(obj) {
      request({
        url: '/delNotice',
        data: obj,
        method: 'POST',
      })
    },
    /* 点赞收藏：点赞收藏成功会通知对方，如果取消点赞/收藏，即取消通知 */
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
        this.getFirendsData()
      } else {
        commonWays.toast('操作失败')
      }
    },
    onClickItem(e) {
      if (this.current != e.currentIndex) {
        this.current = e.currentIndex
      }
      this.showEditBox = false
    },
    shareRecord(id) {
      this.sharerecordId = id
    },
    triggerFab(e) {
      const _this = this
      if (e.item.text === '点赞') {
        uni.navigateTo({
          url: `/pages/favorites/favorites?id=${_this.userId}&type=like`,
        })
      } else if (e.item.text === '收藏') {
        uni.navigateTo({
          url: `/pages/favorites/favorites?id=${_this.userId}&type=collect`,
        })
      } else if (e.item.text === '好友') {
        uni.navigateTo({
          url: '/pages/friends/friends',
        })
      } else if (e.item.text === '记录') {
        this.showEditBox = true
        this.showEditTitle = '记录'
        this.existImgArr = []
        this.tempImgArr = []
        this.inputText = ''
        this.imgLength = 0
        this.inputTextLength = 0
        this.billDataList = []
      } else if (e.item.text === '消息') {
        uni.navigateTo({
          url: '/pages/message/message',
        })
      }
    },
    jumpNextPage(record, type) {
      commonWays.jumpToRecordDetail(record.recordId, type)
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
  font-size: 18px;
  display: flex;
  align-items: center;
}
// #endif
.m-box {
  // #ifdef MP-WEIXIN
  padding-top: 15px;
  // #endif
  .m-topMessage {
    position: fixed;
    background-color: #eef73f;
    width: 100%;
    z-index: 1;
    // #ifdef MP-WEIXIN
    top: 0;
    // #endif
    // #ifdef H5
    top: 44px;
    // #endif
    padding: 3px 0;
    text-align: center;
    left: 0;
    color: red;
  }
  .m-top {
    margin-top: 15px;
    font-weight: bold;
    letter-spacing: 2px;
  }
  .content {
    padding: 10px;
    .m-imgBox {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      image {
        flex: 1;
        max-width: 180px;
        margin: 3%;
      }
    }
    .uni-card {
      position: relative;
      .uni-list-item {
        font-size: 19px;
        font-weight: bold;
        letter-spacing: 1px;
      }
      .m-time {
        position: absolute;
        top: 12px;
        right: 0;
        font-size: 12px;
        color: #e8e;
      }
      .uni-body {
        font-size: 17px;
      }
      .card-actions {
        display: flex;
        margin-bottom: 12px;
        .card-actions-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          text {
            margin-left: 2px;
          }
        }
      }
      .m-commentBox {
        margin-top: 10px;
        width: 100%;
        border-top: 1px dashed #d5067c;
        padding-top: 5px;
        .uni-icons {
          margin: 0 5px;
        }
        .m-comItem {
          .m-comName {
            display: inline-block;
            font-size: 15px;
            font-weight: bold;
            color: #d5067c;
          }
          .m-comMain {
            color: black;
          }
        }
      }
    }
    .showEdit {
      padding: 10px;
      .showEditTitle {
        height: 30px;
        width: 100%;
        text-align: center;
        display: block;
        line-height: 30px;
        font-weight: bold;
        letter-spacing: 5px;
        font-size: 18px;
      }
      .inputBox {
        background-color: #f9f7f7;
        box-sizing: border-box;
        padding: 15px;
        margin: 10px 0;
        border-radius: 10px;
        textarea {
          width: auto;
        }
        text {
          text-align: right;
          font-size: 16px;
          font-weight: normal;
          letter-spacing: 1px;
        }
      }
      .imageBox {
        width: 100%;
        display: flex;
        .imageItem {
          width: 25%;
          position: relative;
          margin-right: 2%;
          image {
            width: 100%;
          }
          .uni-icons {
            position: absolute;
            top: -10px;
            right: -35px;
          }
        }
      }
      .billBox {
        margin-top: 15px;
        .bBdateText {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 7px;
        }
        .bINotFound {
          text-align: center;
          color: #e8e;
          margin-top: 5px;
        }
      }
      .btnBox {
        margin-top: 15px;
        float: right;
        button {
          letter-spacing: 4px;
          color: white;
        }
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
