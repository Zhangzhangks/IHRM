<template>
  <div>
    <el-dialog title="新增部门" :visible="showDialog" @close="close">

      <el-form ref="addDept" :model="formData" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="部门名称">
          <el-input v-model="formData.name" placeholder="2-10个字符" style="width: 80%" size="mini" />
        </el-form-item>
        <el-form-item prop="code" label="部门编码">
          <el-input v-model="formData.code" placeholder="2-10个字符" style="width: 80%" size="mini" />
        </el-form-item>
        <el-form-item prop="managerId" label="部门负责人">
          <el-select v-model="formData.managerId" placeholder="请选择负责人" style="width: 80%" size="mini">
            <el-option v-for="item in manerList" :key="item.id" :label="item.username" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="introduce" label="部门介绍">
          <el-input v-model="formData.introduce" placeholder="1-100个字符" type="textarea" size="mini" :rows="4" style="width: 80%" />
        </el-form-item>
        <el-form-item>
          <!-- 按钮 -->
          <el-row type="flex" justify="center">
            <el-col :span="12">
              <el-button @click="btnOK" size="mini" type="primary">确定</el-button>
              <el-button size="mini" @click="btncalcel">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { getDepartment, getManagerList, addDepartment, getDepartmentDetail, updateDepartment } from '@/api/department'
export default {
  name: 'Adddept',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    currentNodeId: {
      type: Number,
      default: ''
    }
  },
  data() {
    return {
      manerList: [],
      formData: {
        code: '', // 部门编码
        introduce: '', // 部门介绍
        managerId: '', // 部门负责人id
        name: '', // 部门名称
        pid: '' // 父级部门的id
      },
      rules: {
        // 部门编码
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
        {
          trigger: 'blur',
          // 自定义校验模式
          validator: async (rule, value, callback) => {

            // value就是输入的编码
            let result = await getDepartment()
            // result数组中是否存在 value值
            // p排除自身编辑模式
            if (this.formData.pid) {
              result = result.filter(item => item.pid !== this.formData.pid)
            }
            if (result.some(item => item.code === value)) {
              callback(new Error('部门中已经有该编码了'))
            } else {
              callback()
            }
          }
        }],
        // 部门介绍
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' }, {
          min: 1, max: 100, message: '部门介绍的长度为1-100个字符', trigger: 'blur'
        }],
        // 部门负责人id
        managerId: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
        // 部门负责人id
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
        {
          trigger: 'blur',
          // 自定义校验模式
          validator: async (rule, value, callback) => {
            // value就是输入的编码
            let result = await getDepartment()
            if (this.formData.id) {
              // 编辑场景 排除自身
              result = result.filter(item => item.id !== this.formData.id)
            }
            // result数组中是否存在 value值
            if (result.some(item => item.name === value)) {
              callback(new Error('部门中已经有该名称了'))
            } else {
              callback()
            }
          }
        }]

        // pid: '' // 父级部门的id 不需要做校验
      }
    }
  },
  created() {
    this.getManagerList()
  },
  methods: {
    close() {
      this.$refs.addDept.resetFields();
      this.$emit('update:showDialog', false)
    },
    // 获取负责人列表
    async getManagerList() {
      const res = await getManagerList()
      this.manerList = res
    },
    // 编辑部门
    async getDepartmentDetail() {
      const res = await getDepartmentDetail(this.currentNodeId)
      this.formData = res
    },
    btnOK() {
      this.$refs.addDept.validate(async result => {
        console.log(result);
        if (result) {
          // 编辑部门
          if (this.formData.pid) {
            await updateDepartment({ ...this.formData })
            this.$message.success(`编辑部门成功`)
          }
          else {
            this.getDepartmentDetail()
            await addDepartment({ ...this.formData, pid: this.currentNodeId })
            // 提示消息
            this.$message.success(`新增部门成功`)
          }
          this.$emit('updateDepartment')
          this.close()
        }
      })
    },
    btncalcel() {

      this.close()
    }
  }
}



</script>

<style scoped></style>
