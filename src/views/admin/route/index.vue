<template>
  <div>
    <div class="search-container">
      <div class="search-inp-container">
        <el-input  style="width: 200px;" class="filter-item" placeholder="类型" v-model="listQuery.type">
        </el-input>
      </div>

      <el-button class="search-btn" type="primary" icon="el-icon-search"  >搜索</el-button>
      <el-button v-if="sys_route_add" class="filter-item" icon="el-icon-plus"  style="margin-left: 10px;"  type="primary">添加
      </el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="请稍等片刻，数据加载中..." border fit highlight-current-row style="width: 99.5%">
      <el-table-column align="center" label="编号" type="index" width="80">
      </el-table-column>
      <el-table-column align="center" label="微服务Id">
        <template slot-scope="scope">
          <span>{{ scope.row.serviceId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="路径">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="url">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否启用">
        <template slot-scope="scope">
          <span>{{ scope.row.enabled }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="可否重试">
        <template slot-scope="scope">
          <span>{{ scope.row.retryable }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" :formatter="dateFormat">
      </el-table-column>
      <el-table-column align="center" label="更新时间" prop="updateTime" :formatter="dateFormat">
      </el-table-column>

      <el-table-column label="操作" align="center" fixed="right" width="180" >
        <template slot-scope="scope">
          <el-button v-if="sys_route_upd" size="mini" type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="sys_route_del" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container" style="margin-top: 5px">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>


<script>
  import {fetchList, getObj, addObj, putObj, delObj, applyObj} from '@/api/route'
  import { mapGetters } from 'vuex'
  import moment from 'moment'

  export default {
    name: 'route',
    data() {
      return {
        list: null,
        total: null,
        listQuery: {
          total: 0, //总页数
          page: 1, //当前页数
          limit: 20 //每页显示多少条
        },
        sys_route_add: false,
        sys_route_upd: false,
        sys_route_del: false,
        listLoading: false,
        tableKey: 0
      }
    },
    created() {
      this.getList()
      this.sys_route_add = this.permissions['sys_route_add']
      this.sys_route_upd = this.permissions['sys_route_upd']
      this.sys_route_del = this.permissions['sys_route_del']
    },
    mounted: function() {},
    computed: {
      ...mapGetters(['permissions'])
    },
    methods: {
      getList() {
        this.listLoading = true
        fetchList({
          page: this.listQuery.page,
          limit: this.listQuery.limit
        }).then(response => {
          this.list = response.data.records
          console.log("route: " + JSON.stringify(response.data.records))
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      /**
       * @title 打开新增窗口
       * @detail 调用crud的handleadd方法即可
       *
       **/
      handleAdd: function() {
        this.$refs.crud.rowAdd()
      },
      handleApply: function() {
        var _this = this
        this.$confirm('是否确认同步至网关路由', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(function() {
            return applyObj()
          })
          .then(data => {
            _this.$message({
              showClose: true,
              message: '同步成功',
              type: 'success'
            })
          })
          .catch(function(err) {})
      },
      handleEdit(row, index) {
        this.$refs.crud.rowEdit(row, index)
      },
      handleDel(row, index) {
        this.$refs.crud.rowDel(row, index)
      },
      rowDel: function(row, index) {
        var _this = this
        this.$confirm('是否确认删除ID为' + row.id, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(function() {
            return delObj(row.id)
          })
          .then(data => {
            _this.tableData.splice(index, 1)
            _this.$message({
              showClose: true,
              message: '删除成功',
              type: 'success'
            })
            this.getList()
          })
          .catch(function(err) {})
      },
      /**
       * @title 数据更新
       * @param row 为当前的数据
       * @param index 为当前更新数据的行数
       * @param done 为表单关闭函数
       *
       **/
      handleUpdate: function(row, index, done) {
        putObj(row).then(data => {
          this.tableData.splice(index, 1, Object.assign({}, row))
          this.$message({
            showClose: true,
            message: '修改成功',
            type: 'success'
          })
          done()
          this.getList()
        })
      },
      /**
       * @title 数据添加
       * @param row 为当前的数据
       * @param done 为表单关闭函数
       *
       **/
      handleSave: function(row, done) {
        addObj(row).then(data => {
          this.tableData.push(Object.assign({}, row))
          this.$message({
            showClose: true,
            message: '添加成功',
            type: 'success'
          })
          done()
          this.getList()
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
