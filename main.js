import App from './App'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
Vue.filter('formatTime', (t) => {
  const d = new Date(t)
  let h = d.getHours()
  let m = d.getMinutes()
  let s = d.getSeconds()
  // const
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${h < 10 ? '0' + h : h
    }:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
})

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp () {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif