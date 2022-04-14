export const get_token = () => {
  return uni.getStorageSync('token');
}

export const get_userId = () => {
  return uni.getStorageSync('userId')
}

export const get_userName = () => {
  return uni.getStorageSync('userName')
}