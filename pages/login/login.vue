<template>
  <view class="l-h5">
    <image src="/static/img/logo.png"></image>
    <input
      type="text"
      class="p-input"
      v-model="phone"
      placeholder="手机号码"
      @blur="checkInput('p')"
      :class="isErrorInput ? 'isError' : ''"
    />
    <view class="verify">
      <input
        class="p-input"
        type="text"
        v-model="code"
        @blur="checkInput('c')"
        placeholder="验证码"
        :class="isErrorInput3 ? 'isError' : ''"
      />
      <text class="verifyCode" @click="loadCode">{{ showCode }}</text>
    </view>
    <input
      type="password"
      class="p-input"
      v-model="password"
      placeholder="密码"
      @blur="checkInput('m')"
      :class="isErrorInput2 ? 'isError' : ''"
    />
    <text class="l-text">6-12位数字字母特殊符号组成</text>
    <view class="remember">
      <checkbox-group @change="checkboxChange">
        <checkbox value="mima" :checked="checked" /><text>记住密码</text>
      </checkbox-group>
      <navigator url="/pages/enroll/enroll">注册</navigator>
    </view>
    <button class="p-submit" @click="submit">登录</button>
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
      isErrorInput: false,
      isErrorInput2: false,
      isErrorInput3: false,
      password: '',
      code: '',
      showCode: '',
      checked: false,
    }
  },
  methods: {
    login() {
      // 微信登录 待完成
      uni.showLoading({
        title: '加载中',
      })
      uni.login({
        provider: 'weixin',
        success: function (loginRes) {
          request({
            url: '/login',
            data: {
              code: loginRes.code,
            },
            success: (res) => {
              uni.hideLoading()
            },
          })
        },
      })
    },
    checkInput(t) {
      let reg
      if (t === 'p') {
        reg = /^[1][3,4,5,7,8][0-9]{9}$/
        if (this.phone === '') {
          commonWays.toast('手机号码不能为空')
          this.isErrorInput = true
        } else if (!reg.test(this.phone)) {
          commonWays.toast('手机号码输入不合法')
          this.isErrorInput = true
        } else {
          this.isErrorInput = false
          if (this.StoragePhone !== this.phone) {
            this.password = ''
            this.checked = false
          } else {
            this.password = this.StoragePwd
            this.checked = this.StoragePwd ? true : false
          }
          request({
            url: '/existUser',
            data: { phone: this.phone },
          }).then((v) => {
            if (v.statusCode === 600) {
              showModal(
                '账号不存在，是否前往注册页',
                '/pages/login/login',
                this.phone
              )
            }
          })
        }
      } else if (t === 'm') {
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
      } else if (t === 'c') {
        if (this.code === '') {
          commonWays.toast('验证码不能为空')
          this.isErrorInput3 = true
        } else if (this.code.toUpperCase() !== this.showCode.toUpperCase()) {
          commonWays.toast('验证码错误')
          this.isErrorInput3 = true
        } else {
          this.isErrorInput3 = false
        }
      }
    },
    loadCode() {
      let _this = this
      request({
        url: '/code',
      }).then((v) => {
        if (v.statusCode === 200) {
          _this.showCode = v.data.data
        } else {
          _this.showCode = ''
          commonWays.toast('500')
        }
      })
    },
    checkboxChange(e) {
      if (e.detail.value.length) {
        this.checked = true
      } else {
        this.checked = false
      }
    },

    submit() {
      const _this = this
      if (this.phone === '') {
        commonWays.toast('请输入账号')
      } else if (this.password === '') {
        commonWays.toast('请输入密码')
      } else if (this.code === '') {
        commonWays.toast('请输入验证码')
      } else if (this.isErrorInput3) {
        commonWays.toast('请输入正确的验证码')
      } else if (this.isErrorInput && this.isErrorInput2) {
        commonWays.toast('请输入正确账号密码')
      } else {
        request({
          url: '/login',
          data: {
            phone: this.phone,
            password: this.password,
          },
          method: 'POST',
        }).then((v) => {
          const { message, data } = v.data
          if (v.statusCode === 200) {
            if (message === 'notFound') {
              showModal('用户不存在，是否前往注册页', '/pages/enroll/enroll')
              getApp().globalData.$phone = this.phone
            } else if (message === 'errormima') {
              commonWays.toast('密码错误')
            } else if (message === 'success') {
              const { token, userId, userName } = data
              if (this.checked) {
                uni.setStorage({
                  key: 'phone',
                  data: _this.phone,
                })
                uni.setStorage({
                  key: _this.phone,
                  data: _this.password,
                })
              } else {
                uni.removeStorage({ key: _this.phone })
              }
              uni.setStorageSync('token', token)
              uni.setStorageSync('userId', userId)
              uni.setStorageSync('userName', userName)
              uni.switchTab({
                url: '/pages/bill/bill',
              })
            }
          }
        })
      }
    },
  },
  onLoad(e) {
    // #ifdef MP-WEIXIN
    // this.login()
    // #endif
    let _this = this
    this.loadCode()
    uni.getStorage({
      key: 'phone',
      success: function (res) {
        _this.phone = res.data
        _this.StoragePhone = res.data
      },
    })
    uni.getStorage({
      key: _this.phone,
      success: function (res) {
        _this.password = res.data
        _this.StoragePwd = res.data
      },
    })
    if (_this.phone && _this.password) {
      _this.checked = true
    }
  },
  onShow() {
    if (getApp().globalData.$phone) this.phone = getApp().globalData.$phone
  },
}
</script>
<style lang="scss" scoped>
@import '../../static/scss/common.scss';
.l-h5 {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  image {
    width: 120px;
    height: 120px;
    margin: 55px 0 40px 0;
  }

  .verify {
    width: 258px;
    position: relative;
    .p-input {
      width: 120px;
    }
    .verifyCode {
      position: absolute;
      width: 100px;
      border: 1px solid #9d9d9d;
      height: 48px;
      border-radius: 3px;
      color: white;
      display: inline-block;
      line-height: 48px;
      text-align: center;
      font-size: 20px;
      letter-spacing: 4px;
      top: 15px;
      right: 0;
      background: linear-gradient(45deg, #e66465, #9198e5);
    }
  }
  .remember {
    margin-top: 15px;
    width: 258px;
    position: relative;
    navigator {
      position: absolute;
      top: 0;
      right: 0;
      text-decoration: underline;
      color: #9198e5;
    }
  }
}
</style>
