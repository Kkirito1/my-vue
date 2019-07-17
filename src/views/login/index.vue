<template>
  <div class="login">
    <div class="login-box">
      <div class="avatar_box">
        <img src="./xxbb.jpg" alt />
      </div>
      <el-form
        ref="loginFormet"
        :model="loginFrom"
        :rules="rules"
        label-width="0px"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input v-model="loginFrom.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginFrom.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    // 这是登录表单的数据绑定对象
    loginFrom: {
      username: 'admin',
      password: '123456'
    },
    rules: {
      username: [
        { required: true, message: '请输入活动名称', trigger: 'blur' },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入活动名称', trigger: 'blur' },
        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
      ]
    }
  }),
  methods: {
    // 重置按钮，重置登录表单
    reset () {
      // console.log(this)
      // 表单的引用对象
      this.$refs.loginFormet.resetFields()
    },
    login () {
      this.$refs.loginFormet.validate(async valid => {
        // console.log(valid) //valid是一个布尔值 当值为true时发送ajax请求
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        console.log(res)
        if (res.meta.status !== 200) {
          console.log(this)

          this.$message.error(res.meta.msg)
        } else {
          this.$message.success('登录成功！')
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login {
  height: 100%;
  background-color: #2b4b6b;
  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login-form {
      position: absolute;
      bottom: 10px;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }
    }
  }
}
</style>
