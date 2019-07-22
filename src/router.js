import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/login/index.vue'
import Home from './views/home/Home.vue'
import Welcome from './views/home/wlecome.vue'
import User from './views/user/Users.vue'
import Rights from './views/power/Rights.vue'
import Roles from './views/power/Roles.vue'
import Cate from './views/goods/Cate.vue'
Vue.use(Router)

const router = new Router({
  routes: [{
    path: '/',
    redirect: '/login' // 重定向
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: User
    }, {
      path: '/rights',
      component: Rights
    }, {
      path: '/roles',
      component: Roles
    }, {
      path: '/categories',
      component: Cate
    }]
  }]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从那个路径跳转而来
  // next 是一个函数，表示放行
  //  next()放行 next('强制跳转的路径')
  if (to.path === '/login') return next()
  // 获取token
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})

export default router
