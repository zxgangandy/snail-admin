<template>
  <div>
    <div class="search-container">
      <div class="search-inp-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="类型" v-model="listQuery.type">
      </el-input>
      </div>
      <el-button class="search-btn" type="primary" icon="el-icon-search"  @click="handleFilter">搜索</el-button>
      <el-button v-if="sys_dict_add" class="filter-item" icon="el-icon-plus"  style="margin-left: 10px;" @click="handleCreate" type="primary">添加
      </el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row style="width: 99.5%">
      <el-table-column align="center" label="编号">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="描述">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="数据值">
        <template slot-scope="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标签名">
        <template slot-scope="scope">
          <span>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" :formatter="dateFormat">
      </el-table-column>
      <el-table-column align="center" label="备注信息">
        <template slot-scope="scope">
          <span>{{ scope.row.remarks }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button v-if="sys_dict_upd" size="mini" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="sys_dict_del" size="mini" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>


<script>
  import { fetchList, addObj, putObj, delObj } from '@/api/dict'
  import { mapGetters } from 'vuex'
  import moment from 'moment'

  export default {
    name: 'table_sys_dict',
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20
        },
        rules: {
          value: [
            {
              required: true,
              message: '数据值',
              trigger: 'blur'
            }
          ],
          label: [
            {
              required: true,
              message: '标签名',
              trigger: 'blur'
            }
          ],
          type: [
            {
              required: true,
              message: '类型',
              trigger: 'blur'
            }
          ],
          description: [
            {
              required: true,
              message: '描述',
              trigger: 'blur'
            }
          ],
          sort: [
            {
              required: true,
              message: '排序',
              trigger: 'blur'
            }
          ],
          remarks: [
            {
              required: true,
              message: '备注信息',
              trigger: 'blur'
            }
          ]
        },
        form: {},
        dialogFormVisible: false,
        dialogStatus: '',
        sys_dict_add: false,
        sys_dict_upd: false,
        sys_dict_del: false,
        textMap: {
          update: '编辑',
          create: '创建'
        },
        tableKey: 0
      }
    },
    computed: {
      ...mapGetters(['permissions'])
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: '有效',
          1: '无效'
        }
        return statusMap[status]
      }
    },
    created() {
      this.getList()
      this.sys_dict_add = this.permissions['sys_dict_add']
      this.sys_dict_upd = this.permissions['sys_dict_upd']
      this.sys_dict_del = this.permissions['sys_dict_del']
    },
    methods: {
      getList() {
        this.listLoading = true
        this.listQuery.orderByField = 'create_time'
        this.listQuery.isAsc = false
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      handleDelete(row) {
        delObj(row).then(response => {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      handleUpdate(row) {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.form.id = row.id
        this.form.type = row.type
        this.form.value = row.value
        this.form.label = row.label
        this.form.description = row.description
        this.form.sort = row.sort
        this.form.remarks = row.remarks
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
      },
      create(formName) {
        const set = this.$refs
        set[formName].validate(valid => {
          if (valid) {
            addObj(this.form).then(() => {
              this.dialogFormVisible = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            return false
          }
        })
      },
      cancel(formName) {
        this.dialogFormVisible = false
        const set = this.$refs
        set[formName].resetFields()
      },
      update(formName) {
        const set = this.$refs
        set[formName].validate(valid => {
          if (valid) {
            this.dialogFormVisible = false
            this.form.password = undefined
            putObj(this.form).then(() => {
              this.dialogFormVisible = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '修改成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            return false
          }
        })
      },
      dateFormat(row, column) {
        const date = row[column.property]
        if (!date) {
          return ''
        }
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }

</script>
