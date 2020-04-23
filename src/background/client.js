import { WALLET, getClient } from '../utils/wallet'

addEventListener('message', async event => {
  let { id, chain, isTestnet, method, args, returnType } = event.data
  chain = chain.toUpperCase()

  if (chain === 'WALLET') {
    try {
      const result = await WALLET[method](...args)

      postMessage({
        id,
        result
      })
    } catch (error) {
      postMessage({
        id,
        error
      })
    }

    return
  }

  if (!WALLET.getUnlockedWalletId()) throw new Error('Wallet is unavailable')

  try {
    const client = getClient(chain, isTestnet)
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

    postMessage({
      id,
      result
    })
  } catch (error) {
    postMessage({
      id,
      error
    })
  }
})
