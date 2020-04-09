import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

const vuexPersist = new VuexPersist({
  key: 'trade-with-me',
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
    }
  },
  plugins: [vuexPersist.plugin]
})
