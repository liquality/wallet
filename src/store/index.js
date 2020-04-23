import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

import client from '@/utils/client'
import agent from '@/utils/agent'
import agents from '@/utils/agents'

const vuexPersist = new VuexPersist({
  key: 'wallet-history',
  storage: window.localStorage
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isTestnet: true,
    orders: []
  },
  mutations: {
    RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION,
    TOGGLE_NETWORK (state) {
      state.isTestnet = !state.isTestnet
    },
    NEW_ORDER (state, order) {
      state.orders.push(order)
    },
    UPDATE_ORDER (state, order) {
      const item = state.orders.find(i => i.id === order.id)
      Object.assign(item, order)
    },
    REMOVE_ORDER (state, order) {
      state.orders = state.orders.filter(i => i.id !== order.id)
    }
  },
  getters: {
    client (state) {
      return client(state.isTestnet)
    },
    agent (state) {
      return agent(state.isTestnet)
    },
    agentUrls (state) {
      return agents(state.isTestnet)
    }
  },
  plugins: [vuexPersist.plugin]
})
