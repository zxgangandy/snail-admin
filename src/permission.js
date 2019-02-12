import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
import {Message} from 'element-ui'
import {initMenu} from '@/utils/util'

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
          console.log("GetUserInfo: "+JSON.stringify(res.data))

          store.dispatch('GetMenu').then(data => {
            initMenu(router, data)
          })
          next()
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
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
