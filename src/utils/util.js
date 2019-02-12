import CryptoJS from 'crypto-js'
import {
  validatenull
} from './validate'

/**
 * 生成随机len位数字
 */
export const randomLenNum = (len, date) => {
  let random = ''
  random = Math.ceil(Math.random() * 100000000000000).toString().substr(0, typeof len === 'number' ? len : 4)
  if (date) random = random + Date.now()
  return random
}

/**
 * 加密处理
 */
export const encryption = (params) => {
  let {
    data,
    type,
    param,
    key
  } = params
  let result = JSON.parse(JSON.stringify(data))
  if (type === 'Base64') {
    param.forEach(ele => {
      result[ele] = btoa(result[ele])
    })
  } else {
    param.forEach(ele => {
      var data = result[ele]
      key  = CryptoJS.enc.Latin1.parse(key)

      var iv = key

      var encrypted = CryptoJS.AES.encrypt(
        data,
        key,
        { iv:iv,
          mode:CryptoJS.mode.CBC,
          padding:CryptoJS.pad.ZeroPadding
        })
      result[ele] = encrypted.toString()
    })
  }

  return result
}


export const initMenu = (router, menu) => {
  if (menu.length === 0) {
    return
  }
  const menus = formatRoutes(menu)
  const unfound = {
    path: '*',
    redirect: '/404',
    hidden: true
  }
  menus.push(unfound)
  router.addRoutes(menus)
  //store.commit('ADD_ROUTERS', menus)
}

export const formatRoutes = (aMenu) => {
  const aRouter = []
  aMenu.forEach(oMenu => {
    const {
      path,
      component,
      name,
      icon,
      children
    } = oMenu
    if (!validatenull(component)) {
      const oRouter = {
        path: path,
        component(resolve) {
          let componentPath = ''
          if (component === 'Layout') {
            require(['../views/layout/Layout'], resolve)
            return
          } else {
            componentPath = component
          }
          require([`../${componentPath}.vue`], resolve)
        },
        name: name,
        meta: {
          icon: icon,
          title: name
        },
        icon: icon,
        children: validatenull(children) ? [] : formatRoutes(children)
      }
      aRouter.push(oRouter)
    }
  })
  return aRouter
}
