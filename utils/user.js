import { commonWays } from './common'

export const showModal = (content, url, phone) => {
  if (phone) getApp().globalData.$phone = phone
  uni.showModal({
    title: '提示',
    content,
    success: function (res) {
      if (res.confirm) {
        uni.navigateTo({
          url
        })
      } else if (res.cancel) {
        commonWays.toast('重新输入')
      }
    },
  })
}