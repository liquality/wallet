import axios from 'axios'

import agents from '@/utils/agents'
import market from '@/utils/market'

const newOrder = isTestnet => (agentIndex, data) => {
  return axios({
    url: agents(isTestnet)[agentIndex] + '/order',
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}

const updateOrder = isTestnet => (agentIndex, id, data) => {
  return axios({
    url: agents(isTestnet)[agentIndex] + '/order/' + id,
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'wallet',
      'x-liquality-user-agent': 'wallet'
    }
  }).then(res => res.data)
}

const methods = {
  market,
  newOrder,
  updateOrder
}

addEventListener('message', async event => {
  const { id, method, args, isTestnet } = event.data

  try {
    const result = await methods[method](isTestnet)(...args)

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
