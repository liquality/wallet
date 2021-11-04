export const toggleExperiment = ({ commit }, { name }) => {
  commit('TOGGLE_EXPERIMENT', { name })
}
