<template>
  <view>
    <view class="i-commit">
      <!-- #ifdef H5 -->
      <input
        :style="
          errInput !== 0 ? { 'box-shadow': '0 0 1px red', color: 'red' } : ''
        "
        type="text"
        v-model="addIcon.iconTitle"
        placeholder="不超过四个字"
        @blur="inputText"
      />
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <input
        type="text"
        v-model="addIcon.iconTitle"
        placeholder="不超过四个字"
        @blur="inputText"
      />
      <!-- #endif -->
      <button size="mini" type="warn" @click="successAdd">确认</button>
    </view>
    <view v-for="(item, index) in title" :key="index">
      <text class="i-title">{{ item }}</text>
      <view class="i-iconbox">
        <image
          class="i-icon"
          :class="currentIndex === Object.keys(url)[0] ? 'addItem' : ''"
          v-for="(url, i) in iconUrl[index][index + 1]"
          :key="i"
          mode="aspectFit"
          :src="`/static/img/icon/${Object.values(url)}`"
          @click="chooseIcon(Object.keys(url))"
        ></image>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '../../utils/request'
import { commonWays } from '../../utils/common'

export default {
  data() {
    return {
      title: [],
      iconUrl: [],
      addIcon: { iconTitle: '', iconTypeId: 0 },
      currentIndex: 0,
      errInput: 0,
    }
  },
  onLoad: function () {
    const _this = this
    // #ifdef APP-NVUE
    const eventChannel = _this.$scope.eventChannel || '' // 兼容APP-NVUE
    // #endif
    const eventChannel = _this.getOpenerEventChannel() || ''
    if (eventChannel) {
      eventChannel.once('toNextPageData', function (data) {
        _this.fromJumpPage = data
      })
    } else {
      uni.reLaunch({
        url: '../addBill/addBill',
      })
    }
    this.getAllIcon()
  },
  methods: {
    getAllIcon() {
      request({
        url: '/allCategory',
      })
        .then((v) => {
          if (v.statusCode === 200) {
            const iconLists = v.data
            iconLists.forEach((e) => {
              if (e.level === 0) {
                // 存储一级标题
                this.title.push(e.iconTypeName)
                this.iconUrl.push({
                  [e.iconTypeId]: [],
                })
              } else {
                // 存储二级路径
                this.iconUrl[e.level - 1][e.level].push({
                  [e.iconTypeId]: e.iconTypeUrl,
                })
              }
            })
          }
        })
        .catch((r) => {
          console.log(r)
        })
    },
    chooseIcon(i) {
      this.addIcon.iconTypeId = i[0]
      this.currentIndex = i[0]
    },
    inputText() {
      let text = this.addIcon.iconTitle
      let re = /^[\u4e00-\u9fa5]{1,4}$/
      if (text === '') {
        commonWays.toast('输入内容')
        this.errInput = 3
      } else {
        if (!re.test(text)) {
          commonWays.toast('输入无效！')
          this.errInput = 1
        } else {
          if (this.fromJumpPage.iconTitleList.indexOf(text) === -1) {
            this.errInput = 0
            this.addIcon.iconTitle = text
          } else {
            commonWays.toast('已存在，重新输入')
            this.errInput = 2
          }
        }
      }
    },
    successAdd() {
      this.addIcon.type = this.fromJumpPage.type
      if (this.errInput === 1) {
        commonWays.toast('输入无效！')
      } else if (this.errInput === 2) {
        commonWays.toast('已存在，重新输入')
      } else if (this.errInput === 3) {
        commonWays.toast('请输入标题')
      } else if (this.addIcon.iconTypeId === 0) {
        commonWays.toast('未选中图标')
      } else {
        request({
          url: '/addIcon',
          method: 'POST',
          data: this.addIcon,
        }).then((v) => {
          const { data } = v
          if (data.code === 0) {
            commonWays.toast(data.message)
          } else if (data.code === 2) {
            commonWays.toast(data.message)
          } else if (data.code === 1) {
            uni.navigateTo({ url: '../addBill/addBill' })
          }
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.i-commit {
  text-align: right;

  input {
    height: 30px;
    line-height: 30px;
    border: none;
    box-shadow: 0 0 1px #808080;
    padding: 2px 5px;
    opacity: 0.8;
    font-size: 24px;
  }

  button {
    margin: 5px 5px 0 0;
  }
}

.i-title {
  display: block;
  font-size: 24px;
  height: 24px;
  line-height: 24px;
  font-weight: bold;
  width: 100%;
  margin: 8px 0 0 2px;
}

.i-iconbox {
  display: flex;
  flex-wrap: wrap;
  .i-icon {
    width: 60px;
    height: 60px;
    margin: 6px 9px;
    box-sizing: border-box;
    padding: 3px;
  }
  .addItem {
    box-shadow: 0px 0px 3px #9b2d95;
    border-radius: 5px;
  }
}
</style>
