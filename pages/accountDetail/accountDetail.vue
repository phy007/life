<template>
  <view>
    <view class="a-item">
      <text>头像</text>
      <view class="a-main a-imgbox" @click="changeImg">
        <view>
          <image v-if="imageUrl" :src="`${baseUrl}${imageUrl}`"></image>
          <image src="/static/img/defaultuser.png" v-else></image>
        </view>
        <uni-icons type="right" size="24"></uni-icons>
      </view>
    </view>
    <view class="a-item">
      <text>昵称</text>
      <view class="a-main">
        <text @click="editName">{{ showName ? showName : '填写昵称' }}</text>
        <uni-icons type="right" size="24"></uni-icons>
      </view>
    </view>
    <view class="a-item">
      <text>性别</text>
      <view class="a-main">
        <uni-data-checkbox
          class="sexBox"
          v-model="checkedSex"
          :localdata="sex"
          @change="changeSex"
        ></uni-data-checkbox>
      </view>
    </view>
    <view class="a-item">
      <text>出生日期</text>
      <view class="a-main">
        <uni-datetime-picker
          class="datePicker"
          type="date"
          :clear-icon="false"
          v-model="single"
          :border="false"
          @change="checkDate"
        />
      </view>
    </view>
    <view class="a-item">
      <text>邮箱</text>
      <view class="a-main">
        <text @click="editEmail">{{ showEmail ? showEmail : '填写邮箱' }}</text>
        <uni-icons type="right" size="24"></uni-icons>
      </view>
    </view>
    <view class="a-item">
      <text>手机号码</text>
      <view class="a-main">
        <text>{{ phone }}</text>
        <!-- <uni-icons type="right" size="24"></uni-icons> -->
      </view>
    </view>
    <!-- 弹窗 -->
    <view class="bt-pop" v-if="showPop">
      <view class="b-popMain">
        <text>{{ popTitle }}</text>
        <input
          type="text"
          :placeholder="inputType === 1 ? '2-6位数字中文英文字母' : '填写邮箱'"
          v-model="inputText"
          @blur="verifyInput"
          auto-focus
        />
        <button @click="sureInput">确定</button>
        <button @click="cancelInput">取消</button>
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
      showPop: false,
      baseUrl: `${BASE_URL}/static/`,
      imageUrl: '',
      popTitle: '',
      showName: '',
      showEmail: '',
      single: '',
      phone: '',
      inputType: 0,
      inputText: '',
      errorInput: false,
      checkedSex: 0,
      sex: [
        {
          text: '男',
          value: 1,
        },
        {
          text: '女',
          value: 2,
        },
        {
          text: '保密',
          value: 0,
        },
      ],
    }
  },
  onLoad(e) {
    this.userId = e.id
    this.getUser()
  },
  methods: {
    getUser() {
      const _this = this
      request({
        url: '/getUser',
        data: { userId: this.userId },
      }).then((v) => {
        const data = v.data
        if (v.statusCode === 200) {
          if (data.length) {
            _this.imageUrl = data[0].image
            _this.showName = data[0].userName
            _this.showEmail = data[0].email
            _this.single = commonWays.formatDate(data[0].birthdate)
            _this.phone = data[0].phone
            _this.checkedSex = Number(data[0].gender)
          } else {
            commonWays.toast('加载失败')
          }
        }
      })
    },
    sureInput() {
      if (!this.errorInput) {
        if (this.inputType === 1) {
          if (this.showName !== this.inputText) {
            this.showName = this.inputText
            this.updateUser({ userId: this.userId, userName: this.inputText })
          }
        } else {
          if (this.showEmail !== this.inputText) {
            this.showEmail = this.inputText
            this.updateUser({ userId: this.userId, email: this.inputText })
          }
        }
        this.showPop = false
        this.inputType = 0
        this.inputText = ''
      } else {
        this.errorInput = false
      }
    },
    cancelInput() {
      commonWays.toast('取消操作')
      this.showPop = false
      this.inputType = 0
      this.inputText = ''
    },
    verifyInput() {
      let re
      if (this.inputType === 1) {
        re = /^[\u4e00-\u9fa50-9a-zA-Z]{2,6}$/
      } else if (this.inputType === 2) {
        re = /^[A-Za-z0-9-_\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      }
      if (this.inputText === '') {
        commonWays.toast('请输入昵称')
      } else if (!re.test(this.inputText)) {
        this.errorInput = true
        if (this.inputType === 1) {
          commonWays.toast('输入合法昵称！')
        } else if (this.inputType === 2) {
          commonWays.toast('输入合法邮箱！')
        }
      }
    },
    changeImg() {
      const _this = this
      uni.chooseImage({
        count: 1,
        sizeType: ['copressed'],
        sourceType: ['album', 'camera'], //album 从相册选图,camera 使用相机
        success(res) {
          let tempFilePath = res.tempFilePaths[0]
          // 将选择的图片上传服务器
          uni.uploadFile({
            // #ifdef H5
            url: '/api/upload',
            // #endif
            // #ifdef MP-WEIXIN
            url: `${BASE_URL}/upload`,
            // #endif
            filePath: tempFilePath, //图片链接
            name: 'file', //默认是file
            success: (res) => {
              let { statusCode, data } = res
              if (statusCode === 200) {
                let { code, message } = JSON.parse(data)
                if (code == -1) {
                  commonWays.toast(message)
                } else if (code == -2) {
                  commonWays.toast(message)
                } else {
                  _this.updateUser({ userId: _this.userId, image: message })
                  _this.getUser()
                }
              }
            },
          })
        },
      })
    },
    updateUser(data) {
      request({
        url: '/updateUser',
        data,
        method: 'POST',
      }).then((v) => {
        if (v.statusCode === 200) {
          commonWays.toast(v.data)
        }
      })
    },
    checkDate(e) {
      this.single = e
      this.updateUser({ userId: this.userId, birthdate: e })
    },
    editName() {
      this.inputText = this.showName
      this.showPop = true
      this.popTitle = '填写昵称'
      this.inputType = 1
    },
    editEmail() {
      this.inputText = this.showEmail
      this.showPop = true
      this.popTitle = '填写邮箱'
      this.inputType = 2
    },
    changeSex(e) {
      this.checkedSex = e.detail.value
      this.updateUser({ userId: this.userId, gender: `${e.detail.value}` })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';

.a-item {
  width: 100%;
  padding: 12px 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 18px;
  border-bottom: 1px solid #e5e5e5;
  text {
    width: 90px;
  }
  .a-main {
    flex: 1;
    font-size: 16px;
    color: #8d8c8c;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    text-align: right;
    position: relative;
    .datePicker {
      position: absolute;
      right: -4px;
      font-size: 16px;
      width: 140px;
    }
    .sexBox {
      position: absolute;
      right: -12px;
    }
    view {
      image {
        width: 80px;
        height: 80px;
      }
    }
    text,
    view {
      width: auto;
      // #ifdef MP-WEIXIN
      flex: 1;
      // #endif
    }
    .uni-icons {
      width: 24px;
    }
  }
}
</style>
