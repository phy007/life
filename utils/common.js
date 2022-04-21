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
  jumpToRecordDetail: (id, type) => {
    uni.navigateTo({
      url: `/pages/recordDetail/recordDetail?id=${id}&type=${type}`,
    })
  },
  jumpToProfilePage: (id) => {
    uni.navigateTo({
      url: `/pages/profile/profile?id=${id}`
    })
  }
}