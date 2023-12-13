<template>
  <div class="container">
    <div class="app-container">
      <el-button class="btn-add" size="mini" type="primary" @click="addPermissionHandle(0, 1, false)">添加权限</el-button>
      <el-table default-expand-all :data="list" row-key="id">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="code" label="标识" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button v-if="row.type === 1" size="mini" type="text"
              @click="addPermissionHandle(row.id, 2, false)">添加</el-button>
            <el-button size="mini" type="text" @click="addPermissionHandle(row, 0, true)">编辑</el-button>
            <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="confirmDel(row.id)">
              <el-button slot="reference" style="margin-left: 10px" size="mini" type="text">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog @close="close" :title="showTitle" :visible="dialogVisible" width="30%">
      <el-form ref="form" :model="formData" label-width="80px" :rules="rules">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code"></el-input>
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input v-model="formData.description"></el-input>
        </el-form-item>
        <el-form-item label="开始" prop="state">
          <el-switch v-model="formData.enVisible" active-value="1" inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getPermissionList,
  addPermission,
  updatePermission,
  delPermission
} from "@/api/permission";
import { transListToTreeData } from "@/utils";
export default {
  name: "Permission",
  data() {
    return {
      list: [],
      dialogVisible: false,
      formData: {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 默认关闭,
      },
      showTitle: '新增权限',
      rules: {
        name: [
          { required: true, message: "请输入权限名称", trigger: "blur" },
          { min: 1, max: 4, message: "权限名称为1-4位" },
          {
            validator: (rule, value, callback) => {
              let temp = this.list
              if (this.showTitle === '编辑权限') {
                temp = this.list.filter((item) => item.id !== this.formData.pid)
              }

              const zks = filtername(temp, value);

              if (zks) return callback(new Error("权限名称已存在"));
              callback();
            },
          },
        ],
        code: [
          { required: true, message: "请输入权限标识", trigger: "blur" },
          { min: 1, max: 144, message: "权限标识为1-4位" },
        ],
        description: [
          { required: true, message: "请输入权限描述", trigger: "blur" },
          { min: 1, max: 44, message: "权限描述为1-4位" },
        ],
      },
    };
  },
  created() {
    this.getPermissionList();
  },
  methods: {
    async getPermissionList() {
      this.list = transListToTreeData(await getPermissionList(), 0); // 将列表数据转化成树形结构
    },
    async addPermissionHandle(pid, type, isEdit) {
      // 编辑模式
      if (isEdit) {
        this.formData = { ...pid, type: 0 };
        this.showTitle = '编辑权限'
      } else {
        this.formData.type = type;
        this.formData.pid = pid;
        this.showTitle = '添加权限'
      }
      this.dialogVisible = true;
    },
    async submit() {
      if (this.showTitle === '编辑权限') {
        await updatePermission(this.formData);
        this.$message({
          type: "success",
          message: "修改成功",
        });
      } else {
        await addPermission(this.formData);
        this.$message({
          type: "success",
          message: "添加成功",
        });
      }
      this.getPermissionList();
      this.close();
    },
    async confirmDel(id) {
      await delPermission(id);
      this.$message({
        type: "success",
        message: "删除成功",
      }); this.getPermissionList();
    },
    close() {
      this.dialogVisible = false;
      this.$refs.form.resetFields();
      for (const key in this.formData) {
        this.formData[key] = "";
        this.formData.enVisible = "0";
      }
    },
  },
};

// 过滤姓名
function filtername(list, value) {
  let flag = false;

  list.forEach((item) => {
    if (item.name === value) {
      flag = true;
      return
    }
    if (!flag && item.children && item.children.length > 0) {
      flag = filtername(item.children, value);
    }
  });

  return flag;
}
</script>
<style>
.btn-add {
  margin: 10px;
}
</style>
