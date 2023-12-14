<template>
  <div class="container">
    <div class="app-container">
      <div class="left">
        <el-input style="margin-bottom:10px" type="text" prefix-icon="el-icon-search" size="small"
          current-node-key="currentNodeKey" node-key="id" placeholder="输入员工姓名全员搜索" @input="Search"
          v-model="queryParams.keyword" />
        <!-- 树形组件 -->
        <el-tree ref="treeref" :data="data" :props="defaultProps" default-expand-all :expand-on-click-node="false"
          @current-change="getCurrentKey" node-key="id" highlight-current></el-tree>
      </div>
      <div class="right">
        <el-row class="opeate-tools" type="flex" justify="end">
          <el-button v-permission="'add-employee'" size="mini" type="primary" @click="$router.push('/employee/detail')">
            添加员工</el-button>
          <el-button size="mini" @click="showExcelDialog = true">excel导入</el-button>
          <el-button size="mini" @click="exportExcel">excel导出</el-button>
        </el-row>
        <!-- 表格组件 -->
        <el-table :data="list">

          <el-table-column prop="staffPhoto" align="center" label="头像">
            <template #default="{ row }">

              <el-avatar v-if="row.staffPhoto" :size="30" :src="row.staffPhoto"></el-avatar>
              <span class="username" v-else>{{ row.username.substr(0, 1) }}</span>
            </template>

          </el-table-column>
          <el-table-column prop="username" label="姓名" />
          <el-table-column prop="mobile" label="手机号" sortable />
          <el-table-column prop="workNumber" label="工号" sortable />
          <el-table-column prop="formOfEmployment" label="聘用形式">
            <template v-slot="{ row }">
              <span v-if="row.formOfEmployment === 1">正式</span>
              <span v-else-if="row.formOfEmployment === 2">非正式</span>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="部门" />
          <el-table-column prop="timeOfEntry" label="入职时间" sortable />

          <el-table-column label="操作" width="280px">
            <template #default="{ row }">
              <el-button size="mini" type="text" @click="$router.push(`/employee/detail/${row.id}`)">查看</el-button>
              <el-button size="mini" type="text" @click="btnRole(row.id)">角色</el-button>
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="confirmDel(row.id)">
                <el-button slot="reference" style="margin-left:10px" size="mini" type="text">删除</el-button>
              </el-popconfirm>
            </template>

          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-row style="height: 60px" align="middle" type="flex" justify="end">
          <el-pagination layout="total,prev, pager, next" :total="total" :current-page="queryParams.page"
            :page-size="queryParams.pagesize" @current-change="handleCurrentChange" />
        </el-row>

        <!-- 角色管理 -->
        <el-dialog :visible.sync="showRoleDialog" title="分配角色">
          <!-- 弹层内容 -->
          <!-- checkbox -->
          <el-checkbox-group v-model="roleIds">
            <!-- 放置n个的checkbox  要执行checkbox的存储值 item.id-->
            <el-checkbox v-for="item in roleList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
          <span slot="footer" class="dialog-footer">
            <el-button @click="showRoleDialog = false">取 消</el-button>
            <el-button type="primary" @click="btnok">确 定</el-button>
          </span>
        </el-dialog>

      </div>
    </div>
    <importExcel :showExcelDialog.sync="showExcelDialog" @uploadSuccesss="getEmployeeList"></importExcel>
  </div>
</template>

<script>
import {
  getEmployeeList, exportEmployee, delEmployee, assignRole,
  getEnableRoleList, getEmployeeDetail

} from '@/api/employee.js'
import { getDepartment } from '@/api/department.js'
import { transListToTreeData, debounce } from '@/utils';
import importExcel from './components/import-excel.vue'
import FileSaver from 'file-saver'
export default {
  name: 'Employee',
  components: {
    importExcel,

  },
  data() {
    return {
      showRoleDialog: false, // 用来控制角色弹层的显示
      roleList: [], // 接收角色列表
      roleIds: [],// 用来双向绑定数据的
      currentUserId: "",
      data: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // 存储查询参数
      queryParams: {
        departmentId: null,
        page: 1,
        pagesize: 10,
        keyword: ''
      },
      total: 0,
      list: [],
      timer: null,
      showExcelDialog: false
    };
  },
  created() {
    this.getDepartment()
    this.getEmployeeList()
  },
  methods: {
    // 封装好方法
    async getDepartment() {
      const result = await getDepartment()
      this.data = transListToTreeData(result, 0)
      this.queryParams.departmentId = this.data[0].id
      this.$nextTick(() => {
        this.$refs.treeref.setCurrentKey(this.queryParams.departmentId)
      })
    },
    // 切换节点
    getCurrentKey(currentnode) {
      // console.log(currentnode);
      this.queryParams.departmentId = currentnode.id
      this.getEmployeeList()
      this.queryParams.page = 1
    },
    // 获取员工列表的方法
    async getEmployeeList() {
      const data = await getEmployeeList(this.queryParams)
      // console.log(data, 'rows');
      this.list = data.rows

      this.total = data.total
    },
    // 分页
    handleCurrentChange(newpage) {
      this.queryParams.page = newpage;
      this.getEmployeeList()
    },
    // 模糊搜索
    Search() {
      clearTimeout(this.timer) // 清理上一次的定时器
      this.timer = setTimeout(() => {
        this.queryParams.page = 1
        this.getEmployeeList()
      }, 300)
    },
    // 导出
    async exportExcel() {
      const result = await exportEmployee() // 导出所有的员工接口
      // console.log(result) // 使用一个npm包 直接将blob文件下载到本地 file-saver
      // FileSaver.saveAs(blob对象,文件名称)
      FileSaver.saveAs(result, '员工信息表.xlsx') // 下载文件
    },
    // 删除
    async confirmDel(id) {
      await delEmployee(id);
      if (this.list.length === 1 && this.queryParams.page > 1) this.queryParams.page--
      this.$message({
        type: 'success',
        message: '删除成功'
      });
      this.getEmployeeList()
    },
    // 角色
    async btnRole(id) {

      this.roleList = await getEnableRoleList()
      this.currentUserId = id
      const { roleIds } = await getEmployeeDetail(id)
      this.roleIds = roleIds
      this.showRoleDialog = true;
    },
    // 角色确定
    async btnok() {
      const res = await assignRole({ roleIds: this.roleIds, id: this.currentUserId })
      this.$message({
        type: 'success',
        message: '分配成功'
      });
      this.showRoleDialog = false
    }
  }
}

</script>

<style  scoped>
:deep(.el-tree-node__content) {
  height: 40px;
}

.app-container {
  background: #fff;
  display: flex;

  .left {
    width: 280px;
    padding: 20px;
    border-right: 1px solid #eaeef4;
  }

  .right {
    flex: 1;
    padding: 20px;

    .opeate-tools {
      margin: 10px;
    }

    .username {
      height: 30px;
      width: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 50%;
      color: #fff;
      background: #04C9BE;
      font-size: 12px;
      display: inline-block;
    }
  }
}
</style>