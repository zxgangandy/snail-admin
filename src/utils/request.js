import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'
import errorCode from '@/const/errorCode'
import router from '../router/index'

// 创建axios实例
const service = axios.create({
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.access_token) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    return response
  }, error => {
    console.log('err' + error) // for debug
    const errMsg = error.toString()
    const code = errMsg.substr(errMsg.indexOf('code') + 5)
    Message({
      message: errorCode[code] || errorCode['default'],
      type: 'error'
    })

    if (parseInt(code) === 401) {
      store.dispatch('FedLogOut').then(() => {
        router.push({ path: '/login' })
      })
    }

    return Promise.reject(new Error(error))
  }
)

export default service
