<template>
  <view>
    <!-- 用于不同场景应该有位置可插入，是否使用插槽？ -->
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
export default {
  data() {
    return {
      showPop: false,
    }
  },
  methods: {
    sureInput() {
      const _this = this
      this.showPop = false
      this.inputText = ''
    },
    cancelInput() {
      commonWays.toast('取消操作')
      this.showPop = false
      this.inputText = ''
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../static/scss/common.scss';
</style>
