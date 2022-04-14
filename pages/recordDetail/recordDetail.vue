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
        <text>{{ record.userName }}</text>
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
        <swiper-item v-for="(img, i) in record.recordImage.split('&')">
          <view>
            <image :src="`${baseUrl}${img}`"></image>
          </view>
        </swiper-item>
      </swiper>

      <view class="r-textBox">
        <text>{{ record.recordText }}</text>
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
      </template>

      <template v-else>
        <view>
          <uni-icons
            :type="favorite === '1' ? 'hand-up-filled' : 'hand-up'"
            size="24"
            color="#999"
          ></uni-icons>
          <text>点赞</text>
        </view>
        <view>
          <uni-icons
            :type="collect === '1' ? 'star-filled' : 'star'"
            size="24"
            color="#999"
          ></uni-icons>
          <text>收藏</text>
        </view>
      </template>

      <view>
        <uni-icons type="paperplane" size="24" color="#999"></uni-icons>
        <text>分享</text>
      </view>
    </view>

    <view v-if="commentList.length" class="r-commentBox">
      <view class="r-comItem" v-for="(c, cindex) in commentList" :key="cindex">
        <view>
          <image
            :src="
              c.userImage
                ? `${baseUrl}${c.userImage}`
                : '/static/img/defaultuser.png'
            "
          ></image>
          <text class="r-comName">{{ c.username }}：</text>
          <text>{{ c.content }}</text>
          <uni-icons
            :type="c.username === ownUserName ? 'close' : 'chatbubble'"
            size="20"
            color="#999"
            @click="handleReply(c, c.commentId)"
          ></uni-icons>
          <template v-if="replyList[cindex].length">
            <view
              class="r-replyMain"
              v-for="(r, rindex) in replyList[cindex]"
              :key="rindex"
            >
              <image
                :src="
                  r.userImage
                    ? `${baseUrl}${r.userImage}`
                    : '/static/img/defaultuser.png'
                "
              ></image>
              <text class="r-comName">{{ r.userName }}：</text>
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
    </view>

    <!-- 回复pop组件化 -->
    <!-- handleReply函数 -->
  </view>
</template>

<script>
import { request, BASE_URL } from '../../utils/request'
import { get_userName } from '../../utils/storage'

export default {
  data() {
    return {
      userImage: '',
      commentList: [],
      replyList: [],
      ownUserName: '',
      baseUrl: `${BASE_URL}/static/`,
      type: '',
      record: {},
      collect: '0',
      favorite: '0',
      collectCount: 0,
      favoriteCount: 0,
      likeId: 0,
    }
  },
  onLoad() {
    const _this = this
    // #ifdef APP-NVUE
    const eventChannel = _this.$scope.eventChannel
    // #endif
    const eventChannel = _this.getOpenerEventChannel()
    eventChannel.once('toRecordDetailPageData', function (data) {
      _this.record = data.record
      _this.type = data.type
    })
    _this.ownUserName = get_userName()
    if (_this.record) {
      _this.getUserImg(_this.record.userId)
      _this.getCommentData(_this.record.recordId)
    }
    if (_this.type === 'own') {
      _this.getColAndFavCount(_this.type.recordId)
    } else {
      _this.favorite = _this.record.favorite
      _this.collect = _this.record.collect
      _this.likeId = _this.record.likeId
    }
  },
  methods: {
    getUserImg(id) {
      const _this = this
      request({
        url: '/getUserImg',
        data: { userId: id },
      }).then((v) => {
        _this.userImage = v.data.image
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
          console.log(v.data)
          _this.commentList = v.data.comments
          _this.replyList = v.data.replys
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
    handleReply(record, id) {},
  },
}
</script>

<style lang="scss" scoped>
.r-box {
  padding-bottom: 20px;
  .r-personBox {
    margin: 20px;
    display: flex;
    align-items: flex-end;
    image {
      width: 60px;
      height: auto;
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
    padding: 5px 20px;
    .uni-icons {
      margin-left: 10px;
      margin-right: 1px;
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
      .r-replyMain {
        margin-left: 20px;
      }
      image {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 0 3px;
      }
    }
  }
}
</style>
