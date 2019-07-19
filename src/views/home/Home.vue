<template>
  <el-container class="container">
    <el-header>
      <div>
        <img src="./logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="logout" type="info">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="lightblue"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <div class="toggle" @click="toggle">|||</div>
          <!-- 一级菜单 -->
          <!-- index必须要是字符串才行 这里用隐式转换 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconlist[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="setSession('/'+subitem.path)"
            >
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menulist: [],
      iconlist: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  //   生命周期函数，当页面加载时执行调用getMenus函数发送ajax请求渲染页面
  created () {
    this.getMenus()
    this.activePath = window.sessionStorage.getItem('path')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenus () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.console.error(res.meta.msg)
      }
      this.menulist = res.data
      //   console.log(res.data)
    },
    toggle () {
      this.isCollapse = !this.isCollapse
    },
    setSession (activePath) {
      window.sessionStorage.setItem('path', activePath)
      this.activePath = activePath
    }
  }
  //   computed: {
  //     comput () {
  //       return this.isCollapse ? '64px' : '200px';
  //     }
  //   }
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  //   padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-header img {
  width: 50px;
  height: 50px;
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle {
  background-color: #373d41;
  color: #fff;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-align: center;
  line-height: 25px;
  cursor: pointer;
}
</style>
