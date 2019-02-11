import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
import {Message} from 'element-ui'

const whiteList = ['/login'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()

  console.log("permission111: " + to.path)
  if (store.getters.access_token) {
    if (to.path === '/login') {
      next({path: '/'})
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      console.log("path22: " + to.path)

      if (store.getters.roles.length === 0) {
        store.dispatch('GetUserInfo').then(res=>{
          console.log(res)
        }).catch((err)=>{
          console.log("err: " + err)
          store.dispatch('FedLogOut').then(() => {
            next({
              path: '/login'
            })
            NProgress.done()
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
  //
  // if (store.getters.access_token) {
  //   console.log("store.getters.access_token: " + store.getters.access_token)
  //
  //   if (to.path === '/login') {
  //     next({
  //       path: '/'
  //     })
  //     NProgress.done()
  //   } else {
  //     if (store.getters.roles.length === 0) {
  //       store.dispatch('GetUserInfo').then(res => {
  //
  //         debugger
  //         next({ ...to,
  //           replace: true
  //         })
  //       }).catch((err) => {
  //         console.log(err)
  //         store.dispatch('FedLogOut').then(() => {
  //           next({
  //             path: '/login'
  //           })
  //           NProgress.done()
  //         })
  //       })
  //     } else {
  //       next()
  //     }
  //   }
  //
  // } else {
  //   console.log("store.getters.access_token: no token")
  //
  //   if (whiteList.indexOf(to.path) !== -1) {
  //     next()
  //   } else {
  //     next('/login')
  //     NProgress.done()
  //   }
  // }

  // if (getToken()) {
  //   if (to.path === '/login') {
  //     next({ path: '/' })
  //     NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
  //   } else {
  //     if (store.getters.roles.length === 0) {
  //       store.dispatch('GetInfo').then(res => { // 拉取用户信息
  //         next()
  //       }).catch((err) => {
  //         store.dispatch('FedLogOut').then(() => {
  //           Message.error(err || 'Verification failed, please login again')
  //           next({ path: '/' })
  //         })
  //       })
  //     } else {
  //       next()
  //     }
  //   }
  // } else {
  //   if (whiteList.indexOf(to.path) !== -1) {
  //     next()
  //   } else {
  //     next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
  //     NProgress.done()
  //   }
  // }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
