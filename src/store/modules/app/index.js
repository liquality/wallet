import { state } from './state'
import { mutations } from './mutations'
import { actions } from './actions'
export const appModule = {
  namespaced: true,
  state,
  mutations,
  actions
}
