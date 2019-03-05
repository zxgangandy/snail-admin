
<template>
  <div>
    <div class="search-container">
      <el-select  v-model="listQuery.type" placeholder="请选择状态">
        <el-option v-for="item in dicts" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-button v-if="sys_log_index_select" class="search-btn" type="primary" icon="el-icon-search" @click="getData">查询</el-button>
      <el-button class="search-btn" :autofocus="true" icon="el-icon-search" @click="refreshHandle">搜索</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="请稍等片刻，数据加载中..." border fit highlight-current-row style="width: 99.5%">
      <el-table-column align="center" label="序号">
        <template slot-scope="scope">
          <span>{{ getSerialNumber(scope.$index) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="类型">
        <template slot-scope="scope">
          <span>
            <el-tag type="success" size="medium " v-if="scope.row.type == 0">{{ scope.row.type | typeFilter }}</el-tag>
            <el-tag type="danger" size="medium " v-if="scope.row.type ==9">{{ scope.row.type | typeFilter }}</el-tag>
          </span>
        </template>
      </el-table-column>

      <el-table-column label="请求接口" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.requestUri }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="IP地址">
        <template slot-scope="scope">
          <span>{{ scope.row.remoteAddr }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="请求方式">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="传入参数" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.params }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="请求时间">
        <template slot-scope="scope">
          <span>{{ scope.row.time}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" prop="createTime" :formatter="dateFormat">

      </el-table-column>

      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" v-if="sys_log_del" @click="handleDelete(scope.row)">删除
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
  import { delObj, fetchList } from '@/api/log'
  import { mapGetters } from 'vuex'
  import { remote } from '@/api/dict'
  import moment from 'moment'

  export default {
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        dicts: [],
        listQuery: {
          page: 1,
          limit: 20,
          type: undefined
        },
        tableKey: 0,
        sys_log_index_select: false
      }
    },
    filters: {
      typeFilter(type) {
        const typeMap = {
          0: '正常',
          9: '异常'
        }
        return typeMap[type]
      }
    },
    mounted() {
      this.getList()
      this.sys_log_del = this.permissions['sys_log_del']
      this.sys_log_index_select = this.permissions['/admin/log/index:select']
      remote('log_type').then(response => {
        this.dicts = response.data
      })
    },
    computed: {
      ...mapGetters(['permissions'])
    },
    methods: {
      getSerialNumber(index) {
        return index + 1 + (this.listQuery.page - 1) * this.listQuery.limit
      },
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
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      refreshHandle() {
        // this.table.query.size = 10
        // this.table.query.current = 1
        // this.table.query.createBy = ''
        // this.table.query.moduleName = ''
        // this.table.query.status = ''
        this.getList()
      },
      handleDelete(row) {
        delObj(row.id).then(response => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      dateFormat(row, column) {
        const date = row[column.property]
        if (!date) {
          return ''
        }
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      },
    }
  }

</script>
