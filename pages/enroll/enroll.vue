<template>
  <view class="e-box">
    <text class="e-title">注册</text>
    <input
      class="p-input"
      type="phone"
      v-model="phone"
      @blur="checkInput('p')"
      placeholder="手机号码"
      :class="isErrorInput ? 'isError' : ''"
    />
    <input
      class="p-input"
      type="password"
      v-model="password"
      @blur="checkInput('m')"
      :class="isErrorInput2 ? 'isError' : ''"
      placeholder="密码"
    />
    <text class="l-text">6-12位数字字母特殊符号组成</text>
    <view class="e-radio">
      <radio-group @change="radioChange">
        <radio value="protocol" /><text>注册即表示同意用户协议</text>
      </radio-group>
    </view>
    <button class="p-submit" @click="submit">注册</button>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request } from '../../utils/request'
import { showModal } from '../../utils/user'
export default {
  data() {
    return {
      phone: '',
      password: '',
      isErrorInput2: false,
      isErrorInput: false,
    }
  },
  onShow() {
    if (getApp().globalData.$phone) {
      this.phone = getApp().globalData.$phone
    }
  },
  methods: {
    radioChange(e) {
      this.radioChecked = true
    },
    checkInput(t) {
      let reg
      if (t === 'p') {
        reg = /^[1][3,4,5,7,8][0-9]{9}$/
        if (this.phone === '') {
          commonWays.toast('账号不能为空')
          this.isErrorInput = true
        } else if (!reg.test(this.phone)) {
          commonWays.toast('手机号码输入不合法')
          this.isErrorInput = true
        } else {
          request({
            url: '/existUser',
            data: { phone: this.phone },
          }).then((v) => {
            if (v.statusCode === 409) {
              this.existUser = true
              showModal(
                '账号已存在，是否前往登录页',
                '/pages/login/login',
                this.phone
              )
            } else {
              this.existUser = false
            }
          })
          this.isErrorInput = false
        }
      } else {
        reg =
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{6,12}$/
        if (this.password === '') {
          commonWays.toast('密码不能为空')
          this.isErrorInput2 = true
        } else if (!reg.test(this.password)) {
          commonWays.toast('密码输入不合法')
          this.isErrorInput2 = true
        } else {
          this.isErrorInput2 = false
        }
      }
    },
    submit() {
      if (this.phone === '' || this.password === '') {
        commonWays.toast('请输入账号或密码')
      } else if (this.isErrorInput || this.isErrorInput2) {
        commonWays.toast('请输入正确的账号密码')
      } else if (!this.radioChecked) {
        commonWays.toast('请勾选协议')
      } else {
        request({
          url: '/register',
          data: {
            phone: this.phone,
            password: this.password,
            existUser: this.existUser,
          },
          method: 'POST',
        }).then((v) => {
          if (v.statusCode === 201) {
            showModal(
              '注册成功，是否前往登录页',
              `/pages/login/login`,
              this.phone
            )
          } else if (v.statusCode === 409) {
            showModal(
              '账号已存在，是否前往登录页',
              '/pages/login/login',
              this.phone
            )
          } else if (v.statusCode === 400) {
            showModal('账号或密码不合法，请重新输入')
          }
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';
.e-box {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 50px;
  .e-title {
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 4px;
  }
  .e-radio {
    width: 258px;
    margin-top: 15px;
  }
}
</style>
