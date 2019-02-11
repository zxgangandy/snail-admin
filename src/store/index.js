import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import getters from './getters'
import common from './modules/common'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    common,
    user
  },
  getters
})

export default store
