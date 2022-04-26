//运行小程序模式时，需配置完整的url，统一处理请求头、错误情况
import { get_token } from './storage'
import { commonWays } from './common'
// export const BASE_URL = 'http://172.25.160.18:3001'
export const BASE_URL = 'http://localhost:3001'

export const request = (options) => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    options.url = BASE_URL + options.url
    // #endif

    // #ifdef H5
    options.url = '/api' + options.url
    // #endif

    if (options.url != '/login/login') {
      const token = get_token()
      if (get_token()) {
        options.header = {
          'authorization': token
        }
      }
    }
    uni.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header,
      success: (res) => {
        if (res.statusCode == 403 || res.statusCode == 401) {
          commonWays.toast('登录超时')
          uni.removeStorageSync('token')
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }
        resolve(res)
      },
      fail: (error) => {
        commonWays.toast('服务器错误')
        reject(error)
      }
    })
  })
}