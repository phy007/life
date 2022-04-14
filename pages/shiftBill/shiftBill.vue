<template>
  <view>
    <text class="com-title">账本分类</text>

    <view
      class="bt-item"
      :class="currentIndex === bt.billTypeId ? 'bt-itemBgColor' : ''"
      v-for="(bt, i) in billTypeList"
      :key="i"
      @click="currentIndex = bt.billTypeId"
    >
      <text>{{ bt.billTypeName }}</text>
      <view>
        <uni-icons type="compose" size="30" @click="editBTName(bt)"></uni-icons>
        <uni-icons type="trash" size="30" @click="delBTName(bt)"></uni-icons>
      </view>
    </view>

    <view class="bt-btn">
      <button @click="addBTName">添加账本</button>
      <button @click="submit">确认</button>
    </view>

    <view class="bt-pop" v-if="showPop">
      <view class="b-popMain">
        <text>修改账本分类名</text>
        <!-- <text>添加账本分类名</text> -->
        <input
          type="text"
          placeholder="少于四个汉字或数字"
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
import { request } from '../../utils/request'
export default {
  data() {
    return {
      billTypeList: [],
      operationType: 0,
      currentIndex: -1,
      inputText: '',
      showPop: false,
      currentData: {},
    }
  },
  onLoad() {
    this.getBillTypeList()
  },
  methods: {
    getBillTypeList() {
      const _this = this
      request({
        url: '/billType',
      }).then((v) => {
        const { statusCode } = v
        const { code, message, data } = v.data
        if (statusCode === 500) {
          commonWays.toast('服务器错误')
        } else if (statusCode === 200) {
          if (code) {
            _this.billTypeList = data
          } else {
            commonWays.toast(message)
          }
        }
      })
    },
    editBTName(bt) {
      this.preTitle = bt.billTypeName
      this.currentData = bt
      this.inputText = bt.billTypeName
      this.operationType = 1
      this.showPop = true
    },
    delBTName(bt) {
      let _this = this
      uni.showModal({
        title: bt.billTypeName,
        content: '确认要删除吗？',
        success: function (res) {
          if (res.confirm) {
            request({
              url: '/delBTName',
              data: { billTypeId: bt.billTypeId },
            }).then((v) => {
              const { statusCode } = v
              if (statusCode === 200) {
                commonWays.toast(v.data.message)
              }
            })
            _this.getBillTypeList()
          } else if (res.cancel) {
            commonWays.toast('取消删除')
          }
        },
      })
    },
    addBTName() {
      this.operationType = 2
      this.showPop = true
    },
    verifyInput() {
      const re = /^[\u4e00-\u9fa50-9]{1,4}$/
      if (this.inputText === '') {
        commonWays.toast('请输入类名')
      } else if (!re.test(this.inputText)) {
        commonWays.toast('输入无效！')
      }
    },
    sureInput() {
      this.currentData.billTypeName = this.inputText
      const _this = this
      if (this.operationType === 1) {
        if (this.preTitle !== this.currentData.billTypeName) {
          request({
            url: '/updateBTName',
            data: _this.currentData,
          }).then((v) => {
            const { statusCode } = v
            const { message } = v.data
            if (statusCode === 200) {
              commonWays.toast(message)
            } else {
              commonWays.toast('500')
            }
          })
        }
      } else if (this.operationType === 2) {
        if (this.currentData.billTypeName) {
          request({
            url: '/addBTName',
            data: { billTypeName: _this.currentData.billTypeName },
          }).then((v) => {
            const { statusCode } = v
            const { message } = v.data
            if (statusCode === 200) {
              commonWays.toast(message)
              _this.getBillTypeList()
            } else {
              commonWays.toast('500')
            }
          })
        }
      }
      this.showPop = false
      this.inputText = ''
    },
    cancelInput() {
      commonWays.toast('取消操作')
      this.showPop = false
      this.inputText = ''
    },
    submit() {
      if (this.currentIndex === -1) {
        commonWays.toast('请选择账本')
      } else {
        let _this = this
        uni.switchTab({
          url: '/pages/bill/bill',
          success: function () {
            const page = getCurrentPages().pop()
            if (!page) {
              return
            }
            // #ifdef H5
            page.billTypeId = _this.currentIndex
            page.getBillTypeName()
            page.getBillList()
            // #endif

            // #ifdef MP-WEIXIN
            page.$vm.billTypeId = _this.currentIndex
            page.$vm.getBillTypeName()
            page.$vm.getBillList()
            // #endif
          },
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';
.com-title {
  margin: 5px 0 7px 0;
}
.bt-item {
  width: 100%;
  height: 50px;
  line-height: 50px;
  // background-color: #f8f8f8;
  outline: 1px solid #e5e5e5;
  font-size: 25px;
  padding: 0 8px;
  margin-bottom: 4px;
  box-sizing: border-box;
  border-radius: 8px;
  view {
    display: inline-block;
    float: right;
    .uni-icons {
      display: none;
      margin: 0 3px;
    }
  }
}
.bt-itemBgColor {
  background-color: rgba(216, 93, 178, 0.5);
}
.bt-item:hover .uni-icons {
  display: inline-block;
}
.bt-btn {
  button {
    margin-top: 10px;
    background: #0a55f7;
  }
  button:first-child {
    background: #f7900a;
  }
}
</style>
