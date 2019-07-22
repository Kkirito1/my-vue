<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- clear当点击input框的删除按钮时触发事件 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <!--索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- scope.row这个对象可以显示这行所有的数据  作用域插槽-->
          <!-- 如果同时指定了作用域插槽和prop那么作用域插槽会覆盖prop -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="EditUserInfo(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogclose">
      <!--  用户信息输入框 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" maxlength="11"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" @close="editdialogclose">
      <!--  用户信息输入框 -->
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" maxlength="11"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setdialogVisible" width="50%">
      <div>
        <p>{{userinfo.username}}</p>
        <p>{{userinfo.role_name}}</p>
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updatadialogVisible">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // // 验证邮箱的规则
    // var checkEmail = (rule, value, callback) => {
    //   // 验证邮箱的正则表达式
    //   const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
    //   // 如果输入框里面的值符合正则表达式，那么regEmail.test(value)为true
    //   if (regEmail.test(value)) {
    //     return callback()
    //   }
    //   callback(new Error('请输入合法的邮箱！'))
    // };
    // 验证手机的规则
    // var checkMobile = (rule, value, callback) => {
    //   // 验证手机号的正则表达式
    //   const regEmail = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
    //   if (regEmail.test(value)) {
    //     return callback()
    //   }
    //   callback(new Error('请输入合法的手机号！'))
    // };

    // 邮箱的规则
    function checkEmail (rule, value, callback) {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      // 如果输入框里面的值符合正则表达式，那么regEmail.test(value)为true
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱！'))
    }

    function checkMobile (rule, value, callback) {
      // 验证手机号的正则表达式
      const regEmail = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号！'))
    }

    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示几条数据
        pagesize: 2
      },
      // 所有的用户列表
      userList: [],
      // 需要分配角色的用户信息
      userinfo: {},
      // 查询到的角色列表的数据
      rolesList: [],
      // 已选中的角色id
      selectedRoleId: '',
      // 总数据条数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      dialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editdialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setdialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 查询到的用户信息对象
      editForm: {},
      // 添加表单的验证规则对象
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            // 自定义验证规则，调用checkEmail函数验证邮箱是否符合规则
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            // 自定义验证规则，调用checkMobile函数验证手机号是否符合规则
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户信息
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newsize) {
      // console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newpage) {
      // console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    // 用户状态改变事件
    async userStateChanged (changeinfo) {
      // console.log(changeinfo)
      const { data: res } = await this.$http.put(
        `users/${changeinfo.id}/state/${changeinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        changeinfo.mg_state = !changeinfo.mg_state
        return this.$message.error('修改状态失败！')
      }
      this.$message.success('修改状态成功！')
      console.log(res)
    },
    dialogclose () {
      // 关闭添加用户对话框时触发函数，清空对话框中的数据
      this.$refs.addFormRef.resetFields()
    },
    // 关闭修改用户对话框时触发函数，清空对话框中的数据
    editdialogclose () {
      this.$refs.editFormRef.resetFields()
    },
    // 添加用户信息
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 如果valid为true那么发送ajax请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        } else {
          this.$message.success('添加用户成功！')
          // 隐藏添加用户对话框
          this.dialogVisible = false
          // 重新获取用户列表数据
          this.getUserList()
        }
        // console.log(res)
      })
    },
    // 修改用户信息,当点击对话框确认按钮时执行函数
    editUser (id) {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        const { data: res } = await this.$http.put('users/' + id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败！')
        } else {
          this.$message.success('更新成功！')
          this.editdialogVisible = false
          this.getUserList()
        }
      })
    },
    // 当点击修改用户信息按钮时触发事件，发送ajax请求数据，然后把数据保存在editForm中
    async EditUserInfo (id) {
      // console.log(id)
      this.editdialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      // console.log(res)
    },
    // 删除用户
    async deleteUser (id) {
      // console.log(id)
      const res = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        // 如果点击取消那么返回cancel，如果点击确认则返回confirm
        const { data: result } = await this.$http.delete('users/' + id)
        if (result.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除成功')
        this.getUserList()
      }
    },
    async setRole (userinfo) {
      this.userinfo = userinfo
      this.setdialogVisible = true
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 更新用户角色
    async updatadialogVisible () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('设置角色失败')
      } else {
        this.$message.success('设置角色成功')
        this.setdialogVisible = false
        this.getUserList()
      }
    }
  }
}
</script>
<style lang="less" scoped>
</style>
