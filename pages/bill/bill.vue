<template>
  <view>
    <view class="b-topBox">
      <view class="b-tBtop">
        <image src="../../static/img/char.png" @click="jumpToChart"></image>
        <view class="b-tBName">
          <text>{{ btName }}</text>
          <view>
            <!-- 
              1、点击左右按钮，增减月份，根据月份的变化，账单详情区域应该相对应显示，定位显示
              账单滑动懒加载
              2、支出收入结余区，根据月份计算
              3、切换账本按钮
              4、图标按钮
             -->
            <image
              src="../../static/img/b-left.png"
              @click="shiftMonth('l')"
            ></image>
            <text>{{ curYear }}年{{ curMonth }}月</text>
            <image
              src="../../static/img/b-right.png"
              @click="shiftMonth('r')"
            ></image>
          </view>
        </view>
        <button class="b-tBBtn" @click="jumpToChangeBillType">切换账本</button>
      </view>

      <view class="b-tBMain">
        <view>
          <text>收入</text>
          <text>{{ inMoney }}</text>
        </view>
        <view>
          <text>支出</text>
          <text>{{ payMoney }}</text>
        </view>
        <view>
          <text>结余</text>
          <text>{{ countMoney }}</text>
        </view>
      </view>
    </view>

    <!-- 账单主体部分 -->
    <view class="b-main">
      <view v-for="(m, j) in billList" :key="j">
        <view :id="`monthPoint${j}`"></view>
        <view
          class="b-mItem"
          v-for="(b, index) in Object.values(m)[0]"
          :key="index"
        >
          <view class="b-mIOne">
            <text>{{ Object.keys(b)[0] }}</text>
            <text>收入 {{ b.money2 }}</text>
            <text>支出 {{ b.money1 }}</text>
          </view>
          <view
            class="b-mITwo"
            v-for="(a, i) in Object.values(b)[0]"
            :key="i"
            @click="billEditShow(a)"
          >
            <image :src="`../../static/img/icon/${a.iconUrl}`"></image>
            <view>
              <template v-if="a.remark !== ''">
                <text>{{ a.title }}</text>
                <text class="b-mITsubtilte">{{ a.remark }}</text>
              </template>
              <text v-else>{{ a.title }}</text>
            </view>
            <text>{{ a.type === 0 ? -a.money : a.money }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹框 -->
    <view v-if="showEditBox" class="b-pop">
      <view class="b-popMain">
        <view class="b-popMTitle">
          <image :src="`../../static/img/icon/${showEditInfo.iconUrl}`"></image>
          <text>{{ showEditInfo.title }}</text>
          <image
            src="../../static/img/b-del2.png"
            @click="showEditBox = false"
          ></image>
        </view>
        <view class="b-popMContent">
          <view
            ><image src="../../static/img/b-money.png"></image
            ><text>￥{{ showEditInfo.money }}</text></view
          >
          <view
            ><image src="../../static/img/b-time.png"></image
            ><text>{{ formatDate(showEditInfo.date) }}</text></view
          >
          <view
            ><image src="../../static/img/b-remark.png"></image
            ><text>{{ showEditInfo.remark }}</text></view
          >
          <view>
            <image src="../../static/img/loadimg.png"></image>
            <image
              v-if="showEditInfo.imageUrl !== ''"
              class="b-popImg"
              :src="`${baseUrl}${showEditInfo.imageUrl}`"
              @click="
                previewImg(
                  `${baseUrl}${showEditInfo.imageUrl}`
                )
              "
            ></image>
          </view>
        </view>

        <view class="b-popMBottom">
          <view @click="editBill(showEditInfo)"
            ><image src="../../static/img/b-edit.png"></image>编辑</view
          >
          <view @click="delBill(showEditInfo.billId)"
            ><image src="../../static/img/b-del.png"></image>删除</view
          >
        </view>
      </view>
    </view>
    <button class="b-bottom" @click="addBill">记一笔</button>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'
import { request, BASE_URL } from '../../utils/request'
import { get_userId } from '../../utils/storage'
export default {
  data() {
    return {
      baseUrl: `${BASE_URL}/static/`,
      billList: [],
      curYear: new Date().getFullYear(),
      curMonth: new Date().getMonth() + 1,
      inMoney: 0,
      payMoney: 0,
      btName: '',
      showEditInfo: {},
      showEditBox: false,
      monthArr: [],
      monthPointHeight: [],
      imgUrl: '',
      billTypeId: 1, //默认日常
    }
  },
  onLoad() {
    console.log('onLoad')
    this.getBillList()
    this.getBillTypeName()
  },
  onReady() {
    setTimeout(() => {
      for (let i = 0; i < this.monthArr.length; i++) {
        const query = uni.createSelectorQuery().in(this)
        query
          .select('#monthPoint' + i)
          .boundingClientRect((data) => {
            this.monthPointHeight.push(data.top)
          })
          .exec()
      }
    }, 300)
  },
  methods: {
    getBillTypeName() {
      request({
        url: '/bTName',
        data: {
          billTypeId: this.billTypeId,
        },
      }).then((v) => {
        const { statusCode, data } = v
        if (statusCode === 200) this.btName = data[0].billTypeName
        else commonWays.toast(v.message)
      })
    },
    getBillList() {
      request({
        url: '/bills',
        data: {
          userId: getApp().globalData.$userId || get_userId(),
          billTypeId: this.billTypeId,
        },
      }).then((v) => {
        const { statusCode, data } = v
        if (statusCode === 200) {
          let date = ''
          let resArr = []
          let money1, money2
          let month = '',
            year = ''
          let k = -1
          let key, p, i
          this.monthArr = []
          let years = []
          let days = []
          let obj = {}
          let obj2 = {}
          if (data.length !== 0) {
            data.forEach((e) => {
              let d = commonWays.formatDate(e.date)
              let m = d.split('-')[1]
              let y = d.split('-')[0]
              let t = `${y}-${m}`
              if (month != m || year != y) {
                this.monthArr.push(`${y}-${m}`)
                years.push(y)
                month = m
                year = y
                obj = {}
                obj2 = {}
                resArr.push({ [t]: [], pay: 0, income: 0 })
                k++
              }
              if (d !== date) {
                key = Object.keys(resArr[k])[0]
                p = Object.keys(resArr[k])[1]
                i = Object.keys(resArr[k])[2]
                money1 = 0
                money2 = 0
                days.push(d)

                if (e.type === 0) {
                  if (e.title in obj) {
                    obj[e.title] += e.money
                  } else {
                    obj[e.title] = e.money
                  }
                  resArr[k][p] += e.money
                  money1 = e.money
                } else {
                  if (e.title in obj2) {
                    obj2[e.title] += e.money
                  } else {
                    obj2[e.title] = e.money
                  }
                  resArr[k][i] += e.money
                  money2 = e.money
                }
                resArr[k][key].push({ [d]: [e], money1, money2 })
                date = d
              } else {
                let l = resArr[k][key].length - 1
                resArr[k][key][l][date].push(e)
                if (e.type === 0) {
                  if (e.title in obj) {
                    obj[e.title] += e.money
                  } else {
                    obj[e.title] = e.money
                  }
                  resArr[k][key][l].money1 += e.money
                  resArr[k][p] += e.money
                } else {
                  if (e.title in obj2) {
                    obj2[e.title] += e.money
                  } else {
                    obj2[e.title] = e.money
                  }
                  resArr[k][key][l].money2 += e.money
                  resArr[k][i] += e.money
                }
              }
              resArr[k]['payType'] = obj
              resArr[k]['incomeType'] = obj2
            })
            this.billList = resArr
            this.yearArr = Array.from(new Set(years))
            this.dayArr = days
            this.payMoney = parseFloat(resArr[0].pay).toFixed(2)
            this.inMoney = parseFloat(resArr[0].income).toFixed(2)
            this.curYear = this.monthArr[0].split('-')[0]
            this.curMonth = this.monthArr[0].split('-')[1]
          } else {
            this.billList = []
            this.payMoney = 0
            this.inMoney = 0
          }
        } else {
          commonWays.toast(v.message)
        }
      })
    },
    jumpToChart() {
      const _this = this
      if (this.billList.length) {
        uni.navigateTo({
          url: `/pages/chart/chart?name=${_this.btName}`,
          success: function (res) {
            res.eventChannel.emit('toPageChartData', {
              bill: _this.billList,
              month: _this.monthArr,
              date: `${_this.curYear}-${_this.curMonth}`,
              year: _this.yearArr,
              day: _this.dayArr,
            })
          },
        })
      } else {
        commonWays.toast('请先记账')
      }
    },
    jumpToChangeBillType() {
      uni.navigateTo({
        url: '/pages/shiftBill/shiftBill',
      })
    },
    formatDate(date) {
      return commonWays.formatDate(date)
    },
    shiftMonth(t) {
      let date = `${this.curYear}-${this.curMonth}`
      let index = this.monthArr.indexOf(date)
      let length = this.monthArr.length - 1

      if (index < length || index > 0) {
        if (t === 'l') index++
        else index--
      }
      if (this.monthArr[index]) {
        this.curYear = this.monthArr[index].split('-')[0]
        this.curMonth = this.monthArr[index].split('-')[1]
        this.payMoney = parseFloat(this.billList[index].pay).toFixed(2)
        this.inMoney = parseFloat(this.billList[index].income).toFixed(2)
        uni.pageScrollTo({
          scrollTop: this.monthPointHeight[index] - 184,
          // duration: 0,
          duration: 300,
        })
      } else {
        commonWays.toast('日期上限')
      }
    },
    onPageScroll: function (res) {
      // 页面滑动是否需要添加防抖或节流
      // 是否需要判断monthPointHeight[i + 1]不存在的情况
      for (let i = 0; i < this.monthPointHeight.length - 1; i++) {
        if (
          res.scrollTop + 184 >= this.monthPointHeight[i] &&
          res.scrollTop + 184 <= this.monthPointHeight[i + 1]
        ) {
          this.curYear = this.monthArr[i].split('-')[0]
          this.curMonth = this.monthArr[i].split('-')[1]
          this.payMoney = parseFloat(this.billList[i].pay).toFixed(2)
          this.inMoney = parseFloat(this.billList[i].income).toFixed(2)
        }
      }
    },
    previewImg(img) {
      let imgsArr = []
      imgsArr[0] = img
      uni.previewImage({
        current: 0,
        urls: imgsArr,
      })
    },
    billEditShow(b) {
      this.showEditInfo = b
      this.showEditBox = true
    },
    delBill(id) {
      request({
        url: 'delBill',
        data: {
          billId: id,
        },
      }).then((v) => {
        const { data, statusCode } = v
        if (statusCode === 200) {
          commonWays.toast(data.message)
          this.showEditBox = false
          this.getBillList()
        } else {
          commonWays.toast(data.commonWays)
        }
      })
    },
    editBill(b) {
      uni.navigateTo({
        url: '/pages/addBill/addBill',
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('toBillPageData', b)
        },
      })
    },
    addBill() {
      const _this = this
      uni.navigateTo({
        url: '/pages/addBill/addBill',
        success: function (res) {
          res.eventChannel.emit('toPageAddBillData', _this.billTypeId)
        },
      })
    },
  },
  computed: {
    countMoney() {
      return parseFloat(this.inMoney - this.payMoney).toFixed(2)
    },
  },
}
</script>

<style lang="scss" scoped>
.b-topBox {
  width: 100%;
  background-color: #7950ea;
  position: fixed;
  z-index: 1;
  .b-tBtop {
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    image {
      width: 50px;
      height: 50px;
      padding: 35px 15px 30px 15px;
    }
    .b-tBName {
      width: 60%;
      color: #fff;
      text {
        display: block;
        line-height: 30px;
        font-size: 20px;
        letter-spacing: 2px;
        font-weight: bold;
      }
      view {
        font-size: 16px;
        position: relative;
        image {
          position: absolute;
          width: 20px;
          height: 20px;
          top: 2.5px;
          padding: 0;
        }
        image:nth-child(1) {
          left: 25px;
        }
        text {
          font-weight: normal;
          letter-spacing: 1px;
        }
        image:nth-child(3) {
          right: 25px;
        }
      }
    }
    .b-tBBtn {
      width: 80px;
      font-size: 12px;
      font-weight: bold;
      transform: translateX(3px);
    }
  }
  .b-tBMain {
    border-top: #c2b1b1 1px dashed;
    display: flex;
    justify-content: center;
    text-align: center;
    color: #fff;
    padding: 8px 0;
    view {
      flex: 1;
      text {
        display: block;
        line-height: 26px;
        letter-spacing: 2px;
      }
    }
  }
}
.b-main {
  margin-bottom: 46px;
  padding-top: 184px;
  .b-mItem {
    .b-mIOne {
      background-image: linear-gradient(#eebdd0, #b27fb8);
      line-height: 36px;
      padding: 0 8px;
      box-sizing: border-box;
      display: flex;
      color: #f9f8f8;
      text {
        flex: 1;
        font-size: 13px;
        letter-spacing: 1px;
      }
      text:nth-child(2) {
        text-align: center;
      }
      text:nth-child(3) {
        text-align: right;
      }
    }
    .b-mITwo {
      height: 70px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      border-bottom: #c2b1b1 thick double;
      image {
        width: 27px;
        height: 27px;
        margin: 0 10px;
        padding: 5px;
        outline: 1px blueviolet solid;
        border-radius: 50%;
        background: #f8f8f8;
      }
      view {
        flex: 1;
      }
      text {
        width: 80px;
        text-align: right;
        padding-right: 8px;
        word-break: break-word;
      }
      .b-mITsubtilte {
        color: #c2b1b1;
        font-size: 14px;
      }
    }
  }
}
.b-bottom {
  position: fixed;
  // #ifdef H5
  bottom: 51px;
  // #endif
  // #ifdef MP-WEIXIN
  bottom: 0;
  // #endif
  left: 0;
  width: 100%;
  background: #7950ea;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
}
.b-pop {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba($color: #bdbbbc, $alpha: 0.5);
  z-index: 2;
  .b-popMain {
    width: 90%;
    height: 400px;
    position: absolute;
    left: 5%;
    top: 160px;
    z-index: 2;
    background: #fff;
    border-radius: 10px;
    .b-popMTitle {
      line-height: 60px;
      height: 60px;
      border: 1px dashed #bdbbbc;
      display: flex;
      justify-content: center;
      image {
        width: 30px;
        height: 30px;
        margin: 15px 20px;
      }
      text:nth-child(2) {
        flex: 1;
        font-weight: bold;
        font-size: 22px;
      }
      image:nth-child(3) {
        width: 30px;
        height: 30px;
        margin-right: 10px;
      }
    }
    .b-popMContent {
      height: 280px;
      view {
        height: 35px;
        line-height: 35px;
        display: flex;
        align-items: center;
        image {
          width: 26px;
          height: 26px;
          margin: 3px 10px;
        }
        text {
          flex: 1;
          height: 100%;
        }
        .b-popImg {
          width: 150px;
          height: 160px;
          align-self: flex-start;
          // background: #7950ea;
        }
      }
    }
    .b-popMBottom {
      text-align: right;
      height: 30px;
      line-height: 30px;
      view {
        margin: 0 25px 0 5px;
        display: inline-block;
        image {
          vertical-align: middle;
          width: 30px;
          height: 30px;
        }
      }
    }
  }
}
</style>
