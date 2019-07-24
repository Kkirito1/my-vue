<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:green"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">标签一</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1" size="mini">标签二</el-tag>
          <el-tag type="warning" v-else size="mini">标签三</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" size="mini">编辑</el-button>
          <el-button type="danger" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类的表单 -->
      <el-dialog title="提示" :visible.sync="dialogVisible" width="50%" @close="dialogVisibleClose">
        <!-- <span>这是一段信息</span> -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormrules"
          ref="addCateRef"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <!-- options用来指定数据源 -->
            <!-- props用来指定配置对象 -->
            <el-cascader
              expand-trigger="hover"
              :options="ParentCateList"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="handleChange"
              clearable
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategory">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      dialogVisible: false,
      // 表单的列名对象
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前列用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前列用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前列用的模板名称
          template: 'opt'
        }
      ],
      // 添加分类表单的数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormrules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      ParentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    handleCurrentChange (newnum) {
      this.queryInfo.pagenum = newnum
      this.getCateList()
    },
    // 点击添加分类按钮执行函数
    addCate () {
      this.dialogVisible = true
      this.getParentCateList()
    },
    // 获取父级分类的数据
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // console.log(res.data);
      this.ParentCateList = res.data
    },
    // 级联选择器选项发生变化时执行的函数
    handleChange () {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length大于0，证明选中的父级分类
      // 如果不是，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    addCategory () {
      // console.log(this.addCateForm)
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // console.log(res)
        this.dialogVisible = false
        if (res.meta.status !== 200) {
          return this.$message.error('创建分类失败')
        } else {
          this.$message.success('创建分类成功')
        }
      })
    },
    // 对话框的关闭事件，重置表单数据
    dialogVisibleClose () {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
.el-button {
  margin-bottom: 15px;
}
</style>
