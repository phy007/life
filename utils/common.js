export const commonWays = {
  toast: (title) => {
    uni.showToast({
      icon: 'none',
      title,
      duration: 2000,
    })
  },
  formatDate: (date) => {
    let d = new Date(date)
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    // return new Date(date).toLocaleDateString().split('/').join('-')
  },
  currentDate: () => {
    let d = new Date()
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
  },
  jumpToRecordDetail: (record, type) => {
    uni.navigateTo({
      url: '/pages/recordDetail/recordDetail',
      success: function (res) {
        res.eventChannel.emit('toRecordDetailPageData', {
          record,
          type,
        })
      },
    })
  },
}