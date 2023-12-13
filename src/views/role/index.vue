<template>
  <div class="container">
    <div class="app-container">
      <!-- 角色管理内容 -->
      <div class="role-operate">
        <el-button size="mini" type="primary" @click="showDialog = true">添加角色</el-button>
      </div>
      <!-- 放置table组件 -->

      <el-table :data="list">
        <!-- 放置列 -->
        <el-table-column prop="name" align="center" width="200" label="角色">
          <template #default="{ row }">
            <el-input v-model="row.editRow.name" v-if="row.isEdit" placeholder="请输入内容"></el-input>
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>



        <el-table-column prop="state" align="center" width="200" label="启用">
          <!-- 自定义列结构 -->
          <template v-slot="{ row }">
            <el-switch v-model="row.editRow.state" :active-value="1" :inactive-value="0" size="mini" v-if="row.isEdit" />
            <span v-else> {{ row.state === 1 ? "已启用" : row.state === 0 ? "未启用" : "无" }} </span>
          </template>

        </el-table-column>
        <el-table-column prop="description" align="center" label="描述">
          <template #default="{ row }">
            <el-input type="textarea" v-model="row.editRow.description" v-if="row.isEdit" placeholder="请输入内容"
              :rows="2"></el-input>
            <span v-else>{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <!-- 放置操作按钮 -->
          <template v-slot="{ row }">
            <template v-if="row.isEdit">
              <!-- 编辑状态 -->
              <el-button type="primary" size="mini" @click="btnEditConfirm(row)">确定</el-button>
              <el-button size="mini" @click="btnEditCancel(row)">取消</el-button>
            </template>
            <template v-else>
              <!-- 非编辑状态 -->
              <el-button size="mini" type="text" @click="btnPermission(row)">分配权限</el-button>
              <el-button size="mini" type="text" @click="btnEditRow(row)">编辑</el-button>
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="confirmDel(row.id)">
                <el-button slot="reference" style="margin-left:10px" size="mini" type="text">删除</el-button>
              </el-popconfirm>
            </template>
          </template>



        </el-table-column>
      </el-table>

      <!-- 放置分页组件 -->
      <el-row type="flex" style="height:60px" align="middle" justify="end">
        <!-- 放置分页组件 -->
        <el-pagination :page-size="pageParams.pagesize" :current-page="pageParams.page" :total="pageParams.total"
          layout="prev, pager, next" @current-change="changePage" />
      </el-row>
    </div>

    <el-dialog width="500px" title="新增角色" :visible.sync="showDialog" @close="btnCancel">
      <!-- 表单内容 -->
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name" style="width:300px" size="mini" />
        </el-form-item>
        <el-form-item label="启用" prop="state">
          <!-- 如果不需要校验 就不需要写 prop属性 -->
          <el-switch v-model="roleForm.state" :active-value="1" :inactive-value="0" size="mini" />
        </el-form-item>
        <el-form-item prop="description" label="角色描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" style="width:300px" size="mini" />
        </el-form-item>
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col :span="12">
              <el-button type="primary" size="mini" @click="btnOK">确定</el-button>
              <el-button size="mini" @click="btnCancel"> 取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>

    </el-dialog>

    <!-- 放置权限弹层 -->
    <el-dialog :visible.sync="showPermissionDialog" title="分配权限">
      <!-- 放置权限数据 -->
      <el-tree ref="permTree" :data="permissionData" :props="{ label: 'name' }" show-checkbox default-expand-all
        node-key="id" :default-checked-keys="defaultSelect" />

      <span slot="footer" class="dialog-footer">

        <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
            <el-button type="primary" size="mini" @click="btnPermissionOK">确定</el-button>
            <el-button size="mini" @click="showPermissionDialog = false">取消</el-button>
          </el-col>
        </el-row>

      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getRoleList, addRole, updateRole, delRole, getRoleDetail, assignPerm } from '@/api/role'
import { getPermissionList } from '@/api/permission'

import { transListToTreeData } from '@/utils/index'
export default {
  name: 'Role',
  data() {
    return {
      list: [],
      pageParams: {
        page: 1, // 第几页
        pagesize: 5, // 每页多少条
        total: 0
      },
      showPermissionDialog: false,
      permissionData: [],
      defaultSelect: [],
      currentRoleId: null,
      //临时编辑数据
      showDialog: false,
      roleForm: {
        name: '',
        description: '',
        state: 0 // 默认未1启用 关闭 0 打开1
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '角色描述不能为空', trigger: 'blur' }]
      }
    }
  },


  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { rows, total } = await getRoleList(this.pageParams)
      rows.forEach(item => {
        // this.$set(目标对象, 属性名称, 初始值) 可以针对目标对象 添加的属性 添加响应式
        this.$set(item, 'isEdit', false),
          this.$set(item, 'editRow', {
            name: item.name,
            state: item.state,
            description: item.description
          })
      });
      this.list = rows // 赋值数据

      this.pageParams.total = total
    },
    // 切换分页时 请求新的数据
    changePage(newPage) {
      this.pageParams.page = newPage // 赋值当前页码
      this.getRoleList()
    },
    btnOK() {
      this.$refs.roleForm.validate(async isOK => {
        if (isOK) {
          await addRole(this.roleForm)
          this.$message.success('新增角色成功')
          this.getRoleList()
          this.btnCancel()
        }
      })
    },
    btnCancel() {
      this.$refs.roleForm.resetFields() // 重置表单数据
      this.showDialog = false // 关闭弹层
    },
    // 编辑
    btnEditRow(row) {
      row.isEdit = true

    },

    async btnEditConfirm(row) {
      if (row.editRow.name.length > 0 && row.editRow.description.length > 0) {
        await updateRole({ ...row.editRow, id: row.id });
        this.$message.success('修改成功')
        // this.getRoleList()
        // row.isEdit = false
        Object.assign(row, {
          ...row.editRow,
          isEdit: false // 退出编辑模式
        }) // 规避eslint的误判
      } else {
        this.$message.error('不允许为空')
      }
    },
    btnEditCancel(row) {
      row.isEdit = false
    },
    async confirmDel(id) {
      await delRole(id)
      if (this.list.length === 1) {
        this.pageParams.page--
      }
      this.$message.success('删除成功')
      this.getRoleList()
    },
    async btnPermission(row) {
      this.currentRoleId = row.id

      this.permissionData = transListToTreeData(await getPermissionList(), 0)

      const { permIds } = await getRoleDetail(this.currentRoleId)
      this.defaultSelect = permIds
      console.log(permIds, this.currentRoleId, this.defaultSelect);
      this.showPermissionDialog = true
    },
    // 角色分配确定
    // 点击确定时触发
    async btnPermissionOK() {
      await assignPerm({
        id: this.currentRoleId,
        permIds: this.$refs.permTree.getCheckedKeys()
      })
      this.$message.success('角色分配权限成功')
      this.showPermissionDialog = false
    }
  }
}
</script>

<style scoped >
.role-operate {
  padding: 10px;
}

:deep(.el-tree-node__content) {
  height: 40px;
}
</style >