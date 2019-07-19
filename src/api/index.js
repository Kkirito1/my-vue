import Vue from 'vue'
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  //   console.log(config)
  config.headers.common['Authorization'] = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
