<template>
  <div class="container">
    <div class="app-container">
      <!-- 展示树形结构 -->
      <el-tree :expand-on-click-node="false" default-expand-all :data="depts" :props="defaultProps">
        <template #default="{ data }">
          <el-row justify="space-between" type="flex" align="middle" style="width: 100%;height: 40px;">
            <el-col>{{ data.name }}</el-col>
            <el-col :span="4">
              <el-dropdown>
                <!-- 显示区域内容 -->
                <span class="tree-manager">{{ data.managerName }}</span>
                <span class="el-dropdown-link">
                  操作<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <!-- 下拉菜单选项 -->
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="add">添加子部门</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑部门</el-dropdown-item>
                  <el-dropdown-item command="del">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
        </template>
      </el-tree>
    </div>

  </div>
</template>
<script>
import { getDepartment, delDepartment } from '@/api/department.js'
import { transListToTreeData } from '@/utils/index.js'

export default {
  name: 'Department',

  data() {
    return {
      currentNodeId: null, // 存储当前点击的id
      showDialog: false, // 控制弹层的显示和隐藏
      depts: [],
      defaultProps: {
        label: 'name', // 要显示的字段的名字
        children: 'children' // 读取子节点的字段名
      }
    }
  },
  created() {
    this.getDepartment() // 调用获取数据的接口
  },
  methods: {
    // 封装好方法
    async getDepartment() {
      const result = await getDepartment()
      this.depts = transListToTreeData(result, 0)
    },

  }
}
</script>
<style scoped>
.app-container {
  padding: 30px 140px;
  font-size: 14px;
}

.tree-manager {
  width: 50px;
  display: inline-block;
  margin: 30px;
}
</style>
