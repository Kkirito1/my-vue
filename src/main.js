import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/base.less'
// 导入element ui
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'
// import axios from 'axios'
// // 配置请求根路径
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// Vue.prototype.$http = axios
// 导入axios文件
import './api'
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
