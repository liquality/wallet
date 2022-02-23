export const removeInjectionEnabled = {
  version: 17,
  migrate: async (state) => {
    delete state.injectionEnabled
    return {
      ...state
    }
  }
}
