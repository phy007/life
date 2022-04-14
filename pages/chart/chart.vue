<template>
  <view>
    <text class="com-title">{{btName}}账本图表分析</text>
    <view class="container" style="background-image: url('')">
      <!-- 饼图 -->
      <view class="chartIcon">
        <uni-icons
          custom-prefix="iconfont"
          type="icon-bingtu"
          size="40"
        ></uni-icons>
        <!-- #ifdef MP-WEIXIN-->
        <image src="/static/img/bingtu.png"></image>
        <!-- #endif -->
        <text>按类别</text>
      </view>

      <view class="btn">
        <button class="com-button" @click="showPie = '0'">支出</button>
        <button class="com-button" @click="showPie = '1'">收入</button>
      </view>
      <view class="charts-box" v-if="showPie === '0'">
        <qiun-data-charts
          type="pie"
          :chartData="chartsDataArea3"
          background="none"
          :animation="true"
        />
      </view>
      <view class="charts-box" v-else>
        <qiun-data-charts
          type="pie"
          :chartData="chartsDataArea4"
          background="none"
          :animation="true"
        />
      </view>
      <view class="dateBox">
        <uni-icons
          type="back"
          size="23"
          @click="shiftMonth('l', 1)"
        ></uni-icons>
        <text>{{ date }} </text>
        <uni-icons
          type="forward"
          size="23"
          @click="shiftMonth('r', 1)"
        ></uni-icons>
      </view>

      <!-- 柱状图 -->
      <view class="chartIcon">
        <uni-icons
          custom-prefix="iconfont"
          type="icon-tubiao-zhuzhuangtu"
          size="40"
        ></uni-icons>
        <!-- #ifdef MP-WEIXIN-->
        <image src="/static/img/tubiao-zhuzhuangtu.png"></image>
        <!-- #endif -->
        <text>按年月</text>
      </view>
      <view class="charts-box">
        <qiun-data-charts
          type="column"
          :chartData="chartsDataArea2"
          background="none"
        />
      </view>
      <view class="dateBox">
        <uni-icons
          type="back"
          size="23"
          @click="shiftMonth('l', 2)"
        ></uni-icons>
        <text>{{ showYear }} </text>
        <uni-icons
          type="forward"
          size="23"
          @click="shiftMonth('r', 2)"
        ></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
import { commonWays } from '../../utils/common'

export default {
  data() {
    return {
      btName:'',
      month: [],
      bill: [],
      date: '',
      year: [],
      showYear: '',
      showPie: '0', //收入 支出
      chartsDataArea2: {},
      chartsDataArea3: {},
      chartsDataArea4: {},
    }
  },
  onReady() {
    if (this.bill.length !== 0) {
      //模拟从服务器获取数据
      this.getServerData()
    } else {
      commonWays.toast('获取数据失败')
    }
  },
  onLoad(e) {
    this.btName = e.name
    const _this = this
    // #ifdef APP-NVUE
    const eventChannel = _this.$scope.eventChannel || ''
    // #endif
    const eventChannel = _this.getOpenerEventChannel() || ''
    if (eventChannel) {
      eventChannel.once('toPageChartData', function (data) {
        _this.bill = data.bill
        _this.month = data.month
        _this.date = data.date
        _this.year = data.year
        _this.showYear = data.date.slice(0, 4)
      })
    }
  },
  methods: {
    getServerData() {
      /*
      按月 柱状图
      按天 折线图
      按类别每月 饼图
      按年 雷达图
      */

      setTimeout(() => {
        this.getPieData()
        this.getBarData()
        500
      })
    },
    getPieData() {
      let bill = this.bill
      let index = this.month.indexOf(this.date)
      let pieIncome = bill[index].incomeType
      let piePay = bill[index].payType
      let pieIncomeData, piePayData
      if (Object.keys(piePay).length !== 0) {
        piePayData = Object.keys(piePay).map((name, i) => ({
          name,
          value: Object.values(piePay)[i],
        }))
      } else {
        piePayData = [{ name: '无', value: 0 }]
      }
      if (Object.keys(pieIncome).length !== 0) {
        pieIncomeData = Object.keys(pieIncome).map((name, i) => ({
          name,
          value: Object.values(pieIncome)[i],
        }))
      } else {
        pieIncomeData = [{ name: '无', value: 0 }]
      }
      this.chartsDataArea3 = {
        series: [{ data: piePayData }],
      }
      this.chartsDataArea4 = {
        series: [{ data: pieIncomeData }],
      }
    },
    getBarData() {
      let barData = []
      // 处理数据
      if (this.bill) {
        let y = ''
        let i = -1
        this.bill.forEach((b) => {
          let k = Object.keys(b)[0].slice(0, 4)
          if (k !== y) {
            y = k
            i++
            barData[i] = { categories: [], pay: [], income: [] }
          }
          barData[i].categories.push(Object.keys(b)[0])
          barData[i].pay.push(parseFloat(b.pay.toFixed(2)))
          barData[i].income.push(parseFloat(b.income.toFixed(2)))
        })
      }
      let index = this.year.indexOf(this.showYear)
      let barCategories = barData[index].categories
      let barPay = barData[index].pay
      let barIncome = barData[index].income
      this.chartsDataArea2 = {
        categories: barCategories,
        series: [
          {
            name: '支出',
            data: barPay,
          },
          {
            name: '收入',
            data: barIncome,
          },
        ],
      }
    },
    shiftMonth(t, c) {
      let index
      let length

      if (c === 1) {
        index = this.month.indexOf(this.date)
        length = this.month.length - 1
        if (index < length || index > 0) {
          if (t === 'l') index++
          else index--
        }
        if (this.month[index]) {
          this.date = this.month[index]
          this.getPieData()
        } else {
          commonWays.toast('日期上限')
        }
      } else if (c === 2) {
        index = this.year.indexOf(this.showYear)
        length = this.year.length - 1
        if (index < length || index > 0) {
          if (t === 'l') index++
          else index--
        }
        if (this.year[index]) {
          this.showYear = this.year[index]
          this.getBarData()
        } else {
          commonWays.toast('日期上限')
        }
      }

      /* 设置左右切换按钮的频率 */
    },
  },
}
</script>

<style lang="scss" scoped>
@import '/static/font/iconfont.css';
@import "../../static/scss/common.scss";

.container {
  width: 100%;
  .chartIcon {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 40px;
    padding: 5px 0;
    background: #f8f8f8;
    width: 100%;
    margin: 5px 0;
    .uni-icons {
      margin: 2px;
    }
    image {
      margin: 2px;
      width: 36px;
      height: 36px;
    }
    text {
      font-size: 20px;
      color: #7950ea;
      font-weight: bold;
    }
  }
  .dateBox {
    margin: 8px auto;
    width: 200px;
    text-align: center;
    height: 50px;
    line-height: 50px;
    font-size: 24px;
    text {
      font-weight: bold;
      margin: 0 5px;
    }
  }
  .btn {
    text-align: right;
  }
}
/* 请根据需求修改图表容器尺寸，如果父容器没有高度图表则会显示异常 */
.charts-box {
  width: 100%;
  height: 320px;
}
</style>
