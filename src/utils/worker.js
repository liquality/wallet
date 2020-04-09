import { getClient } from './clients'

const mnemonic = 'client wealth rough mom chimney gentle caution air devote sniff window margin'

const clients = {
  btc: getClient('btc', mnemonic),
  eth: getClient('eth', mnemonic)
}

addEventListener('message', async event => {
  const { id, chain, method, args, returnType } = event.data

  try {
    const client = clients[chain.toLowerCase()]
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
