<template>
  <div>
    <div class="search-container">
      <div class="search-inp-container">
        <el-input  style="width: 200px;" class="filter-item" placeholder="类型" v-model="listQuery.type">
        </el-input>
      </div>

      <el-button class="search-btn" type="primary" icon="el-icon-search"  >搜索</el-button>
      <el-button v-if="sys_client_add" class="filter-item" icon="el-icon-plus"  style="margin-left: 10px;"  type="primary">添加
      </el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="请稍等片刻，数据加载中..." border fit highlight-current-row style="width: 99.5%">
      <el-table-column align="center" label="编号" type="index" width="80">
      </el-table-column>
      <el-table-column align="center" label="客户端Id">
        <template slot-scope="scope">
          <span>{{ scope.row.clientId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="秘钥">
        <template slot-scope="scope">
          <span>{{ scope.row.clientSecret }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="域">
        <template slot-scope="scope">
          <span>{{ scope.row.scope }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="授权类型">
        <template slot-scope="scope">
          <span>{{ scope.row.authorizedGrantTypes }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="自动批准">
        <template slot-scope="scope">
          <span>{{ scope.row.autoapprove }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="访问token有效期">
        <template slot-scope="scope">
          <span>{{ scope.row.accessTokenValidity }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="刷新token有效期">
        <template slot-scope="scope">
          <span>{{ scope.row.refreshTokenValidity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="180" >
        <template slot-scope="scope">
          <el-button v-if="sys_client_upd" size="mini" type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="sys_client_del" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
  import { fetchList, getObj, addObj, putObj, delObj } from '@/api/client'
  import { mapGetters } from 'vuex'

  export default {
    name: 'client',
    data() {
      return {
        list: null,
        total: null,
        listQuery: {
          total: 0, //总页数
          page: 1, //当前页数
          limit: 20 //每页显示多少条
        },
        sys_client_add: false,
        sys_client_upd: false,
        sys_client_del: false,
        listLoading: false,
        tableKey: 0
      }
    },
    created() {
      this.getList()
      this.sys_client_add = this.permissions['sys_client_add']
      this.sys_client_upd = this.permissions['sys_client_upd']
      this.sys_client_del = this.permissions['sys_client_del']
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
          console.log("client: " + JSON.stringify(response.data.records))
          this.list = response.data.records
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
      handleEdit(row, index) {
        this.$refs.crud.rowEdit(row, index)
      },
      handleDel(row, index) {
        this.$refs.crud.rowDel(row, index)
      },
      rowDel: function(row, index) {
        var _this = this
        this.$confirm('是否确认删除ID为' + row.clientId, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(function() {
            return delObj(row.clientId)
          })
          .then(data => {
            _this.tableData.splice(index, 1)
            this.getList()
            _this.$message({
              showClose: true,
              message: '删除成功',
              type: 'success'
            })
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
      }
    }
  }
</script>
