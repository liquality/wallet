export const clientExec = async ({ getters }, { network, walletId, asset, method, args, returnType, accountId }) => {
  const client = getters.client({ network, walletId, asset, accountId })

  const [namespace, fnName] = method.split('.')

  let result = await client[namespace][fnName](...args)

  if (returnType) {
    switch (returnType) {
      case 'Address':
        result = result.address
        break

      case 'Addresses':
        result = result.map(item => item.address)
        break

      case 'BigNumber':
        result = result.toString()

        break
    }
  }

  return result
}
