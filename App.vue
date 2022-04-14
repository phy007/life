<script>
import { get_token, get_userId } from './utils/storage'
export default {
  globalData: {
    $phone: '',
    $userId: '',
  },
  onLaunch: function () {
    console.log('App Launch')
    const token = get_token()
    // #ifdef H5
    getApp({ allowDefault: true }).globalData.$userId = get_userId()
    // #endif
    // #ifdef MP-WEIXIN
    // 同步的getStorageSync(key)获取不到userId
    uni.getStorage({
      key: 'userId',
      success: function (res) {
        // VUE3
        getApp({ allowDefault: true }).globalData.$userId = res.data
      },
      fail: function (e) {
        console.log(e)
      },
    })
    // #endif
    console.log(token)
    if (!token) {
      uni.reLaunch({
        url: 'pages/login/login',
      })
    }
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */

</style>
