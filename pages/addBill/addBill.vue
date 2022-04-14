<template>
  <view class="contain">
    <!-- 标签页 -->
    <uni-segmented-control
      :current="current"
      :values="items"
      @clickItem="onClickItem"
      styleType="button"
      activeColor="#7950EA"
      class="b-tag"
    ></uni-segmented-control>

    <!-- 轮播 -->
    <view class="b-content">
      <view v-show="current === 0">
        <swiper style="height: 200px" @change="change" indicator-dots>
          <swiper-item v-for="n in Math.ceil(payInfo.length / 8)" :key="n">
            <view class="b-swiperbox">
              <view
                class="b-swipercell"
                v-for="(p, index) in showPayInfoList"
                :key="index"
                @click="chooseIcon(p.iconId, payIconTitleList, p)"
                :class="currentIndex === p.iconId ? 'addItem' : ''"
              >
                <template v-if="p.iconId !== -1">
                  <view class="b-button">
                    <image
                      :src="`../../static/img/icon/${p.iconTypeUrl}`"
                    ></image>
                    <text>{{ p.iconTitle }}</text>
                    <view class="b-btn" @click="delIcon(p)">✘</view>
                  </view>
                </template>
                <template v-else>
                  <image
                    :src="`../../static/img/icon/${p.iconTypeUrl}`"
                  ></image>
                  <text>{{ p.iconTitle }}</text>
                </template>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>
      <view v-show="current === 1">
        <!-- 轮播 -->
        <swiper style="height: 200px" @change="change" indicator-dots>
          <swiper-item v-for="n in Math.ceil(incomeInfo.length / 8)" :key="n">
            <view class="b-swiperbox">
              <view
                class="b-swipercell"
                v-for="(p, index) in showIncomeInfoList"
                :key="index"
                @click="chooseIcon(p.iconId, incomeIconTitleList, p)"
                :class="currentIndex === p.iconId ? 'addItem' : ''"
              >
                <template v-if="p.iconId !== -1">
                  <view class="b-button">
                    <image
                      :src="`../../static/img/icon/${p.iconTypeUrl}`"
                    ></image>
                    <text>{{ p.iconTitle }}</text>
                    <view class="b-btn" @click="delIcon(p)">✘</view>
                  </view>
                </template>
                <template v-else>
                  <image
                    :src="`../../static/img/icon/${p.iconTypeUrl}`"
                  ></image>
                  <text>{{ p.iconTitle }}</text>
                </template>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>
    </view>

    <!-- 编辑区 -->
    <view class="b-text"
      >￥<text>{{ money === '' ? 0 : money }}</text></view
    >
    <view class="b-dateBox">
      <!-- 时间器 -->
      <picker class="b-date" mode="date" :value="date" @change="bindDateChange">
        <view class="picker">{{ date }}</view>
      </picker>
      <input type="text" v-model="inputText" placeholder="备注，方便记忆" />
      <!-- 图片选择器 -->
      <view class="b-clear" v-if="imageFile !== ''">
        <image :src="imageFile" @click="previewImg(imageFile)"></image>
        <view class="b-clearIcon" @click="clearFile">×</view>
      </view>
      <view class="b-clear" v-else-if="downUrl !== ''">
        <image
          :src="`${baseUrl}${downUrl}`"
          @click="previewImg(`${baseUrl}${downUrl}`)"
        ></image>
        <view class="b-clearIcon" @click="clearFile">×</view>
      </view>
      <image
        v-else
        class="b-loadImg"
        mode="aspectFit"
        src="../../static/img/loadimg.png"
        @click="loadImg"
      ></image>
    </view>

    <!-- 数字键盘 -->
    <view class="b-digital">
      <text v-for="(d, index) in digital" :key="index" @click="showText(d)">{{
        d
      }}</text>
    </view>
    <button @click="addBillInfo">确认</button>
  </view>
</template>

<script>
import { request, BASE_URL } from '../../utils/request'
import { commonWays } from '../../utils/common'
import { get_userId } from '../../utils/storage'
export default {
  data() {
    return {
      baseUrl: `${BASE_URL}/static/`,
      billTypeId: 0,
      showPayInfoList: [],
      showIncomeInfoList: [],
      payInfo: [],
      incomeInfo: [],
      payIconTitleList: [],
      incomeIconTitleList: [],
      current: 0,
      currentIndex: '',
      date: '',
      inputText: '',
      items: ['支出', '收入'],
      money: '',
      digital: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '×'],
      loop: 0,
      imageFile: '',
      uploadUrl: '',
      downUrl: '',
      delUrl: '',
      chooseIconInfo: {},
      submitType: 0,
    }
  },
  onLoad: function () {
    const _this = this
    // #ifdef APP-NVUE
    const eventChannel = _this.$scope.eventChannel || '' // 兼容APP-NVUE
    // #endif
    const eventChannel = _this.getOpenerEventChannel() || ''
    if (eventChannel) {
      eventChannel.once('toBillPageData', function (data) {
        _this.billId = data.billId
        _this.currentIndex = data.iconId
        _this.date = commonWays.formatDate(data.date)
        _this.billTypeId = data.billTypeId
        _this.money = data.money
        _this.inputText = data.remark
        _this.downUrl = data.imageUrl
        _this.chooseIconInfo.iconId = data.iconId
        _this.chooseIconInfo.iconTitle = data.title
        _this.chooseIconInfo.type = data.type
        _this.chooseIconInfo.iconTypeUrl = data.iconUrl
        _this.submitType = 1
      })
      eventChannel.once('toPageAddBillData', function (data) {
        _this.billTypeId = data
      })
    }
  },
  created() {
    this.getIconList()
    if (this.date === '') this.getCurrentTime()
  },
  methods: {
    getIconList() {
      request({
        url: '/category',
      }).then((v) => {
        if (v.statusCode === 200) {
          const arr = v.data
          for (const a of arr) {
            if (a.type === 0) {
              this.payInfo.push(a)
              this.payIconTitleList.push(a.iconTitle)
            } else if (a.type === 1) {
              this.incomeInfo.push(a)
              this.incomeIconTitleList.push(a.iconTitle)
            }
          }
          this.payInfo.push({
            iconId: -1,
            iconTitle: '添加',
            iconTypeUrl: 'b-add.png',
            type: 1,
          })
          this.incomeInfo.push({
            iconId: -1,
            iconTitle: '添加',
            iconTypeUrl: 'b-add.png',
            type: 2,
          })
          this.showPayInfoList = this.sliceList(this.payInfo, 0)
          this.showIncomeInfoList = this.sliceList(this.incomeInfo, 0)
        }
      })
    },
    onClickItem(e) {
      // 切换tab，保留切换前的数据状态
      this.current = e.currentIndex
      if (this.submitType === 0) {
        this.money = ''
        this.inputText = ''
        this.currentIndex = ''
      }
    },
    sliceList(type, n) {
      return type.slice(n * 8, n * 8 + 8)
    },
    change(e) {
      this.loop = e.detail.current
      if (this.current === 0) {
        this.showPayInfoList = this.sliceList(this.payInfo, this.loop)
      } else {
        this.showIncomeInfoList = this.sliceList(this.incomeInfo, this.loop)
      }
    },
    bindDateChange(e) {
      this.date = e.detail.value
    },
    showText(n) {
      let str = this.money + ''
      if (n === '×') {
        str = str.slice(0, -1)
      } else if (n === '.') {
        if (str.indexOf('.') === -1) {
          if (str.length === 0) {
            str = 0 + n
          } else {
            str += n
          }
        } else {
          commonWays.toast('输入正确数字')
        }
      } else {
        if (str.indexOf('.') !== -1) {
          let arr = str.split('.')
          if (arr[1].length === 2) {
            commonWays.toast('仅输入两位小数')
          } else if (arr[0].length === 9) {
            if (arr[1].length === 2) {
              commonWays.toast('仅输入两位小数')
            } else {
              str += n
            }
          } else {
            str += n
          }
        } else {
          if (str.length === 9) {
            commonWays.toast('不超过亿')
          } else {
            str += n
          }
        }
      }

      this.money = str
    },
    loadImg() {
      let _this = this
      uni.chooseImage({
        count: 1,
        sizeType: ['copressed'],
        sourceType: ['album', 'camera'], //album 从相册选图,camera 使用相机
        success(res) {
          let tempFilePath = res.tempFilePaths[0]
          console.log(tempFilePath);
          // 将选择的图片上传服务器
          uni.uploadFile({
            // #ifdef H5
            url: '/api/upload',
            // #endif
            // #ifdef MP-WEIXIN
            url: '/upload',
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
                  _this.uploadUrl = message
                  _this.imageFile = tempFilePath
                }
              }
            },
          })
        },
      })
    },
    previewImg(img) {
      let imgsArr = []
      imgsArr[0] = img
      uni.previewImage({
        current: 0,
        urls: imgsArr,
      })
    },
    clearFile() {
      this.imageFile = ''
      this.delUrl = this.downUrl
      this.downUrl = ''
      // 调用删除的接口，在点击确认按钮时，判断两个图片链接是否一致，不一致，替换服务器上的图片资源
      // 点击图片中间应该可以进行图片的预览
    },
    chooseIcon(i, arr, p) {
      if (i === -1) {
        this.jumpNextPage(arr, this.current)
      } else {
        this.currentIndex = i
        this.chooseIconInfo = p
      }
    },
    delIcon(p) {
      let _this = this
      uni.showModal({
        title: p.iconTitle,
        content: '确认要删除吗？',
        success: function (res) {
          if (res.confirm) {
            request({
              url: '/delIcon',
              data: { iconId: p.iconId },
            }).then((v) => {
              const { message } = v.data
              if (v.statusCode === 200) {
                _this.payInfo = []
                _this.incomeInfo = []
                _this.getIconList()
                commonWays.toast(message)
              } else {
                commonWays.toast(message)
              }
            })
          } else if (res.cancel) {
            commonWays.toast('取消删除')
          }
        },
      })
    },
    jumpNextPage(arr, t) {
      uni.navigateTo({
        url: '/pages/classify/classify',
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('toNextPageData', {
            iconTitleList: arr,
            type: t,
          })
        },
      })
    },
    getCurrentTime() {
      //获取当前时间
      var _this = this
      let yy = new Date().getFullYear()
      let mm = new Date().getMonth() + 1
      let dd = new Date().getDate()
      let hh = new Date().getHours()
      let mf =
        new Date().getMinutes() < 10
          ? '0' + new Date().getMinutes()
          : new Date().getMinutes()
      _this.date = yy + '-' + mm + '-' + dd
    },
    addBillInfo() {
      //  add bill
      let addInfo
      const _this = this
      if (this.money === '') {
        commonWays.toast('请输入金额！')
      } else if (!this.chooseIconInfo.hasOwnProperty('iconId')) {
        commonWays.toast('请选择类别')
      } else {
        this.imageFile = this.uploadUrl ? this.uploadUrl : this.downUrl
        addInfo = {
          type: this.chooseIconInfo.type,
          iconId: this.chooseIconInfo.iconId,
          title: this.chooseIconInfo.iconTitle,
          money: this.money,
          date: this.date,
          remark: this.inputText,
          imageUrl: this.imageFile,
          billTypeId: this.billTypeId, //跳转进来的页面，携带
          userId: getApp().globalData.$userId || get_userId(), //登录成功之后，全局配置
          iconUrl: this.chooseIconInfo.iconTypeUrl,
        }
        if (this.submitType === 1) {
          if (this.delUrl !== this.uploadUrl && this.delUrl !== '') {
            request({
              url: '/delImg',
              data: {
                filename: _this.delUrl,
              },
            })
          }
          request({
            url: '/updateBill',
            method: 'POST',
            data: {
              addInfo,
              billId: _this.billId,
            },
          }).then((v) => {
            const { message } = v.data
            if (v.statusCode === 200) {
              uni.switchTab({
                url: '/pages/bill/bill',
                success: function () {
                  let page = getCurrentPages().pop()
                  if (!page) {
                    return
                  }
                  // #ifdef H5
                  page.getBillList()
                  page.showEditBox = false
                  // #endif

                  // #ifdef MP-WEIXIN
                  page.$vm.getBillList()
                  page.$vm.showEditBox = false
                  // #endif
                },
              })
            } else {
              commonWays.toast(message)
            }
          })
        } else {
          request({
            url: '/addBill',
            method: 'POST',
            data: addInfo,
          }).then((v) => {
            const { message } = v.data
            if (v.statusCode === 200) {
              uni.switchTab({
                url: '/pages/bill/bill',
                success: function () {
                  let page = getCurrentPages().pop()
                  if (!page) {
                    return
                  }
                  // #ifdef H5
                  page.getBillList()
                  // #endif

                  // #ifdef MP-WEIXIN
                  page.$vm.getBillList()
                  // #endif
                },
              })
            } else {
              commonWays.toast(message)
            }
          })
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.b-tag {
  margin: 33px auto;
  width: 200px;
  height: 50px;
  line-height: 50px;
  font-weight: bold;
  font-size: 18px;
}

/* #ifdef MP-WEIXIN */
.contain {
  padding-top: 33px;
}
/* #endif */

.b-digital {
  display: flex;
  text-align: center;
  flex-wrap: wrap;
  border-top: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
  box-sizing: border-box;
  text {
    width: 33.3%;
    box-sizing: border-box;
    height: 70px;
    line-height: 70px;
    border-right: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
  }
}
.b-text {
  text-align: right;
  font-size: 20px;
  height: 40px;
  line-height: 40px;
  font-weight: bold;
  color: #7950ea;
  margin-top: 10px;
  box-sizing: border-box;
  text {
    display: inline-block;
    padding-right: 10px;
    color: black;
    font-weight: 400;
    font-size: 18px;
  }
}
.b-dateBox {
  height: 50px;
  border: 1px solid #f0f0f0;
  padding: 2px;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  font-size: 16px;
  align-content: center;
  margin: 6px 0;
  .b-date {
    padding: 6px;
    margin: 2px;
    background-color: #7950ea;
    font-size: 14px;
    color: white;
    border-radius: 5px;
    line-height: 30px;
  }
  input {
    height: 100%;
    padding-left: 3px;
    width: 66%;
    /* #ifdef MP-WEIXIN */
    width: 64%;
    /* #endif */
  }
  .b-loadImg,
  .b-clear {
    flex: 1;
    height: 100%;
  }
  .b-loadImg:hover {
    cursor: pointer;
  }
  .b-clear {
    position: relative;
    .b-clearIcon {
      position: absolute;
      top: -5px;
      right: -3px;
      background: none;
      border: 0;
      color: red;
      font-size: 10px;
      padding: 2px;
    }
    image {
      width: 100%;
      height: 100%;
    }
  }
}

.b-content {
  margin-bottom: 20px;
  .b-swiperbox {
    display: flex;
    box-sizing: border-box;
    flex-wrap: wrap;
    /* #ifdef MP-WEIXIN */
    margin-top: 10px;
    /* #endif */
    .addItem {
      box-shadow: 0px 0px 3px #9b2d95;
      border-radius: 5px;
    }
    .b-swipercell {
      width: 24%;
      text-align: center;
      margin: 7px 0.5%;
      box-sizing: border-box;
      padding: 6px 5% 6px 0;
      /* #ifdef MP-WEIXIN */
      margin: 6px 0;
      /* #endif */
      .b-button {
        position: relative;
        padding-right: 5px;
        .b-btn {
          position: absolute;
          right: -7px;
          font-size: 16px;
          color: #9b2d95;
          cursor: pointer;
          top: 25px;
        }
      }
      image {
        width: 33px;
        height: 33px;
        display: block;
        margin: 0 auto;
      }
      text {
        line-height: 30px;
        height: 30px;
        font-size: 16px;
        /* #ifdef MP-WEIXIN */
        font-size: 13px;
        /* #endif */
      }
    }
  }
}
button {
  background-color: #7950ea;
  margin-top: 5px;
  color: white;
  font-size: 18px;
  letter-spacing: 8px;
  height: 50px;
  line-height: 50px;
}
</style>
