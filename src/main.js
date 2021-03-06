import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'
import { loadStyle } from './utils/util'

import '@/icons' // icon
import '@/permission' // permission control

const iconfontVersion = ['1070038_hmyq7t18w5']
const iconfontUrl = `//at.alicdn.com/t/font_$key.css`

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

iconfontVersion.forEach(ele => {
  loadStyle(iconfontUrl.replace('$key', ele))
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
