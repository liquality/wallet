export const injectedProvider = async ({ state, getters }, { asset, method, args }) => {
  const client = getters.client(state.activeNetwork, state.activeWalletId, asset)

  const [namespace, fnName] = method.split('.')

  return client[namespace][fnName](...args)
}
