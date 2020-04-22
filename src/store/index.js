import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

const vuexPersist = new VuexPersist({
  key: 'wallet-history',
  storage: window.localStorage
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    orders: []
  },
  mutations: {
    RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION,
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
  plugins: [vuexPersist.plugin]
})
