import { login, logout, getUserInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { encryption } from '@/utils/utils'
import { setStore, getStore } from '@/utils/store'

const user = {
  state: {
    userInfo: getStore({
      name: 'userInfo'
    }) || {},
    permissions: getStore({
      name: 'permissions'
    }) || {},
    roles: getStore({
      name: 'roles'
    }) || [],
    menu: getStore({
      name: 'menu'
    }) || [],
    isInitMenu: getStore({
      name: 'isInitMenu'
    }) || false,
    access_token: getStore({
      name: 'access_token'
    }) || '',
    refresh_token: getStore({
      name: 'refresh_token'
    }) || ''
  },

  mutations: {
    SET_ACCESS_TOKEN: (state, access_token) => {
      state.access_token = access_token
      setStore({
        name: 'access_token',
        content: state.access_token,
        type: 'session'
      })
    },
    SET_MENU: (state, menu) => {
      state.menu = menu
      setStore({
        name: 'menu',
        content: state.menu,
        type: 'session'
      })
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
      setStore({
        name: 'userInfo',
        content: state.userInfo,
        type: 'session'
      })
    },
    SET_REFRESH_TOKEN: (state, rfToken) => {
      state.refresh_token = rfToken
      setStore({
        name: 'refresh_token',
        content: state.refresh_token,
        type: 'session'
      })
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
      setStore({
        name: 'roles',
        content: state.roles,
        type: 'session'
      })
    },
    SET_PERMISSIONS: (state, permissions) => {
      const list = {}
      for (let i = 0; i < permissions.length; i++) {
        list[permissions[i]] = true
      }
      state.permissions = list
      setStore({
        name: 'permissions',
        content: state.permissions,
        type: 'session'
      })
    }
  },

  actions: {
    // 登录
    // Login({ commit }, userInfo) {
    //   const username = userInfo.username.trim()
    //   return new Promise((resolve, reject) => {
    //     login(username, userInfo.password).then(response => {
    //       const data = response.data
    //       setToken(data.token)
    //       commit('SET_TOKEN', data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 根据用户名登录
    LoginByUsername({ commit, state, dispatch }, userInfo) {
      return new Promise((resolve, reject) => {
        const user = encryption({
          data: userInfo,
          key: '1234567887654321',
          param: ['password']
        })

        login(user.username, user.password, user.code, user.randomStr).then(response => {
          const data = response.data

          console.log("LoginByUsername: " + data)

          setToken(data.access_token)
          commit('SET_ACCESS_TOKEN', data.access_token)
          commit('SET_REFRESH_TOKEN', data.refresh_token)
          commit('CLEAR_LOCK')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          const data = response.data.data
          commit('SET_ROLES', data.roles)
          commit('SET_USER_INFO', data.sysUser)
          commit('SET_PERMISSIONS', data.permissions)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({
             commit,
             state
           }) {
      return new Promise((resolve, reject) => {
        logout(state.access_token, state.refresh_token).then(() => {
          // 清除菜单
          commit('SET_MENU', [])
          // 清除权限
          commit('SET_PERMISSIONS', [])
          // 清除用户信息
          commit('SET_USER_INFO', {})
          commit('SET_ACCESS_TOKEN', '')
          commit('SET_REFRESH_TOKEN', '')
          commit('SET_ROLES', [])
          // commit('DEL_ALL_TAG')
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 注销session
    FedLogOut({
                commit
              }) {
      return new Promise(resolve => {
        // 清除菜单
        commit('SET_MENU', [])
        // 清除权限
        commit('SET_PERMISSIONS', [])
        // 清除用户信息
        commit('SET_USER_INFO', {})
        commit('SET_ACCESS_TOKEN', '')
        commit('SET_REFRESH_TOKEN', '')
        commit('SET_ROLES', [])
        // commit('DEL_ALL_TAG')
        removeToken()
        resolve()
      })
    },
    // 获取系统菜单
    GetMenu({
              commit
            }) {
      return new Promise(resolve => {
        GetMenu().then((res) => {
          const data = res.data
          data.forEach(ele => {
            ele.children.forEach(child => {
              if (!validatenull(child.component)) child.path = `${ele.path}/${child.path}`
            });
          });
          commit('SET_MENU', data)
          resolve(data)
        })
      })
    }
  }
}

export default user
