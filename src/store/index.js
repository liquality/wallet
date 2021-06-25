import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
import Broker from '../broker'
import { appModule } from './modules/app'

Vue.use(Vuex)

const broker = Broker(state)

export default new Vuex.Store({
  state: broker.state,
  getters,
  actions,
  mutations,
  plugins: [broker.plugin],
  modules: {
    app: appModule
  }
})
