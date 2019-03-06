

<template>

  <div>
    <div class="search-container">
      <div class="search-inp-container">
        <el-input @keyup.enter.native="handleSearch" placeholder="" v-model="listQuery.username" clearable>
        </el-input>
      </div>
      <el-button class="search-btn" type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
      <el-button class="search-btn" type="primary" icon="el-icon-plus" @click="handleCreate">添加</el-button>
      <el-button class="search-btn" :autofocus="true" icon="el-icon-refresh" @click="refreshHandle">刷新</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="请稍等片刻，数据加载中..." border fit highlight-current-row style="width: 99.5%">

      <el-table-column align="center" label="序号">
        <template slot-scope="scope">
          <span>{{scope.row.userId}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="用户名">
        <template slot-scope="scope">
          <span>
            <img v-if="scope.row.avatar" class="user-avatar" style="width: 20px; height: 20px; border-radius: 50%;" :src="scope.row.avatar+'?imageView2/1/w/20/h/20'"> {{scope.row.username}}
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="手机号">
        <template slot-scope="scope">
          <span>{{scope.row.phone}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="所属部门" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{scope.row.deptName}} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="角色">
        <template slot-scope="scope">
          <span v-for="role in scope.row.roleList">{{role.roleDesc}} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" prop="createTime" :formatter="dateFormat">

      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="状态">
        <template slot-scope="scope">
          <el-tag>{{scope.row.delFlag | statusFilter}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button v-if="sys_user_upd" size="small" type="success" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="sys_user_del" size="small" type="danger" @click="deletes(scope.row)">删除
          </el-button>
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
  import { fetchList, getObj, addObj, putObj, delObj } from "@/api/user";
  import { mapGetters } from "vuex";
  import moment from 'moment'

  export default {
    data() {
      return {
        treeDeptData: [],
        checkedKeys: [],
        defaultProps: {
          children: "children",
          label: "name"
        },
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20
        },
        role: [],
        form: {
          username: undefined,
          newpassword1: undefined,
          delFlag: undefined,
          deptId: undefined,
          phone: undefined
        },
        rules: {
          username: [
            {
              required: true,
              message: "请输入账户",
              trigger: "blur"
            },
            {
              min: 3,
              max: 20,
              message: "长度在 3 到 20 个字符",
              trigger: "blur"
            }
          ],
          newpassword1: [
            {
              required: true,
              message: "请输入密码",
              trigger: "blur"
            },
            {
              min: 6,
              max: 20,
              message: "长度在 6 到 20 个字符",
              trigger: "blur"
            }
          ],
          deptId: [
            {
              required: true,
              message: "请选择部门",
              trigger: "blur"
            }
          ],
          role: [
            {
              required: true,
              message: "请选择角色",
              trigger: "blur"
            }
          ],
          phone: [
            {
              required: true,
              message: "手机号",
              trigger: "blur"
            },
            {
              min: 11,
              max: 11,
              message: "长度在11 个字符",
              trigger: "blur"
            }
          ]
        },
        statusOptions: ["0", "9"],
        rolesOptions: [],
        dialogFormVisible: false,
        dialogDeptVisible: false,
        userAdd: false,
        userUpd: false,
        userDel: false,
        dialogStatus: "",
        textMap: {
          update: "编辑",
          create: "创建"
        },
        isDisabled: {
          0: false,
          1: true
        },
        tableKey: 0
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: "有效",
          1: "无效",
          9: "锁定"
        };
        return statusMap[status];
      }
    },
    computed: {
      ...mapGetters(["permissions"])
    },
    mounted() {
      this.getList();
      this.sys_user_add = this.permissions["sys_user_add"];
      this.sys_user_upd = this.permissions["sys_user_upd"];
      this.sys_user_del = this.permissions["sys_user_del"];
    },
    methods: {
      getList() {
        this.listLoading = true;
        this.listQuery.isAsc = false;
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records;
          this.total = response.data.total;
          this.listLoading = false;
        });
      },
      handleSearch() {
        this.listQuery.page = 1;
        this.getList();
      },
      handleCreate() {
        this.resetTemp();
        this.dialogStatus = "create";
        this.dialogFormVisible = true;
      },
      refreshHandle() {
        this.listQuery.page = 1
        this.listQuery.limit = 10
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.page = val;
        this.getList();
      },
      resetTemp() {
        this.form = {
          id: undefined,
          username: "",
          password: "",
          role: [],
          delFlag: "",
          deptId: "",
          phone: ""
        };
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
