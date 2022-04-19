<template>
  <view>
    <uni-collapse ref="collapse" v-model="value" @change="change">
      <uni-collapse-item v-for="(t, i) in title" :key="i" :title="t">
        <uni-list-chat
          title="uni-app"
          avatar="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png"
          note="您收到一条新的消息"
          badge-positon="left"
          badge-text="dot"
        >
          <view v-if="type === '1'" class="chat-custom-right">
            <button>同意</button>
          </view>

          <view v-else class="chat-custom-right">
            <text class="chat-custom-text">刚刚</text>
            <!-- 需要使用 uni-icons 请自行引入 -->
            <uni-icons type="star-filled" color="#999" size="18"></uni-icons>
          </view>
        </uni-list-chat>
      </uni-collapse-item>
    </uni-collapse>
  </view>
</template>

<script>
import { request, BASE_URL } from '../../utils/request'
export default {
  data() {
    return {
      title: ['好友申请', '评论', '收藏', '点赞'],
      accordionVal: '1',
      value: ['0'],
      noticeList: [],
    }
  },
  onLoad() {
    this.getNoticeData()
  },
  methods: {
    change(e) {
      console.log(e)
    },
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
          _this.noticeList = v.data
          console.log(v.data)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
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
  justify-content: center;
  button {
    font-size: 12px;
  }
}

.chat-custom-text {
  font-size: 12px;
  color: #999;
}
</style>
