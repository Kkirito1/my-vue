<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意！只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品区域 -->
      <el-row class="row">
        <el-col>
          <span>选择商品分类</span>
          <!-- 级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="categoriesList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="dialogVisible = true"
          >添加参数</el-button>
          <!-- 添加参数的表单 -->
          <el-table :data="manyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 切换栏 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="dialogVisible = true"
          >添加属性</el-button>
          <!-- 添加静态属性的表单 -->
          <el-table :data="onlyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加属性对话框 -->
      <el-dialog
        :title="'添加'+titleText"
        :visible.sync="dialogVisible"
        width="50%"
        @close="dialogClose"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      categoriesList: [],
      //  级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   级联选择框双向绑定的数组
      selectedCateKeys: [],
      //   被激活的页签的名称
      activeName: 'many',
      //   动态参数的数据
      manyTabData: [],
      //   静态参数的数据
      onlyTabData: [],
      dialogVisible: false,
      //   对话框绑定的数据
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getcategories()
  },
  methods: {
    async getcategories () {
      const { data: res } = await this.$http.get('categories')
      //   console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.categoriesList = res.data
    },
    // 级联选择框选中项变化会触发这个函数
    handleChange () {
      this.getParams()
    },
    // 点击tab栏切换时执行的函数
    handleClick () {
      //   console.log(this.activeName)
      this.getParams()
    },
    // 获取参数列表
    async getParams () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTabData = []
        this.onlyTabData = []
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      //   console.log(res)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // console.log(res.data)

      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    dialogClose () {
      this.addForm.attr_name = ''
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        } else {
          this.$message.success('添加成功')
          this.dialogVisible = false
          this.getParams()
        }
      })
    },
    async delParam (id) {
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      //   console.log(id)
      //   console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      } else {
        this.$message.success('删除成功')
        this.getParams()
      }
    },
    showInput (row) {
      row.inputVisible = true
      // $nextTick在页面重新渲染的时候执行该函数，vue里面挂载的api
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 键盘松开或失去焦点时触发函数  tag中的input
    async handleInputConfirm (row) {
      // console.log('ok')
      // 没有输入任何内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        // 如果输入了内容
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrValues(row)
      }
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValues(row)
    },
    async saveAttrValues (row) {
      // 发起ajax请求保存到数据库中
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      } else {
        return this.$message.success('修改参数成功')
      }
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        //   this.selectedCateKeys[2]第三集分类的id
        return this.selectedCateKeys[2]
      } else {
        return null
      }
    },
    // 控制添加属性对话框的标题名称
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.row {
  margin: 15px 0;
}
.el-tag {
  margin-left: 5px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.button-new-tag {
  margin-left: 5px;
}
</style>
