import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
import Broker from '../broker'
import {
  setLedgerBridgeListener
} from '@/utils/ledger-bridge-provider'

Vue.use(Vuex)

const broker = Broker(state)

export default new Vuex.Store({
  state: broker.state,
  getters,
  actions,
  mutations,
  plugins: [broker.plugin]
})

setLedgerBridgeListener()
