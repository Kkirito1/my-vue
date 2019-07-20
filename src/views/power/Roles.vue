<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 一级权限 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',i1==0?'bdtop':'','center']"
            >
              <el-col :span="5">
                <el-tag closable @close="removeTag(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2==0?'':'bdtop','center']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeTag(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeTag(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="setRightsdialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="dialogVisible" width="50%" @close="dialogClose">
      <!-- 树形控件 -->
      <el-tree
        :data="getRightList"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="defaultProps"
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updataRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rolesList: [],
      //   控制权限分配对话框的显示与隐藏
      dialogVisible: false,
      //   获取权限树形列表的数据
      getRightList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      //   默认选中的节点的id值
      defkeys: [],
      roleId: ''
    }
  },
  created () {
    this.getrolesList()
  },
  methods: {
    async getrolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      } else {
        this.rolesList = res.data
      }
      //   console.log(res)
    },
    // 取消权限
    async removeTag (roleId, rightId) {
      const res = await this.$confirm('此操作将取消该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('你取消了删除')
      } else {
        const { data: result } = await this.$http.delete(
          `roles/${roleId.id}/rights/${rightId}`
        )
        if (result.meta.status !== 200) {
          return this.$message.error('取消权限失败')
        }
        this.$message.success('取消权限成功')
        // this.getrolesList()
        roleId.children = result.data
        // console.log(result)
      }
    },
    // 点击分配权限按钮时发送ajax请求数据，渲染到对话框
    async setRightsdialog (role) {
      this.dialogVisible = true
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      } else {
        //   把获得的数据保存在getRightList中
        this.getRightList = res.data
        this.getLeafKeys(role, this.defkeys)
      }
    },
    // 通过递归函数获得三级权限的id,并保存到defkey数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 分配权限对话框关闭时，触发函数清空defkeys中残留的数据
    dialogClose () {
      this.defkeys = []
    },
    // 点击对话框确定按钮后执行的函数，更新权限
    async updataRight () {
      const key = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = key.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      } else {
        this.$message.success('更新成功')
        this.getrolesList()
      }
      this.dialogVisible = false
      //   console.log(res)
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin-top: 7px;
  margin-bottom: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.center {
  display: flex;
  align-items: center;
}
</style>
